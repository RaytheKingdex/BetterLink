$ErrorActionPreference = "Stop"

function Resolve-AndroidSdkPath {
  $candidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA "Android\Sdk")
  ) | Where-Object { $_ -and $_.Trim() -ne "" }

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$sdkPath = Resolve-AndroidSdkPath

if (-not $sdkPath) {
  Write-Error "Android SDK not found. Install Android Studio SDK tools or set ANDROID_HOME / ANDROID_SDK_ROOT."
}

$platformToolsPath = Join-Path $sdkPath "platform-tools"
$adbPath = Join-Path $platformToolsPath "adb.exe"

if (-not (Test-Path $adbPath)) {
  Write-Error "adb.exe was not found at '$adbPath'. Install Android SDK Platform-Tools from Android Studio."
}

$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath

if (-not (($env:Path -split ';') -contains $platformToolsPath)) {
  $env:Path = "$platformToolsPath;$env:Path"
}

$existingAdb = Get-Process adb -ErrorAction SilentlyContinue
if ($existingAdb) {
  Write-Host "Stopping existing adb processes..."
  $existingAdb | Stop-Process -Force
  Start-Sleep -Seconds 1
}

Write-Host "Starting adb server from $adbPath"
& $adbPath start-server
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to start adb. Verify Android Studio, the emulator, and your user permissions."
}

Write-Host "Connected Android targets:"
& $adbPath devices
if ($LASTEXITCODE -ne 0) {
  Write-Error "adb started but device discovery failed."
}

Write-Host "Launching Expo for Android..."
Push-Location $projectRoot
try {
  & npx expo start --android
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
