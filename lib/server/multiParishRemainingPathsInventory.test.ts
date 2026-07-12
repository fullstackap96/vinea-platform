import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const inventoryPath = join(process.cwd(), 'docs', 'MULTI_PARISH_REMAINING_PATHS_INVENTORY.md')
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('multi-parish remaining path inventory', () => {
  it('keeps the inventory as documentation outside applied migrations', () => {
    const inventory = readFileSync(inventoryPath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(inventory).toContain('Status: Inventory only.')
    expect(inventory).toContain('Do not change runtime behavior or operational RLS')
    expect(migrationNames).not.toContain('MULTI_PARISH_REMAINING_PATHS_INVENTORY.md')
  })

  it('documents the runtime scan and intentional exclusions', () => {
    const inventory = readFileSync(inventoryPath, 'utf8')

    expect(inventory).toContain('## Scan Scope')
    expect(inventory).toContain('fetchPrimaryParishId')
    expect(inventory).toContain("rpc\\('primary_parish_id'")
    expect(inventory).toContain('Intentional exclusions')
    expect(inventory).toContain('Historical Supabase migrations.')
    expect(inventory).toContain('Tests.')
  })

  it('prioritizes the remaining high-risk operational surfaces', () => {
    const inventory = readFileSync(inventoryPath, 'utf8')

    for (const expected of [
      '### Completed: Staff Document And Portal Token Authorization',
      '### Completed: Workflow Template Settings API',
      '### Completed: Staff Management API',
      '### Completed: Data Imports API',
      '### Completed: Request Audit Writing',
      '### Completed: Request Detail Parish Guard',
      '### Completed: Audit Events API',
      '### Completed: Duplicate Detection APIs',
      '### Completed: Parish Settings API',
      '### Completed: Parish Daily Brief Manual Send API',
      '### Completed: Google Calendar Create Event API',
      '### Completed: Google Calendar Update Event API',
      '### Completed: Google Calendar Delete Event API',
      '### Completed: Google Calendar OAuth Connection Routes',
      '### Completed: Public Intake Parish Assignment Strategy',
      '### Completed: Duplicate Merge Write Actions',
    ]) {
      expect(inventory).toContain(expected)
    }
  })

  it('includes concrete files and recommended migration phases for each key area', () => {
    const inventory = readFileSync(inventoryPath, 'utf8')

    for (const expected of [
      'lib/server/requestDocumentAccess.ts',
      'app/api/parish/workflow-templates/route.ts',
      'app/api/parish/staff-users/route.ts',
      'app/api/imports/route.ts',
      'lib/server/requestAuditParish.ts',
      'lib/server/requestDetailAccess.ts',
      'app/api/requests/[id]/detail-access/route.ts',
      'app/dashboard/requests/[id]/page.tsx',
      'app/dashboard/requests/actions.ts',
      'app/api/audit-events/route.ts',
      'app/api/people/duplicates/route.ts',
      'app/api/households/duplicates/route.ts',
      'app/api/parish/daily-brief/route.ts',
      'lib/server/loadParishDailyBrief.ts',
      'app/api/google/calendar-event/create/route.ts',
      'app/api/google/calendar-event/update/route.ts',
      'app/api/google/calendar-event/delete/route.ts',
      'app/api/google/oauth/start/route.ts',
      'app/api/google/oauth/callback/route.ts',
      'lib/googleOAuthStateCookie.ts',
      'lib/parishGoogleCalendarServer.ts',
      'app/api/intake/route.ts',
      'lib/server/publicIntakeParishScope.ts',
      'lib/server/publicIntakeRequestParishScopeAdapter.ts',
      'lib/server/publicIntakeRouteSignalDryRun.ts',
      'lib/server/publicIntakeRoutingRuntimeGate.ts',
      'docs/PUBLIC_INTAKE_PARISH_ROUTING_STRATEGY.md',
      'docs/PUBLIC_INTAKE_RUNTIME_WIRING_ACCEPTANCE_CRITERIA.md',
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md',
      'docs/GOOGLE_CALENDAR_ACTIVE_PARISH_QA_CHECKLIST_20260627.md',
      'docs/GOOGLE_CALENDAR_ACTIVE_PARISH_BROWSER_QA_EVIDENCE_TEMPLATE_20260627.md',
      'scripts/set-google-calendar-browser-qa-env.ps1',
      'scripts/check-google-calendar-browser-qa-env.ps1',
      'docs/sql/public_intake_parish_routing_migration_candidate.sql',
      'docs/PUBLIC_INTAKE_PARISH_ROUTING_QA_VALIDATION.md',
      'docs/sql/public_intake_parish_routing_rollback_draft.sql',
      'docs/PUBLIC_INTAKE_ROUTING_HEALTH_READINESS.md',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md',
      'docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md',
      'docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md',
      'Completed phase:',
    ]) {
      expect(inventory).toContain(expected)
    }

    expect(inventory).toContain('unused `lib/intakeParishScope.ts` public-intake helper has been removed')
    expect(inventory).toContain('must not return')
    expect(existsSync(join(process.cwd(), 'lib', 'intakeParishScope.ts'))).toBe(false)
  })

  it('documents compatibility helpers and no-go conditions before RLS promotion', () => {
    const inventory = readFileSync(inventoryPath, 'utf8')

    for (const expected of [
      '## Intentional Compatibility Helpers',
      'lib/dashboardParishRequestScope.ts',
      'lib/server/staffParishContext.ts',
      'lib/server/staffWriteParishContext.ts',
      'Do not remove these fallback helpers yet.',
      'Duplicate merge writes are now application-layer active-parish aware',
      'Run membership-aware operational RLS forward and rollback drafts in a disposable Supabase target only.',
      '## Current No-Go Before Operational RLS Promotion',
      'Production public intake runtime routing remains disabled unless separately approved',
      'Secure browser-QA setup/check scripts are prepared',
    ]) {
      expect(inventory).toContain(expected)
    }
  })
})
