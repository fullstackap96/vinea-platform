import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_API_NONPRODUCTION_QA_EVIDENCE_20260701.md'
)

describe('export audit reviewer API non-production QA evidence', () => {
  it('records the approved non-production scope and explicit no-go boundaries', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const required of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_API_NONPRODUCTION_QA_EVIDENCE_20260701`',
      'Environment identity: `local Vitest route harness`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`',
      'Production exports remain `NO-GO`.',
      'Production export monitoring remains `NO-GO`.',
      'Staff-facing dashboard UI remains `NO-GO`.',
      'Production export flags remain `NO-GO`.',
    ]) {
      expect(doc).toContain(required)
    }
  })

  it('documents the required QA gates and forbidden data exclusions', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const required of [
      'flag-off blocking before staff authentication',
      'production-environment blocking even when prototype flags are present',
      'staff authentication before parish scope or audit-event reads',
      'selected active parish membership scope',
      'forged active parish cookie denial before audit-event reads',
      'legacy primary-parish fallback denial because the prototype requires membership-backed scope',
      '`audit_events`-only read behavior',
      'selected active parish `parish_id` filtering',
      'approved export audit action filtering',
      'saved-filter behavior',
      'forbidden data exclusion from serialized responses',
      'rollback by disabling prototype flags',
      'raw audit metadata blobs',
      'raw requested field names',
      'raw blocked field names',
      'storage paths',
      'signed URLs',
      'database URLs',
      'service-role keys',
      'API keys',
      'AI prompts',
      'AI outputs',
      'sacramental/canonical detail',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
