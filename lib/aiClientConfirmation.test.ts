import { describe, expect, it } from 'vitest'

import {
  AI_CLIENT_GENERATION_CONFIRMATION_TIMEOUT_MS,
  AI_CLIENT_GENERATION_UNCONFIRMED_MESSAGE,
  AI_CLIENT_PERSISTENCE_CONFIRMATION_TIMEOUT_MS,
  AI_CLIENT_PERSISTENCE_REFRESH_REQUIRED_MESSAGE,
} from './aiClientConfirmation'

describe('AI client confirmation boundary', () => {
  it('allows the server provider deadline to settle before the browser gives up', () => {
    expect(AI_CLIENT_GENERATION_CONFIRMATION_TIMEOUT_MS).toBe(40_000)
  })

  it('gives persistence a finite confirmation window', () => {
    expect(AI_CLIENT_PERSISTENCE_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('keeps generation and uncertain persistence guidance distinct', () => {
    expect(AI_CLIENT_GENERATION_UNCONFIRMED_MESSAGE).toContain('Nothing was saved')
    expect(AI_CLIENT_GENERATION_UNCONFIRMED_MESSAGE).toContain('try again')
    expect(AI_CLIENT_PERSISTENCE_REFRESH_REQUIRED_MESSAGE).toContain(
      'could not confirm whether',
    )
    expect(AI_CLIENT_PERSISTENCE_REFRESH_REQUIRED_MESSAGE).toContain('Refresh')
    expect(AI_CLIENT_PERSISTENCE_REFRESH_REQUIRED_MESSAGE).not.toContain('try again')
  })
})
