import { describe, expect, it } from 'vitest'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()
const packetPath = join(
  repoRoot,
  'docs',
  'PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
)

describe('production CSP report-only approval packet', () => {
  const packet = readFileSync(packetPath, 'utf8')

  it('keeps CSP report-only behind explicit non-production approval', () => {
    expect(packet).toContain(
      'CSP REPORT-ONLY DESIGN READY FOR REVIEW; RUNTIME CSP NOT IMPLEMENTED',
    )
    expect(packet).toContain('Content-Security-Policy-Report-Only')
    expect(packet).toContain('enforcing `Content-Security-Policy` header remains `NO-GO`')
    expect(packet).toContain(
      'Approve non-production CSP report-only runtime implementation',
    )
  })

  it('requires owners, smoke gates, redaction, and rollback boundaries', () => {
    for (const required of [
      'Product owner',
      'Security/data owner',
      'Engineering owner',
      'QA owner',
      'Support owner',
      '/api/health',
      'Staff sign-in',
      'Dashboard loads and selected-parish switching works',
      'Public intake forms',
      'Family portal',
      'Google OAuth reconnect callback',
      'Forbidden Payloads',
      'Rollback Plan',
      'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('forbids secrets, production access, and sensitive runtime behavior', () => {
    for (const forbiddenBoundary of [
      'secrets or API keys',
      'auth tokens, family portal tokens, or signed URL values',
      'raw storage paths',
      'private document contents',
      'production parishioner data',
      'Do not add an enforcing Content-Security-Policy header',
      'access production',
      'apply migrations',
      'change operational RLS',
      'mutate records',
      'run exports',
      'call AI',
      'create signed URLs',
      'send communications',
      'generate certificates',
      'make public trust claims',
    ]) {
      expect(packet).toContain(forbiddenBoundary)
    }
  })
})
