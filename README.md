# BetterLink

BetterLink is a student-employer networking platform focused on connecting university students with local employers for internships and early-career opportunities.

## Quick Start

1. Install prerequisites:
   - [.NET 8 SDK (x64)](https://dotnet.microsoft.com/download/dotnet/8.0)
   - Node.js 18+ (Node 20+ recommended)
   - npm 9+
   - Git 2.40+
2. From the repository root, launch the full demo (backend + mobile + browser):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode android
```

3. To launch backend only:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode none
```

4. Open the API in browser at `http://localhost:5000` and health at `http://localhost:5000/health`.

## Repository Structure

```text
BetterLink/
  backend/       ASP.NET Core API (controllers, data, models, migrations)
  frontend/      Mobile and web frontend workspaces
  database/      SQL reference assets
  docs/          Technical and project documentation
  scripts/       Local automation scripts (demo launch, tests, git hooks)
  deployment/    Deployment and CI/CD related assets
  tests/         Backend automated tests
```

## Core Docs

- `DOCUMENTATION.md`: Documentation map and reading order
- `backend/README.md`: Backend setup and run guide
- `frontend/README.md`: Frontend workspace guide
- `frontend/mobile/README.md`: Mobile app setup and API connectivity
- `docs/API_Endpoints.md`: Current API endpoints by controller
- `docs/api.md`: API usage walkthrough

## Development Commands

From the repository root:

```powershell
# Build backend
dotnet build .\backend\BetterLink.Backend.csproj -c Debug

# Backend sanity tests (no MySQL integration dependency)
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1

# Full backend tests (expects MySQL test instance)
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1

# Full backend tests with Docker-managed MySQL
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests-WithDockerMySql.ps1
```

## Notes

- Development can run in-memory database mode via `backend/appsettings.Development.json`.
- Integration tests that target MySQL expect `127.0.0.1:33306` unless overridden by script/config.
- Mobile Android launch uses `frontend/mobile/scripts/start-android.ps1` under `npm run android`.

## License

MIT License. See `LICENSE`.
