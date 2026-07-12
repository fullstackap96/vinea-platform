import { describe, expect, it } from 'vitest'
import {
  dashboardQueueClientErrorMessage,
  dashboardQueueFailureMessage,
  dashboardQueueFailureMessages,
  type DashboardQueueAction,
} from './dashboardQueueClientMessages'

const actions: DashboardQueueAction[] = [
  'communicationTouchpoint',
  'communicationFollowUp',
  'intakeRequestCommunication',
  'intakeRequestTriage',
  'intakeMassIntentionTriage',
]

describe('dashboard queue client messages', () => {
  it('defines safe messages for communications and intake queue actions', () => {
    for (const action of actions) {
      const message = dashboardQueueFailureMessage(action)

      expect(message).toBe(dashboardQueueFailureMessages[action])
      expect(message).toMatch(/\.$/)
      expect(message).not.toMatch(/postgres:|supabase\.co|Bearer|service_role|signed|storage\//i)
    }
  })

  it('preserves approved validation and maps expired sessions to plain guidance', () => {
    expect(dashboardQueueClientErrorMessage('communicationTouchpoint', 'Add a short communication note.')).toBe(
      'Add a short communication note.',
    )
    expect(dashboardQueueClientErrorMessage('intakeRequestTriage', 'Invalid follow-up date.')).toBe(
      'Invalid follow-up date.',
    )
    expect(dashboardQueueClientErrorMessage('intakeMassIntentionTriage', 'Unauthorized')).toBe(
      'Your staff session is no longer active. Sign in and try again.',
    )
  })

  it('replaces unexpected queue action text', () => {
    for (const action of actions) {
      for (const error of [
        'private constraint failed for family@example.test',
        'request 132ca2b3-84a4-4b50-8625-0bb773d87d31 failed',
        { message: 'raw object error' },
        null,
      ]) {
        expect(dashboardQueueClientErrorMessage(action, error)).toBe(
          dashboardQueueFailureMessage(action),
        )
      }
    }
  })
})
