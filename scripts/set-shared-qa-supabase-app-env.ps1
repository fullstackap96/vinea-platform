param(
  [switch]$SkipLiveValidation
)

$ErrorActionPreference = "Stop"

$approvedProjectRef = "gnfomgsuottcuueasfvi"
$approvedHost = "gnfomgsuottcuueasfvi.supabase.co"
$approvedUrl = "https://$approvedHost"

$approval = Read-Host "Type APPROVED_SHARED_QA_SUPABASE_APP_ENV to continue"
if ($approval -ne "APPROVED_SHARED_QA_SUPABASE_APP_ENV") {
  throw "Refusing to save shared-QA Supabase app credentials without the exact approval phrase."
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
    return $plain.Trim()
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
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

function Get-KeyDescription {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value,
    [Parameter(Mandatory = $true)]
    [string]$ExpectedRole
  )

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

function Assert-KeyAccepted {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Description
  )

  if (-not $Description.AcceptedOffline) {
    throw "$($Description.Name) does not look like a valid shared-QA Supabase $($Description.Role) key."
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
    throw "$Name failed live shared-QA Supabase validation with status $statusCode. Recheck that the key belongs to project $approvedProjectRef."
  }
}

function Format-EnvLine {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $escaped = $Value.Replace("\", "\\").Replace('"', '\"')
  return "$Name=`"$escaped`""
}

function Save-EnvLocalValues {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Values
  )

  $envPath = Join-Path (Get-Location) ".env.local"
  $lines = @()
  if (Test-Path -LiteralPath $envPath) {
    $lines = @(Get-Content -LiteralPath $envPath)
  }

  $seen = @{}
  $updated = foreach ($line in $lines) {
    $matchedName = $null
    foreach ($name in $Values.Keys) {
      if ($line -match "^\s*$([regex]::Escape($name))=") {
        $matchedName = $name
        break
      }
    }

    if ($matchedName) {
      $seen[$matchedName] = $true
      Format-EnvLine -Name $matchedName -Value $Values[$matchedName]
    } else {
      $line
    }
  }

  foreach ($name in $Values.Keys) {
    if (-not $seen.ContainsKey($name)) {
      $updated += Format-EnvLine -Name $name -Value $Values[$name]
    }
  }

  Set-Content -LiteralPath $envPath -Value $updated -Encoding UTF8
}

$supabaseUrl = Read-PlainRequired "NEXT_PUBLIC_SUPABASE_URL" "Shared-QA Supabase URL"
$uri = [Uri]$supabaseUrl
if ($uri.Scheme -ne "https" -or $uri.Host -ne $approvedHost) {
  throw "NEXT_PUBLIC_SUPABASE_URL must be exactly $approvedUrl."
}

$anonKey = Read-SecretRequired "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Shared-QA anon key"
$serviceRoleKey = Read-SecretRequired "SUPABASE_SERVICE_ROLE_KEY" "Shared-QA service role key"

$anonDescription = Get-KeyDescription -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $anonKey -ExpectedRole "anon"
$serviceDescription = Get-KeyDescription -Name "SUPABASE_SERVICE_ROLE_KEY" -Value $serviceRoleKey -ExpectedRole "service_role"

Assert-KeyAccepted $anonDescription
Assert-KeyAccepted $serviceDescription

$liveResults = @()
if (-not $SkipLiveValidation) {
  $liveResults += Test-SupabaseRestKey -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -BaseUrl $approvedUrl -Key $anonKey
  $liveResults += Test-SupabaseRestKey -Name "SUPABASE_SERVICE_ROLE_KEY" -BaseUrl $approvedUrl -Key $serviceRoleKey
}

Save-EnvLocalValues @{
  NEXT_PUBLIC_SUPABASE_URL = $approvedUrl
  NEXT_PUBLIC_SUPABASE_ANON_KEY = $anonKey
  SUPABASE_SERVICE_ROLE_KEY = $serviceRoleKey
}

[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", $approvedUrl, "Process")
[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", $anonKey, "Process")
[Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", $serviceRoleKey, "Process")

"Saved shared-QA Supabase app credentials to .env.local by variable name only."
"Approved host: $approvedHost"
@($anonDescription, $serviceDescription) |
  Select-Object Name, Kind, Role, Ref, RoleMatches, RefMatches |
  Format-Table -AutoSize

if (-not $SkipLiveValidation) {
  "Live shared-QA REST validation passed by variable name only."
  $liveResults | Select-Object Name, StatusCode, Accepted | Format-Table -AutoSize
}
