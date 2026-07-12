import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  PUBLIC_INTAKE_ROUTING_RUNTIME_ACK,
  PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
  PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
  PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG,
  getPublicIntakeRoutingRuntimeGate,
} from '@/lib/server/publicIntakeRoutingRuntimeGate'

function env(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return values as NodeJS.ProcessEnv
}

describe('getPublicIntakeRoutingRuntimeGate', () => {
  it('keeps runtime public intake routing disabled by default', () => {
    expect(getPublicIntakeRoutingRuntimeGate(env())).toEqual({
      enabled: false,
      reason: `${PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG} is not enabled.`,
      routeSignals: [],
      legacyFallback: true,
    })
  })

  it('requires the exact enabled value and exact product-owner acknowledgement', () => {
    expect(
      getPublicIntakeRoutingRuntimeGate(env({
        [PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG]: 'enabled',
        [PUBLIC_INTAKE_ROUTING_RUNTIME_ACK]: PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
      }))
    ).toMatchObject({ enabled: false })

    expect(
      getPublicIntakeRoutingRuntimeGate(env({
        [PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG]: PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
      }))
    ).toEqual({
      enabled: false,
      reason: `${PUBLIC_INTAKE_ROUTING_RUNTIME_ACK} approval is missing.`,
      routeSignals: [],
      legacyFallback: true,
    })
  })

  it('opens only the approved public route signals when both guards are exact', () => {
    expect(
      getPublicIntakeRoutingRuntimeGate(env({
        [PUBLIC_INTAKE_ROUTING_RUNTIME_FLAG]: PUBLIC_INTAKE_ROUTING_RUNTIME_ENABLED_VALUE,
        [PUBLIC_INTAKE_ROUTING_RUNTIME_ACK]: PUBLIC_INTAKE_ROUTING_RUNTIME_ACK_VALUE,
      }))
    ).toEqual({
      enabled: true,
      routeSignals: ['verified_domain', 'token', 'slug'],
      legacyFallback: true,
    })
  })
})
