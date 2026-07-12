import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateFutureSacramentalRecordRevisionRuntimeSource } from './sacramentalRecordRevisionRuntimePreflight'

const root = process.cwd()
const approvalPacketPath = join(root, 'docs', 'SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md')
const evidenceTemplatePath = join(
  root,
  'docs',
  'SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md'
)
const preflightPlanPath = join(
  root,
  'docs',
  'SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702.md'
)

const approvedFutureCorrectionScaffoldSketch = `
import { getSacramentalRecordRevisionRuntimeGate } from '@/lib/server/sacramentalRecordRevisionRuntimeGate'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'

export async function POST(request: NextRequest) {
  const revisionRuntimeGate = getSacramentalRecordRevisionRuntimeGate({
    ack: process.env.VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK,
    expectedAck: 'APPROVED_SACRAMENTAL_RECORD_REVISION_QA',
  })
  if (!revisionRuntimeGate.enabled) return returnRevisionRuntimeUnavailable({ rollbackNoop: revisionRuntimeGate.rollbackNoop })
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return NextResponse.json({ ok: false, error: 'Revision review unavailable.' }, { status: 401 })
  const activeParishContext = await resolveActiveStaffParishContext(staff.supabase, {
    requestedParishId: request.cookies.get('vinea_active_parish_id')?.value,
  })
  const activeParishId = activeParishContext.activeParishId
  const authorizedParishIds = activeParishContext.authorizedParishIds
  const target = await loadSacramentalRecordRevisionTarget({ activeParishId })
  const recordParishId = target.record.parish_id
  const recordBelongsToActiveParish = recordParishId === activeParishId
  const requestToRecordContinuity = await validateRevisionLinkedRequestOwnership({
    recordParishId,
    linkedRequestParishMatchesRecord: true,
  })
  const safeRevisionAuditMetadata = buildSacramentalRecordRevisionAuditMetadata({
    featureId: 'sacramental_record_revision_v1',
    eventAction: 'sacramental_record_correction_reviewed',
    activeParishId,
    authorizedParishIds,
    requestToRecordContinuity,
    genericRevisionBlockedReason: 'sacramental_record_revision_unavailable',
  })
  const mutationBoundary = assertNoSacramentalRecordMutation({
    mutatesSacramentalRecord: false,
    automaticRegisterMutationBlocked: true,
    generatesCertificateAutomatically: false,
    runtimePersistenceApproved: false,
  })
  if (!recordBelongsToActiveParish || !mutationBoundary.ok) {
    return NextResponse.json({ ok: false, error: genericRevisionBlockedReason ?? 'sacramental_record_revision_unavailable' }, { status: 403 })
  }
  await writeSacramentalRecordRevisionAuditEvent({ metadata: safeRevisionAuditMetadata })
  returnRevisionScaffoldResponse({ ok: true, metadata: safeRevisionAuditMetadata, runtimePersistenceApproved: false })
}
`

