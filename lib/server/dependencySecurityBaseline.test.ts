import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

type PackageLock = {
  packages: Record<string, { version?: string }>
}

const repoRoot = process.cwd()
const packageJson = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf8'),
) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  overrides: Record<string, string>
}
const packageLock = JSON.parse(
  readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'),
) as PackageLock
const remediationDoc = readFileSync(
  join(repoRoot, 'docs', 'DEPENDENCY_SECURITY_REMEDIATION_20260709.md'),
  'utf8',
)

function lockedVersion(packageName: string): string | undefined {
  return packageLock.packages[`node_modules/${packageName}`]?.version
}

describe('dependency security baseline', () => {
  it('pins the reviewed direct dependency floors and PostCSS override', () => {
    expect(packageJson.dependencies.next).toBe('16.2.10')
    expect(packageJson.dependencies.resend).toBe('^6.17.2')
    expect(packageJson.devDependencies['eslint-config-next']).toBe('16.2.10')
    expect(packageJson.devDependencies.vitest).toBe('^3.2.6')
    expect(packageJson.overrides.postcss).toBe('8.5.10')
  })

  it('keeps the reviewed lockfile resolutions at patched versions', () => {
    expect(lockedVersion('next')).toBe('16.2.10')
    expect(lockedVersion('resend')).toBe('6.17.2')
    expect(lockedVersion('eslint-config-next')).toBe('16.2.10')
    expect(lockedVersion('vitest')).toBe('3.2.6')
    expect(lockedVersion('postcss')).toBe('8.5.10')
    expect(lockedVersion('ws')).toBe('8.21.0')
    expect(lockedVersion('qs')).toBe('6.15.3')
    expect(packageLock.packages['node_modules/next/node_modules/postcss']).toBeUndefined()
  })

  it('documents zero-audit evidence without granting production approval', () => {
    expect(remediationDoc).toContain(
      'DEPENDENCY SECURITY BASELINE VERIFIED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )
    expect(remediationDoc).toContain(
      '`npm.cmd audit --json`: zero known vulnerabilities',
    )
    expect(remediationDoc).toContain(
      '`npm.cmd audit --omit=dev --json`: zero known vulnerabilities',
    )
    expect(remediationDoc).toContain('Production RLS')
    expect(remediationDoc).toContain('remain separately approval-gated and `NO-GO`')
  })
})
