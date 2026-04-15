# API Usage Guide

This guide provides a practical workflow for testing BetterLink API routes.

## Base URL

- Local: `http://localhost:5000`
- Health: `http://localhost:5000/health`

## Authentication Flow

1. Register as student or employer:
   - `POST /api/auth/register/student`
   - `POST /api/auth/register/employer`
2. Log in:
   - `POST /api/auth/login`
3. Copy the returned token and send:

```http
Authorization: Bearer <token>
```

## Suggested Manual Test Sequence

1. `GET /health`
2. Register and log in user
3. `GET /api/users/me`
4. If employer: create job (`POST /api/jobs`)
5. If student: browse jobs (`GET /api/jobs`) and apply (`POST /api/jobs/{id}/apply`)
6. Test social features:
   - `GET /api/feed`
   - `POST /api/feed`
   - `GET /api/messages/conversations`
   - `GET /api/communities`

## References

- Full route list: `docs/API_Endpoints.md`
- Backend setup: `backend/README.md`
