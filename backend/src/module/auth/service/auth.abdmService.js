// src/module/auth/service/abdmClient.js
import config from '../../../shared/config.js';
import tokenManager from '../../../shared/tokenManager.js';
import { rsaEncrypt } from '../../../shared/rsa.js';
import { buildAbdmHeaders } from '../../../shared/utils/abdmHeader.js';
import { logger } from '../../../shared/logger.js';

// ─── MOCK RESPONSES ───────────────────────────────────────────────────────────
const MOCK = {
  requestOTP: () => ({ txnId: `mock-txn-${Date.now()}` }),

  verifyOTP: ({ scope }) => {
    if (scope === 'abha-enrol') {
      return {
        ABHAProfile: {
          ABHANumber: '91-0000-1111-2222',
          firstName: 'Mock',
          lastName: 'Patient',
          dob: '01-01-1990',
          gender: 'M',
          mobile: '9999999999',
          abhaStatus: 'ACTIVE',
          phrAddress: ['mock@sbx'],
        },
        tokens: {
          token: 'mock-x-token',
          refreshToken: 'mock-refresh',
          expiresIn: 1800,
        },
      };
    }

    // Login: single-profile fields for aadhaar/abha; abhaProfiles for mobile selector
    return {
      ABHAProfile: {
        ABHANumber: '91-0000-1111-2222',
        firstName: 'Rahul',
        lastName: 'Sharma',
        dob: '15-01-1990',
        gender: 'M',
        mobile: '9999999999',
        abhaStatus: 'ACTIVE',
        phrAddress: ['rahul@sbx'],
        kycVerified: true,
      },
      tokens: {
        token: 'mock-x-token',
        refreshToken: 'mock-refresh',
        expiresIn: 1800,
      },
      abhaProfiles: [
        { abhaNumber: '91-0000-1111-2222', firstName: 'Rahul' },
        { abhaNumber: '91-0000-3333-4444', firstName: 'Priya' },
      ],
    };
  },

  verifyUser: () => ({
    ABHAProfile: {
      ABHANumber: '91-0000-1111-2222',
      firstName: 'Rahul',
      lastName: 'Sharma',
      dob: '15-01-1990',
      gender: 'M',
    },
    tokens: {
      token: 'mock-x-token',
      refreshToken: 'mock-refresh',
      expiresIn: 1800,
    },
  }),

  enrollByAadhaar: ({ name, mobile, gender, dob }) => {
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
    const genderCode = { MALE: 'M', FEMALE: 'F', OTHER: 'O' }[gender] || gender;
    const abhaSuffix = String(Date.now()).slice(-8);

    return {
      ABHAProfile: {
        ABHANumber: `91-${abhaSuffix.slice(0, 4)}-${abhaSuffix.slice(4)}-0001`,
        firstName,
        lastName: lastNameParts.join(' '),
        dob,
        gender: genderCode,
        mobile,
        abhaStatus: 'ACTIVE',
        phrAddress: [`${firstName.toLowerCase()}@sbx`],
      },
      tokens: {
        token: 'mock-x-token',
        refreshToken: 'mock-refresh',
        expiresIn: 1800,
      },
    };
  },
};

// ─── REAL CALL ────────────────────────────────────────────────────────────────
async function post(path, body, { auth = true } = {}) {
  const url = `${config.abdm.baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...buildAbdmHeaders(),
  };

  if (auth) {
    const token = await tokenManager.getToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  logger.debug(`[abdmClient] POST ${path}`);

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || data.error || `ABDM error ${res.status}`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }

  return data;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
export default {

  async requestOTP({ scope, loginHint, loginId, otpSystem }) {
    if (config.abdm.mockMode) return MOCK.requestOTP();

    const publicKey = await tokenManager.getPublicKey();
    const encryptedId = rsaEncrypt(loginId, publicKey);

    const path = scope === 'abha-enrol'
      ? '/enrollment/request/otp'
      : '/profile/login/request/otp';

    return post(path, { scope, loginHint, loginId: encryptedId, otpSystem });
  },

  async verifyOTP({ scope, txnId, otpValue, otpSystem }) {
    if (config.abdm.mockMode) return MOCK.verifyOTP({ scope });

    const path = scope === 'abha-enrol'
      ? '/enrollment/enrol/byAadhaar'
      : '/profile/login/verify';

    const body = scope === 'abha-enrol'
      ? { txnId, otp: otpValue }
      : {
          scope,
          authData: {
            authMethods: ['otp'],
            otp: { txnId, otpValue, ...(otpSystem && { otpSystem }) },
          },
        };

    return post(path, body);
  },

  async enrollByAadhaar({ txnId, otp, aadhaar, name, mobile, gender, dob }) {
    if (config.abdm.mockMode) return MOCK.enrollByAadhaar({ name, mobile, gender, dob });

    const publicKey = await tokenManager.getPublicKey();

    return post('/enrollment/enrol/byAadhaar', {
      txnId,
      otp,
      aadhaar: rsaEncrypt(aadhaar, publicKey),
      name,
      mobile: rsaEncrypt(mobile, publicKey),
      gender,
      dob,
    });
  },

  async verifyUser(txnId, abhaNumber) {
    if (config.abdm.mockMode) return MOCK.verifyUser();

    return post('/profile/login/verify/user', { txnId, abhaNumber });
  },
};
