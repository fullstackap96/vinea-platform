import { describe, expect, it } from 'vitest'
import {
  PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_TIMEOUT_MS,
  PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE,
} from './publicIntakeRoutingClientConfirmation'

describe('Public Intake Routing client confirmation contract', () => {
  it('uses one finite mutation confirmation deadline', () => {
    expect(PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('requires selected-parish and token-list review after ambiguity', () => {
    expect(PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
    expect(PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE).toContain('token list')
  })
})
