import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type ProductionSensitiveGateBoundaryDecision =
  | 'BOUNDARIES_READY_FOR_REVIEW'
  | 'NEEDS_ATTENTION'

export type ProductionSensitiveGateBoundaryArtifact = {
  gateId: string
  path: string
  ownerApprovalRequired: boolean
  requiredPhrases: string[]
}

export type ProductionSensitiveGateBoundaryFinding = {
  code:
    | 'MISSING_INDEX_LINK'
    | 'MISSING_FILE'
    | 'MISSING_INDEX_BOUNDARY'
    | 'MISSING_ARTIFACT_PHRASE'
    | 'UNSAFE_SECRET_LIKE_VALUE'
  gateId?: string
  path?: string
  message: string
}

export type ProductionSensitiveGateBoundaryReport = {
  schemaVersion: 1
  decision: ProductionSensitiveGateBoundaryDecision
  productionSensitiveFeaturesApproved: false
  publicTrustClaimsApproved: false
  indexPath: string
  artifactCount: number
  ownerApprovalRequiredCount: number
  linkedArtifactCount: number
  existingArtifactCount: number
  boundaryPhraseCount: number
  findings: ProductionSensitiveGateBoundaryFinding[]
}

export const PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH =
  'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md'

const INDEX_BOUNDARY_PHRASES = [
  'Production-sensitive features remain `NO-GO` unless a separate product-owner approval explicitly says otherwise.',
  'This index does not enable production flags.',
  'This index does not approve migrations.',
  'This index does not change operational RLS.',
  'This index does not mutate records.',
  'This index does not run exports.',
  'This index does not call AI.',
  'This index does not access storage or create signed URLs.',
  'This index does not make public trust-center claims.',
  'Every gate below remains blocked until its own approval packet, smoke evidence, rollback plan, and owner sign-off are complete.',
]

export const PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS = [
  {
    gateId: 'membership-aware-operational-rls',
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Production RLS remains `NO-GO`',
      'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    ],
  },
  {
    gateId: 'production-monitoring',
    path: 'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Current production monitoring decision: `NO-GO`',
      'Production monitoring remains `NO-GO`.',
    ],
  },
  {
    gateId: 'content-security-policy-runtime',
    path: 'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'CSP REPORT-ONLY DESIGN READY FOR REVIEW; RUNTIME CSP NOT IMPLEMENTED',
      'An enforcing `Content-Security-Policy` header remains `NO-GO`',
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
    ],
  },
  {
    gateId: 'public-intake-runtime-routing',
    path: 'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Production enablement is not approved.',
      'Any other approval phrase means production runtime routing remains off.',
    ],
  },
  {
    gateId: 'ai-summary-safety-chain',
    path: 'docs/AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Current recommendation: `Do not enable production AI summary safety-chain flags until approval, smoke-test data, monitoring, rollback, and sign-off are complete`',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
    ],
  },
  {
    gateId: 'ai-reply-audit-response-gates',
    path: 'docs/AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Production AI reply remains `NO-GO`',
      'I approve non-production QA execution for the AI reply audit-write and safe-response gates only.',
      'validateAiReplyAuditEventForSafeWrite',
      'validateAiReplyResponseScaffoldForSafeExposure',
    ],
  },
  {
    gateId: 'request-list-basic-export',
    path: 'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Production exports remain `NO-GO` until the exact approval prompt above is intentionally submitted as a separate product-owner instruction.',
      'Do not use this prompt unless you are intentionally approving the narrow production smoke.',
    ],
  },
  {
    gateId: 'request-document-manifest-export',
    path: 'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Production exports remain `NO-GO` until the product owner provides these exact public, non-secret values in a separate future approval prompt:',
      'This document still does not approve the production smoke by itself.',
    ],
  },
  {
    gateId: 'export-audit-reviewer-dashboard',
    path: 'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'PRODUCTION DASHBOARD EXPOSURE REMAINS NO-GO',
      'Do not treat this template as approval to implement or enable that gate.',
    ],
  },
  {
    gateId: 'backup-restore-public-claims',
    path: 'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'PUBLIC TRUST-CENTER BACKUP/RESTORE CLAIMS',
      'REMAIN NO-GO',
    ],
  },
  {
    gateId: 'public-trust-center-claims',
    path: 'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'Current public trust-center decision: `NO-GO`',
      'Do not convert a readiness packet into a public promise.',
    ],
  },
  {
    gateId: 'workflow-reminders-runtime',
    path: 'docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'WORKFLOW REMINDERS V1 RUNTIME NOT APPROVED',
      'Production runtime reminder delivery remains NO-GO',
    ],
  },
  {
    gateId: 'certificate-issuance-logging',
    path: 'docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'CERTIFICATE ISSUANCE LOGGING RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED',
      'Production certificate issuance logging remains NO-GO.',
    ],
  },
  {
    gateId: 'sacramental-correction-notation',
    path: 'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO',
      'AUTOMATIC REGISTER MUTATION REMAINS NO-GO',
    ],
  },
  {
    gateId: 'next-proxy-staff-authorization',
    path: 'docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md',
    ownerApprovalRequired: true,
    requiredPhrases: [
      'NEXT PROXY STAFF AUTH MULTI-PARISH HARDENING NOT APPROVED',
      'Production remains `NO-GO`',
      'Avoid `primary_parish_id()` in `proxy.ts`',
      'Avoid `createSupabaseServiceRoleClient()` and any service-role key in `proxy.ts`',
    ],
  },
] satisfies ProductionSensitiveGateBoundaryArtifact[]

