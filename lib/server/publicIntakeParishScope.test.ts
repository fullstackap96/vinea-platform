import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  publicIntakeParishScopeTestInternals,
  resolvePublicIntakeParishScope,
  type PublicIntakeDomainRoute,
  type PublicIntakeParish,
  type PublicIntakeParishScopeDataSource,
  type PublicIntakeTokenRoute,
} from '@/lib/server/publicIntakeParishScope'

function parish(overrides: Partial<PublicIntakeParish> = {}): PublicIntakeParish {
  return {
    id: 'parish-1',
    name: 'St. Ann',
    publicDisplayName: 'St. Ann Parish',
    publicIntakeEnabled: true,
    ...overrides,
  }
}

function dataSource(overrides: Partial<PublicIntakeParishScopeDataSource> = {}) {
  const source: PublicIntakeParishScopeDataSource = {
    findTokenByHash: vi.fn(async () => null),
    findDomainByHostname: vi.fn(async () => null),
    findParishBySlug: vi.fn(async () => null),
    findParishById: vi.fn(async () => null),
    findLegacyPrimaryParish: vi.fn(async () => null),
    ...overrides,
  }
  return source
}

describe('resolvePublicIntakeParishScope', () => {
  it('resolves a valid active token before domain or slug routing', async () => {
    const tokenRoute: PublicIntakeTokenRoute = {
      parishId: 'parish-token',
      requestType: 'baptism',
      active: true,
      expiresAt: '2030-01-01T00:00:00.000Z',
    }
    const source = dataSource({
      findTokenByHash: vi.fn(async () => tokenRoute),
      findParishById: vi.fn(async () => parish({ id: 'parish-token' })),
      findDomainByHostname: vi.fn(async () => {
        throw new Error('Domain routing should not run after token match.')
      }),
      findParishBySlug: vi.fn(async () => {
        throw new Error('Slug routing should not run after token match.')
      }),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      publicToken: 'raw-token',
      hostname: 'intake.example.org',
      parishSlug: 'st-ann',
      requestType: 'baptism',
      now: new Date('2026-06-24T00:00:00.000Z'),
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-token',
      routeSource: 'token',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'baptism',
    })
    expect(source.findTokenByHash).toHaveBeenCalledWith(
      publicIntakeParishScopeTestInternals.hashPublicToken('raw-token')
    )
  })

  it('fails closed for expired tokens', async () => {
    const source = dataSource({
      findTokenByHash: vi.fn(async () => ({
        parishId: 'parish-token',
        requestType: 'funeral' as const,
        active: true,
        expiresAt: '2026-01-01T00:00:00.000Z',
      })),
      findParishById: vi.fn(async () => parish({ id: 'parish-token' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      publicToken: 'expired-token',
      requestType: 'funeral',
      now: new Date('2026-06-24T00:00:00.000Z'),
    })

    expect(result).toEqual({
      ok: false,
      status: 410,
      error: 'Public intake form is not available.',
    })
    expect(source.findParishById).not.toHaveBeenCalled()
  })

  it('fails closed for token request type mismatch', async () => {
    const source = dataSource({
      findTokenByHash: vi.fn(async () => ({
        parishId: 'parish-token',
        requestType: 'wedding' as const,
        active: true,
        expiresAt: null,
      })),
      findParishById: vi.fn(async () => parish({ id: 'parish-token' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      publicToken: 'wedding-token',
      requestType: 'baptism',
    })

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Public intake form is not available.',
    })
    expect(source.findParishById).not.toHaveBeenCalled()
  })

  it('resolves a verified active domain when no token is present', async () => {
    const domainRoute: PublicIntakeDomainRoute = {
      parishId: 'parish-domain',
      active: true,
      verifiedAt: '2026-06-01T00:00:00.000Z',
    }
    const source = dataSource({
      findDomainByHostname: vi.fn(async () => domainRoute),
      findParishById: vi.fn(async () => parish({ id: 'parish-domain' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      hostname: 'Intake.StAnn.Example:443',
      requestType: 'ocia',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-domain',
      routeSource: 'domain',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'ocia',
    })
    expect(source.findDomainByHostname).toHaveBeenCalledWith('intake.stann.example')
  })

  it('fails closed for unverified domains', async () => {
    const source = dataSource({
      findDomainByHostname: vi.fn(async () => ({
        parishId: 'parish-domain',
        active: true,
        verifiedAt: null,
      })),
      findParishById: vi.fn(async () => parish({ id: 'parish-domain' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      hostname: 'intake.stann.example',
    })

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Public intake form is not available.',
    })
    expect(source.findParishById).not.toHaveBeenCalled()
  })

  it('resolves an enabled parish slug when token and domain are absent', async () => {
    const source = dataSource({
      findParishBySlug: vi.fn(async () => parish({ id: 'parish-slug' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      parishSlug: 'St-Ann',
      requestType: 'join_parish',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-slug',
      routeSource: 'slug',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'join_parish',
    })
    expect(source.findParishBySlug).toHaveBeenCalledWith('st-ann')
  })

  it('falls through to slug routing when the request host has no configured domain route', async () => {
    const source = dataSource({
      findDomainByHostname: vi.fn(async () => null),
      findParishBySlug: vi.fn(async () => parish({ id: 'parish-slug' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      hostname: 'app.vinea.test',
      parishSlug: 'St-Ann',
      requestType: 'join_parish',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-slug',
      routeSource: 'slug',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'join_parish',
    })
    expect(source.findDomainByHostname).toHaveBeenCalledWith('app.vinea.test')
    expect(source.findParishBySlug).toHaveBeenCalledWith('st-ann')
  })

  it('fails closed for disabled parish slugs', async () => {
    const source = dataSource({
      findParishBySlug: vi.fn(async () =>
        parish({ id: 'parish-disabled', publicIntakeEnabled: false })
      ),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      parishSlug: 'st-ann',
      requestType: 'baptism',
    })

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Public intake form is not available.',
    })
  })

  it('preserves legacy fallback for current public form paths', async () => {
    const source = dataSource({
      findLegacyPrimaryParish: vi.fn(async () =>
        parish({ id: 'legacy-parish', publicIntakeEnabled: false })
      ),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      legacyPath: '/baptism-request',
      requestType: 'baptism',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'legacy-parish',
      routeSource: 'legacy_fallback',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'baptism',
    })
  })

  it('fails closed for new intake routes without a valid route signal', async () => {
    const source = dataSource()

    const result = await resolvePublicIntakeParishScope(source, {
      legacyPath: '/intake/missing/baptism',
      requestType: 'baptism',
    })

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Public intake form is not available.',
    })
    expect(source.findLegacyPrimaryParish).not.toHaveBeenCalled()
  })

  it('ignores forged staff active parish cookies', async () => {
    const source = dataSource({
      findParishBySlug: vi.fn(async () => parish({ id: 'public-parish' })),
    })

    const result = await resolvePublicIntakeParishScope(source, {
      parishSlug: 'st-ann',
      activeParishCookie: 'forged-staff-parish',
      requestType: 'funeral',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'public-parish',
      routeSource: 'slug',
      publicDisplayName: 'St. Ann Parish',
      requestType: 'funeral',
    })
    expect(source.findParishBySlug).toHaveBeenCalledWith('st-ann')
    expect(source.findParishById).not.toHaveBeenCalledWith('forged-staff-parish')
  })

  it('wires the resolver into the approved intake route but not public pages', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const root = process.cwd()

    const intakeRoute = readFileSync(join(root, 'app/api/intake/route.ts'), 'utf8')
    expect(intakeRoute).toContain('resolvePublicIntakeParishScope')
    expect(intakeRoute).toContain('createSupabasePublicIntakeParishScopeDataSource')

    for (const relativePath of [
      'app/baptism-request/page.tsx',
      'app/funeral-request/page.tsx',
      'app/wedding-request/page.tsx',
      'app/ocia-request/page.tsx',
      'app/join-parish-request/page.tsx',
    ]) {
      const source = readFileSync(join(root, relativePath), 'utf8')
      expect(source).not.toContain('resolvePublicIntakeParishScope')
      expect(source).not.toContain('publicIntakeParishScope')
    }
  })
})
