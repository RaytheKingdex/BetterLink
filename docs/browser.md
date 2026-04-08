# Browser Access Notes

Use this guide when running BetterLink locally in a desktop browser.

## Backend Browser Endpoints

- Root: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- Swagger (Development): `http://localhost:5000/swagger`

## Demo Launch Options

From the repository root:

```powershell
# Backend + browser + Android mobile
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode android

# Backend + browser only
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode none
```

## Troubleshooting

- If browser does not open automatically, navigate manually to `http://localhost:5000`.
- If health fails, check backend terminal output for startup errors.
- Ensure no other process is using port 5000.

