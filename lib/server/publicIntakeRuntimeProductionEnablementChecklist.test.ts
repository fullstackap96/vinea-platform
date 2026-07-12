import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const checklistPath = join(
  root,
  'docs',
  'PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md'
)

describe('public intake runtime production enablement checklist', () => {
  it('keeps production enablement explicitly blocked until exact approval', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Production enablement is not approved.',
      'Approve Production Runtime Public Intake Routing',
      'Any other approval phrase means production runtime routing remains off.',
      'Do not enable production runtime public intake routing from this checklist alone.',
      'Do not apply migrations.',
      'Do not change operational RLS.',
      'Production enablement explicitly approved: No',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('requires QA, health, DNS, slug, token, and staff workflow evidence', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'QA `/api/health` returned `checks.schema: true` with runtime flags off.',
      'QA `/api/health` returned `checks.schema: true` with runtime flags on.',
      'Flag-on token routing created a request under the expected parish.',
      'Flag-on verified domain routing created a request under the expected parish.',
      'Flag-on slug routing created a request under the expected parish.',
      'Domain row has `verified_at` populated from a successful DNS TXT verification.',
      'A fresh DNS TXT lookup from an external resolver confirms the expected TXT value before switch-on.',
      'The domain resolves to the production Vinea app or approved production proxy',
      'HTTPS/TLS is valid for the production domain.',
      'Parish public slug is present, lowercase, unique, and parish-approved.',
      'Public intake token row is active, unexpired, and scoped to the intended request type',
      'Staff can view new public intake requests in dashboard/request lists.',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('documents rollout, monitoring, rollback, and customer communication requirements', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Enable both exact production runtime flags.',
      'Run production smoke tests in this order:',
      'Audit metadata counts by `publicIntakeRouteSource`: `legacy_fallback`, `token`, `domain`, and `slug`.',
      'Any request routes to the wrong parish.',
      'Runtime rollback does not require a database rollback.',
      'Remove or invalidate `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME`.',
      'Remove or invalidate `VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK`.',
      'Rollback succeeds only when legacy public intake works and route signals no longer affect parish assignment.',
      'Vinea can now route public form submissions to the correct parish',
      'Please use the parish link provided by the parish office.',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('defines exact owner approval gates and stop conditions', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      '| Product owner approval | `Approve Production Runtime Public Intake Routing` recorded | Product owner |',
      '| Technical owner approval | Code, flags, health checks, monitoring, and rollback reviewed | Engineering owner |',
      '| QA owner approval | Safe QA evidence and production smoke plan reviewed | QA owner |',
      '| Rollback owner assigned | Named person can disable flags and verify rollback | Engineering owner |',
      '| Support owner assigned | Named person can triage parish/family reports | Operations owner |',
      '| DNS evidence complete | Every production domain has current successful verification evidence | Operations owner |',
      'Stop or roll back immediately if:',
      'Product owner approval is missing or ambiguous.',
    ]) {
      expect(checklist).toContain(required)
    }
  })
})
