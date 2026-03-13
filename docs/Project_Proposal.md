# BetterLink Project Proposal

Northern Caribbean University  
College of Natural and Applied Sciences, Allied Health and Nursing  
Department of Computer and Information Sciences  
Course: CPTR293 - Field Group Project (A)

Prepared by:
- Keyana Matherson
- Raynardo Walters
- Michael Griffiths
- Justin Meikle
- Romario Ricketts

## Table of Contents
1. Executive Summary
2. Main Body
3. Project Design and Technical Specifications
4. Conclusion and Project Significance
5. Appendix
6. References

## 1. Executive Summary
BetterLink is a centralized digital platform designed for Jamaican university students and employers. The platform combines professional networking with internship and job matching in one ecosystem. It includes a web experience and an Android-ready mobile pathway to support broad access.

The project addresses a persistent challenge: students struggle to discover relevant opportunities and employers struggle to identify qualified local candidates efficiently. Existing options are either too broad, university-isolated, or not built for Jamaica's specific academic and employment context.

BetterLink solves this through:
- Verified student and employer profiles
- Field-specific internship and job listings
- Application tracking and recruiter communication
- Program-based communities for cross-university collaboration

The remaining sections describe the problem context, system design, implementation considerations, expected deliverables, and projected national impact.

### 1.1 Project Motivation and Rationale
Jamaican students often rely on fragmented channels such as career offices, personal contacts, and generic global platforms. This creates unequal access to opportunities and slows the transition from university to employment. BetterLink provides a structured, local-first platform to close this gap.

### 1.2 Problem Overview
Three core issues motivate this project:
- Limited access to centralized field-specific internship and job opportunities
- Limited cross-university academic and professional networking
- Difficulty for employers to find and evaluate qualified student talent efficiently

### 1.3 Proposed Solution Overview
BetterLink introduces a dual-sided platform:
- Students create profiles with resumes, skills, achievements, and portfolios
- Employers post jobs/internships, filter candidates, and communicate with applicants
- Both groups interact in secure, role-based, community-enabled workflows

### 1.4 What to Expect in This Proposal
This proposal covers historical context, justification, technical architecture, platform requirements, implementation risks, deliverables, and expected social and economic benefits.

## 2. Main Body

### 2.1 Historical Context of the Problem
Jamaica has made strong macro-level unemployment improvements in recent years, but graduate underemployment and youth unemployment remain meaningful concerns. Many graduates still face qualification-opportunity mismatches, limited entry-level pathways, and reduced earnings outcomes.

### 2.2 Justification for the Project
The team selected this project after observing repeated student challenges in finding field-relevant internships and jobs. Current pathways are fragmented, inconsistent, and often constrained by institution boundaries.

### 2.3 Causes and Occurrence of the Problem
The problem is driven by:
- Mismatch between student qualifications and available opportunities
- Limited inter-university collaboration channels
- Recruiter difficulty in assessing student readiness at scale

This challenge appears most strongly during final years of study and shortly after graduation.

### 2.4 Review of Existing Systems and Solutions
Current alternatives include:
- LinkedIn: broad global network, not Jamaica-student specific
- CaribbeanJobs.com: regional listings, limited collaboration features
- HireMeJA: local listings, limited academic-community integration
- University career centers: targeted but institution-siloed
- WayUp: student-focused globally, limited Jamaica localization

### 2.5 Limitations of Current Solutions and Proposed Improvements
Most current systems lack one or more of these critical factors:
- Localized Jamaican university context
- Cross-university collaboration spaces
- Verified student-employer ecosystem
- Mobile-friendly workflows for widespread access

BetterLink improves this by combining localized listings, profile verification, social collaboration, and scalable recruitment workflows in one platform.

## 3. Project Design and Technical Specifications

### 3.1 System Architecture and Development Environment
BetterLink uses a client-server architecture with:
- Web frontend client
- Mobile frontend client (Android track)
- ASP.NET Core backend API
- Centralized relational database

All clients communicate with the backend via REST APIs over HTTPS. The backend manages authentication, authorization, business logic, and data access. The database stores profiles, job posts, applications, and interaction records.

Development and production environments are separated to support testing, quality control, and reliable deployment.

### 3.1.1 Programming Languages, Frameworks, and Development Tools
- Backend: C# with ASP.NET Core
- Web frontend: JavaScript, HTML5, CSS3 (React-ready structure)
- Mobile frontend: Android implementation path
- Database: MySQL or Microsoft SQL Server
- Tooling: Visual Studio Code / Visual Studio, Android Studio, GitHub, Azure deployment services

