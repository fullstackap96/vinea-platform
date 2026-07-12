import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const checkpointPath =
  'docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md'

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('controlled production rollout checkpoint', () => {
  it('binds the merged release, rollback, and evidence identities', () => {
    const doc = readRepoFile(checkpointPath)

    for (const marker of [
      'MAIN MERGED; PRODUCTION ROUTING RESTORED TO PRIOR DEPLOYMENT; CONTROLLED ROLLOUT REMAINS NO-GO',
      'f134b598308ddd78b5b6b81ee447bf5b1fb15937',
      'dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG',
      'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
      'c52d947b0f70ad01c8dc6920ad49979ca17d25d2',
      'vinea-platform-oru4kih31-vinea.vercel.app',
      '`vineaplatform.com` mapped to `vinea-platform-oru4kih31-vinea.vercel.app`',
    ]) {
      expect(doc).toContain(marker)
    }

    for (const artifact of [
      'docs/RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711.md',
      'docs/RELEASE_CANDIDATE_COMMIT_SCOPE_REVIEW_20260711.md',
      'docs/RELEASE_CANDIDATE_TECHNICAL_APPROVAL_20260711.md',
      'docs/RELEASE_CANDIDATE_PROTECTED_PREVIEW_SMOKE_20260712.md',
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
      'docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md',
      'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md',
    ]) {
      expect(doc).toContain(artifact)
      expect(existsSync(join(repoRoot, artifact))).toBe(true)
    }
  })

  it('requires owners, safe fixtures, smoke limits, and rollback criteria', () => {
    const doc = readRepoFile(checkpointPath)

    for (const requirement of [
      'Product owner',
      'Engineering rollout owner',
      'Security/data owner',
      'QA owner',
      'Monitoring owner/channel',
      'Support owner/channel',
      'Rollback owner',
      'Evidence owner',
      'Production-Safe Fixture Requirements',
      'Pre-Rollout Gates',
      'Production-Safe Smoke Boundary',
      'Stop And Rollback Criteria',
      'checks.schema: true',
      'generic cross-parish denial',
      'Do not rebuild, apply migrations, or change flags as part of promotion.',
    ]) {
      expect(doc).toContain(requirement)
    }
  })

  it('keeps every sensitive capability separately locked', () => {
    const doc = readRepoFile(checkpointPath)

    for (const lockedGate of [
      'membership-aware operational RLS production rollout',
      'production monitoring runtime',
      'request-list or document-manifest production exports',
      'public-intake runtime routing',
      'AI summary or reply production runtime',
      'CSP report-only or enforcing CSP runtime',
      'workflow reminder delivery',
      'certificate issuance logging runtime',
      'sacramental correction or notation runtime',
      'public backup/restore, compliance, security, or trust-center claims',
    ]) {
      expect(doc).toContain(lockedGate)
    }

    expect(doc).toContain(
      'Until that exact language is intentionally supplied with all placeholders replaced by real non-secret values, the decision remains `NO-GO`.',
    )
  })

  it('contains no embedded credential or private-data material', () => {
    const doc = readRepoFile(checkpointPath)

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'VERCEL_TOKEN=',
      'OPENAI_API_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'Bearer ',
      'access_token=',
      'refresh_token=',
      'token_hash:',
      'signedUrl',
      'sk-',
    ]) {
      expect(doc).not.toContain(forbidden)
    }
  })
})

