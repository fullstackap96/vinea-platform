import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const packetPath =
  'docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md'

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production release readiness human review packet', () => {
  it('links the required source evidence without granting production approval', () => {
    const doc = readRepoFile(packetPath)

    expect(doc).toContain(
      'READY FOR HUMAN RELEASE REVIEW INPUT; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )

    for (const artifact of [
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md',
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
      'docs/DEPENDENCY_SECURITY_REMEDIATION_20260709.md',
      'docs/REPOSITORY_SECRET_SCANNING_BASELINE_20260709.md',
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
      'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
      'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md',
      'docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md',
      'docs/NEXT_PROXY_STAFF_AUTH_CURRENT_COMPATIBILITY_BOUNDARY_20260708.md',
      'docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md',
      'docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md',
      'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md',
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_CONSISTENCY_CHECKER_20260707.md',
      'scripts/check-release-local-evidence.mjs',
      '.github/workflows/ci.yml',
    ]) {
      expect(doc).toContain(artifact)
      expect(existsSync(join(repoRoot, artifact))).toBe(true)
    }

    expect(doc).toContain('Production approval granted by local evidence: `NO`')
    expect(doc).toContain('Production approval granted by this packet: `NO`')
  })

  it('keeps all sensitive gates separate from the local release review', () => {
    const doc = readRepoFile(packetPath)

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

    expect(doc).toContain(
      'RLS production evidence checker decision: `RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW`',
    )
    expect(doc).toContain('RLS production rollout approved: `NO`')
    expect(doc).toContain(
      'Production monitoring evidence checker decision: `PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW`',
    )
    expect(doc).toContain('Production monitoring runtime approved: `NO`')
    expect(doc).toContain('Production gate checker artifact count: `15`')
    expect(doc).toContain(
      'CSP report-only evidence checker decision: `CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW`',
    )
    expect(doc).toContain('CSP report-only runtime approved: `NO`')
    expect(doc).toContain(
      'Trust-center claims checker decision: `PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW`',
    )
    expect(doc).toContain('Trust-center public claims approved: `NO`')
    expect(doc).toContain(
      'Completed local evidence checker decision: `LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW`',
    )
    expect(doc).toContain(
      'Release environment cleanup guide decision: `RELEASE_ENV_CLEANUP_GUIDE_READY`',
    )
    expect(doc).toContain(
      'Cleanup performed for full release runner: `process_scope`',
    )
    expect(doc).toContain(
      'Cleanup guide mutated environment automatically: `NO`',
    )
    expect(doc).toContain('Cleanup guide secret values printed: `NO`')
    expect(doc).toContain(
      'Cleanup guide variables reported by name only: `YES`',
    )
    expect(doc).toContain('docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md')
    expect(doc).toContain('docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md')
    expect(doc).toContain('docs/CORE_RECORD_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(doc).toContain('docs/REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(doc).toContain('docs/DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_20260710.md')
    expect(doc).toContain('docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md')
    expect(doc).toContain('docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_REPLY_DRAFT_ACTIVE_PARISH_ROUTE_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_OPERATIONAL_DETAIL_PROJECTION_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_SERVER_AGGREGATE_SIGNALS_20260710.md')
    expect(doc).toContain('docs/REPORTS_SERVER_AGGREGATE_SUMMARY_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_SERVER_READ_MODEL_20260710.md')
    expect(doc).toContain('docs/DAILY_WORK_HUB_SINGLE_RESPONSE_COMPOSITION_20260710.md')
    expect(doc).toContain('docs/DASHBOARD_SHELL_SERVER_CONTEXT_EXACT_PARISH_ADMIN_20260710.md')
    expect(doc).toContain('docs/COMMUNICATIONS_CENTER_ACTIVE_PARISH_MUTATION_API_20260710.md')
    expect(doc).toContain('docs/INTAKE_QUEUE_ACTIVE_PARISH_TRIAGE_APIS_20260710.md')
    expect(doc).toContain('docs/SACRAMENTAL_RECORD_CREATE_RELATIONSHIP_INTEGRITY_20260710.md')
    expect(doc).toContain('docs/CORE_RECORD_ACTION_ACTIVE_PARISH_FALLBACK_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/REQUEST_NOTE_AUDIT_METADATA_PRIVACY_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/REQUEST_CONTENT_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/REQUEST_MUTATION_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/REQUEST_SCHEDULE_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/GOOGLE_CALENDAR_DATA_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/BAPTISM_CERTIFICATE_ACTIVE_PARISH_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/DUPLICATE_REVIEW_EXPLICIT_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/SACRAMENTAL_RECORD_READ_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/SACRAMENTAL_RECORD_PREFILL_REQUEST_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/CORE_DIRECTORY_LIST_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/CORE_DETAIL_READ_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/CARE_CALENDAR_INTAKE_INTENTION_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('docs/PARISH_DAILY_BRIEF_PROJECTION_BOUNDARY_20260710.md')
    expect(doc).toContain('Release handoff required artifact count: `100`')
    expect(doc).toContain(
      'Repository secret scan: `REPOSITORY_SECRET_SCAN_PASSED`; matched values printed `NO`',
    )
    expect(doc).toContain(
      'Complete dependency audit after remediation: `0` known vulnerabilities',
    )
    expect(doc).toContain('Release handoff locked gate count: `15`')
    expect(doc).toContain('CSP runtime/enforcing CSP')
    expect(doc).toContain(
      'Production-sensitive features remain unapproved and must continue through their separate gate-specific approval and smoke-test processes.',
    )
    expect(doc).toContain(
      'Production deployment, production-sensitive feature rollout, public trust-center publication',
    )
  })

  it('contains no secret-like values or unsafe raw evidence markers', () => {
    const doc = readRepoFile(packetPath)

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'token_hash:',
      'signedUrl',
      'Bearer ',
      'sk-',
    ]) {
      expect(doc).not.toContain(forbidden)
    }
  })
})
