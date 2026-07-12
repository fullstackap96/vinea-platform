import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const promptPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md'
)

describe('request_document_manifest export production final approval prompt template', () => {
  it('is template-only and preserves production safety boundaries', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Status: Final approval prompt template prepared only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED BY THIS TEMPLATE`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630`',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('links the worksheet and readiness packet used to validate the prompt', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'This template does not approve production export runtime flags',
      'signed URL delivery',
      'storage path exposure',
      'original filename export',
      'document file delivery',
      'bulk document export',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('keeps exact production URL, rollout window, and approval language pending', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Production exports remain `NO-GO` until the product owner provides these exact public, non-secret values in a separate future approval prompt:',
      'PRODUCTION_APP_URL=<exact public production URL>',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<exact low-traffic production smoke window>',
      'Do not replace these with database URLs, preview URLs, private admin URLs, secrets, tokens, passwords, raw IDs, screenshots, or approximate time windows.',
      'Current validation result: `WAITING_FOR_EXACT_PRODUCT_OWNER_VALUES_AND_SEPARATE_APPROVAL_PROMPT`',
      'This document still does not approve the production smoke by itself.',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('contains the final prompt template with recommended non-secret labels', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Approve production smoke for request_document_manifest export only.',
      'PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project',
      'PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Designated production smoke parish - Parish A',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Safe same-parish request for request_document_manifest export smoke',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Safe same-parish document checklist set with generic labels only',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_document_manifest.downloaded',
      'PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD=Export route returns generic unavailable behavior after flags are disabled',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=Vinea product owner',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=Vinea product owner',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=Vinea engineering owner',
      'REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('requires manifest-only smoke gates and blocks unsafe document export behavior', () => {
    const prompt = readFileSync(promptPath, 'utf8')

    for (const expected of [
      'Run flag-off baseline first',
      'enable only the approved production export flags for the approved smoke window',
      'Verify health',
      'same-parish manifest CSV success',
      'CSV field exclusions',
      'cross-parish denial',
      'blocked-field denial',
      'family or unauthenticated denial',
      'safe audit metadata',
      'no signed URL/storage/file API usage',
      'monitoring observations',
      'rollback',
      'Keep the export manifest-only.',
      'create signed URLs',
      'expose storage paths',
      'export original filenames',
      'deliver document files',
      'expose tokens, notes, communications, AI material, sacramental/canonical details',
      'expand exports beyond request_document_manifest',
    ]) {
      expect(prompt).toContain(expected)
    }
  })

  it('does not include obvious credential, connection-string, token, raw ID, or fixture material', () => {
    const prompt = readFileSync(promptPath, 'utf8')

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
      expect(prompt).not.toContain(forbidden)
    }
  })
})
