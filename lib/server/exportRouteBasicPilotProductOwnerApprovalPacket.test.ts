import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const approvalPacketPath = join(
  process.cwd(),
  'docs',
  'EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md'
)
const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('same-parish basic export pilot product-owner approval packet', () => {
  it('is explicitly packet-only and does not approve runtime or data mutations', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'Production was not accessed',
      'no migrations were applied',
      'live export routes were not wired',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `APPROVAL PACKET PREPARED, NON-PRODUCTION ROUTE WIRING NOT APPROVED BY THIS DOCUMENT`',
      'Completion marker: `EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('limits the requested decision to non-production request_list_basic route wiring', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Wire the first same-parish basic request-list export pilot in non-production only',
      'Pilot preset: `request_list_basic`',
      'Future route candidate: `app/api/exports/requests/basic/route.ts`',
      'Future route mode: Non-production QA only.',
      'This approval would allow engineering to implement the route code and tests in a later phase, but only with the runtime gate disabled by default and production still blocked.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('blocks production, sensitive exports, migrations, operational RLS, Google Calendar, and unrelated export surfaces', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Production export rollout.',
      'Production feature flags.',
      'Staff-facing export UI in production.',
      'Sensitive request-note exports.',
      'People and household exports.',
      'Sacramental/canonical exports.',
      'Communication-history exports.',
      'Document manifest exports.',
      'Bulk document file exports.',
      'Audit/security exports.',
      'Public intake routing exports.',
      'AI output exports.',
      'Support break-glass exports.',
      'Diocesan or multi-parish rollup exports.',
      'Any operational RLS change.',
      'Any database migration.',
      'Any Google Calendar behavior.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires allowed-field and blocked-field boundaries for the first pilot', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'The future route must use a server-owned allowlist.',
      'Request reference.',
      'Request type.',
      'Request status.',
      'Required workflow steps incomplete count.',
      'Parishioner email addresses.',
      'Parishioner phone numbers.',
      'Internal notes.',
      'Communication history.',
      'AI summaries, prompts, drafts, provider payloads, or token material.',
      'Document storage paths.',
      'Signed URLs.',
      'Family portal tokens or token hashes.',
      'Google OAuth tokens or Google Calendar payloads.',
      'Sacramental/canonical record details.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires future gate order, exact non-production flags, QA fixtures, evidence, owners, and exact approval language', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      '`getExportRuntimeGate` is evaluated.',
      'Production remains blocked.',
      'Authenticated staff is required.',
      'Selected active parish context is resolved server-side.',
      'Active parish membership is validated using parish membership scope.',
      '`buildExportPermissionEvaluationDto` evaluates preset `request_list_basic`.',
      'Safe audit metadata is prepared before query or delivery.',
      'Audit event writing is approved before the route can deliver files.',
      'Generic blocked errors are used for denied attempts.',
      'The source-level export preflight must require complete marker sets for each gate.',
      'A route must not pass the preflight by including only one partial marker',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'QA staff account with same-parish export permission.',
      'Same-parish request list fixture.',
      'Cross-parish denied request or parish-scope fixture.',
      'Family portal denial fixture or documented route-level substitute.',
      'Blocked-field attempt fixture.',
      'Audit-log inspection method.',
      'Rollback verification method.',
      'Flag-off baseline returns generic disabled behavior.',
      'Same-parish non-production export succeeds with only approved fields.',
      'Audit metadata is written before query execution or file delivery.',
      'Source-level export route preflight passes.',
      'Product owner:',
      'Security/data owner:',
      'Engineering owner:',
      'Parish operations owner:',
      'Support owner:',
      'Approve non-production route wiring for the first same-parish basic request-list export pilot.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('updates policy and trust-center docs while preserving no-go language', () => {
    const policy = readFileSync(policyPath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(policy).toContain('Current export-control readiness: `PROPOSAL')
    expect(policy).toContain('LIVE NON-PRODUCTION SMOKE PASSED')
    expect(policy).toContain('REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED')
    expect(policy).toContain('PRODUCTION RUNTIME EXPORT CONTROLS NOT COMPLETE')
    expect(policy).toContain(
      'Prepare product-owner approval packet. `Completed as approval packet in docs/EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md.`'
    )
    expect(policy).toContain(
      'The product-owner approval packet intentionally does not approve production rollout, live route wiring by itself, staff-facing production UI, sensitive exports, document exports, diocesan exports, migrations, operational RLS changes, Google Calendar changes, or record mutations beyond future approved audit metadata.'
    )
    expect(policy).toContain(
      'Request document manifest export readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`'
    )
    expect(policy).toContain(
      'Request document manifest route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Same-parish basic export pilot product-owner approval packet: `docs/EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Same-parish basic export pilot approval packet validation tests: `lib/server/exportRouteBasicPilotProductOwnerApprovalPacket.test.ts`'
    )
    expect(trustCenter).toContain(
      'Fill `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` and `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` with production-safe fixture labels, named monitoring owner/channel, support owner, rollback owner, rollout window, and exact product-owner approval language for the approved export production smokes.'
    )
  })

  it('does not include obvious credential or connection-string material', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
