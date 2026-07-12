import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const worksheetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md'
)

describe('export audit reviewer dashboard production smoke intake worksheet', () => {
  it('is worksheet-only and preserves production no-go boundaries', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a human-fillable intake worksheet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'production navigation was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD SMOKE NOT APPROVED BY THIS WORKSHEET`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701`',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('collects every non-secret fixture and owner label required for a future dashboard smoke', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '`PRODUCTION_APP_URL`: `[FILL: public production app URL only]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_DEPLOYMENT_LABEL`: `[FILL: deployment label only, no Vercel token]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPABASE_LABEL`: `[FILL: Supabase project label only, no database URL or keys]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`: `[FILL: safe staff reviewer label only, no password]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`: `[FILL: parish display name or safe parish label only]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`: `[FILL: safe downloaded audit event label only, no raw metadata]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`: `[FILL: safe denied audit event label only, no raw metadata]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE`: `[FILL: empty saved-filter label only]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`: `[FILL: cross-parish or forged-parish denial method label only]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `[FILL: signed-out browser, incognito browser, safe family portal session, or route-level substitute]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_OWNER`: `[FILL: person or role name]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL`: `[FILL: channel or communication path]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER`: `[FILL: person or role name]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER`: `[FILL: person or role name]`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_ROLLBACK_METHOD`: `[FILL: rollback method label only]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER`: `[FILL: person or role name]`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ROLLOUT_WINDOW`: `[FILL: date/time window and timezone]`',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('includes recommended non-secret draft labels without granting approval', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '## Recommended Non-Secret Filled Draft',
      'Current draft status: `RECOMMENDED LABELS PREPARED - PRODUCT OWNER MUST CONFIRM PUBLIC URL, ROLLOUT WINDOW, AND NAMED OWNERS BEFORE APPROVAL`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`: `Designated production smoke staff reviewer for Parish A`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`: `Designated production smoke parish - Parish A`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`: `Existing safe downloaded export audit event for Parish A`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`: `Existing safe denied export audit event for Parish A`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE`: `Saved-filter case expected to show an empty safe state`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`: `Route-level forged active parish or unauthorized parish switch denial substitute`',
      '`PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `Signed-out browser dashboard/API check`',
      '`EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER`: `Vinea product owner`',
      'Current recommendation: `NO-GO UNTIL THIS WORKSHEET IS FILLED WITH NON-SECRET VALUES AND A SEPARATE PRODUCTION DASHBOARD GATE IMPLEMENTATION APPROVAL IS PROVIDED`',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('teaches the user how to choose safe labels and verify forbidden-data exclusions', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Fill this worksheet with labels and plain-language descriptions only.',
      'Choose a real production staff account that is allowed to use Vinea and belongs to the test parish. Record a label, not the password.',
      'Choose an existing safe downloaded export audit event for the selected parish.',
      'Choose an existing safe denied export audit event for the selected parish.',
      'Choose a saved-filter state that should return no rows and show the safe empty state.',
      'Choose a safe way to prove the reviewer dashboard/API cannot read another parish',
      'Choose a way to verify family-facing or unauthenticated users cannot access the reviewer dashboard/API.',
      'Choose who watches the production smoke and where observations are recorded.',
      'Choose who stores the smoke evidence and confirms it is redacted.',
      'raw audit metadata',
      'raw export contents',
      'signed URLs',
      'storage paths',
      'sacramental/canonical details',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('includes future approval text but keeps smoke execution separately gated', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '## Copy/Paste Summary For Future Approval',
      'Approve production smoke preparation for the export audit reviewer dashboard only',
      'Implement the production-specific reviewer dashboard gate behind disabled-by-default flags',
      'keeping production navigation disabled',
      'Do not enable production flags, add production navigation, enable production exports, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, expose secrets, or run the production smoke yet.',
      'After implementation, production dashboard exposure remains NO-GO until I separately approve the exact production smoke rollout window.',
      'Production export audit reviewer dashboard smoke remains `NO-GO` until this worksheet is filled, the production dashboard gate implementation is separately approved, the gate implementation passes checks, and the product owner later approves the exact production smoke rollout window.',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or fixture material', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

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
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(worksheet).not.toContain(forbidden)
    }
  })
})
