'use server'

import { revalidatePath } from 'next/cache'
import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type CommunicationCenterActionResult = { ok: true } | { ok: false; error: string }

function text(value: unknown): string {
  return String(value ?? '').trim()
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

function revalidateCommunications() {
  revalidatePath('/dashboard/communications')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/requests')
  revalidatePath('/dashboard/calendar')
}

export async function logCommunicationTouchpoint(input: {
  requestId: unknown
  method: unknown
  notes: unknown
  nextFollowUpDate: unknown
}): Promise<CommunicationCenterActionResult> {
  const requestId = text(input.requestId)
  if (!requestId) return { ok: false, error: 'Missing request id.' }

  const notes = text(input.notes)
  if (!notes) return { ok: false, error: 'Add a short communication note.' }

  const rawNextDate = text(input.nextFollowUpDate)
  const nextFollowUpDate = rawNextDate ? parseFollowUpCalendarDate(rawNextDate) : null
  if (rawNextDate && !nextFollowUpDate) return { ok: false, error: 'Invalid follow-up date.' }

  const auth = await requireUser()
  if (!auth.ok) return auth

  const contactedAt = new Date().toISOString()
  const method = text(input.method) || 'phone'

  const insertRes = await auth.supabase.from('request_communications').insert({
    request_id: requestId,
    contacted_at: contactedAt,
    method,
    notes,
  })

  if (insertRes.error) return { ok: false, error: insertRes.error.message }

  const payload: Record<string, unknown> = {
    last_contacted_at: contactedAt,
    last_contact_method: method,
    communication_notes: notes,
  }
  if (rawNextDate || nextFollowUpDate === null) {
    payload.next_follow_up_date = nextFollowUpDate
  }

  const updateRes = await auth.supabase.from('requests').update(payload).eq('id', requestId)
  if (updateRes.error) return { ok: false, error: updateRes.error.message }

  revalidateCommunications()
  return { ok: true }
}

export async function updateCommunicationFollowUp(input: {
  requestId: unknown
  nextFollowUpDate: unknown
}): Promise<CommunicationCenterActionResult> {
  const requestId = text(input.requestId)
  if (!requestId) return { ok: false, error: 'Missing request id.' }

  const rawNextDate = text(input.nextFollowUpDate)
  const nextFollowUpDate = rawNextDate ? parseFollowUpCalendarDate(rawNextDate) : null
  if (rawNextDate && !nextFollowUpDate) return { ok: false, error: 'Invalid follow-up date.' }

  const auth = await requireUser()
  if (!auth.ok) return auth

  const updateRes = await auth.supabase
    .from('requests')
    .update({ next_follow_up_date: nextFollowUpDate })
    .eq('id', requestId)

  if (updateRes.error) return { ok: false, error: updateRes.error.message }

  revalidateCommunications()
  return { ok: true }
}
