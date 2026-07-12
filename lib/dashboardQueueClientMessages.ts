export type DashboardQueueAction =
  | 'communicationTouchpoint'
  | 'communicationFollowUp'
  | 'intakeRequestCommunication'
  | 'intakeRequestTriage'
  | 'intakeMassIntentionTriage'

export const dashboardQueueFailureMessages: Record<DashboardQueueAction, string> = {
  communicationTouchpoint: 'Could not save the communication touchpoint. Please try again.',
  communicationFollowUp: 'Could not update the follow-up date. Please try again.',
  intakeRequestCommunication:
    'Could not log the first-contact communication. Please try again.',
  intakeRequestTriage: 'Could not save the request triage. Please try again.',
  intakeMassIntentionTriage: 'Could not save the Mass intention triage. Please try again.',
}

export function dashboardQueueFailureMessage(action: DashboardQueueAction): string {
  return dashboardQueueFailureMessages[action]
}

const dashboardQueueAllowedMessages: Record<DashboardQueueAction, ReadonlySet<string>> = {
  communicationTouchpoint: new Set([
    'Missing request id.',
    'Add a short communication note.',
    'Invalid follow-up date.',
    'Communication was logged, but Vinea could not update the request summary. Please refresh before closing this follow-up.',
    dashboardQueueFailureMessages.communicationTouchpoint,
  ]),
  communicationFollowUp: new Set([
    'Missing request id.',
    'Invalid follow-up date.',
    dashboardQueueFailureMessages.communicationFollowUp,
  ]),
  intakeRequestCommunication: new Set([
    'Missing request id.',
    'Invalid follow-up date.',
    dashboardQueueFailureMessages.intakeRequestCommunication,
  ]),
  intakeRequestTriage: new Set([
    'Missing request id.',
    'Invalid follow-up date.',
    'First contact was logged, but Vinea could not finish request triage. Please refresh and review the request before trying again.',
    dashboardQueueFailureMessages.intakeRequestCommunication,
    dashboardQueueFailureMessages.intakeRequestTriage,
  ]),
  intakeMassIntentionTriage: new Set([
    'Missing intention id.',
    'Invalid Mass date.',
    dashboardQueueFailureMessages.intakeMassIntentionTriage,
  ]),
}

export function dashboardQueueClientErrorMessage(
  action: DashboardQueueAction,
  error: unknown,
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  if (message === 'Unauthorized') {
    return 'Your staff session is no longer active. Sign in and try again.'
  }

  return dashboardQueueAllowedMessages[action].has(message)
    ? message
    : dashboardQueueFailureMessages[action]
}
