'use server'

import { revalidatePath } from 'next/cache'
import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type IntakeQuickTriageResult = { ok: true } | { ok: false; error: string }

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function nullableText(value: unknown): string | null {
  const normalized = text(value)
  return normalized ? normalized : null
}

function normalizeDate(value: unknown): string | null {
  const raw = text(value)
  if (!raw) return null
  return parseFollowUpCalendarDate(raw)
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false as const, error: 'Unauthorized' }
  }

  return { ok: true as const, supabase }
}

function revalidateIntake() {
  revalidatePath('/dashboard/intake')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/requests')
  revalidatePath('/dashboard/calendar')
}

export async function quickTriageRequest(input: {
  requestId: unknown
  assignedStaffName: unknown
  nextFollowUpDate: unknown
  contactMethod: unknown
  contactNotes: unknown
  markFirstContact: unknown
  doneForNow: unknown
}): Promise<IntakeQuickTriageResult> {
  const requestId = text(input.requestId)
  if (!requestId) return { ok: false, error: 'Missing request id.' }

  const nextFollowUpDate = normalizeDate(input.nextFollowUpDate)
  if (text(input.nextFollowUpDate) && !nextFollowUpDate) {
    return { ok: false, error: 'Invalid follow-up date.' }
  }

  const auth = await requireUser()
  if (!auth.ok) return auth

  const contactedAt = new Date().toISOString()
  const markFirstContact = Boolean(input.markFirstContact)
  const contactMethod = text(input.contactMethod) || 'phone'
  const contactNotes =
    text(input.contactNotes) || 'First contact completed from intake quick triage.'

  if (markFirstContact) {
    const insertRes = await auth.supabase.from('request_communications').insert({
      request_id: requestId,
      contacted_at: contactedAt,
      method: contactMethod,
      notes: contactNotes,
    })

    if (insertRes.error) {
      return { ok: false, error: insertRes.error.message }
    }
  }

  const payload: Record<string, unknown> = {
    assigned_staff_name: nullableText(input.assignedStaffName),
    next_follow_up_date: nextFollowUpDate,
  }

  if (markFirstContact) {
    payload.last_contacted_at = contactedAt
    payload.last_contact_method = contactMethod
    payload.communication_notes = contactNotes
  }

  if (Boolean(input.doneForNow)) {
    payload.status = 'in_progress'
  }

  const updateRes = await auth.supabase.from('requests').update(payload).eq('id', requestId)
  if (updateRes.error) {
    return { ok: false, error: updateRes.error.message }
  }

  revalidateIntake()
  return { ok: true }
}

export async function quickTriageMassIntention(input: {
  intentionId: unknown
  assignedMassDate: unknown
  assignedPriestName: unknown
  stipendReceived: unknown
  doneForNow: unknown
}): Promise<IntakeQuickTriageResult> {
  const intentionId = text(input.intentionId)
  if (!intentionId) return { ok: false, error: 'Missing intention id.' }

  const assignedMassDate = normalizeDate(input.assignedMassDate)
  if (text(input.assignedMassDate) && !assignedMassDate) {
    return { ok: false, error: 'Invalid Mass date.' }
  }

  const auth = await requireUser()
  if (!auth.ok) return auth

  const payload: Record<string, unknown> = {
    assigned_mass_date: assignedMassDate,
    assigned_priest_name: nullableText(input.assignedPriestName),
    stipend_received: Boolean(input.stipendReceived),
  }

  if (Boolean(input.doneForNow) && assignedMassDate) {
    payload.is_fulfilled = true
  }

  const updateRes = await auth.supabase
    .from('mass_intentions')
    .update(payload)
    .eq('id', intentionId)

  if (updateRes.error) {
    return { ok: false, error: updateRes.error.message }
  }

  revalidateIntake()
  return { ok: true }
}
