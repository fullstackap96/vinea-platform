import { createHash, randomBytes } from 'node:crypto'
import { resolveTxt } from 'node:dns/promises'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

const MAX_BODY_BYTES = 32 * 1024
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

type PublicIntakeRoutingPatch =
  | {
      ok: true
      patch: {
        public_display_name: string | null
        public_slug: string | null
        public_intake_enabled: boolean
        updated_at: string
      }
    }
  | { ok: false; error: string }

type PublicIntakeDomainCreate =
  | { ok: true; hostname: string; active: boolean }
  | { ok: false; error: string }

type PublicIntakeDomainPatch =
  | { ok: true; domainId: string; active: boolean }
  | { ok: false; error: string }

type PublicIntakeDomainVerificationPatch =
  | { ok: true; domainId: string; action: 'verify' | 'reset_verification' }
  | { ok: false; error: string }

type PublicIntakeTokenCreate =
  | {
      ok: true
      label: string
      requestType: PublicIntakeRequestType | null
      expiresAt: string | null
      active: boolean
    }
  | { ok: false; error: string }

type PublicIntakeTokenPatch =
  | { ok: true; tokenId: string; active: boolean }
  | { ok: false; error: string }

const PUBLIC_INTAKE_REQUEST_TYPES = [
  'baptism',
  'funeral',
  'wedding',
  'ocia',
  'join_parish',
] as const

type PublicIntakeRequestType = (typeof PUBLIC_INTAKE_REQUEST_TYPES)[number]

