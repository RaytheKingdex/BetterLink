# BetterLink 5-Minute Backup Demo Plan

Use this plan when the emulator fails, network is unstable, or setup time is limited. This path demonstrates product value using backend + browser only.

## Goal

Deliver a complete, credible demo narrative in 5 minutes without depending on Android emulator startup.

## Pre-Class Setup Checklist (2-3 minutes before presenting)

1. Run the backend:
   - From repository root: `cd backend`
   - `dotnet run`
2. Open browser at `http://localhost:5000`.
3. Keep one terminal tab visible for `/health` proof.
4. Keep demo credentials ready:
   - Email: `student.demo@betterlink.local`
   - Password: `Password1`

## Minute-by-Minute Script

### Minute 0:00-0:40 - Open and context

Say:
"This is BetterLink, a platform that connects Jamaican university students with local employers through one structured workflow."

"In this backup demo, we will prove the full value path quickly using the live backend and web interface."

### Minute 0:40-1:10 - Reliability proof

Action:

- Show terminal and run or reference `GET /health` success.

Say:
"First, we verify service health. The backend is live, which means all role-based workflows are active."

### Minute 1:10-2:20 - Student flow proof

Action:

- Log in as student.
- Open jobs list.
- Open one job detail.

Say:
"From the student side, the core flow is discover opportunities and apply in a structured way."

"Here we can browse active jobs and view role-specific details before applying."

### Minute 2:20-3:30 - Employer flow proof

Action:

- Switch to employer account (or explain pre-recorded state if session switch is slow).
- Show create job screen and existing post/applicant-oriented view.

Say:
"From the employer side, the flow is create postings, review incoming applicants, and manage recruitment with clearer visibility."

"This demonstrates dual-sided value on one platform, not separate disconnected tools."

### Minute 3:30-4:20 - Architecture and consistency message

Say:
"Both client experiences are powered by one backend API and shared role-based rules, which improves consistency, maintainability, and testing."

"For development demos, we use a startup sequence that launches backend and browser first, then mobile when available."

### Minute 4:20-5:00 - Close and transition to Q and A

Say:
"In summary, BetterLink addresses a real local problem with a practical, testable platform that supports students and employers end-to-end."

"If needed, we can continue with mobile flow once the emulator is ready, but the core workflow and value are already demonstrated."

## Failure Branches and What to Say

### If emulator fails

Say:
"We are continuing with the web client first because it is connected to the same backend endpoints as mobile, so the business workflow is still fully valid."

### If backend fails to start on port 5000

Action:

- Start backend on alternate port (example 5050).
- Open the alternate URL.

Say:
"We switched to an alternate local port due to a conflict, but the same API and web flow remain unchanged."

### If internet drops

Say:
"This demo is running locally, so the core workflow remains available even if internet connectivity is unstable."

## Optional Rapid Evidence Add-ons (if 30-45 extra seconds available)

1. Show one protected route behavior to reinforce role security.
2. Show one application tracking view.
3. Show one community or feed screen to emphasize platform depth.

## Presenter Rule

Keep movement continuous. If any screen stalls for more than 8 seconds, narrate the next expected result and move to the next prepared tab.
