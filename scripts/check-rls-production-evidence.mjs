import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()
const indexPath =
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md'

const artifacts = [
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md',
  'lib/membershipAwareRlsProductionApprovalInput.ts',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md',
  'lib/membershipAwareRlsProductionApprovalDryRun.ts',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md',
  'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md',
  'lib/membershipAwareRlsProductionApprovalReadiness.ts',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_GUIDED_WORKSHEET_20260629.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
  'lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts',
  'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
  'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
  'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
  'docs/sql/membership_aware_operational_rls_draft.sql',
]

const indexRequiredPhrases = [
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
  'Run the evidence package consistency checker and confirm it returns `READY_FOR_FINAL_HUMAN_REVIEW`.',
  'Explicit approval phrase is present',
  'The explicit production approval phrase is missing.',
]

const criticalArtifactPhrases = {
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md': [
    'Status: Prepared as a production runbook only.',
    'Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`',
    'Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`',
    'This packet is not production approval.',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md': [
    'Status: Final go/no-go review checklist prepared only.',
    'It does not approve production execution.',
    'Current decision: `NO_GO_REVIEW_INCOMPLETE`',
    'production still must not be touched until the product owner gives a separate explicit production approval prompt',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md': [
    'Status: Prepared as a non-runtime production-readiness gate.',
    'It does not approve production rollout.',
    'readyForProductionRollout: true',
    'Production RLS remains `NO-GO` unless and until the exact approval phrase is recorded separately',
  ],
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md': [
    'Status: Prepared as a repository-only validation helper.',
    '`readyForProductionRollout: false`',
    'This validator is a pre-approval safety check only.',
  ],
  'lib/membershipAwareRlsProductionApprovalReadiness.ts': [
    'explicitProductionApprovalPhraseRecorded: boolean',
    'readyForProductionRollout',
    'APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT',
    'Safe labels only',
  ],
  'lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts': [
    'readyForProductionRollout: false',
    'approvalPhraseRecorded',
    'const FORBIDDEN_RAW_KEYS',
    'const FORBIDDEN_VALUE_PATTERNS',
  ],
}

const sqlSafetyStatusPhrases = [
  'Do not run until explicitly approved',
  'Do not run unless approved rollout requires rollback',
  'Reference only',
]

const secretLikePatterns = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
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

function isSqlArtifact(path) {
  return path.endsWith('.sql')
}

function findSecretLikeValues(path, contents) {
  return secretLikePatterns.flatMap((pattern) =>
    pattern.test(contents)
      ? [
          {
            code: 'UNSAFE_SECRET_LIKE_VALUE',
            path,
            message: `Found a secret-like value in ${path}; replace it with a label-only placeholder before RLS approval review.`,
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
    message: `Missing membership-aware RLS production evidence index: ${indexPath}`,
  })
}

for (const phrase of indexRequiredPhrases) {
  if (!index.includes(phrase)) {
    findings.push({
      code: 'MISSING_INDEX_BOUNDARY',
      path: indexPath,
      message: `Missing required RLS evidence package phrase: ${phrase}`,
    })
  }
}

for (const phrase of sqlSafetyStatusPhrases) {
  if (!index.includes(phrase)) {
    findings.push({
      code: 'MISSING_SQL_SAFETY_STATUS',
      path: indexPath,
      message: `Missing SQL safety status phrase: ${phrase}`,
    })
  }
}

let linkedArtifactCount = 0
let existingArtifactCount = 0
let artifactBoundaryCount = 0

for (const artifact of artifacts) {
  if (index.includes(artifact)) {
    linkedArtifactCount += 1
  } else {
    findings.push({
      code: 'MISSING_INDEX_LINK',
      path: artifact,
      message: `Evidence package index does not link ${artifact}.`,
    })
  }

  if (!pathExists(artifact)) {
    findings.push({
      code: 'MISSING_FILE',
      path: artifact,
      message: `Evidence package artifact does not exist: ${artifact}.`,
    })
    continue
  }

  existingArtifactCount += 1
  const contents = readRepoFile(artifact)

  if (!isSqlArtifact(artifact)) {
    findings.push(...findSecretLikeValues(artifact, contents))
  }

  const requiredPhrases = criticalArtifactPhrases[artifact] ?? []
  for (const phrase of requiredPhrases) {
    if (contents.includes(phrase)) {
      artifactBoundaryCount += 1
    } else {
      findings.push({
        code: 'MISSING_ARTIFACT_BOUNDARY',
        path: artifact,
        message: `Missing required artifact boundary text in ${artifact}: ${phrase}`,
      })
    }
  }
}

findings.push(...findSecretLikeValues(indexPath, index))

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW'
      : 'NEEDS_ATTENTION',
  readyForProductionRollout: false,
  productionRlsApproved: false,
  appliesMigrations: false,
  changesOperationalRls: false,
  artifactCount: artifacts.length,
  linkedArtifactCount,
  existingArtifactCount,
  artifactBoundaryCount,
  findings,
}

console.log(JSON.stringify(report, null, 2))

if (findings.length > 0) {
  process.exitCode = 1
}
