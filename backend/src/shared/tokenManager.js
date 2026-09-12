// src/shared/tokenManager.js
import config from './config.js';
import { logger } from './logger.js';

class TokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = 0;
    this.publicKey = null;
  }

  async getToken() {
    // Return cached token if still valid (refresh 30s before expiry)
    if (this.token && Date.now() < this.expiresAt - 30000) {
      return this.token;
    }

    if (config.abdm.mockMode) {
      return 'mock-app-token';
    }

    logger.info('[tokenManager] Fetching new app token');

    const res = await fetch(`${config.abdm.gatewayUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: config.abdm.clientId,
        clientSecret: config.abdm.clientSecret,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Token fetch failed: ${err.message || res.status}`);
    }

    const data = await res.json();
    this.token = data.accessToken;
    this.expiresAt = Date.now() + data.expiresIn * 1000;

    logger.info(`[tokenManager] Token acquired, expires in ${data.expiresIn}s`);
    return this.token;
  }

  async getPublicKey() {
    if (this.publicKey) return this.publicKey;

    if (config.abdm.mockMode) {
      return 'mock-public-key';
    }

    logger.info('[tokenManager] Fetching RSA public key');

    const token = await this.getToken();

    const res = await fetch(`${config.abdm.baseUrl}/profile/public/certificate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Public key fetch failed: ${res.status}`);
    }

    const data = await res.json();
    this.publicKey = data.publicKey;

    logger.info('[tokenManager] Public key cached');
    return this.publicKey;
  }

  // Invalidate token (call on 401 responses)
  invalidate() {
    this.token = null;
    this.expiresAt = 0;
  }
}

export default new TokenManager();   