import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()
const handoffIndexPath =
  'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md'

const requiredArtifacts = [
  'README.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md',
  'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
  'docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md',
  'docs/DEPENDENCY_SECURITY_REMEDIATION_20260709.md',
  'docs/REPOSITORY_SECRET_SCANNING_BASELINE_20260709.md',
  'scripts/check-repository-secrets.mjs',
  'scripts/repository-secret-scan-rules.mjs',
  '.nvmrc',
  'docs/NODE_RUNTIME_BASELINE_20260709.md',
  '.env.example',
  'docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md',
  'docs/CI_ACTION_PROVENANCE_BASELINE_20260709.md',
  '.github/dependabot.yml',
  'docs/DEPENDENCY_UPDATE_MAINTENANCE_BASELINE_20260709.md',
  'docs/HEALTH_ENDPOINT_PUBLIC_RESPONSE_SAFETY_20260709.md',
  'docs/DEMO_REQUEST_DURABLE_RATE_LIMIT_20260709.md',
  'docs/REQUEST_NOTIFICATIONS_DURABLE_RATE_LIMIT_20260709.md',
  'docs/FAMILY_PORTAL_DOCUMENT_UPLOAD_DURABLE_RATE_LIMIT_20260709.md',
  'docs/PUBLIC_JSON_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/STAFF_EMAIL_SEND_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/GOOGLE_CALENDAR_EVENT_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/AI_ROUTE_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/REQUEST_COMMUNICATION_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/REQUEST_TEXT_MUTATION_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/REQUEST_SCHEDULE_MUTATION_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/REQUEST_PASTORAL_DETAIL_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md',
  'docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md',
  'docs/EMAIL_SEND_REQUEST_PARISH_AUTHORIZATION_20260710.md',
  'docs/SACRAMENTAL_RECORD_CLIENT_SAFE_MESSAGES_20260710.md',
  'docs/CORE_RECORD_CLIENT_SAFE_MESSAGES_20260710.md',
  'docs/REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_20260710.md',
  'docs/DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_20260710.md',
  'docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md',
  'docs/REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md',
  'docs/STAFF_AUTH_SESSION_EXIT_BOUNDARY_20260710.md',
  'docs/STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_20260710.md',
  'docs/REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_20260710.md',
  'docs/STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md',
  'docs/ALL_API_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md',
  'docs/PUBLIC_INTAKE_PARTIAL_CLEANUP_OBSERVABILITY_BOUNDARY_20260711.md',
  'docs/REQUEST_PASTORAL_DETAILS_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/GOOGLE_OAUTH_SELECTED_PARISH_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/REQUEST_NOTE_PLAYBOOK_INSERT_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/IMPORT_COMMIT_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_20260711.md',
  'docs/SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_20260711.md',
  'docs/PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_20260711.md',
  'docs/REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md',
  'docs/STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md',
  'docs/GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_20260711.md',
  'docs/DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_20260711.md',
  'docs/HOUSEHOLD_MEMBER_PRIMARY_CONTACT_OWNERSHIP_ORDER_20260711.md',
  'docs/CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_20260711.md',
  'docs/DUPLICATE_MERGE_CONFIRMATION_DIALOG_20260711.md',
  'docs/REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_20260711.md',
  'docs/REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_20260711.md',
  'docs/DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_20260711.md',
  'docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md',
  'docs/REQUEST_DOCUMENT_UPLOAD_COMPENSATION_BOUNDARY_20260711.md',
  'docs/GOOGLE_CALENDAR_REQUEST_LINK_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/OUTBOUND_EMAIL_DELIVERY_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_20260711.md',
  'docs/PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/DUPLICATE_MERGE_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/DASHBOARD_REQUEST_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/REQUEST_INTAKE_EDITOR_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/HOUSEHOLD_PRIMARY_CONTACT_COMPENSATION_BOUNDARY_20260711.md',
  'docs/OPERATIONAL_AUDIT_METADATA_PRIVACY_BOUNDARY_20260711.md',
  'docs/AUDIT_LOG_HELPER_SAFE_ERROR_LOGGING_20260706.md',
  'docs/EXPORT_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/AI_SUMMARY_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_20260711.md',
  'docs/DAILY_WORK_HUB_REPLY_DRAFT_ACTIVE_PARISH_ROUTE_20260710.md',
  'docs/DAILY_WORK_HUB_OPERATIONAL_DETAIL_PROJECTION_20260710.md',
  'docs/DAILY_WORK_HUB_SERVER_AGGREGATE_SIGNALS_20260710.md',
  'docs/REPORTS_SERVER_AGGREGATE_SUMMARY_20260710.md',
  'docs/DAILY_WORK_HUB_SERVER_READ_MODEL_20260710.md',
  'docs/DAILY_WORK_HUB_SINGLE_RESPONSE_COMPOSITION_20260710.md',
  'docs/DASHBOARD_SHELL_SERVER_CONTEXT_EXACT_PARISH_ADMIN_20260710.md',
  'docs/EXPORT_SELECTED_PARISH_ROLE_BOUNDARY_20260710.md',
  'docs/COMMUNICATIONS_CENTER_ACTIVE_PARISH_MUTATION_API_20260710.md',
  'docs/INTAKE_QUEUE_ACTIVE_PARISH_TRIAGE_APIS_20260710.md',
  'docs/SACRAMENTAL_RECORD_CREATE_RELATIONSHIP_INTEGRITY_20260710.md',
  'docs/CORE_RECORD_ACTION_ACTIVE_PARISH_FALLBACK_BOUNDARY_20260710.md',
  'docs/REQUEST_NOTE_AUDIT_METADATA_PRIVACY_BOUNDARY_20260710.md',
  'docs/REQUEST_CONTENT_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md',
  'docs/REQUEST_MUTATION_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md',
  'docs/REQUEST_SCHEDULE_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md',
  'docs/GOOGLE_CALENDAR_DATA_PROJECTION_BOUNDARY_20260710.md',
  'docs/BAPTISM_CERTIFICATE_ACTIVE_PARISH_BOUNDARY_20260710.md',
  'docs/DUPLICATE_REVIEW_EXPLICIT_PROJECTION_BOUNDARY_20260710.md',
  'docs/SACRAMENTAL_RECORD_READ_PROJECTION_BOUNDARY_20260710.md',
  'docs/SACRAMENTAL_RECORD_PREFILL_REQUEST_PROJECTION_BOUNDARY_20260710.md',
  'docs/CORE_DIRECTORY_LIST_PROJECTION_BOUNDARY_20260710.md',
  'docs/CORE_DETAIL_READ_PROJECTION_BOUNDARY_20260710.md',
  'docs/CARE_CALENDAR_INTAKE_INTENTION_PROJECTION_BOUNDARY_20260710.md',
  'docs/PARISH_DAILY_BRIEF_PROJECTION_BOUNDARY_20260710.md',
  'docs/OCIA_DETAIL_PRESENCE_PROJECTION_BOUNDARY_20260710.md',
  'docs/RUNTIME_SUPABASE_WILDCARD_PROJECTION_GUARD_20260710.md',
  'docs/DAILY_WORK_HUB_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md',
  'docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md',
  'docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md',
  'docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md',
  'docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md',
  'docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md',
  'docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md',
  'lib/releaseReadinessLocalEvidence.ts',
  '.github/workflows/ci.yml',
  'scripts/release-readiness-env-config.mjs',
  'scripts/check-release-readiness-env.mjs',
  'scripts/prepare-release-readiness-env-cleanup.mjs',
  'scripts/run-release-readiness-local.mjs',
  'scripts/check-release-readiness-handoff.mjs',
  'scripts/check-release-local-evidence.mjs',
  'scripts/check-rls-production-evidence.mjs',
  'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
  'scripts/check-production-monitoring-evidence.mjs',
  'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
  'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md',
  'scripts/check-production-gates.mjs',
  'docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md',
  'docs/NEXT_PROXY_STAFF_AUTH_CURRENT_COMPATIBILITY_BOUNDARY_20260708.md',
  'docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md',
  'docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md',
  'scripts/check-csp-report-only-evidence.mjs',
  'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
  'scripts/check-trust-center-claims.mjs',
  'docs/TRUST_CENTER_PUBLIC_CLAIMS_CONSISTENCY_CHECKER_20260707.md',
  'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
  'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
]

