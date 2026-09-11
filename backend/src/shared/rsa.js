// src/shared/rsa.js
import { createPublicKey, publicEncrypt, constants } from 'crypto';

export function rsaEncrypt(plaintext, publicKeyPem) {
  const key = createPublicKey({
    key: publicKeyPem,
    format: 'pem',
    type: 'spki',
  });

  const encrypted = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(plaintext, 'utf8')
  );

  return encrypted.toString('base64');
}   