$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) {
    throw "Run this script inside a git repository."
}

Set-Location $repoRoot

# Route all git hook execution through the repository-managed .githooks folder.
git config core.hooksPath .githooks

$traceDir = Join-Path $repoRoot "activity-traces"
if (-not (Test-Path $traceDir)) {
    New-Item -Path $traceDir -ItemType Directory | Out-Null
}

Write-Host "Git hooks enabled for repository: $repoRoot"
Write-Host "Logs will be written to: $traceDir"
