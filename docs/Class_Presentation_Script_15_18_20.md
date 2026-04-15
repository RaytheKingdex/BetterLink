# BetterLink Class Presentation Script (15, 18, and 20 Minutes)

Use this as a read-aloud presenter script. The 15-minute flow is the default. To extend to 18 or 20 minutes, use the extension lines under each slide.

## Demo Notes

- Primary demo URL: <http://localhost:5000>
- Demo student account: <student.demo@betterlink.local>
- Demo password: Password1
- If mobile is delayed, continue with web demo first.

## Slide 1 (0:00-1:00)

- Slide title: BetterLink - Connecting Jamaican Students and Employers
- Exact speaking lines:
  1. "Good [morning/afternoon], everyone. We are Team BetterLink, and today we are presenting a platform designed to connect Jamaican university students with local employers in one focused ecosystem."
  2. "Our project addresses a practical gap: students struggle to find relevant opportunities, and employers struggle to find qualified local candidates quickly."
  3. "In this presentation, we will show the problem, our solution, the architecture, a live demo, and what comes next."
- Add for 18 minutes:
  1. "As you listen, focus on one key idea: this is not just a job board, it is a role-based workflow platform with community interaction, application tracking, and cross-client access."
- Add for 20 minutes:
  1. "We also built this with classroom and real-world reliability in mind, including a startup flow that lets us launch backend, web, and mobile quickly for demonstrations."

## Slide 2 (1:00-2:30)

- Slide title: The Problem We Are Solving
- Exact speaking lines:
  1. "Students often rely on fragmented channels like informal referrals, isolated career offices, and broad global platforms that are not optimized for Jamaica's context."
  2. "At the same time, employers need a faster way to discover student talent with visible skills, profile details, and structured application history."
  3. "This creates friction on both sides, and that is the gap BetterLink is designed to reduce."
- Add for 18 minutes:
  1. "Our proposal research highlighted a repeated pattern: access is not always equal, and opportunities are often discovered late."
- Add for 20 minutes:
  1. "So our guiding question became: how do we build one platform where discovery, application, and communication happen in one flow instead of across disconnected systems?"

## Slide 3 (2:30-4:00)

- Slide title: What BetterLink Provides
- Exact speaking lines:
  1. "BetterLink is a dual-sided platform for students and employers."
  2. "Students can register, build profiles, browse jobs, apply, track applications, and join communities."
  3. "Employers can register, post jobs, review candidates, and communicate in a structured workflow."
  4. "The platform includes web and mobile clients backed by a centralized API."
- Add for 18 minutes:
  1. "The value of this model is consistency: both client apps call the same backend rules, so behavior stays aligned across web and mobile experiences."
- Add for 20 minutes:
  1. "This API-first approach also gives us a clear path for future integrations, such as analytics dashboards, institutional portals, and expanded services."

## Slide 4 (4:00-5:30)

- Slide title: Core Functional Features
- Exact speaking lines:
  1. "Our implemented core features include role-based authentication, profile management, jobs and applications, communities and messaging, and social feed functionality."
  2. "On the student side, the core flow is discover, apply, and track."
  3. "On the employer side, the core flow is post, review, and respond."
  4. "This feature set supports an end-to-end minimum viable platform, not just isolated pages."
- Add for 18 minutes:
  1. "We also enforce role-aware access at the API layer, which prevents cross-role misuse and keeps behavior consistent with business rules."
- Add for 20 minutes:
  1. "A key implementation detail is that protected routes require valid authentication context, which strengthens trust and correctness during real usage."

## Slide 5 (5:30-7:00)

- Slide title: Architecture and Stack
- Exact speaking lines:
  1. "Our backend is built with ASP.NET Core and Entity Framework Core, with identity and JWT-based authentication."
  2. "For development reliability, we can run with an in-memory database mode, and for production-like behavior we support relational persistence."
  3. "The web and mobile clients both communicate with the backend API, keeping logic centralized and maintainable."
  4. "This architecture supports modular growth as the project evolves."
- Add for 18 minutes:
  1. "The same architecture also improves testing, because we validate core logic from a single API surface instead of duplicating business rules in multiple clients."
- Add for 20 minutes:
  1. "From an operations perspective, this also simplifies demonstrations: starting the backend gives us API and web access immediately, then mobile is layered on top."

