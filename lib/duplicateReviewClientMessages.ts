export type DuplicateReviewClientAction =
  | 'loadPeople'
  | 'mergePeople'
  | 'loadHouseholds'
  | 'mergeHouseholds'

export const duplicateReviewClientFallbacks: Record<DuplicateReviewClientAction, string> = {
  loadPeople: 'Could not load duplicate people. Please try again.',
  mergePeople: 'Could not merge these people. No changes were confirmed.',
  loadHouseholds: 'Could not load duplicate households. Please try again.',
  mergeHouseholds: 'Could not merge these households. No changes were confirmed.',
}

const approvedMessages = new Set([
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
  'You are not authorized to review duplicate people for this parish.',
  'You are not authorized to review duplicate households for this parish.',
  'Invalid merge request.',
  'Merge request is too large.',
  'Choose two different people to merge.',
  'Choose two different households to merge.',
  'One of these people was not found.',
  'One of these households was not found.',
  'First and last name are required.',
  'Household name is required.',
])

function messageFrom(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value instanceof Error) return value.message.trim()
  return ''
}

export function duplicateReviewClientErrorMessage(
  action: DuplicateReviewClientAction,
  error: unknown,
): string {
  const message = messageFrom(error)
  return approvedMessages.has(message) ? message : duplicateReviewClientFallbacks[action]
}
