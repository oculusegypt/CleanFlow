---
name: API development without frontend build
description: The API service may run independently while Vite serves the frontend, so its SPA fallback must tolerate a missing frontend dist.
---

The API service is intentionally able to run without a built frontend because local development serves the React app from Vite. The server should only register its static SPA fallback when `dist/public/index.html` exists.

**Why:** Registering `sendFile` against a missing frontend build caused noisy ENOENT startup behavior and transient proxy failures while the API was restarting.

**How to apply:** Keep API routing independent from frontend build output; build the frontend only when preparing a bundled production/Hostinger archive.