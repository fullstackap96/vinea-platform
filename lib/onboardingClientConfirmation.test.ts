import { describe, expect, it } from 'vitest'
import {
  ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS,
  ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE,
} from './onboardingClientConfirmation'

describe('Onboarding completion client confirmation contract', () => {
  it('uses a finite confirmation deadline', () => {
    expect(ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('requires selected-parish review before retry after uncertainty', () => {
    expect(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE).toContain('Refresh this page')
    expect(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
  })
})
