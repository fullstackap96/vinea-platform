param(
  [int]$Port = 3100,
  [string]$LogPath = "tmp-local-dev-server.log"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

"Starting local Vinea dev server on port $Port..."
"Log path: $LogPath"

& npm.cmd run dev -- -p $Port *>&1 | Tee-Object -FilePath $LogPath
