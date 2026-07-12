import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/AUDIT_LOG_CLIENT_SAFE_MESSAGES_20260707.md'

describe('audit log client safe messages documentation', () => {
  it('documents the Audit Log client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Audit Log Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/auditLogClientMessages.ts`')
    expect(doc).toContain('`app/dashboard/admin/audit-log/AuditLogPage.tsx`')
    expect(doc).toContain('allowlisted authentication, authorization, setup, and load messages')
    expect(doc).toContain('raw Supabase/database, token, storage, route, raw id, or exception details')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'mutate records',
      'run exports',
      'call AI',
      'access storage',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
