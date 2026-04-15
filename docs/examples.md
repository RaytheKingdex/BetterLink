# Usage Examples

## Register and Login (High Level)

1. `POST /api/auth/register/student`
2. `POST /api/auth/login`
3. Use token for authenticated routes.

## Employer Job Flow

1. Log in as employer
2. `POST /api/jobs`
3. `GET /api/jobs/mine`
4. `GET /api/jobs/{id}/applicants`
5. `PUT /api/jobs/{id}/applicants/{applicationId}/status`

## Student Job Flow

1. Log in as student
2. `GET /api/jobs`
3. `POST /api/jobs/{id}/apply`
4. `GET /api/applications/me`

## Social Flow

1. `GET /api/feed`
2. `POST /api/feed`
3. `POST /api/feed/{id}/like`
4. `POST /api/feed/{id}/comments`

