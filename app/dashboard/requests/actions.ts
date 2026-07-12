'use server'

import { parseParishionerFullName } from '@/lib/people'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import {
  loadStaffScopedRequestDetailAccess,
  type RequestDetailAccess,
} from '@/lib/server/requestDetailAccess'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { resolveRequestAuditParishId } from '@/lib/server/requestAuditParish'
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
import { writeAuditEvent } from '@/lib/server/auditLog'
import { cookies } from 'next/headers'

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

export type UpdateRequestStatusResult = { ok: true } | { ok: false; error: string }

export type UpdateRequestWorkflowStepStatusResult =
  | { ok: true }
  | { ok: false; error: string }

export type ApplyWorkflowPlaybookResult =
  | { ok: true; addedCount: number; skippedCount: number }
  | { ok: false; error: string }

function requestActionError(action: string, error: unknown, safeMessage: string): { ok: false; error: string } {
  logServerError(`[request-actions] ${action}`, error)
  return { ok: false, error: safeMessage }
}

function normalizeOptionalName(value: unknown): string | null {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : null
}

async function auditRequestAction(input: {
  requestId: string
  actorEmail?: string | null
  action: string
  metadata?: Record<string, unknown>
}) {
  const admin = createSupabaseServiceRoleClient()
  const auditParish = await resolveRequestAuditParishId(admin, input.requestId)
  const metadata = auditParish.ok
    ? input.metadata
    : {
        ...(input.metadata ?? {}),
        auditParishResolutionError: auditParish.error,
        auditParishResolutionDetail: auditParish.technicalDetail,
      }

  await writeAuditEvent({
    parishId: auditParish.ok ? auditParish.parishId : null,
    actorEmail: input.actorEmail || null,
    action: input.action,
    targetType: 'request',
    targetId: input.requestId,
    metadata,
  })
}

function normalizeRequestStatus(value: unknown): string | null {
  const s = String(value ?? '').trim()
  if (['new', 'in_progress', 'waiting_on_family', 'complete'].includes(s)) return s
  return null
}

function normalizeWorkflowStepStatus(value: unknown): string | null {
  const s = String(value ?? '').trim()
  if (['not_started', 'in_progress', 'complete', 'skipped'].includes(s)) return s
  return null
}

export async function updateRequestStatus(input: {
  requestId: string
  status: unknown
}): Promise<UpdateRequestStatusResult> {
  const requestId = String(input.requestId ?? '').trim()
  const status = normalizeRequestStatus(input.status)
  if (!requestId) return { ok: false, error: 'Missing request id.' }
  if (!status) return { ok: false, error: 'Invalid request status.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { ok: false, error: 'Unauthorized' }

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: existing, error: existingError } = await supabase
    .from('requests')
    .select('status')
    .eq('id', access.requestId)
    .single()

  if (existingError || !existing) {
    return existingError
      ? requestActionError('status load failed', existingError, 'Request not found.')
      : { ok: false, error: 'Request not found.' }
  }

  if (status === 'complete') {
    const { data: workflowSteps, error: workflowError } = await supabase
      .from('request_workflow_steps')
      .select('id, title, required, status')
      .eq('request_id', access.requestId)

    if (workflowError) {
      return requestActionError(
        'status workflow prerequisite load failed',
        workflowError,
        'Could not check required workflow steps.'
      )
    }

    const steps = workflowSteps ?? []
    const incompleteRequired = steps.filter(
      (step) => step.required === true && String(step.status ?? '') !== 'complete'
    )
    if (incompleteRequired.length > 0) {
      const first = String(incompleteRequired[0]?.title ?? 'required workflow step')
      return {
        ok: false,
        error: `Complete required workflow steps before marking complete. First open step: ${first}.`,
      }
    }

    if (steps.length === 0) {
      const { data: checklistItems, error: checklistError } = await supabase
        .from('checklist_items')
        .select('id')
        .eq('request_id', access.requestId)
        .eq('is_complete', false)
        .limit(1)

      if (checklistError) {
        return requestActionError(
          'status checklist prerequisite load failed',
          checklistError,
          'Could not check required checklist items.'
        )
      }
      if ((checklistItems ?? []).length > 0) {
        return { ok: false, error: 'Complete checklist items before marking complete.' }
      }
    }
  }

  const { data: updatedRequest, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', access.requestId)
    .select('id')
    .maybeSingle()

  if (error || !updatedRequest?.id) {
    return error
      ? requestActionError('status update failed', error, 'Could not update request status.')
      : { ok: false, error: 'Request not found.' }
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.status.updated',
    metadata: { from: existing.status, to: status },
  })

  return { ok: true }
}

