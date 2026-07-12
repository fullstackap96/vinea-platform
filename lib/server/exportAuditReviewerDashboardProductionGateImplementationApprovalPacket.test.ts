import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260701.md'
)

describe('export audit reviewer dashboard production gate implementation approval packet', () => {
  it('is approval-only and keeps production dashboard and exports NO-GO', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future implementation step only.',
      'Production was not accessed',
      'production dashboard exposure was not wired',
      'production flags were not enabled',
      'production navigation was not added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'no secrets were exposed',
      'Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE IMPLEMENTATION NOT APPROVED; PRODUCTION DASHBOARD EXPOSURE REMAINS NO-GO; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires prior evidence and exact future implementation files', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md`',
      '`lib/server/exportAuditReviewerProductionGate.ts`',
      '`lib/server/exportAuditReviewerProductionGate.test.ts`',
      '`lib/server/exportAuditReviewerProductionGatePreflight.ts`',
      '`lib/server/exportAuditReviewerProductionGatePreflight.test.ts`',
      '`app/api/export-audit-reviewer/route.ts`',
      '`lib/server/exportAuditReviewerRoute.test.ts`',
      '`app/dashboard/admin/export-audit-reviewer/page.tsx`',
      '`lib/server/exportAuditReviewerDashboardPrototype.test.ts`',
      '`lib/server/exportAuditReviewerDashboardProductionGatePagePreflight.test.ts`',
      '`docs/VINEA_BUILD_STATUS.md`',
      'Related export/trust validation tests that reference the new implementation state.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines production gate flags and keeps non-production QA behavior intact', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Preserve the existing non-production reviewer prototype gate exactly for approved non-production QA work.',
      'Preserve production blocking by default.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION=ENABLED` for production smoke preparation.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE` for production smoke preparation.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV=PRODUCTION` for production smoke preparation.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST` to include `export_audit_reviewer_dashboard`.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST` to include `export_audit_reviewer_api_read_model`.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID` as a non-secret approval label.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT` to parse as a future UTC timestamp inside the approved rollout window.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER` as a non-secret owner label.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL` as a non-secret monitoring channel label.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER` as a non-secret support owner label.',
      'Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER` as a non-secret evidence owner label.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires source preflight, route tests, and forbidden-data safeguards', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Default production behavior remains disabled with generic unavailable behavior.',
      'Existing non-production QA flags still fail closed in production.',
      'Production dashboard flags fail closed when the surface allowlist omits `export_audit_reviewer_dashboard`.',
      'Production dashboard flags fail closed when the surface allowlist omits `export_audit_reviewer_api_read_model`.',
      'Production dashboard flags fail closed when the approval id is missing.',
      'Production dashboard flags fail closed when `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT` is missing, invalid, or expired.',
      'Page source preflight proves production navigation is not added.',
      'API source preflight proves staff authentication stays before parish-scoped data reads.',
      'API source preflight proves membership-backed active parish scope stays before `audit_events` queries.',
      'API source preflight proves no storage APIs, signed URL APIs, raw export delivery, or mutation paths are introduced.',
      'Dashboard tests still prove no export/download, file-open, storage, signed URL, raw metadata, raw export, token, AI, notes, communications, sacramental/canonical, delete, approve, reject, or merge controls render.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires flag-off baseline, monitoring, rollback, and post-implementation no-go state', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION` unset: dashboard and API unavailable in production.',
      '`VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION=ENABLED` with no production acknowledgement: dashboard and API unavailable in production.',
      '`VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED` with `APPROVED_EXPORT_AUDIT_REVIEWER_QA` in production: dashboard and API unavailable in production.',
      'No production navigation is visible or approved.',
      'No production exports are enabled.',
      'No production smoke has run.',
      'Named monitoring owner label.',
      'Dashboard route status monitoring for `/dashboard/admin/export-audit-reviewer`.',
      'API route status monitoring for `/api/export-audit-reviewer`.',
      'Rollback must not require:',
      'Production navigation removal.',
      '`PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE CODE IMPLEMENTED; PRODUCTION FLAGS DISABLED; PRODUCTION DASHBOARD SMOKE NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('includes exact future approval language and avoids obvious secrets', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Approve implementation of the export audit reviewer dashboard production gate code only.',
      'preserving the non-production QA gate',
      'preserving flag-off production blocking',
      'requiring dashboard/API surface allowlist, approval id, expiration, rollback owner, monitoring channel, support owner, and evidence storage owner labels',
      'keeping production flags disabled after implementation',
      'Do not enable production flags, add production navigation, run production smoke, access production, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, or expose secrets.',
      'After implementation, production dashboard exposure and production exports remain NO-GO until I separately approve the production smoke rollout window.',
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
