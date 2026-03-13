param(
    [string]$SessionName = "dev"
)

$ErrorActionPreference = "Stop"
$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) {
    throw "Run this script inside a git repository."
}

$repoName = Split-Path $repoRoot -Leaf
$traceDir = Join-Path $repoRoot "activity-traces"
if (-not (Test-Path $traceDir)) {
    New-Item -Path $traceDir -ItemType Directory | Out-Null
}

$dateTag = Get-Date -Format "yyyy-MM-dd"
$timeTag = Get-Date -Format "HHmmss"
$transcriptPath = Join-Path $traceDir ("{0}-{1}-{2}-{3}.transcript.txt" -f $repoName, $dateTag, $SessionName, $timeTag)

Start-Transcript -Path $transcriptPath -IncludeInvocationHeader
Write-Host "Transcript started: $transcriptPath"
Write-Host "Run Stop-Transcript when done."