const localCommands = [
  'npm run check:repository-secrets',
  'npm run check:dependency-security',
  'npm run check:release-env',
  'npm run check:rls-production-evidence',
  'npm run check:production-monitoring-evidence',
  'npm run check:production-gates',
  'npm run check:csp-report-only',
  'npm run check:trust-center-claims',
  'npm run check:release-handoff',
  'npm run check:release-local-evidence',
  'npm run typecheck',
  'npm run typecheck:all',
  'npm run lint',
  'npm test',
  'npm run build',
]

const ciCommands = [
  'npm run check:repository-secrets',
  'npm ci',
  'npm run check:dependency-security',
  'npm test',
  'npm run typecheck',
  'npm run typecheck:all',
  'npm run check:release-env',
  'npm run check:rls-production-evidence',
  'npm run check:production-monitoring-evidence',
  'npm run check:production-gates',
  'npm run check:csp-report-only',
  'npm run check:trust-center-claims',
  'npm run check:release-handoff',
  'npm run check:release-local-evidence',
  'npm run lint',
  'npm run build',
]

const requiredBoundaryPhrases = [
  'RELEASE READINESS HANDOFF INDEX PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
  'It is a map, not approval.',
  'Production approval granted by this index: `NO`',
  'Completed evidence must be label-only and sanitized.',
  'Local evidence validator returned `READY_FOR_HUMAN_RELEASE_REVIEW`',
  'Human review packet confirms production-sensitive gates remain separate',
  'The release-env guard must run before production-gate boundary checks',
  'configured QA/prototype `_ACK` / `_ENV` residue',
  '`check:release-env` refuses QA/prototype `_ACK` and `_ENV` residue',
  '`check:release-env-cleanup-guide` reports variable names and safe labels only',
  'The RLS production evidence checker must run before production-gate boundary checks',
  'The production monitoring evidence checker must run before production-gate boundary checks',
  'The CSP report-only evidence checker must run after production-gate boundary checks',
  'The trust-center claims checker must run after production-gate boundary checks',
  'The handoff consistency checker must run after trust-center claims checks',
  'The completed local evidence checker must run after handoff consistency checks',
  'The current completed local evidence includes the 2026-07-08 offline-safe build refresh',
  'Full Vitest completed successfully: 571 test files, 2,275 tests.',
  'build no longer required a Google Fonts network fetch',
  'CI workflow must remain read-only and non-deploying',
  'The dependency security audit must run after `npm ci` and before tests',
  'The repository secret scan must run before `npm ci` and print no matched values',
]

