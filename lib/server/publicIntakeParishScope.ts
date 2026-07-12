import 'server-only'

import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

const REQUEST_TYPES = ['baptism', 'funeral', 'wedding', 'ocia', 'join_parish'] as const
const LEGACY_INTAKE_PATHS = new Set([
  '/baptism-request',
  '/funeral-request',
  '/wedding-request',
  '/ocia-request',
  '/join-parish-request',
])

export type PublicIntakeRequestType = (typeof REQUEST_TYPES)[number]
export type PublicIntakeRouteSource = 'token' | 'domain' | 'slug' | 'legacy_fallback'

export type PublicIntakeParishScopeInput = {
  publicToken?: string | null
  hostname?: string | null
  parishSlug?: string | null
  requestType?: string | null
  legacyPath?: string | null
  /**
   * Explicitly ignored. Public intake must not trust staff session state.
   * This field exists so tests can prove forged staff active parish cookies
   * have no effect on public routing.
   */
  activeParishCookie?: string | null
  now?: Date
}

export type PublicIntakeParishScopeResult =
  | {
      ok: true
      parishId: string
      routeSource: PublicIntakeRouteSource
      publicDisplayName: string | null
      requestType: PublicIntakeRequestType | null
    }
  | {
      ok: false
      status: 404 | 410
      error: string
    }

export type PublicIntakeParish = {
  id: string
  name: string | null
  publicDisplayName: string | null
  publicIntakeEnabled: boolean
}

export type PublicIntakeTokenRoute = {
  parishId: string
  requestType: PublicIntakeRequestType | null
  active: boolean
  expiresAt: string | null
}

export type PublicIntakeDomainRoute = {
  parishId: string
  active: boolean
  verifiedAt: string | null
}

export type PublicIntakeParishScopeDataSource = {
  findTokenByHash(tokenHash: string): Promise<PublicIntakeTokenRoute | null>
  findDomainByHostname(hostname: string): Promise<PublicIntakeDomainRoute | null>
  findParishBySlug(slug: string): Promise<PublicIntakeParish | null>
  findParishById(parishId: string): Promise<PublicIntakeParish | null>
  findLegacyPrimaryParish(): Promise<PublicIntakeParish | null>
}

type MinimalSupabaseClient = Pick<SupabaseClient, 'from'>

function normalizeText(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text || null
}

function normalizeHostname(value: unknown): string | null {
  const hostname = normalizeText(value)?.toLowerCase()
  if (!hostname) return null
  return hostname.split(':')[0] || null
}

function normalizeSlug(value: unknown): string | null {
  return normalizeText(value)?.toLowerCase() ?? null
}

function normalizePath(value: unknown): string | null {
  const path = normalizeText(value)
  if (!path) return null
  return path.startsWith('/') ? path : `/${path}`
}

function normalizeRequestType(value: unknown): PublicIntakeRequestType | null {
  const requestType = normalizeText(value)?.toLowerCase()
  return REQUEST_TYPES.includes(requestType as PublicIntakeRequestType)
    ? (requestType as PublicIntakeRequestType)
    : null
}

function hashPublicToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function genericMissing(): PublicIntakeParishScopeResult {
  return { ok: false, status: 404, error: 'Public intake form is not available.' }
}

function genericGone(): PublicIntakeParishScopeResult {
  return { ok: false, status: 410, error: 'Public intake form is not available.' }
}

function successfulScope(
  parish: PublicIntakeParish,
  routeSource: PublicIntakeRouteSource,
  requestType: PublicIntakeRequestType | null
): PublicIntakeParishScopeResult {
  return {
    ok: true,
    parishId: parish.id,
    routeSource,
    publicDisplayName: parish.publicDisplayName ?? parish.name,
    requestType,
  }
}

function isExpired(expiresAt: string | null, now: Date): boolean {
  if (!expiresAt) return false
  const expires = new Date(expiresAt)
  return Number.isFinite(expires.getTime()) && expires.getTime() <= now.getTime()
}

async function resolveTokenScope(
  dataSource: PublicIntakeParishScopeDataSource,
  input: PublicIntakeParishScopeInput,
  now: Date
): Promise<PublicIntakeParishScopeResult | null> {
  const token = normalizeText(input.publicToken)
  if (!token) return null

  const route = await dataSource.findTokenByHash(hashPublicToken(token))
  if (!route) return genericMissing()
  if (!route.active || isExpired(route.expiresAt, now)) return genericGone()

  const requestedType = normalizeRequestType(input.requestType)
  if (route.requestType && requestedType && route.requestType !== requestedType) {
    return genericMissing()
  }

  const parish = await dataSource.findParishById(route.parishId)
  if (!parish?.publicIntakeEnabled) return genericMissing()

  return successfulScope(parish, 'token', route.requestType ?? requestedType)
}

