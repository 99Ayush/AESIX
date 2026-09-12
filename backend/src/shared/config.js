// src/shared/config.js
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'AESIX-DB.env' });

const config = {
  abdm: {
    baseUrl: process.env.ABDM_BASE_URL || 'https://abhasbx.abdm.gov.in/abha/api/v3',
    gatewayUrl: process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/api/hiecm/gateway/v3',
    clientId: process.env.ABDM_CLIENT_ID || '',
    clientSecret: process.env.ABDM_CLIENT_SECRET || '',
    xCmId: 'sbx',
    mockMode: process.env.ABDM_MOCK !== 'false',
  },
  database: {
    uri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  },
};

export default config;
