import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/DASHBOARD_QUEUE_SAFE_MESSAGES_20260707.md'

describe('dashboard queue safe messages documentation', () => {
  it('documents the Communications and Intake quick-save safe-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Dashboard Queue Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/dashboardQueueClientMessages.ts`')
    expect(doc).toContain('`app/dashboard/communications/actions.ts`')
    expect(doc).toContain('`app/dashboard/intake/actions.ts`')
    expect(doc).toContain('raw Supabase/database, network, provider, token, or exception details')
    expect(doc).toContain('Expected validation messages remain visible')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'send communications',
      'enable automation',
      'run exports',
      'call AI',
      'create signed URLs',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
