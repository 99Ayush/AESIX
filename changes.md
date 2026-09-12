# Changes and verification

## 2026-09-12

### Implemented

- Fast-forwarded the checkout to the current upstream `main` (`7b5d139`).
- Rebuilt `backend/src/app.js` after the merge had combined two incompatible server implementations. The API now creates Express before registering middleware, declares each import once, mounts auth, GenAI, and user routes once, and exposes `GET /api/health`.
- Made backend environment loading independent of the process working directory. Starting from the repository root now loads `backend/.env` and `backend/AESIX-DB.env` correctly.
- Kept the server fail-closed: it does not claim to run unless MongoDB is connected, preventing writes from silently falling back to temporary/static browser state.
- Connected dashboard data, basic-info saves, document list/upload/delete, and consent decisions to the persistent `/api/users` API. Documents are sent as base64 and stored by the configured MongoDB-backed endpoint.
- Updated the frontend API default from port `5001` to the backend's actual default port `5000`.
- Removed `backend/.env` from Git tracking while preserving the local file; replaced the committed example file with a credential-free template.

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
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/users/profile
```

Then use the site to save Basic Info, upload a small non-sensitive test document, reload the page, and confirm both changes remain. Delete the test document afterward.
