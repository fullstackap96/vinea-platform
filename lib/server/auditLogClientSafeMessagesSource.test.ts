import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('audit log client safe messages', () => {
  it('routes audit log API and browser failures through the client allowlist helper', () => {
    const source = readRepoFile('app/dashboard/admin/audit-log/AuditLogPage.tsx')

    expect(source).toContain(
      "import { auditLogClientErrorMessage } from '@/lib/auditLogClientMessages'"
    )
    expect(source).toContain('setError(auditLogClientErrorMessage(data?.error))')
    expect(source).toContain('setError(auditLogClientErrorMessage(err))')
    expect(source).not.toContain("String(data?.error || `Could not load audit log (${res.status})`)")
    expect(source).not.toContain("err instanceof Error ? err.message : 'Could not load audit log.'")
  })

  it('keeps active parish scope and empty state copy intact', () => {
    const source = readRepoFile('app/dashboard/admin/audit-log/AuditLogPage.tsx')

    expect(source).toContain('Audit log is scoped to {activeParishName}.')
    expect(source).toContain('No audit events found.')
    expect(source).toContain('Try a different filter or check again later.')
  })
})
