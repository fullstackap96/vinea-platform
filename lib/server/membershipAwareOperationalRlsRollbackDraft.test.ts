import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const rollbackDraftPath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_rollback_draft.sql'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware operational RLS rollback draft', () => {
  it('keeps the rollback as a non-applied draft outside Supabase migrations', () => {
    const migrationNames = readdirSync(migrationsDir)
    const sql = readFileSync(rollbackDraftPath, 'utf8')

    expect(sql).toContain('DRAFT ONLY - NOT A SUPABASE MIGRATION')
    expect(rollbackDraftPath).toContain(join('docs', 'sql'))
    expect(rollbackDraftPath).not.toContain(join('supabase', 'migrations'))
    expect(migrationNames).not.toContain(
      'membership_aware_operational_rls_rollback_draft.sql'
    )
  })

  it('restores primary parish scoping for direct parish-scoped tables', () => {
    const sql = readFileSync(rollbackDraftPath, 'utf8')

    for (const table of [
      'parishioners',
      'people',
      'households',
      'household_members',
      'sacramental_records',
      'sacramental_record_events',
      'mass_intentions',
    ]) {
      expect(sql).toContain(`ON public.${table}`)
    }

    expect(sql).toContain(
      'public.is_authorized_staff() AND parish_id = public.primary_parish_id()'
    )
    expect(sql).not.toContain('public.is_authorized_for_parish(')
  })

  it('restores primary request helper scoping without adding new policies', () => {
    const sql = readFileSync(rollbackDraftPath, 'utf8')

    for (const table of [
      'requests',
      'checklist_items',
      'request_communications',
      'request_notes',
      'request_workflow_steps',
      'request_documents',
      'funeral_request_details',
      'wedding_request_details',
      'ocia_request_details',
      'join_parish_request_details',
    ]) {
      expect(sql).toContain(`ON public.${table}`)
    }

    expect(sql).toContain('p.parish_id = public.primary_parish_id()')
    expect(sql).toContain('public.request_belongs_to_primary_parish(request_id)')
    expect(sql).not.toContain('public.request_belongs_to_staff_parish(request_id)')
    expect(sql).not.toMatch(/TO\s+anon/i)
    expect(sql).not.toMatch(/CREATE\s+POLICY/i)
  })

  it('covers workflow/document rollback details and removes the future helper last', () => {
    const sql = readFileSync(rollbackDraftPath, 'utf8')

    for (const policy of [
      'request_workflow_steps_select_staff',
      'request_workflow_steps_insert_staff',
      'request_workflow_steps_update_staff',
      'request_documents_select_staff',
      'request_documents_insert_staff',
      'request_documents_update_staff',
    ]) {
      expect(sql).toContain(`ALTER POLICY "${policy}"`)
    }

    expect(sql).toContain('workflow_step_id IS NULL')
    expect(sql).toContain('FROM public.request_workflow_steps rws')
    expect(sql).toContain('rws.request_id = request_documents.request_id')
    expect(sql).toContain('rws.parish_id = request_documents.parish_id')
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC'
    )
    expect(sql).toContain(
      'DROP FUNCTION IF EXISTS public.request_belongs_to_staff_parish(uuid)'
    )
    expect(sql.trim().endsWith('DROP FUNCTION IF EXISTS public.request_belongs_to_staff_parish(uuid);')).toBe(
      true
    )
  })
})
