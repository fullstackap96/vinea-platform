export type RequestDetailClientAction =
  | 'verifyAccess'
  | 'loadRequestTimeout'
  | 'loadActivity'
  | 'loadCommunications'
  | 'loadRequestNotes'
  | 'loadWorkflowSupport'
  | 'loadRequestTypeSupport'
  | 'confirmWorkflowMutation'
  | 'updateChecklistItem'
  | 'updateStaffNotes'
  | 'aiSummary'
  | 'saveAiSummary'
  | 'aiReply'
  | 'saveReplyDraft'
  | 'saveStaffNotes'
  | 'saveIntakeDetails'
  | 'saveWaitingOn'
  | 'clearWaitingOn'
  | 'saveSuggestedDates'
  | 'saveConfirmedDate'
  | 'clearConfirmedDate'
  | 'saveFuneralDetails'
  | 'saveFuneralService'
  | 'clearFuneralService'
  | 'saveWeddingDetails'
  | 'saveWeddingCeremony'
  | 'clearWeddingCeremony'
  | 'createOciaRecord'
  | 'accessOciaRecord'
  | 'saveOciaSession'
  | 'clearOciaSession'
  | 'logCommunication'
  | 'updateCommunicationSummary'
  | 'sendEmail'
  | 'confirmEmailSend'
  | 'logSentEmail'
  | 'updateSentEmailSummary'
  | 'createGoogleCalendarEvent'
  | 'updateGoogleCalendarEvent'
  | 'deleteGoogleCalendarEvent'

const requestDetailFailureMessages: Record<RequestDetailClientAction, string> = {
  verifyAccess: 'Request not found.',
  loadRequestTimeout: 'Request details took too long to load. Try again.',
  loadActivity: 'Could not load request activity. Please try again.',
  loadCommunications: 'Could not load communication history. Please try again.',
  loadRequestNotes: 'Could not load request notes. Please try again.',
  loadWorkflowSupport: 'Could not load request checklist and workflow steps. Please try again.',
  loadRequestTypeSupport: 'Could not load request-specific details. Please try again.',
  confirmWorkflowMutation:
    'Could not confirm whether this workflow change finished. Refresh the request and review its status before trying again.',
  updateChecklistItem: 'Could not update the checklist item. Please try again.',
  updateStaffNotes: 'Could not save staff notes. Please try again.',
  aiSummary: 'Could not generate the summary right now. Please try again.',
  saveAiSummary:
    'Summary was generated, but Vinea could not save it. Please refresh before closing this request.',
  aiReply: 'Could not draft a reply right now. Please try again.',
  saveReplyDraft: 'Template applied, but Vinea could not save the draft. Please try again.',
  saveStaffNotes: 'Could not save staff notes. Please try again.',
  saveIntakeDetails: 'Could not save request details. Please try again.',
  saveWaitingOn: 'Could not save what this request is waiting for. Please try again.',
  clearWaitingOn: 'Could not clear what this request is waiting for. Please try again.',
  saveSuggestedDates: 'Could not save suggested dates. Please try again.',
  saveConfirmedDate: 'Could not save the confirmed date. Please try again.',
  clearConfirmedDate: 'Could not clear the confirmed date. Please try again.',
  saveFuneralDetails: 'Could not save funeral details. Please try again.',
  saveFuneralService: 'Could not save the confirmed funeral service time. Please try again.',
  clearFuneralService: 'Could not clear the confirmed funeral service time. Please try again.',
  saveWeddingDetails: 'Could not save wedding details. Please try again.',
  saveWeddingCeremony: 'Could not save the confirmed wedding ceremony time. Please try again.',
  clearWeddingCeremony: 'Could not clear the confirmed wedding ceremony time. Please try again.',
  createOciaRecord: 'Could not prepare the OCIA intake record. Please try again.',
  accessOciaRecord: 'Could not access the OCIA intake record. Please try again.',
  saveOciaSession: 'Could not save the confirmed OCIA meeting time. Please try again.',
  clearOciaSession: 'Could not clear the confirmed OCIA meeting time. Please try again.',
  logCommunication: 'Could not log the communication. Please try again.',
  updateCommunicationSummary:
    'Communication was logged, but Vinea could not update the request summary. Please refresh before closing this follow-up.',
  sendEmail: 'Could not send the email. Please try again.',
  confirmEmailSend:
    'Vinea received an incomplete send confirmation. The email may have been sent. Check with the recipient before trying again.',
  logSentEmail:
    'Email was sent, but Vinea could not log the communication history. Please refresh before closing this follow-up.',
  updateSentEmailSummary:
    'Email was sent and logged, but Vinea could not update the request summary. Please refresh before closing this follow-up.',
  createGoogleCalendarEvent: 'Could not create the Google Calendar event. Please try again.',
  updateGoogleCalendarEvent: 'Could not update the Google Calendar event. Please try again.',
  deleteGoogleCalendarEvent: 'Could not delete the Google Calendar event. Please try again.',
}

