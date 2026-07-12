import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630.md'
)

describe('request_document_manifest export production gate implementation approval packet', () => {
  it('is approval-only and keeps production export NO-GO', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future implementation step only.',
      'Production was not accessed',
      'runtime production export was not wired',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT GATE IMPLEMENTATION NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact future implementation files and scope', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`lib/server/exportRuntimeGate.ts`',
      '`lib/server/exportRuntimeGate.test.ts`',
      '`lib/server/exportProductionGatePreflight.ts`',
      '`lib/server/exportProductionGatePreflight.test.ts`',
      '`app/api/exports/requests/documents/manifest/route.ts`',
      '`lib/server/requestDocumentManifestExportRoute.test.ts`',
      '`lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`',
      '`docs/VINEA_BUILD_STATUS.md`',
      'Preserve the existing non-production QA gate exactly for approved non-production smoke work.',
      'Preserve production blocking by default.',
      'Require `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE` for production smoke.',
      'Require `VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST` to include `request_document_manifest`.',
      'Require `VINEA_EXPORT_RUNTIME_APPROVAL_ID` to match the approved production smoke approval id.',
      'Require `VINEA_EXPORT_RUNTIME_EXPIRES_AT` to parse as a future UTC timestamp inside the approved rollout window.',
      'Require `VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER` as a non-secret owner label.',
      'Require `VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL` as a non-secret monitoring channel label.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines expected tests and source preflight gates', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Default production behavior remains disabled with generic unavailable behavior.',
      'Existing non-production QA flags still fail closed in production.',
      'Production smoke flags fail closed when the route allowlist omits `request_document_manifest`.',
      'Production smoke flags fail closed when the approval id is missing or mismatched.',
      'Production smoke flags fail closed when `VINEA_EXPORT_RUNTIME_EXPIRES_AT` is missing, invalid, or expired.',
      'Production smoke flags fail closed when rollback owner or monitoring channel labels are missing.',
      '`validateFutureExportProductionGateSource` passes on the implemented gate source.',
      '`validateRequestDocumentManifestProductionSafetySource` passes on the implemented manifest route source.',
      'Request document manifest export route tests still prove audit metadata is written before query or delivery.',
      'Request document manifest export route tests still prove blocked fields are denied before audit or query.',
      '`lib/server/exportRuntimeGate.test.ts`',
      '`lib/server/exportProductionGatePreflight.test.ts`',
      '`lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`',
      '`lib/server/requestDocumentManifestExportRoute.test.ts`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires a flag-off production baseline, monitoring, rollback, and post-implementation NO-GO boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_RUNTIME` unset: export route unavailable.',
      '`VINEA_EXPORT_RUNTIME=ENABLED` with no production acknowledgement: export route unavailable.',
      '`VINEA_EXPORT_RUNTIME=ENABLED` with `APPROVED_EXPORT_RUNTIME_QA` in production: export route unavailable.',
      '`VINEA_EXPORT_RUNTIME=ENABLED` with production acknowledgement but no allowlist, approval id, expiry, rollback owner, or monitoring channel: export route unavailable.',
      'Named monitoring owner label.',
      'Named monitoring channel label.',
      'Audit-log inspection plan for `export.request_document_manifest.downloaded`.',
      'Rollback must not require:',
      'Database rollback.',
      'Migration rollback.',
      'Operational RLS rollback.',
      'The future implementation must preserve generic disabled behavior when flags are removed.',
      '`PRODUCTION GATE CODE IMPLEMENTED; PRODUCTION FLAGS DISABLED; PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires exact future approval language and avoids obvious secrets', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Approve implementation of the request_document_manifest production export gate code only.',
      'preserving flag-off production blocking',
      'requiring route allowlist, approval id, expiration, rollback owner, and monitoring channel labels',
      'keeping production flags disabled after implementation',
      'After implementation, production export remains NO-GO until I separately approve the production smoke rollout window.',
      'Separate approval is still required later to enable the production smoke flags for an approved rollout window.',
    ]) {
      expect(packet).toContain(expected)
    }

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
