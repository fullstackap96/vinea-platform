import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request detail browser mutation boundary', () => {
  it('keeps the Request Detail client page off direct browser Supabase reads and writes', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).not.toContain("from '@/lib/supabase'")
    expect(source).not.toContain('supabase.')
    expect(source).not.toContain('.from(')
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.update({')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
  })

  it('uses active-parish-aware routes for Request Detail data loading and sensitive mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    for (const route of [
      '/detail-access',
      '/workflow-support',
      '/communications',
      '/notes',
      '/type-support',
      '/checklist-items/',
      '/ai-summary',
      '/reply-draft',
      '/staff-notes',
      '/suggested-dates',
      '/confirmed-baptism-date',
      '/confirmed-funeral-service',
      '/confirmed-wedding-ceremony',
      '/confirmed-ocia-session',
      '/funeral-details',
      '/wedding-details',
    ]) {
      expect(source).toContain(route)
    }

    expect(source).toContain('updateRequestStatusAction')
    expect(source).toContain('updateRequestWaitingOn')
    expect(source).toContain('updateRequestWorkflowStepStatus')
    expect(source).toContain('InternalNotesSection')
    expect(source).toContain('EditRequestDetailsSection')
  })

  it('documents the no-browser-mutation boundary', () => {
    const doc = read('docs/REQUEST_DETAIL_BROWSER_MUTATION_BOUNDARY_20260708.md')

    expect(doc).toContain('Request Detail')
    expect(doc).toContain('direct browser Supabase table access')
    expect(doc).toContain('active parish')
    expect(doc).toContain('server routes')
    expect(doc).toContain('Server Actions')
  })
})
