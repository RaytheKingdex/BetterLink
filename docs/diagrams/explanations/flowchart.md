# Flowchart Explanation

## Purpose
The flowchart gives a process-oriented overview of how a user moves through the BetterLink system from registration to feature usage.

## Flow Covered
- User opens the platform.
- The user decides whether they already have an account.
- If not, the user registers as either a student or employer.
- The user logs in and receives a JWT-authenticated session.
- The system loads available jobs.
- Students continue into job application and application tracking.
- Employers continue into job creation.
- Both can take part in community actions.

## Why This Diagram Matters
A flowchart is useful for showing decision points and branching logic in a simple, reader-friendly way. It is less technical than a sequence or class diagram, making it easy to present to non-developers.

## Mapping To The Codebase
The flow is based on these endpoint groups:
- `backend/Controllers/AuthController.cs`
- `backend/Controllers/JobsController.cs`
- `backend/Controllers/ApplicationsController.cs`
- `backend/Controllers/CommunitiesController.cs`
- `docs/API_Endpoints.md`

## Academic Value
This diagram is effective for showing the main user journey through BetterLink and for explaining the platform's branching behavior at a business-process level.