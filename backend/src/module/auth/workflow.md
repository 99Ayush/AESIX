# **ABDM Auth Flows — Full Trace**

---

## **Flow 1: Login via Aadhaar**

**User:** Rahul Sharma, Aadhaar `123456789012`

### **Step 1 — Request OTP**

```
POST /api/auth/login/request-otp
{ "method": "aadhaar", "identifier": "123456789012" }
```


|                                                      |                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| **Layer**                                            | **What happens**                                               |
| `validate(loginRequestOtpSchema)`                    | `method` = "aadhaar" ✓, `identifier` = 12 chars ✓              |
| `checkOtpCooldown("123456789012")`                   | First attempt → `{ allowed: true }`                            |
| `loginService.requestOTP("aadhaar", "123456789012")` | Picks config: `{ loginHint: "aadhaar", otpSystem: "aadhaar" }` |
| `abdmClient.requestOTP(...)`                         | RSA-encrypts Aadhaar → POST `/profile/login/request/otp`       |
| ABDM responds                                        | `{ txnId: "txn-aaa-111" }`                                     |


**Response to frontend:**

```
{ "txnId": "txn-aaa-111" }
```

### **Step 2 — Verify OTP**

```
POST /api/auth/login/verify
{ "method": "aadhaar", "txnId": "txn-aaa-111", "otp": "123456" }
```


|                                                           |                                                                            |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Layer**                                                 | **What happens**                                                           |
| `validate(loginVerifySchema)`                             | All fields valid ✓                                                         |
| `loginService.verify("aadhaar", "txn-aaa-111", "123456")` | Calls `abdmClient.verifyOTP({ scope: "abha-login", txnId, otpValue })`     |
| `abdmClient`                                              | POST `/profile/login/verify` with `authData: { otp: { txnId, otpValue } }` |
| ABDM responds                                             | Single `ABHAProfile` (Aadhaar is 1:1, never multiple)                      |


**Response to frontend:**

```
{
  "needsSelection": false,
  "profile": {
    "ABHANumber": "91-1234-5678-9012",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dob": "15-01-1990",
    "gender": "M"
  },
  "tokens": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 1800
  }
}
```

### **Step 3 — Persist (in controller after response)**

```
await User.findOneAndUpdate(
  { abhaNumber: "91-1234-5678-9012" },
  { name: "Rahul Sharma", mobile: "9876543210", gender: "M", dob: "1990-01-15" },
  { upsert: true }
);

await UserSession.create({
  userId: user._id,
  xToken: "eyJhbGciOi...",
  refreshToken: "eyJhbGciOi...",
  expiresAt: new Date(Date.now() + 1800000),
  loginMethod: "aadhaar",
});
```

**Done.** No extra steps. Aadhaar is always 1:1 with ABHA.

---

## **Flow 2: Login via ABHA Number**

**User:** Rahul Sharma, ABHA `91-1234-5678-9012`

### **Step 1 — Request OTP**

```
POST /api/auth/login/request-otp
{ "method": "abha", "identifier": "91-1234-5678-9012" }
```


|                                                        |                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| **Layer**                                              | **What happens**                                                |
| `validate(loginRequestOtpSchema)`                      | `method` = "abha" ✓, `identifier` = 19 chars ✓                  |
| `checkOtpCooldown("91-1234-5678-9012")`                | First attempt → `{ allowed: true }`                             |
| `loginService.requestOTP("abha", "91-1234-5678-9012")` | Picks config: `{ loginHint: "abha-number", otpSystem: "abdm" }` |
| `abdmClient.requestOTP(...)`                           | RSA-encrypts ABHA number → POST `/profile/login/request/otp`    |
| ABDM responds                                          | `{ txnId: "txn-bbb-222" }`                                      |


**Response to frontend:**

```
{ "txnId": "txn-bbb-222" }
```

> ⚠️ If ABDM returns error `ABDM-1114`, the `abdmClient` throws. You can catch it in `loginService` and retry with `otpSystem: "aadhaar"` as fallback.

### **Step 2 — Verify OTP**

```
POST /api/auth/login/verify
{ "method": "abha", "txnId": "txn-bbb-222", "otp": "123456" }
```


|                                                        |                                              |
| ------------------------------------------------------ | -------------------------------------------- |
| **Layer**                                              | **What happens**                             |
| `validate(loginVerifySchema)`                          | All fields valid ✓                           |
| `loginService.verify("abha", "txn-bbb-222", "123456")` | Calls `abdmClient.verifyOTP(...)`            |
| ABDM responds                                          | Single `ABHAProfile` (ABHA number is unique) |


**Response to frontend:**

```
{
  "needsSelection": false,
  "profile": {
    "ABHANumber": "91-1234-5678-9012",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dob": "15-01-1990",
    "gender": "M"
  },
  "tokens": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 1800
  }
}
```

### **Step 3 — Persist**

Same as Aadhaar flow. `loginMethod: "abha"`.

**Done.** No extra steps. ABHA number is always 1:1.

---

## **Flow 3: Login via Mobile (with multi-ABHA selection)**

