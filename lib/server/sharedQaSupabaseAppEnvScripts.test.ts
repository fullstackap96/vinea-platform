import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const setScriptPath = join(process.cwd(), 'scripts', 'set-shared-qa-supabase-app-env.ps1')
const checkScriptPath = join(process.cwd(), 'scripts', 'check-shared-qa-supabase-app-env.ps1')

function readSetScript() {
  return readFileSync(setScriptPath, 'utf8')
}

function readCheckScript() {
  return readFileSync(checkScriptPath, 'utf8')
}

describe('shared QA Supabase app env helper scripts', () => {
  it('requires explicit approval and the approved shared QA Supabase project', () => {
    const setScript = readSetScript()
    const checkScript = readCheckScript()

    for (const expected of [
      'APPROVED_SHARED_QA_SUPABASE_APP_ENV',
      'gnfomgsuottcuueasfvi',
      'gnfomgsuottcuueasfvi.supabase.co',
      'NEXT_PUBLIC_SUPABASE_URL must be exactly',
    ]) {
      expect(setScript).toContain(expected)
    }

    for (const expected of [
      'gnfomgsuottcuueasfvi',
      'gnfomgsuottcuueasfvi.supabase.co',
      'ApprovedSharedQaHost',
      'Shared-QA Supabase app credentials are present and valid by name only.',
    ]) {
      expect(checkScript).toContain(expected)
    }
  })

  it('reads key material privately and writes only the ignored local env file', () => {
    const setScript = readSetScript()

    for (const expected of [
      'Read-Host $Prompt -AsSecureString',
      'ZeroFreeBSTR',
      '.env.local',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      '[Environment]::SetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", $serviceRoleKey, "Process")',
    ]) {
      expect(setScript).toContain(expected)
    }
  })

  it('supports legacy JWT keys and current Supabase publishable/secret key formats', () => {
    const setScript = readSetScript()
    const checkScript = readCheckScript()

    for (const expected of [
      'role',
      'service_role',
      'anon',
      'ref',
      'sb_publishable_',
      'sb_secret_',
      'requires-live-validation',
      '/rest/v1/parishes?select=id&limit=1',
    ]) {
      expect(setScript).toContain(expected)
      expect(checkScript).toContain(expected)
    }
  })

  it('does not contain obvious credential material or print raw key values', () => {
    const combined = `${readSetScript()}\n${readCheckScript()}`

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
      'Format-EnvLine -Name "SUPABASE_SERVICE_ROLE_KEY"',
      'Write-Host $serviceRoleKey',
      'Write-Host $anonKey',
    ]) {
      expect(combined).not.toContain(forbidden)
    }
  })
})
