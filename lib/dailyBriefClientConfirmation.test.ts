import { describe, expect, it } from 'vitest'
import {
  DAILY_BRIEF_CLIENT_CONFIRMATION_TIMEOUT_MS,
  DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE,
} from './dailyBriefClientConfirmation'

describe('Daily Brief client confirmation contract', () => {
  it('allows bounded server and provider work within one finite browser deadline', () => {
    expect(DAILY_BRIEF_CLIENT_CONFIRMATION_TIMEOUT_MS).toBe(30_000)
  })

  it('requires inbox review and explains same-attempt recovery after uncertainty', () => {
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('could not confirm')
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('Check the parish inbox')
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('reuse this delivery attempt')
  })
})
