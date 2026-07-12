import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'WORKFLOW_TEMPLATES_SELECTED_PARISH_SCOPE_BROWSER_QA_20260629.md'
)

describe('workflow templates selected parish scope browser QA evidence', () => {
  it('records completed shared-QA browser verification for Workflow Templates parish scope labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against shared QA',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'Workflow templates are scoped to Vinea QA Google Calendar Parish A.',
      'Workflow templates are scoped to Vinea QA Google Calendar Parish B.',
      'WORKFLOW_TEMPLATES_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that the browser pass did not mutate templates or other protected surfaces', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar routes and data were not touched',
      'workflow templates were not mutated',
      'parish records were not mutated',
      '"workflowTemplatesMutated": false',
      '"secretsPrinted": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the expected client-refresh observation without marking it as a mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('short client refresh moment')
    expect(evidence).toContain('the Workflow Templates label matched the selected parish')
    expect(evidence).toContain('no Save step')
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