export function requestDetailClientFailureMessage(action: RequestDetailClientAction): string {
  return requestDetailFailureMessages[action]
}

export type RequestDetailClientApiAction =
  | 'verifyAccess'
  | 'loadActivity'
  | 'loadCommunications'
  | 'loadRequestNotes'
  | 'loadWorkflowSupport'
  | 'loadRequestTypeSupport'
  | 'updateChecklistItem'
  | 'updateStaffNotes'
  | 'saveAiSummary'
  | 'saveSuggestedDates'
  | 'saveConfirmedDate'
  | 'clearConfirmedDate'
  | 'saveReplyDraft'
  | 'saveFuneralDetails'
  | 'saveFuneralService'
  | 'clearFuneralService'
  | 'saveWeddingDetails'
  | 'saveWeddingCeremony'
  | 'clearWeddingCeremony'
  | 'saveOciaSession'
  | 'clearOciaSession'
  | 'logCommunication'

const requestDetailAllowedApiMessages: Record<RequestDetailClientApiAction, Set<string>> = {
  verifyAccess: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Request not found.',
    'Could not verify request access.',
  ]),
  loadActivity: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Could not load audit events.',
    'Could not load request activity.',
  ]),
  loadCommunications: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Request not found.',
    'Could not load request communication history.',
  ]),
  loadRequestNotes: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Request not found.',
    'Could not load request notes.',
  ]),
  loadWorkflowSupport: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Request not found.',
    'Could not load request workflow support.',
  ]),
  loadRequestTypeSupport: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Request not found.',
    'Could not load request type support.',
  ]),
  updateChecklistItem: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid checklist update.',
    'Request not found.',
    'Checklist item not found.',
    'Could not update checklist item.',
  ]),
  updateStaffNotes: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid staff notes update.',
    'Request not found.',
    'Could not update staff notes.',
  ]),
  saveAiSummary: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid AI summary update.',
    'Request not found.',
    'Could not update AI summary.',
  ]),
  saveSuggestedDates: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid suggested dates update.',
    'Request not found.',
    'Could not update suggested dates.',
  ]),
  saveConfirmedDate: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed baptism date update.',
    'Request not found.',
    'Could not update confirmed baptism date.',
  ]),
  clearConfirmedDate: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed baptism date update.',
    'Request not found.',
    'Could not update confirmed baptism date.',
  ]),
  saveReplyDraft: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid reply draft update.',
    'Request not found.',
    'Could not update reply draft.',
  ]),
  saveFuneralDetails: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid funeral details update.',
    'Request not found.',
    'Could not save funeral details.',
  ]),
  saveFuneralService: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed funeral service update.',
    'Request not found.',
    'Could not update confirmed funeral service.',
  ]),
  clearFuneralService: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed funeral service update.',
    'Request not found.',
    'Could not update confirmed funeral service.',
  ]),
  saveWeddingDetails: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid wedding details update.',
    'Request not found.',
    'Could not save wedding details.',
  ]),
  saveWeddingCeremony: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed wedding ceremony update.',
    'Request not found.',
    'Could not update confirmed wedding ceremony.',
  ]),
  clearWeddingCeremony: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed wedding ceremony update.',
    'Request not found.',
    'Could not update confirmed wedding ceremony.',
  ]),
  saveOciaSession: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed OCIA session update.',
    'Request not found.',
    'Could not prepare the OCIA intake record.',
    'Could not update confirmed OCIA session.',
  ]),
  clearOciaSession: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid confirmed OCIA session update.',
    'Request not found.',
    'Could not prepare the OCIA intake record.',
    'Could not update confirmed OCIA session.',
  ]),
  logCommunication: new Set([
    'Unauthorized',
    'This login is not authorized for parish staff access.',
    'Could not verify staff access.',
    'Could not verify parish access.',
    'Parish is not configured.',
    'Invalid communication log.',
    'Request not found.',
    'Could not log communication.',
    'Communication was logged, but Vinea could not update the request summary. Please refresh before closing this follow-up.',
  ]),
}

export function requestDetailClientApiErrorMessage(
  action: RequestDetailClientApiAction,
  error: unknown
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  return requestDetailAllowedApiMessages[action].has(message)
    ? message
    : requestDetailFailureMessages[action]
}

