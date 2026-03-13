# BetterLink Development Roadmap

## 1. Project Assessment

### Strengths
- Clear problem focus: Jamaican graduate underemployment and fragmented hiring channels.
- Strong localization: platform is tailored to Jamaican universities and employers.
- Dual-sided value: students and employers both gain direct workflow benefits.
- Good technical direction: API-first architecture with cloud deployment intent.

### Gaps To Address
- Stack sprawl: avoid mixing too many backend technologies.
- Database ambiguity: use one production-ready relational database strategy.
- Security detail gap: define JWT, password hashing, and role-based access control early.
- Timeline pressure: prioritize a strict MVP before advanced features.

## 2. Recommended Technical Baseline (MVP)

- Backend: ASP.NET Core Web API (C#)
- ORM: Entity Framework Core
- Authentication: JWT + BCrypt password hashing
- Database: MySQL 8 (or SQL Server if required by hosting constraints)
- Web frontend: React
- Mobile frontend: Android client (Java or Kotlin)
- Hosting: Azure App Service + Azure Database
- CI/CD: GitHub Actions

## 3. Architecture Summary

### Layers
- Frontend Layer
	- Web client (React)
	- Mobile client (Android)
- API Layer
	- Auth module
	- User profile module
	- Job and application module
	- Community and messaging module
- Data Layer
	- Relational schema with indexed query paths
	- Strict foreign keys and status tracking
- Platform Layer
	- Azure hosting and environment configuration
	- CI/CD pipeline with build validation

### Core Relationships
- One-to-many: `employers -> jobs`
- One-to-many: `jobs -> applications`
- Many-to-many: `users <-> communities` (via `community_members`)
- One-to-many: `communities -> messages`

## 4. Four-Week Execution Plan

## Phase 1 - Foundation (Week 1)
- Finalize MVP scope and define non-goals.
- Initialize backend project structure and database connection.
- Implement database schema version 1.
- Set up Swagger and local environment configuration.

Deliverables:
- Running API skeleton
- Initial schema script
- Setup documentation

## Phase 2 - Authentication + Profiles (Week 2)
- Implement register/login with JWT.
- Hash and verify passwords using BCrypt.
- Implement role-based authorization (`student`, `employer`, `admin`).
- Build profile CRUD endpoints.

Deliverables:
- Auth endpoints tested in Swagger/Postman
- Role-restricted routes
- Profile management endpoints

## Phase 3 - Jobs + Applications + Communities (Week 3)
- Employer job posting CRUD.
- Student job browse/filter/apply workflows.
- Application status workflow (`submitted`, `reviewing`, `shortlisted`, `rejected`, `accepted`).
- Basic community create/join/message features.

Deliverables:
- End-to-end core use cases
- Structured API contracts
- Seed/test data scripts

## Phase 4 - Hardening + Deployment (Week 4)
- Add input validation and error handling standards.
- Add basic unit tests for authentication and job posting services.
- Configure GitHub Actions build pipeline.
- Deploy backend to Azure App Service and connect managed database.

Deliverables:
- Cloud-hosted MVP backend
- CI/CD workflow file
- Deployment runbook

## 5. Security Baseline Checklist

- Use BCrypt for password hashing (never plaintext).
- Issue JWT access tokens with expiry and issuer/audience validation.
- Enforce authorization by role at endpoint level.
- Validate all request payloads with model validation.
- Use HTTPS only in production.
- Store secrets in environment variables or Azure Key Vault.

## 6. API Build Order

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/users/me`
4. `PUT /api/users/me`
5. `POST /api/jobs`
6. `GET /api/jobs`
7. `POST /api/jobs/{id}/apply`
8. `GET /api/applications/me`
9. `POST /api/communities`
10. `POST /api/communities/{id}/join`
11. `POST /api/communities/{id}/messages`

## 7. Scope Guardrails

- Build backend and web integration first.
- Keep Android integration to essential screens for MVP.
- Defer advanced recommendation AI and gamification until after stable deployment.

## 8. Definition Of Done (MVP)

- Authentication is secure and role-aware.
- Students can browse and apply to jobs.
- Employers can post jobs and review applicants.
- Community membership and messaging are functional.
- API is deployed and reachable over HTTPS.
- Core flows are documented and tested.
