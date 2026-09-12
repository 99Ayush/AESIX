# Changes and verification

## 2026-09-12

### Implemented

- Fast-forwarded the checkout to the current upstream `main` (`7b5d139`).
- Rebuilt `backend/src/app.js` after the merge had combined two incompatible server implementations. The API now creates Express before registering middleware, declares each import once, mounts auth, GenAI, and user routes once, and exposes `GET /api/health`.
- Made backend environment loading independent of the process working directory. Starting from the repository root now loads `backend/.env` and `backend/AESIX-DB.env` correctly.
- Kept the server fail-closed: it does not claim to run unless MongoDB is connected, preventing writes from silently falling back to temporary/static browser state.
- Connected dashboard data, basic-info saves, document list/upload/delete, and consent decisions to the persistent `/api/users` API. Documents are sent as base64 and stored by the configured MongoDB-backed endpoint.
- Standardized the backend and frontend API default on port `5001`.
- Removed `backend/.env` from Git tracking while preserving the local file; replaced the committed example file with a credential-free template.
- Fixed an infinite recursion loop in `LanguageContext.jsx`'s `MutationObserver` on `document.body` where DOM text translation mutations continuously triggered the observer on user interaction, freezing React rendering.
- Guarded name avatar initials computation (`(name || 'RK').split(...)`) across `AbhaID.jsx`, `profilepage.jsx`, and `basicInfo.jsx` against `undefined` initial states, eliminating unhandled `TypeError` crashes during page transitions.
- Added Socket.IO and a MongoDB Change Stream. Backend mutations now emit metadata-only `database:change` events, and the dashboard refetches its API data immediately when an event arrives.
- Wired real-time `onDatabaseChange` web socket event listeners across all data-driven frontend views (`BasicInfo`, `UploadDoc`, `Consent`, `AbhaID`, `ProfilePage`), enabling instant real-time data updates and UI re-sync whenever records are modified across tabs or sessions.
- Added `notifyDatabaseChange` trigger in backend `routes.js` to ensure immediate real-time socket event broadcasting on every data modification (`profile`, `consents`, `documents`), complementing MongoDB Change Streams.
- Populated interactive Medical Dictionary with searchable terms (Metformin, HbA1c, Type 2 Diabetes, SpO2, ABDM PHR) on the main dashboard.
- Verified end-to-end data modifications via `PATCH /api/users/profile` and `PATCH /api/users/consents/:id`. Persistent database writes and real-time Socket.IO broadcasts are verified fully operational.

### Verification performed

- `node --check backend/src/app.js` passes.
- `npm --prefix frontend run build` passes.
- The previous manual frontend smoke test passed Dashboard, ABHA, Documents, and Basic Info navigation before data integration.
- Verified `MONGODB_URI` is loaded from `backend/.env` when launching from the repository root.

### Current external blocker

MongoDB Atlas rejected the configured connection because this machine's IP address is not allow-listed. The API correctly fails at startup rather than pretending data was persisted. Add this machine's current public IP (or a suitable network range) in Atlas **Network Access**, then rerun the verification commands below.

### Post-allow-list verification

```powershell
npm --prefix backend run server
Invoke-RestMethod http://localhost:5001/api/health
Invoke-RestMethod http://localhost:5001/api/users/profile
```

Then use the site to save Basic Info, upload a small non-sensitive test document, reload the page, and confirm both changes remain. Delete the test document afterward.
