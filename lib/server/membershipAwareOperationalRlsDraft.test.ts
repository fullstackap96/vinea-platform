import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const draftPath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_draft.sql'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware operational RLS draft', () => {
  it('keeps the RLS work as a non-applied draft outside Supabase migrations', () => {
    const migrationNames = readdirSync(migrationsDir)

    expect(draftPath).toContain(join('docs', 'sql'))
    expect(draftPath).not.toContain(join('supabase', 'migrations'))
    expect(migrationNames).not.toContain('membership_aware_operational_rls_draft.sql')
  })

  it('defines membership-aware replacements for direct parish-scoped tables', () => {
    const sql = readFileSync(draftPath, 'utf8')

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

    expect(sql).toContain('public.is_authorized_for_parish(parish_id)')
    expect(sql).not.toContain('primary_parish_id()')
  })

  it('defines request-scoped membership checks without reopening anonymous operational access', () => {
    const sql = readFileSync(draftPath, 'utf8')

    expect(sql).toContain(
      'CREATE OR REPLACE FUNCTION public.request_belongs_to_staff_parish(p_request_id uuid)'
    )
    expect(sql).toContain('public.is_authorized_for_parish(p.parish_id)')
    expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC')
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) TO authenticated')

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

    expect(sql).not.toMatch(/TO\s+anon/i)
    expect(sql).not.toMatch(/CREATE\s+POLICY/i)
  })

  it('covers workflow steps and documents required by the QA validation plan', () => {
    const sql = readFileSync(draftPath, 'utf8')

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

    expect(sql).toContain('ON public.request_workflow_steps')
    expect(sql).toContain('ON public.request_documents')
    expect(sql).toContain('public.is_authorized_for_parish(parish_id)')
    expect(sql).toContain('public.request_belongs_to_staff_parish(request_id)')
    expect(sql).toContain('workflow_step_id IS NULL')
    expect(sql).toContain('FROM public.request_workflow_steps rws')
    expect(sql).toContain('rws.request_id = request_documents.request_id')
    expect(sql).toContain('rws.parish_id = request_documents.parish_id')
  })
})
