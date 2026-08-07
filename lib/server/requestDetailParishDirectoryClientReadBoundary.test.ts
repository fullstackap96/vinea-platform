import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/requests/[id]/page.tsx'),
  'utf8',
)

function parishDirectoryEffectSource() {
  const loader = source.indexOf('async function loadParishDirectories')
  const effectStart = source.lastIndexOf('useEffect(() => {', loader)
  const effectEnd = source.indexOf('  // Derived workflow state', loader)

  expect(effectStart).toBeGreaterThanOrEqual(0)
  expect(loader).toBeGreaterThan(effectStart)
  expect(effectEnd).toBeGreaterThan(loader)
  return source.slice(effectStart, effectEnd)
}

describe('Request Detail parish directory client read boundary', () => {
  it('uses the validated settings read model for the authoritative request parish', () => {
    const effect = parishDirectoryEffectSource()

    expect(source).toContain("import { parseParishSettingsResponse } from '@/lib/parishSettingsReadModels'")
    expect(effect).toContain('const requestParishId = request?.parish_id ?? null')
    expect(effect).toContain(
      'parseParishSettingsResponse(await res.json(), requestParishId)',
    )
    expect(effect).toContain('if (cancelled || !parsed) return')
    expect(effect).toContain('setParishStaffNames(parsed.parish.staff_names)')
    expect(effect).toContain('setParishPriestNames(parsed.parish.priest_names)')
    expect(effect).toContain('}, [request?.parish_id])')
  })

  it('clears prior-parish choices before dispatching a replacement read', () => {
    const effect = parishDirectoryEffectSource()
    const resetStaff = effect.indexOf('setParishStaffNames([])')
    const resetPriests = effect.indexOf('setParishPriestNames([])')
    const dispatch = effect.indexOf('if (requestParishId) void loadParishDirectories()')

    expect(effect).toContain('queueMicrotask(() => {')
    expect(resetStaff).toBeGreaterThanOrEqual(0)
    expect(resetPriests).toBeGreaterThan(resetStaff)
    expect(dispatch).toBeGreaterThan(resetPriests)
  })

  it('gives the optional read a finite deadline and cancels obsolete work', () => {
    const effect = parishDirectoryEffectSource()

    expect(source).toContain('const REQUEST_PARISH_DIRECTORY_LOAD_TIMEOUT_MS = 15_000')
    expect(effect).toContain('const controller = new AbortController()')
    expect(effect).toContain(
      '() => controller.abort(),\n          REQUEST_PARISH_DIRECTORY_LOAD_TIMEOUT_MS,',
    )
    expect(effect).toContain('signal: controller.signal')
    expect(effect).toContain('cancelled = true')
    expect(effect).toContain('controller.abort()')
    expect(
      effect.match(/if \(readTimeoutId !== undefined\) window\.clearTimeout\(readTimeoutId\)/g),
    ).toHaveLength(2)
  })

  it('keeps the directory path credentialed, optional, and read-only', () => {
    const effect = parishDirectoryEffectSource()

    expect(effect).toContain("fetch('/api/parish/settings'")
    expect(effect).toContain("credentials: 'include'")
    expect(effect).toContain(
      '// Directories are optional; assignment still works with preserved assignees.',
    )
    expect(effect).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(effect).not.toContain('createSignedUrl')
    expect(effect).not.toContain('supabase.storage')
    expect(effect).not.toContain('.from(')
  })
})
