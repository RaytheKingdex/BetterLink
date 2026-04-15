# Contributing to BetterLink

## Workflow

1. Create a feature branch from main.
2. Make focused changes and keep commits small.
3. Run relevant tests before opening a pull request.
4. Open a pull request with a clear summary, test notes, and screenshots when UI changes are included.

## Branch Naming

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`

## Local Validation

From the repository root:

```powershell
dotnet build .\backend\BetterLink.Backend.csproj -c Debug
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendSanityTests.ps1
```

For full integration validation:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Run-BackendAllTests-WithDockerMySql.ps1
```

## Documentation Expectations

- Update related docs when behavior, endpoints, scripts, or setup steps change.
- Keep endpoint changes synchronized with `docs/API_Endpoints.md`.
- Keep quick-start instructions synchronized across `README.md`, `backend/README.md`, and `frontend/mobile/README.md`.

## Code Style

- Prefer clear naming and straightforward control flow.
- Keep controller actions small and explicit.
- Add tests for new backend behavior when feasible.

## Security and Secrets

- Never commit production secrets or private keys.
- Use local `appsettings.Development.json` for development overrides.
- Use environment variables or secure app settings for deployed environments.
