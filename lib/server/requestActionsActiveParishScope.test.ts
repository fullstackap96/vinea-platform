import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const actionsPath = join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts')

function readRepoFile(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8')
}

function readActions(): string {
  return readFileSync(actionsPath, 'utf8')
}

function functionBlock(source: string, name: string): string {
  const start = source.indexOf(`export async function ${name}`)
  if (start === -1) {
    throw new Error(`Missing request action ${name}`)
  }

  const nextFunction = source.indexOf('\nexport async function ', start + 1)
  const nextType = source.indexOf('\nexport type ', start + 1)
  const candidates = [nextFunction, nextType].filter((index) => index > start)
  const end = candidates.length ? Math.min(...candidates) : source.length

  return source.slice(start, end)
}

describe('request dashboard Server Actions active parish scope', () => {
  it('keeps core Request Detail mutations behind selected active-parish request ownership', () => {
    const source = readActions()

    expect(source).toContain('async function loadRequestActionAccess')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')

    for (const action of [
      'updateRequestStatus',
      'updateRequestWorkflowStepStatus',
      'updateRequestAssignment',
      'updateRequestNextFollowUpDate',
      'updateRequestWaitingOn',
      'applyWorkflowPlaybookChecklist',
      'addRequestNote',
      'saveRequestIntakeDetails',
    ]) {
      const block = functionBlock(source, action)

      expect(block).toContain('const access = await loadRequestActionAccess(supabase, requestId)')
      expect(block).toContain("return { ok: false, error: 'Request not found.' }")
      expect(block).toContain('access.requestId')
      expect(block).not.toContain(".eq('id', requestId)")
      expect(block).not.toContain(".eq('request_id', requestId)")
      expect(block).not.toContain('request_id: requestId')
    }
  })

  it('keeps request intake contact updates scoped to the verified request parish', () => {
    const block = functionBlock(readActions(), 'saveRequestIntakeDetails')

    expect(block).toContain(".eq('id', resolvedParishionerId)")
    expect(block).toContain(".eq('parish_id', access.parishId)")
    expect(block).toContain('requestId: verifiedRequestId')
    expect(block).toContain('request_id: access.requestId')
  })

  it('documents the Request Detail Server Action active-parish boundary', () => {
    const doc = readRepoFile('docs/REQUEST_ACTIONS_ACTIVE_PARISH_SERVER_ACTIONS_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Request Actions Active Parish Server Actions')
    expect(doc).toContain('loadRequestActionAccess')
    expect(doc).toContain('selected active-parish request ownership')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Request Actions Active Parish Server Actions')
    expect(roadmap).toContain('Request Actions Active Parish Server Actions')
    expect(sourceOfTruth).toContain('Request Actions Active Parish Server Actions')
  })
})
