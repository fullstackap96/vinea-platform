param(
  [switch]$SkipOpenAiKey,
  [switch]$UseEnvLocalOpenAiKey,
  [switch]$WriteLocalEnvFile
)

$ErrorActionPreference = "Stop"

$approval = Read-Host "Type APPROVED_NON_PRODUCTION_AI_SUMMARY_QA to continue"
if ($approval -ne "APPROVED_NON_PRODUCTION_AI_SUMMARY_QA") {
  throw "Refusing to save QA variables without the exact non-production approval phrase."
}

function Read-PlainRequired {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Prompt
  )

  $value = Read-Host $Prompt
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$Name is required."
  }
  return $value.Trim()
}

function Read-SecretRequired {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Prompt
  )

  $secure = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ([string]::IsNullOrWhiteSpace($plain)) {
      throw "$Name is required."
    }
    return $plain
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Save-UserEnvironmentValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  [Environment]::SetEnvironmentVariable($Name, $Value, "User")
  [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
}

function Read-EnvLocalValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $envPath = Join-Path (Get-Location) ".env.local"
  if (-not (Test-Path -LiteralPath $envPath)) {
    throw ".env.local was not found in the current directory."
  }

  foreach ($line in Get-Content -LiteralPath $envPath) {
    if ($line -match "^\s*$([regex]::Escape($Name))=(.*)$") {
      $value = $matches[1].Trim()
      $value = $value.Trim('"')
      $value = $value.Trim("'")
      if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$Name exists in .env.local but is empty."
      }
      return $value
    }
  }

  throw "$Name was not found in .env.local."
}

function Format-EnvFileLine {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $escaped = $Value.Replace("\", "\\").Replace('"', '\"')
  return "$Name=`"$escaped`""
}

$appUrl = Read-PlainRequired "NON_PRODUCTION_APP_URL" "Approved non-production app URL"
$appUri = [Uri]$appUrl
if ($appUri.Scheme -notin @("http", "https")) {
  throw "NON_PRODUCTION_APP_URL must start with http:// or https://."
}
if ($appUri.Host -match "(^|\.)vinea\.app$") {
  throw "Refusing a production-looking Vinea app host."
}

$values = [ordered]@{
  NON_PRODUCTION_APP_URL = $appUrl
  QA_STAFF_EMAIL = Read-PlainRequired "QA_STAFF_EMAIL" "Safe QA staff email"
  QA_STAFF_PASSWORD = Read-SecretRequired "QA_STAFF_PASSWORD" "Safe QA staff password"
  QA_REQUEST_ID = Read-PlainRequired "QA_REQUEST_ID" "Safe same-parish request id"
  QA_CROSS_PARISH_REQUEST_ID = Read-PlainRequired "QA_CROSS_PARISH_REQUEST_ID" "Safe cross-parish denied request id"
  QA_FAMILY_PORTAL_URL = Read-PlainRequired "QA_FAMILY_PORTAL_URL" "Safe family portal fixture URL"
  VINEA_AI_SUMMARY_SAFETY_RUNTIME = "ENABLED"
  VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK = "APPROVED_AI_SUMMARY_SAFETY_RUNTIME"
  VINEA_AI_SUMMARY_AUDIT_WRITE = "ENABLED"
  VINEA_AI_SUMMARY_AUDIT_WRITE_ACK = "APPROVED_AI_SUMMARY_AUDIT_WRITE"
  VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE = "ENABLED"
  VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK = "APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE"
  VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION = "ENABLED"
  VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK = "APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION"
}

if ($SkipOpenAiKey -and $UseEnvLocalOpenAiKey) {
  throw "Use only one of -SkipOpenAiKey or -UseEnvLocalOpenAiKey."
}

if ($UseEnvLocalOpenAiKey) {
  $values.OPENAI_API_KEY = Read-EnvLocalValue "OPENAI_API_KEY"
} elseif (-not $SkipOpenAiKey) {
  $values.OPENAI_API_KEY = Read-SecretRequired "OPENAI_API_KEY" "Approved non-production OpenAI API key"
}

foreach ($entry in $values.GetEnumerator()) {
  Save-UserEnvironmentValue -Name $entry.Key -Value $entry.Value
}

if ($WriteLocalEnvFile) {
  $localEnvPath = Join-Path (Get-Location) ".env.ai-summary-browser-qa.local"
  $lines = foreach ($entry in $values.GetEnumerator()) {
    Format-EnvFileLine -Name $entry.Key -Value $entry.Value
  }
  Set-Content -LiteralPath $localEnvPath -Value $lines -Encoding UTF8
}

$visible = foreach ($name in $values.Keys) {
  [pscustomobject]@{
    Name = $name
    UserScopePresent = [bool][Environment]::GetEnvironmentVariable($name, "User")
    ProcessScopePresent = [bool][Environment]::GetEnvironmentVariable($name, "Process")
  }
}

"Saved browser QA variables for approved non-production host: $($appUri.Host)"
if ($WriteLocalEnvFile) {
  "Saved repo-local ignored QA env file: .env.ai-summary-browser-qa.local"
}
$visible | Format-Table -AutoSize
