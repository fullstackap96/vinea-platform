import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type ProductionMonitoringEvidencePackageConsistencyDecision =
  | 'READY_FOR_RUNTIME_APPROVAL_REVIEW'
  | 'NEEDS_ATTENTION'

export type ProductionMonitoringEvidencePackageArtifactKind =
  | 'doc'
  | 'source'

export type ProductionMonitoringEvidencePackageArtifact = {
  path: string
  kind: ProductionMonitoringEvidencePackageArtifactKind
  requiredBeforeRuntimeApproval: boolean
}

export type ProductionMonitoringEvidencePackageConsistencyFinding = {
  code:
    | 'MISSING_INDEX_LINK'
    | 'MISSING_FILE'
    | 'MISSING_INDEX_BOUNDARY'
    | 'MISSING_DEPENDENCY_STEP'
    | 'MISSING_NO_GO_BOUNDARY'
    | 'MISSING_REVIEW_CHECK'
    | 'MISSING_HUMAN_INPUT'
    | 'MISSING_ARTIFACT_BOUNDARY'
    | 'UNSAFE_SECRET_LIKE_VALUE'
  path?: string
  message: string
}

export type ProductionMonitoringEvidencePackageConsistencyReport = {
  schemaVersion: 1
  decision: ProductionMonitoringEvidencePackageConsistencyDecision
  productionMonitoringEnabled: false
  productionSmokeApproved: false
  publicTrustClaimsApproved: false
  indexPath: string
  requiredArtifactCount: number
  referenceArtifactCount: number
  linkedArtifactCount: number
  existingArtifactCount: number
  boundaryCount: number
  dependencyStepCount: number
  noGoBoundaryCount: number
  reviewCheckCount: number
  humanInputCount: number
  artifactBoundaryCount: number
  findings: ProductionMonitoringEvidencePackageConsistencyFinding[]
}

const INDEX_PATH = 'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md'

