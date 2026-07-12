import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production release readiness handoff index', () => {
  const indexPath = 'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md'

  it('links every required release-readiness entry point', () => {
    const doc = readRepoFile(indexPath)

    expect(doc).toContain(
      'RELEASE READINESS HANDOFF INDEX PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )

    for (const artifact of [
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
      'docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md',
      'docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md',
      'docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md',
      'docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md',
      'docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md',
      'docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md',
      'docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md',
      'docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md',
      'docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md',
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
      'lib/releaseReadinessLocalEvidence.ts',
      '.github/workflows/ci.yml',
      'scripts/release-readiness-env-config.mjs',
      'scripts/check-release-readiness-env.mjs',
      'scripts/prepare-release-readiness-env-cleanup.mjs',
      'scripts/check-release-local-evidence.mjs',
      'scripts/check-release-readiness-handoff.mjs',
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
    ]) {
      expect(doc).toContain(artifact)
      expect(existsSync(join(repoRoot, artifact))).toBe(true)
    }
  })

  it('preserves local and CI command order', () => {
    const doc = readRepoFile(indexPath)

    const localCommands = [
      'npm run check:release-env',
      'npm run check:rls-production-evidence',
      'npm run check:production-monitoring-evidence',
      'npm run check:production-gates',
      'npm run check:csp-report-only',
      'npm run check:trust-center-claims',
      'npm run check:release-handoff',
      'npm run typecheck',
      'npm run typecheck:all',
      'npm run lint',
      'npm test',
      'npm run build',
    ]

    let previousIndex = -1
    for (const command of localCommands) {
      const nextIndex = doc.indexOf(command, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

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

    previousIndex = doc.indexOf('## Required CI Shape')
    for (const command of ciCommands) {
      const nextIndex = doc.indexOf(command, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

    expect(doc).toContain(
      'The release-env guard must run before production-gate boundary checks',
    )
    expect(doc).toContain(
      'The dependency security audit must run after `npm ci` and before tests',
    )
    expect(doc).toContain(
      'The repository secret scan must run before `npm ci` and print no matched values',
    )
    expect(doc).toContain(
      'The RLS production evidence checker must run before production-gate boundary checks',
    )
    expect(doc).toContain(
      'The production monitoring evidence checker must run before production-gate boundary checks',
    )
    expect(doc).toContain(
      'The CSP report-only evidence checker must run after production-gate boundary checks',
    )
    expect(doc).toContain(
      'The trust-center claims checker must run after production-gate boundary checks',
    )
    expect(doc).toContain(
      'The handoff consistency checker must run after production-gate boundary checks',
    )
    expect(doc).toContain(
      'The completed local evidence checker must run after handoff consistency checks',
    )
    expect(doc).toContain('CI workflow must remain read-only and non-deploying')
    expect(doc).toContain('permissions: contents: read')
    expect(doc).toContain('must not apply migrations')
    expect(doc).toContain('service-role, OpenAI, or shared-QA database credential')
  })

  it('documents the optional completed-evidence consistency checker without making it production approval', () => {
    const doc = readRepoFile(indexPath)

    expect(doc).toContain('## Optional Consistency Shortcuts')
    expect(doc).toContain('npm run check:release-local-evidence')
    expect(doc).toContain('npm run check:release-env-cleanup-guide')
    expect(doc).toContain('scripts/check-release-local-evidence.mjs')
    expect(doc).toContain('docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md')
    expect(doc).toContain('process-clean local release-readiness rerun evidence')
    expect(doc).toContain('does not approve production-sensitive gates')
    expect(doc).toContain('variable names and safe labels only')
    expect(doc).toContain('mutatesEnvironment: false')
    expect(doc).toContain('secretValuesPrinted: false')
    expect(doc).toContain('LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW')
    expect(doc).toContain('no-added-production-flags')
    expect(doc).toContain('no-Google-Calendar-data-touch')
    expect(doc).toContain(
      'It does not replace rerunning `npm run check:release-local`',
    )
  })

  it('keeps production-sensitive gates locked and evidence sanitized', () => {
    const doc = readRepoFile(indexPath)

    for (const lockedGate of [
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
    ]) {
      expect(doc).toContain(lockedGate)
    }

    for (const forbiddenEvidence of [
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
    ]) {
      expect(doc).toContain(forbiddenEvidence)
    }

    expect(doc).toContain('productionSensitiveFeaturesApproved` remains `false')
    expect(doc).toContain('publicTrustClaimsApproved` remains `false')
    expect(doc).toContain(
      '`check:release-handoff` returned `RELEASE_HANDOFF_READY_FOR_REVIEW`',
    )
    expect(doc).toContain('Next.js proxy staff auth artifact bundle linked')
    expect(doc).toContain(
      '`check:release-local-evidence` returned `LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW`',
    )
    expect(doc).toContain(
      '`check:release-env-cleanup-guide` reports variable names and safe labels only',
    )
    expect(doc).toContain('CI workflow remains read-only and non-deploying')
    expect(doc).toContain(
      'Local evidence validator returned `READY_FOR_HUMAN_RELEASE_REVIEW`',
    )
    expect(doc).toContain(
      'Human review packet confirms production-sensitive gates remain separate',
    )
    expect(doc).toContain('Production approval granted by this index: `NO`')
  })
})
