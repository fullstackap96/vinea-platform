import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI summary safe audit event validation documentation', () => {
  it('documents the safe summary audit-event write boundary', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_SUMMARY_SAFE_AUDIT_EVENT_VALIDATION_20260708.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')
    const roadmap = readFileSync(join(root, 'docs', 'VINEA_ROADMAP.md'), 'utf8')

    for (const required of [
      'AI Summary Safe Audit Event Validation',
      'validateAiSummaryAuditEventForSafeWrite(...)',
      'before any `writeAuditEvent(...)` call',
      'successful validated audit write before the gated safe-response or generation paths',
      'table: `audit_events`',
      'action: `ai.summary.audit_metadata_prepared`',
      'target type: `request`',
      'feature id: `request_summary`',
      'output destination: `internal_summary`',
      'model/provider family: `not_invoked`',
      'active parish matching event parish',
      'raw prompt storage',
      'provider payload storage',
      'token material storage',
      'unexpected metadata keys such as `rawPrompt`',
      'Production AI summary enablement remains `NO-GO`',
    ]) {
      expect(doc).toContain(required)
    }

    expect(readme).toContain('docs/AI_SUMMARY_SAFE_AUDIT_EVENT_VALIDATION_20260708.md')
    expect(buildStatus).toContain('AI Summary Safe Audit Event Validation')
    expect(roadmap).toContain('AI Summary Safe Audit Event Validation')
  })
})
