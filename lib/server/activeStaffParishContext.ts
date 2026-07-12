import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  resolveStaffParishContext,
  type StaffParishContextParish,
  type StaffParishContextSource,
} from '@/lib/server/staffParishContext'

type MinimalSupabaseClient = Pick<SupabaseClient, 'from' | 'rpc'>

export const ACTIVE_STAFF_PARISH_COOKIE = 'vinea_active_parish_id'

export type ActiveStaffParishContextOptions = {
  requestedParishId?: unknown
}

export type ActiveStaffParishContextResult =
  | {
      ok: true
      source: StaffParishContextSource
      parishIds: string[]
      primaryParishId: string
      activeParishId: string
      activeParish: StaffParishContextParish
      parishes: StaffParishContextParish[]
      requestedParishId: string | null
      fallbackReason?: string
      ignoredRequestedParishReason?: string
    }
  | {
      ok: false
      source: StaffParishContextSource
      error: string
      technicalDetail: string | null
      requestedParishId: string | null
    }

function normalizeId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

function parishFallback(id: string): StaffParishContextParish {
  return { id, name: null }
}

/**
 * Resolves the active parish a staff session should read from.
 *
 * This is a safe foundation for a future parish switcher. A requested parish is
 * honored only when it is already present in the authenticated staff parish
 * membership context. Tampered or stale selections fall back to the primary
 * authorized parish instead of expanding data access.
 */
export async function resolveActiveStaffParishContext(
  supabase: MinimalSupabaseClient,
  options: ActiveStaffParishContextOptions = {}
): Promise<ActiveStaffParishContextResult> {
  const requestedParishId = normalizeId(options.requestedParishId)
  const context = await resolveStaffParishContext(supabase)

  if (!context.ok) {
    return {
      ok: false,
      source: context.source,
      error: context.error,
      technicalDetail: context.technicalDetail,
      requestedParishId,
    }
  }

  const primaryParish =
    context.parishes.find((parish) => parish.id === context.primaryParishId) ??
    parishFallback(context.primaryParishId)

  if (!requestedParishId) {
    return {
      ...context,
      activeParishId: context.primaryParishId,
      activeParish: primaryParish,
      requestedParishId: null,
    }
  }

  const requestedParish = context.parishes.find((parish) => parish.id === requestedParishId)
  if (requestedParish && context.parishIds.includes(requestedParishId)) {
    return {
      ...context,
      activeParishId: requestedParishId,
      activeParish: requestedParish,
      requestedParishId,
    }
  }

  return {
    ...context,
    activeParishId: context.primaryParishId,
    activeParish: primaryParish,
    requestedParishId,
    ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
  }
}

export const activeStaffParishContextTestInternals = {
  normalizeId,
}
