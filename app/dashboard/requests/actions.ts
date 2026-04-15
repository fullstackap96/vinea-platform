'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  RequestAssignmentUpdate,
  RequestNextFollowUpUpdate,
} from '@/lib/types/requests'
import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'

export type UpdateRequestAssignmentResult =
  | { ok: true }
  | { ok: false; error: string }

export type AddRequestNoteResult = { ok: true } | { ok: false; error: string }

export type UpdateRequestNextFollowUpDateResult =
  | { ok: true }
  | { ok: false; error: string }

function normalizeOptionalName(value: unknown): string | null {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : null
}

export async function updateRequestAssignment(input: {
  requestId: string
  assignedStaffName: unknown
  assignedPriestName: unknown
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
    dateOfDeath: string | null
    funeralHome: string | null
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

  const effectiveRequestType = String(reqRow.request_type ?? 'baptism').toLowerCase()

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
        date_of_death: f.dateOfDeath || null,
        funeral_home_or_location: f.funeralHome?.trim() || null,
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
