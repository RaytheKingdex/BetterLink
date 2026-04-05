# Backend Setup (ASP.NET Core)

This folder contains the BetterLink API implementation. The backend is designed as a beginner-friendly, role-based REST API for students, employers, and admins.

## Recommended Stack

- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core + Pomelo MySQL provider
- ASP.NET Core Identity (user and role management)
- JWT bearer authentication
- Swagger/OpenAPI for endpoint testing

## Folder Structure

- `Controllers/`: HTTP endpoint controllers
- `Data/`: EF Core DbContext and identity seed setup
- `Models/`: Entities, DTOs, and request/response models
- `Services/`: Domain services such as JWT token generation
- `Program.cs`: Host bootstrap, middleware, auth, and Swagger wiring

## Prerequisites

- **.NET 8 SDK (x64)** — download from <https://dotnet.microsoft.com/download/dotnet/8.0>  
  Install the **SDK** package, not just the Runtime.
- Visual Studio 2022 or VS Code
- MySQL 8+ (or SQL Server)
- Git

### MySQL note for local development and tests

- Development mode can run without MySQL when `UseInMemoryDatabase=true` in `appsettings.Development.json`.
- The integration test `RealMySqlApiSmokeTests` requires a reachable MySQL test database at `127.0.0.1:33306`.

> **Windows PATH note:** Windows may ship with a 32-bit (x86) `dotnet` runtime in
> `C:\Program Files (x86)\dotnet\` that contains **no SDK** and appears first in PATH.
> After installing the x64 SDK, verify the right `dotnet` is on your PATH:
>
> ```powershell
> Get-Command dotnet | Select-Object -ExpandProperty Source
> # should show C:\Program Files\dotnet\dotnet.exe
> ```
>
> If it shows the x86 path, prepend the x64 directory for your session:
>
> ```powershell
> $env:PATH = "C:\Program Files\dotnet;" + $env:PATH
> dotnet --version   # should now print 8.x.xxx or higher
> ```
>
> For a permanent fix, open **System Properties → Environment Variables** and move
> `C:\Program Files\dotnet` above `C:\Program Files (x86)\dotnet` in the system PATH.

## Initial Setup

1. Move into the backend folder:

```bash
cd backend
```

1. Restore NuGet dependencies:

```bash
dotnet restore
```

1. Create database and apply migrations:

```bash
dotnet ef migrations add InitialIdentityAndDomain
dotnet ef database update
```

1. Run API:

```bash
dotnet run
```

1. Open Swagger at `https://localhost:<port>/swagger`.

## Environment Configuration

`appsettings.json` and `appsettings.Development.json` are already included. Update:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Secret`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:ExpirationInMinutes`

Use environment variables or Azure App Service settings for production secrets.

## Security Baseline

- Use ASP.NET Core Identity password hashing and validation.
- Use short-lived JWT access tokens.
- Protect endpoints with role-based authorization (`Student`, `Employer`, `Admin`).
- Validate incoming payloads with model validation attributes.
- Enforce HTTPS in production.

## MVP Endpoint Plan

- `POST /api/auth/register/student`
- `POST /api/auth/register/employer`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/jobs`
- `GET /api/jobs/{id}`
- `POST /api/jobs`
- `POST /api/jobs/{id}/apply`
- `GET /api/applications/me`
- `POST /api/communities`
- `POST /api/communities/{id}/join`
- `POST /api/communities/{id}/messages`

## Testing

- Use Swagger UI for manual endpoint checks.
- Use Postman collection for role-based flow tests.
- Add unit tests for:
  - register/login and token issuance
  - role-based authorization
  - job posting ownership rules

## Logging for Documentation

- Enable repo-level git hooks: `../scripts/Enable-GitHooks.ps1`
- Enable global hooks across repositories: `../scripts/Enable-GlobalGitHookLogging.ps1`
- Start a full terminal transcript session: `../scripts/Start-RepoTranscript.ps1`
- Logs are written to `activity-traces/` (repo level) and optionally `$HOME/git-activity-traces` (global).

## Suggested Development Order

1. Authentication and user profile
2. Job posting and browse/apply flow
3. Employer candidate review
4. Community membership and messaging
5. Deployment hardening