export async function updateRequestWorkflowStepStatus(input: {
  requestId: string
  stepId: string
  status: unknown
}): Promise<UpdateRequestWorkflowStepStatusResult> {
  const requestId = String(input.requestId ?? '').trim()
  const stepId = String(input.stepId ?? '').trim()
  const status = normalizeWorkflowStepStatus(input.status)
  if (!requestId) return { ok: false, error: 'Missing request id.' }
  if (!stepId) return { ok: false, error: 'Missing workflow step id.' }
  if (!status) return { ok: false, error: 'Invalid workflow step status.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { ok: false, error: 'Unauthorized' }

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: existing, error: existingError } = await supabase
    .from('request_workflow_steps')
    .select('id, title, status')
    .eq('id', stepId)
    .eq('request_id', access.requestId)
    .single()

  if (existingError || !existing) {
    return existingError
      ? requestActionError('workflow step load failed', existingError, 'Workflow step not found.')
      : { ok: false, error: 'Workflow step not found.' }
  }

  const { data: updatedStep, error } = await supabase
    .from('request_workflow_steps')
    .update({
      status,
      completed_at: status === 'complete' ? new Date().toISOString() : null,
      completed_by: status === 'complete' ? user.id : null,
    })
    .eq('id', stepId)
    .eq('request_id', access.requestId)
    .select('id')
    .maybeSingle()

  if (error || !updatedStep?.id) {
    return error
      ? requestActionError(
          'workflow step update failed',
          error,
          'Could not update workflow step.'
        )
      : { ok: false, error: 'Workflow step not found.' }
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.workflow_step.updated',
    metadata: {
      stepId,
      label: existing.title,
      from: existing.status,
      to: status,
    },
  })

  return { ok: true }
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

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const payload: RequestAssignmentUpdate = {
    assigned_staff_name: normalizeOptionalName(input.assignedStaffName),
    assigned_priest_name: normalizeOptionalName(input.assignedPriestName),
    assigned_deacon_name: normalizeOptionalName(input.assignedDeaconName),
  }

  const { data: updatedRequest, error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', access.requestId)
    .select('id')
    .maybeSingle()

  if (error || !updatedRequest?.id) {
    return error
      ? requestActionError('assignment update failed', error, 'Could not update assignment.')
      : { ok: false, error: 'Request not found.' }
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.assignment.updated',
    metadata: {
      assignedStaffName: payload.assigned_staff_name,
      assignedPriestName: payload.assigned_priest_name,
      assignedDeaconName: payload.assigned_deacon_name,
    },
  })

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

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const payload: RequestNextFollowUpUpdate = { next_follow_up_date }

  const { data: updatedRequest, error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', access.requestId)
    .select('id')
    .maybeSingle()

  if (error || !updatedRequest?.id) {
    return error
      ? requestActionError(
          'follow-up update failed',
          error,
          'Could not update follow-up date.'
        )
      : { ok: false, error: 'Request not found.' }
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.follow_up.updated',
    metadata: { to: next_follow_up_date },
  })

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

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: existing, error: existingError } = await supabase
    .from('requests')
    .select('waiting_on, waiting_on_changed_at')
    .eq('id', access.requestId)
    .single()

  if (existingError) {
    return requestActionError(
      'waiting-on load failed',
      existingError,
      'Could not load waiting-for status.'
    )
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

  const { data: updatedRequest, error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', access.requestId)
    .select('id')
    .maybeSingle()

  if (error || !updatedRequest?.id) {
    return error
      ? requestActionError(
          'waiting-on update failed',
          error,
          'Could not update waiting-for status.'
        )
      : { ok: false, error: 'Request not found.' }
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.waiting_on.updated',
    metadata: { from: existingWaitingOn, to: waiting_on },
  })

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

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('id, request_type')
    .eq('id', access.requestId)
    .single()

  if (requestError || !request) {
    return requestError
      ? requestActionError('playbook request load failed', requestError, 'Request not found.')
      : { ok: false, error: 'Request not found.' }
  }

  const requestType = requestTypeFromRow(request as { request_type?: unknown })
  const { data: existingChecklist, error: checklistError } = await supabase
    .from('checklist_items')
    .select('item_name')
    .eq('request_id', access.requestId)

  if (checklistError) {
    return requestActionError(
      'playbook checklist load failed',
      checklistError,
      'Could not load checklist items.'
    )
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
  const { data: insertedItems, error: insertError } = await admin
    .from('checklist_items')
    .insert(
      suggestion.missingItems.map((item) => ({
        request_id: access.requestId,
        item_name: item.itemName,
        is_complete: false,
      }))
    )
    .select('id')

  if (insertError || insertedItems?.length !== suggestion.missingItems.length) {
    return requestActionError(
      'playbook checklist insert failed',
      insertError ?? new Error('Not all playbook checklist items were inserted.'),
      'Could not add playbook checklist items.'
    )
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.playbook.applied',
    metadata: {
      requestType,
      addedCount: suggestion.missingItems.length,
      skippedCount: suggestion.existingCount,
    },
  })

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

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: insertedNote, error } = await supabase
    .from('request_notes')
    .insert({
      request_id: access.requestId,
      body,
    })
    .select('id')
    .maybeSingle()

  if (error || !insertedNote?.id) {
    return requestActionError(
      'note insert failed',
      error ?? new Error('Request note was not inserted.'),
      'Could not add note.'
    )
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.note.created',
    metadata: {
      source: 'staff_request_detail',
      noteLength: body.length,
    },
  })

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
  const actorEmail = user.email ?? null

  const access = await loadRequestActionAccess(supabase, requestId)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }
  const verifiedRequestId = access.requestId

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('parishioner_id, request_type')
    .eq('id', access.requestId)
    .single()

  if (reqErr || !reqRow?.parishioner_id) {
    return reqErr
      ? requestActionError('intake request load failed', reqErr, 'Request not found.')
      : { ok: false, error: 'Request not found.' }
  }

  const resolvedParishionerId = String(reqRow.parishioner_id).trim()
  if (clientParishionerId && clientParishionerId !== resolvedParishionerId) {
    return {
      ok: false,
      error: 'This page is out of date. Refresh and try again.',
    }
  }

  const effectiveRequestType = requestTypeFromRow(reqRow as { request_type?: unknown })
  if (
    effectiveRequestType === 'funeral' &&
    (!input.funeral || !input.funeral.deceasedName.trim())
  ) {
    return { ok: false, error: 'Deceased name is required.' }
  }
  if (
    effectiveRequestType === 'wedding' &&
    (!input.wedding || !input.wedding.partnerOneName.trim())
  ) {
    return { ok: false, error: 'Partner name is required.' }
  }
  if (
    effectiveRequestType === 'ocia' &&
    (!input.ocia ||
      !String(input.ocia.sacramentalBackground ?? '').trim() ||
      !String(input.ocia.seeking ?? '').trim() ||
      !String(input.ocia.parishionerStatus ?? '').trim() ||
      !String(input.ocia.preferredContactMethod ?? '').trim())
  ) {
    return {
      ok: false,
      error: 'OCIA background, seeking, parishioner status, and contact method are required.',
    }
  }

  async function auditIntakeUpdate() {
    await auditRequestAction({
      requestId: verifiedRequestId,
      actorEmail,
      action: 'request.intake.updated',
      metadata: {
        requestType: effectiveRequestType,
        contactUpdated: true,
        requestDetailsUpdated: true,
      },
    })
  }

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
    .eq('parish_id', access.parishId)
    .select('id')

  if (pErr) {
    return requestActionError(
      'intake contact update failed',
      pErr,
      'Could not save contact information.'
    )
  }
  if (!updatedParishioners?.length) {
    return {
      ok: false,
      error:
        'Could not save contact information. Refresh the page; if it persists, an administrator may need to allow staff updates on parishioner records.',
    }
  }

  if (effectiveRequestType === 'baptism') {
    const { data: updatedRequest, error: rErr } = await supabase
      .from('requests')
      .update({
        notes,
        child_name: input.baptism?.childName ?? null,
        preferred_dates: input.baptism?.preferredDates ?? null,
      })
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (rErr || !updatedRequest?.id) {
      return rErr
        ? requestActionError(
            'baptism intake update failed',
            rErr,
            'Contact information was saved, but baptism details were not. Refresh and try again.'
          )
        : {
            ok: false,
            error:
              'Contact information was saved, but baptism details were not. Refresh and try again.',
          }
    }
    await auditIntakeUpdate()
    return { ok: true }
  }

  const { data: updatedRequestNotes, error: rNotesErr } = await supabase
    .from('requests')
    .update({ notes })
    .eq('id', access.requestId)
    .select('id')
    .maybeSingle()

  if (rNotesErr || !updatedRequestNotes?.id) {
    return rNotesErr
      ? requestActionError(
          'intake notes update failed',
          rNotesErr,
          'Contact information was saved, but intake notes were not. Refresh and try again.'
        )
      : {
          ok: false,
          error:
            'Contact information was saved, but intake notes were not. Refresh and try again.',
        }
  }

  if (effectiveRequestType === 'funeral') {
    const f = input.funeral
    if (!f || !f.deceasedName.trim()) {
      return { ok: false, error: 'Deceased name is required.' }
    }
    const { data: existing } = await supabase
      .from('funeral_request_details')
      .select('confirmed_service_at')
      .eq('request_id', access.requestId)
      .maybeSingle()

    const { data: savedFuneral, error: fErr } = await supabase
      .from('funeral_request_details')
      .upsert(
        {
          request_id: access.requestId,
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
      .select('request_id')
      .maybeSingle()

    if (fErr || !savedFuneral?.request_id) {
      return fErr
        ? requestActionError(
            'funeral intake details update failed',
            fErr,
            'Contact information and intake notes were saved, but funeral details were not. Refresh and try again.'
          )
        : {
            ok: false,
            error:
              'Contact information and intake notes were saved, but funeral details were not. Refresh and try again.',
          }
    }
    await auditIntakeUpdate()
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
      .eq('request_id', access.requestId)
      .maybeSingle()

    const { data: savedWedding, error: wErr } = await supabase
      .from('wedding_request_details')
      .upsert(
        {
          request_id: access.requestId,
          partner_one_name: w.partnerOneName.trim(),
          partner_two_name: w.partnerTwoName?.trim() || null,
          proposed_wedding_date: w.proposedWeddingDate || null,
          ceremony_notes: w.ceremonyNotes?.trim() || null,
          confirmed_ceremony_at: existing?.confirmed_ceremony_at ?? null,
        },
        { onConflict: 'request_id' }
      )
      .select('request_id')
      .maybeSingle()

    if (wErr || !savedWedding?.request_id) {
      return wErr
        ? requestActionError(
            'wedding intake details update failed',
            wErr,
            'Contact information and intake notes were saved, but wedding details were not. Refresh and try again.'
          )
        : {
            ok: false,
            error:
              'Contact information and intake notes were saved, but wedding details were not. Refresh and try again.',
          }
    }
    await auditIntakeUpdate()
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
      .eq('request_id', access.requestId)
      .maybeSingle()

    const { data: savedOcia, error: oErr } = await supabase
      .from('ocia_request_details')
      .upsert(
        {
          request_id: access.requestId,
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
      .select('request_id')
      .maybeSingle()

    if (oErr || !savedOcia?.request_id) {
      return oErr
        ? requestActionError(
            'ocia intake details update failed',
            oErr,
            'Contact information and intake notes were saved, but OCIA details were not. Refresh and try again.'
          )
        : {
            ok: false,
            error:
              'Contact information and intake notes were saved, but OCIA details were not. Refresh and try again.',
          }
    }
    await auditIntakeUpdate()
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

async function loadRequestActionAccess(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  requestId: string
): Promise<RequestDetailAccess | null> {
  const admin = createSupabaseServiceRoleClient()
  const activeParishId = (await cookies()).get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    return await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })
  } catch (error) {
    logServerError('request action active parish access failed', error)
    return null
  }
}

async function findPersonIdByParishionerId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  parishionerId: string,
  parishId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('people')
    .select('id')
    .eq('parishioner_id', parishionerId)
    .eq('parish_id', parishId)
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
    return requestActionError(
      'request person link update failed',
      error,
      'Could not link request to person. Refresh and try again.'
    )
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

  const access = await loadRequestActionAccess(supabase, id)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('person_id, parishioner_id')
    .eq('id', access.requestId)
    .single()

  if (reqErr || !reqRow) {
    return reqErr
      ? requestActionError('existing person link request load failed', reqErr, 'Request not found.')
      : { ok: false, error: 'Request not found.' }
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

  const personId = await findPersonIdByParishionerId(supabase, parishionerId, access.parishId)
  if (!personId) {
    return {
      ok: false,
      error: 'No person profile exists for this intake contact yet. Create one first.',
    }
  }

  const linked = await linkRequestToPersonId(supabase, access.requestId, personId)
  if (!linked.ok) {
    return linked
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.person.linked',
    metadata: { personId, mode: 'existing' },
  })

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

  const access = await loadRequestActionAccess(supabase, id)
  if (!access) {
    return { ok: false, error: 'Request not found.' }
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('person_id, parishioner_id')
    .eq('id', access.requestId)
    .single()

  if (reqErr || !reqRow) {
    return reqErr
      ? requestActionError('create person request load failed', reqErr, 'Request not found.')
      : { ok: false, error: 'Request not found.' }
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

  const existingByParishioner = await findPersonIdByParishionerId(
    supabase,
    parishionerId,
    access.parishId
  )
  if (existingByParishioner) {
    const linked = await linkRequestToPersonId(supabase, access.requestId, existingByParishioner)
    if (!linked.ok) {
      return linked
    }
    await auditRequestAction({
      requestId: access.requestId,
      actorEmail: user.email,
      action: 'request.person.linked',
      metadata: { personId: existingByParishioner, mode: 'existing' },
    })
    return { ok: true, personId: existingByParishioner }
  }

  const { data: parishioner, error: parishionerErr } = await supabase
    .from('parishioners')
    .select('full_name, email, phone')
    .eq('id', parishionerId)
    .eq('parish_id', access.parishId)
    .single()

  if (parishionerErr || !parishioner) {
    return parishionerErr
      ? requestActionError(
          'create person parishioner load failed',
          parishionerErr,
          'Intake contact not found.'
        )
      : { ok: false, error: 'Intake contact not found.' }
  }

  const { firstName, middleName, lastName } = parseParishionerFullName(parishioner.full_name)
  const emailRaw = String(parishioner.email ?? '').trim()
  const phoneRaw = String(parishioner.phone ?? '').trim()

  const { data: created, error: insertErr } = await supabase
    .from('people')
    .insert({
      parish_id: access.parishId,
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
      personId = await findPersonIdByParishionerId(supabase, parishionerId, access.parishId)
      if (!personId) {
        return requestActionError(
          'create person unique recovery failed',
          insertErr,
          'Could not create person profile.'
        )
      }
    } else {
      return requestActionError(
        'create person profile failed',
        insertErr,
        'Could not create person profile.'
      )
    }
  }

  if (!personId) {
    return { ok: false, error: 'Could not create person profile.' }
  }

  const linked = await linkRequestToPersonId(supabase, access.requestId, personId)
  if (!linked.ok) {
    return linked
  }

  await auditRequestAction({
    requestId: access.requestId,
    actorEmail: user.email,
    action: 'request.person.linked',
    metadata: { personId, mode: 'created' },
  })

  return { ok: true, personId }
}