### 3.1.2 Development Hardware and Infrastructure Requirements
No specialized hardware is required. Team members need:
- Modern development-capable computer
- Reliable internet access
- Android emulator or physical Android device for testing
- Cloud backup and version control access

### 3.1.3 System Architecture Diagrams and Models
System behavior is role-based:

Student flow:
1. Register and verify account
2. Build profile (resume, skills, achievements, portfolio)
3. Join program-relevant communities
4. Browse and filter jobs/internships
5. Apply and track application status
6. Communicate with recruiters

Employer flow:
1. Register and verify organization
2. Post and manage job/internship listings
3. Filter applicants by qualifications
4. Review profiles and portfolios
5. Shortlist, approve, or reject candidates
6. Communicate and schedule interviews

### 3.1.4 End-User Hardware and System Requirements
End users require:
- Internet-connected desktop, laptop, tablet, or smartphone
- Modern web browser or Android app access
- Standard input method (keyboard, mouse, touchscreen)

No specialized external hardware is required.

### 3.2 Implementation Considerations and Challenges

#### 3.2.1 Anticipated Technical and Operational Challenges
- Designing a normalized, performant schema for profile/job/application/community data
- Securing sensitive user data with encryption and robust access control
- Scaling under high demand using caching, pagination, and optimized queries
- Maintaining moderation quality in community features

#### 3.2.2 Project Uniqueness and Competitive Advantage
BetterLink is differentiated by:
- Jamaica-specific focus for university talent and employers
- Integrated job board and academic/professional collaboration
- Cross-institution engagement model
- Employer verification and structured candidate filtering

### 3.3 Project Deliverables and Functional Specifications

#### 3.3.1 Expected Outputs and Artifacts
- MVP platform with core student and employer workflows
- Backend API and foundational frontend clients
- Database schema and implementation scripts
- Technical documentation and end-user documentation
- Demonstration package and deployment baseline

#### 3.3.2 Detailed Description of System Features and Functions
Student-facing features:
- Registration and profile creation
- Resume and portfolio upload
- Job search, filtering, and application tracking
- Program-based communities and discussions

Employer-facing features:
- Organization registration and verification
- Job/internship posting and management
- Candidate search and filtering
- Application response and direct communication

Shared platform features:
- Secure login and role-based authorization
- Encrypted data handling and HTTPS transport
- Moderation and safety controls
- Performance optimization and cloud scalability

#### 3.3.3 Project Contributions and Expected Impact
Expected contributions include:
- Improved opportunity visibility for Jamaican university students
- Faster, more structured recruitment for employers
- Reduced dependence on informal networks
- Stronger inter-university collaboration and professional development
- Support for national workforce growth through better student-employer matching

## 4. Conclusion and Project Significance
BetterLink provides a targeted, practical response to graduate underemployment and fragmented recruitment channels in Jamaica. By combining verified profiles, localized opportunity discovery, direct employer engagement, and collaboration tools, the platform strengthens the university-to-workforce pipeline.

The project is built for reliability, security, and growth, with clear value for students, employers, and national development goals.

## 5. Appendix
This proposal supports delivery of a practical MVP designed for real-world use. The design prioritizes accessibility, modular growth, and deployment readiness. Future enhancements may include virtual career fairs, alumni mentorship modules, analytics dashboards, and deeper institutional integrations.

## 6. References
1. Jamaica Observer, "The harsh reality of Jamaican graduates," Mar. 03, 2025.  
	https://www.jamaicaobserver.com/2025/03/03/harsh-reality-jamaican-graduates/
2. Andrew Holness (official page), unemployment trend statement, 2026.  
	https://web.facebook.com/AndrewHolnessJM/videos/over-the-past-nine-years-jamaica-has-reduced-unemployment-from-137-to-a-historic/2527373387640133/
3. LinkedIn article, "Overcoming Graduate Unemployment in Jamaica: Challenges and Solutions."  
	https://www.linkedin.com/pulse/overcoming-graduate-unemployment-jamaica-challenges-devin-mcintosh
4. The University of the West Indies, "The Labour Market Experience of Recent UWI First-degree Graduates in Caribbean Economies," 2011.  
	https://uwi.edu/uop/sites/uop/files/Graduate%20Tracer%20Survey%20-%20Labor%20Market%20Experienaduates%20in%20Caribbean%20Economies%20(Executive%20Summary).pdf
