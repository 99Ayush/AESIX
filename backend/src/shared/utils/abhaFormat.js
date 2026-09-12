// src/shared/utils/abhaFormat.js
export function maskAbha(abhaNumber) {
    // "91-1234-5678-9012" → "91-XXXX-XXXX-9012"
    return abhaNumber.replace(/^(\d{2})-\d{4}-\d{4}-(\d{4})$/, '$1-XXXX-XXXX-$2');
  }
  
  export function isValidAbha(abhaNumber) {
    return /^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaNumber);
  }
  
  export function isValidAadhaar(aadhaar) {
    return /^\d{12}$/.test(aadhaar);
  }
  
  export function isValidMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
  }
