# Sequence Diagram Explanation

## Purpose
The sequence diagram models the time-ordered interaction involved when a student logs in and applies for a job. It shows how actors and backend components collaborate step by step.

## Main Participants
- `Student`
- `AuthController`
- `UserManager/SignInManager`
- `JwtTokenService`
- `JobsController`
- `MySQL via AppDbContext`

## Interaction Summary
1. The student submits login credentials.
2. `AuthController` checks the email and password through ASP.NET Identity.
3. If authentication succeeds, `JwtTokenService` creates a JWT token.
4. The student uses the token to call the apply endpoint.
5. `JobsController` checks that the user has the `Student` role.
6. The controller confirms that the selected job exists and is open.
7. The controller checks whether the student already applied.
8. If not, a new `JobApplication` record is created and saved.
9. The system returns a success response.

## Why This Flow Matters
This diagram explains runtime behavior rather than structure. It shows the order in which security, validation, and persistence operations happen during one important use case.

## Mapping To The Codebase
The diagram is based on:
- `backend/Controllers/AuthController.cs`
- `backend/Controllers/JobsController.cs`
- `backend/Services/JwtTokenService.cs`
- `backend/Data/AppDbContext.cs`

## Important Observations
- The login and application steps are connected through JWT authentication.
- Validation happens before data is written.
- Duplicate applications are blocked before insertion.
- The diagram demonstrates role-aware API behavior.

## Academic Value
This diagram is useful for explaining how multiple components cooperate over time to complete a real user action in the system.