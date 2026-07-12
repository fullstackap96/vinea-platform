import { execFileSync, spawnSync } from 'node:child_process'

import { buildReleaseCandidateCommitScope } from './prepare-release-candidate-commit-scope.mjs'

const repoRoot = process.cwd()
const requiredConfirmation = 'STAGE_REVIEWED_VINEA_RELEASE_CANDIDATE_20260711'
const executeRequested = process.argv.includes('--execute')
const confirmationAccepted =
  process.env.VINEA_RELEASE_CANDIDATE_STAGE_CONFIRM === requiredConfirmation

function gitPaths(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
    .split('\0')
    .filter(Boolean)
    .map((path) => path.replaceAll('\\', '/'))
}

const { candidates, report: scope } = buildReleaseCandidateCommitScope()
const uniqueCandidates = [...new Set(candidates)]
const stagedPathArgs = [
  'diff',
  '--cached',
  '--name-only',
  '--no-renames',
  '-z',
]
const existingStagedPaths = gitPaths(stagedPathArgs)

if (!executeRequested) {
  console.log(
    JSON.stringify(
      {
        schemaVersion: 1,
        decision: 'RELEASE_CANDIDATE_STAGE_DRY_RUN_ONLY',
        confirmationAccepted,
        candidatePathCount: uniqueCandidates.length,
        excludedPathCount: scope.excludedPathCount,
        preexistingStagedPathCount: existingStagedPaths.length,
        gitIndexMutated: false,
        commitCreated: false,
        productionApproved: false,
        requiredConfirmationVariable: 'VINEA_RELEASE_CANDIDATE_STAGE_CONFIRM',
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (!confirmationAccepted) {
  console.error(
    JSON.stringify(
      {
        schemaVersion: 1,
        decision: 'RELEASE_CANDIDATE_STAGE_REFUSED_CONFIRMATION',
        gitIndexMutated: false,
        commitCreated: false,
        productionApproved: false,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

if (existingStagedPaths.length > 0) {
  console.error(
    JSON.stringify(
      {
        schemaVersion: 1,
        decision: 'RELEASE_CANDIDATE_STAGE_REFUSED_NONEMPTY_INDEX',
        preexistingStagedPathCount: existingStagedPaths.length,
        gitIndexMutated: false,
        commitCreated: false,
        productionApproved: false,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

const stageResult = spawnSync(
  'git',
  ['update-index', '--add', '--remove', '-z', '--stdin'],
  {
    cwd: repoRoot,
    input: `${uniqueCandidates.join('\0')}\0`,
    encoding: 'utf8',
  },
)

if (stageResult.status !== 0) {
  console.error(
    JSON.stringify(
      {
        schemaVersion: 1,
        decision: 'RELEASE_CANDIDATE_STAGE_FAILED',
        stagedPathCount: gitPaths(stagedPathArgs).length,
        commitCreated: false,
        productionApproved: false,
        recoveryRequired: true,
      },
      null,
      2,
    ),
  )
  process.exit(stageResult.status ?? 1)
}

const stagedPaths = gitPaths(stagedPathArgs)
const candidateSet = new Set(uniqueCandidates)
const unexpectedStagedCount = stagedPaths.filter((path) => !candidateSet.has(path)).length
const missingStagedCount = uniqueCandidates.filter(
  (path) => !stagedPaths.includes(path),
).length

const passed = unexpectedStagedCount === 0 && missingStagedCount === 0
console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: passed
        ? 'RELEASE_CANDIDATE_SCOPE_STAGED_FOR_REVIEW'
        : 'RELEASE_CANDIDATE_STAGE_VERIFICATION_FAILED',
      candidatePathCount: uniqueCandidates.length,
      stagedPathCount: stagedPaths.length,
      unexpectedStagedCount,
      missingStagedCount,
      commitCreated: false,
      productionApproved: false,
      recoveryRequired: !passed,
    },
    null,
    2,
  ),
)

if (!passed) process.exit(1)