const requiredHumanReviewPhrases = [
  'READY FOR HUMAN RELEASE REVIEW INPUT; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
  'Production approval granted by local evidence: `NO`',
  'Production approval granted by this packet: `NO`',
  'RLS production evidence checker decision: `RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW`',
  'RLS production rollout approved: `NO`',
  'Production monitoring evidence checker decision: `PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW`',
  'Production monitoring runtime approved: `NO`',
  'Production gate checker artifact count: `15`',
  'CSP report-only evidence checker decision: `CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW`',
  'CSP report-only runtime approved: `NO`',
  'Trust-center claims checker decision: `PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW`',
  'Trust-center public claims approved: `NO`',
  'Completed local evidence checker decision: `LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW`',
  'Offline-safe build refresh: `PASS`',
  'Full Vitest completed successfully: `571 test files, 2,275 tests`',
  'Build no longer required a Google Fonts network fetch: `YES`',
  'Release handoff required artifact count: `100`',
  'Release handoff locked gate count: `15`',
  'Content Security Policy runtime and enforcing CSP',
  'CSP runtime/enforcing CSP',
]

const requiredHumanReviewCleanupGuidePhrases = [
  'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
  'Release environment cleanup guide decision: `RELEASE_ENV_CLEANUP_GUIDE_READY`',
  'Cleanup performed for full release runner: `process_scope`',
  'Cleanup guide mutated environment automatically: `NO`',
  'Cleanup guide secret values printed: `NO`',
  'Cleanup guide variables reported by name only: `YES`',
]

const lockedGates = [
  'Membership-aware operational RLS production rollout',
  'Production monitoring runtime and production smoke',
  'Public intake runtime routing production rollout',
  'AI summary safety-chain production rollout',
  'AI reply audit-write, safe-response exposure, generation, and outbound-send rollout',
  'Request-list basic production export',
  'Request-document manifest production export',
  'Export audit reviewer dashboard production exposure',
  'Backup/restore public claims',
  'Public trust-center publication',
  'Content Security Policy runtime and enforcing CSP',
  'Workflow Reminders V1 runtime delivery',
  'Certificate issuance logging runtime',
  'Sacramental correction and notation runtime workflows',
  'Next.js proxy staff authorization hardening',
]

const forbiddenEvidenceLabels = [
  'database URLs',
  'service-role keys',
  'anon keys',
  'API keys',
  'bearer tokens',
  'JWTs',
  'OAuth tokens or refresh tokens',
  'plaintext family portal tokens',
  'signed URL values',
  'storage paths',
  'original filenames',
  'private document contents',
  'raw export contents',
  'raw audit metadata',
  'raw provider payloads',
  'raw production record IDs',
  'staff passwords',
  'parishioner private contact details',
]

