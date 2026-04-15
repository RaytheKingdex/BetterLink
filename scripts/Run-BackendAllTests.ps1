param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$testProject = Join-Path $repoRoot 'tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj'

Write-Host "Running full backend test suite (includes MySQL integration tests)..." -ForegroundColor Cyan
& dotnet test $testProject -c $Configuration
