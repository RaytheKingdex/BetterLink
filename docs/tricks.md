# Developer Tips

## Fast Demo Start

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode android
```

## Backend Only Run

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode none
```

## Common Checks

- `dotnet --info`
- `dotnet build .\backend\BetterLink.Backend.csproj -c Debug`
- `npx expo config --type public` (inside `frontend/mobile`)

## API Health Probe

```powershell
Invoke-RestMethod -Uri http://localhost:5000/health -Method Get
```

