import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI reply safe audit event validator documentation', () => {
  it('documents the non-runtime safe audit event boundary', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_REPLY_SAFE_AUDIT_EVENT_VALIDATOR_20260708.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')

    for (const required of [
      'AI Reply Safe Audit Event Validator',
      'non-runtime safety validator',
      'does not write audit events',
      'does not wire the live route',
      'does not enable feature flags',
      'does not call OpenAI',
      'does not send email',
      'table: `audit_events`',
      'action: `ai.reply.audit_metadata_prepared`',
      'target type: `communication_draft`',
      'feature id: `email_draft`',
      'output destination: `draft_only`',
      'model/provider family: `not_invoked`',
      'active parish matching event parish',
      'raw prompt storage',
      'provider payload storage',
      'token material storage',
      'unexpected metadata keys such as `rawPrompt`',
      'Production AI reply audit writing remains `NO-GO`',
    ]) {
      expect(doc).toContain(required)
    }

    expect(readme).toContain('docs/AI_REPLY_SAFE_AUDIT_EVENT_VALIDATOR_20260708.md')
    expect(buildStatus).toContain('AI Reply Safe Audit Event Validator')
  })
})
