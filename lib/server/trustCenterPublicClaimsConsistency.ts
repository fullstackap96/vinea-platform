import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type TrustCenterPublicClaimsConsistencyDecision =
  | 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
  | 'NEEDS_ATTENTION'

export type TrustCenterPublicClaimsConsistencyFinding = {
  code:
    | 'MISSING_FILE'
    | 'MISSING_BOUNDARY_TEXT'
    | 'MISSING_TRUST_AREA'
    | 'MISSING_STOP_CONDITION'
    | 'MISSING_SUPPORTING_REFERENCE'
    | 'UNSAFE_SECRET_LIKE_VALUE'
  path?: string
  message: string
}

export type TrustCenterPublicClaimsConsistencyReport = {
  schemaVersion: 1
  decision: TrustCenterPublicClaimsConsistencyDecision
  publicTrustCenterPublishingApproved: false
  publicClaimsApproved: false
  matrixPath: string
  worksheetPath: string
  filledExamplePath: string
  trustAreaCount: number
  supportingReferenceCount: number
  boundaryPhraseCount: number
  stopConditionCount: number
  findings: TrustCenterPublicClaimsConsistencyFinding[]
}

export const TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH =
  'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md'
export const TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH =
  'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md'
export const TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH =
  'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md'

const TRUST_AREAS = [
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

const SUPPORTING_REFERENCES = [
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

const MATRIX_BOUNDARY_PHRASES = [
  'Status: Prepared as a non-runtime trust-center readiness slice.',
  'Current public trust-center decision: `NO-GO`',
  'This matrix does not approve public trust-center publishing',
  'Public claim allowed?',
  'Forbidden Public Claims',
  'Do not convert a readiness packet into a public promise.',
  'No formal certification is implied unless a formal report exists.',
  'final answer has been reviewed by the product owner and security/data owner',
]

const WORKSHEET_BOUNDARY_PHRASES = [
  'Status: Prepared as a non-runtime, non-secret trust-center readiness worksheet.',
  'Current public trust-center decision: `NO-GO`',
  'Fill this worksheet with non-secret labels only.',
  'Keep public trust-center publishing `NO-GO` until every relevant row has complete evidence, named owners, and product/security approval.',
  'APPROVED_FOR_PUBLIC_USE',
  'Public Copy Stop Conditions',
]

const FILLED_EXAMPLE_BOUNDARY_PHRASES = [
  'Status: Prepared as a non-runtime, non-secret filled example using role labels only.',
  'Current public trust-center decision: `NO-GO`',
  'Treat this as a draft example, not an approval record.',
  'Keep all owners as role labels until humans confirm named owners.',
  'Do not publish public trust-center copy from this example.',
  'This example intentionally does not recommend:',
  'APPROVED_FOR_PUBLIC_USE',
]

const PUBLIC_OVERCLAIM_STOP_CONDITIONS = [
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

const SECRET_LIKE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /signedUrl\s*=\s*[A-Za-z0-9._:/?&=-]{20,}/i,
]

function readRepoFile(repoRoot: string, relativePath: string) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(repoRoot: string, relativePath: string) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
}

function requireFile(
  repoRoot: string,
  path: string,
  findings: TrustCenterPublicClaimsConsistencyFinding[]
) {
  if (!repoPathExists(repoRoot, path)) {
    findings.push({
      code: 'MISSING_FILE',
      path,
      message: `Trust-center claims artifact does not exist: ${path}.`,
    })
    return ''
  }

  return readRepoFile(repoRoot, path)
}

function includesAll(
  path: string,
  source: string,
  expected: string[],
  code: TrustCenterPublicClaimsConsistencyFinding['code'],
  findings: TrustCenterPublicClaimsConsistencyFinding[]
) {
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
        message: `Found a secret-like value in ${path}; replace it with a non-secret label before trust-center review.`,
      },
    ]
  })
}

export function checkTrustCenterPublicClaimsConsistency(
  repoRoot = process.cwd()
): TrustCenterPublicClaimsConsistencyReport {
  const findings: TrustCenterPublicClaimsConsistencyFinding[] = []
  const matrix = requireFile(repoRoot, TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH, findings)
  const worksheet = requireFile(
    repoRoot,
    TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH,
    findings
  )
  const filledExample = requireFile(
    repoRoot,
    TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH,
    findings
  )

  const combinedClaimsArtifacts = [matrix, worksheet, filledExample].join('\n')
  const boundaryPhraseCount =
    includesAll(
      TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH,
      matrix,
      MATRIX_BOUNDARY_PHRASES,
      'MISSING_BOUNDARY_TEXT',
      findings
    ) +
    includesAll(
      TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH,
      worksheet,
      WORKSHEET_BOUNDARY_PHRASES,
      'MISSING_BOUNDARY_TEXT',
      findings
    ) +
    includesAll(
      TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH,
      filledExample,
      FILLED_EXAMPLE_BOUNDARY_PHRASES,
      'MISSING_BOUNDARY_TEXT',
      findings
    )

  const trustAreaCount = includesAll(
    'trust-center claims artifact set',
    combinedClaimsArtifacts,
    TRUST_AREAS,
    'MISSING_TRUST_AREA',
    findings
  )
  const supportingReferenceCount = includesAll(
    TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH,
    matrix,
    SUPPORTING_REFERENCES,
    'MISSING_SUPPORTING_REFERENCE',
    findings
  )
  const stopConditionCount = includesAll(
    TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH,
    matrix,
    PUBLIC_OVERCLAIM_STOP_CONDITIONS,
    'MISSING_STOP_CONDITION',
    findings
  )

  findings.push(
    ...findSecretLikeValues(TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH, matrix),
    ...findSecretLikeValues(TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH, worksheet),
    ...findSecretLikeValues(
      TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH,
      filledExample
    )
  )

  return {
    schemaVersion: 1,
    decision:
      findings.length === 0
        ? 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
        : 'NEEDS_ATTENTION',
    publicTrustCenterPublishingApproved: false,
    publicClaimsApproved: false,
    matrixPath: TRUST_CENTER_PUBLIC_CLAIMS_MATRIX_PATH,
    worksheetPath: TRUST_CENTER_CLAIMS_OWNER_WORKSHEET_PATH,
    filledExamplePath: TRUST_CENTER_CLAIMS_OWNER_FILLED_EXAMPLE_PATH,
    trustAreaCount,
    supportingReferenceCount,
    boundaryPhraseCount,
    stopConditionCount,
    findings,
  }
}
