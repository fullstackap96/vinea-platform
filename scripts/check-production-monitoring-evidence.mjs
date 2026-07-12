import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()
const indexPath = 'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md'

const artifacts = [
  {
    path: 'docs/PRODUCTION_OBSERVABILITY_READINESS_PLAN_20260702.md',
    requiredBeforeRuntimeApproval: true,
  },
  { path: 'lib/observabilityEvent.ts', requiredBeforeRuntimeApproval: true },
  {
    path: 'lib/server/observabilityRuntimePreflight.ts',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_SUPPORT_ESCALATION_MATRIX_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  { path: 'lib/supportEscalationMatrix.ts', requiredBeforeRuntimeApproval: true },
  {
    path: 'docs/PRODUCTION_MONITORING_SUPPORT_OWNER_INTAKE_WORKSHEET_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/monitoringSupportOwnerReadiness.ts',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_APPROVAL_PACKET_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionMonitoringRuntimePreflight.ts',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_OWNER_READINESS_COMPLETION_WORKSHEET_20260705.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_RUNTIME_APPROVAL_READINESS_GATE_20260706.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/productionMonitoringApprovalReadiness.ts',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_REDACTION_SMOKE_CASE_MATRIX_20260706.md',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'lib/productionMonitoringRedactionSmokeCases.ts',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_SAFE_EVENT_CONTRACT_20260706.md',
    requiredBeforeRuntimeApproval: false,
  },
  {
    path: 'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionMonitoringEvidencePackageConsistency.ts',
    requiredBeforeRuntimeApproval: true,
  },
]

const indexRequiredPhrases = [
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
  'Production-safe smoke remains a separate approval.',
  'Production enablement remains a separate approval after completed smoke evidence and owner sign-off.',
]

const criticalArtifactPhrases = {
  'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md': [
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
  'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md': [
    'Current production monitoring decision: `NO-GO`',
    'Do not run this QA packet until all preconditions are true:',
    'Runtime implementation passes `lib/server/productionMonitoringRuntimePreflight.ts`.',
    'Use labels only. Do not paste secrets',
    'Evidence must be label-only',
    'Passing this non-production redaction smoke does not approve production monitoring',
    'I approve running the non-production production-monitoring redaction smoke QA packet only',
  ],
  'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md': [
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
  'lib/server/productionMonitoringRuntimePreflight.ts': [
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
}

const secretLikePatterns = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /dsn\s*=\s*https?:\/\/[^`\s<\[]+/i,
]

function repoPath(relativePath) {
  return join(repoRoot, ...relativePath.split('/'))
}

function pathExists(relativePath) {
  return existsSync(repoPath(relativePath))
}

function readRepoFile(relativePath) {
  return readFileSync(repoPath(relativePath), 'utf8')
}

function findSecretLikeValues(path, contents) {
  return secretLikePatterns.flatMap((pattern) =>
    pattern.test(contents)
      ? [
          {
            code: 'UNSAFE_SECRET_LIKE_VALUE',
            path,
            message: `Found a secret-like value in ${path}; replace it with a label-only placeholder before monitoring approval review.`,
          },
        ]
      : [],
  )
}

const findings = []
const index = pathExists(indexPath) ? readRepoFile(indexPath) : ''

if (!index) {
  findings.push({
    code: 'MISSING_INDEX',
    path: indexPath,
    message: `Missing production monitoring evidence index: ${indexPath}`,
  })
}

for (const phrase of indexRequiredPhrases) {
  if (!index.includes(phrase)) {
    findings.push({
      code: 'MISSING_INDEX_BOUNDARY',
      path: indexPath,
      message: `Missing required production monitoring evidence package phrase: ${phrase}`,
    })
  }
}

let linkedArtifactCount = 0
let existingArtifactCount = 0
let artifactBoundaryCount = 0

for (const artifact of artifacts) {
  if (index.includes(artifact.path)) {
    linkedArtifactCount += 1
  } else {
    findings.push({
      code: 'MISSING_INDEX_LINK',
      path: artifact.path,
      message: `Production monitoring evidence package index does not link ${artifact.path}.`,
    })
  }

  if (!pathExists(artifact.path)) {
    findings.push({
      code: 'MISSING_FILE',
      path: artifact.path,
      message: `Production monitoring evidence package artifact does not exist: ${artifact.path}.`,
    })
    continue
  }

  existingArtifactCount += 1
  const contents = readRepoFile(artifact.path)

  if (artifact.path.startsWith('docs/')) {
    findings.push(...findSecretLikeValues(artifact.path, contents))
  }

  const requiredPhrases = criticalArtifactPhrases[artifact.path] ?? []
  for (const phrase of requiredPhrases) {
    if (contents.includes(phrase)) {
      artifactBoundaryCount += 1
    } else {
      findings.push({
        code: 'MISSING_ARTIFACT_BOUNDARY',
        path: artifact.path,
        message: `Missing required artifact boundary text in ${artifact.path}: ${phrase}`,
      })
    }
  }
}

findings.push(...findSecretLikeValues(indexPath, index))

const requiredArtifactCount = artifacts.filter(
  (artifact) => artifact.requiredBeforeRuntimeApproval,
).length
const referenceArtifactCount = artifacts.length - requiredArtifactCount

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW'
      : 'NEEDS_ATTENTION',
  productionMonitoringEnabled: false,
  productionSmokeApproved: false,
  publicTrustClaimsApproved: false,
  externalMonitoringSendEnabled: false,
  runtimeMonitoringImplemented: false,
  artifactCount: artifacts.length,
  requiredArtifactCount,
  referenceArtifactCount,
  linkedArtifactCount,
  existingArtifactCount,
  artifactBoundaryCount,
  findings,
}

console.log(JSON.stringify(report, null, 2))

if (findings.length > 0) {
  process.exitCode = 1
}
