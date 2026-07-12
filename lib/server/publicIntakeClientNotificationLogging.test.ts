import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

const publicIntakePages = [
  'app/baptism-request/page.tsx',
  'app/wedding-request/page.tsx',
  'app/funeral-request/page.tsx',
  'app/ocia-request/page.tsx',
  'app/join-parish-request/page.tsx',
]

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('public intake client notification logging', () => {
  it('uses sanitized notification logging on public intake pages', () => {
    for (const pagePath of publicIntakePages) {
      const source = readRepoFile(pagePath)

      expect(source).toContain(
        "from '@/lib/publicIntakeNotificationClient'"
      )
      expect(source).toContain('logPublicIntakeNotificationFailure(res.status)')
      expect(source).toContain('logPublicIntakeNotificationException()')
      expect(source).not.toContain('await res.text()')
      expect(source).not.toContain("console.warn('Request notification failed:'")
      expect(source).not.toContain("console.warn('Request notification error:'")
    }
  })

  it('keeps the client logger label-only and disabled in production', () => {
    const source = readRepoFile('lib/publicIntakeNotificationClient.ts')

    expect(source).toContain("process.env.NODE_ENV === 'production'")
    expect(source).toContain("[public-intake] staff notification failed")
    expect(source).toContain("[public-intake] staff notification exception")
    expect(source).toContain("statusLabel: Number.isFinite(status)")
    expect(source).toContain("statusLabel: 'network-or-client-error'")
    expect(source).not.toContain('error:')
    expect(source).not.toContain('message:')
    expect(source).not.toContain('response')
    expect(source).not.toContain('body')
  })
})
