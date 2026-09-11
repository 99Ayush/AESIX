// src/module/auth/service/registerService.js
import abdmClient from './auth.abdmService.js';
import { withRetry } from '../../../shared/utils/retry.js';
import { logger } from '../../../shared/logger.js';

export default {

  async requestOtp(aadhaar) {
    logger.info(`[register] OTP requested for aadhaar ***${aadhaar.slice(-4)}`);

    return withRetry(() => abdmClient.requestOTP({
      scope: 'abha-enrol',
      loginHint: 'aadhaar',
      loginId: aadhaar,
      otpSystem: 'aadhaar',
    }), { maxRetries: 2, baseDelay: 1000 });
  },

  async enroll({ txnId, aadhaar, name, mobile, gender, dob }) {
    logger.info(`[register] Enrolling: ${name}`);

    return withRetry(() => abdmClient.enrollByAadhaar({
      txnId,
      aadhaar,
      name,
      mobile,
      gender,
      dob,
    }), { maxRetries: 1, baseDelay: 2000 });
    // Only 1 retry — enrollment is not idempotent, double-call creates duplicate
  },
};   