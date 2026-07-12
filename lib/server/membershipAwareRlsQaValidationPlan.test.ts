import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(process.cwd(), 'docs', 'MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md')
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware RLS QA validation plan', () => {
  it('documents disposable QA safety boundaries without adding an applied migration', () => {
    const plan = readFileSync(planPath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(plan).toContain('Do not apply operational RLS changes')
    expect(plan).toContain('Do not run this plan against production data.')
    expect(plan).toContain('Use disposable parishes')
    expect(plan).toContain('checks.schema: true')
    expect(migrationNames).not.toContain('membership_aware_operational_rls_draft.sql')
    expect(migrationNames).not.toContain('MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md')
  })

  it('requires cross-parish allow and deny cases for each operational area', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const heading of [
      '### People',
      '### Households',
      '### Sacramental Records',
      '### Mass Intentions',
      '### Requests',
      '### Request Notes',
      '### Request Communications',
      '### Workflow Steps',
      '### Documents',
    ]) {
      expect(plan).toContain(heading)
    }

    expect(plan).toContain('qa.staff.a@example.test')
    expect(plan).toContain('qa.staff.ab@example.test')
    expect(plan).toContain('qa.staff.c@example.test')
    expect(plan).toContain('Allow read/write')
    expect(plan).toContain('Deny read/write')
  })

  it('requires regression coverage for public, staff, family, and external-side-effect workflows', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Public Baptism, Wedding, Funeral, OCIA, and Join Parish intake submissions',
      'Request detail pages still load overview, notes, communications, workflow steps, and documents.',
      'family portal route exposes staff-only data',
      'Supabase Storage access remains private',
      'Google Calendar, Email, and AI actions are tested only with safe test credentials.',
      'No anonymous client can directly read or write operational parish tables.',
    ]) {
      expect(plan).toContain(expected)
    }
  })
})
