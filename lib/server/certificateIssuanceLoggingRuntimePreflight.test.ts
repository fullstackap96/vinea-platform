import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateFutureCertificateIssuanceLoggingRuntimeSource } from './certificateIssuanceLoggingRuntimePreflight'

const root = process.cwd()
const approvalPacketPath = join(root, 'docs', 'CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md')
const preflightPlanPath = join(root, 'docs', 'CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702.md')
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')
const roadmapPath = join(root, 'docs', 'VINEA_ROADMAP.md')
const sourceOfTruthPath = join(root, 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md')

const approvedFutureCertificateIssuanceScaffoldSketch = `
import { getCertificateIssuanceLoggingRuntimeGate } from '@/lib/server/certificateIssuanceLoggingGate'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'

export async function POST(request: NextRequest) {
  const certificateIssuanceRuntimeGate = getCertificateIssuanceLoggingRuntimeGate({
    ack: process.env.VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK,
    expectedAck: 'APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA',
  })
  if (!certificateIssuanceRuntimeGate.enabled) {
    return returnCertificateIssuanceRuntimeUnavailable({ rollbackNoop: certificateIssuanceRuntimeGate.rollbackNoop })
  }
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) {
    return NextResponse.json({ ok: false, error: 'Certificate issuance logging unavailable.' }, { status: 401 })
  }
  const activeParishContext = await resolveActiveStaffParishContext(staff.supabase, {
    requestedParishId: request.cookies.get('vinea_active_parish_id')?.value,
  })
  const activeParishId = activeParishContext.activeParishId
  const authorizedParishIds = activeParishContext.authorizedParishIds
  const target = await loadCertificateIssuanceLoggingTarget({ activeParishId })
  const recordParishId = target.record.parish_id
  const recordBelongsToActiveParish = recordParishId === activeParishId
  const requestToRecordContinuity = await validateCertificateIssuanceLinkedRequestOwnership({
    recordParishId,
    linkedRequestParishMatchesRecord: true,
  })
  const safeCertificateIssuanceAuditMetadata = buildCertificateIssuanceLoggingAuditMetadata({
    featureId: 'certificate_issuance_logging_v1',
    eventAction: 'certificate_issuance_reviewed',
    activeParishId,
    authorizedParishIds,
    requestToRecordContinuity,
    genericCertificateIssuanceBlockedReason: 'certificate_issuance_logging_unavailable',
  })
  const automationBoundary = assertNoCertificateAutomation({
    certificateGeneratedAutomatically: false,
    automaticCertificateGenerationBlocked: true,
    mutatesSacramentalRecord: false,
    runtimePersistenceApproved: false,
  })
  if (!recordBelongsToActiveParish || !automationBoundary.ok) {
    return NextResponse.json({
      ok: false,
      error: genericCertificateIssuanceBlockedReason ?? 'certificate_issuance_logging_unavailable',
    }, { status: 403 })
  }
  await writeCertificateIssuanceLoggingAuditEvent({ metadata: safeCertificateIssuanceAuditMetadata })
  returnCertificateIssuanceScaffoldResponse({
    ok: true,
    metadata: safeCertificateIssuanceAuditMetadata,
    runtimePersistenceApproved: false,
  })
}
`

describe('certificate issuance logging runtime preflight', () => {
  it('accepts a future issuance logging scaffold only when every gate appears before response or event write', () => {
    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(
      approvedFutureCertificateIssuanceScaffoldSketch
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.map((gate) => gate.id)).toEqual([
      'non_production_gate',
      'authentication',
      'active_parish_scope',
      'membership_scope',
      'record_ownership',
      'request_to_record_ownership',
      'safe_audit_metadata',
      'forbidden_automation_blocking',
      'generic_denial',
      'rollback_noop',
    ])
    expect(result.gates.every((gate) => gate.ok && gate.markerIndex < result.firstSensitiveActionIndex)).toBe(true)
  })

  it('rejects future scaffolding that writes audit/event metadata before parish, ownership, and audit safeguards', () => {
    const unsafe = approvedFutureCertificateIssuanceScaffoldSketch.replace(
      'const activeParishContext = await resolveActiveStaffParishContext',
      'await writeCertificateIssuanceLoggingAuditEvent({ metadata: unsafeMetadata })\n  const activeParishContext = await resolveActiveStaffParishContext'
    )

    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('active_parish_scope must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('record_ownership must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('safe_audit_metadata must appear before any certificate issuance scaffold response or event write'),
      ])
    )
  })

  it('rejects future scaffolding that omits request-to-record ownership before response or event write', () => {
    const unsafe = approvedFutureCertificateIssuanceScaffoldSketch
      .replace(
        `  const requestToRecordContinuity = await validateCertificateIssuanceLinkedRequestOwnership({
    recordParishId,
    linkedRequestParishMatchesRecord: true,
  })
`,
        ''
      )
      .replace('    requestToRecordContinuity,\n', '')

    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'request_to_record_ownership must appear before any certificate issuance scaffold response or event write'
        ),
      ])
    )
  })

  it('rejects future scaffolding that includes only partial markers for required issuance gates', () => {
    const partialGateMarkers = `
export async function POST(request: NextRequest) {
  const certificateIssuanceRuntimeGate = getCertificateIssuanceLoggingRuntimeGate({})
  const staff = await requireStaffFromRequest(request)
  const activeParishContext = {}
  const authorizedParishIds = []
  const target = await loadCertificateIssuanceLoggingTarget({})
  const requestToRecordContinuity = await validateCertificateIssuanceLinkedRequestOwnership({})
  const safeCertificateIssuanceAuditMetadata = buildCertificateIssuanceLoggingAuditMetadata({})
  const automationBoundary = assertNoCertificateAutomation({})
  const genericCertificateIssuanceBlockedReason = 'review unavailable'
  const rollback = certificateIssuanceRuntimeGate.rollbackNoop
  await writeCertificateIssuanceLoggingAuditEvent({ metadata: safeCertificateIssuanceAuditMetadata })
}
`

    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(partialGateMarkers)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('non_production_gate must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('active_parish_scope must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('membership_scope must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('record_ownership must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining(
          'request_to_record_ownership must appear before any certificate issuance scaffold response or event write'
        ),
        expect.stringContaining('safe_audit_metadata must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining(
          'forbidden_automation_blocking must appear before any certificate issuance scaffold response or event write'
        ),
        expect.stringContaining('generic_denial must appear before any certificate issuance scaffold response or event write'),
        expect.stringContaining('rollback_noop must appear before any certificate issuance scaffold response or event write'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all markers from one set')
  })

  it('rejects future scaffolding that exposes specific denial details instead of generic denial markers', () => {
    const unsafe = approvedFutureCertificateIssuanceScaffoldSketch
      .replace("'Certificate issuance logging unavailable.'", "'Record 123 belongs to another parish'")
      .replace("genericCertificateIssuanceBlockedReason: 'certificate_issuance_logging_unavailable',", '')
      .replace("genericCertificateIssuanceBlockedReason ?? 'certificate_issuance_logging_unavailable'", "'cross_parish_record_id_123'")

    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'generic_denial must appear before any certificate issuance scaffold response or event write'
        ),
      ])
    )
  })

  it('rejects future scaffolding that mutates records, generates certificates, calls AI, or uses storage', () => {
    const unsafe = approvedFutureCertificateIssuanceScaffoldSketch.replace(
      'await writeCertificateIssuanceLoggingAuditEvent({ metadata: safeCertificateIssuanceAuditMetadata })',
      "await supabase.from('sacramental_records').update({ notes: 'changed' })\n  await generateCertificate({ recordId })\n  await renderCertificatePdf({ recordId })\n  await openai.responses.create({ model: 'gpt-5-mini', input: prompt })\n  await createSignedUrl('private-doc')\n  await writeCertificateIssuanceLoggingAuditEvent({ metadata: safeCertificateIssuanceAuditMetadata })"
    )

    const result = validateFutureCertificateIssuanceLoggingRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual(
      expect.arrayContaining([
        ".from('sacramental_records').update",
        'generateCertificate(',
        'renderCertificatePdf(',
        'openai.responses.create',
        'createSignedUrl(',
      ])
    )
  })

  it('documents source-level preflight boundaries in Catholic records docs without exposing secrets', () => {
    const approvalPacket = readFileSync(approvalPacketPath, 'utf8')
    const preflightPlan = readFileSync(preflightPlanPath, 'utf8')
    const buildStatus = readFileSync(buildStatusPath, 'utf8')
    const roadmap = readFileSync(roadmapPath, 'utf8')
    const sourceOfTruth = readFileSync(sourceOfTruthPath, 'utf8')

    for (const required of [
      'Source-Level Preflight Tests',
      'lib/server/certificateIssuanceLoggingRuntimePreflight.ts',
      'lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts',
      'non-production gates',
      'authentication',
      'active-parish/membership scope',
      'request-to-record ownership',
      'audit metadata before writes',
      'forbidden certificate automation blocking',
      'generic denial states',
      'rollback/no-op behavior',
      'Each future gate must satisfy one complete marker set before any scaffold response or approved event write.',
      'A single partial marker',
      'not runtime enforcement',
    ]) {
      expect(preflightPlan).toContain(required)
    }

    expect(approvalPacket).toContain('Source-Level Preflight Tests')
    expect(approvalPacket).toContain('`lib/server/certificateIssuanceLoggingRuntimePreflight.ts`')
    expect(approvalPacket).toContain('`lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`')
    expect(approvalPacket).toContain('The source-level preflight must require complete marker sets for each gate.')
    expect(approvalPacket).toContain('A future scaffold must not pass by including only one partial marker')
    expect(buildStatus).toContain('Certificate Issuance Logging Runtime Source Preflight Prepared')
    expect(roadmap).toContain('Certificate Issuance Logging Runtime Source Preflight')
    expect(sourceOfTruth).toContain('Certificate Issuance Logging Runtime Source Preflight')

    for (const document of [approvalPacket, preflightPlan]) {
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
        expect(document).not.toContain(forbidden)
      }
    }
  })
})
