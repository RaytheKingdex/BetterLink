# Frontend

This folder contains BetterLink client applications.

## Structure

- `mobile/`: React Native + Expo mobile client (actively used in demos)
- `web/`: Web client workspace (reserved for browser-focused frontend work)

## Start Mobile Client

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode android
```

Or run only mobile tooling:

```powershell
Set-Location .\frontend\mobile
npm install
npm start
```

See `mobile/README.md` for API URL setup and Android launch details.
