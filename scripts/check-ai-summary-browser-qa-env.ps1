$ErrorActionPreference = "Stop"

$names = @(
  "NON_PRODUCTION_APP_URL",
  "QA_STAFF_EMAIL",
  "QA_STAFF_PASSWORD",
  "QA_REQUEST_ID",
  "QA_CROSS_PARISH_REQUEST_ID",
  "QA_FAMILY_PORTAL_URL",
  "OPENAI_API_KEY",
  "VINEA_AI_SUMMARY_SAFETY_RUNTIME",
  "VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK",
  "VINEA_AI_SUMMARY_AUDIT_WRITE",
  "VINEA_AI_SUMMARY_AUDIT_WRITE_ACK",
  "VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE",
  "VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK",
  "VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION",
  "VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK"
)

$rows = foreach ($name in $names) {
  $localEnvPresent = $false
  $localEnvPath = Join-Path (Get-Location) ".env.ai-summary-browser-qa.local"
  if (Test-Path -LiteralPath $localEnvPath) {
    foreach ($line in Get-Content -LiteralPath $localEnvPath) {
      if ($line -match "^\s*$([regex]::Escape($name))=") {
        $localEnvPresent = $true
        break
      }
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

$missing = @($rows | Where-Object { -not ($_.Process -or $_.User -or $_.Machine -or $_.LocalEnvFile) } | Select-Object -ExpandProperty Name)
if ($missing.Count -gt 0) {
  throw "Missing required browser QA variable(s): $($missing -join ', ')"
}