export const PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS = [
  {
    path: 'docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/observabilityEvent.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/observabilityRuntimePreflight.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/supportEscalationMatrix.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/monitoringSupportOwnerReadiness.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionMonitoringRuntimePreflight.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/productionMonitoringApprovalReadiness.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_REDACTION_SMOKE_CASE_MATRIX_20260706.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'lib/productionMonitoringRedactionSmokeCases.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SAFE_EVENT_CONTRACT_20260706.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionMonitoringEvidencePackageConsistency.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
] satisfies ProductionMonitoringEvidencePackageArtifact[]

const INDEX_BOUNDARY_STRINGS = [
  'Status: Prepared as a non-runtime evidence package index.',
  'This index does not implement runtime monitoring',
  'enable production monitoring',
  'add production flags',
  'wire an external observability vendor',
  'page staff',
  'create incidents',
  'notify customers',
  'access production',
  'apply migrations',
  'change operational RLS',
  'mutate records',
  'touch Google Calendar data',
  'run exports',
  'call AI',
  'make public trust claims',
  'Current production monitoring decision: `NO-GO`',
]

const DEPENDENCY_STEPS = [
  'Fill `docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md` with non-secret labels.',
  'Validate the filled intake with `lib/monitoringSupportOwnerReadiness.ts`.',
  'Fill `docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md`.',
  'Run `lib/productionMonitoringApprovalReadiness.ts` against the filled label-only owner/status inputs and confirm it is ready for runtime scaffold approval request.',
  'Product owner, security/data owner, monitoring owner, support owner, rollback owner, evidence owner, and technical lead review this index.',
  'Product owner may approve non-production runtime scaffolding using the exact language in `docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md`.',
  'Future runtime code must pass `lib/server/productionMonitoringRuntimePreflight.ts`.',
  'Product owner may approve non-production redaction smoke using the exact language in `docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md`.',
  'Non-production redaction smoke fills `docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md`.',
  'Production-safe smoke remains a separate approval.',
  'Production enablement remains a separate approval after completed smoke evidence and owner sign-off.',
]

const NO_GO_BOUNDARY_STRINGS = [
  'Production monitoring runtime implementation.',
  'Production monitoring enablement.',
  'Production smoke testing.',
  'External provider wiring.',
  'Paging or incident creation.',
  'Customer communication automation.',
  'Production exports.',
  'Production public intake routing.',
  'Production membership-aware operational RLS promotion.',
  'Customer-facing AI.',
  'Backup/restore public claims.',
  'Public trust-center monitoring claims.',
  'MFA/SSO/RBAC changes.',
  'Migrations or operational RLS changes.',
]

const REVIEW_CHECK_STRINGS = [
  'The owner intake worksheet is filled with labels only.',
  'The owner intake validation reports no missing or unsafe labels.',
  'The owner readiness completion worksheet maps every required owner and fixture label.',
  'The support escalation matrix has an owner route for each smoke case.',
  'The non-production redaction-smoke QA packet is understood by the monitoring owner, security/data owner, rollback owner, and evidence owner.',
  'The smoke evidence template is approved for use.',
  '`lib/productionMonitoringApprovalReadiness.ts` reports ready before runtime scaffold approval is requested.',
  'Production monitoring remains `NO-GO`.',
  'Public trust-center monitoring claims remain `NO-GO`.',
]

const HUMAN_INPUT_STRINGS = [
  'Support owner label.',
  'Monitoring owner label.',
  'Rollback owner label.',
  'Security/data owner label.',
  'Incident commander label.',
  'Technical lead label.',
  'Customer communications owner label.',
  'Legal/data owner label.',
  'Evidence owner label.',
  'Support coverage window label.',
  'Escalation channel label.',
  'Backup escalation channel label.',
  'Monitoring tool label.',
  'Rollback method label.',
  'Evidence storage label.',
  'Non-production app target label.',
  'Non-production smoke fixture labels.',
  'Approval status labels.',
]

const ARTIFACT_BOUNDARY_STRINGS = [
  {
    path: 'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    expected: [
      'Current production monitoring decision: `NO-GO`',
      '## Exact Candidate Implementation Files',
      '## Disabled-By-Default Gates',
      '## Non-Production Redaction Smoke Requirements',
      '## Production-Safe Smoke Boundaries',
      '## Runtime Safety Requirements',
      '## Rollback / No-Op Behavior',
      '## Customer Communication Boundaries',
      '## Production NO-GO Criteria',
      'I approve non-production implementation of production monitoring runtime scaffolding only',
    ],
  },
  {
    path: 'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    expected: [
      'Current production monitoring decision: `NO-GO`',
      'Do not run this QA packet until all preconditions are true:',
      'Runtime implementation passes `lib/server/productionMonitoringRuntimePreflight.ts`.',
      'Use labels only. Do not paste secrets',
      'Evidence must be label-only',
      'Passing this non-production redaction smoke does not approve production monitoring',
      'I approve running the non-production production-monitoring redaction smoke QA packet only',
    ],
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
    expected: [
      '## Environment Identity',
      '## Owner Labels',
      '## Flag States',
      '## Safe Fixture Labels',
      '## Redaction Checks',
      '## Rollback Verification',
      '## Customer Communication Boundary Confirmation',
      '## Production Claim Boundary',
      'does not approve public trust-center claims',
    ],
  },
  {
    path: 'lib/server/productionMonitoringRuntimePreflight.ts',
    expected: [
      'PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION',
      'validateFutureProductionMonitoringRuntimeSource',
      'disabled_by_default_gate',
      'environment_scope_gate',
      'redaction_dto_gate',
      'forbidden_payload_gate',
      'owner_support_labels_gate',
      'rollback_noop_gate',
      'customer_communication_boundary_gate',
      'EXTERNAL_SEND_MARKERS',
      'FORBIDDEN_RUNTIME_MARKERS',
      'allMarkersBeforeIndex',
      'Expected all of',
    ],
  },
]