**User:** Rahul Sharma, Mobile `9876543210`  
**Complication:** Priya Sharma also has ABHA linked to the same number.

### **Step 1 — Request OTP**

```
POST /api/auth/login/request-otp
{ "method": "mobile", "identifier": "9876543210" }
```


|                                                   |                                                            |
| ------------------------------------------------- | ---------------------------------------------------------- |
| **Layer**                                         | **What happens**                                           |
| `validate(loginRequestOtpSchema)`                 | `method` = "mobile" ✓, `identifier` = 10 chars ✓           |
| `checkOtpCooldown("9876543210")`                  | First attempt → `{ allowed: true }`                        |
| `loginService.requestOTP("mobile", "9876543210")` | Picks config: `{ loginHint: "mobile", otpSystem: "abdm" }` |
| `abdmClient.requestOTP(...)`                      | RSA-encrypts mobile → POST `/profile/login/request/otp`    |
| ABDM responds                                     | `{ txnId: "txn-ccc-333" }`                                 |


**Response to frontend:**

```
{ "txnId": "txn-ccc-333" }
```

### **Step 2 — Verify OTP**

```
POST /api/auth/login/verify
{ "method": "mobile", "txnId": "txn-ccc-333", "otp": "123456" }
```


|                                                          |                                              |
| -------------------------------------------------------- | -------------------------------------------- |
| **Layer**                                                | **What happens**                             |
| `validate(loginVerifySchema)`                            | All fields valid ✓                           |
| `loginService.verify("mobile", "txn-ccc-333", "123456")` | Calls `abdmClient.verifyOTP(...)`            |
| ABDM responds                                            | **Multiple profiles** (mobile can be shared) |


ABDM raw response:

```
{
  "abhaProfiles": [
    { "abhaNumber": "91-1234-5678-9012", "firstName": "Rahul" },
    { "abhaNumber": "91-1234-5678-3456", "firstName": "Priya" }
  ]
}
```

`loginService` detects `method === "mobile"` AND `abhaProfiles.length > 1`:

**Response to frontend:**

```
{
  "needsSelection": true,
  "txnId": "txn-ccc-333",
  "abhaProfiles": [
    { "abhaNumber": "91-1234-5678-9012", "name": "Rahul" },
    { "abhaNumber": "91-1234-5678-3456", "name": "Priya" }
  ]
}
```

**Frontend shows selector UI:**

```
┌──────────────────────────────────────────────┐
│  We found 2 ABHA accounts for this number:   │
│                                              │
│  ○ Rahul  (91-XXXX-XXXX-9012)               │
│  ○ Priya  (91-XXXX-XXXX-3456)               │
│                                              │
│  [ Select & Continue ]                       │
└──────────────────────────────────────────────┘
```

### **Step 3 — User selects "Rahul"**

```
POST /api/auth/login/verify-user
{ "txnId": "txn-ccc-333", "abhaNumber": "91-1234-5678-9012" }
```


|                                                               |                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Layer**                                                     | **What happens**                                                    |
| `validate(loginVerifyUserSchema)`                             | `txnId` ✓, `abhaNumber` matches regex `^\d{2}-\d{4}-\d{4}-\d{4}$` ✓ |
| `loginService.selectAbha("txn-ccc-333", "91-1234-5678-9012")` | Calls `abdmClient.verifyUser(...)`                                  |
| `abdmClient`                                                  | POST `/profile/login/verify/user` with `{ txnId, abhaNumber }`      |
| ABDM responds                                                 | Full `ABHAProfile` + tokens                                         |


**Response to frontend:**

```
{
  "ABHAProfile": {
    "ABHANumber": "91-1234-5678-9012",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dob": "15-01-1990",
    "gender": "M"
  },
  "tokens": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 1800
  }
}
```

### **Step 4 — Persist**

```
await User.findOneAndUpdate(
  { abhaNumber: "91-1234-5678-9012" },
  { name: "Rahul Sharma", mobile: "9876543210", gender: "M", dob: "1990-01-15" },
  { upsert: true }
);

await UserSession.create({
  userId: user._id,
  xToken: "eyJhbGciOi...",
  refreshToken: "eyJhbGciOi...",
  expiresAt: new Date(Date.now() + 1800000),
  loginMethod: "mobile",
});
```

**Done.** 3 API calls total (request-otp → verify → verify-user).

---

## **Flow 4: Registration (ABHA Creation)**

**User:** New patient, Aadhaar `234567890123`, no existing ABHA.

### **Step 1 — Request Enrollment OTP**

```
POST /api/auth/register/request-otp
{ "aadhaar": "234567890123" }
```


|                                              |                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Layer**                                    | **What happens**                                                                                   |
| `validate(registerRequestOtpSchema)`         | `aadhaar` = 12 digits ✓                                                                            |
| `checkOtpCooldown("234567890123")`           | First attempt → `{ allowed: true }`                                                                |
| `registerService.requestOtp("234567890123")` | Calls `abdmClient.requestOTP({ scope: "abha-enrol", loginHint: "aadhaar", otpSystem: "aadhaar" })` |
| `abdmClient`                                 | RSA-encrypts Aadhaar → POST `/enrollment/request/otp`                                              |
| ABDM responds                                | `{ txnId: "txn-reg-444" }`                                                                         |


