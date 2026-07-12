import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

function occurrences(source: string, marker: string): number {
  return source.split(marker).length - 1
}

describe('AI provider deadline source boundary', () => {
  const summary = read('app/api/ai/summary/route.ts')
  const reply = read('app/api/ai/reply/route.ts')

  it('covers every current summary and reply generation call', () => {
    expect(occurrences(summary, 'openai.responses.create(')).toBe(2)
    expect(occurrences(summary, 'createAiProviderRequestOptions()')).toBe(2)
    expect(occurrences(reply, 'openai.responses.create(')).toBe(1)
    expect(occurrences(reply, 'createAiProviderRequestOptions()')).toBe(1)
    expect(summary).toContain(
      "import { createAiProviderRequestOptions } from '@/lib/server/aiProviderDeadline'",
    )
    expect(reply).toContain(
      "import { createAiProviderRequestOptions } from '@/lib/server/aiProviderDeadline'",
    )
  })

  it('keeps authentication, safety gates, and prompt assembly before provider work', () => {
    const summaryProvider = summary.indexOf('openai.responses.create(')
    const replyProvider = reply.indexOf('openai.responses.create(')

    expect(summary.indexOf('requireStaffFromRequest(request)')).toBeLessThan(
      summaryProvider,
    )
    expect(summary.indexOf('getAiSummarySafetyRuntimeGate()')).toBeLessThan(
      summaryProvider,
    )
    expect(summary.indexOf('buildLegacySummaryPrompt(body, requestType)')).toBeLessThan(
      summary.lastIndexOf('openai.responses.create('),
    )
    expect(reply.indexOf('authorizeStaffUser(user)')).toBeLessThan(replyProvider)
    expect(reply.indexOf('getAiReplySafetyRuntimeGate()')).toBeLessThan(replyProvider)
    expect(reply.indexOf('buildLegacyReplyPrompt(body, requestType)')).toBeLessThan(
      replyProvider,
    )
  })

  it('documents timeout and unchanged AI approval boundaries', () => {
    const evidence = read('docs/AI_PROVIDER_DEADLINE_BOUNDARY_20260712.md')

    for (const phrase of [
      '`AbortSignal.timeout(30_000)`',
      'legacy staff-gated summary path',
      'safety-chain summary generation path',
      'legacy staff-gated reply-draft path',
      'does not enable any AI feature',
      'OpenAI called during verification: `NO`',
      'Customer-facing AI approved: `NO`',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
