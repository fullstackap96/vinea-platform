import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_BLOCKED_20260708.md',
)

const evidence = readFileSync(evidencePath, 'utf8')

describe('production release readiness local rerun blocked evidence', () => {
  it('records the fail-closed release-env refusal without granting production approval', () => {
    for (const expected of [
      'LOCAL RELEASE READINESS RERUN BLOCKED BY QA RUNTIME RESIDUE; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
      'REFUSED_SENSITIVE_RUNTIME_FLAGS',
      'Full local release runner started: `NO`',
      'Historical completed local release evidence overwritten: `NO`',
      'Secrets or raw values captured: `NO`',
      'Variables reported by name only: `YES`',
      'RELEASE_ENV_CLEANUP_GUIDE_READY',
      'Cleanup guide mutated environment automatically: `NO`',
      'Cleanup guide secret values printed: `NO`',
      'Cleanup performed by Codex in this attempt: `NO`',
      'BLOCKED_BEFORE_HEAVY_CHECKS',
      'Production approval granted by this evidence: `NO`',
      'Public trust claims approved by this evidence: `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('lists only allowed AI summary QA variable names and safe labels', () => {
    for (const expected of [
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME',
      'VINEA_AI_SUMMARY_AUDIT_WRITE',
      'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION',
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK',
      'VINEA_AI_SUMMARY_AUDIT_WRITE_ACK',
      'VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK',
      'present-and-enabled',
      'present-and-configured',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('preserves production safety boundaries and avoids secret-shaped evidence', () => {
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
