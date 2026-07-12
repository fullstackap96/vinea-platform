import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const worksheetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md'
)

describe('request_document_manifest export production smoke intake worksheet', () => {
  it('is worksheet-only and preserves production safety boundaries', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a human-fillable intake worksheet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED BY THIS WORKSHEET`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630`',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('collects every non-secret value required by the production readiness packet', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '`PRODUCTION_APP_URL`: `[FILL: public production app URL only]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`: `[FILL: safe staff label only, no password]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `[FILL: parish display name or safe parish label only]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`: `[FILL: safe request label only, no raw request ID]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`: `[FILL: safe document set label only, no filenames or paths]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `[FILL: safe cross-parish denial label or substitute only]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `[FILL: signed-out browser, incognito browser, safe family portal session, or route-level substitute]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`: `[FILL: blocked-field attempt label only]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`: `[FILL: audit inspection method label only]`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD`: `[FILL: rollback verification method label only]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`: `[FILL: person or role name]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`: `[FILL: channel or communication path]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`: `[FILL: person or role name]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`: `[FILL: person or role name]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`: `[FILL: date/time and timezone]`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `[FILL: date/time window and timezone]`',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('includes recommended non-secret labels without claiming production approval', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '## Recommended Non-Secret Filled Draft',
      'Current draft status: `RECOMMENDED LABELS PREPARED - PRODUCT OWNER MUST CONFIRM PUBLIC URL AND ROLLOUT WINDOW BEFORE APPROVAL`',
      '`PRODUCTION_APP_URL`: `Public production Vinea app URL - product owner confirms exact public URL before approval`',
      '`PRODUCTION_SUPABASE_PROJECT_LABEL`: `Vinea production Supabase project`',
      '`PRODUCTION_DEPLOYMENT_LABEL`: `Current production Vercel deployment`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`: `Designated production smoke staff account for Parish A`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `Designated production smoke parish - Parish A`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`: `Safe same-parish request for request_document_manifest export smoke`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`: `Safe same-parish document checklist set with generic labels only`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `Route-level cross-parish denial substitute using unauthorized active parish scope`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `Signed-out browser export route check`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`: `request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`: `Staff Audit Log page filtered to export.request_document_manifest.downloaded`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD`: `Export route returns generic unavailable behavior after flags are disabled`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`: `Vinea product owner`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`: `Owner-managed rollout notes channel`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`: `Vinea product owner`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`: `Vinea engineering owner`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`: `Within 30 minutes after the approved production smoke window ends`',
      '`REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `Product-owner-approved low-traffic production smoke window`',
      'Recommended draft approval prompt, still requiring product-owner confirmation of the exact public URL and rollout window:',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('teaches the user how to choose safe document fixtures without exposing sensitive values', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Choose a real staff account that is allowed to use Vinea in production and belongs to the test parish. Record a label, not the password.',
      'Choose one request from the selected parish that is safe for a manifest-only document readiness export.',
      'Choose a same-parish document checklist set with generic labels that are safe to verify in a manifest-only CSV.',
      'Do not choose labels that reveal private family circumstances, original filenames, file contents, storage paths, or sacramental/canonical details.',
      'Choose a safe way to prove staff cannot export a document manifest outside the selected active parish.',
      'Choose a way to verify family-facing or unauthenticated users cannot access the staff export route.',
      'Choose a safe blocked-field attempt that proves risky document fields cannot be requested.',
      'Choose how the smoke tester will verify safe audit metadata.',
      'Choose who watches the smoke and where observations are recorded.',
      'Choose who handles staff/customer questions if the smoke creates confusion or a denial is reported.',
      'Choose who is responsible for turning the feature back off and by when.',
      'Choose how the smoke tester will record that rollback succeeded.',
      'Choose the exact production smoke window.',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('includes copy-paste approval text and final no-go checklist', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '## Copy/Paste Summary For Future Approval',
      'Approve production smoke for request_document_manifest export only.',
      'Run flag-off baseline first',
      'Keep the export manifest-only.',
      'Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.',
      'Current recommendation: `NO-GO UNTIL THIS WORKSHEET IS FILLED WITH NON-SECRET VALUES AND THE EXACT FUTURE APPROVAL PROMPT IS PROVIDED`',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET` is a label only and no original filenames, storage paths, signed URLs, or document contents are recorded.',
      '`PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT` is a field-name test only and contains no real token, signed URL, storage path, original filename, or document content.',
      'Production `request_document_manifest` export remains `NO-GO` until the worksheet is filled and the product owner later provides the exact approval prompt from this completed template.',
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
