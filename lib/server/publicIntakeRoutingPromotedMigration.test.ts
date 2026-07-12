import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
const migrationName = '20260625193000_public_intake_parish_routing.sql'
const migrationPath = join(migrationsDir, migrationName)
const rollbackPath = join(
  process.cwd(),
  'docs',
  'sql',
  'public_intake_parish_routing_rollback_draft.sql'
)

describe('promoted public intake parish routing migration', () => {
  it('exists as an applied migration candidate with rollback reference', () => {
    const migrationNames = readdirSync(migrationsDir)
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migrationNames).toContain(migrationName)
    expect(migration).toContain('Rollback reference:')
    expect(migration).toContain('docs/sql/public_intake_parish_routing_rollback_draft.sql')
    expect(migration).toContain('Runtime intake routing remains unwired')
    expect(migration).toContain('operational RLS policies are intentionally not changed')
  })

  it('creates the public intake routing schema foundation', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    for (const expected of [
      'ADD COLUMN IF NOT EXISTS public_slug text',
      'ADD COLUMN IF NOT EXISTS public_display_name text',
      'ADD COLUMN IF NOT EXISTS public_intake_enabled boolean NOT NULL DEFAULT false',
      'parishes_public_slug_format_check',
      'CREATE UNIQUE INDEX IF NOT EXISTS parishes_public_slug_lower_unique',
      'CREATE TABLE IF NOT EXISTS public.parish_public_intake_domains',
      'CREATE TABLE IF NOT EXISTS public.parish_public_intake_tokens',
      "request_type IN ('baptism', 'funeral', 'wedding', 'ocia', 'join_parish')",
    ]) {
      expect(migration).toContain(expected)
    }
  })

  it('keeps routing management staff-scoped and does not add anonymous policies', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    for (const expected of [
      'ALTER TABLE public.parish_public_intake_domains ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE public.parish_public_intake_tokens ENABLE ROW LEVEL SECURITY',
      'TO authenticated',
      'public.is_authorized_for_parish(parish_id)',
      'Intentionally no anon policies',
    ]) {
      expect(migration).toContain(expected)
    }

    expect(migration).not.toContain('TO anon')
    expect(migration).not.toMatch(/ALTER TABLE public\.(requests|parishioners|people|households|sacramental_records|mass_intentions)/)
    expect(migration).not.toContain('request_workflow_steps')
    expect(migration).not.toContain('request_documents')
  })

  it('keeps the rollback draft paired with the promoted objects', () => {
    const rollback = readFileSync(rollbackPath, 'utf8')

    for (const expected of [
      'DROP TABLE IF EXISTS public.parish_public_intake_tokens',
      'DROP TABLE IF EXISTS public.parish_public_intake_domains',
      'DROP INDEX IF EXISTS public.parishes_public_slug_lower_unique',
      'DROP COLUMN IF EXISTS public_intake_enabled',
      'DROP COLUMN IF EXISTS public_display_name',
      'DROP COLUMN IF EXISTS public_slug',
    ]) {
      expect(rollback).toContain(expected)
    }
  })
})
