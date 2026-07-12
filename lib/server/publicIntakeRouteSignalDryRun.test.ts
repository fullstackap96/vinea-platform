import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { extractPublicIntakeRouteSignalsForDryRun } from '@/lib/server/publicIntakeRouteSignalDryRun'
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

describe('extractPublicIntakeRouteSignalsForDryRun', () => {
  it('extracts host, URL search params, and legacy path without enabling the resolver', () => {
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate: disabledGate,
      requestUrl:
        'https://app.vinea.test/api/intake?publicToken=visible-once-token&parishSlug=st-mary&requestType=baptism&legacyPath=/baptism-request',
      headers: {
        host: 'app.vinea.test',
        'x-forwarded-host': 'forms.st-mary.test',
      },
    })

    expect(dryRun).toEqual({
      runtimeRoutingEnabled: false,
      resolverWouldRun: false,
      legacyFallbackAvailable: true,
      routingInput: {
        publicToken: 'visible-once-token',
        hostname: 'forms.st-mary.test',
        parishSlug: 'st-mary',
        requestType: 'baptism',
        legacyPath: '/baptism-request',
        activeParishCookie: null,
      },
      auditSafeSignalSummary: {
        hostname: 'forms.st-mary.test',
        publicTokenPresent: true,
        parishSlug: 'st-mary',
        requestType: 'baptism',
        legacyPath: '/baptism-request',
        staffActiveParishCookieIgnored: false,
      },
    })
  })

  it('uses body-like fallback values and referer path when URL search params are absent', () => {
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate: disabledGate,
      requestUrl: 'https://app.vinea.test/api/intake',
      headers: new Headers({
        host: 'app.vinea.test:443',
        referer: 'https://app.vinea.test/wedding-request',
      }),
      body: {
        token: 'body-token',
        slug: 'st-joseph',
        requestType: 'wedding',
      },
    })

    expect(dryRun.routingInput).toEqual({
      publicToken: 'body-token',
      hostname: 'app.vinea.test',
      parishSlug: 'st-joseph',
      requestType: 'wedding',
      legacyPath: '/wedding-request',
      activeParishCookie: null,
    })
    expect(dryRun.auditSafeSignalSummary.publicTokenPresent).toBe(true)
  })

  it('marks staff active parish cookies as ignored public routing input', () => {
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate: disabledGate,
      requestUrl: 'https://app.vinea.test/api/intake?requestType=ocia',
      headers: {
        host: 'forms.example.test',
        cookie: 'vinea_active_parish_id=forged-staff-parish',
      },
      legacyPath: '/ocia-request',
    })

    expect(dryRun.routingInput.activeParishCookie).toBe('ignored-in-public-intake')
    expect(dryRun.auditSafeSignalSummary).toMatchObject({
      hostname: 'forms.example.test',
      requestType: 'ocia',
      legacyPath: '/ocia-request',
      staffActiveParishCookieIgnored: true,
    })
  })

  it('shows the future resolver would be available only when the explicit runtime gate is enabled', () => {
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate: enabledGate,
      requestUrl: 'https://st-ann.example/api/intake?slug=st-ann&requestType=join_parish',
      legacyPath: '/join-parish-request',
    })

    expect(dryRun.runtimeRoutingEnabled).toBe(true)
    expect(dryRun.resolverWouldRun).toBe(true)
    expect(dryRun.routingInput).toMatchObject({
      hostname: 'st-ann.example',
      parishSlug: 'st-ann',
      requestType: 'join_parish',
      legacyPath: '/join-parish-request',
    })
  })

  it('keeps raw public tokens out of the audit-safe summary', () => {
    const dryRun = extractPublicIntakeRouteSignalsForDryRun({
      gate: disabledGate,
      requestUrl: 'https://forms.example.test/api/intake?publicToken=do-not-log-me',
      legacyPath: '/funeral-request',
    })

    expect(dryRun.routingInput.publicToken).toBe('do-not-log-me')
    expect(JSON.stringify(dryRun.auditSafeSignalSummary)).not.toContain('do-not-log-me')
    expect(dryRun.auditSafeSignalSummary.publicTokenPresent).toBe(true)
  })

  it('wires the live intake route through the approved signal helper after safe QA approval', () => {
    const intakeRoute = readFileSync(join(process.cwd(), 'app', 'api', 'intake', 'route.ts'), 'utf8')

    expect(intakeRoute).toContain('extractPublicIntakeRouteSignalsForDryRun')
    expect(intakeRoute).toContain('publicIntakeRouteSignalDryRun')
  })
})
