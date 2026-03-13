# Class Diagram Explanation

## Purpose
The class diagram shows the main software classes and relationships used by the BetterLink backend. It focuses on the domain objects and the main API/service classes that support authentication, jobs, applications, and communities.

## What The Diagram Shows
- `ApplicationUser` is the central identity model used by the system.
- A user may have one `StudentProfile` or one `EmployerProfile`, depending on role.
- An `EmployerProfile` can create many `Job` records.
- A `Job` can receive many `JobApplication` records.
- A student user can submit many job applications, but the database enforces one application per job per student.
- A `Community` contains many `CommunityMember` and `CommunityMessage` records.
- A user can join communities and post messages inside them.
- Controllers depend on the data layer and authentication services to process requests.

## Why These Relationships Matter
This diagram explains the object-oriented design behind the system. It helps show how BetterLink separates user identity, role-specific profile information, employment features, and community features while keeping them connected through clear associations.

## Mapping To The Codebase
The diagram was derived from these backend files:
- `backend/Models/ApplicationUser.cs`
- `backend/Models/StudentProfile.cs`
- `backend/Models/EmployerProfile.cs`
- `backend/Models/Job.cs`
- `backend/Models/JobApplication.cs`
- `backend/Models/Community.cs`
- `backend/Models/CommunityMember.cs`
- `backend/Models/CommunityMessage.cs`
- `backend/Data/AppDbContext.cs`
- `backend/Controllers/*.cs`
- `backend/Services/JwtTokenService.cs`

## Key Design Notes
- The user model is reused across all features through ASP.NET Core Identity.
- Role-specific data is split into separate profile classes rather than storing all fields in one table.
- Community membership is modeled explicitly with `CommunityMember`, which supports role assignment such as `member`.
- The diagram includes service/controller dependencies to show how requests flow from controllers to persistence and token generation.

## Academic Value
This diagram is useful for explaining the static structure of the system. It shows how the application is organized into related classes and how those classes support the platform's major features.