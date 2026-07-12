import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type MembershipAwareRlsProductionEvidencePackageConsistencyDecision =
  | 'READY_FOR_FINAL_HUMAN_REVIEW'
  | 'NEEDS_ATTENTION'

export type MembershipAwareRlsProductionEvidencePackageArtifactKind =
  | 'doc'
  | 'source'
  | 'sql'

export type MembershipAwareRlsProductionEvidencePackageArtifact = {
  path: string
  kind: MembershipAwareRlsProductionEvidencePackageArtifactKind
  requiredBeforeApproval: boolean
}

export type MembershipAwareRlsProductionEvidencePackageConsistencyFinding = {
  code:
    | 'MISSING_INDEX_LINK'
    | 'MISSING_FILE'
    | 'MISSING_INDEX_BOUNDARY'
    | 'MISSING_REVIEW_ORDER_STEP'
    | 'MISSING_APPROVAL_GATE'
    | 'MISSING_EXCLUDED_SCOPE'
    | 'MISSING_HARD_STOP'
    | 'MISSING_SQL_SAFETY_STATUS'
    | 'MISSING_ARTIFACT_BOUNDARY'
    | 'UNSAFE_SECRET_LIKE_VALUE'
  path?: string
  message: string
}

export type MembershipAwareRlsProductionEvidencePackageConsistencyReport = {
  schemaVersion: 1
  decision: MembershipAwareRlsProductionEvidencePackageConsistencyDecision
  readyForProductionRollout: false
  indexPath: string
  requiredArtifactCount: number
  helpfulArtifactCount: number
  linkedArtifactCount: number
  existingArtifactCount: number
  productionBoundaryCount: number
  reviewOrderStepCount: number
  approvalGateCount: number
  excludedScopeCount: number
  hardStopCount: number
  artifactBoundaryCount: number
  findings: MembershipAwareRlsProductionEvidencePackageConsistencyFinding[]
}

const INDEX_PATH =
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md'

export const MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS = [
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'lib/membershipAwareRlsProductionApprovalInput.ts',
    kind: 'source',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'lib/membershipAwareRlsProductionApprovalDryRun.ts',
    kind: 'source',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
    kind: 'source',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'lib/membershipAwareRlsProductionApprovalReadiness.ts',
    kind: 'source',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_GUIDED_WORKSHEET_20260629.md',
    kind: 'doc',
    requiredBeforeApproval: false,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: false,
  },
  {
    path: 'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
    kind: 'doc',
    requiredBeforeApproval: true,
  },
  {
    path: 'lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts',
    kind: 'source',
    requiredBeforeApproval: true,
  },
  {
    path: 'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
    kind: 'sql',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    kind: 'sql',
    requiredBeforeApproval: true,
  },
  {
    path: 'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
    kind: 'sql',
    requiredBeforeApproval: false,
  },
  {
    path: 'docs/sql/membership_aware_operational_rls_draft.sql',
    kind: 'sql',
    requiredBeforeApproval: false,
  },
] satisfies MembershipAwareRlsProductionEvidencePackageArtifact[]

const INDEX_BOUNDARY_STRINGS = [
  'Status: Evidence package index prepared only.',
  'Production was not accessed',
  'no migrations were applied',
  'runtime behavior was not changed',
  'operational RLS was not changed',
  'Google Calendar data was not touched',
  'records were not mutated',
  'no secrets were exposed',
  'This index does not approve production work.',
  'Production RLS remains `NO-GO`',
  'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
]

const REVIEW_ORDER_STEPS = [
  'Read the readiness and blocker records.',
  'Confirm human owners and safe fixture labels are complete.',
  'Confirm the smoke fixture verification checklist and rollout evidence crosswalk are ready.',
  'Confirm rollback, support, and monitoring instructions are ready.',
  'Confirm named sign-offs are complete.',
  'Confirm the final go/no-go checklist is `GO`.',
  'Build the source-level production approval readiness input from label-only current evidence.',
  'Run the repository-only source-level approval dry run and confirm it returns sanitized pass/fail JSON with `READY_TO_REQUEST_APPROVAL`.',
  'Fill the go/no-go dry-run evidence template with the sanitized dry-run summary and human approval placeholders.',
  'Run the go/no-go dry-run evidence validator and confirm it returns `READY_TO_REQUEST_FINAL_APPROVAL`.',
  'Run the source-level production approval readiness gate with the built input.',
  'Run the evidence package consistency checker and confirm it returns `READY_FOR_FINAL_HUMAN_REVIEW`.',
  'Prepare the final approval prompt.',
  'Only after separate explicit approval, use the rollout evidence template during the approved rollout window.',
]

