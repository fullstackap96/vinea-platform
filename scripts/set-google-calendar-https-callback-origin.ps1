param(
  [string]$Origin,
  [switch]$WriteLocalEnvFile
)

$ErrorActionPreference = "Stop"

$approval = Read-Host "Type APPROVED_GOOGLE_CALENDAR_HTTPS_CALLBACK_QA to continue"
if ($approval -ne "APPROVED_GOOGLE_CALENDAR_HTTPS_CALLBACK_QA") {
  throw "Refusing to set Google Calendar callback origin without the exact approval phrase."
}

if ([string]::IsNullOrWhiteSpace($Origin)) {
  $Origin = Read-Host "Approved HTTPS non-production app origin"
}

if ([string]::IsNullOrWhiteSpace($Origin)) {
  throw "Approved HTTPS non-production app origin is required."
}

$originUri = [Uri]$Origin.Trim()

if ($originUri.Scheme -ne "https") {
  throw "Approved Google Calendar callback origin must start with https://."
}

if ($originUri.Host -in @("localhost", "127.0.0.1", "::1")) {
  throw "Refusing localhost as a Google Calendar OAuth callback origin."
}

if ($originUri.Host -match "^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)") {
  throw "Refusing private IP as a Google Calendar OAuth callback origin."
}

if ($originUri.Host -match "(^|\.)vinea\.app$") {
  throw "Refusing a production-looking Vinea app host."
}

if ($originUri.AbsolutePath -ne "/") {
  throw "Provide only the origin, not a path. Example: https://preview.example.com"
}

if (-not [string]::IsNullOrWhiteSpace($originUri.Query)) {
  throw "Provide only the origin, not a query string."
}

$approvedOrigin = $originUri.GetLeftPart([System.UriPartial]::Authority)
$callbackUri = "$approvedOrigin/api/google/oauth/callback"

[Environment]::SetEnvironmentVariable("NON_PRODUCTION_APP_URL", $approvedOrigin, "User")
[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_APP_URL", $approvedOrigin, "User")
[Environment]::SetEnvironmentVariable("NON_PRODUCTION_APP_URL", $approvedOrigin, "Process")
[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_APP_URL", $approvedOrigin, "Process")

if ($WriteLocalEnvFile) {
  $localEnvPath = Join-Path (Get-Location) ".env.google-calendar-browser-qa.local"
  $existingLines = @()
  if (Test-Path -LiteralPath $localEnvPath) {
    $existingLines = Get-Content -LiteralPath $localEnvPath
  }

  $updatedLines = @()
  $seen = @{}
  foreach ($line in $existingLines) {
    if ($line -match "^\s*(NON_PRODUCTION_APP_URL|NEXT_PUBLIC_APP_URL)=") {
      $name = $Matches[1]
      $updatedLines += "$name=`"$approvedOrigin`""
      $seen[$name] = $true
    } else {
      $updatedLines += $line
    }
  }

  foreach ($name in @("NON_PRODUCTION_APP_URL", "NEXT_PUBLIC_APP_URL")) {
    if (-not $seen.ContainsKey($name)) {
      $updatedLines += "$name=`"$approvedOrigin`""
    }
  }

  Set-Content -LiteralPath $localEnvPath -Value $updatedLines -Encoding UTF8
}

"Approved HTTPS non-production origin saved."
"Host: $($originUri.Host)"
"Google OAuth redirect URI to add:"
$callbackUri
"Calendar event mutation remains blocked until OAuth reconnect and selected-parish guards pass."
