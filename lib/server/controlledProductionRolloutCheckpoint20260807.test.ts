import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const checkpoint = readFileSync(
  resolve(repoRoot, 'docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260807.md'),
  'utf8',
)

describe('merged-main controlled production rollout checkpoint', () => {
  it('binds the exact merged release and green verification identities', () => {
    for (const marker of [
      'MAIN MERGED; RELEASE ARTIFACT READY; PRODUCTION ALIASES UNCHANGED; PRODUCTION ROLLOUT NO-GO',
      'c7626c460714aae8dab459a79a30ad4a62f44486',
      '46190a71aa46146b4df0eb0a2e60cac8040572bd',
      '31215092349',
      'dpl_3USyZGXXyiQ5VQCn5Qixsixixd6i',
      'all six reported checks `true`',
    ]) {
      expect(checkpoint).toContain(marker)
    }
  })

  it('records the ready artifact without claiming production promotion', () => {
    for (const marker of [
      'dpl_EBrGS8ErXLVqctTqikUNUFh4mwj3',
      'deploy or promotion command was run.',
      'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
      'c52d947b0f70ad01c8dc6920ad49979ca17d25d2',
      '`vineaplatform.com`',
      'still resolve in Vercel control-plane',
      'metadata to the rollback deployment',
    ]) {
      expect(checkpoint).toContain(marker)
    }
  })

  it('requires owners, safe fixtures, redacted evidence, and rollback', () => {
    for (const marker of [
      'Required Gates Before Any Rollout',
      'Dedicated production-smoke authentication',
      'Separately locked production-sensitive flags',
      'Read-Only Smoke Boundary',
      'Stop And Rollback Criteria',
      'label-only pass/fail evidence',
      '`KEEP` or `ROLLBACK`',
      'decision remains `NO-GO`',
    ]) {
      expect(checkpoint).toContain(marker)
    }
  })

  it('does not embed credentials or private fixture values', () => {
    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'VERCEL_TOKEN=',
      'OPENAI_API_KEY=',
      'Bearer ',
      'access_token=',
      'refresh_token=',
      'token_hash:',
      'signedUrl',
      'sk-',
    ]) {
      expect(checkpoint).not.toContain(forbidden)
    }
  })
})
