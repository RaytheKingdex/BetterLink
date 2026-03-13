# Activity Diagram Explanation

## Purpose
The activity diagram shows the workflow of actions performed by different BetterLink participants. It is sectioned into swimlanes so each role's activities are clearly separated.

## Swimlanes Used
- `Student`
- `Employer`
- `Admin`
- `BetterLink API`

## What The Diagram Shows
### Student Activities
- Register a student account
- Browse available jobs
- Apply to a job
- Join a community
- Post a message in a community

### Employer Activities
- Register an employer account
- Create a job posting

### Admin Activities
- Monitor platform health
- Oversee role governance and startup readiness

### BetterLink API Activities
- Create users and role-specific profiles
- Assign roles and issue JWT tokens
- Validate requests and permissions
- Persist jobs, applications, and community messages
- Seed startup roles and expose the health endpoint

## Decision Points Included
- Whether a student has already applied to a job
- Whether a user is a valid community member before posting a message

## Why This Diagram Matters
The activity diagram focuses on workflow and responsibility. The swimlane design makes it clear which actions belong to users and which belong to the system.

## Mapping To The Codebase
This diagram is based on:
- `backend/Controllers/AuthController.cs`
- `backend/Controllers/JobsController.cs`
- `backend/Controllers/CommunitiesController.cs`
- `backend/Data/IdentitySeeder.cs`
- `backend/Program.cs`

## Academic Value
This diagram is useful when explaining cross-role interactions and system responsibilities in one visual model. It is especially helpful for demonstrating how the platform supports multiple user types through a coordinated workflow.