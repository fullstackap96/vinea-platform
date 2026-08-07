import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const header = read('app/dashboard/requests/[id]/_components/RequestHeader.tsx')
const assignment = read('app/dashboard/requests/[id]/_components/AssignmentSection.tsx')
const followUp = read('app/dashboard/requests/[id]/_components/NextFollowUpSection.tsx')
const careCadence = read(
  'app/dashboard/requests/[id]/_components/RequestCareCadenceCard.tsx',
)
const requestConfirmation = read('lib/requestDetailClientMutationConfirmation.ts')

describe('Request Detail ownership and follow-up confirmation deadline boundary', () => {
  it('shares one 60-second Request Detail confirmation contract', () => {
    expect(requestConfirmation).toContain(
      'export const REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS = 60_000',
    )
    expect(requestConfirmation).toContain('awaitClientMutationConfirmation(')
    for (const source of [page, header, assignment, followUp, careCadence]) {
      expect(source).toContain('awaitRequestDetailClientMutationConfirmation')
    }
  })

  it('locks every ownership and follow-up surface after uncertainty', () => {
    for (const source of [header, assignment, followUp, careCadence]) {
      expect(source).toContain('mutationRequiresRefresh')
      expect(source).toContain('onMutationUnconfirmed?.()')
      expect(source).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
      expect(source).toContain('mutationBusy')
    }
    expect(page.match(/onMutationUnconfirmed=\{\(\) => setWorkflowMutationRequiresRefresh\(true\)\}/g)).toHaveLength(4)
  })

  it('keeps explicit Server Action rejections retryable', () => {
    expect(page).toContain(
      "error: requestDetailClientServerActionErrorMessage('updateWaitingOn', result.error)",
    )
    expect(assignment).toContain(
      "requestDetailClientServerActionErrorMessage('updateAssignment', result.error)",
    )
    expect(followUp.match(/requestDetailClientServerActionErrorMessage\('updateFollowUp', result\.error\)/g)).toHaveLength(2)
    expect(careCadence).toContain(
      "requestDetailClientServerActionErrorMessage('updateFollowUp', result.error)",
    )
  })

  it('requires positive post-save refresh confirmation', () => {
    expect(page).toContain('return await loadRequestCore(controller.signal)')
    expect(page).toContain('return true')
    expect(page).toContain('return false')
    for (const source of [assignment, followUp, careCadence]) {
      expect(source).toContain('if (refreshed === false)')
    }
    expect(page).toContain("throw new Error('Request refresh failed after waiting-on update.')")
  })

  it('does not replay an uncertain Server Action', () => {
    expect(assignment.match(/updateRequestAssignment\(/g)).toHaveLength(1)
    expect(followUp.match(/updateRequestNextFollowUpDate\(/g)).toHaveLength(2)
    expect(careCadence.match(/updateRequestNextFollowUpDate\(/g)).toHaveLength(1)
    expect(page.match(/updateRequestWaitingOn\(/g)).toHaveLength(1)
    for (const source of [header, assignment, followUp, careCadence]) {
      expect(source).not.toContain('while (')
    }
  })
})
