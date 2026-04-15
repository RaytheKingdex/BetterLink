# Database

Database assets and SQL references for BetterLink.

## Files

- `schema.sql`: MySQL 8 schema for users, employers, jobs, applications, communities, and messages

## Important

`schema.sql` is a reference/baseline script for learning and manual database setup.
The running backend schema evolves through Entity Framework migrations in `backend/Migrations/`.
For the API runtime database model, treat EF Core migrations as the source of truth.

## Core Entity Coverage

- `users`: authentication identity and role
- `student_profiles`: student-specific fields
- `employers`: employer organization details
- `jobs`: internship/job postings
- `applications`: student job applications
- `communities`: collaboration groups
- `community_members`: many-to-many membership table
- `messages`: community discussion messages

## Setup

1. Create a MySQL user with create/read/write permissions.
2. Run the schema script:

```sql
SOURCE schema.sql;
```

3. Confirm tables were created:

```sql
SHOW TABLES;
```

## Runtime Schema Workflow

For backend-driven schema updates:

```powershell
dotnet ef database update --project .\backend\BetterLink.Backend.csproj
```

## Notes

- Schema uses foreign keys and indexes for core query paths.
- For SQL Server adaptation, replace `ENUM` fields with lookup tables or constrained `VARCHAR` columns.
