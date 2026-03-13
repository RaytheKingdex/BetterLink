$ErrorActionPreference = "Stop"

$globalHookRoot = Join-Path $HOME ".git-hooks-global"
$globalLogRoot = Join-Path $HOME "git-activity-traces"

if (-not (Test-Path $globalHookRoot)) {
    New-Item -Path $globalHookRoot -ItemType Directory | Out-Null
}

if (-not (Test-Path $globalLogRoot)) {
    New-Item -Path $globalLogRoot -ItemType Directory | Out-Null
}

$loggerScriptPath = Join-Path $globalHookRoot "log-git-event.ps1"
$postCommitPath = Join-Path $globalHookRoot "post-commit"
$postMergePath = Join-Path $globalHookRoot "post-merge"

@'
param(
    [Parameter(Mandatory = $true)]
    [string]$EventName
)

$ErrorActionPreference = "Stop"

try {
    $repoRoot = (git rev-parse --show-toplevel).Trim()
    $repoName = Split-Path $repoRoot -Leaf
    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
    $commit = (git rev-parse HEAD).Trim()
    $author = (git log -1 --pretty=format:"%an <%ae>").Trim()

    $globalLogRoot = Join-Path $HOME "git-activity-traces"
    if (-not (Test-Path $globalLogRoot)) {
        New-Item -Path $globalLogRoot -ItemType Directory | Out-Null
    }

    $dateTag = Get-Date -Format "yyyy-MM-dd"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $traceFile = Join-Path $globalLogRoot ("{0}-{1}.trace" -f $repoName, $dateTag)

    Add-Content -Path $traceFile -Value @(
        "[$timestamp] event=$EventName repo=$repoName branch=$branch",
        "  commit=$commit",
        "  author=$author"
    )
} catch {
    $fallback = Join-Path $HOME "git-hook-errors.trace"
    Add-Content -Path $fallback -Value ("[{0}] hook_error={1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $_.Exception.Message)
}
'@ | Set-Content -Path $loggerScriptPath

@'
#!/bin/sh
pwsh -NoProfile -ExecutionPolicy Bypass -File "$HOME/.git-hooks-global/log-git-event.ps1" -EventName "post-commit"
exit 0
'@ | Set-Content -Path $postCommitPath

@'
#!/bin/sh
pwsh -NoProfile -ExecutionPolicy Bypass -File "$HOME/.git-hooks-global/log-git-event.ps1" -EventName "post-merge"
exit 0
'@ | Set-Content -Path $postMergePath

git config --global core.hooksPath "$globalHookRoot"

Write-Host "Global Git hook logging enabled."
Write-Host "Hooks path: $globalHookRoot"
Write-Host "Logs path:  $globalLogRoot"
