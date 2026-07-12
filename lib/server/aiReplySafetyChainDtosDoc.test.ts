import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const evidenceDoc = 'docs/AI_REPLY_DTO_BACKED_PROMPT_AND_RESPONSE_SCAFFOLD_20260707.md'
const read = (path: string) => readFileSync(path, 'utf8')

describe('AI reply DTO-backed prompt and response scaffold documentation', () => {
  it('documents the non-runtime production boundary and forbidden payloads', () => {
    const doc = read(evidenceDoc)

    expect(doc).toContain('Implemented as a non-runtime AI safety slice.')
    expect(doc).toContain('The live reply route is not wired to this path')
    expect(doc).toContain('OpenAI is not called through this path')
    expect(doc).toContain('audit events are not written')
    expect(doc).toContain('autonomous send disabled')
    expect(doc).toContain('family-facing output disabled')
    expect(doc).toContain('model/provider family set to `not_invoked`')

    for (const forbidden of [
      'raw prompt text',
      'generated output',
      'provider payloads',
      'token material',
      'signed URLs',
      'storage paths',
      'document contents',
      'internal note bodies',
      'communication bodies',
      'autonomous send controls',
    ]) {
      expect(doc).toContain(forbidden)
    }

    expect(doc).toContain('Still `NO-GO`')
    expect(doc).toContain('runtime `/api/ai/reply` safety-chain adapter wiring')
    expect(doc).toContain('customer-facing or production AI reply enablement')
  })

  it('is linked from the release-readiness documentation set', () => {
    const readme = read('README.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(readme).toContain(evidenceDoc)
    expect(buildStatus).toContain('AI Reply DTO-Backed Prompt and Response Scaffold - 2026-07-07')
    expect(buildStatus).toContain(evidenceDoc)
    expect(roadmap).toContain('DTO-backed reply prompt assembly')
    expect(ssot).toContain('DTO-backed AI reply prompt assembly')
  })
})
