$ErrorActionPreference = "Stop"

$raw = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_APP_URL", "Process")
if ([string]::IsNullOrWhiteSpace($raw)) {
  $raw = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_APP_URL", "User")
}
if ([string]::IsNullOrWhiteSpace($raw)) {
  $raw = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_APP_URL", "Machine")
}

if ([string]::IsNullOrWhiteSpace($raw)) {
  throw "NEXT_PUBLIC_APP_URL is missing. Run scripts/set-google-calendar-https-callback-origin.ps1 with an approved HTTPS non-production origin."
}

$uri = [Uri]$raw
$isLocalhost = $uri.Host -in @("localhost", "127.0.0.1", "::1")
$isPrivateIp = $uri.Host -match "^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)"
$isProductionLooking = $uri.Host -match "(^|\.)vinea\.app$"
$isOriginOnly = $uri.AbsolutePath -eq "/" -and [string]::IsNullOrWhiteSpace($uri.Query)
$isApprovedShape = $uri.Scheme -eq "https" -and -not $isLocalhost -and -not $isPrivateIp -and -not $isProductionLooking -and $isOriginOnly
$origin = $uri.GetLeftPart([System.UriPartial]::Authority)
$callbackUri = "$origin/api/google/oauth/callback"

[pscustomobject]@{
  Name = "NEXT_PUBLIC_APP_URL"
  Present = $true
  Scheme = $uri.Scheme
  Host = $uri.Host
  IsHttps = $uri.Scheme -eq "https"
  IsLocalhost = $isLocalhost
  IsPrivateIp = $isPrivateIp
  IsProductionLooking = $isProductionLooking
  IsOriginOnly = $isOriginOnly
  ApprovedForGoogleCalendarOauthQa = $isApprovedShape
  RedirectUriToRegister = $callbackUri
} | Format-List

if (-not $isApprovedShape) {
  throw "NEXT_PUBLIC_APP_URL is not an approved HTTPS non-production callback origin for Google Calendar OAuth QA."
}
