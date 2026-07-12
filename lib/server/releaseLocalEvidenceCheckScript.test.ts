import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('completed local release evidence checker script', () => {
  it('is exposed as an npm script and validates the completed evidence boundary', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/check-release-local-evidence.mjs')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(packageJson).toContain(
      '"check:release-local-evidence": "node scripts/check-release-local-evidence.mjs"',
    )
    expect(script).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md',
    )
    expect(script).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
    )
    expect(script).toContain('LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW')
    expect(script).toContain('productionSensitiveFeaturesApproved: false')
    expect(script).toContain('publicTrustClaimsApproved: false')
    expect(script).toContain('productionApprovalGranted: false')
    expect(script).toContain('QA/prototype ACK or ENV residue configured: `NO`')
    expect(script).toContain(
      '2026-07-08 Full Local Release Runner Refresh - Offline Font Boundary And Nested Vitest Loader',
    )
    expect(script).toContain('Full Vitest completed successfully: 571 test files, 2,275 tests.')
    expect(script).toContain('release-handoff artifact count `29`')
    expect(script).toContain('existing artifact count `29`')
    expect(script).toContain('2026-07-08 Proxy Auth Release Handoff Artifact Bundle Addendum')
    expect(script).toContain('release-handoff artifact count `33`')
    expect(script).toContain('existing artifact count `33`')
    expect(script).toContain('locked gate count `15`')
    expect(script).toContain('human review boundary count `20`')
    expect(script).toContain('Next.js proxy staff auth artifact bundle linked: `YES`')
    expect(script).toContain('Proxy auth runtime behavior changed by this addendum: `NO`')
    expect(script).toContain('Production dashboard auth changes approved by this addendum: `NO`')
    expect(script).toContain('2026-07-09 Fresh Full Local Release Readiness Refresh')
    expect(script).toContain(
      'Initial `npm.cmd run check:release-env` decision: `REFUSED_SENSITIVE_RUNTIME_FLAGS`',
    )
    expect(script).toContain('Initial residue variable count: `8`')
    expect(script).toContain(
      'Sanitized runner environment decision: `RELEASE_READINESS_ENVIRONMENT_ACCEPTED`',
    )
    expect(script).toContain(
      'Full Vitest completed successfully: `632` test files, `2,480` tests.',
    )
    expect(script).toContain('Full runner decision: `LOCAL_RELEASE_READINESS_PASSED`')
    expect(script).toContain('2026-07-09 Dependency Security Remediation Recheck')
    expect(script).toContain(
      'Complete dependency audit after remediation: `0` known vulnerabilities.',
    )
    expect(script).toContain(
      'Production-only dependency audit after remediation: `0` known vulnerabilities.',
    )
    expect(script).toContain(
      'Post-remediation Next.js production build: `PASS` with Next.js `16.2.10`.',
    )
    expect(script).toContain('2026-07-09 CI Dependency Security Gate Addendum')
    expect(script).toContain(
      'Required CI dependency command: `npm run check:dependency-security`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after dependency baseline linkage: `34`.',
    )
    expect(script).toContain('2026-07-09 Repository Secret Scanning Gate Addendum')
    expect(script).toContain(
      'Repository secret scan decision: `REPOSITORY_SECRET_SCAN_PASSED`.',
    )
    expect(script).toContain('Matched secret values printed: `NO`.')
    expect(script).toContain(
      'Release handoff artifact count after scanner bundle linkage: `37`.',
    )
    expect(script).toContain('2026-07-09 Supported Node LTS Baseline Addendum')
    expect(script).toContain('Supported CI runtime line: `Node.js 24 LTS`.')
    expect(script).toContain('Package engine: `>=24.0.0 <25`.')
    expect(script).toContain(
      'Release handoff artifact count after Node baseline linkage: `39`.',
    )
    expect(script).toContain(
      '2026-07-09 Non-Secret Environment Configuration Contract Addendum',
    )
    expect(script).toContain('Committed environment example: `.env.example`.')
    expect(script).toContain(
      'Release handoff artifact count after environment baseline linkage: `41`.',
    )
    expect(script).toContain(
      '2026-07-09 Immutable CI Action Provenance Addendum',
    )
    expect(script).toContain(
      'GitHub Actions references pinned to full commit SHAs: `YES`.',
    )
    expect(script).toContain(
      'Mutable major-version action references remaining: `0`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after CI provenance linkage: `42`.',
    )
    expect(script).toContain(
      '2026-07-09 Dependency Update Maintenance Addendum',
    )
    expect(script).toContain('npm version updates checked weekly: `YES`.')
    expect(script).toContain('GitHub Actions updates checked weekly: `YES`.')
    expect(script).toContain('Automatic merge configured: `NO`.')
    expect(script).toContain(
      'Release handoff artifact count after dependency maintenance linkage: `44`.',
    )
    expect(script).toContain('2026-07-09 Public Health Response Safety Addendum')
    expect(script).toContain(
      'Healthy production `checks.schema` contract preserved: `YES`.',
    )
    expect(script).toContain(
      'Missing schema labels exposed in production failures: `NO`.',
    )
    expect(script).toContain(
      'Health rate-limit readiness probe mutates durable buckets: `NO`.',
    )
    expect(script).toContain(
      'Unexpected RPC errors treated as healthy: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after health safety linkage: `45`.',
    )
    expect(script).toContain(
      '2026-07-09 Demo Request Durable Rate Limit Addendum',
    )
    expect(script).toContain(
      'Rate limit runs before request body parsing and email delivery: `YES`.',
    )
    expect(script).toContain('Limiter failure behavior: `fail-closed 503`.')
    expect(script).toContain(
      'Release handoff artifact count after demo rate-limit linkage: `46`.',
    )
    expect(script).toContain(
      '2026-07-09 Request Notifications Durable Rate Limit Addendum',
    )
    expect(script).toContain(
      'Request identity verification preserved after rate limiting: `YES`.',
    )
    expect(script).toContain(
      'Email sent after notification limiter denial or failure: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after notification rate-limit linkage: `47`.',
    )
    expect(script).toContain(
      '2026-07-09 Family Portal Document Upload Durable Rate Limit Addendum',
    )
    expect(script).toContain(
      'Portal token material included in rate-limit key: `NO`.',
    )
    expect(script).toContain(
      'Storage accessed after family upload limiter denial or failure: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after family upload rate-limit linkage: `48`.',
    )
    expect(script).toContain('2026-07-09 Public JSON Body Size Boundary Addendum')
    expect(script).toContain('Public intake JSON limit: `64 KiB`.')
    expect(script).toContain(
      'Direct `request.json()` calls remaining in the three protected routes: `0`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after public JSON boundary linkage: `49`.',
    )
    expect(script).toContain('2026-07-09 Staff Email Send Body Size Boundary Addendum')
    expect(script).toContain('Staff email JSON limit: `128 KiB`.')
    expect(script).toContain(
      'Email provider constructed or called after malformed/oversized rejection: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after staff email boundary linkage: `50`.',
    )
    expect(script).toContain('2026-07-09 Google Calendar Event Body Size Boundary Addendum')
    expect(script).toContain('Google Calendar event JSON limit: `16 KiB`.')
    expect(script).toContain(
      'Google Calendar event created, updated, or deleted during verification: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after Google Calendar body boundary linkage: `51`.',
    )
    expect(script).toContain('2026-07-09 AI Route Body Size Boundary Addendum')
    expect(script).toContain('AI route JSON limit: `256 KiB`.')
    expect(script).toContain('OpenAI called during boundary verification: `NO`.')
    expect(script).toContain(
      'Release handoff artifact count after AI body boundary linkage: `52`.',
    )
    expect(script).toContain('2026-07-09 Request Communication Body Size Boundary Addendum')
    expect(script).toContain('Request communication JSON limit: `64 KiB`.')
    expect(script).toContain(
      'Communication row or request summary written after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after request communication boundary linkage: `53`.',
    )
    expect(script).toContain('2026-07-09 Request Text Mutation Body Size Boundary Addendum')
    expect(script).toContain('Request text mutation JSON limit: `256 KiB`.')
    expect(script).toContain(
      'Staff notes, saved AI summary, or reply draft updated after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after request text boundary linkage: `54`.',
    )
    expect(script).toContain('2026-07-09 Request Schedule Mutation Body Size Boundary Addendum')
    expect(script).toContain('Request schedule mutation JSON limit: `32 KiB`.')
    expect(script).toContain('Suggested or confirmed date updated after rejected body: `NO`.')
    expect(script).toContain(
      'Release handoff artifact count after request schedule boundary linkage: `55`.',
    )
    expect(script).toContain('2026-07-09 Request Pastoral Detail Body Size Boundary Addendum')
    expect(script).toContain('Request pastoral detail JSON limit: `128 KiB`.')
    expect(script).toContain('Funeral or Wedding detail read/upsert after rejected body: `NO`.')
    expect(script).toContain(
      'Release handoff artifact count after pastoral detail boundary linkage: `56`.',
    )
    expect(script).toContain('2026-07-09 Request Workflow Metadata Body Size Boundary Addendum')
    expect(script).toContain('Request workflow metadata JSON limit: `32 KiB`.')
    expect(script).toContain(
      'Checklist/document read, update, audit, or storage work after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after workflow metadata boundary linkage: `57`.',
    )
    expect(script).toContain('2026-07-09 Parish Administration Body Size Boundary Addendum')
    expect(script).toContain('Parish settings JSON limit: `128 KiB`.')
    expect(script).toContain('Workflow-template step JSON limit: `64 KiB`.')
    expect(script).toContain('Staff-access command JSON limit: `16 KiB`.')
    expect(script).toContain(
      'Parish/workflow/staff read, mutation, or audit work after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after parish administration boundary linkage: `58`.',
    )
    expect(script).toContain('2026-07-09 Audit Events Body Size Boundary Addendum')
    expect(script).toContain('Audit event JSON limit: `64 KiB`.')
    expect(script).toContain(
      'Request/parish resolution or audit write after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after audit-event boundary linkage: `59`.',
    )
    expect(script).toContain('2026-07-09 Public Intake Routing Admin Body Size Boundary Addendum')
    expect(script).toContain('Public intake routing admin JSON limit: `32 KiB`.')
    expect(script).toContain(
      'Parish scope, token, DNS, row, or audit work after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Runtime public intake routing enabled or approved by this boundary: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after routing-admin boundary linkage: `60`.',
    )
    expect(script).toContain('2026-07-09 Duplicate Merge Body Size Boundary Addendum')
    expect(script).toContain('Duplicate merge JSON limit: `32 KiB`.')
    expect(script).toContain(
      'Entity read, update, repoint, delete, or audit work after rejected body: `NO`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after duplicate-merge boundary linkage: `61`.',
    )
    expect(script).toContain('2026-07-09 Imports Body Size Boundary Addendum')
    expect(script).toContain('Import JSON limit: `4 MiB`.')
    expect(script).toContain('Import maximum rows per request remains: `1,000`.')
    expect(script).toContain(
      'Import preview, row, batch, or audit work after rejected body: `NO`.',
    )
    expect(script).toContain('Direct request.json calls remaining in API route handlers: `0`.')
    expect(script).toContain(
      'Release handoff artifact count after import boundary linkage: `62`.',
    )
    expect(script).toContain('2026-07-09 Duplicate And Import Client Safe Messages Addendum')
    expect(script).toContain('People duplicate raw API error rendering remains: `NO`.')
    expect(script).toContain('Import preview/commit raw API error rendering remains: `NO`.')
    expect(script).toContain(
      'Unexpected backend text replaced by action-specific fallbacks: `YES`.',
    )
    expect(script).toContain(
      'Release handoff artifact count after client redaction linkage: `63`.',
    )
    expect(script).toContain('build no longer required a Google Fonts network fetch')
    expect(script).toContain(
      'Production approval granted by this offline font boundary refresh: `NO`',
    )
    expect(script).toContain(
      '2026-07-08 Full Local Release Runner Refresh - Cleanup-Guide Evidence And Windows Adapter',
    )
    expect(script).toContain(
      'Release environment cleanup guide decision: `RELEASE_ENV_CLEANUP_GUIDE_READY`',
    )
    expect(script).toContain(
      'Cleanup performed for full release runner: `process_scope`',
    )
    expect(script).toContain('Cleanup guide mutated environment automatically: `NO`')
    expect(script).toContain('Cleanup guide secret values printed: `NO`')
    expect(script).toContain('Variables reported by name only: `YES`')
    expect(script).toContain('Raw values captured in cleanup evidence: `NO`')
    expect(script).toContain('2026-07-08 Focused Gate Count Recheck')
    expect(script).toContain('artifact count `14`')
    expect(script).toContain('release-handoff artifact count `28`')
    expect(script).toContain('artifact count `28`')
    expect(script).toContain('locked gate count `14`')
    expect(script).toContain('Human review boundary count: `17`')
    expect(script).toContain('Production approval granted by this full refresh: `NO`')
    expect(script).toContain(
      'Fresh full local release checklist still required before any future release handoff after later material changes: `YES`',
    )
    expect(script).toContain('This evidence did not add production flags.')
    expect(script).toContain('This evidence did not touch Google Calendar data.')
    expect(script).toContain(
      'releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured: false',
    )
    expect(script).toContain('releaseEnvCleanupGuide.decision: NOT_RUN')
    expect(script).toContain('releaseEnvCleanupGuide.mutatesEnvironment: false')
    expect(script).toContain('releaseEnvCleanupGuide.secretValuesPrinted: false')
    expect(script).toContain(
      'releaseEnvCleanupGuide.variablesReportedByNameOnly: true',
    )
    expect(script).toContain('releaseEnvCleanupGuide.rawValuesCaptured: false')
    expect(script).toContain('releaseEnvCleanupGuide.cleanupPerformed: none')
    expect(script).toContain('COMMAND_RESULT_ORDER_DRIFT')
    expect(script).toContain('UNSAFE_SECRET_LIKE_VALUE')
    expect(sourceOfTruth).toContain(
      '`npm run check:release-local-evidence` now requires the completed evidence record to state that the check did not add production flags and did not touch Google Calendar data',
    )
  })

  it('returns a sanitized ready-for-human-review decision for the current evidence', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-release-local-evidence.mjs'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const report = JSON.parse(output) as {
      decision: string
      productionSensitiveFeaturesApproved: boolean
      publicTrustClaimsApproved: boolean
      productionApprovalGranted: boolean
      commandCount: number
      requiredPhraseCount: number
      findings: unknown[]
    }

    expect(report.decision).toBe('LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW')
    expect(report.productionSensitiveFeaturesApproved).toBe(false)
    expect(report.publicTrustClaimsApproved).toBe(false)
    expect(report.productionApprovalGranted).toBe(false)
    expect(report.commandCount).toBe(12)
    expect(report.requiredPhraseCount).toBe(510)
    expect(report.findings).toEqual([])
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })
})
