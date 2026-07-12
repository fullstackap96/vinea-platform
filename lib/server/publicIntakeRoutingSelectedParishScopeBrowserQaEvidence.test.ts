import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md'
)

describe('public intake routing selected parish scope browser QA evidence', () => {
  it('records completed shared-QA browser verification for Public Intake Routing parish scope labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Public intake routing is scoped to Vinea QA Google Calendar Parish A.',
      'Public intake routing is scoped to Vinea QA Google Calendar Parish B.',
      'Prepared, not live',
      'PUBLIC_INTAKE_ROUTING_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that the browser pass did not mutate public intake routing or protected surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'public intake routing metadata was not saved',
      'domains were not added or verified',
      'tokens were not created',
      'runtime public intake routing was not enabled',
      '"publicIntakeRoutingMetadataSaved": false',
      '"domainsAddedOrVerified": false',
      '"tokensCreated": false',
      '"runtimePublicIntakeRoutingEnabled": false',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the expected selected-parish refresh observation without marking it as a mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('short client refresh moment')
    expect(evidence).toContain('the Public Intake Routing selected-parish label matched the active parish')
    expect(evidence).toContain('no Save routing metadata')
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
