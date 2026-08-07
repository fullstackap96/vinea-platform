import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidence = readFileSync(
  resolve(
    process.cwd(),
    'docs/FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md',
  ),
  'utf8',
)

describe('function privilege hardening disposable validation evidence', () => {
  it('records every approved catalog and rollback outcome', () => {
    for (const marker of [
      '"allAnonRevoked": true',
      '"authenticatedSurfaceExact": true',
      '"serviceRpcSurfacePreserved": true',
      '"serviceRoleSurfaceExact": true',
      '"scheduleSearchPathFixed": true',
      '"baselineRestored": true',
      '"targetReturnedToPriorInactiveState": true',
    ]) {
      expect(evidence).toContain(marker)
    }
  })

  it('keeps shared QA and production untouched and application gated', () => {
    expect(evidence).toContain('"sharedQaTouched": false')
    expect(evidence).toContain('"productionTouched": false')
    expect(evidence).toContain('Shared-QA application remains `NO-GO`')
  })

  it('contains no connection strings, secrets, or raw fixture identifiers', () => {
    expect(evidence).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(evidence).not.toMatch(/SUPABASE_(?:SERVICE_ROLE|ANON)_KEY/i)
    expect(evidence).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/)
    expect(evidence).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    )
  })

  it('does not overclaim runtime workflow validation', () => {
    expect(evidence).toMatch(
      /does\s+not claim that trigger behavior, RPC business behavior, application health/,
    )
  })
})
