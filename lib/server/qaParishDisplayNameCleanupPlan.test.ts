import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'cleanup-qa-parish-display-names.mjs')
const planPath = join(process.cwd(), 'docs', 'QA_PARISH_DISPLAY_NAME_CLEANUP_PLAN_20260628.md')

describe('QA parish display name cleanup plan', () => {
  it('documents a prepared-only non-production cleanup plan with no runtime or RLS changes', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Status: Prepared only.',
      'gnfomgsuottcuueasfvi',
      'Do not access production.',
      'Do not apply migrations.',
      'Do not change operational RLS.',
      'Do not touch Google Calendar.',
      'PREPARED_NOT_EXECUTED',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('documents the approved fixture ids, labels, dry-run behavior, and execute gate', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      '.env.google-calendar-browser-qa.local',
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      'VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=QA_PARISH_DISPLAY_NAME_CLEANUP',
      'VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTE=EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP',
      'Default to dry-run',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('guards the cleanup script to shared QA and dry-run-by-default execution', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'QA_PARISH_DISPLAY_NAME_CLEANUP',
      'EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP',
      'gnfomgsuottcuueasfvi',
      'Refusing to clean QA parish names outside shared QA',
      'Refusing production-looking app URL.',
      '.env.google-calendar-browser-qa.local',
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'must be a UUID',
      'requires distinct parish fixture ids',
      'dryRun: !execute',
      'secretsPrinted: false',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('limits future writes to approved parish display columns only', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "from('parishes')",
      "select('id, name, public_display_name')",
      'update({ name: label, public_display_name: label })',
      ".eq('id', id)",
      "Expected exactly one approved QA parish fixture row to be updated.",
      'postVerification',
      'updatedApprovedFixtureRows',
      'nameMatchesExpected',
      'publicDisplayNameMatchesExpected',
      'Post-update verification failed',
      "approvedColumns: ['name', 'public_display_name']",
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain("from('staff_users').update")
    expect(source).not.toContain("from('parish_memberships').update")
    expect(source).not.toContain("from('requests').update")
    expect(source).not.toContain('console.log(serviceRoleKey)')
    expect(source).not.toContain('console.log(supabaseUrl)')
  })
})
