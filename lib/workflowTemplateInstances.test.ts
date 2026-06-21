import { describe, expect, it } from 'vitest'
import { buildRequestWorkflowStepInserts } from './workflowTemplateInstances'

describe('buildRequestWorkflowStepInserts', () => {
  it('copies template fields onto request workflow step inserts', () => {
    const rows = buildRequestWorkflowStepInserts({
      parishId: 'parish-1',
      requestId: 'request-1',
      today: new Date('2026-06-21T18:00:00.000Z'),
      templateSteps: [
        {
          id: 'step-1',
          phase: 'Documentation',
          title: 'Collect birth certificate',
          description: 'Needed for the register.',
          owner_type: 'family',
          required: true,
          due_offset_days: 7,
          sort_order: 20,
        },
      ],
    })

    expect(rows).toEqual([
      {
        parish_id: 'parish-1',
        request_id: 'request-1',
        template_step_id: 'step-1',
        phase: 'Documentation',
        title: 'Collect birth certificate',
        description: 'Needed for the register.',
        owner_type: 'family',
        required: true,
        due_date: '2026-06-28',
        sort_order: 20,
      },
    ])
  })

  it('keeps undated optional steps valid and defaults unsafe owner values', () => {
    const rows = buildRequestWorkflowStepInserts({
      parishId: 'parish-1',
      requestId: 'request-1',
      today: new Date('2026-06-21T00:00:00.000Z'),
      templateSteps: [
        {
          id: 'step-1',
          phase: 'Liturgy planning',
          title: 'Confirm committal arrangements',
          owner_type: 'volunteer',
          required: false,
          due_offset_days: null,
          sort_order: 60,
        },
      ],
    })

    expect(rows[0]).toMatchObject({
      owner_type: 'staff',
      required: false,
      due_date: null,
      sort_order: 60,
    })
  })

  it('skips malformed template steps instead of creating unusable rows', () => {
    const rows = buildRequestWorkflowStepInserts({
      parishId: 'parish-1',
      requestId: 'request-1',
      templateSteps: [
        { id: '', phase: 'Phase', title: 'Missing id' },
        { id: 'step-2', phase: '', title: 'Missing phase' },
        { id: 'step-3', phase: 'Phase', title: '' },
        { id: 'step-4', phase: 'Phase', title: 'Valid' },
      ],
    })

    expect(rows).toHaveLength(1)
    expect(rows[0].template_step_id).toBe('step-4')
  })
})