export type RequestDetailClientServerAction =
  | 'updateStatus'
  | 'updateWorkflowStep'
  | 'updateAssignment'
  | 'updateFollowUp'
  | 'updateWaitingOn'
  | 'applyPlaybook'
  | 'addInternalNote'
  | 'saveIntakeDetails'
  | 'linkExistingPerson'
  | 'createPersonProfile'

const requestDetailServerActionFallbacks: Record<
  RequestDetailClientServerAction,
  string
> = {
  updateStatus: 'Could not update the request status. Please refresh and try again.',
  updateWorkflowStep: 'Could not update the workflow step. Please refresh and try again.',
  updateAssignment: 'Could not update the assignment. Please refresh and try again.',
  updateFollowUp: 'Could not update the follow-up date. Please refresh and try again.',
  updateWaitingOn: 'Could not update what this request is waiting for. Please refresh and try again.',
  applyPlaybook: 'Could not add the workflow playbook steps. Please refresh and try again.',
  addInternalNote: 'Could not add the internal note. Please refresh and try again.',
  saveIntakeDetails: requestDetailFailureMessages.saveIntakeDetails,
  linkExistingPerson: 'Could not link the person profile. Please refresh and try again.',
  createPersonProfile: 'Could not create and link the person profile. Please refresh and try again.',
}

const sharedRequestActionMessages = ['Missing request id.', 'Request not found.'] as const

const requestDetailAllowedServerActionMessages: Record<
  RequestDetailClientServerAction,
  ReadonlySet<string>
> = {
  updateStatus: new Set([
    ...sharedRequestActionMessages,
    'Invalid request status.',
    'Could not check required workflow steps.',
    'Could not check required checklist items.',
    'Complete checklist items before marking complete.',
    'Could not update request status.',
  ]),
  updateWorkflowStep: new Set([
    ...sharedRequestActionMessages,
    'Missing workflow step id.',
    'Invalid workflow step status.',
    'Workflow step not found.',
    'Could not update workflow step.',
  ]),
  updateAssignment: new Set([
    ...sharedRequestActionMessages,
    'Could not update assignment.',
  ]),
  updateFollowUp: new Set([
    ...sharedRequestActionMessages,
    'Invalid follow-up date.',
    'Could not update follow-up date.',
  ]),
  updateWaitingOn: new Set([
    ...sharedRequestActionMessages,
    'Invalid waiting-for value.',
    'Could not load waiting-for status.',
    'Could not update waiting-for status.',
  ]),
  applyPlaybook: new Set([
    ...sharedRequestActionMessages,
    'Could not load checklist items.',
    'No playbook is available for this request type.',
    'Could not add playbook checklist items.',
  ]),
  addInternalNote: new Set([
    ...sharedRequestActionMessages,
    'Note cannot be empty.',
    'Could not add note.',
  ]),
  saveIntakeDetails: new Set([
    ...sharedRequestActionMessages,
    'Contact name and email are required.',
    'This page is out of date. Refresh and try again.',
    'Could not save contact information.',
    'Could not save contact information. Refresh the page; if it persists, an administrator may need to allow staff updates on parishioner records.',
    'Could not save baptism details.',
    'Could not save intake notes.',
    'Deceased name is required.',
    'Could not save funeral details.',
    'Partner name is required.',
    'Could not save wedding details.',
    'OCIA background, seeking, parishioner status, and contact method are required.',
    'Could not save OCIA details.',
    'Unsupported request type.',
  ]),
  linkExistingPerson: new Set([
    ...sharedRequestActionMessages,
    'This request has no intake contact to link.',
    'No person profile exists for this intake contact yet. Create one first.',
    'Could not link request to person. Refresh and try again.',
  ]),
  createPersonProfile: new Set([
    ...sharedRequestActionMessages,
    'This request has no intake contact to link.',
    'Intake contact not found.',
    'Could not create person profile.',
    'Could not link request to person. Refresh and try again.',
  ]),
}

export function requestDetailClientServerActionErrorMessage(
  action: RequestDetailClientServerAction,
  error: unknown,
): string {
  const message = typeof error === 'string' ? error.trim() : ''
  if (message === 'Unauthorized') {
    return 'Your staff session is no longer active. Sign in and try again.'
  }
  if (
    action === 'updateStatus' &&
    message.startsWith('Complete required workflow steps before marking complete.')
  ) {
    return 'Complete all required workflow steps before marking this request complete.'
  }

  return requestDetailAllowedServerActionMessages[action].has(message)
    ? message
    : requestDetailServerActionFallbacks[action]
}

export function requestDetailClientServerActionFallbackMessage(
  action: RequestDetailClientServerAction,
): string {
  return requestDetailServerActionFallbacks[action]
}
