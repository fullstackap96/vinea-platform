import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/imports/DashboardImportsPageClient.tsx'),
  'utf8',
)

describe('Data Imports history freshness boundary', () => {
  it('uses one abortable latest-request-wins history loader', () => {
    expect(source).toContain('const historyLoadSequenceRef = useRef(0)')
    expect(source).toContain('const historyLoadAbortRef = useRef<AbortController | null>(null)')
    expect(source).toContain('const loadSequence = ++historyLoadSequenceRef.current')
    expect(source).toContain('historyLoadAbortRef.current?.abort()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('const isLatestLoad = () => loadSequence === historyLoadSequenceRef.current')
    expect(source).toContain('if (!isLatestLoad()) return false')
  })

  it('invalidates and cancels the owned load when the selected-parish client unmounts', () => {
    const effect = source.slice(
      source.indexOf('useEffect(() => {'),
      source.indexOf('const mappedRows = useMemo'),
    )

    expect(effect).toContain('void loadHistory()')
    expect(effect).toContain('historyLoadSequenceRef.current += 1')
    expect(effect).toContain('historyLoadAbortRef.current?.abort()')
    expect(effect).not.toContain("fetch('/api/imports'")
  })

  it('keeps obsolete success and failure from changing visible parish history', () => {
    const loader = source.slice(
      source.indexOf('const loadHistory = useCallback'),
      source.indexOf('useEffect(() => {'),
    )

    expect(loader.indexOf('if (!isLatestLoad()) return false')).toBeLessThan(
      loader.indexOf('setHistory('),
    )
    expect(loader).toContain("error instanceof DOMException && error.name === 'AbortError'")
    expect(loader).toContain('if (!isLatestLoad() ||')
  })

  it('documents the selected-parish freshness and no-mutation boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/DATA_IMPORT_HISTORY_FRESHNESS_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'DATA_IMPORT_HISTORY_FRESHNESS_IMPLEMENTED_20260711',
      'latest-request-wins',
      'selected-parish remount',
      'No import or record mutation',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
