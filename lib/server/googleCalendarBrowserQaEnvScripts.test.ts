import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const setScriptPath = join(root, 'scripts', 'set-google-calendar-browser-qa-env.ps1')
const checkScriptPath = join(root, 'scripts', 'check-google-calendar-browser-qa-env.ps1')

describe('Google Calendar browser QA environment scripts', () => {
  it('prompts for required values without echoing secret inputs and requires explicit approvals', () => {
    const script = readFileSync(setScriptPath, 'utf8')

    for (const expected of [
      'APPROVED_NON_PRODUCTION_GOOGLE_CALENDAR_QA',
      'APPROVED_GOOGLE_CALENDAR_RECONNECT_QA',
      'Read-Host $Prompt -AsSecureString',
      'QA_STAFF_PASSWORD',
      'QA_GOOGLE_CALENDAR_PASSWORD',
      '[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)',
      'Refusing a production-looking Vinea app host.',
      'Save-UserEnvironmentValue',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('can write a repo-local ignored QA env file for Codex visibility', () => {
    const script = readFileSync(setScriptPath, 'utf8')
    const checker = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      '.env.google-calendar-browser-qa.local',
      'function Format-EnvFileLine',
      'Set-Content -LiteralPath $localEnvPath',
      'Saved repo-local ignored QA env file: .env.google-calendar-browser-qa.local',
    ]) {
      expect(script).toContain(expected)
    }

    for (const expected of [
      '.env.google-calendar-browser-qa.local',
      'LocalEnvFile = $localEnvPresent',
      '-or $_.LocalEnvFile',
    ]) {
      expect(checker).toContain(expected)
    }
  })

  it('checks variable visibility by name only without printing values', () => {
    const checker = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      'NON_PRODUCTION_APP_URL',
      'QA_STAFF_EMAIL',
      'QA_STAFF_PASSWORD',
      'QA_GOOGLE_CALENDAR_EMAIL',
      'QA_GOOGLE_CALENDAR_PASSWORD',
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'QA_GOOGLE_SAME_PARISH_REQUEST_ID',
      'QA_GOOGLE_CROSS_PARISH_REQUEST_ID',
      'QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID',
      'QA_SAFE_GOOGLE_CALENDAR_ID',
      'QA_GOOGLE_RECONNECT_ALLOWED',
      '[bool][Environment]::GetEnvironmentVariable($name, "User")',
      'Missing required Google Calendar browser QA variable(s):',
    ]) {
      expect(checker).toContain(expected)
    }

    expect(checker).not.toContain('Write-Host $')
  })
})
