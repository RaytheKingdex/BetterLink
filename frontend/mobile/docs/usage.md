# Mobile Usage

## Run the Mobile App

From `frontend/mobile`:

```powershell
npm install
npm start
```

For Android launch:

```powershell
npm run android
```

## API Base URL

Update `src/api/client.js` based on runtime target:

- Android emulator: `http://10.0.2.2:5000`
- Physical device: `http://<your-lan-ip>:5000`

## Full Demo Shortcut

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Demo.ps1 -MobileMode android
```

