import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const registerPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md'
)

describe('membership-aware RLS production blocker register', () => {
  it('is explicitly non-executing and keeps production RLS at NO-GO', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'Status: Blocker register prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar was not touched',
      'Current decision: `NO-GO`',
      'Current recommendation: `NO-GO - do not apply production RLS`',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('links completed evidence including the active-parish selector verification', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md',
      'docs/QA_PARISH_SELECTOR_BROWSER_VERIFICATION_20260628.md',
      'Active-parish selector display verification',
      'Cleaned QA parish names display correctly and Parish A/B switching works.',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('requires all named owner, fixture, health, checks, and explicit approval blockers', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'RLS-PROD-BLOCKER-001',
      'RLS-PROD-BLOCKER-002',
      'RLS-PROD-BLOCKER-003',
      'RLS-PROD-BLOCKER-004',
      'RLS-PROD-BLOCKER-005',
      'RLS-PROD-BLOCKER-006',
      'RLS-PROD-BLOCKER-007',
      'RLS-PROD-BLOCKER-008',
      'RLS-PROD-BLOCKER-009',
      'RLS-PROD-BLOCKER-010',
      'RLS-PROD-BLOCKER-011',
      'RLS-PROD-BLOCKER-012',
      'RLS-PROD-BLOCKER-013',
      'RLS-PROD-BLOCKER-014',
      'RLS-PROD-BLOCKER-015',
      'Product owner provides a separate production approval prompt',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('forbids sensitive evidence and unrelated rollout scope', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'passwords, database URLs, service role keys',
      'raw family portal tokens',
      'signed URLs',
      'private documents',
      'internal notes',
      'AI notes',
      'Runtime public intake routing',
      'AI production flag enablement',
      'Google Calendar mutation',
      'unrelated deployments',
    ]) {
      expect(register).toContain(expected)
    }
  })
})
