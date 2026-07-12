import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const setScriptPath = join(root, 'scripts', 'set-vercel-preview-qa-env.ps1')
const checkScriptPath = join(root, 'scripts', 'check-vercel-preview-qa-env.ps1')

describe('Vercel preview QA environment scripts', () => {
  it('requires explicit approval and reads the Vercel token without echoing it', () => {
    const script = readFileSync(setScriptPath, 'utf8')

    for (const expected of [
      'APPROVED_VERCEL_PREVIEW_QA',
      'Read-Host $Prompt -AsSecureString',
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      '[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)',
      'Refusing to save Vercel preview QA variables without the exact approval phrase.',
      'Save-UserEnvironmentValue',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('validates Vercel id shapes and can write a repo-local ignored env file', () => {
    const script = readFileSync(setScriptPath, 'utf8')
    const checker = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      'VERCEL_ORG_ID should look like a Vercel team/org/user id',
      'VERCEL_PROJECT_ID should look like a Vercel project id',
      '.env.vercel-preview-qa.local',
      'function Format-EnvFileLine',
      'Set-Content -LiteralPath $localEnvPath',
      'Saved repo-local ignored QA env file: .env.vercel-preview-qa.local',
    ]) {
      expect(script).toContain(expected)
    }

    for (const expected of [
      '.env.vercel-preview-qa.local',
      'LocalEnvFile = $localEnvPresent',
      '-or $_.LocalEnvFile',
    ]) {
      expect(checker).toContain(expected)
    }
  })

  it('checks variable visibility by name only without printing values', () => {
    const checker = readFileSync(checkScriptPath, 'utf8')

    for (const expected of [
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      '[bool][Environment]::GetEnvironmentVariable($name, "User")',
      'Missing required Vercel preview QA variable(s):',
    ]) {
      expect(checker).toContain(expected)
    }

    expect(checker).not.toContain('Write-Host $')
  })
})
