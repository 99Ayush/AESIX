## Auth WorkFlow

before anything we are supposed to hit to get the access token
```js
const res = await fetch('https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'your-sandbox-client-id',
    clientSecret: 'your-sandbox-client-secret'
  })
});
const { accessToken, expiresIn, refreshToken } = await res.json();
```

*Critical gotcha*: The token expires fast. Build a token manager that refreshes before expiry:
this will keep the active sessions going
```js
class TokenManager {
  constructor(clientId, clientSecret, baseUrl) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = baseUrl;
    this.token = null;
    this.expiresAt = 0;
  }

  async getToken() {
    // Refresh 30s before expiry
    if (this.token && Date.now() < this.expiresAt - 30000) {
      return this.token;
    }
    const res = await fetch(`${this.baseUrl}/api/hiecm/gateway/v3/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret })
    });
    const data = await res.json();
    this.token = data.accessToken;
    this.expiresAt = Date.now() + data.expiresIn * 1000;
    return this.token;
  }
}   
```
---
---


### Registering and loging in the Patient
>Sandbox shortcut: OTP is always 123456. You can also use Demo Auth (no real Aadhaar needed). 

**Steps**
- get the session token [using the token Manager]
- Get the RSA public key (to encrypt sensitive fields)
- Encrypt the login id[phone , abha , aadhar] with RSA
- Request OTP 
- Verify OTP + create ABHA
```js
// loginService.js
const LOGIN_CONFIG = {
  aadhaar:  { loginHint: 'aadhaar',     otpSystem: 'aadhaar' },
  mobile:   { loginHint: 'mobile',      otpSystem: 'abdm' },
  abha:     { loginHint: 'abha-number', otpSystem: 'abdm' },
};

class LoginService {
  constructor(tokenManager, rsaPublicKey) {
    this.tokenManager = tokenManager;
    this.publicKey = rsaPublicKey;
    this.baseUrl = 'https://abhasbx.abdm.gov.in/abha/api/v3';
  }

