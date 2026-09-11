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

async function upsertUserFromProfile(profile, { mobile, loginMethod }) {
  return User.findOneAndUpdate(
    { abhaNumber: profile.ABHANumber },
    {
      $set: {
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
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
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
      res.status(500).json({ error: e.message });
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

      const user = await upsertUserFromProfile(profile, { loginMethod: method });

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

      res.json({
        needsSelection: false,
        profile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/login/verify]', e);
      res.status(500).json({ error: e.message });
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

      res.json({
        profile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/login/verify-user]', e);
      res.status(500).json({ error: e.message });
    }
  }
);

// ─── REGISTER ─────────────────────────────────────────────────────────────────

router.post('/register/request-otp',
  validate(registerRequestOtpSchema),
  async (req, res) => {
    try {
      const { aadhaar } = req.body;

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
      res.status(500).json({ error: e.message });
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

      res.json({
        profile,
        tokens,
        userId: user.userId,
      });
    } catch (e) {
      logger.error('[auth/register/enroll]', e);
      res.status(500).json({ error: e.message });
    }
  }
);

export default router;   