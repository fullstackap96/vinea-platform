import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_SETTINGS_MANUAL_QA_CHECKLIST.md'
)
const intakeRoutePath = join(process.cwd(), 'app', 'api', 'intake', 'route.ts')
const routingRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'parish',
  'public-intake-routing',
  'route.ts'
)
const settingsPagePath = join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx')

describe('public intake routing settings manual QA checklist', () => {
  it('covers the approved staff settings management verification cases', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Public display name edit',
      'Public slug edit',
      'Public slug validation',
      'Enable readiness flag',
      'Add domain',
      'Duplicate domain',
      'Deactivate domain',
      'Activate domain',
      'DNS TXT metadata',
      'Verify before DNS is configured',
      'Reset verification token',
      'Verify after DNS is configured',
      'Create token for any form',
      'Create token for Baptism',
      'One-time visibility',
      'No token hash exposure',
      'Deactivate token',
      'Activate token',
      'Audit Log Verification',
      'public_intake_routing.updated',
      'public_intake_domain.created',
      'public_intake_domain.updated',
      'public_intake_domain.verification_reset',
      'public_intake_domain.verified',
      'public_intake_domain.verification_failed',
      'public_intake_token.created',
      'public_intake_token.updated',
      'Runtime Routing Non-Regression',
      'existing public Baptism request form',
      'existing public Wedding request form',
      'existing public Funeral request form',
      'existing public OCIA request form',
      'existing Join Parish form',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('documents the safety boundaries for this phase', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Do not apply migrations',
      'do not touch production data',
      'do not enable runtime public intake routing in production',
      'do not change operational RLS',
      'Use only safe QA or local test credentials',
      'No public page exposes internal notes, AI notes, audit logs, token hashes, raw tokens, membership data, or private parish data.',
      'DNS TXT value changes',
      'Raw token is visible only in the create response.',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('matches the implemented settings surfaces without exposing token hashes in normal reads', () => {
    const route = readFileSync(routingRoutePath, 'utf8')
    const settingsPage = readFileSync(settingsPagePath, 'utf8')

    expect(route).toContain("action: 'public_intake_routing.updated'")
    expect(route).toContain("action: 'public_intake_domain.created'")
    expect(route).toContain("action: 'public_intake_domain.updated'")
    expect(route).toContain("action: 'public_intake_domain.verification_reset'")
    expect(route).toContain("public_intake_domain.verified'")
    expect(route).toContain("public_intake_domain.verification_failed'")
    expect(route).toContain("action: 'public_intake_token.created'")
    expect(route).toContain("action: 'public_intake_token.updated'")
    expect(route).toContain('token_hash: hashPublicIntakeToken(rawToken)')
    expect(route).toContain('createdToken')
    expect(route).toContain(
      ".select('id, label, request_type, expires_at, active, last_used_at, created_at, updated_at')"
    )
    expect(route).not.toContain(".select('token_hash")
    expect(route).not.toContain('token_hash,')

    expect(settingsPage).toContain('Save routing metadata')
    expect(settingsPage).toContain('Add domain')
    expect(settingsPage).toContain('DNS TXT record')
    expect(settingsPage).toContain('Verify DNS')
    expect(settingsPage).toContain('Reset verification token')
    expect(settingsPage).toContain('Create token')
    expect(settingsPage).toContain('New token shown once')
    expect(settingsPage).toContain('stores only a hash')
  })

  it('confirms runtime public intake routing remains disabled by default after safe QA wiring', () => {
    const intakeRoute = readFileSync(intakeRoutePath, 'utf8')

    expect(intakeRoute).toContain('getPublicIntakeRoutingRuntimeGate')
    expect(intakeRoute).toContain('resolvePublicIntakeParishScope')
    expect(intakeRoute).toContain('createSupabasePublicIntakeParishScopeDataSource')
    expect(intakeRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
    expect(intakeRoute).not.toContain('parish_public_intake_tokens')
    expect(intakeRoute).not.toContain('parish_public_intake_domains')
  })
})
