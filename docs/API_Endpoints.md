# API Endpoints

This document reflects the current backend routes in `backend/Controllers/`.

## Public Endpoints

### Health

- `GET /health`

### Authentication

- `POST /api/auth/register/student`
- `POST /api/auth/register/employer`
- `POST /api/auth/login`

### Jobs (public browse)

- `GET /api/jobs?title=&page=&pageSize=`
- `GET /api/jobs/{id}`

## Authenticated Endpoints

All routes below require authenticated user context.

### Users

- `GET /api/users/{id}`
- `GET /api/users/{id}/posts?page=&pageSize=`
- `GET /api/users/me`
- `PUT /api/users/me`
- `DELETE /api/users/me`

### Feed

- `GET /api/feed?page=&pageSize=`
- `POST /api/feed` (multipart form: `content`, optional `media[]`)
- `DELETE /api/feed/{id}`
- `GET /api/feed/{id}/comments`
- `POST /api/feed/{id}/comments`
- `DELETE /api/feed/{id}/comments/{commentId}`
- `POST /api/feed/{id}/like` (toggle)

### Communities

- `GET /api/communities?take=`
- `POST /api/communities`
- `GET /api/communities/{id}`
- `DELETE /api/communities/{id}` (creator only)
- `POST /api/communities/{id}/join`
- `POST /api/communities/{id}/messages` (multipart form: `body`, optional `attachment`)
- `DELETE /api/communities/{id}/messages/{msgId}`

### Messages (direct messages)

- `GET /api/messages/conversations`
- `GET /api/messages/{userId}?page=&pageSize=`
- `POST /api/messages/{userId}`

### Follows

- `GET /api/follows/following`
- `GET /api/follows/followers`
- `GET /api/follows/search?q=`
- `POST /api/follows/{userId}`
- `DELETE /api/follows/{userId}`

## Role-Specific Endpoints

### Student

- `POST /api/jobs/{id}/apply`
- `GET /api/applications/me`
- `GET /api/search/employers?q=`

### Employer

- `POST /api/jobs`
- `GET /api/jobs/mine`
- `PUT /api/jobs/{id}`
- `DELETE /api/jobs/{id}`
- `GET /api/jobs/{id}/applicants?sortBy=`
- `PUT /api/jobs/{id}/applicants/{applicationId}/status`
- `GET /api/search/students?q=`

## Notes

- Swagger is enabled in Development environment.
- Authentication policy supports JWT bearer tokens and Identity cookies.
- For request/response DTO details, inspect `backend/Models/DTOs/` and Swagger schema output.
  