# ERD Explanation

## Purpose
The Entity Relationship Diagram shows the database structure of BetterLink. It represents the tables, their keys, and the cardinality between them using crow's foot notation.

## What The Diagram Shows
- `users` stores the core user account data.
- `student_profiles` extends a user with student-specific details.
- `employers` extends a user with employer-specific details.
- `jobs` stores vacancies created by employers.
- `applications` stores student submissions to jobs.
- `communities` stores communities created by users.
- `community_members` stores which users belong to which communities.
- `messages` stores messages sent inside communities.

## Relationship Meaning
- One user can have zero or one student profile.
- One user can have zero or one employer profile.
- One employer can create many jobs.
- One job can receive many applications.
- One user can submit many applications.
- One community can have many members and many messages.
- One user can join many communities and send many community messages.

## Important Constraints
- `student_profiles.user_id` is unique, so each student profile belongs to only one user.
- `employers.user_id` is unique, so each employer profile belongs to only one user.
- `applications` has a unique constraint on `(job_id, student_user_id)` to prevent duplicate applications.
- `community_members` has a unique constraint on `(community_id, user_id)` to prevent duplicate memberships.

## Mapping To The Codebase
The ERD reflects the schema defined in:
- `database/schema.sql`
- `backend/Data/AppDbContext.cs`

## Why This Diagram Is Important
This diagram explains the logical database design of the platform. It helps demonstrate that BetterLink is normalized into separate tables for identity, profiles, jobs, applications, and community interactions.

## Academic Value
The ERD is especially useful in database-focused discussions because it shows data integrity, primary and foreign keys, one-to-one links, and one-to-many links in a clear and formal way.