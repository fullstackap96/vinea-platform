import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md'
)

describe('request_document_manifest export production gate approval packet', () => {
  it('is non-runtime and keeps production exports blocked', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime production gate design and product-owner approval packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT GATE NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents the current production-blocked gate reality', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Current implementation status: `CURRENT EXPORT RUNTIME GATE BLOCKS PRODUCTION`',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'The current gate returns `blocked_production_environment`',
      'That behavior must remain true until a separate production-gate implementation is explicitly approved.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines a separate future production-specific flag strategy', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Future production export enablement must use a separate production-specific gate instead of reusing the QA acknowledgement.',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE`',
      '`VINEA_EXPORT_RUNTIME_ENV=PRODUCTION`',
      '`VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST=request_document_manifest`',
      '`VINEA_EXPORT_RUNTIME_APPROVAL_ID=REQUEST_DOCUMENT_MANIFEST_PRODUCTION_SMOKE_<YYYYMMDD>`',
      '`VINEA_EXPORT_RUNTIME_EXPIRES_AT=<UTC timestamp inside approved rollout window>`',
      '`VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER=<non-secret owner label>`',
      '`VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL=<non-secret channel label>`',
      'Do not use this packet as permission to add or enable those flags.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires route safety checks before query or delivery', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Authenticated staff session.',
      'Selected active parish context.',
      'Membership scope for the active parish.',
      'Request ownership check for every included request.',
      '`request_document_manifest` export permission DTO evaluation.',
      'Server-owned manifest field allowlist.',
      'Blocked-field denial for signed URL, storage path, original filename, portal token, token hash, internal note, communication body, AI material, and sacramental/canonical detail requests.',
      'Family portal and unauthenticated denial.',
      'Safe audit event written before query or delivery.',
      'No signed URL creation.',
      'No Supabase Storage download or signed URL API usage.',
      'No raw CSV contents in logs or audit evidence.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines future source-level preflight tests and rollback criteria', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Future Source-Level Preflight Tests',
      '`getExportRuntimeGate` still blocks production unless the production-specific acknowledgement is present.',
      'The QA acknowledgement `APPROVED_EXPORT_RUNTIME_QA` still cannot enable production.',
      '`VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST` is checked before route-specific export logic.',
      '`VINEA_EXPORT_RUNTIME_EXPIRES_AT` is checked before route-specific export logic.',
      'Request ownership checks appear before manifest row queries.',
      'No signed URL, storage path, file download, original filename, token, notes, communications, AI, or sacramental/canonical detail markers appear in the manifest production path.',
      '`lib/server/exportRuntimeProductionGate.test.ts`',
      '`lib/server/exportRouteProductionRuntimeWiringPreflight.test.ts`',
      '`lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`',
      'Prepared non-runtime scaffold:',
      '`lib/server/exportProductionGatePreflight.ts`',
      '`lib/server/exportProductionGatePreflight.test.ts`',
      'The prepared scaffold is source-level only.',
      'The current QA acknowledgement cannot enable production.',
      'Future production flags must be route-allowlisted to `request_document_manifest`.',
      'Future production flags must be timeboxed through `VINEA_EXPORT_RUNTIME_EXPIRES_AT`.',
      'Future production smoke must require approval id, rollback owner, and monitoring channel labels.',
      'The future runtime production gate remains intentionally unimplemented.',
      'Rollback must happen immediately if any of these occur:',
      'Production gate enables any route other than `request_document_manifest`.',
      'Same-parish manifest export returns unsafe fields.',
      'Audit metadata is missing, late, or contains raw IDs/secrets/private content.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious secret material', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
