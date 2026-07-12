import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { extractPublicIntakeRouteSignalsForDryRun } from '@/lib/server/publicIntakeRouteSignalDryRun'
import { resolvePublicIntakeRequestParishScopeForFutureRuntime } from '@/lib/server/publicIntakeRequestParishScopeAdapter'
import type { PublicIntakeRouteSource } from '@/lib/server/publicIntakeParishScope'
import {
  PUBLIC_INTAKE_ROUTING_RUNTIME_ACK,
  PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
  PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
  PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG,
  getPublicIntakeRoutingRuntimeGate,
} from '@/lib/server/publicIntakeRoutingRuntimeGate'

function env(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return values as NodeJS.ProcessEnv
}

describe('public intake runtime planning composition', () => {
  it('keeps flag-off creation scope on the legacy parish even when domain, token, and slug signals are present', async () => {
    const gate = getPublicIntakeRoutingRuntimeGate(env())
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate,
      requestUrl:
        'https://app.vinea.test/api/intake?publicToken=visible-once-token&parishSlug=st-mary&requestType=baptism&legacyPath=/baptism-request',
      headers: {
        host: 'app.vinea.test',
        'x-forwarded-host': 'forms.st-mary.test',
        cookie: 'vinea_active_parish_id=forged-staff-parish',
      },
      body: {
        token: 'body-token-ignored-because-url-token-wins',
        slug: 'body-slug-ignored-because-url-slug-wins',
      },
    })

    const loadLegacyPrimaryParishId = vi.fn(async () => 'legacy-primary-parish')
    const resolveRoutedParishScope = vi.fn(async () => {
      throw new Error('The routed parish resolver must not run while runtime routing is disabled.')
    })

    const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate,
      routingInput: dryRun.routingInput,
      loadLegacyPrimaryParishId,
      resolveRoutedParishScope,
    })

    expect(dryRun).toMatchObject({
      runtimeRoutingEnabled: false,
      resolverWouldRun: false,
      legacyFallbackAvailable: true,
      routingInput: {
        publicToken: 'visible-once-token',
        hostname: 'forms.st-mary.test',
        parishSlug: 'st-mary',
        requestType: 'baptism',
        legacyPath: '/baptism-request',
        activeParishCookie: 'ignored-in-public-intake',
      },
      auditSafeSignalSummary: {
        hostname: 'forms.st-mary.test',
        publicTokenPresent: true,
        parishSlug: 'st-mary',
        requestType: 'baptism',
        legacyPath: '/baptism-request',
        staffActiveParishCookieIgnored: true,
      },
    })
    expect(scope).toEqual({
      ok: true,
      parishId: 'legacy-primary-parish',
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
    expect(JSON.stringify(dryRun.auditSafeSignalSummary)).not.toContain('visible-once-token')
  })

  it('documents the flag-off end-to-end contract with approved safe QA route wiring', () => {
    const checklist = readFileSync(
      join(process.cwd(), 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_CHECKLIST.md'),
      'utf8'
    )
    const intakeRoute = readFileSync(join(process.cwd(), 'app', 'api', 'intake', 'route.ts'), 'utf8')

    for (const required of [
      'Flag-Off End-To-End Planning Contract',
      'dry-run route signals',
      'future parish-scope adapter',
      '`routeSource` must remain `legacy_fallback`',
      'Routed parish-scope resolver must not be called',
    ]) {
      expect(checklist).toContain(required)
    }

    expect(intakeRoute).not.toContain('publicIntakeRuntimePlanning')
    expect(intakeRoute).toContain('extractPublicIntakeRouteSignalsForDryRun')
    expect(intakeRoute).toContain('resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
  })

  it.each([
    {
      name: 'valid public token',
      requestUrl:
        'https://app.vinea.test/api/intake?publicToken=visible-once-token&requestType=baptism&legacyPath=/baptism-request',
      headers: { host: 'app.vinea.test' },
      expectedRouteSource: 'token' as const,
      expectedParishId: 'token-parish',
      expectedDisplayName: 'St. Token Parish',
      expectedRequestType: 'baptism' as const,
    },
    {
      name: 'verified public domain',
      requestUrl: 'https://app.vinea.test/api/intake?requestType=wedding&legacyPath=/wedding-request',
      headers: {
        host: 'app.vinea.test',
        'x-forwarded-host': 'forms.st-domain.test',
      },
      expectedRouteSource: 'domain' as const,
      expectedParishId: 'domain-parish',
      expectedDisplayName: 'St. Domain Parish',
      expectedRequestType: 'wedding' as const,
    },
    {
      name: 'enabled parish slug',
      requestUrl:
        'https://app.vinea.test/api/intake?parishSlug=st-slug&requestType=join_parish&legacyPath=/join-parish-request',
      headers: { host: 'app.vinea.test' },
      expectedRouteSource: 'slug' as const,
      expectedParishId: 'slug-parish',
      expectedDisplayName: 'St. Slug Parish',
      expectedRequestType: 'join_parish' as const,
    },
  ])(
    'preserves route-source audit metadata for switch-on planning with $name',
    async ({
      requestUrl,
      headers,
      expectedRouteSource,
      expectedParishId,
      expectedDisplayName,
      expectedRequestType,
    }) => {
      const gate = getPublicIntakeRoutingRuntimeGate(env({
        [PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG]: PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
        [PUBLIC_INTAKE_ROUTING_RUNTIME_ACK]: PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
      }))
      const dryRun = extractPublicIntakeRouteSignalsForDryRun({
        gate,
        requestUrl,
        headers,
      })
      const loadLegacyPrimaryParishId = vi.fn(async () => 'legacy-primary-parish')
      const resolveRoutedParishScope = vi.fn(async () => ({
        ok: true as const,
        parishId: expectedParishId,
        routeSource: expectedRouteSource as PublicIntakeRouteSource,
        publicDisplayName: expectedDisplayName,
        requestType: expectedRequestType,
      }))

      const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
        gate,
        routingInput: dryRun.routingInput,
        loadLegacyPrimaryParishId,
        resolveRoutedParishScope,
      })

      expect(dryRun.runtimeRoutingEnabled).toBe(true)
      expect(dryRun.resolverWouldRun).toBe(true)
      expect(scope).toEqual({
        ok: true,
        parishId: expectedParishId,
        routeSource: expectedRouteSource,
        runtimeRoutingEnabled: true,
        publicDisplayName: expectedDisplayName,
        resolvedRequestType: expectedRequestType,
        auditMetadata: {
          publicIntakeRouteSource: expectedRouteSource,
          publicIntakeRoutingRuntimeEnabled: true,
          publicIntakePublicDisplayName: expectedDisplayName,
          publicIntakeResolvedRequestType: expectedRequestType,
        },
      })
      expect(resolveRoutedParishScope).toHaveBeenCalledWith(dryRun.routingInput)
      expect(loadLegacyPrimaryParishId).not.toHaveBeenCalled()
      expect(JSON.stringify(scope)).not.toContain('visible-once-token')
      expect(JSON.stringify(dryRun.auditSafeSignalSummary)).not.toContain('visible-once-token')
    }
  )

  it.each([
    {
      name: 'expired token',
      requestUrl:
        'https://app.vinea.test/api/intake?publicToken=expired-token&requestType=ocia&legacyPath=/ocia-request',
      headers: { host: 'app.vinea.test' },
      status: 410 as const,
    },
    {
      name: 'unverified domain',
      requestUrl: 'https://app.vinea.test/api/intake?requestType=funeral&legacyPath=/funeral-request',
      headers: {
        host: 'app.vinea.test',
        'x-forwarded-host': 'unverified.st-domain.test',
      },
      status: 404 as const,
    },
    {
      name: 'disabled parish',
      requestUrl:
        'https://app.vinea.test/api/intake?parishSlug=disabled-parish&requestType=baptism&legacyPath=/baptism-request',
      headers: { host: 'app.vinea.test' },
      status: 404 as const,
    },
    {
      name: 'mismatched request type',
      requestUrl:
        'https://app.vinea.test/api/intake?publicToken=wedding-only-token&requestType=funeral&legacyPath=/funeral-request',
      headers: { host: 'app.vinea.test' },
      status: 404 as const,
    },
  ])(
    'preserves generic public errors for switch-on planning failure: $name',
    async ({ requestUrl, headers, status }) => {
      const gate = getPublicIntakeRoutingRuntimeGate(env({
        [PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG]: PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
        [PUBLIC_INTAKE_ROUTING_RUNTIME_ACK]: PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
      }))
      const dryRun = extractPublicIntakeRouteSignalsForDryRun({
        gate,
        requestUrl,
        headers,
      })
      const loadLegacyPrimaryParishId = vi.fn(async () => 'legacy-primary-parish')
      const resolveRoutedParishScope = vi.fn(async () => ({
        ok: false as const,
        status,
        error: 'Public intake form is not available.',
      }))

      const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
        gate,
        routingInput: dryRun.routingInput,
        loadLegacyPrimaryParishId,
        resolveRoutedParishScope,
      })

      expect(dryRun.runtimeRoutingEnabled).toBe(true)
      expect(dryRun.resolverWouldRun).toBe(true)
      expect(scope).toEqual({
        ok: false,
        status,
        error: 'Public intake form is not available.',
      })
      expect(resolveRoutedParishScope).toHaveBeenCalledWith(dryRun.routingInput)
      expect(loadLegacyPrimaryParishId).not.toHaveBeenCalled()
      expect(JSON.stringify(scope)).not.toContain('expired-token')
      expect(JSON.stringify(scope)).not.toContain('wedding-only-token')
    }
  )

  it('documents the switch-on planning contract with approved safe QA route wiring', () => {
    const checklist = readFileSync(
      join(process.cwd(), 'docs', 'PUBLIC_INTAKE_RUNTIME_WIRING_CHECKLIST.md'),
      'utf8'
    )
    const intakeRoute = readFileSync(join(process.cwd(), 'app', 'api', 'intake', 'route.ts'), 'utf8')

    for (const required of [
      'Switch-On Non-Runtime Planning Contract',
      'Mocked successful token, domain, and slug resolver responses',
      '`publicIntakeRouteSource` must match the mocked resolver route source',
      '`publicIntakeRoutingRuntimeEnabled` must be `true`',
      'The legacy primary parish loader must not be called',
      'Switch-On Failure Planning Contract',
      'expired token',
      'unverified domain',
      'disabled parish',
      'mismatched request type',
      'Public intake form is not available.',
    ]) {
      expect(checklist).toContain(required)
    }

    expect(intakeRoute).not.toContain('publicIntakeRuntimePlanning')
    expect(intakeRoute).toContain('extractPublicIntakeRouteSignalsForDryRun')
    expect(intakeRoute).toContain('resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expect(intakeRoute).toContain('...scope.auditMetadata')
  })
})
