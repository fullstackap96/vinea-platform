param(
  [switch]$WriteLocalEnvFile
)

$ErrorActionPreference = "Stop"

$approval = Read-Host "Type APPROVED_VERCEL_PREVIEW_QA to continue"
if ($approval -ne "APPROVED_VERCEL_PREVIEW_QA") {
  throw "Refusing to save Vercel preview QA variables without the exact approval phrase."
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

$values = [ordered]@{
  VERCEL_TOKEN = Read-SecretRequired "VERCEL_TOKEN" "Project-scoped Vercel token"
  VERCEL_ORG_ID = Read-PlainRequired "VERCEL_ORG_ID" "Vercel org/team id"
  VERCEL_PROJECT_ID = Read-PlainRequired "VERCEL_PROJECT_ID" "Vercel project id"
}

if ($values.VERCEL_ORG_ID -notmatch "^(team|org|user)_[A-Za-z0-9]+$") {
  throw "VERCEL_ORG_ID should look like a Vercel team/org/user id, such as team_..."
}

if ($values.VERCEL_PROJECT_ID -notmatch "^prj_[A-Za-z0-9]+$") {
  throw "VERCEL_PROJECT_ID should look like a Vercel project id, such as prj_..."
}

foreach ($entry in $values.GetEnumerator()) {
  Save-UserEnvironmentValue -Name $entry.Key -Value $entry.Value
}

if ($WriteLocalEnvFile) {
  $localEnvPath = Join-Path (Get-Location) ".env.vercel-preview-qa.local"
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

"Saved Vercel preview QA variables by name only."
if ($WriteLocalEnvFile) {
  "Saved repo-local ignored QA env file: .env.vercel-preview-qa.local"
}
$visible | Format-Table -AutoSize
