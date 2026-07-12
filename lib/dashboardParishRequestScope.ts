import type { PostgrestError } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'

export type DashboardRequestParishScopeResult =
  | { ok: true; parishionerIds: string[] }
  | { ok: false; userMessage: string; technicalDetail: string | null }

export type DashboardRequestParishionerScopeOptions = {
  /**
   * Server-validated active parish id from the dashboard parish switcher.
   * When omitted, the V1 membership-primary / primary_parish_id fallback path is used.
   */
  activeParishId?: string | null
}

function normalizeParishId(value: unknown): string | null {
  const parishId = String(value ?? '').trim()
  return parishId || null
}

/**
 * Primary parish id via `primary_parish_id()` (same ordering as `/api/parish/settings`).
 * `parishId` is null when no parish row exists or `error` is set.
 */
export async function fetchPrimaryParishId(supabase: SupabaseClient): Promise<{
  parishId: string | null
  error: PostgrestError | null
}> {
  const { data, error } = await supabase.rpc('primary_parish_id')

  if (error) {
    return { parishId: null, error }
  }
  if (data == null) {
    return { parishId: null, error: null }
  }
  const parishId = normalizeParishId(data)
  if (!parishId) {
    return { parishId: null, error: null }
  }
  return { parishId, error: null }
}

/**
 * Read-only staff-aware parish id for dashboard request loading.
 *
 * This prefers the multi-parish membership foundation when present, but keeps
 * the V1 `primary_parish_id()` fallback so existing single-parish staff access
 * continues to work during the tenancy migration.
 */
export async function fetchStaffScopedPrimaryParishId(
  supabase: SupabaseClient
): Promise<{
  parishId: string | null
  error: PostgrestError | null
  source: 'membership' | 'primary_parish_fallback'
}> {
  const { data, error } = await supabase.rpc('current_staff_primary_parish_id')
  const membershipParishId = String(data ?? '').trim()

  if (!error && membershipParishId) {
    return { parishId: membershipParishId, error: null, source: 'membership' }
  }

  const fallback = await fetchPrimaryParishId(supabase)
  return {
    ...fallback,
    source: 'primary_parish_fallback',
  }
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

/**
 * Fail-closed parish scope for the dashboard request list.
 * Never returns ids when parish lookup fails — callers must not load unfiltered requests.
 */
export async function fetchDashboardRequestParishionerScope(
  supabase: SupabaseClient,
  options: DashboardRequestParishionerScopeOptions = {}
): Promise<DashboardRequestParishScopeResult> {
  let parishId = normalizeParishId(options.activeParishId)
  let parishLookupError: PostgrestError | null = null

  if (!parishId) {
    const resolved = await fetchStaffScopedPrimaryParishId(supabase)
    parishId = resolved.parishId
    parishLookupError = resolved.error
  }

  if (parishLookupError) {
    return {
      ok: false,
      userMessage: userMessageForDashboardQueryError('parish directory', parishLookupError),
      technicalDetail: parishLookupError.message,
    }
  }

  if (!parishId) {
    return {
      ok: false,
      userMessage:
        'Parish is not configured yet, so requests cannot be loaded. Add a parish in Supabase before using the dashboard.',
      technicalDetail: null,
    }
  }

  const { ids, error: parishScopeError } = await fetchParishionerIdsForParish(supabase, parishId)

  if (parishScopeError) {
    return {
      ok: false,
      userMessage: userMessageForDashboardQueryError('parish member list', parishScopeError),
      technicalDetail: parishScopeError.message,
    }
  }

  if (ids.length === 0) {
    return {
      ok: false,
      userMessage:
        'No parish members are linked to your parish yet, so no requests appear here. Link parishioners to your parish (parish_id) to see their requests.',
      technicalDetail: null,
    }
  }

  return { ok: true, parishionerIds: ids }
}
