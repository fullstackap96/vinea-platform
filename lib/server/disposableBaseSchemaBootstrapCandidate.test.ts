import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sqlPath = join(process.cwd(), 'docs', 'sql', 'disposable_base_schema_bootstrap_candidate.sql')
const planPath = join(process.cwd(), 'docs', 'DISPOSABLE_SUPABASE_BASE_SCHEMA_BOOTSTRAP_PLAN.md')

function readSql() {
  return readFileSync(sqlPath, 'utf8')
}

function createdTables(sql: string) {
  return [...sql.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.([a-z_]+)/gi)]
    .map((match) => match[1])
    .sort()
}

describe('disposable base schema bootstrap SQL candidate', () => {
  it('is kept outside supabase migrations and clearly marked disposable-only', () => {
    const sql = readSql()

    expect(sqlPath).toContain(join('docs', 'sql'))
    expect(sqlPath).not.toContain(join('supabase', 'migrations'))

    for (const expected of [
      'STATUS: NOT APPLIED.',
      'DO NOT apply this file to production.',
      'DO NOT apply this file to shared QA.',
      'DO NOT move this file into supabase/migrations.',
      'DO NOT treat this file as an operational RLS migration.',
      'Verify /api/health returns checks.schema: true.',
    ]) {
      expect(sql).toContain(expected)
    }
  })

  it('creates only the approved original base tables from the plan', () => {
    const sql = readSql()

    expect(createdTables(sql)).toEqual([
      'checklist_items',
      'parishioners',
      'request_communications',
      'requests',
    ])

    for (const forbidden of [
      'public.parishes',
      'public.staff_users',
      'public.parish_memberships',
      'public.workflow_templates',
      'public.request_documents',
      'public.rate_limit_buckets',
    ]) {
      expect(sql).not.toContain(`CREATE TABLE IF NOT EXISTS ${forbidden}`)
    }
  })

  it('includes the minimum columns and relationships documented in the plan', () => {
    const sql = readSql()
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'full_name text NOT NULL',
      'parishioner_id uuid NOT NULL REFERENCES public.parishioners (id) ON DELETE CASCADE',
      'request_type text NOT NULL',
      'suggested_date_1 timestamptz NULL',
      'suggested_date_2 timestamptz NULL',
      'suggested_date_3 timestamptz NULL',
      'confirmed_baptism_date timestamptz NULL',
      "status text NOT NULL DEFAULT 'new'",
      'request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE',
      'item_name text NOT NULL',
      'is_completed boolean NOT NULL DEFAULT false',
      'contacted_at timestamptz NOT NULL DEFAULT now()',
      'method text NULL',
      'notes text NULL',
    ]) {
      expect(sql).toContain(expected)
    }

    for (const table of [
      'public.parishioners',
      'public.requests',
      'public.checklist_items',
      'public.request_communications',
    ]) {
      expect(plan).toContain(table)
      expect(sql).toContain(table)
    }
  })
})
