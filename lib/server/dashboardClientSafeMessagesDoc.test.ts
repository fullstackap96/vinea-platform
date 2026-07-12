import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/DASHBOARD_CLIENT_SAFE_MESSAGES_20260707.md'

describe('dashboard client safe messages documentation', () => {
  it('documents the Daily Work Hub follow-up and care-plan client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Dashboard Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/dashboardClientMessages.ts`')
    expect(doc).toContain('`app/dashboard/DashboardPageCore.tsx`')
    expect(doc).toContain('follow-up and care-plan actions')
    expect(doc).toContain('raw AI route, email provider, database, network, or exception text')
    expect(doc).toContain('Existing successful messages and staff validation prompts remain visible')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change email delivery semantics',
      'send new communications',
      'call AI differently',
      'run exports',
      'create signed URLs',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
