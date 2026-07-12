import { describe, expect, it } from 'vitest'
import {
  parseWorkflowTemplateStepResponse,
  parseWorkflowTemplatesResponse,
} from '@/lib/workflowTemplateSettings'

const parishId = '11111111-1111-4111-8111-111111111111'

function step(overrides: Record<string, unknown> = {}) {
  return {
    id: 'step-1',
    template_id: 'template-1',
    phase: 'Preparation',
    title: 'Review request',
    description: null,
    owner_type: 'staff',
    required: true,
    due_offset_days: 2,
    sort_order: 10,
    internal_note: 'must-not-survive',
    ...overrides,
  }
}

function response() {
  return {
    ok: true,
    activeParishId: parishId,
    templates: [
      {
        id: 'template-1',
        request_type: 'baptism',
        name: 'Baptism preparation',
        description: 'Staff-reviewed parish workflow',
        active: true,
        parish_id: parishId,
        steps: [step()],
      },
    ],
  }
}

describe('Workflow Template read-model validation', () => {
  it('projects only approved template and step fields', () => {
    const parsed = parseWorkflowTemplatesResponse(response(), parishId)

    expect(parsed?.activeParishId).toBe(parishId)
    expect(parsed?.templates[0]).not.toHaveProperty('parish_id')
    expect(parsed?.templates[0]?.steps[0]).toEqual({
      id: 'step-1',
      template_id: 'template-1',
      phase: 'Preparation',
      title: 'Review request',
      description: null,
      owner_type: 'staff',
      required: true,
      due_offset_days: 2,
      sort_order: 10,
    })
    expect(parsed?.templates[0]?.steps[0]).not.toHaveProperty('internal_note')
  })

  it('rejects parish mismatches, step ownership mismatches, and unsafe bounded values', () => {
    expect(parseWorkflowTemplatesResponse(response(), 'different-parish')).toBeNull()

    const wrongTemplate = response()
    wrongTemplate.templates[0].steps = [step({ template_id: 'different-template' })]
    expect(parseWorkflowTemplatesResponse(wrongTemplate, parishId)).toBeNull()

    const invalidOwner = response()
    invalidOwner.templates[0].steps = [step({ owner_type: 'super_admin' })]
    expect(parseWorkflowTemplatesResponse(invalidOwner, parishId)).toBeNull()

    const invalidDueDate = response()
    invalidDueDate.templates[0].steps = [step({ due_offset_days: 366 })]
    expect(parseWorkflowTemplatesResponse(invalidDueDate, parishId)).toBeNull()
  })

  it('rejects duplicate templates, request types, and step identifiers', () => {
    const duplicateTemplate = response()
    duplicateTemplate.templates.push({ ...duplicateTemplate.templates[0] })
    expect(parseWorkflowTemplatesResponse(duplicateTemplate, parishId)).toBeNull()

    const duplicateStep = response()
    duplicateStep.templates[0].steps = [step(), step()]
    expect(parseWorkflowTemplatesResponse(duplicateStep, parishId)).toBeNull()
  })

  it('validates save responses against the submitted step identifier', () => {
    const saved = parseWorkflowTemplateStepResponse({ ok: true, step: step() }, 'step-1')
    expect(saved?.title).toBe('Review request')
    expect(saved).not.toHaveProperty('internal_note')
    expect(parseWorkflowTemplateStepResponse({ ok: true, step: step() }, 'different-step')).toBeNull()
    expect(parseWorkflowTemplateStepResponse({ ok: true, step: step({ required: 'yes' }) }, 'step-1'))
      .toBeNull()
  })
})
