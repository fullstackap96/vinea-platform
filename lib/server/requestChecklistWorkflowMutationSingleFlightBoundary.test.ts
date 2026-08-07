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

describe('request checklist and workflow mutation single-flight boundary', () => {
  it('locks legacy checklist mutation before the active-parish request API', () => {
    const start = page.indexOf('async function toggleChecklistItem')
    const end = page.indexOf('\nasync function updateRequestStatus', start)
    const handler = page.slice(start, end)

    expect(page).toContain('const checklistMutationInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (checklistMutationInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('checklistMutationInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('fetch(`/api/requests/${routeId}/checklist-items/${itemId}`'),
    )
    expect(handler).toContain('checklistMutationInFlightRef.current = false')
    expect(handler).toContain("requestDetailClientApiErrorMessage('updateChecklistItem'")
    expect(handler).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
  })

  it('disables all legacy checklist toggles while showing the affected row', () => {
    expect(page).toContain('updatingItemId={checklistUpdatingId}')
    expect(checklist).toContain('const mutationBusy = Boolean(updatingItemId)')
    expect(checklist).toContain('aria-busy={mutationBusy}')
    expect(checklist).toContain('disabled={mutationBusy}')
    expect(checklist).toContain('updatingItemId === item.id')
    expect(checklist).toContain("? 'Saving...'")
  })

  it('locks all workflow-step changes through one parent mutation boundary', () => {
    const start = page.indexOf('async function updateWorkflowStepStatus')
    const end = page.indexOf('\nasync function updateWaitingOn', start)
    const handler = page.slice(start, end)

    expect(page).toContain('const workflowStepMutationInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (workflowStepMutationInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('workflowStepMutationInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('updateRequestWorkflowStepStatus({'),
    )
    expect(handler).toContain("'updateWorkflowStep', result.error")
    expect(handler).toContain("'updateWorkflowStep', result.error")
    expect(handler).toContain('workflowStepMutationInFlightRef.current = false')
  })

  it('disables every workflow-step action while one step persists', () => {
    expect(workflow).toContain('const mutationBusy = Boolean(updatingStepId)')
    expect(workflow).toContain('aria-busy={mutationBusy}')
    expect(workflow.match(/disabled=\{mutationBusy\}/g)).toHaveLength(4)
    expect(workflow).toContain("{isUpdating ? 'Saving...' : 'Mark complete'}")
    expect(workflow).toContain("{isUpdating ? 'Saving...' : 'Reopen'}")
  })

  it('separates confirmed persistence from refresh failures', () => {
    expect(page).toContain(
      'Checklist item updated, but the refreshed request could not load.',
    )
    expect(page).toContain(
      'Workflow step updated, but the refreshed request could not fully load.',
    )
    expect(page).toContain('setChecklistMessage(failureMessage)')
    expect(page).toContain('setWorkflowStepMessage(')
  })

  it('documents staff-review and no-idempotency boundaries', () => {
    const evidence = read(
      'docs/REQUEST_CHECKLIST_WORKFLOW_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md',
    )

    for (const phrase of [
      'Request Checklist And Workflow Mutation Single-Flight Boundary',
      'legacy checklist',
      'Workflow Steps',
      'staff-reviewed',
      'partial-success',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
