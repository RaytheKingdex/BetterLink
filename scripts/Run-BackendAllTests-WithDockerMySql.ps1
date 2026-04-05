param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug',
    [switch]$KeepContainer
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$composeFile = Join-Path $repoRoot 'deployment\docker-compose.test-mysql.yml'
$testProject = Join-Path $repoRoot 'tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker is not installed or not available on PATH.'
}

Write-Host 'Starting MySQL test container with Docker Compose...' -ForegroundColor Cyan
& docker compose -f $composeFile up -d

Write-Host 'Waiting for MySQL test container to become healthy...' -ForegroundColor Cyan
$healthy = $false
for ($i = 0; $i -lt 30; $i++) {
    $status = (& docker inspect --format '{{.State.Health.Status}}' betterlink-mysql-test 2>$null)
    if ($status -eq 'healthy') {
        $healthy = $true
        break
    }

    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    throw 'MySQL test container did not become healthy in time.'
}

try {
    Write-Host 'Running full backend test suite against Docker MySQL...' -ForegroundColor Cyan
    & dotnet test $testProject -c $Configuration
}
finally {
    if (-not $KeepContainer) {
        Write-Host 'Stopping MySQL test container...' -ForegroundColor Cyan
        & docker compose -f $composeFile down
    }
    else {
        Write-Host 'Keeping MySQL test container running because -KeepContainer was specified.' -ForegroundColor Yellow
    }
}
