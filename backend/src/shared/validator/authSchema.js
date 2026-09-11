import { z } from 'zod';

export const loginRequestOtpSchema = z.object({
  method: z.enum(['aadhaar', 'mobile', 'abha']),
  identifier: z.string().min(5).max(20),
});

export const loginVerifySchema = z.object({
  method: z.enum(['aadhaar', 'mobile', 'abha']),
  txnId: z.string().min(1),
  otp: z.string().length(6),
});

export const loginVerifyUserSchema = z.object({
  txnId: z.string().min(1),
  abhaNumber: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/, 'Invalid ABHA format'),
});

export const registerRequestOtpSchema = z.object({
  aadhaar: z.string().length(12, 'Aadhaar must be 12 digits'),
});

export const registerEnrollSchema = z.object({
  txnId: z.string().min(1),
  aadhaar: z.string().length(12),
  name: z.string().min(2).max(100),
  mobile: z.string().length(10),
  gender: z.enum(['M', 'F', 'O']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
