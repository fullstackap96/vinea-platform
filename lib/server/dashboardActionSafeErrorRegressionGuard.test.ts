import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function listActionFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return listActionFiles(fullPath)
    if (entry.isFile() && entry.name === 'actions.ts') return [fullPath]
    return []
  })
}

const dashboardDir = join(process.cwd(), 'app', 'dashboard')

describe('dashboard action safe-error regression guard', () => {
  it('does not return raw database or provider message text from staff-facing action failures', () => {
    expect(statSync(dashboardDir).isDirectory()).toBe(true)

    const findings = listActionFiles(dashboardDir).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8')
      const relativePath = filePath.slice(process.cwd().length + 1)
      const patterns = [
        {
          name: 'raw Error.message in failed action return',
          pattern: /return\s+\{\s*ok:\s*false,\s*error:\s*[^}\n]+\.message\b/g,
        },
        {
          name: 'raw Supabase error message in failed action return',
          pattern: /return\s+\{\s*ok:\s*false,\s*error:\s*[^}\n]+Err\??\.message\b/g,
        },
        {
          name: 'messageFromError helper returned from action',
          pattern: /messageFromError\([^)]*\)/g,
        },
      ] as const

      return patterns.flatMap(({ name, pattern }) =>
        Array.from(source.matchAll(pattern), (match) => ({
          file: relativePath,
          name,
          match: match[0],
        }))
      )
    })

    expect(findings).toEqual([])
  })
})
