param(
    [Parameter(Mandatory = $true)]
    [string]$EventName
)

$ErrorActionPreference = "Stop"

try {
    $repoRoot = (git rev-parse --show-toplevel).Trim()
    if (-not $repoRoot) {
        exit 0
    }

    $repoName = Split-Path $repoRoot -Leaf
    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
    $commit = (git rev-parse HEAD).Trim()
    $author = (git log -1 --pretty=format:"%an <%ae>").Trim()

    $traceDir = Join-Path $repoRoot "activity-traces"
    if (-not (Test-Path $traceDir)) {
        New-Item -Path $traceDir -ItemType Directory | Out-Null
    }

    $dateTag = Get-Date -Format "yyyy-MM-dd"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $traceFile = Join-Path $traceDir ("{0}-{1}.trace" -f $repoName, $dateTag)

    $entry = @(
        "[$timestamp] event=$EventName repo=$repoName branch=$branch",
        "  commit=$commit",
        "  author=$author"
    )

    Add-Content -Path $traceFile -Value $entry
} catch {
    $fallback = Join-Path (Get-Location) "git-hook-errors.trace"
    Add-Content -Path $fallback -Value ("[{0}] hook_error={1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $_.Exception.Message)
}
