import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const repoRoot = process.cwd()

const includedPrefixes = [
  '.github/',
  'app/',
  'lib/',
  'public/',
  'scripts/',
  'supabase/',
]

const includedRootFiles = new Set([
  '.env.example',
  '.gitignore',
  '.nvmrc',
  'CODEX_AUTONOMOUS_INSTRUCTIONS.md',
  'README.md',
  'eslint.config.mjs',
  'middleware.ts',
  'next.config.ts',
  'package-lock.json',
  'package.json',
  'postcss.config.mjs',
  'proxy.ts',
  'tsconfig.json',
  'tsconfig.typecheck.json',
  'vitest.config.ts',
])

const forbiddenPrefixes = [
  '.codex',
  '.next/',
  'docs/sales/',
  'node_modules/',
  'out/',
  'output/',
  'tmp/',
]

const forbiddenExtensions = new Set([
  '.csv',
  '.jpeg',
  '.jpg',
  '.log',
  '.pdf',
  '.pid',
  '.png',
  '.xlsx',
])

function listedPaths(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .map((path) => path.replaceAll('\\', '/'))
}

function extension(path) {
  const lastSlash = path.lastIndexOf('/')
  const lastDot = path.lastIndexOf('.')
  return lastDot > lastSlash ? path.slice(lastDot).toLowerCase() : ''
}

function isIncludedDocumentation(path) {
  if (!path.startsWith('docs/')) return false
  return ['.json', '.md', '.sql'].includes(extension(path))
}

function exclusionReason(path) {
  if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) {
    return 'forbidden-prefix'
  }
  if (forbiddenExtensions.has(extension(path))) return 'forbidden-extension'
  if (path.startsWith('.') && !includedRootFiles.has(path)) return 'local-hidden-artifact'
  return 'outside-release-scope'
}

function isCandidate(path) {
  if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) return false
  if (forbiddenExtensions.has(extension(path))) return false
  return (
    includedRootFiles.has(path) ||
    includedPrefixes.some((prefix) => path.startsWith(prefix)) ||
    isIncludedDocumentation(path)
  )
}

export function buildReleaseCandidateCommitScope() {
  const trackedChangedPaths = listedPaths([
    'diff',
    '--name-only',
    '--no-renames',
    '-z',
    'HEAD',
    '--',
  ])
  const untrackedPaths = listedPaths([
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
  ])
  const listedChangedPaths = [...trackedChangedPaths, ...untrackedPaths]
  const changedPaths = [...new Set(listedChangedPaths)]

  const candidates = changedPaths.filter(isCandidate).sort((left, right) =>
    left.localeCompare(right),
  )
  const excluded = changedPaths.filter((path) => !isCandidate(path))

  const exclusionReasonCounts = excluded.reduce((counts, path) => {
    const reason = exclusionReason(path)
    counts[reason] = (counts[reason] ?? 0) + 1
    return counts
  }, {})

  const missingCandidateCount = candidates.filter((path) => {
    const absolutePath = resolve(repoRoot, path)
    return !existsSync(absolutePath)
  }).length
  const candidateByteCount = candidates.reduce((total, path) => {
    const absolutePath = resolve(repoRoot, path)
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) return total
    return total + statSync(absolutePath).size
  }, 0)

  return {
    candidates,
    report: {
      schemaVersion: 1,
      decision:
        candidates.length === 0
          ? 'RELEASE_CANDIDATE_COMMIT_SCOPE_SETTLED'
          : 'RELEASE_CANDIDATE_COMMIT_SCOPE_READY_FOR_REVIEW',
      rawChangedPathCount: listedChangedPaths.length,
      changedPathCount: changedPaths.length,
      duplicateChangedPathEntryCount:
        listedChangedPaths.length - changedPaths.length,
      candidatePathCount: candidates.length,
      deletedCandidatePathCount: missingCandidateCount,
      candidateByteCount,
      excludedPathCount: excluded.length,
      exclusionReasonCounts,
      includesSalesDocs: false,
      includesCsv: false,
      includesGeneratedOutput: false,
      includesTemporaryArtifacts: false,
      includesEnvironmentSecrets: false,
      printsPathList: false,
      mutatesGitIndex: false,
      createsCommit: false,
      productionApproved: false,
    },
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  const { report } = buildReleaseCandidateCommitScope()
  console.log(JSON.stringify(report, null, 2))
}
