import { describe, expect, it } from 'vitest'
import {
  WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE,
  WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_TIMEOUT_MS,
} from './workflowTemplateClientConfirmation'

describe('Workflow Template client confirmation contract', () => {
  it('uses one finite save confirmation deadline', () => {
    expect(WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('requires refresh and selected-parish review after ambiguous persistence', () => {
    expect(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE).toContain('Refresh Settings')
    expect(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
  })
})
