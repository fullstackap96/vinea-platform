import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md'

describe('request document client safe messages documentation', () => {
  it('documents the staff document panel client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Request Document Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/requestDocumentClientMessages.ts`')
    expect(doc).toContain(
      '`app/dashboard/requests/[id]/_components/RequestDocumentsSection.tsx`'
    )
    expect(doc).toContain('storage or family portal token tables are not configured')
    expect(doc).toContain(
      'raw backend, storage, signed URL, token, filename, or provider exception text'
    )
    expect(doc).toContain('raw `payload.error` text is not placed into the browser-side `Error.message` path')
    expect(doc).toContain('Active-parish-aware request document authorization')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change document authorization',
      'change signed URL duration',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
