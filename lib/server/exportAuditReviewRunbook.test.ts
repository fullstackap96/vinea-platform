import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const runbookPath = join(process.cwd(), 'docs', 'EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit review runbook', () => {
  it('is runbook-only and keeps production exports blocked', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'Status: Runbook prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW RUNBOOK PREPARED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_RUNBOOK_20260630`',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('covers the export routes, denials, and explicit exclusions', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      '`request_list_basic` exports.',
      '`request_document_manifest` exports.',
      'Failed export attempts, denied cross-parish attempts, blocked-field attempts, and unauthenticated or family-portal attempts.',
      'Bulk document file export approval.',
      'Signed URL generation approval.',
      'Storage path exposure.',
      'Original filename export.',
      'Staff-facing production export UI approval.',
      'Production runtime flag approval.',
      'Changes to operational RLS.',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('requires safe audit metadata before query or delivery', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'Every approved export route should produce safe audit metadata before query or delivery.',
      '`event_type`',
      '`staff_user_id`',
      '`active_parish_id`',
      '`parish_ids_included`',
      '`export_type`',
      '`requested_fields`',
      '`blocked_fields`',
      '`row_count` or estimated row count.',
      '`route_scope_source`',
      '`export.request_list_basic.downloaded`',
      '`export.request_document_manifest.downloaded`',
      '`export.request_list_basic.denied`',
      '`export.request_document_manifest.denied`',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('defines suspicious patterns, severity escalation, evidence preservation, and rollback checks', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'Export delivery event without a preceding approval window.',
      'Export delivery event while production flags are expected to be off.',
      'Export delivery from a family portal, anonymous request, or unauthenticated session.',
      'Cross-parish request included in a same-parish export.',
      "Export with a parish id outside the staff member's active memberships.",
      'Severity 1: Confirmed or likely unauthorized export delivery.',
      'Severity 2: Denied suspicious attempt with no delivery.',
      'Severity 3: Missing evidence, malformed audit metadata, or unclear smoke result.',
      'Store non-secret evidence with the relevant smoke or incident packet:',
      'Flag-off request returns the expected unavailable or denied response.',
      'No new `*.downloaded` export audit events appear after rollback.',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('blocks credential, token, file, signed-url, AI, and canonical detail leakage', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'raw file contents',
      'token material',
      'signed URL material',
      'storage paths',
      'original filenames',
      'raw prompts',
      'raw AI outputs',
      'environment secrets',
      'service-role keys',
      'signed URLs, storage paths, original filenames, file contents, notes, communications, AI material, tokens, or sacramental/canonical detail',
    ]) {
      expect(runbook).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb_secret_',
      'eyJ',
    ]) {
      expect(runbook).not.toContain(forbidden)
    }
  })

  it('is linked from the trust-center readiness packet without claiming production readiness', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit review runbook: `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md`',
      'The export audit review runbook defines the human review process for export audit events after non-production smoke tests and future approved production windows',
      'These export audit review documents do not enable production exports, add runtime monitoring, or approve staff-facing export UI.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
