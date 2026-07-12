import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const forwardDraftPath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_draft.sql'
)
const rollbackDraftPath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_rollback_draft.sql'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

type PolicyTarget = {
  policy: string
  table: string
}

function readDrafts() {
  return {
    forward: readFileSync(forwardDraftPath, 'utf8'),
    rollback: readFileSync(rollbackDraftPath, 'utf8'),
  }
}

function extractPolicyTargets(sql: string): PolicyTarget[] {
  return Array.from(
    sql.matchAll(/ALTER\s+POLICY\s+"([^"]+)"\s+ON\s+public\.([a-z0-9_]+)/gi)
  )
    .map((match) => ({
      policy: match[1],
      table: match[2],
    }))
    .sort((a, b) => `${a.table}:${a.policy}`.localeCompare(`${b.table}:${b.policy}`))
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort()
}

describe('membership-aware operational RLS draft parity', () => {
  it('keeps forward and rollback drafts outside Supabase migrations', () => {
    const migrationNames = readdirSync(migrationsDir)
    const { forward, rollback } = readDrafts()

    expect(forward).toContain('DRAFT ONLY - NOT A SUPABASE MIGRATION')
    expect(rollback).toContain('DRAFT ONLY - NOT A SUPABASE MIGRATION')
    expect(forwardDraftPath).toContain(join('docs', 'sql'))
    expect(rollbackDraftPath).toContain(join('docs', 'sql'))
    expect(forwardDraftPath).not.toContain(join('supabase', 'migrations'))
    expect(rollbackDraftPath).not.toContain(join('supabase', 'migrations'))
    expect(migrationNames).not.toContain('membership_aware_operational_rls_draft.sql')
    expect(migrationNames).not.toContain(
      'membership_aware_operational_rls_rollback_draft.sql'
    )
  })

  it('covers the same operational policy names in forward and rollback drafts', () => {
    const { forward, rollback } = readDrafts()

    const forwardPolicies = uniqueValues(
      extractPolicyTargets(forward).map(({ policy }) => policy)
    )
    const rollbackPolicies = uniqueValues(
      extractPolicyTargets(rollback).map(({ policy }) => policy)
    )

    expect(rollbackPolicies).toEqual(forwardPolicies)
  })

  it('targets the same operational tables in forward and rollback drafts', () => {
    const { forward, rollback } = readDrafts()

    const forwardTables = uniqueValues(
      extractPolicyTargets(forward).map(({ table }) => table)
    )
    const rollbackTables = uniqueValues(
      extractPolicyTargets(rollback).map(({ table }) => table)
    )

    expect(rollbackTables).toEqual(forwardTables)
    expect(forwardTables).toEqual([
      'checklist_items',
      'funeral_request_details',
      'household_members',
      'households',
      'join_parish_request_details',
      'mass_intentions',
      'ocia_request_details',
      'parishioners',
      'people',
      'request_communications',
      'request_documents',
      'request_notes',
      'request_workflow_steps',
      'requests',
      'sacramental_record_events',
      'sacramental_records',
      'wedding_request_details',
    ])
  })

  it('keeps each policy pointed at the same table on both sides', () => {
    const { forward, rollback } = readDrafts()

    expect(extractPolicyTargets(rollback)).toEqual(extractPolicyTargets(forward))
  })

  it('preserves paired helper semantics for forward and rollback safety', () => {
    const { forward, rollback } = readDrafts()

    expect(forward).toContain(
      'CREATE OR REPLACE FUNCTION public.request_belongs_to_staff_parish(p_request_id uuid)'
    )
    expect(forward).toContain('public.is_authorized_for_parish(')
    expect(forward).toContain('public.request_belongs_to_staff_parish(request_id)')

    expect(rollback).toContain('public.primary_parish_id()')
    expect(rollback).toContain('public.request_belongs_to_primary_parish(request_id)')
    expect(rollback).toContain(
      'DROP FUNCTION IF EXISTS public.request_belongs_to_staff_parish(uuid)'
    )
    expect(rollback).not.toContain('public.request_belongs_to_staff_parish(request_id)')
  })
})
