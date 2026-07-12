import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const planPath = join(root, 'docs', 'PUBLIC_INTAKE_ROUTING_RUNTIME_GUARD_PLAN.md')
const gatePath = join(root, 'lib', 'server', 'publicIntakeRoutingRuntimeGate.ts')
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')

describe('public intake routing runtime guard plan', () => {
  it('documents the disabled-by-default feature flag and explicit acknowledgement', () => {
    const plan = readFileSync(planPath, 'utf8')

    expect(plan).toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED')
    expect(plan).toContain(
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME'
    )
    expect(plan).toContain('Runtime public intake routing is wired into `/api/intake` behind disabled-by-default flags')
    expect(plan).toContain('No production or shared QA data changes.')
  })

  it('documents the future route-source order and fail-closed requirements', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Public token',
      'Verified active domain',
      'Enabled parish slug',
      'Legacy primary parish fallback',
      'Require `parishes.public_intake_enabled = true`',
      'Require domain rows to be active and `verified_at` to be set',
      'Require token rows to be active and unexpired',
      'Return generic public errors',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('keeps the live public intake route disabled by default after approved route wiring', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    expect(intakeRoute).toContain('getPublicIntakeRoutingRuntimeGate')
    expect(intakeRoute).toContain('resolvePublicIntakeParishScope')
    expect(intakeRoute).toContain('createSupabasePublicIntakeParishScopeDataSource')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
  })

  it('keeps the gate server-only and intentionally separate from required env startup checks', () => {
    const gate = readFileSync(gatePath, 'utf8')
    const requiredEnv = readFileSync(join(root, 'lib', 'server', 'requiredEnv.ts'), 'utf8')

    expect(gate).toContain("import 'server-only'")
    expect(gate).toContain('enabled: false')
    expect(requiredEnv).not.toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME')
  })
})
