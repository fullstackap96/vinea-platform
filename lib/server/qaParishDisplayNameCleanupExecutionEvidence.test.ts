import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTION_EVIDENCE_20260628.md'
)

describe('QA parish display name cleanup execution evidence', () => {
  it('records execute mode against shared QA only with exactly two approved rows updated', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA only.',
      'gnfomgsuottcuueasfvi',
      'VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=QA_PARISH_DISPLAY_NAME_CLEANUP',
      'VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTE=EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP',
      '| Dry-run | `false` |',
      '| Execute | `true` |',
      '| Approved fixture rows updated | `2` |',
      '"dryRun": false',
      '"execute": true',
      '"updatedApprovedFixtureRows": 2',
      'EXECUTION_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures sanitized post-verification for approved labels only', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      '"nameMatchesExpected": true',
      '"publicDisplayNameMatchesExpected": true',
      '"nameLength": 33',
      '"publicDisplayNameLength": 33',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record secrets, raw ids, or production evidence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'postgresql://',
      'refresh_token',
      'access_token',
      'QA_STAFF_PASSWORD',
      'vinea.app',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
