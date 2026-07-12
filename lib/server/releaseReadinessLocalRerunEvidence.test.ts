import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md',
)

const evidence = readFileSync(evidencePath, 'utf8')

describe('production release readiness local rerun evidence', () => {
  it('records the process-clean full release rerun without granting production approval', () => {
    for (const expected of [
      'LOCAL RELEASE READINESS RERUN PASSED FROM A PROCESS-CLEAN SHELL; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
      'REFUSED_SENSITIVE_RUNTIME_FLAGS',
      'RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
      'Full local release runner executed: `YES`',
      'Full local release runner result: `LOCAL_RELEASE_READINESS_PASSED`',
      'Command count: `12`',
      'Production-sensitive features approved by this evidence: `NO`',
      'Public trust claims approved by this evidence: `NO`',
      'Environment mutated outside the child process: `NO`',
      'Historical completed local release evidence overwritten: `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('lists the full local release command sequence and pass results', () => {
    for (const expected of [
      '`npm run check:release-env` | `PASS`',
      '`npm run check:rls-production-evidence` | `PASS`',
      '`npm run check:production-monitoring-evidence` | `PASS`',
      '`npm run check:production-gates` | `PASS`',
      '`npm run check:csp-report-only` | `PASS`',
      '`npm run check:trust-center-claims` | `PASS`',
      '`npm run check:release-handoff` | `PASS`',
      '`npm run typecheck` | `PASS`',
      '`npm run typecheck:all` | `PASS`',
      '`npm run lint -- --quiet` | `PASS`',
      '`npm test` | `PASS`',
      '`npm run build` | `PASS`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures sanitized release highlights and keeps sensitive gates closed', () => {
    for (const expected of [
      'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
      'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
      'BOUNDARIES_READY_FOR_REVIEW',
      'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW',
      'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
      'RELEASE_HANDOFF_READY_FOR_REVIEW',
      '`547` files passed and `2,184` tests passed',
      'Next.js `16.2.2`',
      'Production approval granted by this evidence: `NO`',
      'Public trust claims approved by this evidence: `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('preserves safety boundaries and excludes secret-shaped evidence', () => {
    for (const expected of [
      'did not deploy code',
      'enable production flags',
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
      expect(evidence).toContain(expected)
    }

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
      expect(evidence).not.toContain(forbidden)
    }
  })
})
