// src/module/auth/model/model.js
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

// ─── USER (persistent identity mapping) ───────────────────────────────────────
const userSchema = new mongoose.Schema({
  userId:       { type: String, required: true, unique: true, default: () => randomUUID() },
  aadhaar:      { type: String, unique: true, sparse: true },
  abhaNumber:   { type: String, unique: true, sparse: true },      // "91-1234-5678-9012"
  abhaAddress:  { type: String },                                  // "rahul@sbx"
  firstName:    { type: String },
  lastName:     { type: String },
  mobile:       { type: String },
  // NOTE: never make email unique without `sparse:true` — auth upserts
  // (login verify / register enroll) don't set email, and a plain unique
  // index rejects multiple docs with `email: null` (E11000 on test.users).
  email:        { type: String, default: undefined },
  gender:       { type: String, enum: ['M', 'F', 'O'] },
  dob:          { type: String },                                  // "1990-01-15"
  abhaStatus:   { type: String, default: 'ACTIVE' },
  phrAddress:   { type: [String], default: [] },
  kycVerified:  { type: Boolean, default: false },
  loginMethod:  { type: String, enum: ['aadhaar', 'mobile', 'abha', 'register'] },
  photoUrl:     { type: String, default: null },
  city:         { type: String, default: '' },
  bloodGroup:   { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactRelation: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
}, { timestamps: true });

userSchema.index({ mobile: 1 });

// ─── USER SESSION (ephemeral ABDM X-token) ────────────────────────────────────
const userSessionSchema = new mongoose.Schema({
  userId:         { type: String, required: true, index: true },
  xToken:         { type: String, required: true },
  refreshToken:   { type: String },
  expiresAt:      { type: Date, required: true },
  refreshExpiresAt: { type: Date },
  loginMethod:    { type: String, enum: ['aadhaar', 'mobile', 'abha', 'register'] },
  loginAt:        { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-delete expired sessions (run as a cron or TTL index)
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── OTP TXN (track in-flight OTP requests) ───────────────────────────────────
const otpTxnSchema = new mongoose.Schema({
  txnId:          { type: String, required: true, unique: true },
  identifier:     { type: String, required: true },  // aadhaar / mobile / abha (hashed)
  method:         { type: String, enum: ['aadhaar', 'mobile', 'abha', 'register'] },
  requestedAt:    { type: Date, default: Date.now },
  verifiedAt:     { type: Date },
  attempts:       { type: Number, default: 0 },
}, { timestamps: true });

// Auto-delete after 10 min (OTP expiry)
otpTxnSchema.index({ requestedAt: 1 }, { expireAfterSeconds: 600 });

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const User = mongoose.model('User', userSchema);
export const UserSession = mongoose.model('UserSession', userSessionSchema);
export const OtpTxn = mongoose.model('OtpTxn', otpTxnSchema);
