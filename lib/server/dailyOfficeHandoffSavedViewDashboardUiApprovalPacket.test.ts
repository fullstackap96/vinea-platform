import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Office Handoff saved-view dashboard UI approval packet', () => {
  it('records the original approval scope and the later read-only UI implementation boundary', () => {
    const packet = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_20260706.md'
    )

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_PREPARED_20260706',
      'PREPARED - NON-RUNTIME UI APPROVAL PACKET',
      'Superseded implementation note',
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_20260708.md',
      'does not implement UI',
      'Do not persist saved views',
      'Current status is `READ-ONLY UI WIRED; PERSISTENCE AND PRODUCTION-SENSITIVE BEHAVIOR REMAIN NO-GO`',
      'Approve non-production implementation of the read-only Daily Office Handoff saved-view dashboard UI only.',
    ]) {
      expect(packet).toContain(expected)
    }

    for (const expectedFile of [
      'app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx',
      'app/dashboard/DashboardPageCore.tsx',
      'lib/server/dashboardDailyOfficeHandoffSavedViewsUi.test.ts',
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_YYYYMMDD.md',
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_YYYYMMDD.md',
    ]) {
      expect(packet).toContain(expectedFile)
    }

    expect(packet).toContain('No API routes, migrations, database helpers')
  })

  it('requires browser QA, source tests, rollback, and forbidden-control checks', () => {
    const packet = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_20260706.md'
    )

    for (const expected of [
      '`/api/health` returns HTTP 200 with `checks.schema: true`',
      'Safe staff session opens `/dashboard`',
      'Switching between authorized parishes updates preset cues',
      'No save, send, export, download, certificate, AI, storage, signed URL, merge, automation, or mutation controls appear',
      'Records/certificate cues remain staff-reviewed',
      'The UI imports `buildDailyOfficeHandoffSavedViewPlan`',
      'The plan is derived from the existing Daily Office Handoff Digest',
      'Each required preflight gate satisfies its complete marker set',
      'a partial marker mention is not enough to pass',
      'Remove the saved-view UI component import from `DashboardPageCore`',
      'No database cleanup, migration rollback',
    ]) {
      expect(packet).toContain(expected)
    }

    for (const forbiddenSourceGuard of [
      '<button',
      '<form',
      'fetch(',
      'createClient(',
      '.insert(',
      '.update(',
      '.delete(',
      'createSignedUrl',
      'OpenAI',
      'resend',
      '/api/exports',
      '/api/ai',
      'localStorage',
      'sessionStorage',
    ]) {
      expect(packet).toContain(forbiddenSourceGuard)
    }
  })

  it('updates roadmap, SSoT, build status, and repo audit with the prepared packet', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const repoAudit = readRepoFile('docs/VINEA_REPO_AUDIT.md')

    expect(buildStatus).toContain('Daily Office Handoff Saved-View Dashboard UI Approval Packet Prepared')
    expect(roadmap).toContain('Daily Office Handoff saved-view dashboard UI approval packet')
    expect(sourceOfTruth).toContain('Daily Office Handoff saved-view dashboard UI approval packet')
    expect(buildStatus).toContain('Daily Office Handoff Saved-View Dashboard UI Wired')
    expect(roadmap).toContain('visible Daily Office Handoff saved-view dashboard UI')
    expect(sourceOfTruth).toContain('visible Daily Office Handoff saved-view dashboard UI')
    expect(repoAudit).toContain('Daily Office Handoff saved-view dashboard UI approval packet')
  })
})