  async requestOTP(method, identifier) {
    const config = LOGIN_CONFIG[method];
    const token = await this.tokenManager.getToken();

    const res = await fetch(`${this.baseUrl}/profile/login/request/otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scope: ['abha-login'],
        loginHint: config.loginHint,
        loginId: this.rsaEncrypt(identifier, this.publicKey),
        otpSystem: config.otpSystem,
      }),
    });

    const data = await res.json();
    // → { txnId, message: "OTP sent to mobile ending xxx" }
    return data.txnId;
  }

  async verifyOTP(method, txnId, otp, abhaNumberIfMobile) {
    const token = await this.tokenManager.getToken();

    const body = {
      scope: ['abha-login'],
      authData: {
        authMethods: ['otp'],
        otp: { txnId, otpValue: otp },
      },
    };

    // For mobile login, you may need to pass the ABHA number
    // if the verify/user step is required
    if (method === 'mobile' && abhaNumberIfMobile) {
      body.abhaNumber = abhaNumberIfMobile;
    }

    const res = await fetch(`${this.baseUrl}/profile/login/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // ⚠️ MOBILE LOGIN EXTRA STEP:
    // If response contains multiple ABHA accounts, you must call /verify/user
    if (method === 'mobile' && data.abhaProfiles?.length > 1) {
      return this.verifyUser(txnId, data);
    }

    return data; // { ABHAProfile, tokens: { token, refreshToken, expiresIn } }
  }

  async verifyUser(txnId, { abhaProfiles }) {
    const token = await this.tokenManager.getToken();
    // User picks one ABHA from the list (your UI shows a selector)
    const selectedAbha = abhaProfiles[0]; // or from user selection

    const res = await fetch(`${this.baseUrl}/profile/login/verify/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txnId,
        abhaNumber: selectedAbha.abhaNumber,
      }),
    });

    return res.json(); // final ABHAProfile + tokens
  }
}     
```

---
*register and login workflows*
```js
Step 1: RSA-encrypt the Aadhaar number
        encryptedAadhaar = rsaEncrypt(aadhaar, publicKey)

Step 2: POST /v3/enrollment/request/otp
        body: {
          scope: ["abha-enrol"],
          loginHint: "aadhaar",
          loginId: encryptedAadhaar,
          otpSystem: "aadhaar"
        }
        → { txnId }

Step 3: User enters OTP (sandbox = "123456")

Step 4: RSA-encrypt mobile number too
        encryptedMobile = rsaEncrypt(mobile, publicKey)

Step 5: POST /v3/enrollment/enrol/byAadhaar
        body: {
          txnId,
          otp: "123456",
          aadhaar: encryptedAadhaar,
          name: "Rahul Sharma",
          mobile: encryptedMobile,
          gender: "MALE",
          dob: "1990-01-01"
        }
        → {
            ABHAProfile: { abhaNumber: "91-XXXX-XXXX-1234", ... },
            tokens: { token, refreshToken, expiresIn }
          }

Step 6: Store ABHA number + user token in your DB
        (link to your internal user ID)   
```

*login for all 3 methods*
```aadharlogin.js
Step 1: RSA-encrypt Aadhaar
Step 2: POST /v3/profile/login/request/otp
        body: {
          scope: ["abha-login"],
          loginHint: "aadhaar",
          loginId: encryptedAadhaar,
          otpSystem: "aadhaar"
        }
        → { txnId }
Step 3: User enters OTP
Step 4: POST /v3/profile/login/verify
        body: {
          scope: ["abha-login"],
          authData: {
            authMethods: ["otp"],
            otp: { txnId, otpValue: "123456" }
          }
        }
        → { ABHAProfile, tokens: { token, refreshToken } }
Step 5: Store session, proceed to app   
```


```abhaNumLogin.js
Step 1: RSA-encrypt ABHA number
Step 2: POST /v3/profile/login/request/otp
        body: {
          scope: ["abha-login"],
          loginHint: "abha-number",
          loginId: encryptedAbhaNumber,
          otpSystem: "abdm"
        }
        → { txnId }
Step 3: User enters OTP
Step 4: POST /v3/profile/login/verify
        body: {
          scope: ["abha-login"],
          authData: {
            authMethods: ["otp"],
            otp: { txnId, otpValue: "123456" }
          }
        }
        → { ABHAProfile, tokens: { token, refreshToken } }
Step 5: Store session, proceed to app   
```

```mobileLogin.js
Step 1: RSA-encrypt mobile number
Step 2: POST /v3/profile/login/request/otp
        body: {
          scope: ["abha-login"],
          loginHint: "mobile",
          loginId: encryptedMobile,
          otpSystem: "abdm"
        }
        → { txnId }
Step 3: User enters OTP
Step 4: POST /v3/profile/login/verify
        body: {
          scope: ["abha-login"],
          authData: {
            authMethods: ["otp"],
            otp: { txnId, otpValue: "123456" }
          }
        }
        → {
            abhaProfiles: [
              { abhaNumber: "91-...-1234", name: "Rahul" },
              { abhaNumber: "91-...-5678", name: "Priya" }
            ]
          }

Step 5: ⚠️ If abhaProfiles.length > 1 → show selector in UI
        User picks one

Step 6: POST /v3/profile/login/verify/user
        body: {
          txnId,
          abhaNumber: "91-XXXX-XXXX-1234"   ← user's selection
        }
        → { ABHAProfile, tokens: { token, refreshToken } }

Step 7: Store session, proceed to app   
```

---
after login
```
Step 1: You now have:
        - abhaNumber (14-digit)
        - user token (X-token) — the patient's session

Step 2: If patient is new to YOUR system:
        → Create internal user record, link abhaNumber

Step 3: If patient already has records in your system:
        → Build FHIR bundle from your data
        → Push to ABDM (HIP flow)

Step 4: If doctor (HIU) wants to view:
        → Initiate consent request with patient's abhaNumber
        → Patient grants in ABHA app
        → You fetch + decrypt → render in doctor UI   
```


user -- inputs id[abha, aadhar, phone]--> 
