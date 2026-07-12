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
      expect(source).toContain('queuePublicIntakeStaffNotification({')
      expect(source).not.toContain("await fetch('/api/request-notifications'")
      expect(source.indexOf('queuePublicIntakeStaffNotification({')).toBeLessThan(
        source.indexOf("setMessage('Request submitted successfully.')")
      )
      expect(source).not.toContain('await res.text()')
      expect(source).not.toContain("console.warn('Request notification failed:'")
      expect(source).not.toContain("console.warn('Request notification error:'")
    }
  })

  it('keeps the client logger label-only and disabled in production', () => {
    const source = readRepoFile('lib/publicIntakeNotificationClient.ts')
    const loggerSource = source.slice(
      0,
      source.indexOf('const PUBLIC_INTAKE_NOTIFICATION_TIMEOUT_MS')
    )

    expect(loggerSource).toContain("process.env.NODE_ENV === 'production'")
    expect(loggerSource).toContain("[public-intake] staff notification failed")
    expect(loggerSource).toContain("[public-intake] staff notification exception")
    expect(loggerSource).toContain("statusLabel: Number.isFinite(status)")
    expect(loggerSource).toContain("statusLabel: 'network-or-client-error'")
    expect(source).toContain('PUBLIC_INTAKE_NOTIFICATION_TIMEOUT_MS = 15_000')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('void Promise.resolve()')
    expect(loggerSource).not.toContain('error:')
    expect(loggerSource).not.toContain('message:')
    expect(loggerSource).not.toContain('response')
    expect(loggerSource).not.toContain('body')
  })
})
