import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('release readiness handoff consistency checker', () => {
  it('is exposed as an npm script and checks the required release handoff artifacts', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-release-readiness-handoff.mjs')

    expect(packageJson).toContain(
      '"check:release-handoff": "node scripts/check-release-readiness-handoff.mjs"',
    )

    for (const artifact of [
      'README.md',
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
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
      'lib/releaseReadinessLocalEvidence.ts',
      '.github/workflows/ci.yml',
      'scripts/release-readiness-env-config.mjs',
      'scripts/check-release-readiness-env.mjs',
      'scripts/prepare-release-readiness-env-cleanup.mjs',
      'scripts/run-release-readiness-local.mjs',
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
    ]) {
      expect(script).toContain(artifact)
    }

    expect(script).toContain('RELEASE_HANDOFF_READY_FOR_REVIEW')
    expect(script).toContain('READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(script).toContain(
      'READY FOR HUMAN RELEASE REVIEW INPUT; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )
    expect(script).toContain('Content Security Policy runtime and enforcing CSP')
    expect(script).toContain(
      'The trust-center claims checker must run after production-gate boundary checks',
    )
    expect(script).toContain('configured QA/prototype `_ACK` / `_ENV` residue')
    expect(script).toContain(
      '`check:release-env` refuses QA/prototype `_ACK` and `_ENV` residue',
    )
    expect(script).toContain(
      '`check:release-env-cleanup-guide` reports variable names and safe labels only',
    )
    expect(script).toContain(
      'The RLS production evidence checker must run before production-gate boundary checks',
    )
    expect(script).toContain(
      'The production monitoring evidence checker must run before production-gate boundary checks',
    )
    expect(script).toContain(
      'The CSP report-only evidence checker must run after production-gate boundary checks',
    )
    expect(script).toContain(
      'The handoff consistency checker must run after trust-center claims checks',
    )
    expect(script).toContain(
      'The completed local evidence checker must run after handoff consistency checks',
    )
    expect(script).toContain(
      'The current completed local evidence includes the 2026-07-08 offline-safe build refresh',
    )
    expect(script).toContain(
      'Full Vitest completed successfully: 571 test files, 2,275 tests.',
    )
    expect(script).toContain('build no longer required a Google Fonts network fetch')
    expect(script).toContain('CI workflow must remain read-only and non-deploying')
    expect(script).toContain(
      'The dependency security audit must run after `npm ci` and before tests',
    )
    expect(script).toContain(
      'The repository secret scan must run before `npm ci` and print no matched values',
    )
    expect(script).toContain('assertCiWorkflowReadOnlyBoundary')
    expect(script).toContain('CI_MISSING_CONTENTS_READ')
    expect(script).toContain('CI_CONTENTS_WRITE_PERMISSION')
    expect(script).toContain('CI_VERCEL_PRODUCTION_DEPLOY')
    expect(script).toContain('CI_SUPABASE_MIGRATION_COMMAND')
    expect(script).toContain('CI_SERVICE_ROLE_REFERENCE')
    expect(script).toContain(
      'RLS production evidence checker decision: `RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW`',
    )
    expect(script).toContain(
      'Production monitoring evidence checker decision: `PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW`',
    )
    expect(script).toContain(
      'CSP report-only evidence checker decision: `CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW`',
    )
    expect(script).toContain(
      'Trust-center claims checker decision: `PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW`',
    )
    expect(script).toContain(
      'Completed local evidence checker decision: `LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW`',
    )
    expect(script).toContain('Offline-safe build refresh: `PASS`')
    expect(script).toContain(
      'Full Vitest completed successfully: `571 test files, 2,275 tests`',
    )
    expect(script).toContain(
      'Build no longer required a Google Fonts network fetch: `YES`',
    )
    expect(script).toContain('requiredHumanReviewCleanupGuidePhrases')
    expect(script).toContain(
      'Release environment cleanup guide decision: `RELEASE_ENV_CLEANUP_GUIDE_READY`',
    )
    expect(script).toContain(
      'Cleanup performed for full release runner: `process_scope`',
    )
    expect(script).toContain(
      'Cleanup guide mutated environment automatically: `NO`',
    )
    expect(script).toContain('Cleanup guide secret values printed: `NO`')
    expect(script).toContain(
      'Cleanup guide variables reported by name only: `YES`',
    )
    expect(script).toContain('MISSING_HUMAN_REVIEW_CLEANUP_GUIDE_BOUNDARY')
    expect(script).toContain('docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md')
    expect(script).toContain('docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md')
    expect(script).toContain('docs/CORE_RECORD_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(script).toContain('docs/REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(script).toContain('docs/DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_20260710.md')
    expect(script).toContain('docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(script).toContain('docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md')
    expect(script).toContain('docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md')
    expect(script).toContain('docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md')
    expect(script).toContain('docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md')
    expect(script).toContain('docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md')
    expect(script).toContain('docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md')
    expect(script).toContain('docs/REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md')
    expect(script).toContain('docs/STAFF_AUTH_SESSION_EXIT_BOUNDARY_20260710.md')
    expect(script).toContain('docs/STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_20260710.md')
    expect(script).toContain('docs/STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md')
    expect(script).toContain('docs/RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_20260711.md')
    expect(script).toContain('docs/SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_20260711.md')
    expect(script).toContain('docs/PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_20260711.md')
    expect(script).toContain('docs/REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md')
    expect(script).toContain('docs/STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md')
    expect(script).toContain('docs/GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_20260711.md')
    expect(script).toContain('docs/DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_20260711.md')
    expect(script).toContain('docs/HOUSEHOLD_MEMBER_PRIMARY_CONTACT_OWNERSHIP_ORDER_20260711.md')
    expect(script).toContain('docs/CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_20260711.md')
    expect(script).toContain('docs/DUPLICATE_MERGE_CONFIRMATION_DIALOG_20260711.md')
    expect(script).toContain('docs/REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_20260711.md')
    expect(script).toContain('docs/REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_20260711.md')
    expect(script).toContain('docs/DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_20260711.md')
    expect(script).toContain('docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(script).toContain(
      'docs/REQUEST_DOCUMENT_UPLOAD_COMPENSATION_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/GOOGLE_CALENDAR_REQUEST_LINK_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/OUTBOUND_EMAIL_DELIVERY_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/DUPLICATE_MERGE_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/DASHBOARD_REQUEST_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/REQUEST_INTAKE_EDITOR_PERSISTENCE_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/HOUSEHOLD_PRIMARY_CONTACT_COMPENSATION_BOUNDARY_20260711.md',
    )
    expect(script).toContain(
      'docs/OPERATIONAL_AUDIT_METADATA_PRIVACY_BOUNDARY_20260711.md',
    )
    expect(script).toContain('docs/DAILY_WORK_HUB_REPLY_DRAFT_ACTIVE_PARISH_ROUTE_20260710.md')
    expect(script).toContain('docs/DAILY_WORK_HUB_OPERATIONAL_DETAIL_PROJECTION_20260710.md')
    expect(script).toContain('docs/DAILY_WORK_HUB_SERVER_AGGREGATE_SIGNALS_20260710.md')
    expect(script).toContain('docs/REPORTS_SERVER_AGGREGATE_SUMMARY_20260710.md')
    expect(script).toContain('docs/DAILY_WORK_HUB_SERVER_READ_MODEL_20260710.md')
    expect(script).toContain('docs/DAILY_WORK_HUB_SINGLE_RESPONSE_COMPOSITION_20260710.md')
    expect(script).toContain('docs/DASHBOARD_SHELL_SERVER_CONTEXT_EXACT_PARISH_ADMIN_20260710.md')
    expect(script).toContain('docs/EXPORT_SELECTED_PARISH_ROLE_BOUNDARY_20260710.md')
    expect(script).toContain('docs/COMMUNICATIONS_CENTER_ACTIVE_PARISH_MUTATION_API_20260710.md')
    expect(script).toContain('docs/INTAKE_QUEUE_ACTIVE_PARISH_TRIAGE_APIS_20260710.md')
    expect(script).toContain('docs/SACRAMENTAL_RECORD_CREATE_RELATIONSHIP_INTEGRITY_20260710.md')
    expect(script).toContain('docs/CORE_RECORD_ACTION_ACTIVE_PARISH_FALLBACK_BOUNDARY_20260710.md')
    expect(script).toContain('docs/REQUEST_NOTE_AUDIT_METADATA_PRIVACY_BOUNDARY_20260710.md')
    expect(script).toContain('docs/REQUEST_CONTENT_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(script).toContain('docs/REQUEST_MUTATION_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(script).toContain('docs/REQUEST_SCHEDULE_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(script).toContain('docs/GOOGLE_CALENDAR_DATA_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/BAPTISM_CERTIFICATE_ACTIVE_PARISH_BOUNDARY_20260710.md')
    expect(script).toContain('docs/DUPLICATE_REVIEW_EXPLICIT_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/SACRAMENTAL_RECORD_READ_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/SACRAMENTAL_RECORD_PREFILL_REQUEST_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/CORE_DIRECTORY_LIST_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/CORE_DETAIL_READ_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/CARE_CALENDAR_INTAKE_INTENTION_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('docs/PARISH_DAILY_BRIEF_PROJECTION_BOUNDARY_20260710.md')
    expect(script).toContain('Release handoff required artifact count: `100`')
    expect(script).toContain('Production gate checker artifact count: `15`')
    expect(script).toContain('Release handoff locked gate count: `15`')
    expect(script).toContain(
      'AI reply audit-write, safe-response exposure, generation, and outbound-send rollout',
    )
    expect(script).toContain('productionSensitiveFeaturesApproved: false')
    expect(script).toContain('publicTrustClaimsApproved: false')
    expect(script).toContain('UNSAFE_SECRET_LIKE_VALUE')
  })

  it('returns a sanitized ready-for-review decision for the current handoff package', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-release-readiness-handoff.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      productionSensitiveFeaturesApproved: boolean
      publicTrustClaimsApproved: boolean
      artifactCount: number
      existingArtifactCount: number
      localCommandCount: number
      ciCommandCount: number
      lockedGateCount: number
      humanReviewBoundaryCount: number
      cleanupGuideBoundaryCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe('RELEASE_HANDOFF_READY_FOR_REVIEW')
    expect(report.productionSensitiveFeaturesApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.artifactCount).toBe(141)
    expect(report.existingArtifactCount).toBe(141)
    expect(report.localCommandCount).toBe(12)
    expect(report.ciCommandCount).toBe(16)
    expect(report.lockedGateCount).toBe(15)
    expect(report.humanReviewBoundaryCount).toBe(20)
    expect(report.cleanupGuideBoundaryCount).toBe(6)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
