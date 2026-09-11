// src/module/auth/model/model.js
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

// ─── USER (persistent identity mapping) ───────────────────────────────────────
const userSchema = new mongoose.Schema({
  userId:       { type: String, required: true, unique: true, default: () => randomUUID() },
  abhaNumber:   { type: String, unique: true, sparse: true },      // "91-1234-5678-9012"
  abhaAddress:  { type: String },                                  // "rahul@sbx"
  firstName:    { type: String },
  lastName:     { type: String },
  mobile:       { type: String },
  email:        { type: String },
  gender:       { type: String, enum: ['M', 'F', 'O'] },
  dob:          { type: String },                                  // "1990-01-15"
  abhaStatus:   { type: String, default: 'ACTIVE' },
  phrAddress:   { type: [String], default: [] },
  kycVerified:  { type: Boolean, default: false },
  loginMethod:  { type: String, enum: ['aadhaar', 'mobile', 'abha', 'register'] },
}, { timestamps: true });

userSchema.index({ abhaNumber: 1 });
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