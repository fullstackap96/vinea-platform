import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('README production-readiness guidance', () => {
  it('links release-readiness docs and keeps the command sequence visible', () => {
    const readme = readRepoFile('README.md')

    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_CHECKER_20260707.md',
    )
    expect(readme).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md',
    )
    expect(readme).toContain('docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md')
    expect(readme).toContain(
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
    )
    expect(readme).toContain('docs/SAFE_ERROR_LOGGING_KEY_REDACTION_20260707.md')
    expect(readme).toContain('docs/ACTIVE_PARISH_CONTEXT_SAFE_DETAILS_20260707.md')
    expect(readme).toContain('docs/GOOGLE_CALENDAR_USER_ERROR_REDACTION_20260707.md')
    expect(readme).toContain(
      'docs/STAFF_LOGIN_SAFE_ERROR_AND_ACCESSIBLE_LABELS_20260707.md',
    )
    expect(readme).toContain(
      'docs/FAMILY_PORTAL_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md',
    )
    expect(readme).toContain('docs/REQUEST_DETAIL_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/DASHBOARD_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/DASHBOARD_QUEUE_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/PUBLIC_INTAKE_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/DEMO_REQUEST_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/AUDIT_LOG_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/WORKFLOW_TEMPLATE_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/ONBOARDING_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('docs/PARISH_SETTINGS_CLIENT_SAFE_MESSAGES_20260707.md')
    expect(readme).toContain('CSP remains separate')
    expect(readme).toContain('not runtime approval')
    expect(readme).toContain('not production approval')
    expect(readme).toContain('Fresh process-clean local release-readiness rerun evidence')
    expect(readme).toContain('npm run check:release-local')
    expect(readme).toContain('npm run check:release-env-cleanup-guide')
    expect(readme).toContain('npm run check:release-local -- --plan')
    expect(readme).toContain('npm run check:release-local-evidence')

    const orderedCommands = [
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
    for (const command of orderedCommands) {
      const nextIndex = readme.indexOf(command, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

    expect(readme).toContain('validate the filled label-only record')
  })

  it('states that release-readiness checks are not production approval', () => {
    const readme = readRepoFile('README.md')

    for (const boundary of [
      'does not deploy',
      'approve or add production flags',
      'add production flags',
      'access production',
      'apply migrations',
      'change operational RLS',
      'mutate records',
      'touch Google Calendar data',
      'run exports',
      'call AI',
      'access storage',
      'create signed URLs',
      'send communications',
      'generate certificates',
      'make public trust-center claims',
    ]) {
      expect(readme).toContain(boundary)
    }
  })
})
