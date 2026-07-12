import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const approvalPacketPath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md'
)
const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('request document manifest export route wiring approval packet', () => {
  it('is explicitly approval-only and avoids runtime or data mutations', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no live export route was wired',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `APPROVAL PACKET PREPARED, NON-PRODUCTION DOCUMENT MANIFEST ROUTE WIRING NOT APPROVED BY THIS DOCUMENT`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('limits the requested decision to non-production request_document_manifest route wiring', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Wire the request document manifest export route in non-production only',
      'Pilot preset: `request_document_manifest`',
      'Future route candidate: `app/api/exports/requests/documents/manifest/route.ts`',
      'Future route mode: Non-production QA only.',
      'This approval would allow engineering to implement the route code and tests in a later phase, but only with the runtime gate disabled by default, production blocked, and the manifest-only privacy boundary preserved.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('blocks production, signed URLs, storage paths, files, tokens, notes, communications, AI, and sacramental data', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Production export rollout.',
      'Production feature flags.',
      'Staff-facing export UI in production.',
      'Bulk document file exports.',
      'Signed URL generation.',
      'Storage object path exposure.',
      'Original filename export.',
      'Uploaded file content export.',
      'Family portal token export.',
      'Family portal token hash export.',
      'Internal note export.',
      'Staff-only document comment export.',
      'Communication-history export.',
      'AI summary, draft, prompt, provider payload, or token-material export.',
      'Sacramental/canonical detail export.',
      'Any operational RLS change.',
      'Any database migration.',
      'Any Google Calendar behavior.',
      'Any record mutation beyond future approved safe audit metadata.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires a manifest-only allowlist and explicit blocked-field controls', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'The future route must use a server-owned allowlist.',
      'Request reference.',
      'Request type.',
      'Request status.',
      'Workflow phase.',
      'Workflow step title.',
      'Document family-facing label.',
      'Document review status.',
      'Submitted date.',
      'Reviewed date.',
      'Missing/received indicator.',
      'Signed URLs.',
      'Storage bucket names.',
      'Storage object paths.',
      'Direct storage paths.',
      'Original filenames.',
      'Uploaded file contents.',
      'Family portal tokens.',
      'Staff-only internal notes.',
      'Communication bodies.',
      'AI summaries.',
      'Sacramental/canonical record details.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires future gate order, exact flags, QA fixtures, evidence, owners, and exact approval language', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      '`getExportRuntimeGate` is evaluated.',
      'Production remains blocked.',
      'Authenticated staff is required.',
      'Family portal and unauthenticated surfaces are denied.',
      'Selected active parish context is resolved server-side.',
      'Active parish membership is validated using parish membership scope.',
      'Every included request is verified to belong to the selected active parish.',
      '`buildExportPermissionEvaluationDto` evaluates preset `request_document_manifest`.',
      'The server-owned document manifest field allowlist is used.',
      'No signed URL, storage path, file preview, file download, or storage object API is called.',
      'Safe audit metadata is prepared before query or delivery.',
      'Audit event writing is approved before the route can deliver a manifest.',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'QA staff account with request document manifest export permission.',
      'Same-parish request with required document workflow steps.',
      'Cross-parish denied request document fixture or active-parish mismatch fixture.',
      'Family portal denial fixture or signed-out denial substitute.',
      'Blocked-field attempt fixture that asks for signed URL, storage path, original filename, token, note, communication, AI, or sacramental/canonical fields.',
      'Flag-off baseline returns generic disabled behavior.',
      'Same-parish non-production manifest export succeeds with only approved fields.',
      'The manifest contains no signed URLs, storage paths, original filenames, file contents, tokens, notes, communications, AI material, or sacramental/canonical details.',
      'No storage signed URL API, storage path API, file preview API, or file download API is called.',
      'Audit metadata is written before query execution or manifest delivery.',
      'Product owner:',
      'Security/data owner:',
      'Engineering owner:',
      'Parish operations owner:',
      'Support owner:',
      'Approve non-production route wiring for the request_document_manifest export pilot only.',
      'Keep the export manifest-only and do not create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or mutate records beyond approved audit metadata.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('updates policy and trust-center docs while preserving no-go route-wiring language', () => {
    const policy = readFileSync(policyPath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(policy).toContain('Current export-control readiness: `PROPOSAL')
    expect(policy).toContain('DOCUMENT MANIFEST ROUTE WIRING APPROVAL PACKET PREPARED')
    expect(policy).toContain('REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED')
    expect(policy).toContain('PRODUCTION RUNTIME EXPORT CONTROLS NOT COMPLETE')
    expect(policy).toContain(
      'Request document manifest route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`'
    )
    expect(policy).toContain(
      'The document manifest route wiring approval packet defines the exact future product-owner approval language for non-production-only route wiring.'
    )
    expect(trustCenter).toContain(
      'Request document manifest route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Request document manifest route wiring approval packet tests: `lib/server/requestDocumentManifestExportRouteWiringApprovalPacket.test.ts`'
    )
    expect(trustCenter).toContain(
      'Document manifest route wiring is approved only for non-production runtime QA behind the disabled export runtime gate.'
    )
    expect(trustCenter).toContain('Document manifest route-level QA passed for the route harness.')
    expect(trustCenter).toContain(
      'Request document manifest live non-production smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Request document manifest live non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`'
    )
  })

  it('does not include obvious credential, connection-string, signed URL, token, or raw fixture material', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'https://signed',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
