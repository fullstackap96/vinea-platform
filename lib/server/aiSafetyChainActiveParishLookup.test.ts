import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readRepoFile(...parts: string[]) {
  return readFileSync(join(root, ...parts), 'utf8')
}

describe('AI safety-chain active parish request lookup boundary', () => {
  it('keeps summary and reply request contact lookup scoped to the selected active parish', () => {
    const summaryAdapter = readRepoFile('lib', 'server', 'aiSummarySafetyChainAdapter.ts')
    const replyAdapter = readRepoFile('lib', 'server', 'aiReplySafetyChainAdapter.ts')

    for (const source of [summaryAdapter, replyAdapter]) {
      expect(source).toContain('input: { readonly requestId: string; readonly activeParishId: string }')
      expect(source).toContain(".eq('id', input.requestId)")
      expect(source).toContain(".eq('parish_id', input.activeParishId)")
      expect(source).toContain('activeParishId: activeParishContext.activeParishId')
      expect(source).not.toContain('loadRequestAndParishioner(input.admin ?? createSupabaseServiceRoleClient(), requestId)')
    }
  })

  it('documents the safety boundary without opening production-sensitive gates', () => {
    const status = readRepoFile('docs', 'VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs', 'VINEA_ROADMAP.md')
    const ssot = readRepoFile('docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const evidence = readRepoFile(
      'docs',
      'AI_SAFETY_CHAIN_ACTIVE_PARISH_REQUEST_LOOKUP_20260708.md'
    )

    for (const doc of [status, roadmap, ssot, evidence]) {
      expect(doc).toContain('AI Safety Chain Active Parish Request Lookup')
      expect(doc).toContain('selected active parish')
    }

    expect(evidence).toContain('does not enable AI in production')
    expect(evidence).toContain('call OpenAI differently')
    expect(evidence).toContain('write AI audit events')
    expect(evidence).toContain('change operational RLS')
  })
})
