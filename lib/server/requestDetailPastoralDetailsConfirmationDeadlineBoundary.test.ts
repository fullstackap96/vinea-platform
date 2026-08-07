import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const funeralSection = read(
  'app/dashboard/requests/[id]/_components/FuneralDetailsSection.tsx',
)
const weddingSection = read(
  'app/dashboard/requests/[id]/_components/WeddingDetailsSection.tsx',
)

function block(startMarker: string, endMarker: string) {
  const start = page.indexOf(startMarker)
  const end = page.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return page.slice(start, end)
}

describe('Request Detail pastoral-details confirmation deadline boundary', () => {
  it('routes Funeral and Wedding detail saves through the finite request-type helper', () => {
    const helper = block(
      'async function runRequestTypeMutation',
      'async function saveSuggestedDates',
    )
    const funeral = block(
      'async function saveFuneralDetails',
      'async function saveConfirmedFuneralService',
    )
    const wedding = block(
      'async function saveWeddingDetails',
      'async function saveConfirmedWeddingCeremony',
    )

    expect(helper).toContain(
      'signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(helper).toContain('if (!(await loadRequest()))')
    expect(helper.indexOf('if (!(await loadRequest()))')).toBeLessThan(
      helper.indexOf('setMessage(successMessage)'),
    )
    expect(funeral).toContain("action: 'saveFuneralDetails'")
    expect(funeral).toContain("endpoint: `/api/requests/${routeId}/funeral-details`")
    expect(wedding).toContain("action: 'saveWeddingDetails'")
    expect(wedding).toContain("endpoint: `/api/requests/${routeId}/wedding-details`")
  })

  it('uses one synchronous request-type lock across detail and schedule writes', () => {
    const helper = block(
      'async function runRequestTypeMutation',
      'async function saveSuggestedDates',
    )
    const requestTypeArea = block(
      'async function saveSuggestedDates',
      'function confirmConfirmedScheduleClear',
    )

    expect(page).toContain('const requestTypeMutationInFlightRef = useRef(false)')
    expect(helper).toContain(
      'if (requestTypeMutationInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(helper.indexOf('requestTypeMutationInFlightRef.current = true')).toBeLessThan(
      helper.indexOf('const res = await fetch(endpoint'),
    )
    expect(requestTypeArea.match(/await runRequestTypeMutation\(\{/g)).toHaveLength(11)
  })

  it('freezes every reviewed Funeral and Wedding detail field while unresolved', () => {
    expect(funeralSection).toContain('const mutationBusy = saving || mutationDisabled')
    expect(funeralSection.match(/disabled=\{mutationBusy\}/g)).toHaveLength(12)
    expect(funeralSection).toContain('disabled={mutationBusy || !deceasedName.trim()}')

    expect(weddingSection).toContain('const mutationBusy = saving || mutationDisabled')
    expect(weddingSection.match(/disabled=\{mutationBusy\}/g)).toHaveLength(4)
    expect(weddingSection).toContain('disabled={mutationBusy || !partnerOneName.trim()}')

    expect(page.match(/requestTypeMutationBusy \|\| workflowMutationRequiresRefresh/g)).toHaveLength(
      7,
    )
  })

  it('keeps validation before dispatch and never replays either detail save', () => {
    const helper = block(
      'async function runRequestTypeMutation',
      'async function saveSuggestedDates',
    )
    const funeral = block(
      'async function saveFuneralDetails',
      'async function saveConfirmedFuneralService',
    )
    const wedding = block(
      'async function saveWeddingDetails',
      'async function saveConfirmedWeddingCeremony',
    )

    expect(funeral.indexOf("if (!name) {")).toBeLessThan(
      funeral.indexOf('await runRequestTypeMutation({'),
    )
    expect(wedding.indexOf("if (!name) {")).toBeLessThan(
      wedding.indexOf('await runRequestTypeMutation({'),
    )
    expect(helper.match(/fetch\(/g)).toHaveLength(1)
    expect(helper).not.toContain('while (')
  })
})
