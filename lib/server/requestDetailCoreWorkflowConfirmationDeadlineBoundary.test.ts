import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const checklist = read('app/dashboard/requests/[id]/_components/ChecklistSection.tsx')
const workflow = read(
  'app/dashboard/requests/[id]/_components/RequestWorkflowStepsSection.tsx',
)

function block(startMarker: string, endMarker: string) {
  const start = page.indexOf(startMarker)
  const end = page.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return page.slice(start, end)
}

describe('Request Detail core workflow confirmation deadline boundary', () => {
  it('bounds checklist fetch and Server Action confirmation at 60 seconds', () => {
    expect(page).toContain(
      'const REQUEST_DETAIL_WORKFLOW_MUTATION_CONFIRMATION_TIMEOUT_MS = 60_000',
    )
    expect(page).toContain('async function awaitRequestDetailMutationConfirmation<T>')
    expect(page).toContain('return await Promise.race([')
    expect(page).toContain(
      'signal: AbortSignal.timeout(REQUEST_DETAIL_WORKFLOW_MUTATION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(page.match(/await awaitRequestDetailMutationConfirmation\(/g)).toHaveLength(2)
  })

  it('requires explicit acknowledgement and treats uncertain outcomes as review-required', () => {
    const checklistHandler = block(
      'async function toggleChecklistItem',
      'async function updateRequestStatus',
    )
    const statusHandler = block(
      'async function updateRequestStatus',
      'async function updateWorkflowStepStatus',
    )
    const workflowHandler = block(
      'async function updateWorkflowStepStatus',
      'async function updateWaitingOn',
    )

    expect(checklistHandler).toContain('res.ok && data?.ok !== true')
    for (const handler of [checklistHandler, statusHandler, workflowHandler]) {
      expect(handler).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
      expect(handler).toContain('setWorkflowMutationRequiresRefresh(true)')
    }
  })

  it('freezes status, checklist, and workflow-step controls until refresh', () => {
    expect(page).toContain(
      'const [workflowMutationRequiresRefresh, setWorkflowMutationRequiresRefresh] =',
    )
    expect(page).toContain('updating={requestStatusUpdating || workflowMutationRequiresRefresh}')
    expect(page.match(/mutationRequiresRefresh=\{workflowMutationRequiresRefresh\}/g)).toHaveLength(2)
    expect(checklist).toContain(
      'const mutationBusy = Boolean(updatingItemId) || mutationRequiresRefresh',
    )
    expect(workflow).toContain(
      'const mutationBusy = Boolean(updatingStepId) || mutationRequiresRefresh',
    )
    expect(page).toContain(
      'const canConfirmMarkComplete = canMarkComplete && !workflowMutationRequiresRefresh',
    )
    expect(page).toContain('disabled={!canConfirmMarkComplete}')
    expect(page).toContain('if (!canConfirmMarkComplete) return')
  })

  it('resets the review lock only when staff navigate to a different request', () => {
    const routeResetEffect = block(
      "setEmailSubject('')",
      '  }, [routeId])',
    )

    expect(routeResetEffect).toContain('setWorkflowMutationRequiresRefresh(false)')
    expect(routeResetEffect).toContain('setConfirmMarkCompleteOpen(false)')
    expect(routeResetEffect).not.toContain('loadRequest()')
  })

  it('locks stale post-save views and keeps explicit failures retryable', () => {
    expect(page).toContain(
      'Request status updated, but the refreshed request could not fully load.',
    )
    expect(page).toContain(
      'Workflow step updated, but the refreshed request could not fully load.',
    )
    expect(page).toContain(
      'Checklist item updated, but the refreshed request could not load.',
    )
    expect(page).toContain(
      "requestDetailClientServerActionErrorMessage('updateStatus', result.error)",
    )
    expect(page).toContain(
      "requestDetailClientServerActionErrorMessage('updateWorkflowStep', result.error)",
    )
  })

  it('does not automatically replay any core workflow write', () => {
    const checklistHandler = block(
      'async function toggleChecklistItem',
      'async function updateRequestStatus',
    )
    const statusHandler = block(
      'async function updateRequestStatus',
      'async function updateWorkflowStepStatus',
    )
    const workflowHandler = block(
      'async function updateWorkflowStepStatus',
      'async function updateWaitingOn',
    )

    expect(checklistHandler.match(/fetch\(/g)).toHaveLength(1)
    expect(statusHandler.match(/updateRequestStatusAction\(/g)).toHaveLength(1)
    expect(workflowHandler.match(/updateRequestWorkflowStepStatus\(/g)).toHaveLength(1)
    for (const handler of [checklistHandler, statusHandler, workflowHandler]) {
      expect(handler).not.toContain('while (')
    }
  })
})
