import { describe, expect, it } from 'vitest'
import {
  requestDetailClientApiErrorMessage,
  requestDetailClientFailureMessage,
  requestDetailClientServerActionErrorMessage,
  requestDetailClientServerActionFallbackMessage,
  type RequestDetailClientAction,
  type RequestDetailClientServerAction,
} from './requestDetailClientMessages'

describe('requestDetailClientFailureMessage', () => {
  it('returns plain-English action messages for request detail failures', () => {
    const actions: RequestDetailClientAction[] = [
      'verifyAccess',
      'loadRequestTimeout',
      'loadActivity',
      'confirmWorkflowMutation',
      'aiSummary',
      'saveAiSummary',
      'aiReply',
      'saveReplyDraft',
      'saveStaffNotes',
      'saveIntakeDetails',
      'saveWaitingOn',
      'clearWaitingOn',
      'saveSuggestedDates',
      'saveConfirmedDate',
      'clearConfirmedDate',
      'saveFuneralDetails',
      'saveFuneralService',
      'clearFuneralService',
      'saveWeddingDetails',
      'saveWeddingCeremony',
      'clearWeddingCeremony',
      'createOciaRecord',
      'accessOciaRecord',
      'saveOciaSession',
      'clearOciaSession',
      'logCommunication',
      'updateCommunicationSummary',
      'sendEmail',
      'confirmEmailSend',
      'logSentEmail',
      'updateSentEmailSummary',
      'createGoogleCalendarEvent',
      'updateGoogleCalendarEvent',
      'deleteGoogleCalendarEvent',
    ]

    for (const action of actions) {
      expect(requestDetailClientFailureMessage(action)).toMatch(/\.$/)
      expect(requestDetailClientFailureMessage(action)).not.toContain('undefined')
    }
  })

  it('preserves approved Server Action validation and prerequisite guidance', () => {
    expect(
      requestDetailClientServerActionErrorMessage(
        'updateFollowUp',
        'Invalid follow-up date.',
      ),
    ).toBe('Invalid follow-up date.')
    expect(
      requestDetailClientServerActionErrorMessage(
        'saveIntakeDetails',
        'Contact name and email are required.',
      ),
    ).toBe('Contact name and email are required.')
    expect(
      requestDetailClientServerActionErrorMessage(
        'linkExistingPerson',
        'No person profile exists for this intake contact yet. Create one first.',
      ),
    ).toBe('No person profile exists for this intake contact yet. Create one first.')
  })

  it('sanitizes dynamic workflow-step titles and expired sessions', () => {
    expect(
      requestDetailClientServerActionErrorMessage(
        'updateStatus',
        'Complete required workflow steps before marking complete. First open step: Private family follow-up.',
      ),
    ).toBe('Complete all required workflow steps before marking this request complete.')
    expect(requestDetailClientServerActionErrorMessage('addInternalNote', 'Unauthorized')).toBe(
      'Your staff session is no longer active. Sign in and try again.',
    )
  })

  it('replaces unexpected Server Action database, contact, id, and object text', () => {
    const actions: RequestDetailClientServerAction[] = [
      'updateStatus',
      'updateWorkflowStep',
      'updateAssignment',
      'updateFollowUp',
      'updateWaitingOn',
      'applyPlaybook',
      'addInternalNote',
      'saveIntakeDetails',
      'linkExistingPerson',
      'createPersonProfile',
    ]
    const unsafe = [
      'private constraint failed for family@example.test',
      'request 132ca2b3-84a4-4b50-8625-0bb773d87d31 failed',
      { message: 'raw action object' },
      null,
    ]

    for (const action of actions) {
      for (const error of unsafe) {
        expect(requestDetailClientServerActionErrorMessage(action, error)).toBe(
          requestDetailClientServerActionFallbackMessage(action),
        )
      }
    }
  })

  it('does not echo arbitrary provider or database text', () => {
    const message = requestDetailClientFailureMessage('saveStaffNotes')

    expect(message).not.toContain('postgresql://')
    expect(message).not.toContain('Bearer')
    expect(message).not.toContain('token')
    expect(message).not.toContain('@example.com')
  })

  it('provides a safe recovery message when the request workspace times out', () => {
    expect(requestDetailClientFailureMessage('loadRequestTimeout')).toBe(
      'Request details took too long to load. Try again.',
    )
  })

  it('preserves expected request detail load API messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'Request not found.',
      'Could not verify request access.',
    ]) {
      expect(requestDetailClientApiErrorMessage('verifyAccess', message)).toBe(message)
    }

    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'Could not load audit events.',
      'Could not load request activity.',
    ]) {
      expect(requestDetailClientApiErrorMessage('loadActivity', message)).toBe(message)
    }
  })

  it('falls back for unexpected request detail load API text', () => {
    for (const error of [
      undefined,
      null,
      '',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'requests failed for 11111111-1111-1111-1111-111111111111',
      'Bearer abc.def.ghi',
      new Error('network failure'),
    ]) {
      const accessMessage = requestDetailClientApiErrorMessage('verifyAccess', error)
      const activityMessage = requestDetailClientApiErrorMessage('loadActivity', error)

      expect(accessMessage).toBe('Request not found.')
      expect(activityMessage).toBe('Could not load request activity. Please try again.')
      expect(`${accessMessage} ${activityMessage}`).not.toMatch(/postgres:|supabase\.co|Bearer|11111111/i)
    }
  })
})
