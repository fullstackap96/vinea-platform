import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('release readiness verification checklist', () => {
  it('exposes a release environment guard and documents the required top-level checks in order', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-release-readiness-env.mjs')
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
    )

    expect(packageJson).toContain(
      '"check:release-env": "node scripts/check-release-readiness-env.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-env-cleanup-guide": "node scripts/prepare-release-readiness-env-cleanup.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-handoff": "node scripts/check-release-readiness-handoff.mjs"',
    )
    expect(packageJson).toContain(
      '"check:rls-production-evidence": "node scripts/check-rls-production-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:production-monitoring-evidence": "node scripts/check-production-monitoring-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:trust-center-claims": "node scripts/check-trust-center-claims.mjs"',
    )
    expect(packageJson).toContain(
      '"check:csp-report-only": "node scripts/check-csp-report-only-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-local": "node scripts/run-release-readiness-local.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-local-evidence": "node scripts/check-release-local-evidence.mjs"',
    )

    const orderedChecks = [
      'npm run check:release-env',
      'npm run check:rls-production-evidence',
      'npm run check:production-monitoring-evidence',
      'npm run check:production-gates',
      'npm run check:csp-report-only',
      'npm run check:trust-center-claims',
      'npm run check:release-handoff',
      'npm run typecheck',
      'npm run typecheck:all',
      'npm run lint -- --quiet',
      'npm test',
      'npm run build',
    ]

    let previousIndex = -1
    for (const expected of orderedChecks) {
      const nextIndex = doc.indexOf(expected, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

    expect(script).toContain(
      "decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED'",
    )
    expect(script).toContain(
      "import { getUnsafeReleaseRuntimeFlags } from './release-readiness-env-config.mjs'",
    )
    expect(script).toContain('productionSensitiveRuntimeFlagsEnabled: false')
  })

  it('refuses to run when production-sensitive runtime flags are enabled', () => {
    const script = readRepoFile('scripts/check-release-readiness-env.mjs')
    const configScript = readRepoFile('scripts/release-readiness-env-config.mjs')

    expect(configScript).toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME')
    expect(configScript).toContain('VINEA_AI_SUMMARY_SAFETY_RUNTIME')
    expect(configScript).toContain('VINEA_AI_REPLY_SAFETY_RUNTIME')
    expect(configScript).toContain('VINEA_AI_REPLY_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_AI_REPLY_AUDIT_WRITE')
    expect(configScript).toContain('VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE')
    expect(configScript).toContain('VINEA_AI_REPLY_OPENAI_GENERATION')
    expect(configScript).toContain('VINEA_AI_REPLY_SAFETY_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_AI_REPLY_AUDIT_WRITE_ACK')
    expect(configScript).toContain('VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_APPROVAL_ID')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_EXPIRES_AT')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER')
    expect(configScript).toContain('VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT')
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER')
    expect(configScript).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL'
    )
    expect(configScript).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER')
    expect(configScript).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER'
    )
    expect(configScript).toContain('VINEA_WORKFLOW_REMINDERS_RUNTIME')
    expect(configScript).toContain('VINEA_WORKFLOW_REMINDERS_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME')
    expect(configScript).toContain('VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME')
    expect(configScript).toContain('VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME')
    expect(configScript).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_OBSERVABILITY_RUNTIME')
    expect(configScript).toContain('VINEA_OBSERVABILITY_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_OBSERVABILITY_RUNTIME_ENV')
    expect(configScript).toContain('VINEA_PRODUCTION_MONITORING_RUNTIME')
    expect(configScript).toContain('VINEA_PRODUCTION_MONITORING_RUNTIME_ACK')
    expect(configScript).toContain('VINEA_PRODUCTION_MONITORING_RUNTIME_ENV')
    expect(script).toContain("decision: 'REFUSED_SENSITIVE_RUNTIME_FLAGS'")
    expect(script).toContain(
      'Release readiness verification must run with production-sensitive runtime flags disabled.',
    )
  })

  it('blocks newly added production-sensitive gate flags when enabled', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/check-release-readiness-env.mjs'],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          VINEA_CSP_REPORT_ONLY_RUNTIME: 'ENABLED',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION: 'PRODUCTION',
          VINEA_OBSERVABILITY_RUNTIME: 'ENABLED',
          VINEA_AI_REPLY_AUDIT_WRITE: 'ENABLED',
          VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE: 'ENABLED',
        },
        encoding: 'utf8',
      }
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('REFUSED_SENSITIVE_RUNTIME_FLAGS')
    expect(result.stderr).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME')
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION'
    )
    expect(result.stderr).toContain('VINEA_OBSERVABILITY_RUNTIME')
    expect(result.stderr).toContain('VINEA_AI_REPLY_AUDIT_WRITE')
    expect(result.stderr).toContain('VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE')
    expect(result.stderr).not.toContain('APPROVED')
  })

  it('treats common truthy values as enabled runtime flags', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/check-release-readiness-env.mjs'],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME: 'true',
          VINEA_EXPORT_RUNTIME: '1',
          VINEA_WORKFLOW_REMINDERS_RUNTIME: 'yes',
          VINEA_CSP_REPORT_ONLY_RUNTIME: 'on',
          VINEA_AI_REPLY_RUNTIME_ENV: 'NON_PRODUCTION',
          VINEA_AI_REPLY_SAFETY_RUNTIME: 'enabled',
        },
        encoding: 'utf8',
      }
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('REFUSED_SENSITIVE_RUNTIME_FLAGS')
    expect(result.stderr).toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME')
    expect(result.stderr).toContain('VINEA_WORKFLOW_REMINDERS_RUNTIME')
    expect(result.stderr).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME')
    expect(result.stderr).toContain('VINEA_AI_REPLY_RUNTIME_ENV')
    expect(result.stderr).toContain('VINEA_AI_REPLY_SAFETY_RUNTIME')
  })

  it('refuses approval acknowledgement and runtime environment residue even when the main switch is absent', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/check-release-readiness-env.mjs'],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK:
            'APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME',
          VINEA_AI_SUMMARY_AUDIT_WRITE_ACK:
            'APPROVED_AI_SUMMARY_AUDIT_WRITE',
          VINEA_AI_REPLY_AUDIT_WRITE_ACK:
            'APPROVED_AI_REPLY_AUDIT_WRITE_QA',
          VINEA_EXPORT_RUNTIME_ACK: 'APPROVED_EXPORT_RUNTIME_QA',
          VINEA_EXPORT_RUNTIME_ENV: 'NON_PRODUCTION',
          VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST: 'request_document_manifest',
          VINEA_EXPORT_RUNTIME_APPROVAL_ID: 'REQUEST_DOCUMENT_MANIFEST_PRODUCTION_SMOKE_20260708',
          VINEA_EXPORT_RUNTIME_EXPIRES_AT: '2026-07-08T12:00:00Z',
          VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER: 'Vinea export rollback owner',
          VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL: 'Owner-managed rollout notes',
          VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV: 'NON_PRODUCTION',
          VINEA_PRODUCTION_MONITORING_RUNTIME_ACK:
            'APPROVED_PRODUCTION_MONITORING_RUNTIME',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK:
            'APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV: 'PRODUCTION',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST:
            'export_audit_reviewer_dashboard,export_audit_reviewer_api_read_model',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID:
            'EXPORT_AUDIT_REVIEWER_DASHBOARD_SMOKE_20260708',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT: '2026-07-08T12:00:00Z',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER:
            'Vinea dashboard rollback owner',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL:
            'Owner-managed dashboard smoke notes',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER:
            'Vinea support owner',
          VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER:
            'Vinea evidence owner',
        },
        encoding: 'utf8',
      }
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('REFUSED_SENSITIVE_RUNTIME_FLAGS')
    expect(result.stderr).toContain('VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK')
    expect(result.stderr).toContain('VINEA_AI_SUMMARY_AUDIT_WRITE_ACK')
    expect(result.stderr).toContain('VINEA_AI_REPLY_AUDIT_WRITE_ACK')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_ACK')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_ENV')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_APPROVAL_ID')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_EXPIRES_AT')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER')
    expect(result.stderr).toContain('VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL')
    expect(result.stderr).toContain('VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV')
    expect(result.stderr).toContain('VINEA_PRODUCTION_MONITORING_RUNTIME_ACK')
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK'
    )
    expect(result.stderr).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV')
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST'
    )
    expect(result.stderr).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID')
    expect(result.stderr).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT')
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER'
    )
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL'
    )
    expect(result.stderr).toContain('VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER')
    expect(result.stderr).toContain(
      'VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER'
    )
    expect(result.stderr).toContain('present-and-configured')
    expect(result.stderr).not.toContain('APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME')
    expect(result.stderr).not.toContain('APPROVED_AI_REPLY_AUDIT_WRITE_QA')
    expect(result.stderr).not.toContain('APPROVED_EXPORT_RUNTIME_QA')
    expect(result.stderr).not.toContain('request_document_manifest')
    expect(result.stderr).not.toContain('REQUEST_DOCUMENT_MANIFEST_PRODUCTION_SMOKE_20260708')
    expect(result.stderr).not.toContain('Vinea export rollback owner')
    expect(result.stderr).not.toContain(
      'APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE'
    )
    expect(result.stderr).not.toContain('EXPORT_AUDIT_REVIEWER_DASHBOARD_SMOKE_20260708')
    expect(result.stderr).not.toContain('export_audit_reviewer_api_read_model')
    expect(result.stderr).not.toContain('Owner-managed dashboard smoke notes')
  })

  it('provides a read-only cleanup guide for configured QA/prototype release-env residue', () => {
    const packageJson = readRepoFile('package.json')
    const cleanupScript = readRepoFile(
      'scripts/prepare-release-readiness-env-cleanup.mjs',
    )
    const configScript = readRepoFile('scripts/release-readiness-env-config.mjs')
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
    )

    expect(packageJson).toContain(
      '"check:release-env-cleanup-guide": "node scripts/prepare-release-readiness-env-cleanup.mjs"',
    )
    expect(cleanupScript).toContain(
      "import { getUnsafeReleaseRuntimeFlags } from './release-readiness-env-config.mjs'",
    )
    expect(cleanupScript).toContain('mutatesEnvironment: false')
    expect(cleanupScript).toContain('secretValuesPrinted: false')
    expect(cleanupScript).toContain('Remove-Item Env:\\\\')
    expect(cleanupScript).toContain(
      "[Environment]::SetEnvironmentVariable('${name}', $null, 'User')",
    )
    expect(configScript).toContain('forbiddenEnabledRuntimeFlags')
    expect(configScript).toContain('forbiddenConfiguredRuntimeResidueFlags')
    expect(doc).toContain('variable names only')
    expect(doc).toContain('does not clear anything automatically')
    expect(doc).toContain('npm run check:release-env-cleanup-guide')
    expect(doc).toContain('Remove-Item Env:\\VINEA_EXAMPLE_FLAG')
    expect(doc).toContain(
      "[Environment]::SetEnvironmentVariable('VINEA_EXAMPLE_FLAG', $null, 'User')",
    )
    expect(doc).toContain('Do not paste secrets into the evidence file')
  })

  it('prints only variable names and safe labels when cleanup guidance finds residue', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/prepare-release-readiness-env-cleanup.mjs'],
      {
        cwd: repoRoot,
        env: {
          PATH: process.env.PATH ?? '',
          NODE_ENV: process.env.NODE_ENV ?? 'test',
          SystemRoot: process.env.SystemRoot ?? '',
          ComSpec: process.env.ComSpec ?? '',
          VINEA_AI_SUMMARY_AUDIT_WRITE_ACK:
            'APPROVED_AI_SUMMARY_AUDIT_WRITE_SECRET_SHOULD_NOT_PRINT',
          VINEA_EXPORT_RUNTIME_ENV: 'NON_PRODUCTION',
          VINEA_CSP_REPORT_ONLY_RUNTIME: 'enabled',
        },
        encoding: 'utf8',
      },
    )

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('RELEASE_ENV_CLEANUP_GUIDE_READY')
    expect(result.stdout).toContain('VINEA_AI_SUMMARY_AUDIT_WRITE_ACK')
    expect(result.stdout).toContain('VINEA_EXPORT_RUNTIME_ENV')
    expect(result.stdout).toContain('VINEA_CSP_REPORT_ONLY_RUNTIME')
    expect(result.stdout).toContain('present-and-configured')
    expect(result.stdout).toContain('present-and-enabled')
    expect(result.stdout).toContain('mutatesEnvironment')
    expect(result.stdout).toContain('secretValuesPrinted')
    expect(result.stdout).toContain(
      'Remove-Item Env:\\\\VINEA_AI_SUMMARY_AUDIT_WRITE_ACK',
    )
    expect(result.stdout).toContain(
      "[Environment]::SetEnvironmentVariable('VINEA_EXPORT_RUNTIME_ENV', $null, 'User')",
    )
    expect(result.stdout).not.toContain(
      'APPROVED_AI_SUMMARY_AUDIT_WRITE_SECRET_SHOULD_NOT_PRINT',
    )
  })

  it('reports a clean release environment without requiring secrets or special credentials', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/prepare-release-readiness-env-cleanup.mjs'],
      {
        cwd: repoRoot,
        env: {
          PATH: process.env.PATH ?? '',
          NODE_ENV: process.env.NODE_ENV ?? 'test',
          SystemRoot: process.env.SystemRoot ?? '',
          ComSpec: process.env.ComSpec ?? '',
        },
        encoding: 'utf8',
      },
    )

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('RELEASE_ENV_ALREADY_CLEAN')
    expect(result.stdout).toContain('secretValuesPrinted')
    expect(result.stdout).toContain('false')
    expect(result.stdout).toContain('Run npm run check:release-env from the same shell.')
    expect(result.stdout).not.toContain('APPROVED')
  })

  it('documents the local release-readiness command without approving production rollout', () => {
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
    )
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')

    expect(doc).toContain('Current decision state: `LOCAL RELEASE READINESS COMMAND PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`')
    expect(doc).toContain('npm run check:release-local')
    expect(doc).toContain('npm run check:release-local -- --plan')
    expect(doc).toContain('npm run check:release-env-cleanup-guide')
    expect(doc).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
    )
    expect(doc).toContain('npm run check:release-local-evidence')
    expect(doc).toContain('LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW')
    expect(doc).toContain('npm run check:release-env')
    expect(doc).toContain('npm run check:rls-production-evidence')
    expect(doc).toContain('npm run check:production-monitoring-evidence')
    expect(doc).toContain('npm run check:production-gates')
    expect(doc).toContain('npm run check:csp-report-only')
    expect(doc).toContain('npm run check:trust-center-claims')
    expect(doc).toContain('npm run check:release-handoff')
    expect(doc).toContain('npm run typecheck')
    expect(doc).toContain('npm run typecheck:all')
    expect(doc).toContain('npm run lint -- --quiet')
    expect(doc).toContain('npm test')
    expect(doc).toContain('npm run build')
    expect(doc).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
    )
    expect(doc).toContain('does not deploy')
    expect(doc).toContain('does not enable production flags')
    expect(doc).toContain('does not apply migrations')
    expect(doc).toContain('does not make public trust-center claims')
    expect(roadmap).toContain('no-added-production-flags confirmation')
    expect(roadmap).toContain('no-Google-Calendar-data-touch confirmation')
    expect(roadmap).toContain(
      'no production flags were added and no Google Calendar data was touched',
    )
  })
})
