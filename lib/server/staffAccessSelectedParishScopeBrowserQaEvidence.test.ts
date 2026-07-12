import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'STAFF_ACCESS_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md'
)

describe('staff access selected parish scope browser QA evidence', () => {
  it('records completed shared-QA browser verification for Staff Access parish scope labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Staff access is scoped to Vinea QA Google Calendar Parish A.',
      'Staff access is scoped to Vinea QA Google Calendar Parish B.',
      'STAFF_ACCESS_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents the stale Settings reload issue that browser QA found and fixed', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Issue Found And Fixed',
      'client-loaded Settings content still displayed Parish A',
      'server-validated active parish id',
      'reloads its client-fetched parish settings',
      'Staff Access API authorization path was not changed',
      'Operational RLS was not changed',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that production, migrations, RLS, Google Calendar, and records were not touched', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar routes and data were not touched',
      'staff records were not mutated',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record credentials, database URLs, tokens, fixture UUIDs, or signed URLs', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'QA_STAFF_PASSWORD',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'postgresql://',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
