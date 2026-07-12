import { getUnsafeReleaseRuntimeFlags } from './release-readiness-env-config.mjs'

const unsafeFlags = getUnsafeReleaseRuntimeFlags(process.env)

if (unsafeFlags.length > 0) {
  console.error(
    JSON.stringify(
      {
        schemaVersion: 1,
        decision: 'REFUSED_SENSITIVE_RUNTIME_FLAGS',
        message:
          'Release readiness verification must run with production-sensitive runtime flags disabled.',
        unsafeFlags,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
      productionSensitiveRuntimeFlagsEnabled: false,
    },
    null,
    2,
  ),
)