async function resolveDomainScope(
  dataSource: PublicIntakeParishScopeDataSource,
  input: PublicIntakeParishScopeInput
): Promise<PublicIntakeParishScopeResult | null> {
  const hostname = normalizeHostname(input.hostname)
  if (!hostname) return null

  const route = await dataSource.findDomainByHostname(hostname)
  if (!route) return null
  if (!route.active || !route.verifiedAt) return genericMissing()

  const parish = await dataSource.findParishById(route.parishId)
  if (!parish?.publicIntakeEnabled) return genericMissing()

  return successfulScope(parish, 'domain', normalizeRequestType(input.requestType))
}

async function resolveSlugScope(
  dataSource: PublicIntakeParishScopeDataSource,
  input: PublicIntakeParishScopeInput
): Promise<PublicIntakeParishScopeResult | null> {
  const slug = normalizeSlug(input.parishSlug)
  if (!slug) return null

  const parish = await dataSource.findParishBySlug(slug)
  if (!parish?.publicIntakeEnabled) return genericMissing()

  return successfulScope(parish, 'slug', normalizeRequestType(input.requestType))
}

async function resolveLegacyScope(
  dataSource: PublicIntakeParishScopeDataSource,
  input: PublicIntakeParishScopeInput
): Promise<PublicIntakeParishScopeResult> {
  const legacyPath = normalizePath(input.legacyPath)
  if (!legacyPath || !LEGACY_INTAKE_PATHS.has(legacyPath)) return genericMissing()

  const parish = await dataSource.findLegacyPrimaryParish()
  if (!parish) return genericMissing()

  return successfulScope(parish, 'legacy_fallback', normalizeRequestType(input.requestType))
}

/**
 * Resolves the public parish scope for future multi-parish intake routing.
 *
 * Public intake routing uses explicit public token, domain, slug, or legacy path
 * signals only. Staff active parish cookies are ignored by design.
 */
export async function resolvePublicIntakeParishScope(
  dataSource: PublicIntakeParishScopeDataSource,
  input: PublicIntakeParishScopeInput
): Promise<PublicIntakeParishScopeResult> {
  const now = input.now ?? new Date()

  return (
    (await resolveTokenScope(dataSource, input, now)) ??
    (await resolveDomainScope(dataSource, input)) ??
    (await resolveSlugScope(dataSource, input)) ??
    (await resolveLegacyScope(dataSource, input))
  )
}

function mapParish(row: {
  id?: unknown
  name?: unknown
  public_display_name?: unknown
  public_intake_enabled?: unknown
} | null): PublicIntakeParish | null {
  const id = normalizeText(row?.id)
  if (!id) return null
  return {
    id,
    name: normalizeText(row?.name),
    publicDisplayName: normalizeText(row?.public_display_name),
    publicIntakeEnabled: row?.public_intake_enabled === true,
  }
}

function mapToken(row: {
  parish_id?: unknown
  request_type?: unknown
  active?: unknown
  expires_at?: unknown
} | null): PublicIntakeTokenRoute | null {
  const parishId = normalizeText(row?.parish_id)
  if (!parishId) return null
  return {
    parishId,
    requestType: normalizeRequestType(row?.request_type),
    active: row?.active === true,
    expiresAt: normalizeText(row?.expires_at),
  }
}

function mapDomain(row: {
  parish_id?: unknown
  active?: unknown
  verified_at?: unknown
} | null): PublicIntakeDomainRoute | null {
  const parishId = normalizeText(row?.parish_id)
  if (!parishId) return null
  return {
    parishId,
    active: row?.active === true,
    verifiedAt: normalizeText(row?.verified_at),
  }
}

export function createSupabasePublicIntakeParishScopeDataSource(
  supabase: MinimalSupabaseClient
): PublicIntakeParishScopeDataSource {
  return {
    async findTokenByHash(tokenHash) {
      const { data, error } = await supabase
        .from('parish_public_intake_tokens')
        .select('parish_id, request_type, active, expires_at')
        .eq('token_hash', tokenHash)
        .maybeSingle()
      if (error) throw error
      return mapToken(data)
    },
    async findDomainByHostname(hostname) {
      const { data, error } = await supabase
        .from('parish_public_intake_domains')
        .select('parish_id, active, verified_at')
        .eq('hostname', hostname)
        .maybeSingle()
      if (error) throw error
      return mapDomain(data)
    },
    async findParishBySlug(slug) {
      const { data, error } = await supabase
        .from('parishes')
        .select('id, name, public_display_name, public_intake_enabled')
        .eq('public_slug', slug)
        .maybeSingle()
      if (error) throw error
      return mapParish(data)
    },
    async findParishById(parishId) {
      const { data, error } = await supabase
        .from('parishes')
        .select('id, name, public_display_name, public_intake_enabled')
        .eq('id', parishId)
        .maybeSingle()
      if (error) throw error
      return mapParish(data)
    },
    async findLegacyPrimaryParish() {
      const { data, error } = await supabase
        .from('parishes')
        .select('id, name, public_display_name, public_intake_enabled')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      const parish = mapParish(data)
      return parish ? { ...parish, publicIntakeEnabled: true } : null
    },
  }
}

export const publicIntakeParishScopeTestInternals = {
  hashPublicToken,
  normalizeHostname,
  normalizePath,
  normalizeRequestType,
  normalizeSlug,
}
