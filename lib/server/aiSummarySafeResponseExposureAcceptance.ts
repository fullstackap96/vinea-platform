export const AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG =
  'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE'
export const AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK =
  'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK'
export const AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE = 'ENABLED'
export const AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE =
  'APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE'

export type AiSummarySafeResponseExposureSourceValidation = {
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

export function validateFutureAiSummarySafeResponseExposureSource(
  source: string
): AiSummarySafeResponseExposureSourceValidation {
  const requiredMarkers = [
    'const staff = await requireStaffFromRequest(request)',
    'const gate = getAiSummarySafetyRuntimeGate()',
    'const scaffold = buildAiSummaryRuntimeScaffold(gate)',
    'const safetyChain = await buildAiSummarySafetyChainAdapter',
    'process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE',
    'process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE',
    'validateAiSummaryAuditEventForSafeWrite(',
    'await writeAuditEvent',
    'safeAuditMetadataWritten = true',
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE',
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
    "scaffold.selectedPath === 'legacy_staff_gated_summary_route'",
    'safetyChain.ok',
    'safetyChain.responseScaffold.sourceDisplay',
    'safetyChain.responseScaffold.staffReview',
    "error: 'ai_retrieval_unavailable'",
  ]
  const forbiddenMarkers = [
    'openai.responses.create',
    ".from('audit_events').insert",
    'safetyChain.promptAssembly',
    'promptAssembly:',
    'auditPreparation:',
    'futureAuditEvent:',
    'rawPrompt',
    'rawOutput',
    'providerPayload',
    'tokenMaterial',
    'generatedOutput',
    'privateMaterialPolicy',
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
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE',
    'validateAiSummaryAuditEventForSafeWrite(',
    orderingFailures
  )
  expectBefore(
    source,
    'validateAiSummaryAuditEventForSafeWrite(',
    'await writeAuditEvent',
    orderingFailures
  )
  expectBefore(
    source,
    'await writeAuditEvent',
    'safeAuditMetadataWritten = true',
    orderingFailures
  )
  expectBefore(
    source,
    'safeAuditMetadataWritten = true',
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE',
    'safetyChain.responseScaffold.sourceDisplay',
    orderingFailures
  )
  expectBefore(
    source,
    'process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] === AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE',
    'safetyChain.responseScaffold.staffReview',
    orderingFailures
  )

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