const SECRET_LIKE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /dsn\s*=\s*https?:\/\/[^`\s<\[]+/i,
]

function readRepoFile(repoRoot: string, relativePath: string) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(repoRoot: string, relativePath: string) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
}

function includesAll(
  source: string,
  expected: string[],
  code: ProductionMonitoringEvidencePackageConsistencyFinding['code'],
  findings: ProductionMonitoringEvidencePackageConsistencyFinding[]
) {
  let count = 0

  for (const item of expected) {
    if (source.includes(item)) {
      count += 1
    } else {
      findings.push({
        code,
        message: `Missing required production monitoring package text: ${item}`,
      })
    }
  }

  return count
}

function findSecretLikeValues(path: string, contents: string) {
  return SECRET_LIKE_PATTERNS.flatMap((pattern) => {
    const match = contents.match(pattern)

    if (!match) {
      return []
    }

    return [
      {
        code: 'UNSAFE_SECRET_LIKE_VALUE' as const,
        path,
        message: `Found a secret-like value in ${path}; replace it with a non-secret label before approval review.`,
      },
    ]
  })
}

export function checkProductionMonitoringEvidencePackageConsistency(
  repoRoot = process.cwd()
): ProductionMonitoringEvidencePackageConsistencyReport {
  const findings: ProductionMonitoringEvidencePackageConsistencyFinding[] = []
  const index = readRepoFile(repoRoot, INDEX_PATH)

  const boundaryCount = includesAll(
    index,
    INDEX_BOUNDARY_STRINGS,
    'MISSING_INDEX_BOUNDARY',
    findings
  )
  const dependencyStepCount = includesAll(
    index,
    DEPENDENCY_STEPS,
    'MISSING_DEPENDENCY_STEP',
    findings
  )
  const noGoBoundaryCount = includesAll(
    index,
    NO_GO_BOUNDARY_STRINGS,
    'MISSING_NO_GO_BOUNDARY',
    findings
  )
  const reviewCheckCount = includesAll(
    index,
    REVIEW_CHECK_STRINGS,
    'MISSING_REVIEW_CHECK',
    findings
  )
  const humanInputCount = includesAll(
    index,
    HUMAN_INPUT_STRINGS,
    'MISSING_HUMAN_INPUT',
    findings
  )

  let artifactBoundaryCount = 0

  let linkedArtifactCount = 0
  let existingArtifactCount = 0

  for (const artifact of PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS) {
    if (index.includes(artifact.path)) {
      linkedArtifactCount += 1
    } else {
      findings.push({
        code: 'MISSING_INDEX_LINK',
        path: artifact.path,
        message: `Production monitoring evidence package index does not link ${artifact.path}.`,
      })
    }

    if (repoPathExists(repoRoot, artifact.path)) {
      existingArtifactCount += 1

      if (artifact.kind === 'doc') {
        findings.push(
          ...findSecretLikeValues(artifact.path, readRepoFile(repoRoot, artifact.path))
        )
      }
    } else {
      findings.push({
        code: 'MISSING_FILE',
        path: artifact.path,
        message: `Production monitoring evidence package artifact does not exist: ${artifact.path}.`,
      })
    }
  }

  for (const artifactBoundary of ARTIFACT_BOUNDARY_STRINGS) {
    if (!repoPathExists(repoRoot, artifactBoundary.path)) {
      continue
    }

    artifactBoundaryCount += includesAll(
      readRepoFile(repoRoot, artifactBoundary.path),
      artifactBoundary.expected,
      'MISSING_ARTIFACT_BOUNDARY',
      findings
    )
  }

  return {
    schemaVersion: 1,
    decision:
      findings.length === 0
        ? 'READY_FOR_RUNTIME_APPROVAL_REVIEW'
        : 'NEEDS_ATTENTION',
    productionMonitoringEnabled: false,
    productionSmokeApproved: false,
    publicTrustClaimsApproved: false,
    indexPath: INDEX_PATH,
    requiredArtifactCount:
      PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.filter(
        (artifact) => artifact.requiredBeforeRuntimeApproval
      ).length,
    referenceArtifactCount:
      PRODUCTION_MONITORING_EVIDENCE_PACKAGE_ARTIFACTS.filter(
        (artifact) => !artifact.requiredBeforeRuntimeApproval
      ).length,
    linkedArtifactCount,
    existingArtifactCount,
    boundaryCount,
    dependencyStepCount,
    noGoBoundaryCount,
    reviewCheckCount,
    humanInputCount,
    artifactBoundaryCount,
    findings,
  }
}
