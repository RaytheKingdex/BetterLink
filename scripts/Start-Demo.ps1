param(
    [ValidateSet("android", "expo", "none")]
    [string]$MobileMode = "android",

    [switch]$SkipNpmInstall,

    [string]$BackendUrl = "http://localhost:5000",

    [int]$HealthTimeoutSeconds = 90
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[Start-Demo] $Message" -ForegroundColor Cyan
}

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found on PATH."
    }
}

function Start-CommandWindow {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    $wrapped = "`$Host.UI.RawUI.WindowTitle = '$Title'; $Command"
    Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $wrapped) | Out-Null
}

function Test-HealthEndpoint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    try {
        $healthUrl = "$Url/health"
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
        return ($null -ne $response)
    }
    catch {
        return $false
    }
}

function Wait-ForHealth {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [Parameter(Mandatory = $true)]
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $healthUrl = "$Url/health"

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
            if ($null -ne $response) {
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    return $false
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$mobilePath = Join-Path $repoRoot "frontend\mobile"
$androidScriptPath = Join-Path $mobilePath "scripts\start-android.ps1"

if (-not (Test-Path $backendPath)) {
    throw "Backend folder not found at '$backendPath'."
}

if ($MobileMode -ne "none" -and -not (Test-Path $mobilePath)) {
    throw "Mobile folder not found at '$mobilePath'."
}

Write-Step "Running preflight checks..."
Assert-Command -Name "dotnet"

if ($MobileMode -ne "none") {
    Assert-Command -Name "npm"
}

if ($MobileMode -eq "android" -and -not (Test-Path $androidScriptPath)) {
    throw "Android launch script not found at '$androidScriptPath'."
}

if (Test-HealthEndpoint -Url $BackendUrl) {
    Write-Step "Backend already running at $BackendUrl. Reusing existing instance."
}
else {
    Write-Step "Starting backend in a new terminal window..."
    $backendCommand = "Set-Location '$backendPath'; dotnet run"
    Start-CommandWindow -Title "BetterLink Backend" -Command $backendCommand
}

Write-Step "Waiting for backend health at $BackendUrl/health (timeout: $HealthTimeoutSeconds seconds)..."
$healthy = Wait-ForHealth -Url $BackendUrl -TimeoutSeconds $HealthTimeoutSeconds

if (-not $healthy) {
    throw "Backend did not become healthy in time. Check the 'BetterLink Backend' terminal for errors."
}

Write-Step "Opening browser..."
Start-Process $BackendUrl | Out-Null

if ($MobileMode -eq "android") {
    Write-Step "Starting mobile app in Android mode..."

    $androidCommandParts = @(
        "Set-Location '$mobilePath'"
    )

    if (-not $SkipNpmInstall) {
        $androidCommandParts += "npm install"
    }

    $androidCommandParts += "npm run android"
    $androidCommand = $androidCommandParts -join "; "

    Start-CommandWindow -Title "BetterLink Mobile (Android)" -Command $androidCommand
}
elseif ($MobileMode -eq "expo") {
    Write-Step "Starting mobile app in Expo mode..."

    $expoCommandParts = @(
        "Set-Location '$mobilePath'"
    )

    if (-not $SkipNpmInstall) {
        $expoCommandParts += "npm install"
    }

    $expoCommandParts += "npm start"
    $expoCommand = $expoCommandParts -join "; "

    Start-CommandWindow -Title "BetterLink Mobile (Expo)" -Command $expoCommand
}
else {
    Write-Step "Mobile launch skipped (mode: none)."
}

Write-Host ""
Write-Host "Demo services launched." -ForegroundColor Green
Write-Host "- Backend URL: $BackendUrl"
Write-Host "- Mobile mode: $MobileMode"
Write-Host ""
Write-Host "To stop services, close the launched PowerShell windows or press Ctrl+C in each one." -ForegroundColor Yellow
