import 'server-only'

import type { PublicIntakeParishScopeInput } from '@/lib/server/publicIntakeParishScope'
import type { PublicIntakeRoutingRuntimeGateResult } from '@/lib/server/publicIntakeRoutingRuntimeGate'

type HeaderValue = string | readonly string[] | null | undefined

export type PublicIntakeRouteSignalDryRunInput = {
  gate: PublicIntakeRoutingRuntimeGateResult
  requestUrl: string | URL
  headers?: Headers | Record<string, HeaderValue> | null
  body?: Record<string, unknown> | null
  legacyPath?: string | null
}

export type PublicIntakeRouteSignalDryRunResult = {
  runtimeRoutingEnabled: boolean
  resolverWouldRun: boolean
  legacyFallbackAvailable: boolean
  routingInput: PublicIntakeParishScopeInput
  auditSafeSignalSummary: {
    hostname: string | null
    publicTokenPresent: boolean
    parishSlug: string | null
    requestType: string | null
    legacyPath: string | null
    staffActiveParishCookieIgnored: boolean
  }
}

function text(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function firstHeaderValue(value: HeaderValue): string | null {
  if (Array.isArray(value)) return text(value[0])
  return text(value)
}

function headerValue(headers: PublicIntakeRouteSignalDryRunInput['headers'], name: string): string | null {
  if (!headers) return null

  if (headers instanceof Headers) return text(headers.get(name))

  const target = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return firstHeaderValue(value)
  }

  return null
}

function requestUrl(input: string | URL): URL {
  if (input instanceof URL) return input
  return new URL(input, 'https://vinea.local')
}

function hostnameFrom(input: PublicIntakeRouteSignalDryRunInput, url: URL): string | null {
  const forwardedHost = headerValue(input.headers, 'x-forwarded-host')
  const host = forwardedHost ?? headerValue(input.headers, 'host') ?? url.host
  return text(host)?.split(',')[0]?.trim().toLowerCase().split(':')[0] ?? null
}

function bodyText(body: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!body) return null
  for (const key of keys) {
    const value = text(body[key])
    if (value) return value
  }
  return null
}

function searchText(url: URL, keys: string[]): string | null {
  for (const key of keys) {
    const value = text(url.searchParams.get(key))
    if (value) return value
  }
  return null
}

function refererPath(headers: PublicIntakeRouteSignalDryRunInput['headers']): string | null {
  const referer = headerValue(headers, 'referer') ?? headerValue(headers, 'referrer')
  if (!referer) return null
  try {
    return new URL(referer).pathname || null
  } catch {
    return referer.startsWith('/') ? referer : null
  }
}

function legacyPathFrom(input: PublicIntakeRouteSignalDryRunInput, url: URL): string | null {
  return (
    text(input.legacyPath) ??
    searchText(url, ['legacyPath', 'sourcePath', 'returnPath']) ??
    bodyText(input.body, ['legacyPath', 'sourcePath', 'returnPath']) ??
    refererPath(input.headers)
  )
}

/**
 * Future `/api/intake` route-signal extraction dry run.
 *
 * This helper is intentionally not imported by the live route. It only
 * normalizes the public signals a future approved runtime phase may pass to
 * the parish-scope adapter; it never calls the public routing resolver.
 */
export function extractPublicIntakeRouteSignalsForDryRun(
  input: PublicIntakeRouteSignalDryRunInput
): PublicIntakeRouteSignalDryRunResult {
  const url = requestUrl(input.requestUrl)
  const publicToken =
    searchText(url, ['publicToken', 'token']) ?? bodyText(input.body, ['publicToken', 'token'])
  const parishSlug =
    searchText(url, ['parishSlug', 'slug']) ?? bodyText(input.body, ['parishSlug', 'slug'])
  const requestType =
    searchText(url, ['requestType']) ?? bodyText(input.body, ['requestType'])
  const legacyPath = legacyPathFrom(input, url)
  const activeParishCookie = headerValue(input.headers, 'cookie')?.includes('vinea_active_parish_id=')

  const routingInput: PublicIntakeParishScopeInput = {
    publicToken,
    hostname: hostnameFrom(input, url),
    parishSlug,
    requestType,
    legacyPath,
    activeParishCookie: activeParishCookie ? 'ignored-in-public-intake' : null,
  }

  return {
    runtimeRoutingEnabled: input.gate.enabled,
    resolverWouldRun: input.gate.enabled,
    legacyFallbackAvailable: input.gate.legacyFallback,
    routingInput,
    auditSafeSignalSummary: {
      hostname: routingInput.hostname ?? null,
      publicTokenPresent: Boolean(publicToken),
      parishSlug,
      requestType,
      legacyPath,
      staffActiveParishCookieIgnored: Boolean(activeParishCookie),
    },
  }
}
