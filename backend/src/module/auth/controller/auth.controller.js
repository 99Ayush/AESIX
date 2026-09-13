// src/module/auth/controller/controller.js
import { Router } from 'express';
import { randomUUID } from 'crypto';
import loginService from '../service/auth.loginService.js';
import registerService from '../service/auth.registerService.js';
import { validate } from '../../../shared/middleware/validate.js';
import { checkOtpCooldown } from '../../../shared/utils/otpCooldown.js';
import {
  loginRequestOtpSchema,
  loginVerifySchema,
  loginVerifyUserSchema,
  registerRequestOtpSchema,
  registerEnrollSchema,
} from '../../../shared/validator/authSchema.js';
import { logger } from '../../../shared/logger.js';
import { User, UserSession, OtpTxn } from '../model/model.js';

async function upsertUserFromProfile(profile, { aadhaar, mobile, loginMethod }) {
  const user = await User.findOneAndUpdate(
    { abhaNumber: profile.ABHANumber },
    {
      $set: {
        ...(aadhaar ? { aadhaar } : {}),
        firstName: profile.firstName,
        lastName: profile.lastName,
        mobile: mobile ?? profile.mobile,
        gender: profile.gender,
        dob: profile.dob,
        abhaAddress: profile.phrAddress?.[0],
        abhaStatus: profile.abhaStatus,
        kycVerified: profile.kycVerified,
        loginMethod,
      },
      $setOnInsert: { userId: randomUUID() },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  // Sync / create matching MongoDB User in user module schema
  try {
    const { User: MongoUser } = await import('../../user/model/userModel.js');
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
    await MongoUser.findByIdAndUpdate(
      user._id,
      {
        fullName,
        email: profile.email || `${user.userId}@example.com`,
        phone: mobile ?? profile.mobile ?? '',
        dateOfBirth: profile.dob ? new Date(profile.dob) : undefined,
      },
      { upsert: true }
    );
  } catch (err) {
    logger.warn(`Failed to sync user module database record: ${err.message}`);
  }

  return user;
}

function sendServiceError(res, error) {
  const status = error.status >= 400 && error.status < 600 ? error.status : 500;
  return res.status(status).json({ error: error.message || 'Internal Server Error' });
}

const router = Router();

// ─── LOGIN ────────────────────────────────────────────────────────────────────

router.post('/login/request-otp',
  validate(loginRequestOtpSchema),
  async (req, res) => {
    try {
      const { method, identifier } = req.body;

      const cooldown = checkOtpCooldown(identifier);
      if (!cooldown.allowed) {
        return res.status(429).json({
          error: 'Too many OTP requests',
          retryAfter: cooldown.retryAfter,
        });
      }

      const result = await loginService.requestOTP(method, identifier);

      // Track the txn so /verify can validate it
      await OtpTxn.create({
        txnId: result.txnId,
        identifier,
        method,
      });

      res.json(result);
    } catch (e) {
      logger.error('[auth/login/request-otp]', e);
      sendServiceError(res, e);
    }
  }
);

router.post('/login/verify',
  validate(loginVerifySchema),
  async (req, res) => {
    try {
      const { method, txnId, otp } = req.body;

      // Validate txnId exists and matches method
      const txn = await OtpTxn.findOne({ txnId });
      if (!txn) {
        return res.status(400).json({ error: 'Invalid or expired txnId' });
      }
      if (txn.method !== method) {
        return res.status(400).json({ error: 'Method mismatch' });
      }
      txn.attempts += 1;
      await txn.save();

      const result = await loginService.verify(method, txnId, otp);

      // Mobile multi-ABHA: don't persist yet, wait for /verify-user
      if (result.needsSelection) {
        return res.json(result);
      }

      // Single profile — persist
      const profile = result.profile;
      const tokens = result.tokens;

      const user = await upsertUserFromProfile(profile, {
        aadhaar: method === 'aadhaar' ? txn.identifier : undefined,
        loginMethod: method,
      });

      await UserSession.create({
        userId: user.userId,
        xToken: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        refreshExpiresAt: new Date(Date.now() + (tokens.refreshExpiresIn || 1296000) * 1000),
        loginMethod: method,
      });

      // Mark txn as verified
      txn.verifiedAt = new Date();
      await txn.save();

      const responseProfile = {
        id: user._id.toString(),
        userId: user.userId,
        aadhaar: user.aadhaar,
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        ...profile,
      };

      res.json({
        needsSelection: false,
        profile: responseProfile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/login/verify]', e);
      sendServiceError(res, e);
    }
  }
);

router.post('/login/verify-user',
  validate(loginVerifyUserSchema),
  async (req, res) => {
    try {
      const { txnId, abhaNumber } = req.body;

      // Validate txn still exists
      const txn = await OtpTxn.findOne({ txnId });
      if (!txn) {
        return res.status(400).json({ error: 'Invalid or expired txnId' });
      }

      const result = await loginService.selectAbha(txnId, abhaNumber);

      // Persist the selected profile
      const profile = result.ABHAProfile;
      const tokens = result.tokens;

      const user = await upsertUserFromProfile(profile, { loginMethod: txn.method });

      await UserSession.create({
        userId: user.userId,
        xToken: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        refreshExpiresAt: new Date(Date.now() + (tokens.refreshExpiresIn || 1296000) * 1000),
        loginMethod: txn.method,
      });

      txn.verifiedAt = new Date();
      await txn.save();

      const responseProfile = {
        id: user._id.toString(),
        userId: user.userId,
        aadhaar: user.aadhaar,
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        ...profile,
      };

      res.json({
        profile: responseProfile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/login/verify-user]', e);
      sendServiceError(res, e);
    }
  }
);

// ─── REGISTER ─────────────────────────────────────────────────────────────────

router.post('/register/request-otp',
  validate(registerRequestOtpSchema),
  async (req, res) => {
    try {
      const { aadhaar } = req.body;
      console.log('Received register request OTP for Aadhaar:', aadhaar);
      const cooldown = checkOtpCooldown(aadhaar);
      if (!cooldown.allowed) {
        return res.status(429).json({
          error: 'Too many OTP requests',
          retryAfter: cooldown.retryAfter,
        });
      }

      const result = await registerService.requestOtp(aadhaar);

      await OtpTxn.create({
        txnId: result.txnId,
        identifier: aadhaar,
        method: 'register',
      });

      res.json(result);
    } catch (e) {
      logger.error('[auth/register/request-otp]', e);
      sendServiceError(res, e);
    }
  }
);

router.post('/register/enroll',
  validate(registerEnrollSchema),
  async (req, res) => {
    try {
      const { txnId } = req.body;

      // Validate txn
      const txn = await OtpTxn.findOne({ txnId });
      if (!txn) {
        return res.status(400).json({ error: 'Invalid or expired txnId' });
      }
      if (txn.method !== 'register') {
        return res.status(400).json({ error: 'Not a registration txn' });
      }

      const result = await registerService.enroll(req.body);

      const profile = result.ABHAProfile;
      const tokens = result.tokens;

      const user = await upsertUserFromProfile(profile, {
        aadhaar: req.body.aadhaar || txn.identifier,
        mobile: req.body.mobile,
        loginMethod: 'register',
      });

      await UserSession.create({
        userId: user.userId,
        xToken: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        refreshExpiresAt: new Date(Date.now() + (tokens.refreshExpiresIn || 1296000) * 1000),
        loginMethod: 'register',
      });

      txn.verifiedAt = new Date();
      await txn.save();

      const responseProfile = {
        id: user._id.toString(),
        userId: user.userId,
        aadhaar: user.aadhaar,
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        ...profile,
      };

      res.json({
        profile: responseProfile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/register/enroll]', e);
      sendServiceError(res, e);
    }
  }
);

export default router;
