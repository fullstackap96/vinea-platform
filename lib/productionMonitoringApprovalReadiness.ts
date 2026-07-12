import {
  buildMonitoringSupportReadiness,
  type MonitoringSupportOwnerIntake,
} from './monitoringSupportOwnerReadiness'
import {
  buildProductionMonitoringRedactionSmokeCases,
  type ProductionMonitoringRedactionSmokeCaseId,
} from './productionMonitoringRedactionSmokeCases'

export type ProductionMonitoringReviewStatus =
  | 'PENDING'
  | 'READY'
  | 'REVIEWED'
  | 'APPROVED'
  | 'PASSED'
  | 'CONFIRMED'
  | 'BLOCKED'
  | 'FAILED'

export type ProductionMonitoringApprovalReadinessInput = {
  ownerIntake: MonitoringSupportOwnerIntake
  ownerIntakeWorksheetStatus: ProductionMonitoringReviewStatus
  ownerIntakeValidationStatus: ProductionMonitoringReviewStatus
  runtimeImplementationPacketStatus: ProductionMonitoringReviewStatus
  runtimeSourcePreflightStatus: ProductionMonitoringReviewStatus
  redactionSmokeQaPacketStatus: ProductionMonitoringReviewStatus
  smokeEvidenceTemplateStatus: ProductionMonitoringReviewStatus
  redactionSmokeCaseIds: readonly ProductionMonitoringRedactionSmokeCaseId[]
  productionMonitoringNoGoConfirmed: boolean
  productionSmokeNoGoConfirmed: boolean
  publicTrustClaimsNoGoConfirmed: boolean
}

export type ProductionMonitoringApprovalReadinessResult = {
  readyForRuntimeScaffoldApprovalRequest: boolean
  readyForRedactionSmokeApprovalRequest: boolean
  missingRequiredItems: string[]
  unsafeLabelFindings: string[]
  requiredRedactionSmokeCaseIds: ProductionMonitoringRedactionSmokeCaseId[]
  coveredRedactionSmokeCaseIds: ProductionMonitoringRedactionSmokeCaseId[]
  missingRedactionSmokeCaseIds: ProductionMonitoringRedactionSmokeCaseId[]
  productionNoGoBoundaries: string[]
  nextSafeAction: string
}

const REQUIRED_REVIEW_STATUSES: ReadonlyArray<{
  key: keyof Omit<
    ProductionMonitoringApprovalReadinessInput,
    | 'ownerIntake'
    | 'redactionSmokeCaseIds'
    | 'productionMonitoringNoGoConfirmed'
    | 'productionSmokeNoGoConfirmed'
    | 'publicTrustClaimsNoGoConfirmed'
  >
  label: string
  allowed: readonly ProductionMonitoringReviewStatus[]
}> = [
  {
    key: 'ownerIntakeWorksheetStatus',
    label: 'owner intake worksheet',
    allowed: ['READY', 'REVIEWED', 'APPROVED'],
  },
  {
    key: 'ownerIntakeValidationStatus',
    label: 'owner intake validation',
    allowed: ['PASSED'],
  },
  {
    key: 'runtimeImplementationPacketStatus',
    label: 'runtime implementation approval packet',
    allowed: ['REVIEWED', 'APPROVED'],
  },
  {
    key: 'runtimeSourcePreflightStatus',
    label: 'runtime source preflight',
    allowed: ['REVIEWED', 'PASSED'],
  },
  {
    key: 'redactionSmokeQaPacketStatus',
    label: 'non-production redaction-smoke QA packet',
    allowed: ['REVIEWED', 'APPROVED'],
  },
  {
    key: 'smokeEvidenceTemplateStatus',
    label: 'smoke evidence template',
    allowed: ['APPROVED', 'REVIEWED'],
  },
]

export function buildProductionMonitoringApprovalReadiness(
  input: ProductionMonitoringApprovalReadinessInput,
): ProductionMonitoringApprovalReadinessResult {
  const ownerReadiness = buildMonitoringSupportReadiness(input.ownerIntake)
  const missingRequiredItems = [...ownerReadiness.missingRequiredLabels]

  for (const status of REQUIRED_REVIEW_STATUSES) {
    if (!status.allowed.includes(input[status.key])) {
      missingRequiredItems.push(
        `${status.label} must be ${status.allowed.join(' or ')}`,
      )
    }
  }

  if (!input.productionMonitoringNoGoConfirmed) {
    missingRequiredItems.push('production monitoring NO-GO confirmation')
  }

  if (!input.productionSmokeNoGoConfirmed) {
    missingRequiredItems.push('production smoke NO-GO confirmation')
  }

  if (!input.publicTrustClaimsNoGoConfirmed) {
    missingRequiredItems.push('public trust-center claims NO-GO confirmation')
  }

  const requiredRedactionSmokeCaseIds =
    buildProductionMonitoringRedactionSmokeCases().map((smokeCase) => smokeCase.id)
  const coveredRedactionSmokeCaseIds = uniqueCaseIds(input.redactionSmokeCaseIds)
  const missingRedactionSmokeCaseIds = requiredRedactionSmokeCaseIds.filter(
    (id) => !coveredRedactionSmokeCaseIds.includes(id),
  )

  if (missingRedactionSmokeCaseIds.length > 0) {
    missingRequiredItems.push(
      `redaction smoke case coverage missing: ${missingRedactionSmokeCaseIds.join(
        ', ',
      )}`,
    )
  }

  const readyForRuntimeScaffoldApprovalRequest =
    missingRequiredItems.length === 0 &&
    ownerReadiness.unsafeLabelFindings.length === 0

  return {
    readyForRuntimeScaffoldApprovalRequest,
    readyForRedactionSmokeApprovalRequest: false,
    missingRequiredItems,
    unsafeLabelFindings: ownerReadiness.unsafeLabelFindings,
    requiredRedactionSmokeCaseIds,
    coveredRedactionSmokeCaseIds,
    missingRedactionSmokeCaseIds,
    productionNoGoBoundaries: [
      'Production monitoring runtime remains NO-GO until the product owner explicitly approves runtime scaffolding.',
      'Production smoke remains NO-GO until runtime scaffolding exists, non-production redaction smoke passes, owners sign off, and a separate production-safe smoke approval is given.',
      'Public trust-center monitoring claims remain NO-GO until production evidence and claim review are complete.',
      'This readiness gate does not send monitoring events, wire providers, page staff, create incidents, contact customers, access production, apply migrations, mutate records, run exports, call AI, access storage, create signed URLs, or change operational RLS.',
    ],
    nextSafeAction: readyForRuntimeScaffoldApprovalRequest
      ? 'Request explicit product-owner approval for non-production runtime monitoring scaffolding using the exact approval language in the runtime implementation approval packet.'
      : 'Complete the missing label-only owner, evidence, status, NO-GO, and redaction-smoke coverage items before requesting runtime scaffolding approval.',
  }
}

function uniqueCaseIds(
  ids: readonly ProductionMonitoringRedactionSmokeCaseId[],
): ProductionMonitoringRedactionSmokeCaseId[] {
  return [...new Set(ids)]
}
