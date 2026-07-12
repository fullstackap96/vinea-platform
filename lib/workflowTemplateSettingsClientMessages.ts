const fallbackWorkflowTemplateLoadMessage =
  'Could not load workflow templates. Please try again.'
const fallbackWorkflowTemplateSaveMessage =
  'Could not save workflow step. Please try again.'

const allowedWorkflowTemplateLoadMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'You are not authorized to read workflow templates for this parish.',
  'Could not load workflow templates.',
])

const allowedWorkflowTemplateSaveMessages = new Set([
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
])

function safeMessage(
  error: unknown,
  allowedMessages: Set<string>,
  fallback: string
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedMessages.has(message) ? message : fallback
}

export function workflowTemplateLoadErrorMessage(error: unknown): string {
  return safeMessage(error, allowedWorkflowTemplateLoadMessages, fallbackWorkflowTemplateLoadMessage)
}

export function workflowTemplateSaveErrorMessage(error: unknown): string {
  return safeMessage(error, allowedWorkflowTemplateSaveMessages, fallbackWorkflowTemplateSaveMessage)
}
