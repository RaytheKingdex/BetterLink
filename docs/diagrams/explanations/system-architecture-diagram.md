# System Architecture Diagram Explanation

## Purpose
The system architecture diagram presents the major technical building blocks of BetterLink and how they interact at a high level.

## Main Layers
- `Client Layer`: web and mobile frontends
- `API Layer`: ASP.NET Core controllers and request pipeline
- `Application Services`: token generation and startup seeding
- `Data Access`: EF Core `AppDbContext` and ASP.NET Identity
- `Database`: MySQL 8

## How The Architecture Works
1. Users interact with the web or mobile clients.
2. Requests are sent to the ASP.NET Core API.
3. Controllers process the requests.
4. Authentication uses ASP.NET Identity and JWT tokens.
5. Business data is stored and retrieved through Entity Framework Core.
6. Data is persisted in MySQL.
7. Swagger is exposed for API testing during development.

## Mapping To The Codebase
This diagram maps to:
- `backend/Program.cs`
- `backend/Controllers/*.cs`
- `backend/Services/JwtTokenService.cs`
- `backend/Services/Interfaces/IJwtTokenService.cs`
- `backend/Data/AppDbContext.cs`
- `backend/Data/IdentitySeeder.cs`
- `backend/appsettings.json`

## Why This Diagram Matters
It gives a broad view of the technology stack and deployment structure. It helps explain how the presentation layer, API layer, authentication services, and persistence layer are separated.

## Academic Value
This diagram is useful in system design presentations because it summarizes the overall technical organization of BetterLink without getting lost in lower-level implementation details.