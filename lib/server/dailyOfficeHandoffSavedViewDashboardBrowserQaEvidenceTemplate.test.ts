import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Office Handoff saved-view dashboard browser QA evidence template', () => {
  const templatePath =
    'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_EVIDENCE_TEMPLATE_20260708.md'

  it('defines label-only evidence fields without running browser QA', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_EVIDENCE_TEMPLATE_PREPARED_20260708',
      'PREPARED - SAFE NON-PRODUCTION BROWSER QA EVIDENCE TEMPLATE',
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md',
      'label-only',
      'does not execute browser QA',
      'does not access production',
      'does not mutate records',
      'does not persist saved views',
      'does not send communications',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not generate certificates',
      'does not make public trust claims',
      '[FILL: safe non-production app target label only]',
      '[FILL: safe authenticated staff session label only]',
      'Production target used: `NO`',
      'Secrets captured: `NO`',
      'Raw IDs captured: `NO`',
      'Raw private data captured: `NO`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires health, placement, active parish, safe link, and empty-state evidence', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'HTTP 200 and `checks.schema: true`',
      'Safe staff session opens `/dashboard`',
      'Appears after the Daily Office Handoff Digest and before Parish Health Score',
      'Front desk opening view, Sacramental records handoff view, and Administrator closeout view visible',
      'Read-only/staff-reviewed/no-automation language visible',
      'Card reflects selected active parish A context',
      'do not show another parish',
      'switching to parish B updates context',
      'switching back restores parish A context',
      'Open only existing staff-reviewed queues',
      'Open only existing queue/detail paths',
      'no-cue fixture shows calm empty state',
      'do not imply canonical, pastoral, eligibility, certificate-generation, or register-mutation decisions',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires forbidden-control and no-op rollback evidence', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'Save controls or preference persistence controls',
      'Send, email, or outbound communication controls',
      'Export or download controls',
      'AI controls',
      'Storage, file, or signed URL controls',
      'Certificate generation controls',
      'Duplicate merge controls',
      'Automation controls',
      'Forms or mutation controls',
      'Raw metadata, raw IDs, secrets',
      'Rollback for this slice is code removal only',
      'Database cleanup required: `NO`',
      'Storage cleanup required: `NO`',
      'Migration rollback required: `NO`',
      'Export cleanup required: `NO`',
      'AI cleanup required: `NO`',
      'Communication cleanup required: `NO`',
      'Certificate cleanup required: `NO`',
      'Automation cleanup required: `NO`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('keeps production gates closed and forbids secret-shaped evidence', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'Browser QA decision: `[PASS / BLOCKED / FAIL]`',
      'Product owner review needed before pilot-ready wording: `YES`',
      'Production-sensitive gates remain closed: `YES`',
      'Public trust claims approved: `NO`',
      'Use this shape only after the browser run actually passes',
      'Production-sensitive gates and public trust claims remained closed.',
      'database URLs',
      'Supabase anon or service-role keys',
      'API keys',
      'bearer tokens',
      'JWTs',
      'OAuth tokens or refresh tokens',
      'plaintext family portal tokens',
      'token hashes',
      'signed URL values',
      'storage paths',
      'original filenames',
      'private document contents',
      'raw export contents',
      'raw audit metadata',
      'raw production record IDs',
      'staff passwords',
      'parishioner private contact details',
    ]) {
      expect(template).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'Bearer ',
      'sk-',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })

  it('is linked from current state docs without claiming completed browser QA', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain(
      'Daily Office Handoff Saved-View Dashboard Browser QA Evidence Template Prepared',
    )
    expect(roadmap).toContain(
      'Daily Office Handoff saved-view dashboard browser QA evidence template',
    )
    expect(sourceOfTruth).toContain(
      'Daily Office Handoff saved-view dashboard browser QA evidence template',
    )
    expect(buildStatus).toContain('does not run browser QA')
    expect(roadmap).toContain('browser QA evidence for the saved-view UI')
  })
})
