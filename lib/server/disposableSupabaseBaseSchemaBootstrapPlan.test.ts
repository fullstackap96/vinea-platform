import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(process.cwd(), 'docs', 'DISPOSABLE_SUPABASE_BASE_SCHEMA_BOOTSTRAP_PLAN.md')

describe('disposable Supabase base schema bootstrap plan', () => {
  it('defines the original pre-migration base tables required for blank disposable projects', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'public.parishioners',
      'public.requests',
      'public.checklist_items',
      'public.request_communications',
      'id uuid primary key',
      'full_name text not null',
      'parishioner_id uuid references public.parishioners(id) on delete cascade',
      'request_id uuid not null references public.requests(id) on delete cascade',
      'item_name text not null',
      'contacted_at timestamptz not null default now()',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('keeps migration-created tables out of the base bootstrap contract', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      '## Tables Created By Current Migrations',
      'public.parishes',
      'public.funeral_request_details',
      'public.wedding_request_details',
      'public.ocia_request_details',
      'public.join_parish_request_details',
      'public.workflow_templates',
      'public.request_documents',
      'public.rate_limit_buckets',
      'public.parish_memberships',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('requires disposable-only execution and health/intake evidence before promotion', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Do not apply this bootstrap to production.',
      'Do not apply this bootstrap to shared QA.',
      'Do not move this plan into `supabase/migrations`.',
      'Apply all repo migrations in sorted filename order from `supabase/migrations`.',
      'checks.schema: true',
      'Baptism submits successfully.',
      'Wedding submits successfully.',
      'Funeral submits successfully.',
      'OCIA submits successfully.',
      'Join Parish submits successfully.',
      'Durable 429 behavior works after the threshold.',
    ]) {
      expect(plan).toContain(expected)
    }
  })
})
