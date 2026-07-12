$ErrorActionPreference = "Stop"

$approvedProjectRef = "gnfomgsuottcuueasfvi"
$approvedHost = "gnfomgsuottcuueasfvi.supabase.co"
$approvedUrl = "https://$approvedHost"
$names = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
)

function Read-EnvLocalValues {
  $envPath = Join-Path (Get-Location) ".env.local"
  $values = @{}
  if (-not (Test-Path -LiteralPath $envPath)) {
    return $values
  }

  foreach ($line in Get-Content -LiteralPath $envPath) {
    foreach ($name in $names) {
      if ($line -match "^\s*$([regex]::Escape($name))=(.*)$") {
        $value = $matches[1].Trim().Trim('"').Trim("'")
        $values[$name] = $value
      }
    }
  }

  return $values
}

function ConvertFrom-Base64UrlJson {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $base64 = $Value.Replace("-", "+").Replace("_", "/")
  switch ($base64.Length % 4) {
    2 { $base64 += "==" }
    3 { $base64 += "=" }
    1 { throw "Invalid base64url payload length." }
  }

  $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($base64))
  return $json | ConvertFrom-Json
}

function Get-ValueSource {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [hashtable]$EnvLocalValues
  )

  $processValue = [Environment]::GetEnvironmentVariable($Name, "Process")
  if (-not [string]::IsNullOrWhiteSpace($processValue)) {
    return [pscustomobject]@{
      Source = "Process"
      Value = $processValue
    }
  }

  if ($EnvLocalValues.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace($EnvLocalValues[$Name])) {
    return [pscustomobject]@{
      Source = ".env.local"
      Value = $EnvLocalValues[$Name]
    }
  }

  return [pscustomobject]@{
    Source = "Missing"
    Value = $null
  }
}

function Get-KeyDescription {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [string]$Value,
    [Parameter(Mandatory = $true)]
    [string]$ExpectedRole
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return [pscustomobject]@{
      Name = $Name
      Kind = "missing"
      Role = "missing"
      Ref = "missing"
      RoleMatches = $false
      RefMatches = $false
      AcceptedOffline = $false
    }
  }

  $parts = $Value.Split(".")
  if ($parts.Count -eq 3) {
    $payload = ConvertFrom-Base64UrlJson $parts[1]
    return [pscustomobject]@{
      Name = $Name
      Kind = "jwt"
      Role = [string]$payload.role
      Ref = [string]$payload.ref
      RoleMatches = ([string]$payload.role -eq $ExpectedRole)
      RefMatches = ([string]$payload.ref -eq $approvedProjectRef)
      AcceptedOffline = (([string]$payload.role -eq $ExpectedRole) -and ([string]$payload.ref -eq $approvedProjectRef))
    }
  }

  if ($ExpectedRole -eq "anon" -and $Value.StartsWith("sb_publishable_")) {
    return [pscustomobject]@{
      Name = $Name
      Kind = "publishable"
      Role = "anon-compatible"
      Ref = "not-encoded"
      RoleMatches = $true
      RefMatches = "requires-live-validation"
      AcceptedOffline = $true
    }
  }

  if ($ExpectedRole -eq "service_role" -and $Value.StartsWith("sb_secret_")) {
    return [pscustomobject]@{
      Name = $Name
      Kind = "secret"
      Role = "service-compatible"
      Ref = "not-encoded"
      RoleMatches = $true
      RefMatches = "requires-live-validation"
      AcceptedOffline = $true
    }
  }

  return [pscustomobject]@{
    Name = $Name
    Kind = "unrecognized"
    Role = "unknown"
    Ref = "unknown"
    RoleMatches = $false
    RefMatches = $false
    AcceptedOffline = $false
  }
}

