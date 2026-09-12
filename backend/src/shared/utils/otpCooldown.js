// src/shared/utils/otpCooldown.js
// Prevents OTP spam — max 3 requests per identifier per 5 min
const store = new Map(); // in prod, use Redis

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 5 * 60 * 1000;

export function checkOtpCooldown(identifier) {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(identifier, { firstAttempt: now, count: 1 });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}   