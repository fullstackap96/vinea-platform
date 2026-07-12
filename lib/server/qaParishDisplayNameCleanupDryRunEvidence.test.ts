import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'QA_PARISH_DISPLAY_NAME_CLEANUP_DRY_RUN_EVIDENCE_20260628.md'
)

describe('QA parish display name cleanup dry-run evidence', () => {
  it('records that the cleanup script was run as dry-run only against shared QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed as a dry-run only.',
      'gnfomgsuottcuueasfvi',
      'VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=QA_PARISH_DISPLAY_NAME_CLEANUP',
      '| Execute flag set | `No` |',
      '| Dry-run | `true` |',
      '"dryRun": true',
      '"execute": false',
      '"secretsPrinted": false',
      'DRY_RUN_COMPLETE_EXECUTE_NOT_APPROVED',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures only approved fixture variables, labels, and sanitized row state', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      '"idPresent": true',
      '"currentName":',
      '"currentPublicDisplayName":',
      '"present": false',
      '"length": 0',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record secrets or raw fixture ids', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'postgresql://',
      'sb-',
      'refresh_token',
      'access_token',
      'QA_STAFF_PASSWORD',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
