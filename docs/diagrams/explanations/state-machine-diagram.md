# State Machine Diagram Explanation

## Purpose
The state machine diagram shows how a job application changes from one status to another over time.

## States Included
- `Submitted`
- `Reviewing`
- `Shortlisted`
- `Accepted`
- `Rejected`

## Transition Logic
- A new application begins in the `Submitted` state when a student applies.
- An employer can move the application into `Reviewing`.
- From `Reviewing`, the application may become `Shortlisted` or `Rejected`.
- From `Shortlisted`, the final result may become `Accepted` or `Rejected`.

## Why This Diagram Matters
The state machine diagram focuses on lifecycle rules. Instead of showing tables or classes, it shows how one important business object evolves during processing.

## Mapping To The Codebase
The current backend creates applications with status `submitted` in:
- `backend/Controllers/JobsController.cs`
- `backend/Models/JobApplication.cs`
- `database/schema.sql`

The later states represent the expected review lifecycle for future or extended employer-side processing.

## Important Note
At the current project stage, only the `submitted` state is actively created in the implemented API. The other states are included because they reflect the intended domain workflow documented by the application status model and schema.

## Academic Value
This diagram is strong for explaining dynamic business behavior and future extensibility in the application review process.