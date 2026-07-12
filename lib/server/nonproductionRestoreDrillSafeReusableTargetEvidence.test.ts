import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md'
)

describe('non-production restore drill safe reusable target evidence', () => {
  it('records disposable database replay and app/auth smoke completion without overclaiming full restore readiness', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Passed with follow-ups after an approved reusable disposable database reset, repo schema replay, and app/auth restore smoke.',
      'Production and shared QA were not accessed',
      'production runtime behavior was not changed',
      'operational RLS was not changed outside the approved disposable restore-drill target',
      'runtime behavior was not changed',
      'Google Calendar data was not touched',
      'records outside the approved disposable target were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'raw IDs were not recorded',
      'no secrets were exposed',
      'Current decision state: `NON-PRODUCTION DISPOSABLE DATABASE RESTORE/REPLAY AND APP/AUTH SMOKE COMPLETED WITH FOLLOW-UPS; STORAGE AND PRODUCTION TRUST CLAIMS REMAIN NO-GO`',
      'Completion marker: `NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET`',
      '| Drill result | `Passed with follow-ups` |',
      '| Restore readiness claim allowed? | `No` |',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures app/auth smoke, family portal safety, and synthetic cleanup evidence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'App/auth smoke runner: `scripts/run-nonproduction-restore-app-auth-smoke.mjs`',
      'The smoke used `scripts/run-nonproduction-restore-app-auth-smoke.mjs` with confirmation marker `NONPRODUCTION_RESTORE_APP_AUTH_SMOKE`.',
      '"supabaseHost": "kikqtorplsswepqitjys.supabase.co"',
      '"appBaseUrl": "http://127.0.0.1:3222"',
      '"staff": "temporary synthetic staff user"',
      '"request": "temporary synthetic baptism request"',
      '"familyPortal": "temporary family portal token used internally but not recorded"',
      '"name": "api_health"',
      '"schemaTrue": true',
      '"name": "synthetic_staff_sign_in"',
      '"name": "selected_parish_same_parish_detail_access"',
      '"name": "selected_parish_request_detail_page"',
      '"name": "selected_parish_cross_parish_denial"',
      '"name": "family_portal_token_create_without_hash_exposure"',
      '"name": "family_portal_page_safety_without_storage"',
      '"authUserDeleted": true',
      '"syntheticRowsDeleted": true',
      '"parishes": 0',
      '"staff_users": 0',
      '"memberships": 0',
      '"requests": 0',
      '| `/api/health` healthy, if app used | `Pass` | Local disposable app returned HTTP `200` with `checks.schema: true`. |',
      '| Staff sign-in or safe service smoke works | `Pass` | Temporary synthetic staff auth user signed in against the disposable Supabase project. |',
      '| Staff authorization limits parish scope | `Pass` | Same-parish selected-parish request detail access returned HTTP `200`; selected unauthorized parish substitute returned HTTP `404`. |',
      '| Family portal safe page does not expose internal data | `Pass` | Temporary synthetic family portal page returned HTTP `200`, did not expose token hash, signed URL markers, storage path markers, internal notes, audit markers, service role marker, or the synthetic staff email. |',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures only approved target labels and sanitized schema replay observations', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '| Drill environment type | `Approved reusable disposable Supabase project` |',
      '| Target project/ref/host, no secrets | `db.kikqtorplsswepqitjys.supabase.co` |',
      '| Existing target data inventory captured | `Pass` | Sanitized schema inventory only: `29` public tables and `16` public functions. No row data was queried or recorded. |',
      '"approvedReusableDisposable": true',
      '"blockedSharedQa": false',
      '"publicTableCount": 29',
      '"publicFunctionCount": 17',
      '"restoreExecution": "approved-for-follow-up-disposable-database-replay"',
      '"executedApprovedCleanupStatements": 44',
      '"remainingApprovedCleanupTables": 0',
      '"remainingApprovedCleanupFunctions": 0',
      '"remainingApprovedCleanupTypes": 0',
      '"missingTables": []',
      '"missingFunctions": []',
      '"parishes": true',
      '"staff_users": true',
      '"request_documents": true',
      '"request_workflow_steps": true',
      '| Database restore/replay executed | `Pass` | Guarded bootstrap/replay ran only against the approved reusable disposable target and replayed the disposable base schema plus `40` repo migration files. |',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents that storage, signed URLs, raw data, and external integrations were excluded', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '| Baseline `/api/health` captured, if app used | `Not run before app-auth follow-up` | The original database replay did not use an app instance; the follow-up app/auth smoke captured `/api/health` after replay. |',
      '| Storage restore/replay executed or intentionally excluded | `Excluded` | Storage remained excluded; no storage was accessed. |',
      '| Signed URL route works with synthetic file | `Excluded` | Signed URL creation was prohibited. |',
      '| Direct storage access denied | `Excluded` | Storage was not accessed. |',
      '| Google Calendar/email/AI healthy or known degraded mode recorded | `Excluded` | Integrations were excluded by approval scope. |',
      '| No raw row data or raw metadata in evidence | `Pass` | Only schema object presence, safe labels, status codes, and sanitized counts were recorded. |',
      '| No raw IDs in evidence | `Pass` | Synthetic object IDs and the raw family portal token were used internally only and not recorded. |',
      '| Synthetic database records removed or intentionally retained | `Pass` | Count-only cleanup verification showed `0` remaining synthetic parishes, staff users, memberships, parishioners, requests, and workflow steps for the restore-smoke labels. |',
      'Run storage/document synthetic checks only if separately approved',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or executable-command material', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb-',
      'eyJ',
      'supabase db reset',
      'supabase db dump',
      'psql ',
      'pg_restore',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
