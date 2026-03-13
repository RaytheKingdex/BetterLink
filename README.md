# BetterLink

BetterLink is a dual-sided platform connecting Jamaican university students with local employers. This repository is organized by project function to support collaborative development.

## Repository Structure

```text
/BETTERLINK
|
+-- /docs
|   +-- Project_Proposal.md
|   +-- Development_Roadmap.md
|   +-- Architecture_Diagram.png
|
+-- /backend
|   +-- BetterLink.Backend.csproj
|   +-- Controllers/
|   +-- Data/
|   +-- Models/
|   +-- Services/
|   +-- Program.cs
|   +-- appsettings.json
|   +-- README.md
|
+-- /database
|   +-- schema.sql
|   +-- README.md
|
+-- /deployment
|   +-- azure-config.md
|   +-- github-actions.yml
|
+-- /.githooks
|   +-- post-commit
|   +-- post-merge
|   +-- log-git-event.ps1
|
+-- /scripts
|   +-- Enable-GitHooks.ps1
|   +-- Enable-GlobalGitHookLogging.ps1
|   +-- Start-RepoTranscript.ps1
|
+-- /activity-traces
|
+-- /docs
|   +-- API_Endpoints.md
|   +-- Stage1_Learning_Reference.md
|
+-- /frontend
|   +-- /web
|   +-- /mobile
|   +-- README.md
|
+-- README.md
```

## Folder Purpose

- `docs/`: Project proposal, roadmap, and architecture assets
- `backend/`: ASP.NET Core API source and backend architecture layers
- `frontend/`: Web and mobile client applications
- `database/`: Schema and database setup artifacts
- `deployment/`: Cloud deployment and CI/CD configuration files

## Quick Start

1. Clone the repository.
2. Review `docs/Project_Proposal.md` and `docs/Development_Roadmap.md`.
3. Install prerequisites:
   - **[.NET 8 SDK (x64)](https://dotnet.microsoft.com/download/dotnet/8.0)** — SDK package, not just Runtime
   - **[MySQL 8+](https://dev.mysql.com/downloads/mysql/)**
   - **[Git](https://git-scm.com/)**
4. Configure and run the backend — see `backend/README.md` for full setup steps including a Windows PATH fix if `dotnet` resolves to the 32-bit install.
5. Enable repository hook logs with `scripts/Enable-GitHooks.ps1`.
6. Optionally enable cross-repository hooks with `scripts/Enable-GlobalGitHookLogging.ps1`.
7. Start a terminal transcript session with `scripts/Start-RepoTranscript.ps1` when documenting implementation sessions.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
