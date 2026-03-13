# Use Case Diagram Explanation

## Purpose
The use case diagram shows the main functional services BetterLink provides to its actors. It captures what each role can do from the outside of the system.

## Actors In The Diagram
- `Student`
- `Employer`
- `Admin`

## Main Use Cases
### Student
- Register a student account
- Log in
- View and update profile
- Browse jobs
- View job details
- Apply to jobs
- View submitted applications
- Create or join communities
- Post community messages

### Employer
- Register an employer account
- Log in
- View and update profile
- Browse jobs
- View job details
- Create job postings
- Create or join communities
- Post community messages

### Admin
- Seed and manage platform roles during startup or governance tasks

## Why This Diagram Matters
This diagram provides a high-level functional view of the system. It helps readers quickly understand what each type of user can do without needing to read implementation code.

## Mapping To The Codebase
The use cases correspond mainly to endpoints defined in:
- `docs/API_Endpoints.md`
- `backend/Controllers/AuthController.cs`
- `backend/Controllers/UsersController.cs`
- `backend/Controllers/JobsController.cs`
- `backend/Controllers/ApplicationsController.cs`
- `backend/Controllers/CommunitiesController.cs`
- `backend/Data/IdentitySeeder.cs`

## Academic Value
The use case diagram is suitable for requirements analysis because it connects user roles directly to the functions provided by the BetterLink platform.