**Response to frontend:**

```
{ "txnId": "txn-reg-444" }
```

### **Step 2 — Frontend collects full details**

```
┌──────────────────────────────────────────────┐
│  Create your ABHA                             │
│                                              │
│  Full Name:    [ Rahul Sharma         ]      │
│  Mobile:       [ 9876543210           ]      │
│  Gender:       [ Male ▼               ]      │
│  Date of Birth:[ 1990-01-15         ]        │
│                                              │
│  [ Enroll ]                                  │
└──────────────────────────────────────────────┘
```

### **Step 3 — Enroll**

```
POST /api/auth/register/enroll
{
  "txnId": "txn-reg-444",
  "aadhaar": "234567890123",
  "otp": "123456",
  "name": "Rahul Sharma",
  "mobile": "9876543210",
  "gender": "MALE",
  "dob": "1990-01-15"
}
```


|                                  |                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Layer**                        | **What happens**                                                                                                                                             |
| `validate(registerEnrollSchema)` | All fields valid ✓                                                                                                                                           |
| `registerService.enroll({...})`  | Calls `abdmClient.enrollByAadhaar({...})` with **1 retry max** (not idempotent)                                                                              |
| `abdmClient.enrollByAadhaar`     | RSA-encrypts Aadhaar + mobile → POST `/enrollment/enrol/byAadhaar` with `{ txnId, otp: "123456", aadhaar: encrypted, name, mobile: encrypted, gender, dob }` |
| ABDM responds                    | New `ABHAProfile` + tokens                                                                                                                                   |


**Response to frontend:**

```
{
  "ABHAProfile": {
    "ABHANumber": "91-9999-8888-7777",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dob": "15-01-1990",
    "gender": "M",
    "abhaStatus": "ACTIVE",
    "phrAddress": ["rahul@sbx"]
  },
  "tokens": {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 1800
  }
}
```

### **Step 4 — Persist**

```
const user = await User.create({
  abhaNumber: "91-9999-8888-7777",
  name: "Rahul Sharma",
  mobile: "9876543210",
  gender: "M",
  dob: "1990-01-15",
  abhaStatus: "ACTIVE",
  phrAddress: ["rahul@sbx"],
});

await UserSession.create({
  userId: user._id,
  xToken: "eyJhbGciOi...",
  refreshToken: "eyJhbGciOi...",
  expiresAt: new Date(Date.now() + 1800000),
  loginMethod: "register",
});
```

**Done.** User is now both registered in ABDM AND in your system.

---

## **Comparison Table**


|                  |                  |                                          |                                    |
| ---------------- | ---------------- | ---------------------------------------- | ---------------------------------- |
| **Aspect**       | **Aadhaar**      | **ABHA Number**                          | **Mobile**                         |
| API calls        | 2 (otp + verify) | 2 (otp + verify)                         | **3** (otp + verify + verify-user) |
| `loginHint`      | `"aadhaar"`      | `"abha-number"`                          | `"mobile"`                         |
| `otpSystem`      | `"aadhaar"`      | `"abdm"`                                 | `"abdm"`                           |
| Multi-profile?   | No (1:1)         | No (unique)                              | **Yes** (family sharing)           |
| Extra UI step?   | No               | No                                       | **Yes** (selector)                 |
| Fallback needed? | No               | Yes (`ABDM-1114` → retry with `aadhaar`) | No                                 |



|                   |                                |
| ----------------- | ------------------------------ |
| **Aspect**        | **Registration**               |
| API calls         | 2 (request-otp + enroll)       |
| `scope`           | `"abha-enrol"`                 |
| `loginHint`       | `"aadhaar"` (only option)      |
| Extra data needed | name, mobile, gender, dob      |
| Retry policy      | **1 max** (not idempotent)     |
| Creates ABHA?     | Yes — returns new `ABHANumber` |


---

## **Error Handling Matrix**


|                                    |                            |                                                               |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------- |
| **Error**                          | **Where**                  | **Response**                                                  |
| Invalid identifier format          | `validate()` middleware    | `400` + field errors                                          |
| OTP cooldown exceeded              | `checkOtpCooldown()`       | `429` + `retryAfter`                                          |
| ABDM 5xx / timeout                 | `withRetry` in service     | Auto-retry (2x), then `500`                                   |
| ABDM 400 (bad OTP)                 | `abdmClient.post()` throws | `400` + ABDM error message                                    |
| `ABDM-1114` (ABHA OTP not allowed) | `abdmClient`               | Catch in `loginService`, retry with `otpSystem: "aadhaar"`    |
| Duplicate ABHA on enroll           | `abdmClient`               | `400` + "ABHA already exists" → frontend offers login instead |
| Multiple ABHAs on mobile           | `loginService.verify()`    | Returns `needsSelection: true` → frontend shows picker        |

