import { z } from 'zod';

const aadhaarSchema = z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits');
const mobileSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number');
const abhaNumberSchema = z.string().regex(
  /^\d{2}-\d{4}-\d{4}-\d{4}$/,
  'Invalid ABHA format'
);

export const loginRequestOtpSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('aadhaar'), identifier: aadhaarSchema }),
  z.object({ method: z.literal('mobile'), identifier: mobileSchema }),
  z.object({ method: z.literal('abha'), identifier: abhaNumberSchema }),
]);

export const loginVerifySchema = z.object({
  method: z.enum(['aadhaar', 'mobile', 'abha']),
  txnId: z.string().min(1),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const loginVerifyUserSchema = z.object({
  txnId: z.string().min(1),
  abhaNumber: abhaNumberSchema,
});

export const registerRequestOtpSchema = z.object({
  aadhaar: aadhaarSchema,
});

export const registerEnrollSchema = z.object({
  txnId: z.string().min(1),
  aadhaar: aadhaarSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  name: z.string().min(2).max(100),
  mobile: mobileSchema,
  gender: z.enum(['M', 'F', 'O', 'MALE', 'FEMALE', 'OTHER']).transform(value => ({
    M: 'MALE',
    F: 'FEMALE',
    O: 'OTHER',
  }[value] ?? value)),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
