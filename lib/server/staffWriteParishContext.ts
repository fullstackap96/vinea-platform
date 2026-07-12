import 'server-only'

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

import { redactSensitiveLogText } from '@/lib/server/safeErrorLogging'

type MinimalSupabaseClient = Pick<SupabaseClient, 'rpc'>

export type StaffWriteParishContextSource = 'membership' | 'primary_parish_fallback'

export type StaffWriteParishContextOptions = {
  requestedParishId?: string | null
  allowPrimaryParishFallback?: boolean
  fallbackReason?: string
}

export type StaffWriteParishContextResult =
  | {
      ok: true
      parishId: string
      source: StaffWriteParishContextSource
      requestedParishId: string | null
      fallbackReason?: string
    }
  | {
      ok: false
      error: string
      technicalDetail: string | null
      source: StaffWriteParishContextSource
      requestedParishId: string | null
    }

function normalizeId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

function isMissingMembershipFoundation(error: PostgrestError | null): boolean {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    message.includes('current_staff_primary_parish_id') ||
    message.includes('is_authorized_for_parish') ||
    message.includes('parish_memberships') ||
    message.includes('schema cache') ||
    message.includes('could not find the function') ||
    message.includes('could not find the table')
  )
}

function safeTechnicalDetail(error: Pick<PostgrestError, 'message'> | null | undefined): string | null {
  return error?.message ? redactSensitiveLogText(error.message) : null
}

async function loadPrimaryParishFallback(
  supabase: MinimalSupabaseClient,
  requestedParishId: string | null,
  fallbackReason?: string
): Promise<StaffWriteParishContextResult> {
  const { data, error } = await supabase.rpc('primary_parish_id')
  if (error) {
    return {
      ok: false,
      error: 'Could not resolve parish context for this write.',
      technicalDetail: safeTechnicalDetail(error),
      source: 'primary_parish_fallback',
      requestedParishId,
    }
  }

  const parishId = normalizeId(data)
  if (!parishId) {
    return {
      ok: false,
      error: 'Parish is not configured.',
      technicalDetail: null,
      source: 'primary_parish_fallback',
      requestedParishId,
    }
  }

  if (requestedParishId && requestedParishId !== parishId) {
    return {
      ok: false,
      error: 'You are not authorized to write to this parish.',
      technicalDetail: 'Requested parish does not match the primary parish fallback.',
      source: 'primary_parish_fallback',
      requestedParishId,
    }
  }

  return {
    ok: true,
    parishId,
    source: 'primary_parish_fallback',
    requestedParishId,
    fallbackReason,
  }
}

async function resolvePrimaryMembershipParish(
  supabase: MinimalSupabaseClient,
  options: Required<Pick<StaffWriteParishContextOptions, 'allowPrimaryParishFallback'>> &
    Pick<StaffWriteParishContextOptions, 'fallbackReason'>
): Promise<StaffWriteParishContextResult> {
  const { data, error } = await supabase.rpc('current_staff_primary_parish_id')
  const parishId = normalizeId(data)

  if (!error && parishId) {
    return {
      ok: true,
      parishId,
      source: 'membership',
      requestedParishId: null,
    }
  }

  if (options.allowPrimaryParishFallback) {
    return loadPrimaryParishFallback(
      supabase,
      null,
      options.fallbackReason ??
        (error
          ? isMissingMembershipFoundation(error)
            ? 'Membership foundation is not deployed.'
            : (safeTechnicalDetail(error) ?? 'Membership lookup failed.')
          : 'No active parish membership was found.')
    )
  }

  return {
    ok: false,
    error: 'Parish membership is required before writing parish data.',
    technicalDetail: safeTechnicalDetail(error) ?? 'No active parish membership was found.',
    source: 'membership',
    requestedParishId: null,
  }
}

async function resolveRequestedMembershipParish(
  supabase: MinimalSupabaseClient,
  requestedParishId: string,
  options: Required<Pick<StaffWriteParishContextOptions, 'allowPrimaryParishFallback'>> &
    Pick<StaffWriteParishContextOptions, 'fallbackReason'>
): Promise<StaffWriteParishContextResult> {
  const { data, error } = await supabase.rpc('is_authorized_for_parish', {
    p_parish_id: requestedParishId,
  })

  if (!error && data === true) {
    return {
      ok: true,
      parishId: requestedParishId,
      source: 'membership',
      requestedParishId,
    }
  }

  if (error && options.allowPrimaryParishFallback) {
    return loadPrimaryParishFallback(
      supabase,
      requestedParishId,
      options.fallbackReason ??
        (isMissingMembershipFoundation(error)
          ? 'Membership foundation is not deployed.'
          : (safeTechnicalDetail(error) ?? 'Membership authorization failed.'))
    )
  }

  return {
    ok: false,
    error: 'You are not authorized to write to this parish.',
    technicalDetail: safeTechnicalDetail(error) ?? 'No active parish membership matched the requested parish.',
    source: 'membership',
    requestedParishId,
  }
}

/**
 * Resolves the parish id a staff user may use for a write operation.
 *
 * This helper is intentionally stricter than read-path resolvers. Membership is
 * required by default. Callers must explicitly opt into `primary_parish_id()`
 * compatibility fallback while legacy write paths are being migrated.
 */
export async function resolveStaffWriteParishContext(
  supabase: MinimalSupabaseClient,
  options: StaffWriteParishContextOptions = {}
): Promise<StaffWriteParishContextResult> {
  const requestedParishId = normalizeId(options.requestedParishId)
  const normalizedOptions = {
    allowPrimaryParishFallback: options.allowPrimaryParishFallback === true,
    fallbackReason: options.fallbackReason,
  }

  if (requestedParishId) {
    return resolveRequestedMembershipParish(supabase, requestedParishId, normalizedOptions)
  }

  return resolvePrimaryMembershipParish(supabase, normalizedOptions)
}

export const staffWriteParishContextTestInternals = {
  isMissingMembershipFoundation,
  normalizeId,
}
