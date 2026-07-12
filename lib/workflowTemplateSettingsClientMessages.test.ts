import { describe, expect, it } from 'vitest'
import {
  workflowTemplateLoadErrorMessage,
  workflowTemplateSaveErrorMessage,
} from './workflowTemplateSettingsClientMessages'

describe('workflow template settings client messages', () => {
  it('preserves expected load messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'You are not authorized to read workflow templates for this parish.',
      'Could not load workflow templates.',
    ]) {
      expect(workflowTemplateLoadErrorMessage(message)).toBe(message)
    }
  })

  it('preserves expected save validation and setup messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'Invalid JSON body.',
      'Missing workflow step id.',
      'Step title is required.',
      'Step phase is required.',
      'Workflow step not found.',
      'Workflow template not found.',
      'Could not update workflow step.',
    ]) {
      expect(workflowTemplateSaveErrorMessage(message)).toBe(message)
    }
  })

  it('falls back for unexpected technical or secret-shaped messages', () => {
    for (const error of [
      undefined,
      null,
      '',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'workflow_template_steps failed for 11111111-1111-1111-1111-111111111111',
      'Bearer abc.def.ghi',
      new Error('network failure'),
    ]) {
      const loadMessage = workflowTemplateLoadErrorMessage(error)
      const saveMessage = workflowTemplateSaveErrorMessage(error)

      expect(loadMessage).toBe('Could not load workflow templates. Please try again.')
      expect(saveMessage).toBe('Could not save workflow step. Please try again.')
      expect(`${loadMessage} ${saveMessage}`).not.toMatch(/postgres:|supabase\.co|Bearer|11111111/i)
    }
  })
})
