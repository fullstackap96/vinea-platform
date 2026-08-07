import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentPaths = [
  'app/dashboard/intentions/new/NewMassIntentionPage.tsx',
  'app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx',
]

const sources = componentPaths.map((path) => readFileSync(join(process.cwd(), path), 'utf8'))

describe('Mass Intention priest directory client read boundary', () => {
  it('reads the validated nested parish settings projection', () => {
    for (const source of sources) {
      expect(source).toContain("import { parseParishSettingsResponse }")
      expect(source).toContain('parseParishSettingsResponse(await')
      expect(source).toContain('.parish.priest_names')
      expect(source).not.toMatch(/as \{ priest_names\?: string\[\] \}/)
    }
  })

  it('gives both optional directory reads the same finite deadline', () => {
    for (const source of sources) {
      expect(source).toContain('const PRIEST_DIRECTORY_READ_TIMEOUT_MS = 15_000')
      expect(source).toContain('let readTimeoutId: number | undefined')
      expect(source).toContain(
        'readTimeoutId = window.setTimeout(\n          () => controller.abort(),\n          PRIEST_DIRECTORY_READ_TIMEOUT_MS,\n        )',
      )
      expect(source).toContain('signal: controller.signal')
    }
  })

  it('clears the deadline after settlement and cancels obsolete work', () => {
    for (const source of sources) {
      expect(
        source.match(/if \(readTimeoutId !== undefined\) window\.clearTimeout\(readTimeoutId\)/g),
      ).toHaveLength(2)
      expect(source).toContain('cancelled = true')
      expect(source).toContain('controller.abort()')
      expect(source).toContain('if (cancelled) return')
    }
  })

  it('keeps directory failure optional and the existing free-text fallback available', () => {
    for (const source of sources) {
      expect(source).toContain(
        '// Priest directory is optional; free-text fallback remains available.',
      )
      expect(source).toContain('mergeAssigneeDirectoryOptions(')
    }
  })

  it('keeps the browser path credentialed and read-only', () => {
    for (const source of sources) {
      expect(source).toContain("fetch('/api/parish/settings'")
      expect(source).toContain("credentials: 'include'")
      expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
      expect(source).not.toContain('createSignedUrl')
      expect(source).not.toContain('supabase.storage')
    }
  })
})
