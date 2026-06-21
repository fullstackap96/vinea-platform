import { describe, expect, it } from 'vitest'
import {
  countIncompleteRequiredWorkflowSteps,
  groupRequestWorkflowSteps,
  normalizeRequestWorkflowStep,
  workflowStepOwnerLabel,
  workflowStepStatusLabel,
} from './requestWorkflowSteps'

describe('requestWorkflowSteps', () => {
  it('normalizes workflow step rows defensively', () => {
    expect(
      normalizeRequestWorkflowStep({
        id: 'step-1',
        phase: ' Documents ',
        title: ' Birth certificate ',
        description: '',
        owner_type: 'family',
        required: true,
        status: 'complete',
        due_date: '2026-06-30',
        sort_order: '20',
      })
    ).toEqual({
      id: 'step-1',
      phase: 'Documents',
      title: 'Birth certificate',
      description: null,
      owner_type: 'family',
      required: true,
      status: 'complete',
      due_date: '2026-06-30',
      sort_order: 20,
    })
  })

  it('groups steps by phase in sort order', () => {
    const groups = groupRequestWorkflowSteps([
      {
        id: 'b',
        phase: 'Scheduling',
        title: 'Date',
        description: null,
        owner_type: 'staff',
        required: true,
        status: 'not_started',
        due_date: null,
        sort_order: 20,
      },
      {
        id: 'a',
        phase: 'Intake',
        title: 'Call',
        description: null,
        owner_type: 'staff',
        required: true,
        status: 'complete',
        due_date: null,
        sort_order: 10,
      },
    ])

    expect(groups.map((group) => group.phase)).toEqual(['Intake', 'Scheduling'])
  })

  it('counts required open steps and formats labels', () => {
    expect(
      countIncompleteRequiredWorkflowSteps([
        {
          id: 'a',
          phase: 'Intake',
          title: 'Call',
          description: null,
          owner_type: 'staff',
          required: true,
          status: 'not_started',
          due_date: null,
          sort_order: 10,
        },
        {
          id: 'b',
          phase: 'Documents',
          title: 'Optional note',
          description: null,
          owner_type: 'family',
          required: false,
          status: 'not_started',
          due_date: null,
          sort_order: 20,
        },
      ])
    ).toBe(1)
    expect(workflowStepOwnerLabel('family')).toBe('Family')
    expect(workflowStepStatusLabel('in_progress')).toBe('In progress')
  })
})
