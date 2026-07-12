import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI reply safe response exposure validator documentation', () => {
  it('keeps safe response exposure non-runtime, staff-reviewed, and production-blocked', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_REPLY_SAFE_RESPONSE_EXPOSURE_VALIDATOR_20260708.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')

    for (const required of [
      'AI Reply Safe Response Exposure Validator',
      'Implemented as a non-runtime safety validator.',
      'does not wire the live route',
      'does not return source display to clients',
      'does not call OpenAI',
      'does not send email',
      'AI_REPLY_RESPONSE_SCAFFOLD_VERSION',
      'not_returned_while_generation_disabled',
      'ai_reply_unavailable',
      'human approval required',
      'family-facing output disabled',
      'all private-material policy booleans set to `false`',
      'extra top-level keys',
      'raw prompt text',
      'generated output',
      'provider payloads',
      'token material',
      'storage paths',
      'signed URL values',
      'autonomous send controls',
      'Production AI reply safe-response exposure remains `NO-GO`',
      'lib/aiReplySafeResponseExposure.test.ts',
    ]) {
      expect(doc).toContain(required)
    }

    expect(readme).toContain('docs/AI_REPLY_SAFE_RESPONSE_EXPOSURE_VALIDATOR_20260708.md')
    expect(buildStatus).toContain('AI Reply Safe Response Exposure Validator')
  })
})
