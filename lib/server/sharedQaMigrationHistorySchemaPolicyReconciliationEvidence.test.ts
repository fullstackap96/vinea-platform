import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidence = readFileSync(
  resolve(
    process.cwd(),
    'docs/SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md',
  ),
  'utf8',
)

describe('shared-QA migration history and schema/policy reconciliation evidence', () => {
  it('binds all three repository migrations and confirms history drift', () => {
    for (const marker of [
      '20260625193000_public_intake_parish_routing.sql',
      '20260626170000_membership_aware_operational_rls.sql',
      '20260630170000_enable_parishes_rls.sql',
      '"publicIntakeRoutingTracked": false',
      '"membershipAwareOperationalRlsTracked": false',
      '"parishesRlsTracked": false',
      '"driftConfirmed": true',
    ]) {
      expect(evidence).toContain(marker)
    }
  })

  it('records the routing, membership, and parishes catalog fingerprints', () => {
    for (const marker of [
      '"catalogFingerprintMatches": true',
      '"expectedPolicyCount": 45',
      '"presentPolicyCount": 45',
      '"authenticatedRoleExactCount": 45',
      '"scopeMismatchCount": 0',
      '"unexpectedPolicyCount": 0',
      '"requestScopeHelperDefinitionMatches": true',
      '"rlsEnabled": true',
    ]) {
      expect(evidence).toContain(marker)
    }
  })

  it('keeps the function privilege mismatch and no-go decision explicit', () => {
    expect(evidence).toContain('"requestScopeHelperAnonymousExecute": true')
    expect(evidence).toContain('"privilegeSurfaceMatchesMigration": false')
    expect(evidence).toContain('"replayAnyTargetMigration": false')
    expect(evidence).toContain('"repairMigrationHistory": false')
    expect(evidence).toContain('"sharedQaWriteApproved": false')
  })

  it('contains no connection strings, secrets, or raw fixture identifiers', () => {
    expect(evidence).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(evidence).not.toMatch(/SUPABASE_(?:SERVICE_ROLE|ANON)_KEY/i)
    expect(evidence).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/)
    expect(evidence).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    )
  })
})
