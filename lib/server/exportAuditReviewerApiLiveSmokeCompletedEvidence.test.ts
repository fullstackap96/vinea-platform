import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_COMPLETED.md'
)
const jsonEvidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701.json'
)
const runnerPath = join(process.cwd(), 'scripts', 'run-export-audit-reviewer-api-live-smoke.mjs')

describe('export audit reviewer API live non-production smoke completed evidence', () => {
  it('records the approved live smoke outcome, flags, fixtures, and rollback boundary', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_COMPLETED_20260701`',
      'Current outcome: `LIVE NON-PRODUCTION EXPORT AUDIT REVIEWER API SMOKE PASSED; PRODUCTION EXPORTS REMAIN NO-GO`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV`',
      'Staff fixture label: `Existing non-production QA staff environment values, not printed`',
      'Active parish fixture label: `Derived active parish with display name`',
      'Cross-parish denial fixture: `forged_unauthorized_active_parish_cookie`',
      'Family/unauthenticated denial method: `unauthenticated_direct_route_access`',
      'Rollback by disabling flags',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('records passing route, saved-filter, denial, and forbidden-data checks', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Flag-off reviewer baseline | Reviewer unavailable before auth or data reads | HTTP `404`',
      'Staff authentication boundary | Unauthenticated/family substitute denied before data reads | HTTP `401`',
      'Selected active parish membership scope | Authenticated staff gets selected-parish reviewer summary only | HTTP `200`, `scopeSource: membership`',
      'Forged active parish denial | Unauthorized active parish cookie denied generically | HTTP `403`',
      '| `exports_downloaded_recent` | `200` | `7` | `membership` | `NO_GO` |',
      '| `exports_denied_recent` | `200` | `3` | `membership` | `NO_GO` |',
      '| `document_manifest_safety_review` | `200` | `6` | `membership` | `NO_GO` |',
      '| `request_list_basic_safety_review` | `200` | `4` | `membership` | `NO_GO` |',
      'raw CSV rows, raw export files, raw audit metadata blobs, storage paths, signed URLs, original filenames',
      'New approved export event count `0`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps sanitized JSON evidence aligned with the completed outcome', () => {
    const evidence = JSON.parse(readFileSync(jsonEvidencePath, 'utf8'))

    expect(evidence).toMatchObject({
      evidenceRecordId: 'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_20260701',
      productionTouched: false,
      productionFlagsEnabled: false,
      dashboardUiAdded: false,
      migrationsApplied: false,
      operationalRlsChanged: false,
      googleCalendarTouched: false,
      recordsMutated: false,
      storageAccessed: false,
      signedUrlsCreated: false,
      rawExportsExposed: false,
      secretsPrinted: false,
      finalOutcome: 'pass',
      productionExportsRemainNoGo: true,
    })
    expect(evidence.flagOffBaseline.health.schemaTrue).toBe(true)
    expect(evidence.flagOffBaseline.reviewerRoute.status).toBe(404)
    expect(evidence.flagOn.unauthenticated.status).toBe(401)
    expect(evidence.flagOn.forgedActiveParish.status).toBe(403)
    expect(evidence.flagOn.noNewExportDeliveryAuditEvents).toBe(true)
    expect(evidence.rollback.reviewerRoute.status).toBe(404)
  })

  it('keeps the live smoke runner guarded to local non-production and shared QA only', () => {
    const script = readFileSync(runnerPath, 'utf8')

    for (const expected of [
      "const APPROVAL = 'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE'",
      "const APPROVED_SUPABASE_HOST = 'gnfomgsuottcuueasfvi.supabase.co'",
      "throw new Error(`Refusing live smoke against non-local app host: ${app.hostname}`)",
      "throw new Error(`Refusing live smoke against unapproved Supabase host: ${supabase.host}`)",
      "throw new Error('Refusing live smoke while the current process is marked production.')",
      "NODE_ENV: 'development'",
      "VERCEL_ENV: 'preview'",
    ]) {
      expect(script).toContain(expected)
    }
  })
})
