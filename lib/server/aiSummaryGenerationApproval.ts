export const AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG =
  'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION'
export const AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK =
  'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK'
export const AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE = 'ENABLED'
export const AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE =
  'APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION'

export type AiSummaryGenerationApprovalSourceValidation = {
  readonly ok: boolean
  readonly missingRequiredMarkers: readonly string[]
  readonly forbiddenMarkersPresent: readonly string[]
  readonly orderingFailures: readonly string[]
}

function markerIndex(source: string, marker: string): number {
  return source.indexOf(marker)
}

function expectBefore(
  source: string,
  earlier: string,
  later: string,
  failures: string[]
): void {
  const earlierIndex = markerIndex(source, earlier)
  const laterIndex = markerIndex(source, later)

  if (earlierIndex < 0 || laterIndex < 0) return
  if (earlierIndex >= laterIndex) {
    failures.push(`${earlier} must appear before ${later}`)
  }
}

export function validateFutureAiSummaryGenerationSource(
  source: string
): AiSummaryGenerationApprovalSourceValidation {
  const requiredMarkers = [
    'const staff = await requireStaffFromRequest(request)',
    'const gate = getAiSummarySafetyRuntimeGate()',
    'const scaffold = buildAiSummaryRuntimeScaffold(gate)',
    "scaffold.selectedPath === 'legacy_staff_gated_summary_route'",
    'const safetyChain = await buildAiSummarySafetyChainAdapter',
    'process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE',
    'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE',
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
    'process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] === AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE',
    'process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] === AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE',
    'safetyChain.ok',
    "safetyChain.auditPreparation.writeStatus === 'not_written'",
    'validateAiSummaryAuditEventForSafeWrite(',
    'safeAuditMetadataWritten = await writeAuditEvent',
    'openai.responses.create',
    'input: safetyChain.promptAssembly.prompt',
    'sourceDisplay: safetyChain.responseScaffold.sourceDisplay',
    'staffReview: safetyChain.responseScaffold.staffReview',
  ]
  const forbiddenMarkers = [
    'input: body',
    'input: prompt',
    'buildLegacySummaryPrompt(body',
    'promptAssembly:',
    'auditPreparation:',
    'futureAuditEvent:',
    'rawPrompt',
    'rawOutput',
    'providerPayload',
    'tokenMaterial',
    'internalNoteBody',
    'documentContents',
    'privateMaterialPolicy',
    'generatedOutput:',
  ]

  const missingRequiredMarkers = requiredMarkers.filter((marker) => !source.includes(marker))
  const forbiddenMarkersPresent = forbiddenMarkers.filter((marker) => source.includes(marker))
  const orderingFailures: string[] = []

  expectBefore(
    source,
    'const staff = await requireStaffFromRequest(request)',
    'const gate = getAiSummarySafetyRuntimeGate()',
    orderingFailures
  )
  const auditAssignmentMarker = 'safeAuditMetadataWritten = await writeAuditEvent'
  const auditAssignmentIndex = markerIndex(source, auditAssignmentMarker)
  const auditResultCheckIndex =
    auditAssignmentIndex < 0
      ? -1
      : source.indexOf('safeAuditMetadataWritten', auditAssignmentIndex + auditAssignmentMarker.length)
  const generationIndex = markerIndex(source, 'openai.responses.create')
  if (
    auditAssignmentIndex >= 0 &&
    (auditResultCheckIndex < 0 || (generationIndex >= 0 && auditResultCheckIndex >= generationIndex))
  ) {
    orderingFailures.push(
      'safeAuditMetadataWritten must be checked before openai.responses.create',
    )
  }
  expectBefore(
    source,
    'const gate = getAiSummarySafetyRuntimeGate()',
    'const scaffold = buildAiSummaryRuntimeScaffold(gate)',
    orderingFailures
  )
  expectBefore(
    source,
    'const scaffold = buildAiSummaryRuntimeScaffold(gate)',
    'const safetyChain = await buildAiSummarySafetyChainAdapter',
    orderingFailures
  )
  expectBefore(
    source,
    'const safetyChain = await buildAiSummarySafetyChainAdapter',
    'process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
    'safeAuditMetadataWritten = await writeAuditEvent',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
    'openai.responses.create',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] === AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE',
    'openai.responses.create',
    orderingFailures
  )
  expectBefore(
    source,
    'validateAiSummaryAuditEventForSafeWrite(',
    'safeAuditMetadataWritten = await writeAuditEvent',
    orderingFailures
  )
  expectBefore(
    source,
    'safeAuditMetadataWritten = await writeAuditEvent',
    'openai.responses.create',
    orderingFailures,
  )
  expectBefore(source, 'openai.responses.create', 'sourceDisplay: safetyChain.responseScaffold.sourceDisplay', orderingFailures)
  expectBefore(source, 'openai.responses.create', 'staffReview: safetyChain.responseScaffold.staffReview', orderingFailures)

  return {
    ok:
      missingRequiredMarkers.length === 0 &&
      forbiddenMarkersPresent.length === 0 &&
      orderingFailures.length === 0,
    missingRequiredMarkers,
    forbiddenMarkersPresent,
    orderingFailures,
  }
}