const SECRET_LIKE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /session[_-]?cookie\s*=\s*[A-Za-z0-9._-]{20,}/i,
]

function readRepoFile(repoRoot: string, relativePath: string) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(repoRoot: string, relativePath: string) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
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

export function checkProductionSensitiveGateBoundaryConsistency(
  repoRoot = process.cwd()
): ProductionSensitiveGateBoundaryReport {
  const findings: ProductionSensitiveGateBoundaryFinding[] = []
  const index = readRepoFile(repoRoot, PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH)

  let boundaryPhraseCount = 0

  for (const phrase of INDEX_BOUNDARY_PHRASES) {
    if (index.includes(phrase)) {
      boundaryPhraseCount += 1
    } else {
      findings.push({
        code: 'MISSING_INDEX_BOUNDARY',
        message: `Missing required production-sensitive boundary text: ${phrase}`,
      })
    }
  }

  let linkedArtifactCount = 0
  let existingArtifactCount = 0

  for (const artifact of PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS) {
    if (index.includes(artifact.path)) {
      linkedArtifactCount += 1
    } else {
      findings.push({
        code: 'MISSING_INDEX_LINK',
        gateId: artifact.gateId,
        path: artifact.path,
        message: `Production-sensitive boundary index does not link ${artifact.path}.`,
      })
    }

    if (!repoPathExists(repoRoot, artifact.path)) {
      findings.push({
        code: 'MISSING_FILE',
        gateId: artifact.gateId,
        path: artifact.path,
        message: `Production-sensitive gate artifact does not exist: ${artifact.path}.`,
      })
      continue
    }

    existingArtifactCount += 1
    const contents = readRepoFile(repoRoot, artifact.path)

    for (const phrase of artifact.requiredPhrases) {
      if (!contents.includes(phrase)) {
        findings.push({
          code: 'MISSING_ARTIFACT_PHRASE',
          gateId: artifact.gateId,
          path: artifact.path,
          message: `Missing required gate boundary phrase in ${artifact.path}: ${phrase}`,
        })
      }
    }

    findings.push(...findSecretLikeValues(artifact.path, contents))
  }

  findings.push(...findSecretLikeValues(PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH, index))

  return {
    schemaVersion: 1,
    decision:
      findings.length === 0 ? 'BOUNDARIES_READY_FOR_REVIEW' : 'NEEDS_ATTENTION',
    productionSensitiveFeaturesApproved: false,
    publicTrustClaimsApproved: false,
    indexPath: PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_PATH,
    artifactCount: PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS.length,
    ownerApprovalRequiredCount:
      PRODUCTION_SENSITIVE_GATE_BOUNDARY_ARTIFACTS.filter(
        (artifact) => artifact.ownerApprovalRequired
      ).length,
    linkedArtifactCount,
    existingArtifactCount,
    boundaryPhraseCount,
    findings,
  }
}
