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

function buildResponseProfile(user, profile = {}) {
  const firstName = user.firstName || profile.firstName || '';
  const lastName = user.lastName !== undefined ? user.lastName : (profile.lastName || '');
  const fullName = `${firstName} ${lastName}`.trim() || profile.fullName || profile.name || 'User';
  const mobile = user.mobile || profile.mobile || profile.contact?.phone || '';
  const rawGender = user.gender || profile.gender || '';
  const gender = rawGender === 'M' ? 'Male' : (rawGender === 'F' ? 'Female' : (rawGender === 'O' ? 'Other' : rawGender));
  const abhaNum = user.abhaNumber || profile.ABHANumber || profile.abhaNumber || '';
  const abhaAddr = user.abhaAddress || profile.phrAddress?.[0] || profile.abhaAddress || '';
  const dob = user.dob || profile.dob || profile.dateOfBirth || '';
  const city = user.city || profile.city || profile.address || profile.contact?.address || '';

  return {
    id: user._id.toString(),
    userId: user.userId,
    aadhaar: user.aadhaar || '',
    fullName,
    firstName,
    lastName,
    name: fullName,
    dob,
    dateOfBirth: dob,
    gender,
    mobile,
    phone: mobile,
    email: user.email || profile.email || '',
    city,
    address: city,
    abhaNumber: abhaNum,
    ABHANumber: abhaNum,
    abhaAddress: abhaAddr,
    phrAddress: abhaAddr,
    emergencyContactName: user.emergencyContactName || 'Family Member',
    emergencyContactRelation: user.emergencyContactRelation || 'Relative',
    emergencyContactPhone: user.emergencyContactPhone || mobile || '',
    abhaStatus: user.abhaStatus || profile.abhaStatus || 'ACTIVE',
    photoUrl: user.photoUrl || profile.photoUrl || profile.photo || null,
    bloodGroup: user.bloodGroup || profile.bloodGroup || '',
  };
}

async function upsertUserFromProfile(profile, { aadhaar, mobile, loginMethod, city, abhaIdentifier }) {

  // Find existing user by aadhaar or abhaNumber
  // If user registered with this aadhaar, update that record (including keeping/updating abhaNumber)
  let user = null;
  if (aadhaar) {
    user = await User.findOne({ aadhaar });
  }
  if (!user && profile.ABHANumber) {
    user = await User.findOne({ abhaNumber: profile.ABHANumber });
  }
  // In mock mode the ABHANumber is always the same dummy value.
  // Try matching by the real identifier the user typed (abhaAddress or mobile).
  if (!user && abhaIdentifier) {
    user = await User.findOne({
      $or: [
        { abhaAddress: abhaIdentifier },
        { mobile: abhaIdentifier },
        { abhaNumber: abhaIdentifier },
      ],
    });
  }

  // Check if assigning profile.ABHANumber would collide with another user
  const targetAbha = profile.ABHANumber;
  let canSetAbha = Boolean(targetAbha);
  if (canSetAbha && user) {
    const existingWithAbha = await User.findOne({ abhaNumber: targetAbha, _id: { $ne: user._id } });
    if (existingWithAbha) {
      canSetAbha = false;
    }
  }

  // If user already exists in our DB (e.g. from registration), preserve their
  // actual registered details rather than overwriting them with ABDM mock data!
  const updateFields = {
    ...(canSetAbha ? { abhaNumber: targetAbha } : {}),
    ...(aadhaar ? { aadhaar } : {}),
    firstName: user?.firstName || profile.firstName,
    lastName: user?.lastName !== undefined ? user.lastName : profile.lastName,
    mobile: user?.mobile || mobile || profile.mobile,
    gender: user?.gender || profile.gender,
    dob: user?.dob || profile.dob,
    abhaAddress: user?.abhaAddress || profile.phrAddress?.[0] || profile.abhaAddress,
    abhaStatus: user?.abhaStatus || profile.abhaStatus,
    kycVerified: user?.kycVerified ?? profile.kycVerified,
    loginMethod,
    ...(city ? { city } : profile.city ? { city: profile.city } : {}),
  };


  if (user) {
    user = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { returnDocument: 'after' }
    );
  } else {
    user = await User.create({
      userId: randomUUID(),
      ...updateFields,
    });
  }

  // Sync / create matching MongoDB User in user module schema
  try {
    const { User: MongoUser } = await import('../../user/model/userModel.js');
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
    const genderCode = user.gender || profile.gender || '';
    const genderLabel = genderCode === 'M' ? 'Male' : genderCode === 'F' ? 'Female' : genderCode === 'O' ? 'Other' : '';
    await MongoUser.findByIdAndUpdate(
      user._id,
      {
        fullName,
        email: user.email || profile.email || `${user.userId}@example.com`,
        phone: user.mobile || mobile || profile.mobile || '',
        dateOfBirth: user.dob ? new Date(user.dob) : (profile.dob ? new Date(profile.dob) : undefined),
        ...(genderLabel ? { gender: genderLabel } : {}),
        ...(city ? { address: city } : profile.city ? { address: profile.city } : {}),
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
        abhaIdentifier: method !== 'aadhaar' ? txn.identifier : undefined,
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

      const responseProfile = buildResponseProfile(user, profile);

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

      const user = await upsertUserFromProfile(profile, {
        loginMethod: txn.method,
        abhaIdentifier: txn.identifier || abhaNumber,
      });

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

      const responseProfile = buildResponseProfile(user, profile);

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
        city: req.body.city,
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

      const responseProfile = buildResponseProfile(user, profile);

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