const secretLikePatterns = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /session[_-]?cookie\s*=\s*[A-Za-z0-9._-]{20,}/i,
]

const forbiddenCiWorkflowPatterns = [
  {
    code: 'CI_CONTENTS_WRITE_PERMISSION',
    pattern: /contents:\s*write/i,
    message:
      'CI workflow must not request contents: write; release-readiness CI is read-only.',
  },
  {
    code: 'CI_ID_TOKEN_WRITE_PERMISSION',
    pattern: /id-token:\s*write/i,
    message:
      'CI workflow must not request id-token: write; release-readiness CI is not a deployment workflow.',
  },
  {
    code: 'CI_PRODUCTION_ENVIRONMENT',
    pattern: /environment:\s*production/i,
    message:
      'CI workflow must not target the production environment during release-readiness checks.',
  },
  {
    code: 'CI_VERCEL_PRODUCTION_DEPLOY',
    pattern: /\bvercel\s+--prod\b/i,
    message:
      'CI workflow must not run a Vercel production deploy during release-readiness checks.',
  },
  {
    code: 'CI_SUPABASE_MIGRATION_COMMAND',
    pattern: /\bsupabase\s+(db\s+push|migration\s+up)\b/i,
    message:
      'CI workflow must not apply Supabase migrations during release-readiness checks.',
  },
  {
    code: 'CI_PRISMA_MIGRATION_COMMAND',
    pattern: /\bprisma\s+(migrate\s+deploy|db\s+push)\b/i,
    message:
      'CI workflow must not run production-like Prisma migration commands during release-readiness checks.',
  },
  {
    code: 'CI_SHARED_QA_DB_REFERENCE',
    pattern: /\bSHARED_QA_SUPABASE_DB_URL\b/i,
    message:
      'CI workflow must not reference shared-QA database credentials during release-readiness checks.',
  },
  {
    code: 'CI_SERVICE_ROLE_REFERENCE',
    pattern: /\bSUPABASE_SERVICE_ROLE_KEY\b/i,
    message:
      'CI workflow must not reference Supabase service-role credentials during release-readiness checks.',
  },
  {
    code: 'CI_OPENAI_KEY_REFERENCE',
    pattern: /\bOPENAI_API_KEY\b/i,
    message:
      'CI workflow must not reference OpenAI credentials during release-readiness checks.',
  },
]

function readRepoFile(relativePath) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(relativePath) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
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
        message: `Found a secret-like value in ${path}; replace it with a non-secret label before release-readiness handoff.`,
      },
    ]
  })
}

function assertOrderedCommands(sourceName, contents, commands, findings) {
  let previousIndex = -1

  for (const command of commands) {
    const nextIndex = contents.indexOf(command, previousIndex + 1)

    if (nextIndex <= previousIndex) {
      findings.push({
        code: 'COMMAND_ORDER_DRIFT',
        path: sourceName,
        message: `${sourceName} is missing the expected command order at: ${command}`,
      })
      return
    }

    previousIndex = nextIndex
  }
}

function assertCiWorkflowReadOnlyBoundary(contents, findings) {
  if (!contents.includes('permissions:')) {
    findings.push({
      code: 'CI_MISSING_PERMISSIONS_BLOCK',
      path: '.github/workflows/ci.yml',
      message:
        'CI workflow must include an explicit permissions block for release-readiness checks.',
    })
  }

  if (!contents.includes('contents: read')) {
    findings.push({
      code: 'CI_MISSING_CONTENTS_READ',
      path: '.github/workflows/ci.yml',
      message:
        'CI workflow must keep contents: read so release-readiness checks remain read-only.',
    })
  }

  for (const forbidden of forbiddenCiWorkflowPatterns) {
    if (forbidden.pattern.test(contents)) {
      findings.push({
        code: forbidden.code,
        path: '.github/workflows/ci.yml',
        message: forbidden.message,
      })
    }
  }
}

const findings = []

