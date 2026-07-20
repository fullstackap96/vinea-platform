import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const repoRoot = process.cwd()
const gitOutputMaxBufferBytes = 64 * 1024 * 1024
const gitContentMaxBufferBytes = 512 * 1024 * 1024
const manifestArgs = process.argv.slice(2)
const sourceMode =
  manifestArgs.length === 1 && manifestArgs[0] === '--tracked-head'
    ? 'tracked-head'
    : manifestArgs.length === 0
      ? 'working-tree'
      : null

if (!sourceMode) {
  console.error(
    'Usage: node scripts/build-release-candidate-source-manifest.mjs [--tracked-head]',
  )
  process.exit(1)
}

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
    maxBuffer: gitOutputMaxBufferBytes,
  })
    .split('\0')
    .filter(Boolean)
    .map((path) => path.replaceAll('\\', '/'))
}

function readTrackedHeadBlobs(paths, commit) {
  if (paths.some((path) => path.includes('\n') || path.includes('\r'))) {
    throw new Error('Release source contains an unsupported line break in a path.')
  }

  const input = Buffer.from(
    paths.map((path) => `${commit}:${path}\n`).join(''),
    'utf8',
  )
  const result = spawnSync('git', ['cat-file', '--batch'], {
    cwd: repoRoot,
    input,
    encoding: null,
    maxBuffer: gitContentMaxBufferBytes,
  })

  if (result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
    throw new Error('Could not read the committed release source tree.')
  }

  const blobs = new Map()
  let offset = 0

  for (const path of paths) {
    const headerEnd = result.stdout.indexOf(0x0a, offset)
    if (headerEnd < 0) {
      throw new Error('Committed release source batch output was incomplete.')
    }

    const [objectId, objectType, rawSize] = result.stdout
      .subarray(offset, headerEnd)
      .toString('utf8')
      .split(' ')
    const size = Number(rawSize)
    const contentStart = headerEnd + 1
    const contentEnd = contentStart + size

    if (
      !/^[a-f0-9]{40,64}$/.test(objectId ?? '') ||
      objectType !== 'blob' ||
      !Number.isSafeInteger(size) ||
      size < 0 ||
      contentEnd >= result.stdout.length ||
      result.stdout[contentEnd] !== 0x0a
    ) {
      throw new Error('Committed release source batch output was invalid.')
    }

    blobs.set(path, result.stdout.subarray(contentStart, contentEnd))
    offset = contentEnd + 1
  }

  if (offset !== result.stdout.length) {
    throw new Error('Committed release source batch output contained unexpected data.')
  }

  return blobs
}

function isReleaseSourcePath(path) {
  return (
    includedRootFiles.has(path) ||
    includedPrefixes.some((prefix) => path.startsWith(prefix))
  )
}

const baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: gitOutputMaxBufferBytes,
}).trim()
const trackedPaths = new Set(gitLines(['ls-files', '--cached', '-z']))
const sourcePaths = gitLines(
  sourceMode === 'tracked-head'
    ? ['ls-tree', '-r', '--name-only', '-z', baseCommit]
    : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
)
  .filter(isReleaseSourcePath)
  .filter((path) =>
    sourceMode === 'tracked-head'
      ? true
      : existsSync(resolve(repoRoot, path)) && statSync(resolve(repoRoot, path)).isFile(),
  )
  .sort((left, right) => left.localeCompare(right))
const trackedHeadBlobs =
  sourceMode === 'tracked-head'
    ? readTrackedHeadBlobs(sourcePaths, baseCommit)
    : null

const aggregate = createHash('sha256')
let trackedFileCount = 0
let untrackedFileCount = 0

for (const path of sourcePaths) {
  const bytes = canonicalSourceBytes(
    path,
    trackedHeadBlobs?.get(path) ?? readFileSync(resolve(repoRoot, path)),
  )
  const contentHash = createHash('sha256').update(bytes).digest('hex')

  aggregate.update(path)
  aggregate.update('\0')
  aggregate.update(String(bytes.length))
  aggregate.update('\0')
  aggregate.update(contentHash)
  aggregate.update('\n')

  if (sourceMode === 'tracked-head' || trackedPaths.has(path)) trackedFileCount += 1
  else untrackedFileCount += 1
}

const worktreeDirty =
  execFileSync('git', ['status', '--porcelain'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: gitOutputMaxBufferBytes,
  }).trim().length > 0

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision: 'RELEASE_CANDIDATE_SOURCE_MANIFEST_READY',
      sourceMode,
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
