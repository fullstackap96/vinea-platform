export type ImportClientAction = 'preview' | 'commit'

export const importClientFallbacks: Record<ImportClientAction, string> = {
  preview: 'Could not review this spreadsheet. Please try again.',
  commit: 'Could not import these rows. No completed import was confirmed.',
}

const approvedMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'You are not authorized to read imports for this parish.',
  'Invalid import request.',
  'Choose what you are importing.',
  'No spreadsheet rows were found.',
  'Import request is too large. Split the spreadsheet into smaller batches.',
])

function messageFrom(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value instanceof Error) return value.message.trim()
  return ''
}

export function importClientErrorMessage(action: ImportClientAction, error: unknown): string {
  const message = messageFrom(error)
  return approvedMessages.has(message) ? message : importClientFallbacks[action]
}