if (!repoPathExists(handoffIndexPath)) {
  findings.push({
    code: 'MISSING_HANDOFF_INDEX',
    path: handoffIndexPath,
    message: `Missing release-readiness handoff index: ${handoffIndexPath}`,
  })
} else {
  const handoffIndex = readRepoFile(handoffIndexPath)

  for (const phrase of requiredBoundaryPhrases) {
    if (!handoffIndex.includes(phrase)) {
      findings.push({
        code: 'MISSING_HANDOFF_BOUNDARY',
        path: handoffIndexPath,
        message: `Missing required handoff boundary phrase: ${phrase}`,
      })
    }
  }

  for (const artifact of requiredArtifacts) {
    if (!handoffIndex.includes(artifact)) {
      findings.push({
        code: 'MISSING_HANDOFF_ARTIFACT_LINK',
        path: handoffIndexPath,
        message: `Handoff index does not link required artifact: ${artifact}`,
      })
    }

    if (!repoPathExists(artifact)) {
      findings.push({
        code: 'MISSING_FILE',
        path: artifact,
        message: `Required release-readiness artifact does not exist: ${artifact}`,
      })
    }
  }

  assertOrderedCommands(handoffIndexPath, handoffIndex, localCommands, findings)

  const ciSectionStart = handoffIndex.indexOf('## Required CI Shape')
  assertOrderedCommands(
    handoffIndexPath,
    ciSectionStart >= 0 ? handoffIndex.slice(ciSectionStart) : handoffIndex,
    ciCommands,
    findings,
  )

  for (const lockedGate of lockedGates) {
    if (!handoffIndex.includes(lockedGate)) {
      findings.push({
        code: 'MISSING_LOCKED_GATE',
        path: handoffIndexPath,
        message: `Handoff index does not list locked gate: ${lockedGate}`,
      })
    }
  }

  for (const forbiddenEvidence of forbiddenEvidenceLabels) {
    if (!handoffIndex.includes(forbiddenEvidence)) {
      findings.push({
        code: 'MISSING_FORBIDDEN_EVIDENCE_LABEL',
        path: handoffIndexPath,
        message: `Handoff index does not ban unsafe evidence label: ${forbiddenEvidence}`,
      })
    }
  }

  findings.push(...findSecretLikeValues(handoffIndexPath, handoffIndex))
}

const readableArtifacts = requiredArtifacts.filter(repoPathExists)

for (const artifact of readableArtifacts) {
  const contents = readRepoFile(artifact)
  findings.push(...findSecretLikeValues(artifact, contents))
}

const humanReviewPacketPath =
  'docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md'

if (repoPathExists(humanReviewPacketPath)) {
  const humanReviewPacket = readRepoFile(humanReviewPacketPath)

  for (const phrase of requiredHumanReviewPhrases) {
    if (!humanReviewPacket.includes(phrase)) {
      findings.push({
        code: 'MISSING_HUMAN_REVIEW_BOUNDARY',
        path: humanReviewPacketPath,
        message: `Human review packet is missing required boundary phrase: ${phrase}`,
      })
    }
  }

  for (const phrase of requiredHumanReviewCleanupGuidePhrases) {
    if (!humanReviewPacket.includes(phrase)) {
      findings.push({
        code: 'MISSING_HUMAN_REVIEW_CLEANUP_GUIDE_BOUNDARY',
        path: humanReviewPacketPath,
        message: `Human review packet is missing required cleanup-guide boundary phrase: ${phrase}`,
      })
    }
  }
}

for (const artifact of [
  'README.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
  'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
]) {
  if (!repoPathExists(artifact)) {
    continue
  }

  assertOrderedCommands(artifact, readRepoFile(artifact), localCommands, findings)
}

if (repoPathExists('.github/workflows/ci.yml')) {
  const ciWorkflow = readRepoFile('.github/workflows/ci.yml')
  assertOrderedCommands('.github/workflows/ci.yml', ciWorkflow, ciCommands, findings)
  assertCiWorkflowReadOnlyBoundary(ciWorkflow, findings)
}

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'RELEASE_HANDOFF_READY_FOR_REVIEW'
      : 'NEEDS_ATTENTION',
  productionSensitiveFeaturesApproved: false,
  publicTrustClaimsApproved: false,
  handoffIndexPath,
  artifactCount: requiredArtifacts.length,
  existingArtifactCount: requiredArtifacts.filter(repoPathExists).length,
  localCommandCount: localCommands.length,
  ciCommandCount: ciCommands.length,
  lockedGateCount: lockedGates.length,
  humanReviewBoundaryCount: requiredHumanReviewPhrases.length,
  cleanupGuideBoundaryCount: requiredHumanReviewCleanupGuidePhrases.length,
  findings,
}

console.log(JSON.stringify(report, null, 2))

if (findings.length > 0) {
  process.exitCode = 1
}
