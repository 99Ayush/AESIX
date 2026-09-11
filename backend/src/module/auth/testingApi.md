# Auth API Testing Guide

Use this guide with Postman while the backend is running.

## Setup

- Base URL: `http://localhost:5000/api/auth`
- Header for every request: `Content-Type: application/json`
- Mock mode is enabled by default. Start the backend with `npm run dev`. Mock ABDM responses are used, but OTP transactions, users, and sessions are stored in MongoDB.
- To use real ABDM and MongoDB instead, set `ABDM_MOCK=false` and ensure `MONGODB_URI` is configured in `.env` or `AESIX-DB.env`.

In Postman, create an environment variable named `baseUrl` with the value `http://localhost:5000/api/auth`. The examples below use `{{baseUrl}}`.

## 1. Request Login OTP

**POST** `{{baseUrl}}/login/request-otp`

Choose one of the following request bodies.

### Aadhaar login

```json
{
  "method": "aadhaar",
  "identifier": "123456789012"
}
```

### Mobile login

```json
{
  "method": "mobile",
  "identifier": "9876543210"
}
```

### ABHA number login

```json
{
  "method": "abha",
  "identifier": "91-1234-5678-9012"
}
```

**Mock response:**

```json
{
  "txnId": "mock-txn-<timestamp>"
}
```

Copy `txnId` into a Postman variable named `txnId`. In the **Tests** tab, use:

```javascript
pm.environment.set("txnId", pm.response.json().txnId);
```

## 2. Verify Login OTP

**POST** `{{baseUrl}}/login/verify`

```json
{
  "method": "aadhaar",
  "txnId": "{{txnId}}",
  "otp": "123456"
}
```

Replace `method` with the same method used in step 1. The mock accepts any six-digit OTP.

**Aadhaar or ABHA mock response:**

```json
{
  "needsSelection": false,
  "profile": {
    "ABHANumber": "91-0000-1111-2222",
    "firstName": "Rahul",
    "lastName": "Sharma"
  },
  "tokens": {
    "token": "mock-x-token",
    "refreshToken": "mock-refresh",
    "expiresIn": 1800
  },
  "userId": "<uuid>"
}
```

**Mobile mock response:**

```json
{
  "needsSelection": true,
  "txnId": "{{txnId}}",
  "abhaProfiles": [
    {
      "abhaNumber": "91-0000-1111-2222",
      "name": "Rahul"
    },
    {
      "abhaNumber": "91-0000-3333-4444",
      "name": "Priya"
    }
  ]
}
```

For Aadhaar and ABHA login, the flow ends here. For mobile login, continue to step 3.

## 3. Select an ABHA Profile (Mobile Only)

**POST** `{{baseUrl}}/login/verify-user`

```json
{
  "txnId": "{{txnId}}",
  "abhaNumber": "91-0000-1111-2222"
}
```

**Mock response:**

```json
{
  "profile": {
    "ABHANumber": "91-0000-1111-2222",
    "firstName": "Rahul",
    "lastName": "Sharma"
  },
  "tokens": {
    "token": "mock-x-token",
    "refreshToken": "mock-refresh",
    "expiresIn": 1800
  },
  "userId": "<uuid>"
}
```

## 4. Request Registration OTP

**POST** `{{baseUrl}}/register/request-otp`

```json
{
  "aadhaar": "234567890123"
}
```

**Mock response:**

```json
{
  "txnId": "mock-txn-<timestamp>"
}
```

Save the returned transaction ID as `txnId` using the same Postman test script from step 1.

## 5. Register an ABHA Profile

**POST** `{{baseUrl}}/register/enroll`

```json
{
  "txnId": "{{txnId}}",
  "aadhaar": "234567890123",
  "otp": "123456",
  "name": "Rahul Sharma",
  "mobile": "9876543210",
  "gender": "MALE",
  "dob": "1990-01-15"
}
```

`gender` accepts `MALE`, `FEMALE`, `OTHER`, or the short forms `M`, `F`, and `O`. The mock accepts any six-digit OTP.

**Mock response:**

```json
{
  "profile": {
    "ABHANumber": "91-9999-8888-7777",
    "firstName": "New",
    "lastName": "User"
  },
  "tokens": {
    "token": "mock-x-token",
    "refreshToken": "mock-refresh",
    "expiresIn": 1800
  },
  "userId": "<uuid>"
}
```

## Validation and Common Errors

| Status | Meaning | Example cause |
| --- | --- | --- |
| `400` | Invalid request body | Aadhaar is not 12 digits, OTP is not 6 digits, or ABHA format is invalid. |
| `400` | Invalid transaction | `txnId` is missing, expired, or was not created by the preceding OTP request. |
| `429` | OTP request cooldown | More than three OTP requests for the same identifier within five minutes. |
| `500` | Service or startup problem | ABDM failure in real mode, or a missing MongoDB connection in non-mock mode. |

## Recommended Mock Test Order

1. Aadhaar request OTP -> Aadhaar verify OTP.
2. Mobile request OTP -> Mobile verify OTP -> Select ABHA profile.
3. Registration request OTP -> Register an ABHA profile.

Use a newly returned `txnId` for every flow.
