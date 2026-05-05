import type { PostgrestError } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Primary parish id (same ordering as `/api/parish/settings`: oldest `parishes` row).
 * `parishId` is null when no row, RLS blocks read, or `error` is set.
 */
export async function fetchPrimaryParishId(supabase: SupabaseClient): Promise<{
  parishId: string | null
  error: PostgrestError | null
}> {
  const { data, error } = await supabase
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { parishId: null, error }
  }
  if (!data?.id) {
    return { parishId: null, error: null }
  }
  return { parishId: String(data.id), error: null }
}

/** `parishioners.id` values for rows belonging to this parish (`parishioners.parish_id`). */
export async function fetchParishionerIdsForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<{ ids: string[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('parishioners')
    .select('id')
    .eq('parish_id', parishId)

  if (error) {
    return { ids: [], error }
  }
  if (!data?.length) {
    return { ids: [], error: null }
  }
  return {
    ids: data.map((r) => String((r as { id: unknown }).id)).filter(Boolean),
    error: null,
  }
}
