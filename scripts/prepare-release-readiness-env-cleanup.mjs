import { getUnsafeReleaseRuntimeFlags } from './release-readiness-env-config.mjs'

const unsafeFlags = getUnsafeReleaseRuntimeFlags(process.env)
const unsafeFlagNames = unsafeFlags.map((flag) => flag.name)

const powerShellProcessScopeCommands = unsafeFlagNames.map(
  (name) => `Remove-Item Env:\\${name} -ErrorAction SilentlyContinue`,
)

const powerShellUserScopeCommands = unsafeFlagNames.map(
  (name) => `[Environment]::SetEnvironmentVariable('${name}', $null, 'User')`,
)

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision:
        unsafeFlags.length === 0
          ? 'RELEASE_ENV_ALREADY_CLEAN'
          : 'RELEASE_ENV_CLEANUP_GUIDE_READY',
      message:
        unsafeFlags.length === 0
          ? 'No known production-sensitive QA/prototype runtime residue is configured in this process.'
          : 'Known production-sensitive QA/prototype runtime residue is present. Review the variable names and clear only the scopes you intend before running release-readiness checks.',
      unsafeFlags,
      mutatesEnvironment: false,
      secretValuesPrinted: false,
      valuePolicy: 'variable-names-and-safe-labels-only',
      powerShellProcessScopeCommands,
      powerShellUserScopeCommands,
      nextSteps:
        unsafeFlags.length === 0
          ? ['Run npm run check:release-env from the same shell.']
          : [
              'Run the process-scope commands to clear only the current PowerShell session.',
              'Run the user-scope commands only if these QA/prototype variables were intentionally saved in Windows user scope and should no longer persist for future shells.',
              'Open a new terminal after user-scope cleanup, then run npm run check:release-env.',
            ],
    },
    null,
    2,
  ),
)
