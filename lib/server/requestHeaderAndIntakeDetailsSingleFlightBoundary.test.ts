import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const header = read('app/dashboard/requests/[id]/_components/RequestHeader.tsx')
const editDetails = read(
  'app/dashboard/requests/[id]/_components/EditRequestDetailsSection.tsx',
)

describe('Request Header and intake details single-flight boundary', () => {
  it('guards every request-status caller at the parent mutation boundary', () => {
    const handlerStart = page.indexOf('async function updateRequestStatus')
    const handlerEnd = page.indexOf('\nasync function updateWorkflowStepStatus', handlerStart)
    const handler = page.slice(handlerStart, handlerEnd)

    expect(page).toContain('const requestStatusInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (requestStatusInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('requestStatusInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('updateRequestStatusAction({'),
    )
    expect(handler).toContain('requestStatusInFlightRef.current = false')
    expect(page).toContain(
      'updating={requestStatusUpdating || workflowMutationRequiresRefresh}',
    )
    expect(header).toContain('disabled={updating}')
    expect(header).toContain('aria-busy={updating}')
  })

  it('distinguishes status persistence failure from post-save refresh failure', () => {
    expect(page).toContain(
      "requestDetailClientServerActionErrorMessage('updateStatus', result.error)",
    )
    expect(page).toContain(
      'Request status updated, but the refreshed request could not fully load.',
    )
  })

  it('mutually excludes waiting-on save and clear without optimistic clearing', () => {
    const persistStart = header.indexOf('async function persistWaitingOn')
    const persistEnd = header.indexOf('\n  async function handleSave()', persistStart)
    const persist = header.slice(persistStart, persistEnd)

    expect(header).toContain('const saveInFlightRef = useRef(false)')
    expect(persist).toContain('if (saveInFlightRef.current) return')
    expect(persist.indexOf('saveInFlightRef.current = true')).toBeLessThan(
      persist.indexOf('await onSave(next)'),
    )
    expect(persist.indexOf('await onSave(next)')).toBeLessThan(
      persist.indexOf("if (next === null) setValue('')"),
    )
    expect(header).toContain("requestDetailClientFailureMessage('saveWaitingOn')")
    expect(header).toContain("requestDetailClientFailureMessage('clearWaitingOn')")
    expect(header).toContain('aria-busy={saving}')
  })

  it('locks multi-field intake detail persistence and preserves post-save guidance', () => {
    expect(editDetails).toContain('const saveInFlightRef = useRef(false)')
    expect(editDetails).toContain('if (saveInFlightRef.current) return')
    expect(editDetails.indexOf('saveInFlightRef.current = true')).toBeLessThan(
      editDetails.indexOf('saveRequestIntakeDetails(payload)'),
    )
    expect(editDetails).toContain('saveInFlightRef.current = false')
    expect(editDetails).toContain('aria-busy={saving}')
    expect(editDetails).toContain(
      'Request details were saved, but the refreshed view could not load.',
    )
  })

  it('keeps waiting-on post-save activity failure separate from persistence', () => {
    expect(page).toContain(
      'The request was updated, but activity history could not refresh.',
    )
  })

  it('documents exact concurrency and partial-success boundaries', () => {
    const evidence = read(
      'docs/REQUEST_HEADER_AND_INTAKE_DETAILS_SINGLE_FLIGHT_BOUNDARY_20260711.md',
    )

    for (const phrase of [
      'Request Header And Intake Details Single-Flight Boundary',
      'Status',
      'Waiting On',
      'intake details',
      'partial-success',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