const APPROVAL_GATE_STRINGS = [
  'Production target labels are safe',
  'Human intake is complete',
  'Fixture evidence map is complete',
  'Rollout evidence crosswalk is complete',
  'Smoke-test data is production-safe',
  'Named sign-offs are complete',
  'Rollback is rehearsable',
  'Monitoring is ready',
  'Support posture is ready',
  'Final go/no-go is `GO`',
  'Source readiness input builder passes',
  'Repository dry run passes',
  'Go/no-go dry-run evidence template is filled',
  'Go/no-go dry-run evidence validator passes',
  'Source readiness gate passes',
  'Evidence package consistency checker passes',
  'Explicit approval phrase is present',
]

const EXCLUDED_SCOPE_STRINGS = [
  'Runtime public intake routing enablement.',
  'Public intake production runtime flags.',
  'AI production flag enablement.',
  'Google Calendar data mutation.',
  'Staff membership cleanup.',
  'Operational table schema redesign.',
  'Production data cleanup.',
  'Any unrelated deployment or feature rollout.',
]

const HARD_STOP_STRINGS = [
  'The final go/no-go checklist is not `GO`.',
  'Any required owner or sign-off is missing.',
  'Any production fixture label cannot be mapped to safe evidence.',
  'Production target information includes a database URL, password, service-role key, session cookie, signed URL, or raw token.',
  'Rollback owner, rollback deadline, rollback SQL, or post-rollback checks are missing.',
  'Monitoring owner/channel or support posture is missing.',
  'The explicit production approval phrase is missing.',
]

const SQL_SAFETY_STATUS_STRINGS = [
  'Do not run until explicitly approved',
  'Do not run unless approved rollout requires rollback',
  'Reference only',
]

const CRITICAL_ARTIFACT_BOUNDARY_STRINGS: Record<string, string[]> = {
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md': [
    'Status: Prepared as a production runbook only.',
    'Do not execute this packet until product owner, technical owner, QA owner, and security/data owner approvals are all recorded.',
    'Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`',
    'Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`',
    '## Pre-Rollout Checks',
    '## Forward Migration Command',
    '## Post-Apply Verification',
    '### Active-Parish-Cookie Request Detail And Document Smoke',
    '### Family Portal Safety Smoke',
    '## Rollback Decision Criteria',
    '## Rollback Command',
    'This packet is not production approval.',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md': [
    'Status: Final go/no-go review checklist prepared only.',
    'It does not approve production execution.',
    '## Non-Negotiable Scope Rules',
    'No secrets, database URLs, service role keys, session cookies, raw portal tokens, signed URLs, token hashes, private documents, internal notes, AI notes, or private audit payloads are copied into approval records.',
    'Current decision: `NO_GO_REVIEW_INCOMPLETE`',
    '## Product Owner Approval Boundary',
    'production still must not be touched until the product owner gives a separate explicit production approval prompt',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md': [
    'Status: Prepared as a non-runtime production-readiness gate.',
    'The gate turns the production RLS evidence package into a source-level readiness check.',
    'It does not approve production rollout.',
    'The gate may return `readyForProductionRollout: true` only when the approval-request criteria are met and `explicitProductionApprovalPhraseRecorded` is true.',
    'Production RLS remains `NO-GO` unless and until the exact approval phrase is recorded separately',
    'Runtime public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, and production data cleanup remain out of scope.',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md': [
    'Status: Prepared as a repository-only validation helper.',
    'no recorded final approval phrase before the separate product-owner approval step',
    '`readyForProductionRollout: false`',
    'Production rollout must remain blocked until the product owner separately provides the exact approval phrase in the final approval prompt.',
    'the approval phrase itself is pasted into the evidence template',
    'This validator is a pre-approval safety check only.',
  ],
  'lib/membershipAwareRlsProductionApprovalReadiness.ts': [
    'explicitProductionApprovalPhraseRecorded: boolean',
    'const REQUIRED_OWNERS',
    'const REQUIRED_FIXTURES',
    'const REQUIRED_EVIDENCE',
    'const REQUIRED_SMOKE_VERIFICATIONS',
    'readyForProductionRollout',
    'Production RLS remains NO-GO until the exact approval phrase APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT is recorded separately.',
    'Safe labels only: no database URLs, passwords, service-role keys, raw tokens, signed URLs, private documents, audit payloads, parishioner details, or raw production ids.',
  ],
  'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts': [
    'readyForProductionRollout: false',
    'approvalPhraseRecorded',
    'const FORBIDDEN_RAW_KEYS',
    'const FORBIDDEN_VALUE_PATTERNS',
    "'token'",
    "'signedUrl'",
    'collectForbiddenKeys',
    'collectForbiddenValues',
  ],
}

