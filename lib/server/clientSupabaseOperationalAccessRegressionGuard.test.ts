import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const approvedBrowserAuthFiles = [
  'app/dashboard/DashboardLayoutClient.tsx',
  'app/login/page.tsx',
] as const

function collectSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) return collectSourceFiles(path)
    return entry.endsWith('.ts') || entry.endsWith('.tsx') ? [path] : []
  })
}

function relativePath(path: string) {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

describe('Client Component Supabase operational access regression guard', () => {
  it('keeps browser Supabase imports limited to approved authentication surfaces', () => {
    const browserSupabaseFiles = collectSourceFiles(join(process.cwd(), 'app'))
      .filter((path) => {
        const source = readFileSync(path, 'utf8')
        return /^\s*['"]use client['"]/m.test(source) && source.includes('@/lib/supabase')
      })
      .map(relativePath)
      .sort()

    expect(browserSupabaseFiles).toEqual([...approvedBrowserAuthFiles].sort())
  })

  it.each(approvedBrowserAuthFiles)('%s uses browser Supabase for auth only', (path) => {
    const source = readFileSync(join(process.cwd(), path), 'utf8')

    expect(source).toContain('supabase.auth.')
    expect(source).not.toContain('supabase.from(')
    expect(source).not.toContain('supabase.storage')
    expect(source).not.toContain('supabase.functions')
    expect(source).not.toContain('supabase.rpc(')
    expect(source).not.toContain('@/lib/supabaseServiceServer')
  })

  it('documents server-owned operational writes and the auth exception', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_IMPLEMENTED_20260711',
      'no Client Component performs Supabase table, storage, function, or RPC access',
      'login and current-session logout',
      'server-owned Route Handlers or Server Actions',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
