import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { resolvePublicIntakeRequestParishScopeForFutureRuntime } from '@/lib/server/publicIntakeRequestParishScopeAdapter'
import type { PublicIntakeRoutingRuntimeGateResult } from '@/lib/server/publicIntakeRoutingRuntimeGate'

const disabledGate: PublicIntakeRoutingRuntimeGateResult = {
  enabled: false,
  reason: 'disabled for test',
  routeSignals: [],
  legacyFallback: true,
}

const enabledGate: PublicIntakeRoutingRuntimeGateResult = {
  enabled: true,
  routeSignals: ['verified_domain', 'token', 'slug'],
  legacyFallback: true,
}

describe('resolvePublicIntakeRequestParishScopeForFutureRuntime', () => {
  it('preserves current legacy primary parish behavior when runtime routing is disabled', async () => {
    const loadLegacyPrimaryParishId = vi.fn(async () => 'legacy-parish')
    const resolveRoutedParishScope = vi.fn(async () => {
      throw new Error('Runtime routing resolver should not run while the gate is disabled.')
    })

    const result = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate: disabledGate,
      routingInput: {
        hostname: 'forms.example-parish.org',
        publicToken: 'future-token',
        parishSlug: 'st-ann',
        requestType: 'baptism',
        legacyPath: '/baptism-request',
      },
      loadLegacyPrimaryParishId,
      resolveRoutedParishScope,
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'legacy-parish',
      routeSource: 'legacy_fallback',
      runtimeRoutingEnabled: false,
      publicDisplayName: null,
      resolvedRequestType: null,
      auditMetadata: {
        publicIntakeRouteSource: 'legacy_fallback',
        publicIntakeRoutingRuntimeEnabled: false,
        publicIntakePublicDisplayName: null,
        publicIntakeResolvedRequestType: null,
      },
    })
    expect(loadLegacyPrimaryParishId).toHaveBeenCalledTimes(1)
    expect(resolveRoutedParishScope).not.toHaveBeenCalled()
  })

  it('fails closed when runtime routing is disabled and no legacy parish exists', async () => {
    const result = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate: disabledGate,
      routingInput: { legacyPath: '/baptism-request', requestType: 'baptism' },
      loadLegacyPrimaryParishId: vi.fn(async () => null),
      resolveRoutedParishScope: vi.fn(),
    })

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: 'Public intake form is not available.',
    })
  })

  it('uses routed parish scope and carries route-source metadata when explicitly enabled', async () => {
    const loadLegacyPrimaryParishId = vi.fn(async () => 'legacy-parish')
    const resolveRoutedParishScope = vi.fn(async () => ({
      ok: true as const,
      parishId: 'domain-parish',
      routeSource: 'domain' as const,
      publicDisplayName: 'St. Domain Parish',
      requestType: 'wedding' as const,
    }))
    const routingInput = {
      hostname: 'forms.st-domain.test',
      requestType: 'wedding',
      legacyPath: '/wedding-request',
    }

    const result = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate: enabledGate,
      routingInput,
      loadLegacyPrimaryParishId,
      resolveRoutedParishScope,
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'domain-parish',
      routeSource: 'domain',
      runtimeRoutingEnabled: true,
      publicDisplayName: 'St. Domain Parish',
      resolvedRequestType: 'wedding',
      auditMetadata: {
        publicIntakeRouteSource: 'domain',
        publicIntakeRoutingRuntimeEnabled: true,
        publicIntakePublicDisplayName: 'St. Domain Parish',
        publicIntakeResolvedRequestType: 'wedding',
      },
    })
    expect(resolveRoutedParishScope).toHaveBeenCalledWith(routingInput)
    expect(loadLegacyPrimaryParishId).not.toHaveBeenCalled()
  })

  it('propagates generic public routing failures when explicitly enabled', async () => {
    const result = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate: enabledGate,
      routingInput: { publicToken: 'expired-token', requestType: 'ocia' },
      loadLegacyPrimaryParishId: vi.fn(async () => 'legacy-parish'),
      resolveRoutedParishScope: vi.fn(async () => ({
        ok: false as const,
        status: 410 as const,
        error: 'Public intake form is not available.',
      })),
    })

    expect(result).toEqual({
      ok: false,
      status: 410,
      error: 'Public intake form is not available.',
    })
  })

  it('wires the live intake route through the adapter and public routing resolver after approval', () => {
    const intakeRoute = readFileSync(join(process.cwd(), 'app', 'api', 'intake', 'route.ts'), 'utf8')

    expect(intakeRoute).toContain('resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expect(intakeRoute).toContain('getPublicIntakeRoutingRuntimeGate')
    expect(intakeRoute).toContain('resolvePublicIntakeParishScope')
    expect(intakeRoute).toContain('createSupabasePublicIntakeParishScopeDataSource')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
  })

  it('documents the non-runtime adapter plan and route-source audit contract', () => {
    const plan = readFileSync(
      join(process.cwd(), 'docs', 'PUBLIC_INTAKE_REQUEST_PARISH_SCOPE_ADAPTER_PLAN.md'),
      'utf8'
    )

    for (const required of [
      'Runtime wiring approved for safe QA',
      'wired into `/api/intake`',
      'publicIntakeRouteSource',
      'publicIntakeRoutingRuntimeEnabled',
      'publicIntakePublicDisplayName',
      'publicIntakeResolvedRequestType',
      'legacy_fallback',
      'public_intake.created',
      'Do not trust staff active parish cookies',
      'Do not change operational RLS',
      'Feature flag off ignores domain, token, and slug signals',
      'Audit events include route-source metadata',
    ]) {
      expect(plan).toContain(required)
    }
  })
})
