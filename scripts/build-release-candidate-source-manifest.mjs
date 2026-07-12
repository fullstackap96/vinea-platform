import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const repoRoot = process.cwd()

const includedPrefixes = [
  '.github/workflows/',
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
  'eslint.config.mjs',
  'next.config.ts',
  'package-lock.json',
  'package.json',
  'postcss.config.mjs',
  'proxy.ts',
  'tsconfig.json',
  'tsconfig.typecheck.json',
  'vitest.config.ts',
])

const binaryExtensions = new Set([
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mp4',
  '.otf',
  '.pdf',
  '.png',
  '.ttf',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
])

function canonicalSourceBytes(path, bytes) {
  if (binaryExtensions.has(extname(path).toLowerCase()) || bytes.includes(0)) {
    return bytes
  }

  return Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'), 'utf8')
}

function gitLines(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .map((path) => path.replaceAll('\\', '/'))
}

function isReleaseSourcePath(path) {
  return (
    includedRootFiles.has(path) ||
    includedPrefixes.some((prefix) => path.startsWith(prefix))
  )
}

const trackedPaths = new Set(gitLines(['ls-files', '--cached', '-z']))
const sourcePaths = gitLines([
  'ls-files',
  '--cached',
  '--others',
  '--exclude-standard',
  '-z',
])
  .filter(isReleaseSourcePath)
  .filter((path) => {
    const absolutePath = resolve(repoRoot, path)
    return existsSync(absolutePath) && statSync(absolutePath).isFile()
  })
  .sort((left, right) => left.localeCompare(right))

const aggregate = createHash('sha256')
let trackedFileCount = 0
let untrackedFileCount = 0

for (const path of sourcePaths) {
  const bytes = canonicalSourceBytes(
    path,
    readFileSync(resolve(repoRoot, path)),
  )
  const contentHash = createHash('sha256').update(bytes).digest('hex')

  aggregate.update(path)
  aggregate.update('\0')
  aggregate.update(String(bytes.length))
  aggregate.update('\0')
  aggregate.update(contentHash)
  aggregate.update('\n')

  if (trackedPaths.has(path)) trackedFileCount += 1
  else untrackedFileCount += 1
}

const baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repoRoot,
  encoding: 'utf8',
}).trim()

const worktreeDirty =
  execFileSync('git', ['status', '--porcelain'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim().length > 0

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: 'RELEASE_CANDIDATE_SOURCE_MANIFEST_READY',
      baseCommit,
      aggregateSha256: aggregate.digest('hex').toUpperCase(),
      sourceFileCount: sourcePaths.length,
      trackedFileCount,
      untrackedFileCount,
      worktreeDirty,
      scope: 'release-source-only',
      includesEnvironmentFiles: false,
      printsFilePaths: false,
      printsFileContents: false,
      printsSecretValues: false,
      productionApproved: false,
    },
    null,
    2,
  ),
)
