import { describe, expect, it } from 'vitest'
import { normalizeWorkflowTemplateStepPatch } from './workflowTemplateSettings'

describe('normalizeWorkflowTemplateStepPatch', () => {
  it('normalizes editable workflow step fields', () => {
    const result = normalizeWorkflowTemplateStepPatch({
      title: '  Call family  ',
      description: '  First pastoral touchpoint  ',
      phase: '  Immediate care ',
      owner_type: 'priest',
      required: false,
      sort_order: '12',
      due_offset_days: '3',
    })

    expect(result).toEqual({
      ok: true,
      patch: {
        title: 'Call family',
        description: 'First pastoral touchpoint',
        phase: 'Immediate care',
        owner_type: 'priest',
        required: false,
        sort_order: 12,
        due_offset_days: 3,
      },
    })
  })

  it('requires a title and phase', () => {
    expect(normalizeWorkflowTemplateStepPatch({ title: '', phase: 'Prep' })).toEqual({
      ok: false,
      error: 'Step title is required.',
    })
    expect(normalizeWorkflowTemplateStepPatch({ title: 'Collect form', phase: '' })).toEqual({
      ok: false,
      error: 'Step phase is required.',
    })
  })

  it('defaults unsafe values to parish-friendly bounds', () => {
    const result = normalizeWorkflowTemplateStepPatch({
      title: 'Collect form',
      phase: 'Documents',
      owner_type: 'unknown',
      sort_order: -4,
      due_offset_days: 999,
    })

    expect(result).toMatchObject({
      ok: true,
      patch: {
        owner_type: 'staff',
        required: true,
        sort_order: 0,
        due_offset_days: 365,
      },
    })
  })
})
