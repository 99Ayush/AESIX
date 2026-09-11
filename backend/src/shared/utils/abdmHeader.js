// src/shared/utils/abdmHeaders.js
import { randomUUID } from 'crypto';

export function buildAbdmHeaders() {
  return {
    'REQUEST-ID': randomUUID(),
    'TIMESTAMP': new Date().toISOString(),
    'X-CM-ID': 'sbx',
  };
}   