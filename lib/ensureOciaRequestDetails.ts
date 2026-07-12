import type { SupabaseClient } from '@supabase/supabase-js'
import {
  CONTACT_METHOD_VALUES,
  SACRAMENTAL_BACKGROUND_VALUES,
  SEEKING_VALUES,
} from '@/lib/ociaIntakeOptions'

/** Shown in DB until staff completes intake via Edit request details. */
export const OCIA_PLACEHOLDER_PARISH_STATUS = 'Pending — complete OCIA intake'
export const OCIA_DETAILS_ACCESS_ERROR = 'Could not access the OCIA intake record. Please try again.'
export const OCIA_DETAILS_CREATE_ERROR = 'Could not prepare the OCIA intake record. Please try again.'
export const OCIA_DETAILS_PRESENCE_SELECT = 'request_id'

export type OciaRequestDetailPresence = {
  request_id: string
}

function parsePresenceRow(value: unknown): OciaRequestDetailPresence | null {
  if (!value || typeof value !== 'object') return null
  const requestId = String((value as { request_id?: unknown }).request_id ?? '').trim()
  return requestId ? { request_id: requestId } : null
}

const defaultOciaInsert = (requestId: string) => ({
  request_id: requestId,
  sacramental_background: SACRAMENTAL_BACKGROUND_VALUES[0],
  seeking: SEEKING_VALUES[SEEKING_VALUES.length - 1],
  parishioner_status: OCIA_PLACEHOLDER_PARISH_STATUS,
  preferred_contact_method: CONTACT_METHOD_VALUES[0],
  availability: null as string | null,
  date_of_birth: null as string | null,
  age_or_dob_note: null as string | null,
  confirmed_session_at: null as string | null,
})

/**
 * Ensures `ocia_request_details` exists for this request (inserts a minimal row if missing).
 * Used so staff can always set `confirmed_session_at` and Google Calendar sync.
 * Staff should complete intake via Edit request details (placeholders are valid enum values).
 */
export async function ensureOciaRequestDetailsIfMissing(
  supabase: SupabaseClient,
  requestId: string
): Promise<{ data: OciaRequestDetailPresence | null; error: string | null }> {
  const id = String(requestId || '').trim()
  if (!id) {
    return { data: null, error: 'Missing request id.' }
  }

  const { data: existing, error: selErr } = await supabase
    .from('ocia_request_details')
    .select(OCIA_DETAILS_PRESENCE_SELECT)
    .eq('request_id', id)
    .maybeSingle()

  if (selErr) {
    return { data: null, error: OCIA_DETAILS_ACCESS_ERROR }
  }
  if (existing) {
    const presence = parsePresenceRow(existing)
    return presence
      ? { data: presence, error: null }
      : { data: null, error: OCIA_DETAILS_ACCESS_ERROR }
  }

  const insertPayload = defaultOciaInsert(id)

  const { data: inserted, error: insErr } = await supabase
    .from('ocia_request_details')
    .insert(insertPayload)
    .select(OCIA_DETAILS_PRESENCE_SELECT)
    .maybeSingle()

  if (!insErr && inserted) {
    const presence = parsePresenceRow(inserted)
    if (presence) return { data: presence, error: null }
  }

  // Race or unique conflict: row may exist now
  const { data: raced, error: raceErr } = await supabase
    .from('ocia_request_details')
    .select(OCIA_DETAILS_PRESENCE_SELECT)
    .eq('request_id', id)
    .maybeSingle()
  if (!raceErr && raced) {
    const presence = parsePresenceRow(raced)
    if (presence) return { data: presence, error: null }
  }

  return { data: null, error: OCIA_DETAILS_CREATE_ERROR }
}
