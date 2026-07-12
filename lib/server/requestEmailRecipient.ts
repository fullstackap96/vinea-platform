import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

export type StoredRequestEmailRecipient = {
  email: string
}

function normalizeEmail(value: unknown): string | null {
  const email = String(value ?? '').trim()
  if (!email || !email.includes('@') || /\s/.test(email)) return null
  return email
}

export async function loadStoredRequestEmailRecipient(
  admin: AdminClient,
  input: { requestId: string; parishId: string },
): Promise<StoredRequestEmailRecipient | null> {
  const { data: requestRow, error: requestError } = await admin
    .from('requests')
    .select('id, parishioner_id')
    .eq('id', input.requestId)
    .maybeSingle()

  if (requestError) throw requestError
  if (!requestRow?.id || !requestRow.parishioner_id) return null

  const { data: parishioner, error: parishionerError } = await admin
    .from('parishioners')
    .select('parish_id, email')
    .eq('id', requestRow.parishioner_id)
    .maybeSingle()

  if (parishionerError) throw parishionerError
  if (String(parishioner?.parish_id ?? '') !== input.parishId) return null

  const email = normalizeEmail(parishioner?.email)
  return email ? { email } : null
}

export const requestEmailRecipientTestInternals = {
  normalizeEmail,
}
