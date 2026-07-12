import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'HOUSEHOLD_DUPLICATES_SELECTED_PARISH_SCOPE_BROWSER_QA_20260630.md'
)

describe('household duplicates selected parish scope browser QA evidence', () => {
  it('records completed shared-QA browser verification for Household duplicate review parish scope labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Household duplicate review is scoped to Vinea QA Google Calendar Parish A.',
      'Household duplicate review is scoped to Vinea QA Google Calendar Parish B.',
      'HOUSEHOLD_DUPLICATES_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that the browser pass did not load duplicates or mutate protected surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'Find duplicates was not clicked',
      'duplicate households were not loaded',
      'households were not merged',
      '"findDuplicatesClicked": false',
      '"duplicateHouseholdsLoaded": false',
      '"householdsMerged": false',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the expected selected-parish refresh observation without marking it as a mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('short client refresh moment')
    expect(evidence).toContain(
      'the Household duplicate review selected-parish label matched the active parish'
    )
    expect(evidence).toContain('no Find duplicates click')
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
