import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { REQUIRED_SCHEMA_READINESS_CHECKS } from '@/lib/server/healthCheck'

const healthReadinessPath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md'
)

describe('public intake routing health readiness criteria', () => {
  it('documents promoted health-check scope without changing runtime routing behavior', () => {
    const doc = readFileSync(healthReadinessPath, 'utf8')

    for (const expected of [
      'Status: Runtime health checks include the promoted public intake routing schema.',
      'Do not wire runtime intake routing or change operational RLS from this document.',
      '`/api/health` requires public intake routing schema.',
      'Runtime public intake remains unchanged.',
      'Missing `public_slug`, routing domain tables, or routing token tables should fail current health checks with safe `missingSchema` labels.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines exact future health success and failure expectations', () => {
    const doc = readFileSync(healthReadinessPath, 'utf8')

    for (const expected of [
      '"ok": true',
      '"schema": true',
      '"ok": false',
      '"schema": false',
      '"error": "schema"',
      '"missingSchema": [',
      '"public intake parish routing columns"',
      'missingSchema` must contain safe labels only',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines schema object checks and labels', () => {
    const doc = readFileSync(healthReadinessPath, 'utf8')

    for (const expected of [
      'public intake parish routing columns',
      'parishes',
      'public_slug, public_display_name, public_intake_enabled',
      'public intake domain routing table',
      'parish_public_intake_domains',
      'id, parish_id, hostname, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, active',
      'public intake token routing table',
      'parish_public_intake_tokens',
      'id, parish_id, token_hash, request_type, expires_at, active',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('documents promotion gates before live health checks were expanded', () => {
    const doc = readFileSync(healthReadinessPath, 'utf8')

    for (const expected of [
      'The public intake parish routing migration candidate has passed disposable QA.',
      'The disposable QA evidence template has been completed and reviewed.',
      'The disposable Supabase execution packet has been followed and evidence has been captured.',
      'The public intake routing promotion readiness checklist has passed.',
      'The rollback draft has passed disposable QA.',
      'The migration has been moved from `docs/sql` into `supabase/migrations`.',
      '`/api/health` has been updated in the same implementation phase as the applied migration.',
      'Do not add route-level public intake behavior in this phase.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('guards that current runtime health checks require promoted public intake routing schema', () => {
    const currentLabels = REQUIRED_SCHEMA_READINESS_CHECKS.map((check) => check.label)

    expect(currentLabels).toContain('public intake parish routing columns')
    expect(currentLabels).toContain('public intake domain routing table')
    expect(currentLabels).toContain('public intake token routing table')
  })
})
