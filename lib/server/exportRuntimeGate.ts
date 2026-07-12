export const EXPORT_RUNTIME_GATE_VERSION = '2026-06-30-export-runtime-gate-v1'

export const EXPORT_RUNTIME_FLAG = 'VINEA_EXPORT_RUNTIME'
export const EXPORT_RUNTIME_ACK_FLAG = 'VINEA_EXPORT_RUNTIME_ACK'
export const EXPORT_RUNTIME_ENV_FLAG = 'VINEA_EXPORT_RUNTIME_ENV'

export const EXPORT_RUNTIME_ENABLED_VALUE = 'ENABLED'
export const EXPORT_RUNTIME_ACK_VALUE = 'APPROVED_EXPORT_RUNTIME_QA'
export const EXPORT_RUNTIME_NON_PRODUCTION_VALUE = 'NON_PRODUCTION'

export type ExportRuntimeGateState =
  | 'disabled'
  | 'enabled_non_production'
  | 'blocked_missing_ack'
  | 'blocked_wrong_environment'
  | 'blocked_production_environment'

export type ExportRuntimeGateResult = {
  readonly version: typeof EXPORT_RUNTIME_GATE_VERSION
  readonly enabled: boolean
  readonly state: ExportRuntimeGateState
  readonly requiredFlags: {
    readonly runtime: typeof EXPORT_RUNTIME_FLAG
    readonly runtimeAck: typeof EXPORT_RUNTIME_ACK_FLAG
    readonly runtimeEnvironment: typeof EXPORT_RUNTIME_ENV_FLAG
  }
  readonly publicReason: string
}

type ExportRuntimeGateEnv = Record<string, string | undefined>

function isProductionEnvironment(env: ExportRuntimeGateEnv): boolean {
  return env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
}

export function getExportRuntimeGate(env: ExportRuntimeGateEnv = process.env): ExportRuntimeGateResult {
  const runtimeEnabled = env[EXPORT_RUNTIME_FLAG] === EXPORT_RUNTIME_ENABLED_VALUE
  const ackApproved = env[EXPORT_RUNTIME_ACK_FLAG] === EXPORT_RUNTIME_ACK_VALUE
  const nonProductionApproved = env[EXPORT_RUNTIME_ENV_FLAG] === EXPORT_RUNTIME_NON_PRODUCTION_VALUE

  let state: ExportRuntimeGateState = 'disabled'

  if (runtimeEnabled && isProductionEnvironment(env)) {
    state = 'blocked_production_environment'
  } else if (runtimeEnabled && !ackApproved) {
    state = 'blocked_missing_ack'
  } else if (runtimeEnabled && !nonProductionApproved) {
    state = 'blocked_wrong_environment'
  } else if (runtimeEnabled) {
    state = 'enabled_non_production'
  }

  return {
    version: EXPORT_RUNTIME_GATE_VERSION,
    enabled: state === 'enabled_non_production',
    state,
    requiredFlags: {
      runtime: EXPORT_RUNTIME_FLAG,
      runtimeAck: EXPORT_RUNTIME_ACK_FLAG,
      runtimeEnvironment: EXPORT_RUNTIME_ENV_FLAG,
    },
    publicReason:
      state === 'enabled_non_production'
        ? 'Export runtime QA gate is enabled for an approved non-production environment.'
        : 'Export runtime is disabled.',
  }
}
