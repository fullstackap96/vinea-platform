import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readSource(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('core record Server Action primary parish fallback boundary', () => {
  it.each([
    ['People', 'app/dashboard/people/actions.ts', 2],
    ['Households', 'app/dashboard/households/actions.ts', 1],
    ['Mass Intentions', 'app/dashboard/intentions/actions.ts', 2],
    ['Sacramental Records', 'app/dashboard/records/actions.ts', 1],
  ] as const)(
    '%s allows legacy fallback only when the active parish cookie is absent',
    (_label, path, expectedConditionalCount) => {
      const source = readSource(path)
      const conditionalMatches = source.match(
        /allowPrimaryParishFallback:\s*!requestedParishId/g,
      )

      expect(conditionalMatches).toHaveLength(expectedConditionalCount)
      expect(source).not.toMatch(/allowPrimaryParishFallback:\s*true/)
    },
  )
})
