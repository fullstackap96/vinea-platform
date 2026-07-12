$ErrorActionPreference = "Stop"

$names = @(
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID"
)

$localEnvPath = Join-Path (Get-Location) ".env.vercel-preview-qa.local"
$localEnvLines = @()
if (Test-Path -LiteralPath $localEnvPath) {
  $localEnvLines = Get-Content -LiteralPath $localEnvPath
}

$rows = foreach ($name in $names) {
  $localEnvPresent = $false
  foreach ($line in $localEnvLines) {
    if ($line -match "^\s*$([regex]::Escape($name))=") {
      $localEnvPresent = $true
      break
    }
  }

  [pscustomobject]@{
    Name = $name
    Process = [bool][Environment]::GetEnvironmentVariable($name, "Process")
    User = [bool][Environment]::GetEnvironmentVariable($name, "User")
    Machine = [bool][Environment]::GetEnvironmentVariable($name, "Machine")
    LocalEnvFile = $localEnvPresent
  }
}

$rows | Format-Table -AutoSize

$missing = @(
  $rows |
    Where-Object { -not ($_.Process -or $_.User -or $_.Machine -or $_.LocalEnvFile) } |
    Select-Object -ExpandProperty Name
)

if ($missing.Count -gt 0) {
  throw "Missing required Vercel preview QA variable(s): $($missing -join ', ')"
}
