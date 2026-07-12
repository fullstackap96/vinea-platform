import { describe, expect, it } from 'vitest'
import {
  dashboardClientErrorMessage,
  dashboardClientFailureMessage,
  dashboardClientFailureMessages,
  type DashboardClientAction,
} from './dashboardClientMessages'

const actions: DashboardClientAction[] = [
  'draftFollowUp',
  'saveFollowUpDraft',
  'sendFollowUpEmail',
  'confirmFollowUpEmailSend',
  'logFollowUpEmail',
  'updateFollowUpEmailSummary',
  'logFollowUpContacted',
  'updateFollowUpContactedSummary',
  'markFollowUpContacted',
  'logCareTouchpoint',
  'updateFuneralCareDate',
  'updateCareRequest',
  'saveCareTouchpoint',
]

describe('dashboard client messages', () => {
  it('defines safe staff-facing messages for dashboard actions', () => {
    for (const action of actions) {
      const message = dashboardClientFailureMessage(action)

      expect(message).toBe(dashboardClientFailureMessages[action])
      expect(message).toMatch(/\.$/)
      expect(message).not.toMatch(/postgres:|supabase\.co|Bearer|service_role|signed|storage\//i)
    }
  })

  it('maps empty drafts and expired sessions to plain guidance', () => {
    expect(dashboardClientErrorMessage('draftFollowUp', 'Empty response.')).toBe(
      'The draft service returned no message. Please try again.',
    )
    expect(dashboardClientErrorMessage('markFollowUpContacted', 'Unauthorized')).toBe(
      'Your staff session is no longer active. Sign in and try again.',
    )
  })

  it('replaces unexpected action text with the action fallback', () => {
    for (const action of actions) {
      expect(
        dashboardClientErrorMessage(
          action,
          'private request 132ca2b3-84a4-4b50-8625-0bb773d87d31 failed',
        ),
      ).toBe(dashboardClientFailureMessage(action))
      expect(dashboardClientErrorMessage(action, { message: 'raw object' })).toBe(
        dashboardClientFailureMessage(action),
      )
    }
  })
})
