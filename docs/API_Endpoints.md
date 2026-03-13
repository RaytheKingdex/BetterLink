# Stage 1 API Endpoints

This file documents the initial backend methods implemented for Stage 1.

## Authentication

- `POST /api/auth/register/student`
  - Auth: Public
  - Purpose: Register a student account and create student profile.
  - Handler: `backend/Controllers/AuthController.cs` -> `RegisterStudent`

- `POST /api/auth/register/employer`
  - Auth: Public
  - Purpose: Register an employer account and create employer profile.
  - Handler: `backend/Controllers/AuthController.cs` -> `RegisterEmployer`

- `POST /api/auth/login`
  - Auth: Public
  - Purpose: Authenticate user credentials and issue JWT.
  - Handler: `backend/Controllers/AuthController.cs` -> `Login`

## User Profile

- `GET /api/users/me`
  - Auth: JWT (any authenticated role)
  - Purpose: Fetch current signed-in user profile summary.
  - Handler: `backend/Controllers/UsersController.cs` -> `GetMe`

- `PUT /api/users/me`
  - Auth: JWT (any authenticated role)
  - Purpose: Update current signed-in user's first/last name.
  - Handler: `backend/Controllers/UsersController.cs` -> `UpdateMe`

## Jobs

- `GET /api/jobs?title=&page=&pageSize=`
  - Auth: Public
  - Purpose: Browse open jobs with title filter and pagination.
  - Handler: `backend/Controllers/JobsController.cs` -> `GetJobs`

- `GET /api/jobs/{id}`
  - Auth: Public
  - Purpose: Fetch details for a single job by id.
  - Handler: `backend/Controllers/JobsController.cs` -> `GetJobById`

- `POST /api/jobs`
  - Auth: JWT role `Employer`
  - Purpose: Create a new job posting for current employer.
  - Handler: `backend/Controllers/JobsController.cs` -> `CreateJob`

- `POST /api/jobs/{id}/apply`
  - Auth: JWT role `Student`
  - Purpose: Submit an application to an open job.
  - Handler: `backend/Controllers/JobsController.cs` -> `ApplyToJob`

## Applications

- `GET /api/applications/me`
  - Auth: JWT role `Student`
  - Purpose: Retrieve current student's submitted applications.
  - Handler: `backend/Controllers/ApplicationsController.cs` -> `GetMyApplications`

## Communities

- `POST /api/communities`
  - Auth: JWT (authenticated user)
  - Purpose: Create a new community.
  - Handler: `backend/Controllers/CommunitiesController.cs` -> `CreateCommunity`

- `GET /api/communities/{id}`
  - Auth: JWT (authenticated user)
  - Purpose: Get a community summary by id.
  - Handler: `backend/Controllers/CommunitiesController.cs` -> `GetCommunityById`

- `POST /api/communities/{id}/join`
  - Auth: JWT (authenticated user)
  - Purpose: Join an existing community.
  - Handler: `backend/Controllers/CommunitiesController.cs` -> `JoinCommunity`

- `POST /api/communities/{id}/messages`
  - Auth: JWT (community member)
  - Purpose: Post a message to a joined community.
  - Handler: `backend/Controllers/CommunitiesController.cs` -> `CreateMessage`

## Health

- `GET /health`
  - Auth: Public
  - Purpose: Basic API health check.
  - Handler: `backend/Program.cs` mapped endpoint.
  