function Test-SupabaseRestKey {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,
    [Parameter(Mandatory = $true)]
    [string]$Key
  )

  $headers = @{
    apikey = $Key
    Authorization = "Bearer $Key"
  }
  $uri = "$BaseUrl/rest/v1/parishes?select=id&limit=1"

  try {
    $response = Invoke-WebRequest -Uri $uri -Headers $headers -Method Get -TimeoutSec 30 -UseBasicParsing
    return [pscustomobject]@{
      Name = $Name
      StatusCode = [int]$response.StatusCode
      Accepted = ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 300)
    }
  } catch {
    $statusCode = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }
    return [pscustomobject]@{
      Name = $Name
      StatusCode = $statusCode
      Accepted = $false
    }
  }
}

$envLocalValues = Read-EnvLocalValues
$urlSource = Get-ValueSource -Name "NEXT_PUBLIC_SUPABASE_URL" -EnvLocalValues $envLocalValues
$anonSource = Get-ValueSource -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -EnvLocalValues $envLocalValues
$serviceSource = Get-ValueSource -Name "SUPABASE_SERVICE_ROLE_KEY" -EnvLocalValues $envLocalValues

$urlHost = "missing"
$urlMatches = $false
if (-not [string]::IsNullOrWhiteSpace($urlSource.Value)) {
  $urlUri = [Uri]$urlSource.Value
  $urlHost = $urlUri.Host
  $urlMatches = ($urlUri.Scheme -eq "https" -and $urlUri.Host -eq $approvedHost)
}

$presenceRows = @(
  [pscustomobject]@{ Name = "NEXT_PUBLIC_SUPABASE_URL"; Source = $urlSource.Source; Present = -not [string]::IsNullOrWhiteSpace($urlSource.Value); ApprovedSharedQaHost = $urlMatches; Host = $urlHost },
  [pscustomobject]@{ Name = "NEXT_PUBLIC_SUPABASE_ANON_KEY"; Source = $anonSource.Source; Present = -not [string]::IsNullOrWhiteSpace($anonSource.Value); ApprovedSharedQaHost = $urlMatches; Host = $urlHost },
  [pscustomobject]@{ Name = "SUPABASE_SERVICE_ROLE_KEY"; Source = $serviceSource.Source; Present = -not [string]::IsNullOrWhiteSpace($serviceSource.Value); ApprovedSharedQaHost = $urlMatches; Host = $urlHost }
)

$presenceRows | Format-Table -AutoSize

$keyRows = @(
  Get-KeyDescription -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $anonSource.Value -ExpectedRole "anon"
  Get-KeyDescription -Name "SUPABASE_SERVICE_ROLE_KEY" -Value $serviceSource.Value -ExpectedRole "service_role"
)

$keyRows | Select-Object Name, Kind, Role, Ref, RoleMatches, RefMatches, AcceptedOffline | Format-Table -AutoSize

$failures = @()
if (-not $urlMatches) {
  $failures += "NEXT_PUBLIC_SUPABASE_URL must be $approvedUrl."
}
foreach ($row in $keyRows) {
  if (-not $row.AcceptedOffline) {
    $failures += "$($row.Name) is missing or not recognized as a shared-QA Supabase key."
  }
}

if ($failures.Count -eq 0) {
  $liveResults = @(
    Test-SupabaseRestKey -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -BaseUrl $approvedUrl -Key $anonSource.Value
    Test-SupabaseRestKey -Name "SUPABASE_SERVICE_ROLE_KEY" -BaseUrl $approvedUrl -Key $serviceSource.Value
  )
  "Live shared-QA REST validation by variable name only:"
  $liveResults | Format-Table -AutoSize

  foreach ($result in $liveResults) {
    if (-not $result.Accepted) {
      $failures += "$($result.Name) failed live REST validation with status $($result.StatusCode)."
    }
  }
}

if ($failures.Count -gt 0) {
  throw "Shared-QA Supabase app credential check failed: $($failures -join ' ')"
}

"Shared-QA Supabase app credentials are present and valid by name only."
