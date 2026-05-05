import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Primary parish id (same ordering as `/api/parish/settings`: oldest `parishes` row).
 * Returns null if unavailable (e.g. RLS), so callers can fall back to unscoped reads.
 */
export async function fetchPrimaryParishId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data?.id) return null
  return String(data.id)
}

/** `parishioners.id` values for rows belonging to this parish (`parishioners.parish_id`). */
export async function fetchParishionerIdsForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('parishioners')
    .select('id')
    .eq('parish_id', parishId)

  if (error) {
    console.error('[dashboardParishRequestScope] parishioners by parish_id:', error.message)
    return []
  }
  if (!data?.length) return []
  return data.map((r) => String((r as { id: unknown }).id)).filter(Boolean)
}
