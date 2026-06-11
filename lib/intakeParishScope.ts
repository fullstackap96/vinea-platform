import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Primary parish id for public intake inserts (same ordering as staff helpers).
 * Returns null when RPC fails or no parish row exists.
 */
export async function fetchIntakeParishId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase.rpc('primary_parish_id')
  if (error || data == null) {
    return null
  }
  const id = String(data).trim()
  return id.length > 0 ? id : null
}

export function parishionerInsertPayload(input: {
  full_name: string
  email: string
  phone: string
  parishId: string | null
}): {
  full_name: string
  email: string
  phone: string
  parish_id?: string
} {
  const payload: {
    full_name: string
    email: string
    phone: string
    parish_id?: string
  } = {
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
  }
  if (input.parishId) {
    payload.parish_id = input.parishId
  }
  return payload
}
