export type CoreRecordClientAction =
  | 'createPerson'
  | 'updatePerson'
  | 'createHousehold'
  | 'updateHousehold'
  | 'addHouseholdMember'
  | 'updateHouseholdMember'
  | 'createMassIntention'
  | 'updateMassIntention'

const fallbackMessages: Record<CoreRecordClientAction, string> = {
  createPerson: 'Could not create the person. Please review the form and try again.',
  updatePerson: 'Could not update the person. Please refresh and try again.',
  createHousehold: 'Could not create the household. Please review the form and try again.',
  updateHousehold: 'Could not update the household. Please refresh and try again.',
  addHouseholdMember: 'Could not add the household member. Please review the selection and try again.',
  updateHouseholdMember: 'Could not update the household member. Please refresh and try again.',
  createMassIntention:
    'Could not create the Mass intention. Please review the form and try again.',
  updateMassIntention: 'Could not update the Mass intention. Please refresh and try again.',
}

const sharedParishMessages = [
  'Parish membership is required before writing parish data.',
  'Parish is not configured.',
  'You are not authorized to write to this parish.',
  'Could not resolve parish context for this write.',
] as const

const allowedMessages: Record<CoreRecordClientAction, ReadonlySet<string>> = {
  createPerson: new Set([
    ...sharedParishMessages,
    'First name is required.',
    'Last name is required.',
    'Could not create person.',
  ]),
  updatePerson: new Set([
    ...sharedParishMessages,
    'Missing person id.',
    'First name is required.',
    'Last name is required.',
    'Could not update person.',
    'Person not found for the selected parish.',
  ]),
  createHousehold: new Set([
    ...sharedParishMessages,
    'Household name is required.',
    'Could not create household.',
  ]),
  updateHousehold: new Set([
    ...sharedParishMessages,
    'Missing household id.',
    'Household name is required.',
    'Could not update household.',
    'Household not found for the selected parish.',
  ]),
  addHouseholdMember: new Set([
    ...sharedParishMessages,
    'Missing household id.',
    'Select a person to add.',
    'Household not found for the selected parish.',
    'Person not found for the selected parish.',
    'Could not add household member.',
  ]),
  updateHouseholdMember: new Set([
    ...sharedParishMessages,
    'Missing member id.',
    'Household member not found for the selected parish.',
    'Could not update household member.',
  ]),
  createMassIntention: new Set([
    ...sharedParishMessages,
    'Requester name is required.',
    'Intention text is required.',
    'Could not create Mass intention.',
  ]),
  updateMassIntention: new Set([
    ...sharedParishMessages,
    'Missing intention id.',
    'Requester name is required.',
    'Intention text is required.',
    'Could not update Mass intention.',
    'Mass intention not found for the selected parish.',
  ]),
}

function normalizeMessage(error: unknown): string {
  return typeof error === 'string' ? error.trim() : ''
}

export function coreRecordClientErrorMessage(
  action: CoreRecordClientAction,
  error: unknown,
): string {
  const message = normalizeMessage(error)
  if (message === 'Unauthorized') {
    return 'Your staff session is no longer active. Sign in and try again.'
  }

  return allowedMessages[action].has(message) ? message : fallbackMessages[action]
}

export function coreRecordClientFallbackMessage(action: CoreRecordClientAction): string {
  return fallbackMessages[action]
}
