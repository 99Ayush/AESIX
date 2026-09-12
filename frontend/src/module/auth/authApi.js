const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function authRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Authentication request failed');
  }
  return data;
}

export const authApi = {
  // Login flow
  requestLoginOtp: (method, identifier) =>
    authRequest('/auth/login/request-otp', {
      method: 'POST',
      body: JSON.stringify({ method, identifier }),
    }),

  verifyLoginOtp: (method, txnId, otp) =>
    authRequest('/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify({ method, txnId, otp }),
    }),

  verifyUserAbha: (txnId, abhaNumber) =>
    authRequest('/auth/login/verify-user', {
      method: 'POST',
      body: JSON.stringify({ txnId, abhaNumber }),
    }),

  // Register flow
  requestRegisterOtp: (aadhaar) =>
    authRequest('/auth/register/request-otp', {
      method: 'POST',
      body: JSON.stringify({ aadhaar }),
    }),

  enrollRegister: (payload) =>
    authRequest('/auth/register/enroll', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