const SECRET_LIKE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
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
  code: MembershipAwareRlsProductionEvidencePackageConsistencyFinding['code'],
  findings: MembershipAwareRlsProductionEvidencePackageConsistencyFinding[]
) {
  let count = 0

  for (const item of expected) {
    if (source.includes(item)) {
      count += 1
    } else {
      findings.push({
        code,
        message: `Missing required evidence package text: ${item}`,
      })
    }
  }

  return count
}

function includesAllInArtifact(
  path: string,
  source: string,
  expected: string[],
  findings: MembershipAwareRlsProductionEvidencePackageConsistencyFinding[]
) {
  let count = 0

  for (const item of expected) {
    if (source.includes(item)) {
      count += 1
    } else {
      findings.push({
        code: 'MISSING_ARTIFACT_BOUNDARY',
        path,
        message: `Missing required artifact boundary text in ${path}: ${item}`,
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
        message: `Found a secret-like value in ${path}; replace it with a label-only placeholder before approval review.`,
      },
    ]
  })
}

export function checkMembershipAwareRlsProductionEvidencePackageConsistency(
  repoRoot = process.cwd()
): MembershipAwareRlsProductionEvidencePackageConsistencyReport {
  const findings: MembershipAwareRlsProductionEvidencePackageConsistencyFinding[] =
    []
  const index = readRepoFile(repoRoot, INDEX_PATH)

  const productionBoundaryCount = includesAll(
    index,
    INDEX_BOUNDARY_STRINGS,
    'MISSING_INDEX_BOUNDARY',
    findings
  )
  const reviewOrderStepCount = includesAll(
    index,
    REVIEW_ORDER_STEPS,
    'MISSING_REVIEW_ORDER_STEP',
    findings
  )
  const approvalGateCount = includesAll(
    index,
    APPROVAL_GATE_STRINGS,
    'MISSING_APPROVAL_GATE',
    findings
  )
  const excludedScopeCount = includesAll(
    index,
    EXCLUDED_SCOPE_STRINGS,
    'MISSING_EXCLUDED_SCOPE',
    findings
  )
  const hardStopCount = includesAll(
    index,
    HARD_STOP_STRINGS,
    'MISSING_HARD_STOP',
    findings
  )
  includesAll(index, SQL_SAFETY_STATUS_STRINGS, 'MISSING_SQL_SAFETY_STATUS', findings)

  let linkedArtifactCount = 0
  let existingArtifactCount = 0
  let artifactBoundaryCount = 0

  for (const artifact of MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS) {
    if (index.includes(artifact.path)) {
      linkedArtifactCount += 1
    } else {
      findings.push({
        code: 'MISSING_INDEX_LINK',
        path: artifact.path,
        message: `Evidence package index does not link ${artifact.path}.`,
      })
    }

    if (repoPathExists(repoRoot, artifact.path)) {
      existingArtifactCount += 1

      if (artifact.path in CRITICAL_ARTIFACT_BOUNDARY_STRINGS) {
        artifactBoundaryCount += includesAllInArtifact(
          artifact.path,
          readRepoFile(repoRoot, artifact.path),
          CRITICAL_ARTIFACT_BOUNDARY_STRINGS[artifact.path],
          findings
        )
      }

      if (artifact.kind !== 'sql') {
        findings.push(...findSecretLikeValues(artifact.path, readRepoFile(repoRoot, artifact.path)))
      }
    } else {
      findings.push({
        code: 'MISSING_FILE',
        path: artifact.path,
        message: `Evidence package artifact does not exist: ${artifact.path}.`,
      })
    }
  }

  return {
    schemaVersion: 1,
    decision:
      findings.length === 0 ? 'READY_FOR_FINAL_HUMAN_REVIEW' : 'NEEDS_ATTENTION',
    readyForProductionRollout: false,
    indexPath: INDEX_PATH,
    requiredArtifactCount:
      MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.filter(
        (artifact) => artifact.requiredBeforeApproval
      ).length,
    helpfulArtifactCount:
      MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_ARTIFACTS.filter(
        (artifact) => !artifact.requiredBeforeApproval
      ).length,
    linkedArtifactCount,
    existingArtifactCount,
    productionBoundaryCount,
    reviewOrderStepCount,
    approvalGateCount,
    excludedScopeCount,
    hardStopCount,
    artifactBoundaryCount,
    findings,
  }
}
