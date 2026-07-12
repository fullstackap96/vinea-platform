import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'QA_PARISH_SELECTOR_BROWSER_VERIFICATION_20260628.md'
)

describe('QA parish selector browser verification evidence', () => {
  it('records shared-QA browser verification for cleaned parish selector labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      'Selecting Parish B changed the selected option',
      'Selecting Parish A changed the selected option',
      'BROWSER_VERIFICATION_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that production, migrations, RLS, and Google Calendar were not touched', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar routes and data were not touched',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record secrets or raw fixture ids', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'QA_STAFF_PASSWORD',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'postgresql://',
      'access_token',
      'refresh_token',
      'vinea_active_parish_id=',
      'QA_ACTIVE_PARISH_A_ID=',
      'QA_ACTIVE_PARISH_B_ID=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
