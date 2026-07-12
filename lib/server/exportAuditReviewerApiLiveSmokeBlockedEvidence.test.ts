import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_BLOCKED.md'
)

describe('export audit reviewer API live non-production smoke blocked evidence', () => {
  it('records the no-go reason and missing non-secret fixture labels', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_BLOCKED_20260701`',
      'Current outcome: `LIVE NON-PRODUCTION EXPORT AUDIT REVIEWER API SMOKE BLOCKED; SAFE FIXTURE LABELS MISSING`',
      'Running a live HTTP/browser smoke with these placeholder values would violate the go/no-go checklist',
      '`SAFE_EXPORT_AUDIT_REVIEWER_QA_STAFF` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_PARISH_A` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DOWNLOADED_EVENT` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DENIED_EVENT` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DOWNLOADED_EVENT` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DENIED_EVENT` | No | Required before live smoke.',
      '`SAFE_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_FIXTURE` | No | Required before live smoke.',
      '`ROLLBACK_OWNER_NAME` | No | Required before live smoke.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('confirms no live route, production, flag, storage, signed-url, or mutation work happened', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Did not call `/api/health`.',
      'Did not call `/api/export-audit-reviewer`.',
      'Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`.',
      'Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK`.',
      'Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV`.',
      'Did not sign in as a staff user.',
      'Did not inspect live audit events.',
      'Did not mutate records.',
      'Did not access storage.',
      'Did not create signed URLs.',
      'Did not access production.',
      'Do not include passwords, tokens, cookies, database URLs, service-role keys, API keys, or raw audit metadata in the approval prompt.',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
