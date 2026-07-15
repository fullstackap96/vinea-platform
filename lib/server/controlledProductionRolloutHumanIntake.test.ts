import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const intakePath = join(
  repoRoot,
  'docs',
  'CONTROLLED_PRODUCTION_ROLLOUT_HUMAN_INTAKE_20260714.md',
)
const checkerPath = join(
  repoRoot,
  'scripts',
  'check-controlled-production-rollout-intake.mjs',
)

type Result = {
  decision: string
  productionApproved: boolean
  productionAccessed: boolean
  deploymentPromoted: boolean
  migrationsApplied: boolean
  flagsChanged: boolean
  printsValues: boolean
  releaseIdentityMatches: boolean
  requiredFieldCount: number
  confirmationFieldCount: number
  missingHumanInputCount: number
  invalidConfirmationCount: number
  forbiddenContentFound: boolean
}

function runChecker(): Result {
  const result = spawnSync(process.execPath, [checkerPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout) as Result
}

describe('controlled production rollout human intake', () => {
  it('binds the approved release identity and records intake readiness only', () => {
    const intake = readFileSync(intakePath, 'utf8')
    const result = runChecker()

    for (const marker of [
      'Current decision state: `READY_FOR_EXPLICIT_APPROVAL`',
      'https://vineaplatform.com',
      'f134b598308ddd78b5b6b81ee447bf5b1fb15937',
      'dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG',
      'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
      'RESTORED_TO_APPROVED_PRIOR_DEPLOYMENT',
    ]) {
      expect(intake).toContain(marker)
    }

    expect(result.decision).toBe('READY_FOR_EXPLICIT_APPROVAL')
    expect(result.releaseIdentityMatches).toBe(true)
    expect(result.productionApproved).toBe(false)
    expect(result.productionAccessed).toBe(false)
    expect(result.deploymentPromoted).toBe(false)
  })

  it('records every confirmed owner, fixture, window, and confirmation category', () => {
    const intake = readFileSync(intakePath, 'utf8')
    const result = runChecker()

    for (const marker of [
      'Required Owners And Channels',
      'Product owner',
      'Engineering rollout owner',
      'Security/data owner',
      'QA owner',
      'Monitoring owner',
      'Support owner',
      'Rollback owner',
      'Evidence owner',
      'Required Production-Safe Fixture Labels',
      'Safe staff account',
      'Authorized active parish A',
      'Authorized parish-switch target B',
      'Same-parish request',
      'Cross-parish or unauthorized denial request',
      'Imports read-only history',
      'Communications Center read-only view',
      'Required Rollout Window',
      'Availability And Scope Confirmations',
      'Alex Perez - Product Owner',
      'Alex Perez - Rollback Owner',
      'Production smoke staff account - password not recorded',
      'Production smoke authorized parish A',
      'Production smoke same-parish request - approved read-only fixture',
      '2026-07-15',
      '8:00 PM',
      '8:30 PM',
      'America/Chicago',
      '9:00 PM',
    ]) {
      expect(intake).toContain(marker)
    }

    expect(result.requiredFieldCount).toBe(26)
    expect(result.confirmationFieldCount).toBe(7)
    expect(result.missingHumanInputCount).toBe(0)
    expect(result.invalidConfirmationCount).toBe(0)
  })

  it('contains no embedded credentials or private fixture identifiers', () => {
    const intake = readFileSync(intakePath, 'utf8')
    const result = runChecker()

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'VERCEL_TOKEN=',
      'OPENAI_API_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'access_token=',
      'refresh_token=',
      'Bearer ',
      'X-Amz-Signature',
      'signedUrl=',
    ]) {
      expect(intake).not.toContain(forbidden)
    }

    expect(result.forbiddenContentFound).toBe(false)
    expect(result.printsValues).toBe(false)
    expect(result.migrationsApplied).toBe(false)
    expect(result.flagsChanged).toBe(false)
  })

  it('requires a separate exact approval even after intake completion', () => {
    const intake = readFileSync(intakePath, 'utf8')

    for (const marker of [
      'Completing it may advance the rollout only to `READY_FOR_EXPLICIT_APPROVAL`.',
      '`READY_FOR_EXPLICIT_APPROVAL` means only that the product owner may provide the exact separate approval language from the checkpoint.',
      'Until that separate approval is supplied, controlled production rollout remains `NO-GO`.',
      'production-sensitive flags',
      'separately locked capability',
    ]) {
      expect(intake).toContain(marker)
    }
  })
})