describe('sacramental record revision runtime preflight', () => {
  it('accepts a future correction/notation scaffold only when every gate appears before scaffold response or event write', () => {
    const result = validateFutureSacramentalRecordRevisionRuntimeSource(approvedFutureCorrectionScaffoldSketch)

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
      'forbidden_mutation_blocking',
      'generic_denial',
      'rollback_noop',
    ])
    expect(result.gates.every((gate) => gate.ok && gate.markerIndex < result.firstSensitiveActionIndex)).toBe(true)
  })

  it('rejects future scaffolding that writes audit/event metadata before active parish, ownership, and audit safeguards', () => {
    const unsafe = approvedFutureCorrectionScaffoldSketch.replace(
      'const activeParishContext = await resolveActiveStaffParishContext',
      'await writeSacramentalRecordRevisionAuditEvent({ metadata: unsafeMetadata })\n  const activeParishContext = await resolveActiveStaffParishContext'
    )

    const result = validateFutureSacramentalRecordRevisionRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('active_parish_scope must appear before any revision scaffold response or event write'),
        expect.stringContaining('record_ownership must appear before any revision scaffold response or event write'),
        expect.stringContaining('safe_audit_metadata must appear before any revision scaffold response or event write'),
      ])
    )
  })

  it('rejects future scaffolding that omits request-to-record ownership checks before response or event write', () => {
    const unsafe = approvedFutureCorrectionScaffoldSketch
      .replace(
        `  const requestToRecordContinuity = await validateRevisionLinkedRequestOwnership({
    recordParishId,
    linkedRequestParishMatchesRecord: true,
  })
`,
        ''
      )
      .replace('    requestToRecordContinuity,\n', '')

    const result = validateFutureSacramentalRecordRevisionRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'request_to_record_ownership must appear before any revision scaffold response or event write'
        ),
      ])
    )
  })

  it('rejects future scaffolding that includes only partial markers for required revision gates', () => {
    const partialGateMarkers = `
export async function POST(request: NextRequest) {
  const revisionRuntimeGate = getSacramentalRecordRevisionRuntimeGate({})
  const staff = await requireStaffFromRequest(request)
  const activeParishContext = {}
  const authorizedParishIds = []
  const target = await loadSacramentalRecordRevisionTarget({})
  const requestToRecordContinuity = await validateRevisionLinkedRequestOwnership({})
  const safeRevisionAuditMetadata = buildSacramentalRecordRevisionAuditMetadata({})
  const mutationBoundary = assertNoSacramentalRecordMutation({})
  const genericRevisionBlockedReason = 'review unavailable'
  const rollback = revisionRuntimeGate.rollbackNoop
  await writeSacramentalRecordRevisionAuditEvent({ metadata: safeRevisionAuditMetadata })
}
`

    const result = validateFutureSacramentalRecordRevisionRuntimeSource(partialGateMarkers)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('non_production_gate must appear before any revision scaffold response or event write'),
        expect.stringContaining('active_parish_scope must appear before any revision scaffold response or event write'),
        expect.stringContaining('membership_scope must appear before any revision scaffold response or event write'),
        expect.stringContaining('record_ownership must appear before any revision scaffold response or event write'),
        expect.stringContaining(
          'request_to_record_ownership must appear before any revision scaffold response or event write'
        ),
        expect.stringContaining('safe_audit_metadata must appear before any revision scaffold response or event write'),
        expect.stringContaining(
          'forbidden_mutation_blocking must appear before any revision scaffold response or event write'
        ),
        expect.stringContaining('generic_denial must appear before any revision scaffold response or event write'),
        expect.stringContaining('rollback_noop must appear before any revision scaffold response or event write'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all markers from one set')
  })

  it('rejects future scaffolding that exposes specific denial details instead of generic denial markers', () => {
    const unsafe = approvedFutureCorrectionScaffoldSketch
      .replace("'Revision review unavailable.'", "'Record 123 belongs to another parish'")
      .replace("genericRevisionBlockedReason: 'sacramental_record_revision_unavailable',", '')
      .replace("genericRevisionBlockedReason ?? 'sacramental_record_revision_unavailable'", "'cross_parish_record_id_123'")

    const result = validateFutureSacramentalRecordRevisionRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('generic_denial must appear before any revision scaffold response or event write'),
      ])
    )
  })

  it('rejects future scaffolding that tries to mutate registers, generate certificates, call AI, or use storage before review', () => {
    const unsafe = approvedFutureCorrectionScaffoldSketch.replace(
      'await writeSacramentalRecordRevisionAuditEvent({ metadata: safeRevisionAuditMetadata })',
      "await supabase.from('sacramental_records').update({ notes: 'changed' })\n  await generateCertificate({ recordId })\n  await openai.responses.create({ model: 'gpt-5-mini', input: prompt })\n  await createSignedUrl('private-doc')\n  await writeSacramentalRecordRevisionAuditEvent({ metadata: safeRevisionAuditMetadata })"
    )

    const result = validateFutureSacramentalRecordRevisionRuntimeSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual(
      expect.arrayContaining([
        ".from('sacramental_records').update",
        'generateCertificate(',
        'openai.responses.create',
        'createSignedUrl(',
      ])
    )
  })

  it('documents source-level preflight boundaries in the approval packet, QA evidence template, and preflight plan', () => {
    const approvalPacket = readFileSync(approvalPacketPath, 'utf8')
    const evidenceTemplate = readFileSync(evidenceTemplatePath, 'utf8')
    const preflightPlan = readFileSync(preflightPlanPath, 'utf8')

    for (const required of [
      'Source-Level Preflight Tests',
      'lib/server/sacramentalRecordRevisionRuntimePreflight.ts',
      'lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts',
      'non-production gates',
      'authentication',
      'active-parish/membership scope',
      'request-to-record ownership',
      'audit metadata before writes',
      'forbidden mutation blocking',
      'generic denial states',
      'rollback/no-op behavior',
      'Each future gate must satisfy one complete marker set before any scaffold response or approved event write.',
      'A single partial marker',
      'not runtime enforcement',
    ]) {
      expect(preflightPlan).toContain(required)
    }

    expect(approvalPacket).toContain('`lib/server/sacramentalRecordRevisionPreflight.test.ts`')
    expect(approvalPacket).toContain('Safe audit metadata')
    expect(evidenceTemplate).toContain('Safe Audit Metadata Checks')
    expect(evidenceTemplate).toContain('Forbidden Mutation Checks')
    expect(evidenceTemplate).toContain('Rollback Verification')
  })
})