function publicIntakeRoutingErrorResponse(
  context: string,
  error: unknown,
  message: string,
  status = 500,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(context, error, extra)
  return NextResponse.json({ ok: false, error: message }, { status })
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function normalizeOptionalText(value: unknown, maxLength: number): string | null {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizePublicSlug(value: unknown): string | null {
  const slug = String(value ?? '').trim().toLowerCase()
  return slug || null
}

function normalizePublicIntakeRequestType(value: unknown): PublicIntakeRequestType | null {
  const requestType = String(value ?? '').trim().toLowerCase()
  if (!requestType) return null
  return PUBLIC_INTAKE_REQUEST_TYPES.includes(requestType as PublicIntakeRequestType)
    ? (requestType as PublicIntakeRequestType)
    : null
}

function normalizeHostname(value: unknown): string | null {
  const input = String(value ?? '').trim().toLowerCase()
  if (!input) return null

  try {
    const withProtocol = input.includes('://') ? input : `https://${input}`
    return new URL(withProtocol).hostname || null
  } catch {
    return null
  }
}

function isValidHostname(hostname: string): boolean {
  if (hostname.length > 253) return false
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    hostname
  )
}

function normalizePublicIntakeRoutingPatch(body: Record<string, unknown>): PublicIntakeRoutingPatch {
  const publicSlug = normalizePublicSlug(body.public_slug)
  if (publicSlug && !/^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(publicSlug)) {
    return {
      ok: false,
      error:
        'Public slug must be 3-80 lowercase letters, numbers, or hyphens, and cannot start or end with a hyphen.',
    }
  }

  return {
    ok: true,
    patch: {
      public_display_name: normalizeOptionalText(body.public_display_name, 200),
      public_slug: publicSlug,
      public_intake_enabled: body.public_intake_enabled === true,
      updated_at: new Date().toISOString(),
    },
  }
}

function normalizeDomainCreate(body: Record<string, unknown>): PublicIntakeDomainCreate {
  const hostname = normalizeHostname(body.hostname)
  if (!hostname || !isValidHostname(hostname)) {
    return {
      ok: false,
      error: 'Enter a valid domain, such as forms.yourparish.org.',
    }
  }

  return { ok: true, hostname, active: body.active !== false }
}

function normalizeDomainPatch(body: Record<string, unknown>): PublicIntakeDomainPatch {
  const domainId = String(body.domain_id ?? '').trim()
  if (!domainId) return { ok: false, error: 'Missing domain id.' }

  return {
    ok: true,
    domainId,
    active: body.active === true,
  }
}

function normalizeDomainVerificationPatch(
  body: Record<string, unknown>
): PublicIntakeDomainVerificationPatch {
  const domainId = String(body.domain_id ?? '').trim()
  if (!domainId) return { ok: false, error: 'Missing domain id.' }

  const action = String(body.domain_action ?? '').trim()
  if (action !== 'verify' && action !== 'reset_verification') {
    return { ok: false, error: 'Choose a valid public intake domain verification action.' }
  }

  return { ok: true, domainId, action }
}

function normalizeTokenExpiresAt(value: unknown): { ok: true; expiresAt: string | null } | { ok: false; error: string } {
  const raw = String(value ?? '').trim()
  if (!raw) return { ok: true, expiresAt: null }

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T23:59:59.999Z`)
    : new Date(raw)
  if (!Number.isFinite(parsed.getTime())) {
    return { ok: false, error: 'Enter a valid expiration date, or leave it blank.' }
  }

  return { ok: true, expiresAt: parsed.toISOString() }
}

function normalizeTokenCreate(body: Record<string, unknown>): PublicIntakeTokenCreate {
  const label = normalizeOptionalText(body.token_label ?? body.label, 120)
  if (!label) return { ok: false, error: 'Token label is required.' }

  const requestTypeRaw = String(body.request_type ?? '').trim()
  const requestType = normalizePublicIntakeRequestType(requestTypeRaw)
  if (requestTypeRaw && !requestType) {
    return { ok: false, error: 'Choose a valid public form type for this token.' }
  }

  const expires = normalizeTokenExpiresAt(body.expires_at)
  if (!expires.ok) return expires

  return {
    ok: true,
    label,
    requestType,
    expiresAt: expires.expiresAt,
    active: body.active !== false,
  }
}

function normalizeTokenPatch(body: Record<string, unknown>): PublicIntakeTokenPatch {
  const tokenId = String(body.token_id ?? '').trim()
  if (!tokenId) return { ok: false, error: 'Missing public intake token id.' }

  return {
    ok: true,
    tokenId,
    active: body.active === true,
  }
}

function generateRawPublicIntakeToken(): string {
  return `vinea_${randomBytes(24).toString('base64url')}`
}

function hashPublicIntakeToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex')
}

function generateDomainVerificationToken(): string {
  return `vinea-domain-${randomBytes(18).toString('base64url')}`
}

function domainVerificationChallenge(hostname: string, token = generateDomainVerificationToken()) {
  return {
    verification_token: token,
    verification_dns_name: `_vinea-intake.${hostname}`,
    verification_dns_value: `vinea-domain-verification=${token}`,
  }
}

function txtRecordsContainValue(records: string[][], expected: string): boolean {
  return records.some((record) => record.join('').trim() === expected)
}

async function verifyDomainDnsTxt(dnsName: string, expectedValue: string) {
  try {
    const records = await resolveTxt(dnsName)
    return {
      verified: txtRecordsContainValue(records, expectedValue),
      error: txtRecordsContainValue(records, expectedValue)
        ? null
        : 'DNS TXT record was found, but it did not contain the expected Vinea verification value.',
    }
  } catch {
    return {
      verified: false,
      error:
        'Vinea could not find the required DNS TXT record yet. DNS changes can take time to publish.',
    }
  }
}

async function resolvePublicIntakeRoutingWriteParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  return resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason: 'Public intake routing settings API legacy compatibility path.',
  })
}

async function resolvePublicIntakeRoutingReadParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (requestedParishId && context.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read public intake routing for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read public intake routing for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function loadPublicIntakeRoutingMetadata(admin: AdminClient, parishId: string) {
  const { data: parish, error: parishError } = await admin
    .from('parishes')
    .select('id, name, public_slug, public_display_name, public_intake_enabled')
    .eq('id', parishId)
    .maybeSingle()

  if (parishError) throw parishError
  if (!parish) throw new Error('Parish not found.')

  const { data: domains, error: domainsError } = await admin
    .from('parish_public_intake_domains')
    .select(
      'id, hostname, verified_at, active, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, created_at, updated_at'
    )
    .eq('parish_id', parishId)
    .order('active', { ascending: false })
    .order('hostname', { ascending: true })

  if (domainsError) throw domainsError

  const { data: tokens, error: tokensError } = await admin
    .from('parish_public_intake_tokens')
    .select('id, label, request_type, expires_at, active, last_used_at, created_at, updated_at')
    .eq('parish_id', parishId)
    .order('active', { ascending: false })
    .order('created_at', { ascending: false })

  if (tokensError) throw tokensError

  return {
    parish,
    domains: domains ?? [],
    tokens: tokens ?? [],
  }
}

function supabaseErrorTextParts(error: unknown): string[] {
  if (!error || typeof error !== 'object') return []
  const record = error as Record<string, unknown>
  return ['code', 'message', 'details', 'hint']
    .map((key) => record[key])
    .filter((value): value is string => typeof value === 'string')
}

function isSupabaseUniqueConstraintError(error: unknown, constraintName: string): boolean {
  const parts = supabaseErrorTextParts(error)
  return parts.some(
    (part) =>
      part.includes('23505') ||
      part.includes('duplicate key') ||
      part.includes(constraintName)
  )
}

function publicIntakeDomainConflictResponse(error: unknown) {
  const isConflict =
    isSupabaseUniqueConstraintError(
      error,
      'parish_public_intake_domains_hostname_lower_unique'
    )

  if (!isConflict) {
    return publicIntakeRoutingErrorResponse(
      'public_intake_routing_domain_create_failed',
      error,
      'Could not add public intake domain.'
    )
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'That public intake domain is already configured.',
    },
    { status: 409 }
  )
}

function publicIntakeTokenConflictResponse(error: unknown) {
  const isConflict =
    isSupabaseUniqueConstraintError(error, 'parish_public_intake_tokens_token_hash_unique')

  if (!isConflict) {
    return publicIntakeRoutingErrorResponse(
      'public_intake_routing_token_create_failed',
      error,
      'Could not create public intake token.'
    )
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Could not create a unique public intake token. Please try again.',
    },
    { status: 409 }
  )
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolvePublicIntakeRoutingReadParishId(
      staff.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }

    const routing = await loadPublicIntakeRoutingMetadata(admin, parishContext.activeParishId)
    return NextResponse.json({
      ok: true,
      routing: {
        ...routing,
        activeParishId: parishContext.activeParishId,
        source: parishContext.source,
        requestedParishId: parishContext.requestedParishId,
      },
    })
  } catch (error: unknown) {
    return publicIntakeRoutingErrorResponse(
      'public_intake_routing_load_failed',
      error,
      'Could not load public intake routing metadata.'
    )
  }
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Public intake routing update is too large.'
            : 'Invalid JSON body.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (body.kind === 'token' || 'token_label' in body) {
    const normalizedToken = normalizeTokenCreate(body)
    if (!normalizedToken.ok) {
      return NextResponse.json({ ok: false, error: normalizedToken.error }, { status: 400 })
    }

    try {
      const admin = createSupabaseServiceRoleClient()
      const requestedParishId = activeParishCookie(request)
      const parishContext = await resolvePublicIntakeRoutingWriteParishId(
        staff.supabase,
        requestedParishId
      )
      if (!parishContext.ok) {
        return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
      }

      const parishId = parishContext.parishId
      const rawToken = generateRawPublicIntakeToken()
      const { data: token, error: insertError } = await admin
        .from('parish_public_intake_tokens')
        .insert({
          parish_id: parishId,
          token_hash: hashPublicIntakeToken(rawToken),
          label: normalizedToken.label,
          request_type: normalizedToken.requestType,
          expires_at: normalizedToken.expiresAt,
          active: normalizedToken.active,
          updated_at: new Date().toISOString(),
        })
        .select('id, label, request_type, expires_at, active, last_used_at, created_at, updated_at')
        .single()

      if (insertError) return publicIntakeTokenConflictResponse(insertError)

      await writeAuditEvent({
        parishId,
        actorEmail: staff.staff.email,
        action: 'public_intake_token.created',
        targetType: 'parish_public_intake_token',
        targetId: String(token.id),
        metadata: {
          label: token.label,
          request_type: token.request_type ?? null,
          expires_at: token.expires_at ?? null,
          active: token.active === true,
        },
      })

      const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
      return NextResponse.json(
        {
          ok: true,
          routing: {
            ...routing,
            activeParishId: parishId,
            source: parishContext.source,
            requestedParishId: parishContext.requestedParishId,
          },
          createdToken: {
            id: token.id,
            token: rawToken,
            label: token.label,
            request_type: token.request_type ?? null,
            expires_at: token.expires_at ?? null,
          },
        },
        { status: 201 }
      )
    } catch (error: unknown) {
      return publicIntakeRoutingErrorResponse(
        'public_intake_routing_token_create_failed',
        error,
        'Could not create public intake token.'
      )
    }
  }

  const normalized = normalizeDomainCreate(body)
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolvePublicIntakeRoutingWriteParishId(
      staff.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }

    const parishId = parishContext.parishId
    const challenge = domainVerificationChallenge(normalized.hostname)
    const { data: domain, error: insertError } = await admin
      .from('parish_public_intake_domains')
      .insert({
        parish_id: parishId,
        hostname: normalized.hostname,
        active: normalized.active,
        ...challenge,
        updated_at: new Date().toISOString(),
      })
      .select(
        'id, hostname, active, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error'
      )
      .single()

    if (insertError) return publicIntakeDomainConflictResponse(insertError)

    await writeAuditEvent({
      parishId,
      actorEmail: staff.staff.email,
      action: 'public_intake_domain.created',
      targetType: 'parish_public_intake_domain',
      targetId: String(domain.id),
      metadata: {
        hostname: domain.hostname,
        active: domain.active === true,
        verified_at: domain.verified_at ?? null,
        verification_dns_name: domain.verification_dns_name ?? null,
      },
    })

    const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
    return NextResponse.json(
      {
        ok: true,
        routing: {
          ...routing,
          activeParishId: parishId,
          source: parishContext.source,
          requestedParishId: parishContext.requestedParishId,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    return publicIntakeRoutingErrorResponse(
      'public_intake_routing_domain_create_failed',
      error,
      'Could not add public intake domain.'
    )
  }
}

export async function PATCH(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Public intake routing update is too large.'
            : 'Invalid JSON body.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  if ('token_id' in body) {
    const normalizedToken = normalizeTokenPatch(body)
    if (!normalizedToken.ok) {
      return NextResponse.json({ ok: false, error: normalizedToken.error }, { status: 400 })
    }

    try {
      const admin = createSupabaseServiceRoleClient()
      const requestedParishId = activeParishCookie(request)
      const parishContext = await resolvePublicIntakeRoutingWriteParishId(
        staff.supabase,
        requestedParishId
      )
      if (!parishContext.ok) {
        return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
      }

      const parishId = parishContext.parishId
      const { data: current, error: currentError } = await admin
        .from('parish_public_intake_tokens')
        .select('id, label, request_type, expires_at, active, last_used_at')
        .eq('parish_id', parishId)
        .eq('id', normalizedToken.tokenId)
        .maybeSingle()

      if (currentError) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_token_lookup_failed',
          currentError,
          'Could not update public intake token.'
        )
      }
      if (!current) {
        return NextResponse.json(
          { ok: false, error: 'Public intake token not found.' },
          { status: 404 }
        )
      }

      const { data: updated, error: updateError } = await admin
        .from('parish_public_intake_tokens')
        .update({
          active: normalizedToken.active,
          updated_at: new Date().toISOString(),
        })
        .eq('parish_id', parishId)
        .eq('id', normalizedToken.tokenId)
        .select('id, label, request_type, expires_at, active, last_used_at')
        .single()

      if (updateError) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_token_update_failed',
          updateError,
          'Could not update public intake token.'
        )
      }

      await writeAuditEvent({
        parishId,
        actorEmail: staff.staff.email,
        action: 'public_intake_token.updated',
        targetType: 'parish_public_intake_token',
        targetId: normalizedToken.tokenId,
        metadata: {
          previous: {
            label: current.label,
            request_type: current.request_type ?? null,
            expires_at: current.expires_at ?? null,
            active: current.active === true,
            last_used_at: current.last_used_at ?? null,
          },
          next: {
            label: updated.label,
            request_type: updated.request_type ?? null,
            expires_at: updated.expires_at ?? null,
            active: updated.active === true,
            last_used_at: updated.last_used_at ?? null,
          },
        },
      })

      const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
      return NextResponse.json({
        ok: true,
        routing: {
          ...routing,
          activeParishId: parishId,
          source: parishContext.source,
          requestedParishId: parishContext.requestedParishId,
        },
      })
    } catch (error: unknown) {
      return publicIntakeRoutingErrorResponse(
        'public_intake_routing_token_update_failed',
        error,
        'Could not update public intake token.'
      )
    }
  }

  if ('domain_id' in body) {
    if ('domain_action' in body) {
      const normalizedVerification = normalizeDomainVerificationPatch(body)
      if (!normalizedVerification.ok) {
        return NextResponse.json(
          { ok: false, error: normalizedVerification.error },
          { status: 400 }
        )
      }

      try {
        const admin = createSupabaseServiceRoleClient()
        const requestedParishId = activeParishCookie(request)
        const parishContext = await resolvePublicIntakeRoutingWriteParishId(
          staff.supabase,
          requestedParishId
        )
        if (!parishContext.ok) {
          return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
        }

        const parishId = parishContext.parishId
        const { data: current, error: currentError } = await admin
          .from('parish_public_intake_domains')
          .select(
            'id, hostname, active, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error'
          )
          .eq('parish_id', parishId)
          .eq('id', normalizedVerification.domainId)
          .maybeSingle()

        if (currentError) {
          return publicIntakeRoutingErrorResponse(
            'public_intake_routing_domain_lookup_failed',
            currentError,
            'Could not verify public intake domain.'
          )
        }
        if (!current) {
          return NextResponse.json(
            { ok: false, error: 'Public intake domain not found.' },
            { status: 404 }
          )
        }

        const checkedAt = new Date().toISOString()

        if (normalizedVerification.action === 'reset_verification') {
          const challenge = domainVerificationChallenge(String(current.hostname))
          const { data: updated, error: updateError } = await admin
            .from('parish_public_intake_domains')
            .update({
              ...challenge,
              verified_at: null,
              verification_checked_at: null,
              verification_error: null,
              updated_at: checkedAt,
            })
            .eq('parish_id', parishId)
            .eq('id', normalizedVerification.domainId)
            .select(
              'id, hostname, active, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error'
            )
            .single()

          if (updateError) {
            return publicIntakeRoutingErrorResponse(
              'public_intake_routing_domain_verification_reset_failed',
              updateError,
              'Could not reset public intake domain verification.'
            )
          }

          await writeAuditEvent({
            parishId,
            actorEmail: staff.staff.email,
            action: 'public_intake_domain.verification_reset',
            targetType: 'parish_public_intake_domain',
            targetId: normalizedVerification.domainId,
            metadata: {
              hostname: updated.hostname,
              verification_dns_name: updated.verification_dns_name ?? null,
              verified_at: updated.verified_at ?? null,
            },
          })

          const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
          return NextResponse.json({
            ok: true,
            routing: {
              ...routing,
              activeParishId: parishId,
              source: parishContext.source,
              requestedParishId: parishContext.requestedParishId,
            },
          })
        }

        const dnsName = String(current.verification_dns_name ?? '')
        const dnsValue = String(current.verification_dns_value ?? '')
        if (!dnsName || !dnsValue) {
          return NextResponse.json(
            {
              ok: false,
              error:
                'This domain does not have a verification challenge yet. Reset the verification token and try again.',
            },
            { status: 400 }
          )
        }

        const verification = await verifyDomainDnsTxt(dnsName, dnsValue)
        const { data: updated, error: updateError } = await admin
          .from('parish_public_intake_domains')
          .update({
            verified_at: verification.verified ? checkedAt : null,
            verification_checked_at: checkedAt,
            verification_error: verification.error,
            updated_at: checkedAt,
          })
          .eq('parish_id', parishId)
          .eq('id', normalizedVerification.domainId)
          .select(
            'id, hostname, active, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error'
          )
          .single()

        if (updateError) {
          return publicIntakeRoutingErrorResponse(
            'public_intake_routing_domain_verification_update_failed',
            updateError,
            'Could not verify public intake domain.'
          )
        }

        await writeAuditEvent({
          parishId,
          actorEmail: staff.staff.email,
          action: verification.verified
            ? 'public_intake_domain.verified'
            : 'public_intake_domain.verification_failed',
          targetType: 'parish_public_intake_domain',
          targetId: normalizedVerification.domainId,
          metadata: {
            hostname: updated.hostname,
            verification_dns_name: updated.verification_dns_name ?? null,
            verified_at: updated.verified_at ?? null,
            verification_checked_at: updated.verification_checked_at ?? null,
            verification_error: updated.verification_error ?? null,
          },
        })

        const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
        return NextResponse.json({
          ok: true,
          routing: {
            ...routing,
            activeParishId: parishId,
            source: parishContext.source,
            requestedParishId: parishContext.requestedParishId,
          },
          verification: {
            verified: verification.verified,
            error: verification.error,
          },
        })
      } catch (error: unknown) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_domain_verification_failed',
          error,
          'Could not verify public intake domain.'
        )
      }
    }

    const normalizedDomain = normalizeDomainPatch(body)
    if (!normalizedDomain.ok) {
      return NextResponse.json({ ok: false, error: normalizedDomain.error }, { status: 400 })
    }

    try {
      const admin = createSupabaseServiceRoleClient()
      const requestedParishId = activeParishCookie(request)
      const parishContext = await resolvePublicIntakeRoutingWriteParishId(
        staff.supabase,
        requestedParishId
      )
      if (!parishContext.ok) {
        return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
      }

      const parishId = parishContext.parishId
      const { data: current, error: currentError } = await admin
        .from('parish_public_intake_domains')
        .select('id, hostname, active, verified_at, verification_dns_name')
        .eq('parish_id', parishId)
        .eq('id', normalizedDomain.domainId)
        .maybeSingle()

      if (currentError) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_domain_lookup_failed',
          currentError,
          'Could not update public intake domain.'
        )
      }
      if (!current) {
        return NextResponse.json({ ok: false, error: 'Public intake domain not found.' }, { status: 404 })
      }

      const { data: updated, error: updateError } = await admin
        .from('parish_public_intake_domains')
        .update({
          active: normalizedDomain.active,
          updated_at: new Date().toISOString(),
        })
        .eq('parish_id', parishId)
        .eq('id', normalizedDomain.domainId)
        .select('id, hostname, active, verified_at, verification_dns_name')
        .single()

      if (updateError) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_domain_update_failed',
          updateError,
          'Could not update public intake domain.'
        )
      }

      await writeAuditEvent({
        parishId,
        actorEmail: staff.staff.email,
        action: 'public_intake_domain.updated',
        targetType: 'parish_public_intake_domain',
        targetId: normalizedDomain.domainId,
        metadata: {
          previous: {
            hostname: current.hostname,
            active: current.active === true,
            verified_at: current.verified_at ?? null,
            verification_dns_name: current.verification_dns_name ?? null,
          },
          next: {
            hostname: updated.hostname,
            active: updated.active === true,
            verified_at: updated.verified_at ?? null,
            verification_dns_name: updated.verification_dns_name ?? null,
          },
        },
      })

      const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
      return NextResponse.json({
        ok: true,
        routing: {
          ...routing,
          activeParishId: parishId,
          source: parishContext.source,
          requestedParishId: parishContext.requestedParishId,
        },
      })
    } catch (error: unknown) {
      return publicIntakeRoutingErrorResponse(
        'public_intake_routing_domain_update_failed',
        error,
        'Could not update public intake domain.'
      )
    }
  }

  const normalized = normalizePublicIntakeRoutingPatch(body)
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolvePublicIntakeRoutingWriteParishId(
      staff.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }

    const parishId = parishContext.parishId
    const { data: current, error: currentError } = await admin
      .from('parishes')
      .select('id, public_slug, public_display_name, public_intake_enabled')
      .eq('id', parishId)
      .maybeSingle()

    if (currentError) {
      return publicIntakeRoutingErrorResponse(
        'public_intake_routing_parish_lookup_failed',
        currentError,
        'Could not update public intake routing metadata.'
      )
    }
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Parish not found.' }, { status: 404 })
    }

    const { data: updatedParish, error: updateError } = await admin
      .from('parishes')
      .update(normalized.patch)
      .eq('id', parishId)
      .select('id')
      .maybeSingle()

    if (updateError) {
      const isPublicSlugConflict =
        isSupabaseUniqueConstraintError(updateError, 'parishes_public_slug_lower_unique')
      if (!isPublicSlugConflict) {
        return publicIntakeRoutingErrorResponse(
          'public_intake_routing_update_failed',
          updateError,
          'Could not update public intake routing metadata.'
        )
      }
      return NextResponse.json(
        {
          ok: false,
          error: 'That public slug is already used by another parish.',
        },
        { status: 409 }
      )
    }
    if (!updatedParish?.id) {
      return NextResponse.json({ ok: false, error: 'Parish not found.' }, { status: 404 })
    }

    await writeAuditEvent({
      parishId,
      actorEmail: staff.staff.email,
      action: 'public_intake_routing.updated',
      targetType: 'parish',
      targetId: parishId,
      metadata: {
        previous: {
          public_slug: current.public_slug ?? null,
          public_display_name: current.public_display_name ?? null,
          public_intake_enabled: current.public_intake_enabled === true,
        },
        next: {
          public_slug: normalized.patch.public_slug,
          public_display_name: normalized.patch.public_display_name,
          public_intake_enabled: normalized.patch.public_intake_enabled,
        },
      },
    })

    const routing = await loadPublicIntakeRoutingMetadata(admin, parishId)
    return NextResponse.json({
      ok: true,
      routing: {
        ...routing,
        activeParishId: parishId,
        source: parishContext.source,
        requestedParishId: parishContext.requestedParishId,
      },
    })
  } catch (error: unknown) {
    return publicIntakeRoutingErrorResponse(
      'public_intake_routing_update_failed',
      error,
      'Could not update public intake routing metadata.'
    )
  }
}

export const publicIntakeRoutingRouteTestInternals = {
  activeParishCookie,
  loadPublicIntakeRoutingMetadata,
  normalizeDomainCreate,
  normalizeDomainPatch,
  normalizeDomainVerificationPatch,
  normalizeHostname,
  normalizePublicIntakeRoutingPatch,
  normalizeTokenCreate,
  normalizeTokenPatch,
  domainVerificationChallenge,
  hashPublicIntakeToken,
  isSupabaseUniqueConstraintError,
  txtRecordsContainValue,
  verifyDomainDnsTxt,
  resolvePublicIntakeRoutingReadParishId,
  resolvePublicIntakeRoutingWriteParishId,
}
