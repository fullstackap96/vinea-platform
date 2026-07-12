import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const strategyPath = join(process.cwd(), 'docs', 'PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md')
const sqlPath = join(process.cwd(), 'docs', 'sql', 'public_intake_parish_routing_migration_candidate.sql')
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('public intake parish routing strategy', () => {
  it('keeps the strategy explicitly safe-QA-only for runtime routing', () => {
    const strategy = readFileSync(strategyPath, 'utf8')

    expect(strategy).toContain('Status: Strategy implemented through schema promotion and safe QA route wiring.')
    expect(strategy).toContain('Do not enable runtime public intake routing in production or change operational RLS')
    expect(strategy).toContain('Public intake must not use staff active parish cookies.')
    expect(strategy).toContain('Production behavior must remain legacy')
  })

  it('documents current runtime intake scope and the future resolver', () => {
    const strategy = readFileSync(strategyPath, 'utf8')

    for (const expected of [
      'app/api/intake/route.ts',
      'lib/server/publicIntakeParishScope.ts',
      'oldest parish row',
      'old unused `lib/intakeParishScope.ts` helper was removed',
      'resolvePublicIntakeParishScope',
      'Legacy fallback',
    ]) {
      expect(strategy).toContain(expected)
    }
    expect(existsSync(join(process.cwd(), 'lib', 'intakeParishScope.ts'))).toBe(false)
  })

  it('covers slug, domain, and token routing options with security guardrails', () => {
    const strategy = readFileSync(strategyPath, 'utf8')

    for (const expected of [
      'Recommended role: primary strategy.',
      'Domain Or Host Mapping',
      'Signed Public Form Token',
      'Store only a token hash',
      'Do not use staff active parish cookies',
      'wired into `/api/intake` behind disabled-by-default runtime flags',
      'Keep service-role writes behind controlled API routes.',
      'Do not add broad anonymous RLS policies',
      'durable public intake rate limiting',
    ]) {
      expect(strategy).toContain(expected)
    }
  })

  it('records the promoted schema migration while keeping runtime routing unwired', () => {
    const strategy = readFileSync(strategyPath, 'utf8')
    const sql = readFileSync(sqlPath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(strategy).toContain('docs/sql/public_intake_parish_routing_migration_candidate.sql')
    expect(strategy).toContain('docs/sql/public_intake_parish_routing_rollback_draft.sql')
    expect(strategy).toContain('docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md')
    expect(strategy).toContain('docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md')
    expect(strategy).toContain('docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md')
    expect(sql).toContain('NON-APPLIED CANDIDATE ONLY')
    expect(sql).toContain('Do not copy this file into supabase/migrations')
    expect(migrationNames).toContain('20260625193000_public_intake_parish_routing.sql')
  })

  it('defines the planned schema foundation without enabling anonymous direct writes', () => {
    const sql = readFileSync(sqlPath, 'utf8')

    for (const expected of [
      'public_slug',
      'public_intake_enabled',
      'public_display_name',
      'parish_public_intake_domains',
      'parish_public_intake_tokens',
      'token_hash',
      'CREATE UNIQUE INDEX',
      'ENABLE ROW LEVEL SECURITY',
      'Intentionally no anon policies',
    ]) {
      expect(sql).toContain(expected)
    }

    expect(sql).not.toContain('TO anon')
  })
})
