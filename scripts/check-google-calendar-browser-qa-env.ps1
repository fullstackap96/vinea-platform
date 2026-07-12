$ErrorActionPreference = "Stop"

$names = @(
  "NON_PRODUCTION_APP_URL",
  "QA_STAFF_EMAIL",
  "QA_STAFF_PASSWORD",
  "QA_GOOGLE_CALENDAR_EMAIL",
  "QA_GOOGLE_CALENDAR_PASSWORD",
  "QA_ACTIVE_PARISH_A_ID",
  "QA_ACTIVE_PARISH_B_ID",
  "QA_GOOGLE_SAME_PARISH_REQUEST_ID",
  "QA_GOOGLE_CROSS_PARISH_REQUEST_ID",
  "QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID",
  "QA_SAFE_GOOGLE_CALENDAR_ID",
  "QA_GOOGLE_RECONNECT_ALLOWED"
)

$localEnvPath = Join-Path (Get-Location) ".env.google-calendar-browser-qa.local"
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
  throw "Missing required Google Calendar browser QA variable(s): $($missing -join ', ')"
}
