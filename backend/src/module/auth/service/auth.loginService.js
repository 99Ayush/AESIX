// src/module/auth/service/loginService.js
import abdmClient from './auth.abdmService.js';
import { withRetry } from '../../../shared/utils/retry.js';
import { logger } from '../../../shared/logger.js';

const CONFIG = {
  aadhaar: { loginHint: 'aadhaar',     otpSystem: 'aadhaar' },
  mobile:  { loginHint: 'mobile',      otpSystem: 'abdm' },
  abha:    { loginHint: 'abha-number', otpSystem: 'abdm' },
};

export default {

  async requestOTP(method, identifier) {
    const cfg = CONFIG[method];
    if (!cfg) throw new Error(`Unsupported login method: ${method}`);

    logger.info(`[login] OTP requested via ${method}`);

    return withRetry(() => abdmClient.requestOTP({
      scope: 'abha-login',
      loginHint: cfg.loginHint,
      loginId: identifier,
      otpSystem: cfg.otpSystem,
    }), { maxRetries: 2, baseDelay: 1000 });
  },

  async verify(method, txnId, otp) {
    logger.info(`[login] Verifying OTP via ${method}`);

    let result;

    try {
      result = await withRetry(() => abdmClient.verifyOTP({
        scope: 'abha-login',
        txnId,
        otpValue: otp,
      }), { maxRetries: 2, baseDelay: 1000 });
    } catch (e) {
      // ABDM-1114: ABHA number OTP not allowed → retry with aadhaar otpSystem
      if (method === 'abha' && e.code === 'ABDM-1114') {
        logger.warn(`[login] ABDM-1114, retrying ABHA login with aadhaar otpSystem`);
        result = await withRetry(() => abdmClient.verifyOTP({
          scope: 'abha-login',
          txnId,
          otpValue: otp,
          otpSystem: 'aadhaar',  // override
        }), { maxRetries: 1, baseDelay: 1000 });
      } else {
        throw e;
      }
    }

    // ── Mobile: check for multiple profiles ──
    if (method === 'mobile' && result.abhaProfiles?.length > 1) {
      return {
        needsSelection: true,
        txnId,
        abhaProfiles: result.abhaProfiles.map(p => ({
          abhaNumber: p.abhaNumber,
          name: p.firstName,
        })),
      };
    }

    // ── Single profile (all methods, or mobile with exactly 1 ABHA) ──
    if (!result.ABHAProfile) {
      throw new Error('ABDM did not return a valid profile');
    }

    return {
      needsSelection: false,
      profile: result.ABHAProfile,
      tokens: result.tokens,
    };
  },

  async selectAbha(txnId, abhaNumber) {
    logger.info(`[login] User selected ABHA: ${abhaNumber}`);

    const result = await withRetry(() => abdmClient.verifyUser(txnId, abhaNumber), {
      maxRetries: 2,
      baseDelay: 1000,
    });

    if (!result.ABHAProfile || !result.tokens) {
      throw new Error('ABDM did not return a valid profile after selection');
    }

    return result;
  },
};   