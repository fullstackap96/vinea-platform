import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourcePath = join(process.cwd(), 'app', 'dashboard', 'records', 'actions.ts')

describe('sacramental record action safe errors', () => {
  it('logs unexpected database failures and returns stable staff-safe messages', () => {
    const source = readFileSync(sourcePath, 'utf8')

    expect(source).toContain('logServerError')
    expect(source).toContain('Could not create record.')
    expect(source).toContain('Could not update record.')
    expect(source).toContain('Could not verify selected person.')
    expect(source).toContain('Could not update person link. Refresh and try again.')

    expect(source).not.toContain('error: error?.message')
    expect(source).not.toContain('error: error.message')
    expect(source).not.toContain('error: personErr.message')
  })
})
