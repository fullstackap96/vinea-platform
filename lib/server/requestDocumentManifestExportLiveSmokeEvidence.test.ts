import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md'
)

describe('request_document_manifest export live non-production smoke evidence', () => {
  it('records completed live non-production smoke while preserving production boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed as a live non-production HTTP smoke against the local Vinea app target only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated beyond the approved safe export audit metadata',
      'no secrets were exposed',
      'Current decision: `REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED, PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('covers health, flag-off, same-parish manifest success, denial cases, audit metadata, source safety, and rollback', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'Pre-smoke health',
      'Flag-off baseline',
      'Flag-on unauthenticated boundary',
      'Same-parish manifest export',
      'CSV field exclusions',
      'Blocked-field denial',
      'Storage-path field denial',
      'Cross-parish/forged-cookie denial',
      'Family/unauthenticated denial',
      'Audit metadata',
      'Storage/file API safety',
      'Rollback',
      '"runtimeGateState": "enabled_non_production"',
      '"exportRouteError": "export_unavailable"',
      '"noSignedUrlStorageOrFileApiUsage": true',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the route safety fix found during smoke', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Safety Fix During Smoke',
      'The first flag-on smoke attempt correctly caught',
      'Any manifest row containing sacramental/canonical markers',
      'Focused route tests now include a deliberately restricted request/document row',
      'confirmed the final CSV and audit metadata contain no sacramental/canonical markers',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, parish-id, or request-id material', () => {
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
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
