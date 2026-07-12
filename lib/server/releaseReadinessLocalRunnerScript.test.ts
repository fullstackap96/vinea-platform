import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('local release-readiness runner', () => {
  it('is exposed as an npm script and keeps the approved command order', () => {
    const packageJson = readRepoFile('package.json')
    const script = readRepoFile('scripts/run-release-readiness-local.mjs')

    expect(packageJson).toContain(
      '"check:release-local": "node scripts/run-release-readiness-local.mjs"',
    )

    const orderedCommands = [
      'npm run check:repository-secrets',
      'npm run check:dependency-security',
      'npm run check:release-env',
      'npm run check:rls-production-evidence',
      'npm run check:production-monitoring-evidence',
      'npm run check:production-gates',
      'npm run check:csp-report-only',
      'npm run check:trust-center-claims',
      'npm run check:release-handoff',
      'npm run check:release-local-evidence',
      'npm run typecheck',
      'npm run typecheck:all',
      'npm run lint',
      'npm test',
      'npm run build',
    ]

    let previousIndex = -1
    for (const command of orderedCommands) {
      const nextIndex = script.indexOf(command, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

    expect(script).toContain('LOCAL_RELEASE_READINESS_STARTED')
    expect(script).toContain('LOCAL_RELEASE_READINESS_FAILED')
    expect(script).toContain('LOCAL_RELEASE_READINESS_PASSED')
    expect(script).toContain('function buildNpmInvocation(args)')
    expect(script).toContain(
      'function buildChildProcessEnv(parentEnv, { credentialFreeBuild = false } = {})',
    )
    expect(script).toContain("if (/^npm_/i.test(key))")
    expect(script).toContain('delete childEnv.INIT_CWD')
    expect(script).toContain('credentialFreeBuildEnvironmentKeys')
    expect(script).toContain("childEnv[key] = ''")
    expect(script).toContain('credentialFreeBuild: true')
    expect(script).toContain('env: buildChildProcessEnv(process.env, command)')
    expect(script).toContain("args: ['test', '--', '--configLoader', 'runner']")
    expect(script).toContain("command: 'cmd.exe'")
    expect(script).toContain("args: ['/d', '/c', 'npm.cmd', ...args]")
    expect(script).not.toContain("'/s'")
    expect(script).not.toContain('process.env.npm_execpath')
    expect(script).toContain('shell: false')
    expect(script).toContain('childProcessErrorCode')
    expect(script).toContain('Child process failed to start')
    expect(script).toContain('productionSensitiveFeaturesApproved: false')
    expect(script).toContain('publicTrustClaimsApproved: false')
  })

  it('prints a sanitized plan without executing the heavy checklist', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/run-release-readiness-local.mjs', '--plan'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    )

    const plan = JSON.parse(output) as {
      decision: string
      productionSensitiveFeaturesApproved: boolean
      publicTrustClaimsApproved: boolean
      commandCount: number
      commands: string[]
      credentialFreeBuild: boolean
      credentialFreeBuildEnvironmentKeyCount: number
      safeBoundary: Record<string, boolean>
    }

    expect(plan.decision).toBe('LOCAL_RELEASE_READINESS_PLAN_READY')
    expect(plan.productionSensitiveFeaturesApproved).toBe(false)
    expect(plan.publicTrustClaimsApproved).toBe(false)
    expect(plan.commandCount).toBe(15)
    expect(plan.credentialFreeBuild).toBe(true)
    expect(plan.credentialFreeBuildEnvironmentKeyCount).toBe(11)
    expect(plan.commands).toEqual([
      'npm run check:repository-secrets',
      'npm run check:dependency-security',
      'npm run check:release-env',
      'npm run check:rls-production-evidence',
      'npm run check:production-monitoring-evidence',
      'npm run check:production-gates',
      'npm run check:csp-report-only',
      'npm run check:trust-center-claims',
      'npm run check:release-handoff',
      'npm run check:release-local-evidence',
      'npm run typecheck',
      'npm run typecheck:all',
      'npm run lint',
      'npm test',
      'npm run build',
    ])
    expect(plan.safeBoundary).toEqual({
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
    })
    expect(output).not.toMatch(/postgresql:\/\/[^`\s<\[]+/i)
    expect(output).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/)
    expect(output).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
  })

  it('keeps the final build credential-free without changing normal build commands', () => {
    const script = readRepoFile('scripts/run-release-readiness-local.mjs')
    const buildCommandStart = script.indexOf("label: 'npm run build'")
    const buildCommandEnd = script.indexOf('\n  },', buildCommandStart)
    const buildCommand = script.slice(buildCommandStart, buildCommandEnd)

    expect(buildCommand).toContain("args: ['run', 'build']")
    expect(buildCommand).toContain('credentialFreeBuild: true')
    expect(script).toContain("'NEXT_PUBLIC_SUPABASE_URL'")
    expect(script).toContain("'NEXT_PUBLIC_SUPABASE_ANON_KEY'")
    expect(script).toContain("'SUPABASE_SERVICE_ROLE_KEY'")
    expect(script).toContain("'OPENAI_API_KEY'")
    expect(script).toContain("'RESEND_API_KEY'")
    expect(script).toContain("'GOOGLE_CLIENT_SECRET'")
    expect(script).not.toContain('delete process.env')
  })
})
