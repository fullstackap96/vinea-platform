import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('environment configuration baseline', () => {
  it('commits a placeholder-only environment contract with required capability names', () => {
    const example = readRepoFile('.env.example')

    for (const name of [
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STAFF_ALLOWLIST_EMAILS',
      'CRON_SECRET',
      'RESEND_API_KEY',
      'RESEND_FROM_EMAIL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_OAUTH_STATE_SECRET',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_DEMO_SITE',
    ]) {
      expect(example).toMatch(new RegExp(`^${name}=`, 'm'))
    }

    const assignments = example
      .split(/\r?\n/)
      .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
      .map((line) => {
        const separator = line.indexOf('=')
        return {
          name: line.slice(0, separator),
          value: line.slice(separator + 1),
        }
      })

    for (const assignment of assignments) {
      if (assignment.name === 'NEXT_PUBLIC_DEMO_SITE') {
        expect(assignment.value).toBe('0')
      } else {
        expect(assignment.value).toBe('')
      }
    }
  })

  it('keeps production-sensitive gates and secret-shaped values out of the example', () => {
    const example = readRepoFile('.env.example')

    for (const forbiddenName of [
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=',
      'VINEA_EXPORT_RUNTIME=',
      'VINEA_OBSERVABILITY_RUNTIME=',
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME=',
      'VINEA_AI_REPLY_AUDIT_WRITE=',
      'VINEA_EXPORT_AUDIT_REVIEWER_PRODUCTION=',
    ]) {
      expect(example).not.toContain(forbiddenName)
    }

    expect(example).not.toMatch(/postgres(?:ql)?:\/\/[^\s]+:[^\s]+@/i)
    expect(example).not.toMatch(
      /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    )
    expect(example).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/)
    const privateKeyHeader = ['-----BEGIN ', 'PRIVATE KEY-----'].join('')
    expect(example).not.toContain(privateKeyHeader)
  })

  it('documents the safety boundary and keeps the example allowlisted in gitignore', () => {
    const gitignore = readRepoFile('.gitignore')
    const doc = readRepoFile('docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md')
    const readme = readRepoFile('README.md')

    expect(gitignore).toContain('.env*')
    expect(gitignore).toContain('!.env.example')
    expect(doc).toContain('Production-sensitive feature gates enabled: `NO`')
    expect(doc).toContain('Production deployment approved: `NO`')
    expect(doc).toContain('Public trust claims approved: `NO`')
    expect(doc).toContain('npm run check:repository-secrets')
    expect(readme).toContain('docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md')
    expect(readme).toContain('cp .env.example .env.local')
  })

  it('documents the Vercel core environment preflight without approving deployment', () => {
    const baseline = readRepoFile('docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md')
    const preflight = readRepoFile('docs/VERCEL_CORE_ENV_BUILD_PREFLIGHT_20260712.md')

    expect(baseline).toContain('Vercel builds fail closed in `next.config.ts`')
    expect(baseline).toContain('docs/VERCEL_CORE_ENV_BUILD_PREFLIGHT_20260712.md')
    expect(preflight).toContain('When `VERCEL=1`')
    expect(preflight).toContain('`NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`')
    expect(preflight).toContain('`NEXT_PUBLIC_SUPABASE_ANON_KEY`')
    expect(preflight).toContain('`SUPABASE_SERVICE_ROLE_KEY`')
    expect(preflight).toContain('missing variable names only')
    expect(preflight).toContain('Local development and credential-free CI builds remain supported')
    expect(preflight).toContain('Production deployment, merge, production access')
    expect(preflight).toContain('remain `NO-GO`')
  })
})
