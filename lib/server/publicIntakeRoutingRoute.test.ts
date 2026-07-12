import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('node:dns/promises', () => ({
  resolveTxt: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { resolveTxt } from 'node:dns/promises'
import { publicIntakeRoutingRouteTestInternals } from '@/app/api/parish/public-intake-routing/route'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const resolveTxtMock = vi.mocked(resolveTxt)
const routePath = join(process.cwd(), 'app', 'api', 'parish', 'public-intake-routing', 'route.ts')
const settingsPagePath = join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx')

describe('public intake routing settings route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses active read context primary parish when no active parish cookie exists', async () => {
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: null,
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await publicIntakeRoutingRouteTestInternals.resolvePublicIntakeRoutingReadParishId(
        supabase as never,
        null
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      activeParishId: 'parish-1',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
  })

  it('honors an active parish cookie only when membership validates the exact parish', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })

    const result =
      await publicIntakeRoutingRouteTestInternals.resolvePublicIntakeRoutingReadParishId(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-2',
      requestedParishId: 'parish-2',
    })
  })

  it('fails closed when an active parish cookie is unauthorized', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result =
      await publicIntakeRoutingRouteTestInternals.resolvePublicIntakeRoutingReadParishId(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read public intake routing for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('requires membership-backed authorization when an active parish cookie exists', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await publicIntakeRoutingRouteTestInternals.resolvePublicIntakeRoutingReadParishId(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-1'
      )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to read public intake routing for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('normalizes low-risk parish routing metadata patches', () => {
    const result =
      publicIntakeRoutingRouteTestInternals.normalizePublicIntakeRoutingPatch({
        public_display_name: '  Saint Mary Parish  ',
        public_slug: '  St-Mary-Parish  ',
        public_intake_enabled: true,
      })

    expect(result).toMatchObject({
      ok: true,
      patch: {
        public_display_name: 'Saint Mary Parish',
        public_slug: 'st-mary-parish',
        public_intake_enabled: true,
      },
    })
  })

  it('rejects public slugs that do not match the database constraint', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizePublicIntakeRoutingPatch({
        public_slug: '-bad-slug',
        public_intake_enabled: false,
      })
    ).toEqual({
      ok: false,
      error:
        'Public slug must be 3-80 lowercase letters, numbers, or hyphens, and cannot start or end with a hyphen.',
    })
  })

  it('normalizes public intake domain creates safely', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainCreate({
        hostname: ' HTTPS://Forms.Example-Parish.ORG/path ',
      })
    ).toEqual({
      ok: true,
      hostname: 'forms.example-parish.org',
      active: true,
    })
  })

  it('rejects invalid public intake domains', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainCreate({
        hostname: 'not a domain',
      })
    ).toEqual({
      ok: false,
      error: 'Enter a valid domain, such as forms.yourparish.org.',
    })
  })

  it('normalizes public intake domain active-state patches', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainPatch({
        domain_id: 'domain-1',
        active: true,
      })
    ).toEqual({
      ok: true,
      domainId: 'domain-1',
      active: true,
    })
  })

  it('normalizes public intake domain verification actions', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainVerificationPatch({
        domain_id: 'domain-1',
        domain_action: 'verify',
      })
    ).toEqual({
      ok: true,
      domainId: 'domain-1',
      action: 'verify',
    })

    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainVerificationPatch({
        domain_id: 'domain-1',
        domain_action: 'reset_verification',
      })
    ).toEqual({
      ok: true,
      domainId: 'domain-1',
      action: 'reset_verification',
    })

    expect(
      publicIntakeRoutingRouteTestInternals.normalizeDomainVerificationPatch({
        domain_id: 'domain-1',
        domain_action: 'delete',
      })
    ).toEqual({
      ok: false,
      error: 'Choose a valid public intake domain verification action.',
    })
  })

  it('generates DNS TXT verification metadata for public intake domains', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.domainVerificationChallenge(
        'forms.example-parish.org',
        'vinea-domain-test-token'
      )
    ).toEqual({
      verification_token: 'vinea-domain-test-token',
      verification_dns_name: '_vinea-intake.forms.example-parish.org',
      verification_dns_value: 'vinea-domain-verification=vinea-domain-test-token',
    })
  })

  it('matches split DNS TXT records against the expected verification value', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.txtRecordsContainValue(
        [['vinea-domain-verification=', 'vinea-domain-test-token']],
        'vinea-domain-verification=vinea-domain-test-token'
      )
    ).toBe(true)
    expect(
      publicIntakeRoutingRouteTestInternals.txtRecordsContainValue(
        [['other=value']],
        'vinea-domain-verification=vinea-domain-test-token'
      )
    ).toBe(false)
  })

  it('checks DNS TXT records for public intake domain verification', async () => {
    resolveTxtMock.mockResolvedValueOnce([
      ['vinea-domain-verification=', 'vinea-domain-test-token'],
    ])

    await expect(
      publicIntakeRoutingRouteTestInternals.verifyDomainDnsTxt(
        '_vinea-intake.forms.example-parish.org',
        'vinea-domain-verification=vinea-domain-test-token'
      )
    ).resolves.toEqual({ verified: true, error: null })

    resolveTxtMock.mockResolvedValueOnce([['other=value']])
    await expect(
      publicIntakeRoutingRouteTestInternals.verifyDomainDnsTxt(
        '_vinea-intake.forms.example-parish.org',
        'vinea-domain-verification=vinea-domain-test-token'
      )
    ).resolves.toEqual({
      verified: false,
      error:
        'DNS TXT record was found, but it did not contain the expected Vinea verification value.',
    })
  })

  it('normalizes public intake token creates safely', () => {
    const result =
      publicIntakeRoutingRouteTestInternals.normalizeTokenCreate({
        token_label: '  Bulletin baptism link  ',
        request_type: 'baptism',
        expires_at: '2026-12-31',
      })

    expect(result).toMatchObject({
      ok: true,
      label: 'Bulletin baptism link',
      requestType: 'baptism',
      active: true,
    })
    expect(result.ok ? result.expiresAt : null).toBe('2026-12-31T23:59:59.999Z')
  })

  it('rejects invalid public intake token form types', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeTokenCreate({
        token_label: 'Bad form type',
        request_type: 'confirmation',
      })
    ).toEqual({
      ok: false,
      error: 'Choose a valid public form type for this token.',
    })
  })

  it('hashes public intake tokens without returning the raw token value', () => {
    expect(publicIntakeRoutingRouteTestInternals.hashPublicIntakeToken('secret-token')).toBe(
      '930bbdc51b6aed5c2a5678fd6e28dee7a05e8a4b643cfc0b4427c3efb86c0d94'
    )
  })

  it('normalizes public intake token active-state patches', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.normalizeTokenPatch({
        token_id: 'token-1',
        active: false,
      })
    ).toEqual({
      ok: true,
      tokenId: 'token-1',
      active: false,
    })
  })

  it('detects Supabase unique constraint errors without requiring route code to echo raw messages', () => {
    expect(
      publicIntakeRoutingRouteTestInternals.isSupabaseUniqueConstraintError(
        {
          code: '23505',
          message:
            'duplicate key value violates unique constraint "parish_public_intake_domains_hostname_lower_unique"',
        },
        'parish_public_intake_domains_hostname_lower_unique'
      )
    ).toBe(true)

    expect(
      publicIntakeRoutingRouteTestInternals.isSupabaseUniqueConstraintError(
        {
          message:
            'duplicate key value violates unique constraint "parish_public_intake_tokens_token_hash_unique"',
        },
        'parish_public_intake_tokens_token_hash_unique'
      )
    ).toBe(true)

    expect(
      publicIntakeRoutingRouteTestInternals.isSupabaseUniqueConstraintError(
        {
          code: '42501',
          message: 'permission denied for table parish_public_intake_tokens',
        },
        'parish_public_intake_tokens_token_hash_unique'
      )
    ).toBe(false)
  })

  it('keeps the route limited to GET/POST/PATCH and avoids loading public token secrets', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('export async function GET')
    expect(source).toContain('export async function POST')
    expect(source).toContain('export async function PATCH')
    expect(source).not.toContain('export async function DELETE')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('writeAuditEvent')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).toContain("action: 'public_intake_routing.updated'")
    expect(source).toContain("action: 'public_intake_domain.created'")
    expect(source).toContain("action: 'public_intake_domain.updated'")
    expect(source).toContain("action: 'public_intake_domain.verification_reset'")
    expect(source).toContain("public_intake_domain.verified'")
    expect(source).toContain("public_intake_domain.verification_failed'")
    expect(source).toContain("action: 'public_intake_token.created'")
    expect(source).toContain("action: 'public_intake_token.updated'")
    expect(source).toContain(".from('parish_public_intake_domains')")
    expect(source).toContain(".from('parish_public_intake_tokens')")
    expect(source).toContain('resolveTxt')
    expect(source).toContain('verification_dns_name')
    expect(source).toContain('verification_dns_value')
    expect(source).toContain('token_hash: hashPublicIntakeToken(rawToken)')
    expect(source).toContain('createdToken')
    expect(source).toContain(
      ".select('id, label, request_type, expires_at, active, last_used_at, created_at, updated_at')"
    )
    expect(source).not.toContain('token_hash,')

    const metadataUpdateIndex = source.lastIndexOf('.update(normalized.patch)')
    const metadataConfirmationIndex = source.lastIndexOf('!updatedParish?.id')
    const metadataAuditIndex = source.lastIndexOf("action: 'public_intake_routing.updated'")
    expect(metadataUpdateIndex).toBeGreaterThan(-1)
    expect(source.indexOf(".select('id')", metadataUpdateIndex)).toBeGreaterThan(
      metadataUpdateIndex,
    )
    expect(metadataConfirmationIndex).toBeGreaterThan(metadataUpdateIndex)
    expect(metadataAuditIndex).toBeGreaterThan(metadataConfirmationIndex)
  })

  it('returns safe generic messages for unexpected public intake routing route failures', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function publicIntakeRoutingErrorResponse(')

    for (const expected of [
      'public_intake_routing_load_failed',
      'public_intake_routing_token_create_failed',
      'public_intake_routing_domain_create_failed',
      'public_intake_routing_token_lookup_failed',
      'public_intake_routing_token_update_failed',
      'public_intake_routing_domain_lookup_failed',
      'public_intake_routing_domain_verification_reset_failed',
      'public_intake_routing_domain_verification_update_failed',
      'public_intake_routing_domain_verification_failed',
      'public_intake_routing_domain_update_failed',
      'public_intake_routing_parish_lookup_failed',
      'public_intake_routing_update_failed',
    ]) {
      expect(source).toContain(expected)
    }

    for (const rawPattern of [
      'error instanceof Error ? error.message',
      'currentError.message }, { status: 500 }',
      'updateError.message }, { status: 500 }',
      'error: message,',
      ': updateError.message',
      'insertError.message',
      'new Error(message)',
      ': message,',
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('adds a staff settings view for low-risk routing metadata management', () => {
    const source = readFileSync(settingsPagePath, 'utf8')

    expect(source).toContain("fetch('/api/parish/public-intake-routing'")
    expect(source).toContain('Public intake routing')
    expect(source).toContain('Prepared, not live')
    expect(source).toContain('Save routing metadata')
    expect(source).toContain('Public display name')
    expect(source).toContain('Public slug')
    expect(source).toContain('Add domain')
    expect(source).toContain('Deactivate')
    expect(source).toContain('Activate')
    expect(source).toContain('DNS TXT record')
    expect(source).toContain('Verify DNS')
    expect(source).toContain('Reset verification token')
    expect(source).toContain('Create token')
    expect(source).toContain('New token shown once')
    expect(source).toContain('stores only a hash')
    expect(source).toContain("method: 'POST'")
    expect(source).toContain("method: 'PATCH'")
  })
})
