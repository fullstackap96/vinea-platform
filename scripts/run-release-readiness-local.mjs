import { spawnSync } from 'node:child_process'

function buildNpmInvocation(args) {
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/c', 'npm.cmd', ...args],
    }
  }

  return {
    command: 'npm',
    args,
  }
}

function buildChildProcessEnv(parentEnv) {
  const childEnv = { ...parentEnv }

  for (const key of Object.keys(childEnv)) {
    if (/^npm_/i.test(key)) {
      delete childEnv[key]
    }
  }

  delete childEnv.INIT_CWD

  return childEnv
}

const releaseReadinessCommands = [
  {
    label: 'npm run check:release-env',
    args: ['run', 'check:release-env'],
  },
  {
    label: 'npm run check:rls-production-evidence',
    args: ['run', 'check:rls-production-evidence'],
  },
  {
    label: 'npm run check:production-monitoring-evidence',
    args: ['run', 'check:production-monitoring-evidence'],
  },
  {
    label: 'npm run check:production-gates',
    args: ['run', 'check:production-gates'],
  },
  {
    label: 'npm run check:csp-report-only',
    args: ['run', 'check:csp-report-only'],
  },
  {
    label: 'npm run check:trust-center-claims',
    args: ['run', 'check:trust-center-claims'],
  },
  {
    label: 'npm run check:release-handoff',
    args: ['run', 'check:release-handoff'],
  },
  {
    label: 'npm run typecheck',
    args: ['run', 'typecheck'],
  },
  {
    label: 'npm run typecheck:all',
    args: ['run', 'typecheck:all'],
  },
  {
    label: 'npm run lint',
    args: ['run', 'lint'],
  },
  {
    label: 'npm test',
    args: ['test', '--', '--configLoader', 'runner'],
  },
  {
    label: 'npm run build',
    args: ['run', 'build'],
  },
]

const safeBoundary = {
  deploysCode: false,
  enablesProductionFlags: false,
  addsProductionFlags: false,
  accessesProduction: false,
  appliesMigrations: false,
  changesOperationalRls: false,
  mutatesRecords: false,
  touchesGoogleCalendarData: false,
  runsExports: false,
  callsAi: false,
  accessesStorage: false,
  createsSignedUrls: false,
  sendsCommunications: false,
  generatesCertificates: false,
  makesPublicTrustClaims: false,
}

function buildPlanReport() {
  return {
    schemaVersion: 1,
    decision: 'LOCAL_RELEASE_READINESS_PLAN_READY',
    productionSensitiveFeaturesApproved: false,
    publicTrustClaimsApproved: false,
    commandCount: releaseReadinessCommands.length,
    commands: releaseReadinessCommands.map((command) => command.label),
    safeBoundary,
  }
}

if (process.argv.includes('--plan')) {
  console.log(JSON.stringify(buildPlanReport(), null, 2))
  process.exit(0)
}

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: 'LOCAL_RELEASE_READINESS_STARTED',
      productionSensitiveFeaturesApproved: false,
      publicTrustClaimsApproved: false,
      commandCount: releaseReadinessCommands.length,
      commands: releaseReadinessCommands.map((command) => command.label),
      safeBoundary,
    },
    null,
    2,
  ),
)

for (const [index, command] of releaseReadinessCommands.entries()) {
  console.log(
    `[release-readiness] ${index + 1}/${releaseReadinessCommands.length}: ${command.label}`,
  )

  const invocation = buildNpmInvocation(command.args)

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: buildChildProcessEnv(process.env),
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    console.error(
      JSON.stringify(
        {
          schemaVersion: 1,
          decision: 'LOCAL_RELEASE_READINESS_FAILED',
          productionSensitiveFeaturesApproved: false,
          publicTrustClaimsApproved: false,
          failedCommand: command.label,
          completedCommandCount: index,
          commandCount: releaseReadinessCommands.length,
          childProcessErrorCode: result.error?.code ?? null,
          childProcessErrorMessage: result.error ? 'Child process failed to start' : null,
          nextSafeAction:
            'Fix the failed command output, then rerun the local release-readiness runner from the beginning.',
        },
        null,
        2,
      ),
    )
    process.exit(result.status ?? 1)
  }
}

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: 'LOCAL_RELEASE_READINESS_PASSED',
      productionSensitiveFeaturesApproved: false,
      publicTrustClaimsApproved: false,
      commandCount: releaseReadinessCommands.length,
      safeBoundary,
    },
    null,
    2,
  ),
)
