import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md'
)

describe('export audit reviewer dashboard prototype QA evidence', () => {
  it('records implementation scope and no-go production boundaries', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701`',
      'Current outcome: `EXPORT AUDIT REVIEWER DASHBOARD PROTOTYPE LIVE NON-PRODUCTION BROWSER QA PASSED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Production was not accessed',
      'production flags were not enabled',
      'production navigation was not added',
      'migrations were not applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'no secrets were exposed',
      'Production exports remain `NO-GO`.',
      'Production export monitoring remains `NO-GO`.',
      'Production dashboard UI remains `NO-GO`.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('records API-only, read-only, forbidden-data, and manual browser QA expectations', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Client component fetches only `/api/export-audit-reviewer`.',
      'Client component does not import Supabase clients.',
      'Client component does not query Supabase directly.',
      'Client component does not call export routes.',
      'Client component does not call storage helpers.',
      'Client component does not create signed URLs.',
      'Client component does not mutate records.',
      'Client component does not add export/download controls.',
      'It does not render raw audit metadata, raw exports, storage paths, signed URLs, original filenames, portal tokens, token hashes, notes, communications, AI material, or sacramental/canonical detail.',
      '## Live Non-Production Browser QA Completed',
      'Confirmed the page rendered the non-production unavailable state.',
      'Confirmed `Production exports: NO_GO`.',
      'Switched the active parish to `St Ann`, the safe shared-QA parish with approved export audit events.',
      'Confirmed saved filters rendered and updated results for:',
      'Confirmed no export/download, file-open, document-open, storage, signed URL, raw metadata, raw export, token, AI, notes, communications, sacramental/canonical, delete, approve, reject, or merge controls were present.',
      'Route-level forged active parish and unauthenticated/family-substitute denials remain covered by the completed API live smoke evidence.',
      'Confirmed the dashboard returned to the non-production unavailable state.',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
