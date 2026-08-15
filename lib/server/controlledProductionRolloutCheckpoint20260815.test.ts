import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const checkpoint = readFileSync(
  resolve(
    process.cwd(),
    'docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260815.md',
  ),
  'utf8',
)

describe('Daily Dashboard merged-main production rollout checkpoint', () => {
  it('binds the exact reviewed source, base, merge, CI, and Preview identities', () => {
    for (const marker of [
      'MAIN MERGED; MAIN ARTIFACT READY; PUBLIC DOMAINS ON ROLLBACK; PRODUCTION ROLLOUT NO-GO',
      '7c332bcae03347bf7b836adc2a697a41703484a6',
      'af631ad17fe557ace020489ad745b93e6d2af357',
      '06e1a0557297665a69b9171dfb137565597d65bf',
      '31885701023',
      'dpl_FdvCXMxu6iMCxjo2N3zcJnhQ9ewX',
      '`READY`, Preview-only',
    ]) {
      expect(checkpoint).toContain(marker)
    }
  })

  it('records the automatic main artifact without claiming operator promotion', () => {
    for (const marker of [
      'dpl_95SD3gCpqr3RSDiK8YesebMQyPQu',
      'No operator',
      'alias-promotion, or production-smoke command was run',
      'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
      'c52d947b0f70ad01c8dc6920ad49979ca17d25d2',
      '`vineaplatform.com`',
      '`www.vineaplatform.com`',
      '`usevinea.com`',
      'access was performed to establish this boundary',
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
