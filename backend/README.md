# Backend Setup (ASP.NET Core)

This folder contains the BetterLink API implementation. The backend is designed as a beginner-friendly, role-based REST API for students, employers, and admins.

## Recommended Stack

- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- MySQL 8 (or SQL Server)
- JWT authentication
- BCrypt password hashing

## Folder Structure

- `Controllers/`: HTTP endpoint controllers
- `Models/`: Entities, DTOs, and request/response models
- `Services/`: Business logic and domain services
- `Program.cs`: Host bootstrap
- `Startup.cs`: Service registration and middleware

## Prerequisites

- .NET SDK 8+
- Visual Studio 2022 or VS Code
- MySQL 8+ (or SQL Server)
- Git

## Initial Setup

1. Move into backend folder:

```bash
cd backend
```

2. If project files are not created yet, scaffold the API project:

```bash
dotnet new webapi -n BetterLink.Backend -f net8.0 --use-controllers
```

3. Add required packages:

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
```

4. Restore and run:

```bash
dotnet restore
dotnet run
```

## Environment Configuration

Create `appsettings.Development.json` values for local use:

```json
{
	"ConnectionStrings": {
		"DefaultConnection": "Server=localhost;Database=betterlink;User=betterlink_user;Password=ChangeMe123!;"
	},
	"Jwt": {
		"Key": "replace-with-a-long-random-secret-key",
		"Issuer": "BetterLink",
		"Audience": "BetterLink.Client"
	}
}
```

Use environment variables or Azure App Service settings for production secrets.

## Security Baseline

- Hash all passwords with BCrypt.
- Use short-lived JWT access tokens.
- Protect endpoints with role-based authorization.
- Validate incoming payloads with model validation attributes.
- Enforce HTTPS in production.

## MVP Endpoint Plan

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/jobs`
- `GET /api/jobs`
- `POST /api/jobs/{id}/apply`
- `GET /api/applications/me`
- `POST /api/communities`
- `POST /api/communities/{id}/join`
- `POST /api/communities/{id}/messages`

## Testing

- Use Swagger UI for manual endpoint checks.
- Use Postman collection for role-based flow tests.
- Add unit tests for:
	- password hashing and login validation
	- JWT generation/validation
	- job posting permissions

## Suggested Development Order

1. Authentication and user profile
2. Job posting and browse/apply flow
3. Employer candidate review
4. Community membership and messaging
5. Deployment hardening
