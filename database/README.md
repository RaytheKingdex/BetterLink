# Database

Database assets for BetterLink MVP.

## Files

- `schema.sql`: MySQL 8 schema for users, employers, jobs, applications, communities, and messages

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

## Notes

- Schema uses foreign keys and indexes for core query paths.
- For SQL Server adaptation, replace `ENUM` fields with lookup tables or constrained `VARCHAR` columns.
