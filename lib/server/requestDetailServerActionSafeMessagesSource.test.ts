import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('Request Detail Server Action safe-message source boundary', () => {
  it('routes the main status, workflow-step, and waiting-on actions through safe messages', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain(
      "requestDetailClientServerActionErrorMessage('updateStatus', result.error)",
    )
    expect(source).toContain(
      "requestDetailClientServerActionErrorMessage('updateWorkflowStep', result.error)",
    )
    expect(source).toContain(
      "requestDetailClientServerActionErrorMessage('updateWaitingOn', result.error)",
    )
  })

  it('routes operational Request Detail component failures through safe messages', () => {
    const expectations: Array<[string, string]> = [
      ['AssignmentSection.tsx', "'updateAssignment', result.error"],
      ['EditRequestDetailsSection.tsx', "'saveIntakeDetails', result.error"],
      ['InternalNotesSection.tsx', "'addInternalNote', result.error"],
      ['NextFollowUpSection.tsx', "'updateFollowUp', result.error"],
      ['RequestCareCadenceCard.tsx', "'updateFollowUp', result.error"],
      ['WorkflowPlaybookBuilder.tsx', "'applyPlaybook', result.error"],
    ]

    for (const [file, expression] of expectations) {
      const source = read(`app/dashboard/requests/[id]/_components/${file}`)
      expect(source).toContain('requestDetailClientServerActionErrorMessage')
      expect(source).toContain(expression)
      expect(source).not.toContain('setMessage(result.error)')
    }
  })

  it('routes person link/create failures through separate safe actions', () => {
    const source = read(
      'app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx',
    )

    expect(source).toContain("'linkExistingPerson', result.error")
    expect(source).toContain("'createPersonProfile', result.error")
    expect(source).not.toContain('setMessage(result.error)')
  })

  it('keeps the helper free of raw Error objects and documents the boundary', () => {
    const helper = read('lib/requestDetailClientMessages.ts')
    const doc = read('docs/REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(helper).toContain('requestDetailAllowedServerActionMessages[action].has(message)')
    expect(helper).not.toContain('error instanceof Error')
    expect(doc).toContain('REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Request Detail Server Action Client Safe Messages - 2026-07-10')
    expect(roadmap).toContain('Request Detail Server Action Client Safe Messages boundary')
    expect(sourceOfTruth).toContain('Request Detail Server Action Client Safe Messages boundary')
  })
})
