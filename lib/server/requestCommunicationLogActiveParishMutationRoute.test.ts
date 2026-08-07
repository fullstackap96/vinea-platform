import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request communication log active parish mutation route', () => {
  it('logs manual communication only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/communications/route.ts')

    expect(source).toContain('export async function POST')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("COMMUNICATION_METHODS = new Set(['email', 'phone', 'text', 'in_person', 'voicemail', 'other'])")
    expect(source).toContain('parseContactedAt')
    expect(source).toContain('parseOptionalNotes')
    expect(source).toContain('Invalid communication log.')
    expect(source).toContain('const MAX_BODY_BYTES = 64 * 1024')
    expect(source).toContain('readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(source).toContain('Communication log is too large.')
    expect(source).not.toContain('request.json()')
    expect(source).toContain(".from('request_communications')")
    expect(source).toContain('request_id: access.requestId')
    expect(source).toContain('contacted_at: contactedAt')
    expect(source).toContain('method')
    expect(source).toContain('notes')
    expect(source).toContain(".from('requests')")
    expect(source).toContain('last_contacted_at: contactedAt')
    expect(source).toContain('last_contact_method: method')
    expect(source).toContain('communication_notes: notes')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain(".select('id')")
    expect(source).toContain('!updateRes.data?.id')
    expect(source).toContain('Communication was logged, but Vinea could not update the request summary.')
    expect(source).toContain('Could not log communication.')
    expect(source).not.toContain(".eq('id', requestId)")
    expect(source).not.toContain(".eq('request_id', requestId)")
    expect(source).not.toContain(".select('*')")

    const authIndex = source.indexOf('const staff = await requireStaffFromRequest(request)')
    const bodyIndex = source.indexOf('const parsedBody = await readBoundedJsonBody', authIndex)
    const accessIndex = source.indexOf(
      'const access = await loadStaffScopedRequestDetailAccess',
      bodyIndex,
    )
    const insertIndex = source.indexOf(".from('request_communications').insert", bodyIndex)

    expect(authIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(authIndex)
    expect(accessIndex).toBeGreaterThan(bodyIndex)
    expect(insertIndex).toBeGreaterThan(accessIndex)
  })

  it('moves manual communication logging away from browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const logBlock = source.slice(
      source.indexOf('async function logCommunication'),
      source.indexOf('async function sendEmail')
    )

    expect(logBlock).toContain("fetch(`/api/requests/${routeId}/communications`")
    expect(logBlock).toContain("method: 'POST'")
    expect(logBlock).toContain("credentials: 'include'")
    expect(logBlock).toContain('contactedAt: contactedAtIso')
    expect(logBlock).toContain('method: commMethod')
    expect(logBlock).toContain('notes: commNotes')
    expect(logBlock).toContain("requestDetailClientApiErrorMessage('logCommunication'")
    expect(logBlock).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
    expect(logBlock).not.toContain(".from('request_communications')")
    expect(logBlock).not.toContain(".from('requests')")
    expect(logBlock).not.toContain('.insert(')
    expect(logBlock).not.toContain('.update({')
    expect(logBlock).not.toContain("recordRequestActivity('request.communication.logged'")
  })

  it('keeps audit ownership in the request API without storing communication notes', () => {
    const source = read('app/api/requests/[id]/communications/route.ts')

    expect(source).toContain("action: 'request.communication.logged'")
    expect(source).toContain('actorEmail: staff.staff.email')
    expect(source).toContain('parishId: access.parishId')
    expect(source).toContain('targetId: input.requestId')
    expect(source).toContain('communicationLogged: input.communicationLogged')
    expect(source).not.toContain('notes: input.notes')
  })

  it('allows only curated API messages for the manual communication log route', () => {
    const source = read('lib/requestDetailClientMessages.ts')

    expect(source).toContain("| 'logCommunication'")
    expect(source).toContain('logCommunication: new Set')
    expect(source).toContain('Invalid communication log.')
    expect(source).toContain('Could not log communication.')
    expect(source).toContain('Communication was logged, but Vinea could not update the request summary.')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_COMMUNICATION_LOG_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/communications/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('manual communication log')
    expect(doc).toContain('does not send communications')
  })

  it('documents the bounded no-write rejection boundary', () => {
    const doc = read('docs/REQUEST_COMMUNICATION_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'REQUEST_COMMUNICATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`64 KiB`',
      'Staff authentication remains before body parsing',
      'Active-parish request ownership remains before both writes',
      'Rejected bodies do not create communication rows or update request summaries',
      'does not send communications',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
