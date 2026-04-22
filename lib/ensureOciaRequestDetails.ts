import type { SupabaseClient } from '@supabase/supabase-js'
import {
  CONTACT_METHOD_VALUES,
  SACRAMENTAL_BACKGROUND_VALUES,
  SEEKING_VALUES,
} from '@/lib/ociaIntakeOptions'

/** Shown in DB until staff completes intake via Edit request details. */
export const OCIA_PLACEHOLDER_PARISH_STATUS = 'Pending — complete OCIA intake'

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
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const id = String(requestId || '').trim()
  if (!id) {
    return { data: null, error: 'Missing request id' }
  }

  const { data: existing, error: selErr } = await supabase
    .from('ocia_request_details')
    .select('*')
    .eq('request_id', id)
    .maybeSingle()

  if (selErr) {
    return { data: null, error: selErr.message }
  }
  if (existing) {
    return { data: existing as Record<string, unknown>, error: null }
  }

  const insertPayload = defaultOciaInsert(id)

  const { data: inserted, error: insErr } = await supabase
    .from('ocia_request_details')
    .insert(insertPayload)
    .select('*')
    .maybeSingle()

  if (!insErr && inserted) {
    return { data: inserted as Record<string, unknown>, error: null }
  }

  // Race or unique conflict: row may exist now
  const { data: raced, error: raceErr } = await supabase
    .from('ocia_request_details')
    .select('*')
    .eq('request_id', id)
    .maybeSingle()
  if (!raceErr && raced) {
    return { data: raced as Record<string, unknown>, error: null }
  }

  return { data: null, error: insErr?.message || raceErr?.message || 'Insert failed' }
}
