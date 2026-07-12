import 'server-only'

import type {
  PublicIntakeParishScopeInput,
  PublicIntakeParishScopeResult,
  PublicIntakeRouteSource,
} from '@/lib/server/publicIntakeParishScope'
import type { PublicIntakeRoutingRuntimeGateResult } from '@/lib/server/publicIntakeRoutingRuntimeGate'

type LegacyParishScopeLoader = () => Promise<string | null>
type RoutedParishScopeResolver = (
  input: PublicIntakeParishScopeInput
) => Promise<PublicIntakeParishScopeResult>

export type PublicIntakeRequestParishScopeAdapterInput = {
  gate: PublicIntakeRoutingRuntimeGateResult
  routingInput: PublicIntakeParishScopeInput
  loadLegacyPrimaryParishId: LegacyParishScopeLoader
  resolveRoutedParishScope: RoutedParishScopeResolver
}

export type FuturePublicIntakeAuditRouteMetadata = {
  publicIntakeRouteSource: PublicIntakeRouteSource
  publicIntakeRoutingRuntimeEnabled: boolean
  publicIntakePublicDisplayName: string | null
  publicIntakeResolvedRequestType: string | null
}

export type PublicIntakeRequestParishScopeAdapterResult =
  | {
      ok: true
      parishId: string
      routeSource: PublicIntakeRouteSource
      runtimeRoutingEnabled: boolean
      publicDisplayName: string | null
      resolvedRequestType: string | null
      auditMetadata: FuturePublicIntakeAuditRouteMetadata
    }
  | {
      ok: false
      status: 404 | 410
      error: string
    }

function unavailable(): PublicIntakeRequestParishScopeAdapterResult {
  return { ok: false, status: 404, error: 'Public intake form is not available.' }
}

function scopedResult(input: {
  parishId: string
  routeSource: PublicIntakeRouteSource
  runtimeRoutingEnabled: boolean
  publicDisplayName: string | null
  resolvedRequestType: string | null
}): PublicIntakeRequestParishScopeAdapterResult {
  return {
    ok: true,
    ...input,
    auditMetadata: {
      publicIntakeRouteSource: input.routeSource,
      publicIntakeRoutingRuntimeEnabled: input.runtimeRoutingEnabled,
      publicIntakePublicDisplayName: input.publicDisplayName,
      publicIntakeResolvedRequestType: input.resolvedRequestType,
    },
  }
}

/**
 * `/api/intake` parish-scope adapter.
 *
 * When runtime routing is disabled, preserve the current legacy primary
 * parish behavior; when enabled, accept the explicit public routing resolver
 * result and carry route-source metadata for audit/QA.
 */
export async function resolvePublicIntakeRequestParishScopeForFutureRuntime({
  gate,
  routingInput,
  loadLegacyPrimaryParishId,
  resolveRoutedParishScope,
}: PublicIntakeRequestParishScopeAdapterInput): Promise<PublicIntakeRequestParishScopeAdapterResult> {
  if (!gate.enabled) {
    const parishId = await loadLegacyPrimaryParishId()
    if (!parishId) return unavailable()

    return scopedResult({
      parishId,
      routeSource: 'legacy_fallback',
      runtimeRoutingEnabled: false,
      publicDisplayName: null,
      resolvedRequestType: null,
    })
  }

  const routed = await resolveRoutedParishScope(routingInput)
  if (!routed.ok) return routed

  return scopedResult({
    parishId: routed.parishId,
    routeSource: routed.routeSource,
    runtimeRoutingEnabled: true,
    publicDisplayName: routed.publicDisplayName,
    resolvedRequestType: routed.requestType,
  })
}
