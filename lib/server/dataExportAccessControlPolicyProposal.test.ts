import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('data export and access-control policy proposal', () => {
  it('is explicitly proposal-only and avoids runtime or data mutations', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Status: Proposal prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'This is not yet an approved customer-facing policy, not legal advice, not a completed export permission system, and not a public trust-center claim.',
      'Current export-control readiness: `PROPOSAL, NON-RUNTIME DTOS, DISABLED RUNTIME GATE, BASIC PILOT PLAN, APPROVAL PACKET, NON-PRODUCTION BASIC ROUTE WIRED, ROUTE-LEVEL QA PASSED, LIVE SMOKE APPROVAL PACKET PREPARED, LIVE NON-PRODUCTION SMOKE PASSED, PRODUCTION READINESS APPROVAL PACKET PREPARED, PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, DOCUMENT MANIFEST READINESS PACKET PREPARED, DOCUMENT MANIFEST ROUTE WIRING APPROVAL PACKET PREPARED, NON-PRODUCTION DOCUMENT MANIFEST ROUTE WIRED, DOCUMENT MANIFEST ROUTE-LEVEL QA PASSED, REQUEST DOCUMENT MANIFEST LIVE SMOKE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED, REQUEST DOCUMENT MANIFEST PRODUCTION READINESS APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION FINAL APPROVAL PROMPT TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE EVIDENCE TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE PREFLIGHT SCAFFOLD PREPARED, AND REQUEST DOCUMENT MANIFEST PRODUCTION GATE IMPLEMENTATION APPROVAL PACKET PREPARED; PRODUCTION RUNTIME EXPORT CONTROLS NOT COMPLETE`',
      'Current outcome: `Data export and access-control policy proposal, non-runtime permission DTOs, disabled runtime gate, route preflight scaffold, same-parish basic export pilot plan, product-owner approval packet, non-production basic request-list export route wiring, route-level QA evidence, live non-production smoke approval packet, live non-production smoke evidence, production readiness approval packet, human-fillable production smoke intake worksheet, request document manifest export readiness packet, request document manifest route wiring approval packet, non-production request document manifest route, request document manifest route-level QA evidence, request document manifest live non-production smoke approval packet, request document manifest live non-production smoke evidence, request document manifest production readiness approval packet, request document manifest production smoke intake worksheet, request document manifest production final approval prompt template, request document manifest production smoke evidence template, request document manifest production gate approval packet, request document manifest production gate preflight scaffold, and request document manifest production gate implementation approval packet prepared; production approval and production implementation pending`',
      'Completion marker: `DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630`',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('covers major Vinea data surfaces that future exports could expose', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'People and households.',
      'Requests and request workflow steps.',
      'Sacramental records and certificate generation history.',
      'Mass intentions.',
      'Communications and email history.',
      'Internal notes and staff-only comments.',
      'AI summaries, AI email drafts, and future AI retrieval outputs.',
      'Audit logs and security events.',
      'Documents, document manifests, and family portal uploads.',
      'Imports, reports, duplicate-review surfaces, and future diocesan rollups.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('requires active parish membership scope, view-vs-export separation, reasons, and audit metadata', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Export is more sensitive than view access.',
      'Every export must be scoped to an active parish or an explicitly approved multi-parish role.',
      'Cross-parish export must be denied by default.',
      'Server-side active parish and `parish_memberships` validation before export queries.',
      'Separate view and export authorization.',
      'Export reason required for sensitive data classes.',
      'Safe audit event created before file delivery or export job queueing.',
      'Staff user id.',
      'Active parish id.',
      'Parish ids included in export.',
      'Row count or estimated row count.',
      'Export reason.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('blocks token, secret, signed-url, and raw AI material from normal exports', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Passwords.',
      'Supabase service role keys.',
      'Environment secrets.',
      'Google OAuth access tokens.',
      'Google OAuth refresh tokens.',
      'OpenAI API keys.',
      'Family portal token hashes.',
      'Public intake token hashes.',
      'Signed URL material.',
      'Raw OpenAI prompts.',
      'Raw OpenAI provider payloads.',
      'Raw AI token material.',
      'Full database dumps from staff UI.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('updates the trust-center packet while keeping runtime export claims blocked', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Data export and access-control policy proposal: `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`',
      'Export permission DTOs and blocked data-class map: `lib/exportAccessControl.ts`',
      'Disabled-by-default export runtime gate: `lib/server/exportRuntimeGate.ts`',
      'Same-parish basic export pilot implementation plan: `docs/EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md`',
      'Same-parish basic export pilot product-owner approval packet: `docs/EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md`',
      'Non-production same-parish basic request-list export route: `app/api/exports/requests/basic/route.ts`',
      'Non-production same-parish basic request-list export route-level QA evidence: `docs/REQUEST_LIST_BASIC_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md`',
      'Live non-production same-parish basic request-list export smoke approval packet: `docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`',
      'Live non-production same-parish basic request-list export smoke evidence: `docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`',
      'Production readiness approval packet for same-parish basic request-list export: `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`',
      'Production readiness approval packet tests: `lib/server/requestListBasicExportProductionReadinessApprovalPacket.test.ts`',
      'Human-fillable production smoke intake worksheet: `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`',
      'Human-fillable production smoke intake worksheet tests: `lib/server/requestListBasicExportProductionSmokeIntakeWorksheet.test.ts`',
      'Request document manifest export readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`',
      'Request document manifest export readiness tests: `lib/server/requestDocumentManifestExportReadinessPacket.test.ts`',
      'Request document manifest route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`',
      'Request document manifest route wiring approval packet tests: `lib/server/requestDocumentManifestExportRouteWiringApprovalPacket.test.ts`',
      'Non-production request document manifest export route: `app/api/exports/requests/documents/manifest/route.ts`',
      'Non-production request document manifest export route tests: `lib/server/requestDocumentManifestExportRoute.test.ts`',
      'Request document manifest export route-level QA evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md`',
      'Request document manifest live non-production smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`',
      'Request document manifest export route-level QA evidence tests: `lib/server/requestDocumentManifestExportNonproductionQaEvidence.test.ts`',
      'Request document manifest live non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`',
      'Request document manifest live non-production smoke evidence tests: `lib/server/requestDocumentManifestExportLiveSmokeEvidence.test.ts`',
      'Request document manifest production readiness approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`',
      'Request document manifest production readiness approval packet tests: `lib/server/requestDocumentManifestExportProductionReadinessApprovalPacket.test.ts`',
      'Request document manifest production smoke intake worksheet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`',
      'Request document manifest production smoke intake worksheet tests: `lib/server/requestDocumentManifestExportProductionSmokeIntakeWorksheet.test.ts`',
      'Request document manifest production final approval prompt template: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`',
      'Request document manifest production final approval prompt tests: `lib/server/requestDocumentManifestExportProductionFinalApprovalPrompt.test.ts`',
      'Request document manifest production smoke evidence template: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md`',
      'Request document manifest production smoke evidence template tests: `lib/server/requestDocumentManifestExportProductionSmokeEvidenceTemplate.test.ts`',
      'Request document manifest production gate approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md`',
      'Request document manifest production gate approval packet tests: `lib/server/requestDocumentManifestExportProductionGateApprovalPacket.test.ts`',
      'Request document manifest production gate preflight scaffold: `lib/server/exportProductionGatePreflight.ts`',
      'Request document manifest production gate preflight scaffold tests: `lib/server/exportProductionGatePreflight.test.ts`',
      'Request document manifest production gate implementation approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630.md`',
      'Request document manifest production gate implementation approval packet tests: `lib/server/requestDocumentManifestExportProductionGateImplementationApprovalPacket.test.ts`',
      '| Export controls | CSV/import surfaces exist, and a data export/access-control policy proposal',
      'request document manifest production smoke evidence template, request document manifest production gate approval packet, request document manifest production gate preflight scaffold, and request document manifest production gate implementation approval packet now define active parish scope',
      'current production-gate limitation',
      'future production-specific flag strategy',
      'source-level production-gate preflight requirements',
      'route allowlisting',
      'timeboxed production flags',
      'required approval/rollback/monitoring labels',
      'future implementation file scope',
      'flag-off production baseline',
      'post-implementation NO-GO boundary',
      'Production approval, production smoke, staff UI approval, exact production URL/window, production-runtime gate implementation approval, and production-safe fixture intake before customer-facing export work',
      'Current status: `PROPOSAL, NON-RUNTIME DTOS, DISABLED RUNTIME GATE, BASIC PILOT PLAN, PRODUCT-OWNER APPROVAL PACKET, NON-PRODUCTION BASIC ROUTE WIRED, ROUTE-LEVEL QA PASSED, LIVE SMOKE APPROVAL PACKET PREPARED, LIVE NON-PRODUCTION SMOKE PASSED, PRODUCTION READINESS APPROVAL PACKET PREPARED, PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, DOCUMENT MANIFEST READINESS PACKET PREPARED, DOCUMENT MANIFEST ROUTE WIRING APPROVAL PACKET PREPARED, NON-PRODUCTION DOCUMENT MANIFEST ROUTE WIRED, DOCUMENT MANIFEST ROUTE-LEVEL QA PASSED, REQUEST DOCUMENT MANIFEST LIVE SMOKE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED, REQUEST DOCUMENT MANIFEST PRODUCTION READINESS APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION FINAL APPROVAL PROMPT TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE EVIDENCE TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE PREFLIGHT SCAFFOLD PREPARED, AND REQUEST DOCUMENT MANIFEST PRODUCTION GATE IMPLEMENTATION APPROVAL PACKET PREPARED; PRODUCTION RUNTIME EXPORT CONTROLS NOT COMPLETE`',
      'Document manifest route wiring is approved only for non-production runtime QA behind the disabled export runtime gate.',
      'Document manifest route-level QA passed for the route harness.',
      'Document manifest route-level QA passed for the route harness. Live non-production HTTP smoke also passed after tightening the route to filter sacramental/canonical markers from the manifest-only pilot CSV.',
      'Document manifest production export remains unapproved until production-safe fixture labels, exact public production app target, exact rollout window, rollback owner, monitoring expectations, staff-facing UI boundary, support handling, exact approval language, and an approved production-runtime gate implementation path are supplied.',
      'the production gate approval packet defines the future production-specific runtime flag strategy without implementing it',
      'The source-level preflight scaffold validates the expected gate shape and manifest safety markers before future implementation.',
      'The production gate implementation approval packet defines exact implementation files, expected tests, flag-off production baseline, monitoring requirements, rollback behavior, and post-implementation `NO-GO` boundary before any production smoke.',
      'None of those documents or tests implements the production gate, enables production flags, or approves production execution by itself.',
      'Do not claim production runtime export controls, field-level permissions, diocesan exports, staff-facing export UI, or bulk document exports are complete until product, security/data, parish operations, support, and canonical/sacramental review gates are complete and production export routes are deliberately approved, smoke-tested, monitored, and rollback-tested.',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md',
      'only during the separately approved rollout window',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md',
      'before any production export gate implementation is requested',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630.md',
      'before approving implementation of the production gate code',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })

  it('does not include obvious credential or connection-string material', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(policy).not.toContain(forbidden)
    }
  })
})