## Slide 6 (7:00-8:00)

- Slide title: Security Baseline
- Exact speaking lines:
  1. "We implemented role-aware authorization and protected endpoints so only appropriate users can perform sensitive actions."
  2. "Authentication is token-based for API flows, and the project follows secure handling patterns for identity and request validation."
  3. "In short, we designed the MVP to be functional and security-conscious from the start."
- Add for 18 minutes:
  1. "This matters because trust is central when handling profile data, applications, and employer interactions."
- Add for 20 minutes:
  1. "Our next hardening steps include expanded negative-case testing and deeper policy checks around edge-case authorization paths."

## Slide 7 (8:00-8:30)

- Slide title: Live Demo Overview
- Exact speaking lines:
  1. "For the demo, we will show one student flow and one employer flow on the same running backend."
  2. "If the mobile emulator takes longer to initialize, we will begin with the web interface and continue without losing continuity."

## Slide 8 (8:30-11:00)

- Slide title: Student Journey
- Exact speaking lines:
  1. "Step one: we log in as a student account."
  2. "Step two: we browse available jobs and open a specific posting."
  3. "Step three: we submit an application and verify that it appears in the student's application tracking view."
  4. "This demonstrates the discover-to-apply workflow that addresses the student-side pain point."
- Add for 18 minutes:
  1. "We also show how this flow remains role-safe, meaning actions available to students are intentionally limited to student-authorized behavior."
- Add for 20 minutes:
  1. "If mobile is active, we repeat the same flow briefly on mobile to show cross-client consistency against the same backend endpoints."

## Slide 9 (11:00-13:00)

- Slide title: Employer Journey
- Exact speaking lines:
  1. "Now we switch to the employer flow."
  2. "Step one: we log in as an employer and create a job post."
  3. "Step two: we review applicant-related views and confirm the workflow from posting to candidate review."
  4. "This demonstrates the employer-side value of structured candidate management in one place."
- Add for 18 minutes:
  1. "We also call out that both flows are powered by the same API, which reduces duplication and makes behavior predictable."
- Add for 20 minutes:
  1. "This is important for maintainability, because feature updates can be introduced centrally and reflected across clients."

## Slide 10 (13:00-14:00)

- Slide title: Testing, Reliability, and Demo Operations
- Exact speaking lines:
  1. "To support stability, we use sanity and full test scripts for backend validation."
  2. "For class demonstrations, we prepared a one-command startup flow for backend, web, and mobile with clear fallback options."
  3. "This reduces setup time and lowers the risk of demo interruption."
- Add for 18 minutes:
  1. "We also included a backup five-minute demo path that works even if the emulator is unavailable."
- Add for 20 minutes:
  1. "Operational readiness matters in project delivery, so we treated demo reliability as part of product quality, not a last-minute task."

## Slide 11 (14:00-14:40)

- Slide title: Expected Impact
- Exact speaking lines:
  1. "BetterLink helps students access opportunities faster and helps employers identify candidates more efficiently."
  2. "It also supports cross-university visibility and professional networking in a local context."
  3. "Our goal is practical impact: improve the pathway from university to employment."
- Add for 18 minutes:
  1. "By localizing the platform around Jamaican context and workflows, we increase relevance compared to generic global alternatives."
- Add for 20 minutes:
  1. "As the platform matures, this can contribute to stronger talent pipelines and more transparent early-career opportunities."

## Slide 12 (14:40-15:00)

- Slide title: Next Steps and Close
- Exact speaking lines:
  1. "Our next steps are feature parity expansion, additional hardening, and deployment maturity."
  2. "Thank you for your attention. We are now ready for questions and feedback."
- Add for 18 minutes:
  1. "Before Q and A, we can briefly summarize the strongest takeaway: BetterLink combines relevance, structure, and accessibility in one platform."
- Add for 20 minutes:
  1. "If time allows, we can also discuss roadmap priorities such as deeper analytics, broader integration points, and user feedback loops."

## Timing Control

- Use only the exact speaking lines for a 15-minute run.
- Add all 18-minute lines for an 18-minute run.
- Add all 18-minute and 20-minute lines for a 20-minute run.
- If running behind, trim Slide 5 extension first, then Slide 10 extension.
