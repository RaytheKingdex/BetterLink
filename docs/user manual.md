# BetterLink User Manual

This manual explains how to operate, test, and troubleshoot the BetterLink applications in this repository.
It is written for team members, testers, and demo operators who need practical, step-by-step guidance.

## 1. What Is In This Repository

BetterLink is a dual-sided platform that connects students and employers.
The repository currently contains:

- Backend API (`backend/`) built with ASP.NET Core + Entity Framework Core + Identity + JWT
- Mobile app (`frontend/mobile/`) built with React Native (Expo)
- Web folder (`frontend/web/`) with static pages and assets
- Test project (`tests/BetterLink.Backend.Tests/`) for backend validation
- Scripts (`scripts/`) for fast local testing and Docker-backed integration testing

## 2. Feature Status (Implemented vs Pending)

## Implemented (Backend/API)

Authentication and Identity:
- Student registration (`POST /api/auth/register/student`)
- Employer registration (`POST /api/auth/register/employer`)
- Login and JWT issuing (`POST /api/auth/login`)
- Role-aware access controls (Student, Employer, Admin)

User Profiles:
- Get my profile (`GET /api/users/me`)
- Update my profile (`PUT /api/users/me`)
- Public profile view by user id (`GET /api/users/{id}`)
- Delete own account (`DELETE /api/users/me`)
- Get user posts (`GET /api/users/{id}/posts`)

Jobs and Applications:
- Browse jobs (`GET /api/jobs`)
- Get one job (`GET /api/jobs/{id}`)
- Employer creates job (`POST /api/jobs`)
- Employer updates job (`PUT /api/jobs/{id}`)
- Employer deletes job (`DELETE /api/jobs/{id}`)
- Employer views own job posts (`GET /api/jobs/mine`)
- Student applies to job (`POST /api/jobs/{id}/apply`)
- Student views own applications (`GET /api/applications/me`)
- Employer views applicants (`GET /api/jobs/{id}/applicants`)
- Employer updates application status (`PUT /api/jobs/{id}/applicants/{applicationId}/status`)

Communities:
- List communities (`GET /api/communities`)
- Create community (`POST /api/communities`)
- View one community (`GET /api/communities/{id}`)
- Delete community (`DELETE /api/communities/{id}`)
- Join community (`POST /api/communities/{id}/join`)
- Post community message (`POST /api/communities/{id}/messages`)
- Delete community message (`DELETE /api/communities/{id}/messages/{msgId}`)

Feed and Social:
- List feed posts (`GET /api/feed`)
- Create feed post (`POST /api/feed`)
- Delete feed post (`DELETE /api/feed/{id}`)
- List comments (`GET /api/feed/{id}/comments`)
- Add comment (`POST /api/feed/{id}/comments`)
- Delete comment (`DELETE /api/feed/{id}/comments/{commentId}`)
- Toggle like (`POST /api/feed/{id}/like`)

Follows and Search:
- List following (`GET /api/follows/following`)
- List followers (`GET /api/follows/followers`)
- Follow user (`POST /api/follows/{userId}`)
- Unfollow user (`DELETE /api/follows/{userId}`)
- Follow user search (`GET /api/follows/search`)
- Student search (`GET /api/search/students`)
- Employer search (`GET /api/search/employers`)

Direct Messaging:
- List conversations (`GET /api/messages/conversations`)
- Get conversation with user (`GET /api/messages/{userId}`)
- Send direct message (`POST /api/messages/{userId}`)

System:
- Health check endpoint (`GET /health`)
- Development role and sample data seeding

## Implemented (Mobile App)

- Authentication screens for login, student registration, employer registration
- Role-based navigation (Student/Employer tab layouts)
- Student flow for job browsing, job details, apply, and applications list
- Employer flow for posting jobs
- Shared profile and community screens
- Secure token storage using `expo-secure-store`

## Implemented (Web Folder)

- Fully server-rendered web app is available through ASP.NET Core MVC views in `backend/Views/`
- Server-side routes are available for Home, Login/Register, Jobs, Communities, and Profile flows
- Browser-side API helper patterns in `frontend/web/` still exist for static-page compatibility

## Pending / Not Yet Implemented (Repository-Level)

The following are either partially implemented, not wired end-to-end, or listed as deferred in project planning:

- Fully integrated production-grade web app (current web area is static-page oriented)
- Full parity between mobile app features and all newer backend endpoints (feed, follows, advanced messaging paths)
- Advanced recommendation features and gamification (explicitly deferred by roadmap guardrails)
- Complete cloud hardening and production runbook finalization (ongoing as deployment docs evolve)
- Expanded automated tests for all new social endpoints and edge-case authorization paths

## 3. How To Operate The Apps

## 3.1 Backend API (Local Development)

From repository root:

```powershell
cd backend
dotnet restore
dotnet run
```

Expected behavior:
- API launches locally
- Swagger opens (Development environment)
- `GET /health` returns status payload

Notes:
- Development can run with in-memory DB (`UseInMemoryDatabase=true` in `appsettings.Development.json`)
- For MySQL-backed behavior, set `UseInMemoryDatabase=false` and configure `ConnectionStrings:DefaultConnection`

## 3.2 Mobile App (Expo)

From repository root:

```powershell
cd frontend/mobile
npm install
npm start
```

For Android flow:

```powershell
npm run android
```

Important API URL configuration:
- Update `frontend/mobile/src/api/client.js` base URL
- Emulator typically uses `http://10.0.2.2:5000`
- Physical device uses `http://<LAN-IP>:5000`

## 3.3 Server-Rendered Web App (Recommended)

Run the backend and open the backend URL (for example `http://localhost:5000/`).
The MVC app now renders pages on the server and handles auth/forms via server-side routes.

