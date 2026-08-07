import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  isProbablyBinary,
  scanTextForRepositorySecrets,
} from './repository-secret-scan-rules.mjs'

const repoRoot = process.cwd()
const gitFileListMaxBufferBytes = 64 * 1024 * 1024
const listedFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: gitFileListMaxBufferBytes,
  },
)
  .split('\0')
  .filter(Boolean)
  .sort((left, right) => left.localeCompare(right))

const findings = []
let scannedFileCount = 0
let skippedBinaryFileCount = 0

for (const relativePath of listedFiles) {
  const absolutePath = resolve(repoRoot, relativePath)
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) continue

  const buffer = readFileSync(absolutePath)
  if (isProbablyBinary(buffer)) {
    skippedBinaryFileCount += 1
    continue
  }

  scannedFileCount += 1
  const fileFindings = scanTextForRepositorySecrets(buffer.toString('utf8'))
  if (fileFindings.length > 0) {
    findings.push({
      path: relativePath.replaceAll('\\', '/'),
      matches: fileFindings,
    })
  }
}

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'REPOSITORY_SECRET_SCAN_PASSED'
      : 'REPOSITORY_SECRET_SCAN_FAILED',
  valuePolicy: 'file-path-rule-id-and-line-only',
  secretValuesPrinted: false,
  scannedFileCount,
  skippedBinaryFileCount,
  findingFileCount: findings.length,
  findings,
}

const output = JSON.stringify(report, null, 2)
if (findings.length > 0) {
  console.error(output)
  process.exit(1)
}

console.log(output)
