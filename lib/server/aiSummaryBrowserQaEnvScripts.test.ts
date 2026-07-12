import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const setScriptPath = join(root, 'scripts', 'set-ai-summary-browser-qa-env.ps1')
const checkScriptPath = join(root, 'scripts', 'check-ai-summary-browser-qa-env.ps1')

describe('AI summary browser QA environment scripts', () => {
  it('prompts for required values without echoing secret inputs and requires explicit approval', () => {
    const script = readFileSync(setScriptPath, 'utf8')

    for (const expected of [
      'APPROVED_NON_PRODUCTION_AI_SUMMARY_QA',
      'Read-Host $Prompt -AsSecureString',
      'QA_STAFF_PASSWORD',
      'OPENAI_API_KEY',
      'UseEnvLocalOpenAiKey',
      'WriteLocalEnvFile',
      'Read-EnvLocalValue "OPENAI_API_KEY"',
      '[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)',
      'Refusing a production-looking Vinea app host.',
      'Save-UserEnvironmentValue',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('sets every required disabled-by-default AI summary QA flag to the approved non-production values', () => {
    const script = readFileSync(setScriptPath, 'utf8')

    for (const expected of [
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME = "ENABLED"',
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK = "APPROVED_AI_SUMMARY_SAFETY_RUNTIME"',
      'VINEA_AI_SUMMARY_AUDIT_WRITE = "ENABLED"',
      'VINEA_AI_SUMMARY_AUDIT_WRITE_ACK = "APPROVED_AI_SUMMARY_AUDIT_WRITE"',
      'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE = "ENABLED"',
      'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK = "APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE"',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION = "ENABLED"',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK = "APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION"',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('can reuse the existing local OpenAI key without printing it', () => {
    const script = readFileSync(setScriptPath, 'utf8')

    for (const expected of [
      'function Read-EnvLocalValue',
      'Join-Path (Get-Location) ".env.local"',
      '$values.OPENAI_API_KEY = Read-EnvLocalValue "OPENAI_API_KEY"',
      'Use only one of -SkipOpenAiKey or -UseEnvLocalOpenAiKey.',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('can write a repo-local ignored QA env file for Codex visibility', () => {
    const script = readFileSync(setScriptPath, 'utf8')
    const checker = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      '.env.ai-summary-browser-qa.local',
      'function Format-EnvFileLine',
      'Set-Content -LiteralPath $localEnvPath',
      'Saved repo-local ignored QA env file: .env.ai-summary-browser-qa.local',
    ]) {
      expect(script).toContain(expected)
    }

    for (const expected of [
      '.env.ai-summary-browser-qa.local',
      'LocalEnvFile = $localEnvPresent',
      '-or $_.LocalEnvFile',
    ]) {
      expect(checker).toContain(expected)
    }
  })

  it('checks variable visibility by name only without printing values', () => {
    const script = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      'NON_PRODUCTION_APP_URL',
      'QA_STAFF_EMAIL',
      'QA_STAFF_PASSWORD',
      'QA_REQUEST_ID',
      'QA_CROSS_PARISH_REQUEST_ID',
      'QA_FAMILY_PORTAL_URL',
      'OPENAI_API_KEY',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK',
      '[bool][Environment]::GetEnvironmentVariable($name, "User")',
      'Missing required browser QA variable(s):',
    ]) {
      expect(script).toContain(expected)
    }

    expect(script).not.toContain('Write-Host $')
  })
})
