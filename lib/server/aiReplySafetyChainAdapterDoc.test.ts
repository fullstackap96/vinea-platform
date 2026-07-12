import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI reply safety-chain adapter documentation', () => {
  it('documents the disabled-gate fail-closed adapter boundary', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_REPLY_SAFETY_CHAIN_ADAPTER_20260707.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const roadmap = readFileSync(join(root, 'docs', 'VINEA_ROADMAP.md'), 'utf8')
    const ssot = readFileSync(join(root, 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md'), 'utf8')

    for (const required of [
      'AI Reply Safety-Chain Adapter',
      'disabled-gate, fail-closed runtime safety adapter',
      'When the AI reply safety gate is off',
      'fails closed with `ai_reply_unavailable` before any OpenAI call',
      'authenticated staff before body parsing',
      'selected active parish context',
      'membership-validated active parish context',
      'primary-parish fallback only when no active parish cookie exists',
      'object-level `requestId` before lookup',
      'active parish matching the request parish',
      'permission-scoped reply retrieval DTO',
      'DTO-backed prompt assembly from safe source references only',
      'does not call OpenAI',
      'does not write audit events',
      'does not expose source display to staff UI',
      'does not send email or any outbound communication',
      'production AI reply safety-chain enablement',
      'Still `NO-GO`',
    ]) {
      expect(doc).toContain(required)
    }

    expect(readme).toContain('docs/AI_REPLY_SAFETY_CHAIN_ADAPTER_20260707.md')
    expect(roadmap).toContain('disabled-by-default fail-closed reply safety-chain adapter')
    expect(ssot).toContain('disabled-gate, fail-closed AI reply safety-chain adapter')
  })
})
