import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request funeral details active parish mutation route', () => {
  it('saves funeral details only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/funeral-details/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('requiredText(body?.deceasedName)')
    expect(source).toContain('optionalText(body?.familyRelationship)')
    expect(source).toContain('optionalDate(body?.dateOfDeath)')
    expect(source).toContain('optionalDate(body?.postFuneralFollowUpDate)')
    expect(source).toContain("error: 'Invalid funeral details update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? '') !== 'funeral'")
    expect(source).toContain(".from('funeral_request_details')")
    expect(source).toContain(".select('confirmed_service_at')")
    expect(source).toContain('.upsert(')
    expect(source).toContain('request_id: access.requestId')
    expect(source).toContain('deceased_name: deceasedName')
    expect(source).toContain('family_relationship: familyRelationship')
    expect(source).toContain('date_of_death: dateOfDeath')
    expect(source).toContain('funeral_home_or_location: funeralHomeOrLocation')
    expect(source).toContain('funeral_director_contact: funeralDirectorContact')
    expect(source).toContain('service_location: serviceLocation')
    expect(source).toContain('visitation_details: visitationDetails')
    expect(source).toContain('cemetery_or_committal: cemeteryOrCommittal')
    expect(source).toContain('readings_music_notes: readingsMusicNotes')
    expect(source).toContain('obituary_program_notes: obituaryProgramNotes')
    expect(source).toContain('post_funeral_follow_up_date: postFuneralFollowUpDate')
    expect(source).toContain('preferred_service_notes: preferredServiceNotes')
    expect(source).toContain('confirmed_service_at: detailRow?.confirmed_service_at ?? null')
    expect(source).toContain("onConflict: 'request_id'")
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!savedDetail?.request_id')
    expect(source).toContain("new Error('Funeral details were not saved.')")
    expect(source).toContain('Could not save funeral details.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.delete(')
  })

  it('requires confirmed detail persistence before audit history or success', () => {
    const source = read('app/api/requests/[id]/funeral-details/route.ts')
    const persistenceIndex = source.indexOf('!savedDetail?.request_id')
    const auditIndex = source.indexOf('await writeAuditEvent')
    const successIndex = source.indexOf('return NextResponse.json({ ok: true })')

    expect(persistenceIndex).toBeGreaterThan(-1)
    expect(auditIndex).toBeGreaterThan(persistenceIndex)
    expect(successIndex).toBeGreaterThan(auditIndex)
  })

  it('keeps the Request Detail funeral details save off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helper = source.slice(
      source.indexOf('async function runRequestTypeMutation'),
      source.indexOf('async function saveSuggestedDates'),
    )
    const block = source.slice(
      source.indexOf('async function saveFuneralDetails'),
      source.indexOf('async function saveConfirmedFuneralService'),
    )

    expect(block).toContain('await runRequestTypeMutation({')
    expect(block).toContain("action: 'saveFuneralDetails'")
    expect(block).toContain("endpoint: `/api/requests/${routeId}/funeral-details`")
    expect(helper).toContain("method: 'PATCH'")
    expect(helper).toContain("credentials: 'include'")
    expect(helper).toContain('requestDetailClientApiErrorMessage(action, data?.error)')
    expect(block).not.toContain(".from('funeral_request_details')")
    expect(block).not.toContain('.upsert(')
    expect(block).not.toContain('confirmed_service_at:')
  })

  it('allows only curated API messages for the funeral details route', () => {
    const source = read('lib/requestDetailClientMessages.ts')

    expect(source).toContain("| 'saveFuneralDetails'")
    expect(source).toContain('saveFuneralDetails: new Set')
    expect(source).toContain('Invalid funeral details update.')
    expect(source).toContain('Could not save funeral details.')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_FUNERAL_DETAILS_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/funeral-details/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request detail access loader')
    expect(doc).toContain('Funeral Details')
    expect(doc).toContain('does not touch Google Calendar data')
  })
})
