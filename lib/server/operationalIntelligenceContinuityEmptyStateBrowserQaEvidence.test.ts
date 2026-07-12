import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const evidencePath = join(
  repoRoot,
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_EVIDENCE_20260705.md'
)

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('operational intelligence continuity empty-state browser QA evidence', () => {
  it('records a passed read-only zero-continuity browser QA run', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `PASSED - READ-ONLY LOCALHOST/SHARED-QA ZERO-CONTINUITY EMPTY-STATE BROWSER QA`',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_EMPTY_STATE_BROWSER_QA_PASSED_20260705',
      'BROWSER_QA_PASSED',
      'ZERO_CONTINUITY_FIXTURE_CONFIRMED',
      '"browserQaExecuted": true',
      '"status": "PASSED"',
      '"schema": true',
      'Vinea QA Google Calendar Parish A',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the empty-state UI evidence for Daily Work Hub, Parish Health Score, and Operational Intelligence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Request-to-record continuity` showed `No record signals yet`',
      '`0 linked`, `0 need review`, and `0 certificate events`',
      'No records currently need request-link review',
      'Continuity clear',
      'does not link records, generate certificates, send reminders, or make sacramental/canonical decisions',
      'Records/documents insight said no selected-parish sacramental records currently need request-to-record continuity review',
      'Safe-use boundaries state the brief is read-only',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('preserves the safe route activity and forbidden behavior boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'active-parish context update only',
      '"recordMutationRoutes": false',
      '"exportRoutes": false',
      '"aiRoutes": false',
      '"storageRoutes": false',
      '"signedUrlRoutes": false',
      '"certificateRoutes": false',
      '"communicationSendRoutes": false',
      '"automationRoutes": false',
      'Production app or production database accessed | `NO`',
      'Records inserted, updated, linked, corrected, deleted, or automatically matched | `NO`',
      'AI route, export route, storage path, document file, or signed URL invoked | `NO`',
      'Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps related docs current without adding secrets or raw identifiers', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Continuity Empty-State Browser QA Passed')
    expect(roadmap).toContain('zero-continuity empty-state browser QA passed')
    expect(sourceOfTruth).toContain('passed zero-continuity continuity empty-state browser QA run')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_CLIENT_SECRET',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
