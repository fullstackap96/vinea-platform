param(
  [switch]$WriteLocalEnvFile
)

$ErrorActionPreference = "Stop"

$approval = Read-Host "Type APPROVED_NON_PRODUCTION_GOOGLE_CALENDAR_QA to continue"
if ($approval -ne "APPROVED_NON_PRODUCTION_GOOGLE_CALENDAR_QA") {
  throw "Refusing to save Google Calendar QA variables without the exact non-production approval phrase."
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

$reconnectApproval = Read-PlainRequired "QA_GOOGLE_RECONNECT_ALLOWED" "Type APPROVED_GOOGLE_CALENDAR_RECONNECT_QA"
if ($reconnectApproval -ne "APPROVED_GOOGLE_CALENDAR_RECONNECT_QA") {
  throw "Refusing Google reconnect QA without the exact reconnect approval phrase."
}

$values = [ordered]@{
  NON_PRODUCTION_APP_URL = $appUrl
  QA_STAFF_EMAIL = Read-PlainRequired "QA_STAFF_EMAIL" "Safe QA staff email"
  QA_STAFF_PASSWORD = Read-SecretRequired "QA_STAFF_PASSWORD" "Safe QA staff password"
  QA_GOOGLE_CALENDAR_EMAIL = Read-PlainRequired "QA_GOOGLE_CALENDAR_EMAIL" "Safe non-production Google Calendar email"
  QA_GOOGLE_CALENDAR_PASSWORD = Read-SecretRequired "QA_GOOGLE_CALENDAR_PASSWORD" "Safe non-production Google Calendar password"
  QA_ACTIVE_PARISH_A_ID = Read-PlainRequired "QA_ACTIVE_PARISH_A_ID" "Safe active parish A id"
  QA_ACTIVE_PARISH_B_ID = Read-PlainRequired "QA_ACTIVE_PARISH_B_ID" "Safe active parish B id"
  QA_GOOGLE_SAME_PARISH_REQUEST_ID = Read-PlainRequired "QA_GOOGLE_SAME_PARISH_REQUEST_ID" "Safe same-parish Google Calendar request id"
  QA_GOOGLE_CROSS_PARISH_REQUEST_ID = Read-PlainRequired "QA_GOOGLE_CROSS_PARISH_REQUEST_ID" "Safe cross-parish denied request id"
  QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID = Read-PlainRequired "QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID" "Safe mismatched-calendar request id, or NOT_AVAILABLE"
  QA_SAFE_GOOGLE_CALENDAR_ID = Read-PlainRequired "QA_SAFE_GOOGLE_CALENDAR_ID" "Safe Google Calendar id or primary"
  QA_GOOGLE_RECONNECT_ALLOWED = $reconnectApproval
}

foreach ($entry in $values.GetEnumerator()) {
  Save-UserEnvironmentValue -Name $entry.Key -Value $entry.Value
}

if ($WriteLocalEnvFile) {
  $localEnvPath = Join-Path (Get-Location) ".env.google-calendar-browser-qa.local"
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

"Saved Google Calendar browser QA variables for approved non-production host: $($appUri.Host)"
if ($WriteLocalEnvFile) {
  "Saved repo-local ignored QA env file: .env.google-calendar-browser-qa.local"
}
$visible | Format-Table -AutoSize
