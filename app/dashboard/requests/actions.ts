'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { RequestAssignmentUpdate } from '@/lib/types/requests'

export type UpdateRequestAssignmentResult =
  | { ok: true }
  | { ok: false; error: string }

export type AddRequestNoteResult = { ok: true } | { ok: false; error: string }

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
