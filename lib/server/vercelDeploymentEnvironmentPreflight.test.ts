import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  assertVercelCoreDeploymentEnv,
  getMissingVercelCoreDeploymentEnv,
  VERCEL_CORE_DEPLOYMENT_ENV,
} from './vercelDeploymentEnvironmentPreflight'

const completeVercelEnvironment = {
  VERCEL: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'https://safe-fixture.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'safe-anon-fixture',
  SUPABASE_SERVICE_ROLE_KEY: 'safe-service-role-fixture',
}

describe('Vercel core deployment environment preflight', () => {
  it('is a no-op outside Vercel so credential-free local and CI builds remain supported', () => {
    expect(getMissingVercelCoreDeploymentEnv({})).toEqual([])
    expect(() => assertVercelCoreDeploymentEnv({})).not.toThrow()
  })

  it('requires only the documented core Supabase environment contract on Vercel', () => {
    expect(VERCEL_CORE_DEPLOYMENT_ENV).toEqual([
      { oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] },
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ])
    expect(() => assertVercelCoreDeploymentEnv(completeVercelEnvironment)).not.toThrow()
  })

  it('accepts the server-side Supabase URL fallback', () => {
    expect(() =>
      assertVercelCoreDeploymentEnv({
        ...completeVercelEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        SUPABASE_URL: 'https://safe-server-fixture.supabase.co',
      }),
    ).not.toThrow()
  })

  it('fails a Vercel build that is missing the service-role credential', () => {
    const { SUPABASE_SERVICE_ROLE_KEY: secret, ...environment } = completeVercelEnvironment

    expect(() => assertVercelCoreDeploymentEnv(environment)).toThrow(
      'Vercel deployment blocked: missing required environment variable names: SUPABASE_SERVICE_ROLE_KEY',
    )
    expect(() => assertVercelCoreDeploymentEnv(environment)).not.toThrow(secret)
  })

  it('reports names only for every missing core requirement', () => {
    const unsafeValue = 'must-not-appear-in-errors'
    const environment = {
      VERCEL: '1',
      NEXT_PUBLIC_SUPABASE_URL: ' ',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      UNRELATED_SECRET: unsafeValue,
    }

    expect(getMissingVercelCoreDeploymentEnv(environment)).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ])

    try {
      assertVercelCoreDeploymentEnv(environment)
      throw new Error('expected the Vercel deployment preflight to fail')
    } catch (error) {
      expect(String(error)).not.toContain(unsafeValue)
    }
  })

  it('runs from next.config before the configuration is exported', () => {
    const source = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8')
    const assertionIndex = source.indexOf('assertVercelCoreDeploymentEnv();')
    const exportIndex = source.indexOf('export default nextConfig')

    expect(source).toContain(
      'import { assertVercelCoreDeploymentEnv } from "./lib/server/vercelDeploymentEnvironmentPreflight"',
    )
    expect(assertionIndex).toBeGreaterThan(-1)
    expect(exportIndex).toBeGreaterThan(assertionIndex)
    expect(source).not.toContain('safe-service-role-fixture')
  })
})
