param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$testProject = Join-Path $repoRoot 'tests\BetterLink.Backend.Tests\BetterLink.Backend.Tests.csproj'

Write-Host "Running backend sanity tests (excluding MySQL integration)..." -ForegroundColor Cyan
& dotnet test $testProject -c $Configuration --filter "Category!=MySqlIntegration"
