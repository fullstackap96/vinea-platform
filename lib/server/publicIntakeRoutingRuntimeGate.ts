import 'server-only'

export const PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG = 'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME'
export const PUBLIC_INTAKE_ROUTING_RUNTIME_ACK = 'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK'

export const PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE = 'ENABLED'
export const PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE = 'APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME'

export type PublicIntakeRuntimeRouteSignal = 'verified_domain' | 'token' | 'slug'

export type PublicIntakeRoutingRuntimeGateResult =
  | {
      enabled: true
      routeSignals: readonly PublicIntakeRuntimeRouteSignal[]
      legacyFallback: true
    }
  | {
      enabled: false
      reason: string
      routeSignals: readonly []
      legacyFallback: true
    }

function envValue(name: string, env: NodeJS.ProcessEnv): string {
  return String(env[name] ?? '').trim()
}

/**
 * Runtime public intake parish routing is intentionally disabled by default.
 *
 * Future wiring must call this server-only gate before resolving parish scope
 * from verified domains, public tokens, or slugs. The legacy primary-parish
 * fallback remains available so current public forms can keep working while
 * multi-parish routing is rolled out deliberately.
 */
export function getPublicIntakeRoutingRuntimeGate(
  env: NodeJS.ProcessEnv = process.env
): PublicIntakeRoutingRuntimeGateResult {
  if (
    envValue(PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG, env) !==
    PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE
  ) {
    return {
      enabled: false,
      reason: `${PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG} is not enabled.`,
      routeSignals: [],
      legacyFallback: true,
    }
  }

  if (
    envValue(PUBLIC_INTAKE_ROUTING_RUNTIME_ACK, env) !==
    PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE
  ) {
    return {
      enabled: false,
      reason: `${PUBLIC_INTAKE_ROUTING_RUNTIME_ACK} approval is missing.`,
      routeSignals: [],
      legacyFallback: true,
    }
  }

  return {
    enabled: true,
    routeSignals: ['verified_domain', 'token', 'slug'],
    legacyFallback: true,
  }
}

export const publicIntakeRoutingRuntimeGateTestInternals = {
  envValue,
}
