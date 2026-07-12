import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  formatDashboardTechnicalError,
  isLikelyMissingColumnError,
} from './dashboardSupabaseError'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('dashboard Supabase error helpers', () => {
  it('redacts sensitive values from developer technical details', () => {
    const detail = formatDashboardTechnicalError({
      message:
        'Failed for alex@example.com with postgresql://postgres:secret@db.example.supabase.co/postgres and bearer Bearer eyJabc.def.ghi',
      code: 'PGRST204',
      details:
        'Token sk-test-secretvalue1234567890 was rejected for https://storage.example.test/private/path and 123e4567-e89b-42d3-a456-426614174000',
      hint: 'Use support@example.com instead',
    })

    expect(detail).toContain('message:')
    expect(detail).toContain('code: PGRST204')
    expect(detail).toContain('[redacted email]')
    expect(detail).toContain('[redacted database url]')
    expect(detail).toContain('Bearer [redacted token]')
    expect(detail).toContain('[redacted token]')
    expect(detail).toContain('[redacted url]')
    expect(detail).toContain('[redacted id]')
    expect(detail).not.toContain('alex@example.com')
    expect(detail).not.toContain('postgresql://')
    expect(detail).not.toContain('sk-test-secretvalue')
    expect(detail).not.toContain('support@example.com')
    expect(detail).not.toContain('storage.example.test')
    expect(detail).not.toContain('123e4567-e89b-42d3-a456-426614174000')
  })

  it('still detects missing column errors from the raw database message', () => {
    expect(
      isLikelyMissingColumnError({
        message: 'column private_email does not exist',
      })
    ).toBe(true)
  })

  it('does not pass raw error objects into dashboard console logging helpers', () => {
    const source = readRepoFile('lib/dashboardSupabaseError.ts')

    expect(source).toContain('safeDashboardLogValue')
    expect(source).toContain('redactDashboardErrorText')
    expect(source).toContain('console.error(`[dashboard] ${context}`, {')
    expect(source).toContain(
      "console.error('[dashboard]', ...args.map(safeDashboardLogValue))"
    )
    expect(source).not.toContain('error,')
    expect(source).not.toContain("console.error('[dashboard]', ...args)")
  })
})
