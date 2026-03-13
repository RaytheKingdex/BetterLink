# Stage 1 Learning Reference

This guide lists core topics and infrastructure used in BetterLink Stage 1, with recommended study focus.

## Platform Foundations

- ASP.NET Core Web API (.NET 8)
  - Why used: HTTP API framework for backend services.
  - Learn: routing, middleware pipeline, dependency injection, controllers.

- Entity Framework Core + Pomelo MySQL provider
  - Why used: ORM for mapping C# entities to relational tables.
  - Learn: `DbContext`, `DbSet`, relationships, migrations, indexing.

- ASP.NET Core Identity
  - Why used: secure user lifecycle (password hashing, user/role management).
  - Learn: `UserManager`, `SignInManager`, role assignment, identity stores.

- JWT Bearer Authentication
  - Why used: stateless API authentication for web/mobile clients.
  - Learn: token claims, signing keys, issuer/audience validation, expiry.

## Security Topics

- Password policy and hashing with Identity defaults.
- Role-based authorization (`Student`, `Employer`, `Admin`).
- Input validation via data annotations.
- Secret management through environment variables and secure app settings.

## Data Design Topics

- Core entities:
  - Users, student/employer profiles, jobs, applications, communities, memberships, messages.
- Relationship design:
  - One-to-one: user <-> student/employer profile.
  - One-to-many: employer -> jobs, job -> applications.
  - Many-to-many: users <-> communities through community members.
- Performance basics:
  - Indexing foreign keys and frequent filter columns.
  - Pagination and projection to DTOs.

## Scalability Topics (100k-concurrency readiness)

- Horizontal scaling behind load balancers.
- Read/write patterns and caching strategy (Redis for hot reads).
- Async background processing for notifications and email.
- Application monitoring with structured logs and distributed tracing.

## Delivery Infrastructure

- Git + GitHub Actions CI/CD (`deployment/github-actions.yml`).
- Azure App Service deployment with environment-based configuration.
- Repository hooks and transcript logging for operational traceability.

## Suggested Learning Sequence

1. Build and run API locally.
2. Understand Identity registration/login flow.
3. Trace EF Core query path from controller to database.
4. Add one secured endpoint with role restriction.
5. Add migration and validate generated schema.
6. Add one integration test and one unit test.
