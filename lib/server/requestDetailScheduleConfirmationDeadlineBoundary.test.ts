import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const components = [
  read('app/dashboard/requests/[id]/_components/SuggestedDatesSection.tsx'),
  read('app/dashboard/requests/[id]/_components/ConfirmedBaptismDateSection.tsx'),
  read('app/dashboard/requests/[id]/_components/ConfirmedFuneralServiceSection.tsx'),
  read('app/dashboard/requests/[id]/_components/ConfirmedWeddingCeremonySection.tsx'),
  read('app/dashboard/requests/[id]/_components/ConfirmedOciaSessionSection.tsx'),
]

function block(startMarker: string, endMarker: string) {
  const start = page.indexOf(startMarker)
  const end = page.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return page.slice(start, end)
}

describe('Request Detail schedule confirmation deadline boundary', () => {
  it('owns every schedule write through one finite confirmation helper', () => {
    const helper = block('async function runRequestTypeMutation', 'async function saveSuggestedDates')

    expect(helper).toContain(
      'if (requestTypeMutationInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(helper).toContain(
      'signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(helper).toContain('res.ok && data?.ok !== true')
    expect(helper).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
    expect(helper).toContain('if (!(await loadRequest()))')
    expect(helper.indexOf('if (!(await loadRequest()))')).toBeLessThan(
      helper.indexOf('afterConfirmed?.()'),
    )
    expect(helper.match(/fetch\(/g)).toHaveLength(1)
    expect(helper).not.toContain('while (')
  })

  it('routes all request-type detail, proposal, save, and clear operations through the helper', () => {
    const scheduleArea = block('async function saveSuggestedDates', 'function confirmConfirmedScheduleClear')

    for (const action of [
      'saveSuggestedDates',
      'saveConfirmedDate',
      'clearConfirmedDate',
      'saveFuneralDetails',
      'saveFuneralService',
      'clearFuneralService',
      'saveWeddingDetails',
      'saveWeddingCeremony',
      'clearWeddingCeremony',
      'saveOciaSession',
      'clearOciaSession',
    ]) {
      expect(scheduleArea).toContain(`action: '${action}'`)
    }

    expect(scheduleArea.match(/await runRequestTypeMutation\(\{/g)).toHaveLength(11)
  })

  it('uses one synchronous lock and releases it only in finally', () => {
    const helper = block('async function runRequestTypeMutation', 'async function saveSuggestedDates')

    expect(page).toContain('const requestTypeMutationInFlightRef = useRef(false)')
    expect(page).toContain('const [requestTypeMutationBusy, setRequestTypeMutationBusy] = useState(false)')
    expect(helper.indexOf('requestTypeMutationInFlightRef.current = true')).toBeLessThan(
      helper.indexOf('const res = await fetch(endpoint'),
    )
    expect(helper).toContain('finally {')
    expect(helper).toContain('requestTypeMutationInFlightRef.current = false')
    expect(helper).toContain('setRequestTypeMutationBusy(false)')
  })

  it('freezes each reviewed schedule field without mislabeling inactive buttons as saving', () => {
    expect(page.match(/mutationDisabled=\{requestTypeMutationBusy \|\| workflowMutationRequiresRefresh\}/g)).toHaveLength(5)

    for (const component of components) {
      expect(component).toContain('const mutationBusy = saving || mutationDisabled')
      expect(component).toContain('disabled={mutationBusy}')
      expect(component).toContain("{saving ? 'Saving")
    }
  })

  it('clears local confirmed values only after positive acknowledgement and refresh', () => {
    const helper = block('async function runRequestTypeMutation', 'async function saveSuggestedDates')
    const scheduleArea = block('async function saveSuggestedDates', 'function confirmConfirmedScheduleClear')

    expect(helper.indexOf('data?.ok !== true')).toBeLessThan(helper.indexOf('afterConfirmed?.()'))
    expect(helper.indexOf('if (!(await loadRequest()))')).toBeLessThan(
      helper.indexOf('afterConfirmed?.()'),
    )
    expect(scheduleArea.match(/afterConfirmed: \(\) => setConfirmed/g)).toHaveLength(4)
  })
})
