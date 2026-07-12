import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const actionsPath = join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts')

describe('request action audit parish wiring', () => {
  it('does not use primary parish lookup for request audit writing', () => {
    const source = readFileSync(actionsPath, 'utf8')

    expect(source).toContain("import { resolveRequestAuditParishId }")
    expect(source).not.toContain("import { fetchPrimaryParishId }")
    expect(source).toContain('resolveRequestAuditParishId(admin, input.requestId)')
    expect(source).toContain('parishId: auditParish.ok ? auditParish.parishId : null')
  })

  it('keeps key request action audit metadata on the shared request audit helper', () => {
    const source = readFileSync(actionsPath, 'utf8')

    for (const action of [
      'request.status.updated',
      'request.assignment.updated',
      'request.follow_up.updated',
      'request.note.created',
      'request.workflow_step.updated',
      'request.playbook.applied',
    ]) {
      expect(source).toContain(`action: '${action}'`)
    }

    for (const metadataKey of [
      'from: existing.status',
      'assignedStaffName: payload.assigned_staff_name',
      'to: next_follow_up_date',
      "source: 'staff_request_detail'",
      'noteLength: body.length',
      'stepId,',
      'addedCount: suggestion.missingItems.length',
    ]) {
      expect(source).toContain(metadataKey)
    }

    expect(source).not.toContain('summary: body.slice')
  })
})
