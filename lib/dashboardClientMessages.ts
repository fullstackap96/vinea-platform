export type DashboardClientAction =
  | 'draftFollowUp'
  | 'saveFollowUpDraft'
  | 'sendFollowUpEmail'
  | 'confirmFollowUpEmailSend'
  | 'logFollowUpEmail'
  | 'updateFollowUpEmailSummary'
  | 'logFollowUpContacted'
  | 'updateFollowUpContactedSummary'
  | 'markFollowUpContacted'
  | 'confirmWorkHubMutation'
  | 'logCareTouchpoint'
  | 'updateFuneralCareDate'
  | 'updateCareRequest'
  | 'saveCareTouchpoint'

export const dashboardClientFailureMessages: Record<DashboardClientAction, string> = {
  draftFollowUp: 'Could not draft the follow-up email. Please try again.',
  saveFollowUpDraft: 'Could not save the follow-up draft. Please try again.',
  sendFollowUpEmail: 'Could not send the follow-up email. Please try again.',
  confirmFollowUpEmailSend:
    'Vinea received an incomplete send confirmation. The follow-up email may have been sent. Check with the recipient before trying again.',
  logFollowUpEmail:
    'Email was sent, but Vinea could not log the communication. Please review the request before sending another follow-up.',
  updateFollowUpEmailSummary:
    'Email was sent and logged, but Vinea could not update the request summary. Please review the request.',
  logFollowUpContacted: 'Could not log the follow-up communication. Please try again.',
  updateFollowUpContactedSummary:
    'Communication was logged, but Vinea could not update the request summary. Please review the request.',
  markFollowUpContacted: 'Could not mark this request as contacted. Please try again.',
  confirmWorkHubMutation:
    'Could not confirm whether this change finished. Refresh the Daily Work Hub and review the request before trying again.',
  logCareTouchpoint: 'Could not log the care touchpoint. Please try again.',
  updateFuneralCareDate:
    'Care touchpoint was logged, but Vinea could not update the funeral care date. Please review the request.',
  updateCareRequest:
    'Care touchpoint was logged, but Vinea could not update the request summary. Please review the request.',
  saveCareTouchpoint: 'Could not save the care touchpoint. Please try again.',
}

export function dashboardClientFailureMessage(action: DashboardClientAction): string {
  return dashboardClientFailureMessages[action]
}

export function dashboardClientErrorMessage(
  action: DashboardClientAction,
  error: unknown,
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  if (message === 'Unauthorized') {
    return 'Your staff session is no longer active. Sign in and try again.'
  }
  if (action === 'draftFollowUp' && message === 'Empty response.') {
    return 'The draft service returned no message. Please try again.'
  }

  return message === dashboardClientFailureMessages[action]
    ? message
    : dashboardClientFailureMessages[action]
}
