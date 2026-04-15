# BetterLink

BetterLink is a dual-sided platform connecting Jamaican university students with local employers. This repository is organized by project function to support collaborative development.

## Repository Structure

```text
/BETTERLINK
|
+-- /docs
|   +-- Project_Proposal.md
|   +-- Development_Roadmap.md
|   +-- Architecture_Diagram.png
|
+-- /backend
|   +-- BetterLink.Backend.csproj
|   +-- Controllers/
|   +-- Data/
|   +-- Models/
|   +-- Services/
|   +-- Program.cs
|   +-- appsettings.json
|   +-- README.md
|
+-- /database
|   +-- schema.sql
|   +-- README.md
|
+-- /deployment
|   +-- azure-config.md
|   +-- github-actions.yml
|
+-- /.githooks
|   +-- post-commit
|   +-- post-merge
|   +-- log-git-event.ps1
|
+-- /scripts
|   +-- Enable-GitHooks.ps1
|   +-- Enable-GlobalGitHookLogging.ps1
|   +-- Start-RepoTranscript.ps1
|
+-- /activity-traces
|
+-- /docs
|   +-- API_Endpoints.md
|   +-- Stage1_Learning_Reference.md
|
+-- /frontend
|   +-- /web
|   +-- /mobile
|   +-- README.md
|
+-- README.md
```

## Folder Purpose

- `docs/`: Project proposal, roadmap, and architecture assets
- `backend/`: ASP.NET Core API source and backend architecture layers
- `frontend/`: Web and mobile client applications
- `database/`: Schema and database setup artifacts
- `deployment/`: Cloud deployment and CI/CD configuration files

## System Requirements

The project is split into backend API, static web pages, and an Expo mobile app.

### Required for all contributors

- Windows 10/11, macOS, or Linux
- Git 2.40+

### Required for backend work

- .NET SDK 8.0+ (x64)
- ASP.NET Core runtime 8.0+ (installed with the SDK)

### Required for mobile work

- Node.js 18+ (Node 20+ recommended)
- npm 9+
- Expo SDK-compatible toolchain (project uses Expo SDK 51)

### Required for Android emulator/device testing (mobile)

- Android Studio (latest stable)
- Android SDK Platform Tools (adb available on PATH)
- Java 11+ (Temurin/OpenJDK is fine)

### Database dependencies

- MySQL 8+ is required for production-like persistence and schema work
- MySQL is optional for day-to-day API development if running in Development mode with in-memory DB
- One integration test (`RealMySqlApiSmokeTests`) expects a MySQL test instance at `127.0.0.1:33306`

## Sanity Testing

From the repository root:

1. Backend build

```powershell
dotnet build .\backend\BetterLink.Backend.csproj -c Debug
```

2. Backend tests (standard local sanity profile)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1
```

3. Backend tests including MySQL integration

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1
```

4. Full backend tests using Docker MySQL (easier setup)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests-WithDockerMySql.ps1
```

5. Equivalent direct `dotnet test` commands

```powershell
dotnet test .\tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj -c Debug --filter "FullyQualifiedName!~RealMySqlApiSmokeTests"
dotnet test .\tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj -c Debug
```

6. Mobile configuration sanity check

```powershell
Set-Location .\frontend\mobile
npx expo config --type public
```

## Docker Test Profile

To run MySQL integration tests without installing/configuring local MySQL manually, use Docker Compose:

1. Start MySQL test service:

```powershell
docker compose -f .\deployment\docker-compose.test-mysql.yml up -d
```

2. Run full backend tests:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1
```

3. Stop the test service:

```powershell
docker compose -f .\deployment\docker-compose.test-mysql.yml down
```

## Quick Start

1. Clone the repository.
2. Review `docs/Project_Proposal.md` and `docs/Development_Roadmap.md`.
3. Install prerequisites:
   - **[.NET 8 SDK (x64)](https://dotnet.microsoft.com/download/dotnet/8.0)** — SDK package, not just Runtime
   - **[MySQL 8+](https://dev.mysql.com/downloads/mysql/)**
   - **[Git](https://git-scm.com/)**
4. Configure and run the backend — see `backend/README.md` for full setup steps including a Windows PATH fix if `dotnet` resolves to the 32-bit install.
5. Enable repository hook logs with `scripts/Enable-GitHooks.ps1`.
6. Optionally enable cross-repository hooks with `scripts/Enable-GlobalGitHookLogging.ps1`.
7. Start a terminal transcript session with `scripts/Start-RepoTranscript.ps1` when documenting implementation sessions.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
