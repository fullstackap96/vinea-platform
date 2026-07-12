import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const auditRoutePath = join(process.cwd(), 'app', 'api', 'audit-events', 'route.ts')
const auditPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'admin',
  'audit-log',
  'AuditLogPage.tsx'
)
const evidencePath = join(
  process.cwd(),
  'docs',
  'AUDIT_LOG_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('audit log selected parish scope UX', () => {
  it('keeps audit events scoped through active parish context and exposes only the display name', () => {
    const route = readFileSync(auditRoutePath, 'utf8')

    expect(route).toContain('resolveAuditEventsReadParishId(staff.supabase, requestedParishId)')
    expect(route).toContain(".eq('parish_id', parishId)")
    expect(route).toContain('activeParishName: parishContext.activeParish.name ?? null')
    expect(route).not.toContain('parishContext.parishes')
    expect(route).not.toContain('parishIds:')
  })

  it('shows a visible selected parish label on the Audit Log page', () => {
    const page = readFileSync(auditPagePath, 'utf8')

    expect(page).toContain('activeParishName')
    expect(page).toContain("setActiveParishName(String(data.activeParishName ?? '').trim())")
    expect(page).toContain('Audit log is scoped to')
    expect(page).toContain('/api/audit-events?')
  })

  it('clears the display label when audit events fail to load', () => {
    const page = readFileSync(auditPagePath, 'utf8')

    expect(page).toContain("setActiveParishName('')")
    expect(page).toContain('setEvents([])')
  })

  it('documents the non-production-safe scope and avoids sensitive values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'runtime authorization behavior was not changed',
      'no secrets were exposed',
      'Audit log is scoped to',
      'does not promote production RLS',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
