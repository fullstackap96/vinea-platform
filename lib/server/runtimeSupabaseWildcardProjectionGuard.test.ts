import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const RUNTIME_ROOTS = ['app', 'lib'] as const
const SOURCE_EXTENSION = /\.(?:ts|tsx)$/
const NON_RUNTIME_SOURCE = /\.(?:test|spec)\.(?:ts|tsx)$/
const WILDCARD_PROJECTION = /\.select\s*\(\s*(['"`])\s*\*/

function collectRuntimeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectRuntimeSources(path)
    if (!SOURCE_EXTENSION.test(entry.name) || NON_RUNTIME_SOURCE.test(entry.name)) return []
    return [path]
  })
}

describe('runtime Supabase wildcard projection guard', () => {
  it('keeps application runtime reads on explicit field contracts', () => {
    const findings = RUNTIME_ROOTS.flatMap((root) =>
      collectRuntimeSources(join(process.cwd(), root)).flatMap((path) => {
        const source = readFileSync(path, 'utf8')
        return WILDCARD_PROJECTION.test(source)
          ? [relative(process.cwd(), path).replaceAll('\\', '/')]
          : []
      }),
    )

    expect(
      findings,
      `Replace Supabase wildcard projections with an explicit view-specific contract: ${findings.join(', ')}`,
    ).toEqual([])
  })

  it('documents the guard scope and conservative production boundary', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'RUNTIME_SUPABASE_WILDCARD_PROJECTION_GUARD_20260710.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'RUNTIME_SUPABASE_WILDCARD_PROJECTION_GUARD_IMPLEMENTED_20260710',
      '`app/**/*.{ts,tsx}`',
      '`lib/**/*.{ts,tsx}`',
      'view-specific projection',
      'does not prove row-level authorization',
      'No production access',
      'all production-sensitive gates remain locked',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
