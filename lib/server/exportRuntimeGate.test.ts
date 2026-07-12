import { describe, expect, it } from 'vitest'
import {
  EXPORT_RUNTIME_ACK_FLAG,
  EXPORT_RUNTIME_ACK_VALUE,
  EXPORT_RUNTIME_ENABLED_VALUE,
  EXPORT_RUNTIME_ENV_FLAG,
  EXPORT_RUNTIME_FLAG,
  EXPORT_RUNTIME_NON_PRODUCTION_VALUE,
  getExportRuntimeGate,
} from './exportRuntimeGate'

describe('export runtime gate', () => {
  it('is disabled by default', () => {
    const gate = getExportRuntimeGate({})

    expect(gate.enabled).toBe(false)
    expect(gate.state).toBe('disabled')
    expect(gate.publicReason).toBe('Export runtime is disabled.')
  })

  it('requires the exact acknowledgement and non-production marker', () => {
    expect(
      getExportRuntimeGate({
        [EXPORT_RUNTIME_FLAG]: EXPORT_RUNTIME_ENABLED_VALUE,
      }).state
    ).toBe('blocked_missing_ack')

    expect(
      getExportRuntimeGate({
        [EXPORT_RUNTIME_FLAG]: EXPORT_RUNTIME_ENABLED_VALUE,
        [EXPORT_RUNTIME_ACK_FLAG]: EXPORT_RUNTIME_ACK_VALUE,
      }).state
    ).toBe('blocked_wrong_environment')
  })

  it('can be enabled only for explicitly approved non-production QA', () => {
    const gate = getExportRuntimeGate({
      [EXPORT_RUNTIME_FLAG]: EXPORT_RUNTIME_ENABLED_VALUE,
      [EXPORT_RUNTIME_ACK_FLAG]: EXPORT_RUNTIME_ACK_VALUE,
      [EXPORT_RUNTIME_ENV_FLAG]: EXPORT_RUNTIME_NON_PRODUCTION_VALUE,
      VERCEL_ENV: 'preview',
    })

    expect(gate.enabled).toBe(true)
    expect(gate.state).toBe('enabled_non_production')
  })

  it('blocks production even when the QA flags are present', () => {
    const gate = getExportRuntimeGate({
      [EXPORT_RUNTIME_FLAG]: EXPORT_RUNTIME_ENABLED_VALUE,
      [EXPORT_RUNTIME_ACK_FLAG]: EXPORT_RUNTIME_ACK_VALUE,
      [EXPORT_RUNTIME_ENV_FLAG]: EXPORT_RUNTIME_NON_PRODUCTION_VALUE,
      VERCEL_ENV: 'production',
    })

    expect(gate.enabled).toBe(false)
    expect(gate.state).toBe('blocked_production_environment')
  })
})