## 3.4 Static Web Pages (Legacy/Compatibility)

Static pages remain in `frontend/web/` for compatibility and quick visual checks.
Open `frontend/web/Home.html` directly only when validating the legacy static flow.

## 4. Testing Guide

## 4.1 Fast Backend Sanity Test (No MySQL Integration)

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1
```

What it does:
- Runs backend tests while excluding MySQL integration category
- Best for quick regressions during active development

## 4.2 Full Backend Test Suite (Includes MySQL Integration)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1
```

Use this when:
- You are validating merge readiness
- You changed persistence, EF models, migrations, or role-sensitive routes

## 4.3 Full Backend Tests Using Docker MySQL (Recommended for consistency)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests-WithDockerMySql.ps1
```

What the script handles:
- Starts MySQL test container via `deployment/docker-compose.test-mysql.yml`
- Waits for DB health
- Runs full test suite
- Tears container down unless `-KeepContainer` is passed

## 4.4 Direct dotnet test commands (alternate)

```powershell
dotnet test .\tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj -c Debug --filter "Category!=MySqlIntegration"
dotnet test .\tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj -c Debug
```

## 4.5 Manual API Testing With Swagger

1. Run backend.
2. Open `/swagger` in browser.
3. Register student and employer accounts.
4. Login and copy JWT.
5. Authorize Swagger using `Bearer <token>`.
6. Verify role-restricted actions:
   - Employer can create jobs
   - Student can apply
   - Community and feed actions require authentication

Optional quick local demo account:
- Email: `student.demo@betterlink.local`
- Password: `Password1`

## 5. Troubleshooting Guide

## Backend startup issues

Problem: `dotnet` exists but SDK commands fail.
- Cause: PATH resolves to x86 `dotnet` runtime first.
- Fix:

```powershell
Get-Command dotnet | Select-Object -ExpandProperty Source
$env:PATH = "C:\Program Files\dotnet;" + $env:PATH
dotnet --version
```

Problem: API returns 500 on boot due to DB settings.
- Cause: invalid connection string or MySQL unavailable.
- Fix:
1. For immediate development, set `UseInMemoryDatabase=true`.
2. For MySQL mode, verify DB host/port/user/password and server status.

Problem: JWT auth fails with 401/403 unexpectedly.
- Cause: token missing, malformed, expired, wrong issuer/audience, or role mismatch.
- Fix:
1. Re-login to issue fresh token.
2. Pass `Authorization: Bearer <token>` exactly.
3. Confirm route role requirements before retesting.

## Test failures

Problem: MySQL integration test fails locally.
- Cause: expected test DB is not reachable on configured host/port.
- Fix options:
1. Use Docker script: `Run-BackendAllTests-WithDockerMySql.ps1`.
2. Or start local MySQL and confirm endpoint availability.

Problem: Docker test script cannot find Docker.
- Cause: Docker not installed or not on PATH.
- Fix:
1. Install Docker Desktop.
2. Reopen terminal.
3. Verify with `docker --version`.

Problem: Docker container never becomes healthy.
- Cause: port conflict, stale container, or machine resource pressure.
- Fix:
1. Run `docker compose -f .\deployment\docker-compose.test-mysql.yml down`.
2. Retry script.
3. Check Docker Desktop logs for MySQL boot errors.

Problem: posting community messages returns 415 UnsupportedMediaType.
- Cause: endpoint expects `multipart/form-data` instead of JSON body.
- Fix:
1. Send request as `multipart/form-data`.
2. For automated tests, use multipart content instead of raw JSON payload.

## Mobile app issues

Problem: Mobile app cannot reach backend API.
- Cause: wrong base URL for current runtime target.
- Fix:
1. Emulator: use `10.0.2.2`.
2. Physical device: use machine LAN IP and same network.
3. Ensure backend is running and firewall allows inbound traffic.

Problem: Expo starts but Android app fails to launch.
- Cause: Android SDK/adb path issue or emulator not ready.
- Fix:
1. Start emulator first.
2. Run `npm run android` (script includes Windows adb path handling).
3. Confirm `adb devices` returns at least one target.

## Server-rendered web app issues

Problem: Web app redirects unexpectedly to login for form actions.
- Cause: not authenticated (cookie session missing/expired).
- Fix:
1. Login at `/account/login`.
2. Retry the protected route (job posting, profile update, community create/join).

Problem: API requests with Bearer token fail after MVC changes.
- Cause: malformed/missing Authorization header in API client.
- Fix:
1. Ensure API clients still send `Authorization: Bearer <token>`.
2. Validate with Swagger that JWT flow remains active under `/api/*`.

## Community and role flow issues

Problem: User cannot post in a community.
- Cause: user has not joined the community yet.
- Fix: call join endpoint first, then retry post message.

Problem: Student can access employer route or vice versa during testing confusion.
- Cause: reused stale token from another role account.
- Fix: sign out, login with intended role, and re-authorize client.

## 6. Recommended Team Operating Procedure

1. Pull latest changes.
2. Run backend sanity tests.
3. Run backend and verify `/health`.
4. Test the affected flow in Swagger and/or mobile app.
5. For release readiness, run full test suite (prefer Docker MySQL profile).
6. Document any failure pattern in `activity-traces/` and open an issue with reproduction steps.

## 7. Quick Command Reference

```powershell
# Backend run
cd backend
dotnet run

# Backend sanity tests
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1

# Full backend tests
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1

# Full tests with Docker MySQL
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests-WithDockerMySql.ps1

# Mobile start
cd frontend/mobile
npm install
npm start
```

## 8. Final Notes

The backend implementation has moved beyond Stage 1 and includes social/feed/messaging features that are newer than some older documentation pages.
When in doubt, treat controller routes and tests as source of truth and update docs immediately after feature merges.
