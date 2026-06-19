'use server'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { parseParishionerFullName } from '@/lib/people'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type {
  RequestAssignmentUpdate,
  RequestNextFollowUpUpdate,
} from '@/lib/types/requests'
import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { normalizeRequestWaitingOn } from '@/lib/requestWaitingOn'
import { buildWorkflowPlaybookSuggestion } from '@/lib/workflowPlaybooks'

export type UpdateRequestAssignmentResult =
  | { ok: true }
  | { ok: false; error: string }

export type AddRequestNoteResult = { ok: true } | { ok: false; error: string }

export type UpdateRequestNextFollowUpDateResult =
  | { ok: true }
  | { ok: false; error: string }

export type UpdateRequestWaitingOnResult =
  | { ok: true }
  | { ok: false; error: string }

export type ApplyWorkflowPlaybookResult =
  | { ok: true; addedCount: number; skippedCount: number }
  | { ok: false; error: string }

function normalizeOptionalName(value: unknown): string | null {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : null
}

export async function updateRequestAssignment(input: {
  requestId: string
  assignedStaffName: unknown
  assignedPriestName: unknown
  assignedDeaconName: unknown
}): Promise<UpdateRequestAssignmentResult> {
  const requestId = String(input.requestId ?? '').trim()
  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const payload: RequestAssignmentUpdate = {
    assigned_staff_name: normalizeOptionalName(input.assignedStaffName),
    assigned_priest_name: normalizeOptionalName(input.assignedPriestName),
    assigned_deacon_name: normalizeOptionalName(input.assignedDeaconName),
  }

  const { error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', requestId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function updateRequestNextFollowUpDate(input: {
  requestId: string
  nextFollowUpDate: unknown
}): Promise<UpdateRequestNextFollowUpDateResult> {
  const requestId = String(input.requestId ?? '').trim()
  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }

  const raw = input.nextFollowUpDate
  let next_follow_up_date: string | null = null
  if (raw == null || raw === '') {
    next_follow_up_date = null
  } else {
    const parsed = parseFollowUpCalendarDate(raw)
    if (!parsed) {
      return { ok: false, error: 'Invalid follow-up date.' }
    }
    next_follow_up_date = parsed
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const payload: RequestNextFollowUpUpdate = { next_follow_up_date }

  const { error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', requestId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function updateRequestWaitingOn(input: {
  requestId: string
  waitingOn: unknown
}): Promise<UpdateRequestWaitingOnResult> {
  const requestId = String(input.requestId ?? '').trim()
  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }

  const raw = String(input.waitingOn ?? '').trim()
  const waiting_on = raw ? normalizeRequestWaitingOn(raw) : null
  if (raw && !waiting_on) {
    return { ok: false, error: 'Invalid waiting-for value.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: existing, error: existingError } = await supabase
    .from('requests')
    .select('waiting_on, waiting_on_changed_at')
    .eq('id', requestId)
    .single()

  if (existingError) {
    return { ok: false, error: existingError.message }
  }

  const existingWaitingOn = normalizeRequestWaitingOn(existing?.waiting_on)
  const blockerChanged = existingWaitingOn !== waiting_on
  const payload: {
    waiting_on: typeof waiting_on
    waiting_on_changed_at?: string | null
  } = {
    waiting_on,
  }
  if (blockerChanged) {
    payload.waiting_on_changed_at = waiting_on ? new Date().toISOString() : null
  }

  const { error } = await supabase.from('requests').update(payload).eq('id', requestId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function applyWorkflowPlaybookChecklist(input: {
  requestId: string
}): Promise<ApplyWorkflowPlaybookResult> {
  const requestId = String(input.requestId ?? '').trim()
  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('id, request_type')
    .eq('id', requestId)
    .single()

  if (requestError || !request) {
    return { ok: false, error: requestError?.message ?? 'Request not found.' }
  }

  const requestType = requestTypeFromRow(request as { request_type?: unknown })
  const { data: existingChecklist, error: checklistError } = await supabase
    .from('checklist_items')
    .select('item_name')
    .eq('request_id', requestId)

  if (checklistError) {
    return { ok: false, error: checklistError.message }
  }

  const suggestion = buildWorkflowPlaybookSuggestion({
    requestType,
    checklistItems: existingChecklist || [],
  })

  if (!suggestion) {
    return { ok: false, error: 'No playbook is available for this request type.' }
  }

  if (suggestion.missingItems.length === 0) {
    return {
      ok: true,
      addedCount: 0,
      skippedCount: suggestion.playbook.items.length,
    }
  }

  const admin = createSupabaseServiceRoleClient()
  const { error: insertError } = await admin.from('checklist_items').insert(
    suggestion.missingItems.map((item) => ({
      request_id: requestId,
      item_name: item.itemName,
      is_complete: false,
    }))
  )

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  return {
    ok: true,
    addedCount: suggestion.missingItems.length,
    skippedCount: suggestion.existingCount,
  }
}

export async function addRequestNote(input: {
  requestId: string
  body: unknown
}): Promise<AddRequestNoteResult> {
  const requestId = String(input.requestId ?? '').trim()
  const body = String(input.body ?? '').trim()

  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }
  if (!body) {
    return { ok: false, error: 'Note cannot be empty.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('request_notes').insert({
    request_id: requestId,
    body,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export type SaveRequestIntakeDetailsResult = { ok: true } | { ok: false; error: string }

export type SaveRequestIntakeDetailsInput = {
  requestId: string
  requestType: 'baptism' | 'funeral' | 'wedding' | 'ocia'
  parishionerId: string
  contactFullName: string
  contactEmail: string
  contactPhone: string
  intakeNotes: string | null
  baptism?: {
    childName: string | null
    preferredDates: string | null
  }
  funeral?: {
    deceasedName: string
    familyRelationship: string | null
    dateOfDeath: string | null
    funeralHome: string | null
    funeralDirectorContact: string | null
    serviceLocation: string | null
    visitationDetails: string | null
    cemeteryOrCommittal: string | null
    readingsMusicNotes: string | null
    obituaryProgramNotes: string | null
    postFuneralFollowUpDate: string | null
    preferredServiceNotes: string | null
  }
  wedding?: {
    partnerOneName: string
    partnerTwoName: string | null
    proposedWeddingDate: string | null
    ceremonyNotes: string | null
  }
  ocia?: {
    dateOfBirth: string | null
    ageOrDobNote: string | null
    sacramentalBackground: string
    seeking: string
    parishionerStatus: string
    preferredContactMethod: string
    availability: string | null
  }
}

/** Staff correction of intake: parishioner, `requests.notes`, and type-specific detail rows (not confirmed schedule fields). */
export async function saveRequestIntakeDetails(
  input: SaveRequestIntakeDetailsInput
): Promise<SaveRequestIntakeDetailsResult> {
  const requestId = String(input.requestId ?? '').trim()
  const clientParishionerId = String(input.parishionerId ?? '').trim()

  if (!requestId) {
    return { ok: false, error: 'Missing request id.' }
  }

  const fullName = String(input.contactFullName ?? '').trim()
  const email = String(input.contactEmail ?? '').trim()
  if (!fullName || !email) {
    return { ok: false, error: 'Contact name and email are required.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('parishioner_id, request_type')
    .eq('id', requestId)
    .single()

  if (reqErr || !reqRow?.parishioner_id) {
    return { ok: false, error: reqErr?.message ?? 'Request not found.' }
  }

  const resolvedParishionerId = String(reqRow.parishioner_id).trim()
  if (clientParishionerId && clientParishionerId !== resolvedParishionerId) {
    return {
      ok: false,
      error: 'This page is out of date. Refresh and try again.',
    }
  }

  const effectiveRequestType = requestTypeFromRow(reqRow as { request_type?: unknown })

  const phoneTrim = String(input.contactPhone ?? '').trim()
  const phone = phoneTrim.length > 0 ? phoneTrim : null
  const notes = String(input.intakeNotes ?? '').trim() || null

  const { data: updatedParishioners, error: pErr } = await supabase
    .from('parishioners')
    .update({
      full_name: fullName,
      email,
      phone,
    })
    .eq('id', resolvedParishionerId)
    .select('id')

  if (pErr) {
    return { ok: false, error: pErr.message }
  }
  if (!updatedParishioners?.length) {
    return {
      ok: false,
      error:
        'Could not save contact information. Refresh the page; if it persists, an administrator may need to allow staff updates on parishioner records.',
    }
  }

  if (effectiveRequestType === 'baptism') {
    const { error: rErr } = await supabase
      .from('requests')
      .update({
        notes,
        child_name: input.baptism?.childName ?? null,
        preferred_dates: input.baptism?.preferredDates ?? null,
      })
      .eq('id', requestId)

    if (rErr) {
      return { ok: false, error: rErr.message }
    }
    return { ok: true }
  }

  const { error: rNotesErr } = await supabase.from('requests').update({ notes }).eq('id', requestId)

  if (rNotesErr) {
    return { ok: false, error: rNotesErr.message }
  }

  if (effectiveRequestType === 'funeral') {
    const f = input.funeral
    if (!f || !f.deceasedName.trim()) {
      return { ok: false, error: 'Deceased name is required.' }
    }
    const { data: existing } = await supabase
      .from('funeral_request_details')
      .select('confirmed_service_at')
      .eq('request_id', requestId)
      .maybeSingle()

    const { error: fErr } = await supabase.from('funeral_request_details').upsert(
      {
        request_id: requestId,
        deceased_name: f.deceasedName.trim(),
        family_relationship: f.familyRelationship?.trim() || null,
        date_of_death: f.dateOfDeath || null,
        funeral_home_or_location: f.funeralHome?.trim() || null,
        funeral_director_contact: f.funeralDirectorContact?.trim() || null,
        service_location: f.serviceLocation?.trim() || null,
        visitation_details: f.visitationDetails?.trim() || null,
        cemetery_or_committal: f.cemeteryOrCommittal?.trim() || null,
        readings_music_notes: f.readingsMusicNotes?.trim() || null,
        obituary_program_notes: f.obituaryProgramNotes?.trim() || null,
        post_funeral_follow_up_date: f.postFuneralFollowUpDate || null,
        preferred_service_notes: f.preferredServiceNotes?.trim() || null,
        confirmed_service_at: existing?.confirmed_service_at ?? null,
      },
      { onConflict: 'request_id' }
    )

    if (fErr) {
      return { ok: false, error: fErr.message }
    }
    return { ok: true }
  }

  if (effectiveRequestType === 'wedding') {
    const w = input.wedding
    if (!w || !w.partnerOneName.trim()) {
      return { ok: false, error: 'Partner name is required.' }
    }
    const { data: existing } = await supabase
      .from('wedding_request_details')
      .select('confirmed_ceremony_at')
      .eq('request_id', requestId)
      .maybeSingle()

    const { error: wErr } = await supabase.from('wedding_request_details').upsert(
      {
        request_id: requestId,
        partner_one_name: w.partnerOneName.trim(),
        partner_two_name: w.partnerTwoName?.trim() || null,
        proposed_wedding_date: w.proposedWeddingDate || null,
        ceremony_notes: w.ceremonyNotes?.trim() || null,
        confirmed_ceremony_at: existing?.confirmed_ceremony_at ?? null,
      },
      { onConflict: 'request_id' }
    )

    if (wErr) {
      return { ok: false, error: wErr.message }
    }
    return { ok: true }
  }

  if (effectiveRequestType === 'ocia') {
    const o = input.ocia
    if (
      !o ||
      !String(o.sacramentalBackground ?? '').trim() ||
      !String(o.seeking ?? '').trim() ||
      !String(o.parishionerStatus ?? '').trim() ||
      !String(o.preferredContactMethod ?? '').trim()
    ) {
      return { ok: false, error: 'OCIA background, seeking, parishioner status, and contact method are required.' }
    }

    const { data: existingOcia } = await supabase
      .from('ocia_request_details')
      .select('confirmed_session_at')
      .eq('request_id', requestId)
      .maybeSingle()

    const { error: oErr } = await supabase.from('ocia_request_details').upsert(
      {
        request_id: requestId,
        date_of_birth: o.dateOfBirth || null,
        age_or_dob_note: o.ageOrDobNote?.trim() || null,
        sacramental_background: o.sacramentalBackground.trim(),
        seeking: o.seeking.trim(),
        parishioner_status: o.parishionerStatus.trim(),
        preferred_contact_method: o.preferredContactMethod.trim(),
        availability: o.availability?.trim() || null,
        confirmed_session_at: existingOcia?.confirmed_session_at ?? null,
      },
      { onConflict: 'request_id' }
    )

    if (oErr) {
      return { ok: false, error: oErr.message }
    }
    return { ok: true }
  }

  return { ok: false, error: 'Unsupported request type.' }
}

export type RequestPersonLinkResult =
  | { ok: true; personId: string }
  | { ok: false; error: string }

function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === '23505'
}

async function findPersonIdByParishionerId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  parishionerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('people')
    .select('id')
    .eq('parishioner_id', parishionerId)
    .maybeSingle()

  return data?.id ? String(data.id) : null
}

async function linkRequestToPersonId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  requestId: string,
  personId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('requests')
    .update({ person_id: personId })
    .eq('id', requestId)
    .select('id')

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!data?.length) {
    return { ok: false, error: 'Could not link request to person. Refresh and try again.' }
  }
  return { ok: true }
}

/** Link request to an existing person with the same `parishioner_id` (no duplicate create). */
export async function linkRequestToExistingPerson(
  requestId: string
): Promise<RequestPersonLinkResult> {
  const id = String(requestId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing request id.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('person_id, parishioner_id')
    .eq('id', id)
    .single()

  if (reqErr || !reqRow) {
    return { ok: false, error: reqErr?.message ?? 'Request not found.' }
  }

  const existingPersonId =
    reqRow.person_id != null ? String(reqRow.person_id).trim() : ''
  if (existingPersonId) {
    return { ok: true, personId: existingPersonId }
  }

  const parishionerId =
    reqRow.parishioner_id != null ? String(reqRow.parishioner_id).trim() : ''
  if (!parishionerId) {
    return { ok: false, error: 'This request has no intake contact to link.' }
  }

  const personId = await findPersonIdByParishionerId(supabase, parishionerId)
  if (!personId) {
    return {
      ok: false,
      error: 'No person profile exists for this intake contact yet. Create one first.',
    }
  }

  const linked = await linkRequestToPersonId(supabase, id, personId)
  if (!linked.ok) {
    return linked
  }

  return { ok: true, personId }
}

/** Create a people row from the request parishioner and set `requests.person_id`. */
export async function createPersonFromRequestParishioner(
  requestId: string
): Promise<RequestPersonLinkResult> {
  const id = String(requestId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing request id.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('person_id, parishioner_id')
    .eq('id', id)
    .single()

  if (reqErr || !reqRow) {
    return { ok: false, error: reqErr?.message ?? 'Request not found.' }
  }

  const existingPersonId =
    reqRow.person_id != null ? String(reqRow.person_id).trim() : ''
  if (existingPersonId) {
    return { ok: true, personId: existingPersonId }
  }

  const parishionerId =
    reqRow.parishioner_id != null ? String(reqRow.parishioner_id).trim() : ''
  if (!parishionerId) {
    return { ok: false, error: 'This request has no intake contact to link.' }
  }

  const existingByParishioner = await findPersonIdByParishionerId(supabase, parishionerId)
  if (existingByParishioner) {
    const linked = await linkRequestToPersonId(supabase, id, existingByParishioner)
    if (!linked.ok) {
      return linked
    }
    return { ok: true, personId: existingByParishioner }
  }

  const { data: parishioner, error: parishionerErr } = await supabase
    .from('parishioners')
    .select('full_name, email, phone')
    .eq('id', parishionerId)
    .single()

  if (parishionerErr || !parishioner) {
    return { ok: false, error: parishionerErr?.message ?? 'Intake contact not found.' }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(
    createSupabaseServiceRoleClient()
  )
  if (parishErr || !parishId) {
    return { ok: false, error: parishErr?.message ?? 'Parish not found.' }
  }

  const { firstName, middleName, lastName } = parseParishionerFullName(parishioner.full_name)
  const emailRaw = String(parishioner.email ?? '').trim()
  const phoneRaw = String(parishioner.phone ?? '').trim()

  const { data: created, error: insertErr } = await supabase
    .from('people')
    .insert({
      parish_id: parishId,
      parishioner_id: parishionerId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email: emailRaw || null,
      phone: phoneRaw || null,
    })
    .select('id')
    .single()

  let personId: string | null = created?.id ? String(created.id) : null

  if (insertErr) {
    if (isUniqueViolation(insertErr)) {
      personId = await findPersonIdByParishionerId(supabase, parishionerId)
      if (!personId) {
        return { ok: false, error: insertErr.message }
      }
    } else {
      return { ok: false, error: insertErr.message }
    }
  }

  if (!personId) {
    return { ok: false, error: 'Could not create person profile.' }
  }

  const linked = await linkRequestToPersonId(supabase, id, personId)
  if (!linked.ok) {
    return linked
  }

  return { ok: true, personId }
}
