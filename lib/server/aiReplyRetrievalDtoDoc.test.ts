import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function readRepoFile(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8')
}

describe('AI reply retrieval DTO documentation', () => {
  it('documents the non-runtime reply DTO boundary and forbidden production claims', () => {
    const doc = readRepoFile('docs/AI_REPLY_PERMISSION_SCOPED_RETRIEVAL_DTO_20260707.md')
    const policy = readRepoFile('docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md')
    const readme = readRepoFile('README.md')
    const status = readRepoFile('docs/VINEA_BUILD_STATUS.md')

    expect(doc).toContain('non-runtime AI safety DTO slice')
    expect(doc).toContain('wire `/api/ai/reply` to the DTO')
    expect(doc).toContain('call OpenAI through the new safety path')
    expect(doc).toContain('write AI audit events')
    expect(doc).toContain('send communications')
    expect(doc).toContain('Runtime use remains `NO_GO`')

    expect(policy).toContain('Non-Runtime AI Reply Retrieval DTO')
    expect(policy).toContain('AI REPLY RETRIEVAL DTO PREPARED, NOT WIRED INTO AI ROUTES')
    expect(policy).toContain('AI reply drafts are safe to send without staff review')

    expect(readme).toContain('docs/AI_REPLY_PERMISSION_SCOPED_RETRIEVAL_DTO_20260707.md')
    expect(status).toContain('AI Reply Permission-Scoped Retrieval DTO - 2026-07-07')
    expect(status).toContain('runtime reply safety-chain wiring')
  })
})
