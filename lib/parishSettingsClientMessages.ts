export type ParishSettingsClientMessageAction =
  | 'loadSettings'
  | 'saveSettings'
  | 'sendDailyBrief'
  | 'loadStaffAccess'
  | 'addStaffAccess'
  | 'updateStaffAccess'
  | 'loadRecentActivity'
  | 'loadPublicIntakeRouting'
  | 'savePublicIntakeRouting'
  | 'addPublicRoutingDomain'
  | 'updatePublicRoutingDomain'
  | 'verifyPublicRoutingDomain'
  | 'resetPublicRoutingDomainVerification'
  | 'createPublicRoutingToken'
  | 'updatePublicRoutingToken'

const fallbackParishSettingsMessages: Record<ParishSettingsClientMessageAction, string> = {
  loadSettings: 'Could not load settings. Please try again.',
  saveSettings: 'Could not save settings. Please try again.',
  sendDailyBrief: 'Could not send the daily brief. Please try again.',
  loadStaffAccess: 'Could not load staff access. Please try again.',
  addStaffAccess: 'Could not add staff access. Please try again.',
  updateStaffAccess: 'Could not update staff access. Please try again.',
  loadRecentActivity: 'Could not load recent activity. Please try again.',
  loadPublicIntakeRouting: 'Could not load public intake routing metadata. Please try again.',
  savePublicIntakeRouting: 'Could not save public intake routing metadata. Please try again.',
  addPublicRoutingDomain: 'Could not add public intake domain. Please try again.',
  updatePublicRoutingDomain: 'Could not update public intake domain. Please try again.',
  verifyPublicRoutingDomain: 'Could not verify public intake domain. Please try again.',
  resetPublicRoutingDomainVerification:
    'Could not reset public intake domain verification. Please try again.',
  createPublicRoutingToken: 'Could not create public intake token. Please try again.',
  updatePublicRoutingToken: 'Could not update public intake token. Please try again.',
}

const commonStaffMessages = [
  'Unauthorized',
  'This login is not authorized for parish staff access.',
  'Could not verify staff access.',
  'Could not verify parish access.',
  'Parish is not configured.',
]

const allowedPublicRoutingVerificationResultMessages = new Set([
  'This domain does not have a verification challenge yet. Reset the verification token and try again.',
  'Vinea could not find the required DNS TXT record yet. DNS changes can take time to publish.',
  'DNS TXT record was found, but it did not contain the expected Vinea verification value.',
])

const allowedParishSettingsMessages: Record<
  ParishSettingsClientMessageAction,
  Set<string>
> = {
  loadSettings: new Set([
    ...commonStaffMessages,
    'You are not authorized to read parish settings for this parish.',
    'Parish not found',
    'Could not load settings.',
  ]),
  saveSettings: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body',
    'Parish name is required',
    'Please enter a valid notification email, or leave it blank.',
    'Please enter a valid daily brief email, or leave it blank.',
    'Daily brief delivery needs either a daily brief email or a default notification email.',
    'Could not save settings.',
  ]),
  sendDailyBrief: new Set([
    ...commonStaffMessages,
    'You are not authorized to send the daily brief for this parish.',
    'Parish not found',
    'Set a daily brief email in Parish settings first.',
    'Could not send daily brief.',
  ]),
  loadStaffAccess: new Set([
    ...commonStaffMessages,
    'You are not authorized to read staff access for this parish.',
    'Could not load staff access.',
  ]),
  addStaffAccess: new Set([
    ...commonStaffMessages,
    'Enter a valid staff email.',
    'Only parish admins can manage staff access.',
    'Could not add staff access.',
  ]),
  updateStaffAccess: new Set([
    ...commonStaffMessages,
    'Missing staff user id.',
    'Only parish admins can manage staff access.',
    'Staff user not found.',
    'You cannot deactivate your own access.',
    'Add another admin before removing this admin access.',
    'Could not update staff access.',
  ]),
  loadRecentActivity: new Set([
    ...commonStaffMessages,
    'Only parish admins can view the full audit log.',
    'You are not authorized to read audit events for this parish.',
    'Request activity is not configured yet. Apply the audit-event migration to show activity history.',
    'Could not load audit events.',
    'Could not load recent activity.',
  ]),
  loadPublicIntakeRouting: new Set([
    ...commonStaffMessages,
    'You are not authorized to read public intake routing for this parish.',
    'Could not load public intake routing metadata.',
  ]),
  savePublicIntakeRouting: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Enter a public slug with 3-80 lowercase letters, numbers, or hyphens.',
    'Parish not found.',
    'That public slug is already used by another parish.',
    'Could not update public intake routing metadata.',
  ]),
  addPublicRoutingDomain: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Enter a valid domain, such as forms.yourparish.org.',
    'That public intake domain is already configured.',
    'Could not add public intake domain.',
  ]),
  updatePublicRoutingDomain: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Missing domain id.',
    'Public intake domain not found.',
    'Could not update public intake domain.',
  ]),
  verifyPublicRoutingDomain: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Missing domain id.',
    'Choose a valid public intake domain verification action.',
    'Public intake domain not found.',
    'This domain does not have a verification challenge yet. Reset the verification token and try again.',
    'Vinea could not find the required DNS TXT record yet. DNS changes can take time to publish.',
    'DNS TXT record was found, but it did not contain the expected Vinea verification value.',
    'Could not verify public intake domain.',
  ]),
  resetPublicRoutingDomainVerification: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Missing domain id.',
    'Choose a valid public intake domain verification action.',
    'Public intake domain not found.',
    'Could not reset public intake domain verification.',
  ]),
  createPublicRoutingToken: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Enter a valid expiration date, or leave it blank.',
    'Token label is required.',
    'Choose a valid public form type for this token.',
    'Could not create a unique public intake token. Please try again.',
    'Could not create public intake token.',
  ]),
  updatePublicRoutingToken: new Set([
    ...commonStaffMessages,
    'Could not resolve parish context for this write.',
    'You are not authorized to write to this parish.',
    'Parish membership is required before writing parish data.',
    'Invalid JSON body.',
    'Missing public intake token id.',
    'Public intake token not found.',
    'Could not update public intake token.',
  ]),
}

export function parishSettingsClientErrorMessage(
  action: ParishSettingsClientMessageAction,
  error: unknown
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedParishSettingsMessages[action].has(message)
    ? message
    : fallbackParishSettingsMessages[action]
}

export function publicRoutingDomainVerificationResultMessage(error: unknown): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return allowedPublicRoutingVerificationResultMessages.has(message)
    ? message
    : 'Domain verification did not pass yet.'
}
