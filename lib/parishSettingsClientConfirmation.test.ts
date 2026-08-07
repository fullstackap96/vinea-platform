import { describe, expect, it } from 'vitest'
import {
  PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS,
  PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE,
  STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE,
} from './parishSettingsClientConfirmation'

describe('parish settings client confirmation contract', () => {
  it('uses one finite confirmation deadline for staff-reviewed settings writes', () => {
    expect(PARISH_SETTINGS_MUTATION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('requires refresh and selected-parish review after ambiguous settings persistence', () => {
    expect(PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE).toContain('Refresh Settings')
    expect(PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
  })

  it('requires refresh and selected-parish review after ambiguous Staff Access persistence', () => {
    expect(STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE).toContain('Refresh Settings')
    expect(STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
  })
})
