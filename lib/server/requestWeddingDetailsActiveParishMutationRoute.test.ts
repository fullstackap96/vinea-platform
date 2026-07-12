import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request wedding details active parish mutation route', () => {
  it('saves wedding details only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/wedding-details/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('requiredText(body?.partnerOneName)')
    expect(source).toContain('optionalText(body?.partnerTwoName)')
    expect(source).toContain('optionalDate(body?.proposedWeddingDate)')
    expect(source).toContain('optionalText(body?.ceremonyNotes)')
    expect(source).toContain("error: 'Invalid wedding details update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? '') !== 'wedding'")
    expect(source).toContain(".from('wedding_request_details')")
    expect(source).toContain(".select('confirmed_ceremony_at')")
    expect(source).toContain('.upsert(')
    expect(source).toContain('request_id: access.requestId')
    expect(source).toContain('partner_one_name: partnerOneName')
    expect(source).toContain('partner_two_name: partnerTwoName')
    expect(source).toContain('proposed_wedding_date: proposedWeddingDate')
    expect(source).toContain('ceremony_notes: ceremonyNotes')
    expect(source).toContain('confirmed_ceremony_at: detailRow?.confirmed_ceremony_at ?? null')
    expect(source).toContain("onConflict: 'request_id'")
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!savedDetail?.request_id')
    expect(source).toContain("new Error('Wedding details were not saved.')")
    expect(source).toContain('Could not save wedding details.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.delete(')
  })

  it('requires confirmed detail persistence before audit history or success', () => {
    const source = read('app/api/requests/[id]/wedding-details/route.ts')
    const persistenceIndex = source.indexOf('!savedDetail?.request_id')
    const auditIndex = source.indexOf('await writeAuditEvent')
    const successIndex = source.indexOf('return NextResponse.json({ ok: true })')

    expect(persistenceIndex).toBeGreaterThan(-1)
    expect(auditIndex).toBeGreaterThan(persistenceIndex)
    expect(successIndex).toBeGreaterThan(auditIndex)
  })

  it('keeps the Request Detail wedding details save off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('async function saveWeddingDetails'),
      source.indexOf('async function saveConfirmedWeddingCeremony')
    )

    expect(block).toContain("fetch(`/api/requests/${routeId}/wedding-details`")
    expect(block).toContain("method: 'PATCH'")
    expect(block).toContain("credentials: 'include'")
    expect(block).toContain("requestDetailClientApiErrorMessage('saveWeddingDetails'")
    expect(block).toContain("requestDetailClientFailureMessage('saveWeddingDetails')")
    expect(block).not.toContain(".from('wedding_request_details')")
    expect(block).not.toContain('.upsert(')
    expect(block).not.toContain('confirmed_ceremony_at:')
  })

  it('allows only curated API messages for the wedding details route', () => {
    const source = read('lib/requestDetailClientMessages.ts')

    expect(source).toContain("| 'saveWeddingDetails'")
    expect(source).toContain('saveWeddingDetails: new Set')
    expect(source).toContain('Invalid wedding details update.')
    expect(source).toContain('Could not save wedding details.')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_WEDDING_DETAILS_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/wedding-details/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request detail access loader')
    expect(doc).toContain('Wedding Details')
    expect(doc).toContain('does not touch Google Calendar data')
  })
})
