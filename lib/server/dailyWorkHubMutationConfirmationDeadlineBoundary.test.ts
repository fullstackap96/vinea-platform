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

describe('Daily Work Hub mutation confirmation deadline boundary', () => {
  it('bounds mark-contacted and care-touchpoint confirmation', () => {
    expect(dashboard).toContain(
      'const DAILY_WORK_HUB_MUTATION_CONFIRMATION_TIMEOUT_MS = 60_000',
    )
    expect(
      dashboard.match(
        /signal: AbortSignal\.timeout\(DAILY_WORK_HUB_MUTATION_CONFIRMATION_TIMEOUT_MS\)/g,
      ),
    ).toHaveLength(2)
  })

  it('treats transport and malformed-success results as uncertain', () => {
    const mark = block(
      'async function runMarkFollowUpAsContactedCore',
      'async function draftFollowUpEmail',
    )
    const care = block(
      'async function completeCarePlanTouchpoint',
      'function followUpQueueRow',
    )

    for (const handler of [mark, care]) {
      expect(handler).toContain('res.ok && data.ok !== true')
      expect(handler).toContain("dashboardClientFailureMessage('confirmWorkHubMutation')")
    }
    expect(mark).toContain('uncertain: true')
    expect(care).toContain('setWorkHubMutationRequiresRefresh(true)')
  })

  it('freezes related Work Hub mutation controls until refresh', () => {
    expect(dashboard).toContain(
      'const [workHubMutationRequiresRefresh, setWorkHubMutationRequiresRefresh] =',
    )
    expect(dashboard).toContain(
      'if (followUpEmailInFlightRef.current || workHubMutationRequiresRefresh) return',
    )
    expect(dashboard).toContain(
      'if (followUpMarkContactedInFlightRef.current || workHubMutationRequiresRefresh) return',
    )
    expect(dashboard).toContain('const followUpGlobalBusy =\n      workHubMutationRequiresRefresh ||')
    expect(dashboard).toContain('loading ||\n    workHubMutationRequiresRefresh ||')
    expect(dashboard).toContain(
      'mutationRequiresRefresh={workHubMutationRequiresRefresh}',
    )
    expect(carePlans).toContain(
      'const careTouchpointBusy = Boolean(completingPlanId) || mutationRequiresRefresh',
    )
  })

  it('stops a sequential batch after its first unconfirmed write', () => {
    const batch = block(
      'async function batchMarkFollowUpAsContacted()',
      'function selectAllFollowUpVisible()',
    )

    expect(batch).toContain('for (const [index, id] of ids.entries())')
    expect(batch).toContain('if (result.uncertain)')
    expect(batch).toContain('failedIds.push(...ids.slice(index + 1))')
    expect(batch).toContain('break')
    expect(batch).toContain('if (!uncertain) await loadRequests(true)')
  })

  it('does not automatically replay either write', () => {
    const mark = block(
      'async function runMarkFollowUpAsContactedCore',
      'async function draftFollowUpEmail',
    )
    const care = block(
      'async function completeCarePlanTouchpoint',
      'function followUpQueueRow',
    )

    expect(mark.match(/fetch\(/g)).toHaveLength(1)
    expect(care.match(/fetch\(/g)).toHaveLength(1)
    expect(mark).not.toContain('while (')
    expect(care).not.toContain('while (')
  })
})
