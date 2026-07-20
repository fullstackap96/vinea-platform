import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const dashboard = read('app/dashboard/DashboardPageCore.tsx')
const carePlans = read('app/dashboard/DashboardFamilyCarePlans.tsx')

function block(startMarker: string, endMarker: string) {
  const start = dashboard.indexOf(startMarker)
  const end = dashboard.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return dashboard.slice(start, end)
}

describe('Daily Work Hub request mutation single-flight boundary', () => {
  it('locks individual mark-as-contacted before the request API', () => {
    const handler = block(
      'async function markFollowUpAsContacted',
      'async function completeCarePlanTouchpoint',
    )

    expect(dashboard).toContain('const followUpMarkContactedInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (followUpMarkContactedInFlightRef.current || workHubMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('followUpMarkContactedInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('runMarkFollowUpAsContactedCore(request)'),
    )
    expect(handler.indexOf('finally {')).toBeLessThan(
      handler.indexOf('followUpMarkContactedInFlightRef.current = false'),
    )
  })

  it('shares the mark-as-contacted lock with the sequential batch action', () => {
    const handler = block(
      'async function batchMarkFollowUpAsContacted()',
      'function selectAllFollowUpVisible()',
    )

    expect(handler).toContain(
      'if (followUpMarkContactedInFlightRef.current || workHubMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('followUpMarkContactedInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('runMarkFollowUpAsContactedCore(request)'),
    )
    expect(handler).toContain('finally {')
    expect(handler).toContain('followUpMarkContactedInFlightRef.current = false')
    expect(handler).toContain('setFollowUpBatchBusy(null)')
  })

  it('locks care touchpoint persistence before the request API', () => {
    const handler = block(
      'async function completeCarePlanTouchpoint',
      'function followUpQueueRow',
    )

    expect(dashboard).toContain('const careTouchpointInFlightRef = useRef(false)')
    expect(handler).toContain('if (careTouchpointInFlightRef.current)')
    expect(handler.indexOf('careTouchpointInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('/care-touchpoint`'),
    )
    expect(handler.indexOf('finally {')).toBeLessThan(
      handler.indexOf('careTouchpointInFlightRef.current = false'),
    )
  })

  it('freezes the visible care editor while its staff-reviewed snapshot saves', () => {
    expect(carePlans).toContain('const careTouchpointBusy = Boolean(completingPlanId)')
    expect(carePlans).toContain('aria-busy={loading || careTouchpointBusy}')
    expect(carePlans).toContain('aria-busy={completingPlanId === plan.requestId}')
    expect(
      carePlans.match(/disabled=\{careTouchpointBusy\}/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(6)
  })

  it('retains server-owned writes and removes matching browser Supabase writes', () => {
    const markCore = block(
      'async function runMarkFollowUpAsContactedCore',
      'async function draftFollowUpEmail',
    )
    const careHandler = block(
      'async function completeCarePlanTouchpoint',
      'function followUpQueueRow',
    )

    expect(markCore).toContain('/mark-contacted`')
    expect(careHandler).toContain('/care-touchpoint`')
    for (const handler of [markCore, careHandler]) {
      expect(handler).not.toContain(".from('request_communications')")
      expect(handler).not.toContain(".from('funeral_request_details')")
      expect(handler).not.toContain(".from('requests')")
    }
  })

  it('documents the verified server boundary and immediate no-op protection', () => {
    const evidence = read(
      'docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_REVERIFICATION_20260711.md',
    )
    for (const phrase of [
      'Daily Work Hub Active-Parish Request Mutation Reverification',
      'authenticated request APIs',
      'same-parish request ownership',
      'structured partial-success',
      'synchronous browser lock',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
