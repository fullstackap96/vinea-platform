import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()
const matrixPath = 'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md'
const worksheetPath = 'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md'
const filledExamplePath =
  'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md'

const trustAreas = [
  'Formal compliance certification',
  'Production membership-aware RLS',
  'Production monitoring',
  'Backup and restore',
  'Export controls',
  'Public intake routing',
  'AI safety',
  'Data retention and deletion',
  'Incident response',
  'Document and family portal safety',
  'MFA, SSO, and advanced RBAC',
]

const supportingReferences = [
  'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
  'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
  'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
  'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
  'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
  'docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md',
  'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
  'docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md',
  'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
  'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
  'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md',
  'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
]

const matrixBoundaryPhrases = [
  'Status: Prepared as a non-runtime trust-center readiness slice.',
  'Current public trust-center decision: `NO-GO`',
  'This matrix does not approve public trust-center publishing',
  'Public claim allowed?',
  'Forbidden Public Claims',
  'Do not convert a readiness packet into a public promise.',
  'No formal certification is implied unless a formal report exists.',
  'final answer has been reviewed by the product owner and security/data owner',
]

const worksheetBoundaryPhrases = [
  'Status: Prepared as a non-runtime, non-secret trust-center readiness worksheet.',
  'Current public trust-center decision: `NO-GO`',
  'Fill this worksheet with non-secret labels only.',
  'Keep public trust-center publishing `NO-GO` until every relevant row has complete evidence, named owners, and product/security approval.',
  'APPROVED_FOR_PUBLIC_USE',
  'Public Copy Stop Conditions',
]

const filledExampleBoundaryPhrases = [
  'Status: Prepared as a non-runtime, non-secret filled example using role labels only.',
  'Current public trust-center decision: `NO-GO`',
  'Treat this as a draft example, not an approval record.',
  'Keep all owners as role labels until humans confirm named owners.',
  'Do not publish public trust-center copy from this example.',
  'This example intentionally does not recommend:',
  'APPROVED_FOR_PUBLIC_USE',
]

const publicOverclaimStopConditions = [
  'Vinea is SOC 2 certified',
  'Vinea has completed production backup and restore drills.',
  'Vinea has production RPO/RTO guarantees.',
  'Vinea production is fully diocesan RLS-ready.',
  'Vinea production exports are generally available.',
  'Vinea production monitoring is live and staffed.',
  'Vinea AI is fully permission-scoped in production',
  'Vinea public intake routing is production-enabled',
  'Vinea retention and deletion automation is approved and implemented.',
  'Vinea incident response has completed production-grade tabletop drills.',
]

const secretLikePatterns = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /signedUrl\s*=\s*[A-Za-z0-9._:/?&=-]{20,}/i,
]

function readRepoFile(relativePath) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(relativePath) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
}

function requireFile(path, findings) {
  if (!repoPathExists(path)) {
    findings.push({
      code: 'MISSING_FILE',
      path,
      message: `Trust-center claims artifact does not exist: ${path}.`,
    })
    return ''
  }

  return readRepoFile(path)
}

function includesAll(path, source, expected, code, findings) {
  let count = 0

  for (const item of expected) {
    if (source.includes(item)) {
      count += 1
    } else {
      findings.push({
        code,
        path,
        message: `Missing required trust-center claims text in ${path}: ${item}`,
      })
    }
  }

  return count
}

function findSecretLikeValues(path, contents) {
  return secretLikePatterns.flatMap((pattern) => {
    if (!pattern.test(contents)) {
      return []
    }

    return [
      {
        code: 'UNSAFE_SECRET_LIKE_VALUE',
        path,
        message: `Found a secret-like value in ${path}; replace it with a non-secret label before trust-center review.`,
      },
    ]
  })
}

const findings = []
const matrix = requireFile(matrixPath, findings)
const worksheet = requireFile(worksheetPath, findings)
const filledExample = requireFile(filledExamplePath, findings)
const combinedClaimsArtifacts = [matrix, worksheet, filledExample].join('\n')

const boundaryPhraseCount =
  includesAll(
    matrixPath,
    matrix,
    matrixBoundaryPhrases,
    'MISSING_BOUNDARY_TEXT',
    findings,
  ) +
  includesAll(
    worksheetPath,
    worksheet,
    worksheetBoundaryPhrases,
    'MISSING_BOUNDARY_TEXT',
    findings,
  ) +
  includesAll(
    filledExamplePath,
    filledExample,
    filledExampleBoundaryPhrases,
    'MISSING_BOUNDARY_TEXT',
    findings,
  )

const trustAreaCount = includesAll(
  'trust-center claims artifact set',
  combinedClaimsArtifacts,
  trustAreas,
  'MISSING_TRUST_AREA',
  findings,
)
const supportingReferenceCount = includesAll(
  matrixPath,
  matrix,
  supportingReferences,
  'MISSING_SUPPORTING_REFERENCE',
  findings,
)
const stopConditionCount = includesAll(
  matrixPath,
  matrix,
  publicOverclaimStopConditions,
  'MISSING_STOP_CONDITION',
  findings,
)

findings.push(
  ...findSecretLikeValues(matrixPath, matrix),
  ...findSecretLikeValues(worksheetPath, worksheet),
  ...findSecretLikeValues(filledExamplePath, filledExample),
)

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
      : 'NEEDS_ATTENTION',
  publicTrustCenterPublishingApproved: false,
  publicClaimsApproved: false,
  matrixPath,
  worksheetPath,
  filledExamplePath,
  trustAreaCount,
  supportingReferenceCount,
  boundaryPhraseCount,
  stopConditionCount,
  findings,
}

console.log(JSON.stringify(report, null, 2))

if (findings.length > 0) {
  process.exitCode = 1
}
