# Backend (ASP.NET Core)

This folder contains the BetterLink backend API.

## Stack

- .NET 8 Web API
- Entity Framework Core
- ASP.NET Core Identity
- JWT + Identity cookie smart-authentication policy
- Swagger in the Development environment

## Run Locally

From the repository root:

```powershell
dotnet run --project .\backend\BetterLink.Backend.csproj
```

Or from this folder:

```powershell
dotnet run
```

Default local URL is typically `http://localhost:5000`.

## Environment and Data Mode

- In Development, you can use in-memory persistence by setting `UseInMemoryDatabase=true` in `appsettings.Development.json`.
- For MySQL-backed runs, configure `ConnectionStrings:DefaultConnection`.

Required settings:

- `Jwt:Secret`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:ExpirationInMinutes`

## Key Endpoints

- `GET /health`
- `POST /api/auth/register/student`
- `POST /api/auth/register/employer`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/jobs`
- `GET /api/feed`

See `../docs/API_Endpoints.md` for the complete endpoint list.

## Tests

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests.ps1
```

## Windows PATH Note

If `dotnet` resolves to `C:\Program Files (x86)\dotnet\dotnet.exe`, update PATH so
`C:\Program Files\dotnet\dotnet.exe` comes first.
