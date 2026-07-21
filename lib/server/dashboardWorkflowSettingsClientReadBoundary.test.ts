import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/DashboardPageCore.tsx'),
  'utf8',
)

function loaderSource() {
  const start = source.indexOf('async function loadParishWorkflowSettings')
  const end = source.indexOf('\n  function toTime', start)

  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

function selectedParishEffectSource() {
  const sequence = source.indexOf(
    'const loadSequence = ++parishWorkflowSettingsLoadSequenceRef.current',
  )
  const effectStart = source.lastIndexOf('useEffect(() => {', sequence)
  const effectEnd = source.indexOf('\n  const rowFiltersKey', sequence)

  expect(effectStart).toBeGreaterThanOrEqual(0)
  expect(effectEnd).toBeGreaterThan(sequence)
  return source.slice(effectStart, effectEnd)
}

describe('Daily Work Hub workflow settings client read boundary', () => {
  it('gives the selected-parish settings read a finite abortable deadline', () => {
    const loader = loaderSource()
    const effect = selectedParishEffectSource()

    expect(source).toContain('const PARISH_WORKFLOW_SETTINGS_LOAD_TIMEOUT_MS = 15_000')
    expect(effect).toContain('const controller = new AbortController()')
    expect(effect).toContain(
      '() => controller.abort(),\n      PARISH_WORKFLOW_SETTINGS_LOAD_TIMEOUT_MS,',
    )
    expect(loader).toContain('signal: AbortSignal')
    expect(loader).toContain('signal,')
    expect(effect).toContain('controller.abort()')
    expect(effect.match(/window\.clearTimeout\(timeoutId\)/g)).toHaveLength(3)
  })

  it('accepts rules only from the current selected parish and latest load', () => {
    const loader = loaderSource()
    const latestGuard = loader.indexOf('if (!isLatestLoad()) return')
    const parishGuard = loader.indexOf('responseParishId === expectedParishId')
    const stateWrite = loader.indexOf('setCareCadenceSlaRules(rules as CareCadenceSlaRules)')

    expect(source).toContain('const parishWorkflowSettingsLoadSequenceRef = useRef(0)')
    expect(loader).toContain(
      'loadSequence === parishWorkflowSettingsLoadSequenceRef.current',
    )
    expect(loader).toContain("const responseParishId = String(data?.parish?.id ?? '').trim()")
    expect(latestGuard).toBeGreaterThanOrEqual(0)
    expect(parishGuard).toBeGreaterThan(latestGuard)
    expect(stateWrite).toBeGreaterThan(parishGuard)
    expect(loader).toContain('!Array.isArray(rules)')
  })

  it('clears prior-parish rules before loading and invalidates cleanup settlement', () => {
    const effect = selectedParishEffectSource()
    const reset = effect.indexOf('setCareCadenceSlaRules(DEFAULT_CARE_CADENCE_SLA_RULES)')
    const dispatch = effect.indexOf('void loadParishWorkflowSettings({')

    expect(reset).toBeGreaterThanOrEqual(0)
    expect(dispatch).toBeGreaterThan(reset)
    expect(effect).toContain('expectedParishId: activeParishId')
    expect(effect).toContain(
      'if (parishWorkflowSettingsLoadSequenceRef.current === loadSequence)',
    )
    expect(effect).toContain('parishWorkflowSettingsLoadSequenceRef.current += 1')
    expect(effect).toContain('}, [activeParishId])')
  })

  it('keeps the bounded path credentialed and read-only', () => {
    const loader = loaderSource()

    expect(loader).toContain("fetch('/api/parish/settings'")
    expect(loader).toContain("credentials: 'include'")
    expect(loader).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(loader).not.toContain('createSignedUrl')
    expect(loader).not.toContain('supabase.storage')
    expect(loader).not.toContain('.from(')
  })
})
