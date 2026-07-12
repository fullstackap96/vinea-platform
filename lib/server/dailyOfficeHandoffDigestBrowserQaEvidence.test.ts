import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('daily office handoff digest browser QA evidence', () => {
  it('records a passed read-only browser QA run for the handoff dashboard card', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md')

    for (const expected of [
      'Status: `PASSED - READ-ONLY LOCALHOST/SHARED-QA DAILY OFFICE HANDOFF BROWSER QA`',
      'DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_PASSED_20260705',
      'BROWSER_QA_PASSED',
      'HANDOFF_CARD_VISIBLE',
      'ACTIVE_PARISH_SWITCHING_VERIFIED',
      'SAFE_QUEUE_LINK_VERIFIED',
      '"browserQaExecuted": true',
      '"schema": true',
      '"supabase": true',
      '"parishes": true',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures active-parish switching, placement, signal alignment, and safe queue link evidence', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md')

    for (const expected of [
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      'afterDailyWorkHubOverview',
      'beforeParishHealthScore',
      'beforeWorkflowReminders',
      'beforeOperationalIntelligence',
      'parishAFirstContactGapsVisible',
      'parishAUnassignedWorkVisible',
      'signalsMatchedVisibleHealthAndOperationalSections',
      'requestsQueueOpened',
      'selectedParishScopingCopyVisible',
      '"notFound": false',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('preserves forbidden behavior and forbidden-control boundaries', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md')

    for (const expected of [
      '"buttons": 0',
      '"forms": 0',
      '"inputsSelectsTextareas": 0',
      '"downloadLinks": 0',
      '"riskyControls": 0',
      '"productionAccessed": false',
      '"recordsMutated": false',
      '"communicationsSent": false',
      '"aiCalled": false',
      '"exportsRun": false',
      '"storageAccessed": false',
      '"signedUrlsCreated": false',
      '"temporaryLocalServerStopped": true',
      'Records inserted, updated, linked, corrected, deleted, merged, or automatically matched | `NO`',
      'Public trust-center, backup/restore, export, RLS, monitoring, or compliance claim made | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps related docs current without adding secrets or raw identifiers', () => {
    const evidence = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_BROWSER_QA_EVIDENCE_20260705.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Daily Office Handoff Digest Browser QA Passed')
    expect(roadmap).toContain('Daily Office Handoff Digest Browser QA')
    expect(sourceOfTruth).toContain('Daily Office Handoff Digest Browser QA')

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
      'fbd34e8b',
      '7653197c',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
