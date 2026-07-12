import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import {
  buildPublicHealthCheckResponse,
  HEALTH_DATABASE_TIMEOUT_MS,
  isAppOriginReady,
  REQUIRED_SCHEMA_READINESS_CHECKS,
  runHealthChecks,
  runSchemaReadinessChecks,
  type HealthCheckResponse,
  type SchemaReadinessCheck,
} from './healthCheck'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('isAppOriginReady', () => {
  it('accepts exact HTTPS deployment origins and local non-Vercel HTTP origins', () => {
    expect(
      isAppOriginReady({
        NEXT_PUBLIC_APP_URL: 'https://app.vineaplatform.test/',
      }),
    ).toBe(true)
    expect(
      isAppOriginReady({
        NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000',
      }),
    ).toBe(true)
  })

  it('requires HTTPS for Vercel deployments', () => {
    expect(
      isAppOriginReady({
        NEXT_PUBLIC_APP_URL: 'http://preview-vinea.vercel.app',
        VERCEL: '1',
      }),
    ).toBe(false)
    expect(
      isAppOriginReady({
        NEXT_PUBLIC_APP_URL: 'https://preview-vinea.vercel.app',
        VERCEL: '1',
      }),
    ).toBe(true)
  })

  it('accepts trusted Vercel deployment hostnames when no app origin is configured', () => {
    expect(
      isAppOriginReady({
        VERCEL: '1',
        VERCEL_BRANCH_URL: 'safe-preview.vercel.app',
      }),
    ).toBe(true)
    expect(
      isAppOriginReady({
        VERCEL: '1',
        VERCEL_URL: 'safe-deployment.vercel.app',
      }),
    ).toBe(true)
    expect(
      isAppOriginReady({
        VERCEL: '1',
        VERCEL_PROJECT_PRODUCTION_URL: 'safe-project.vercel.app',
      }),
    ).toBe(true)
  })

  it('rejects unsafe Vercel deployment hostname fallbacks', () => {
    for (const hostname of [
      'https://safe-preview.vercel.app',
      'user:password@safe-preview.vercel.app',
      'safe-preview.vercel.app/dashboard',
      'safe-preview.vercel.app?query=value',
      'safe-preview.vercel.app#fragment',
    ]) {
      expect(
        isAppOriginReady({
          VERCEL: '1',
          VERCEL_URL: hostname,
        }),
      ).toBe(false)
    }
  })

  it.each([
    undefined,
    '',
    'not-a-url',
    'ftp://app.vineaplatform.test',
    'https://user:password@app.vineaplatform.test',
    'https://app.vineaplatform.test/dashboard',
    'https://app.vineaplatform.test?query=value',
    'https://app.vineaplatform.test/#fragment',
  ])('rejects an unsafe app origin value: %s', (value) => {
    expect(isAppOriginReady({ NEXT_PUBLIC_APP_URL: value })).toBe(false)
  })
})

function adminFor(input: {
  selectErrors?: Record<string, { code?: string; message?: string } | null>
  rpcErrors?: Record<string, { code?: string; message?: string } | null>
}) {
  return {
    from(table: string) {
      return {
        select() {
          return {
            limit: vi.fn().mockResolvedValue({
              error: input.selectErrors?.[table] ?? null,
            }),
          }
        },
      }
    },
    rpc(functionName: string) {
      return Promise.resolve({
        error: input.rpcErrors?.[functionName] ?? null,
      })
    },
  }
}

const checks: SchemaReadinessCheck[] = [
  {
    kind: 'select',
    label: 'request_documents table',
    table: 'request_documents',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'daily brief parish columns',
    table: 'parishes',
    columns: 'daily_ops_brief_enabled',
  },
  {
    kind: 'rpc',
    label: 'workflow template copy function',
    functionName: 'create_request_workflow_steps_from_active_template',
    args: { p_request_id: '00000000-0000-0000-0000-000000000000' },
    missingCodes: ['PGRST202'],
  },
]

describe('runSchemaReadinessChecks', () => {
  it('passes one caller-owned abort signal to every select and RPC probe', async () => {
    const receivedSignals: AbortSignal[] = []
    const signal = new AbortController().signal
    const result = { error: null }
    const admin = {
      from() {
        return {
          select() {
            return {
              limit() {
                return {
                  abortSignal(nextSignal: AbortSignal) {
                    receivedSignals.push(nextSignal)
                    return Promise.resolve(result)
                  },
                }
              },
            }
          },
        }
      },
      rpc() {
        return {
          abortSignal(nextSignal: AbortSignal) {
            receivedSignals.push(nextSignal)
            return Promise.resolve(result)
          },
        }
      },
    }

    await expect(
      runSchemaReadinessChecks(admin as never, checks, signal),
    ).resolves.toEqual([])
    expect(receivedSignals).toHaveLength(checks.length)
    expect(receivedSignals.every((value) => value === signal)).toBe(true)
  })

  it('checks the daily brief columns created by the migration', () => {
    const dailyBriefCheck = REQUIRED_SCHEMA_READINESS_CHECKS.find(
      (check) => check.label === 'daily brief parish columns'
    )

    expect(dailyBriefCheck).toMatchObject({
      kind: 'select',
      table: 'parishes',
      columns: 'daily_ops_brief_enabled, daily_ops_brief_email',
    })
  })

  it('checks the durable public intake rate-limit schema', () => {
    expect(REQUIRED_SCHEMA_READINESS_CHECKS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'select',
          label: 'rate_limit_buckets table',
          table: 'rate_limit_buckets',
          columns: 'key',
        }),
        expect.objectContaining({
          kind: 'rpc',
          label: 'public intake rate-limit function',
          functionName: 'check_public_intake_rate_limit',
          args: expect.objectContaining({
            p_key: '',
            p_limit: 1,
          }),
          expectedExistingErrorCodes: ['P0001'],
        }),
      ])
    )
  })

  it('checks the multi-parish membership foundation schema', () => {
    expect(REQUIRED_SCHEMA_READINESS_CHECKS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'select',
          label: 'parish_memberships table',
          table: 'parish_memberships',
          columns: 'id',
        }),
        expect.objectContaining({
          kind: 'rpc',
          label: 'current staff parish scope function',
          functionName: 'current_staff_parish_ids',
        }),
        expect.objectContaining({
          kind: 'rpc',
          label: 'parish authorization scope function',
          functionName: 'is_authorized_for_parish',
          args: expect.objectContaining({
            p_parish_id: '00000000-0000-0000-0000-000000000000',
          }),
        }),
      ])
    )
  })

  it('checks promoted public intake parish routing schema', () => {
    expect(REQUIRED_SCHEMA_READINESS_CHECKS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'select',
          label: 'public intake parish routing columns',
          table: 'parishes',
          columns: 'public_slug, public_display_name, public_intake_enabled',
        }),
        expect.objectContaining({
          kind: 'select',
          label: 'public intake domain routing table',
          table: 'parish_public_intake_domains',
          columns:
            'id, parish_id, hostname, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, active',
        }),
        expect.objectContaining({
          kind: 'select',
          label: 'public intake token routing table',
          table: 'parish_public_intake_tokens',
          columns: 'id, parish_id, token_hash, request_type, expires_at, active',
        }),
      ])
    )
  })

  it('returns safe labels for missing promoted public intake routing schema', async () => {
    const missing = await runSchemaReadinessChecks(
      adminFor({
        selectErrors: {
          parishes: {
            code: '42703',
            message: 'column parishes.public_slug does not exist',
          },
          parish_public_intake_domains: {
            code: 'PGRST205',
            message:
              "Could not find the table 'public.parish_public_intake_domains' in the schema cache",
          },
          parish_public_intake_tokens: {
            code: 'PGRST205',
            message:
              "Could not find the table 'public.parish_public_intake_tokens' in the schema cache",
          },
        },
      }) as never,
      [
        {
          kind: 'select',
          label: 'public intake parish routing columns',
          table: 'parishes',
          columns: 'public_slug, public_display_name, public_intake_enabled',
        },
        {
          kind: 'select',
          label: 'public intake domain routing table',
          table: 'parish_public_intake_domains',
          columns:
            'id, parish_id, hostname, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, active',
        },
        {
          kind: 'select',
          label: 'public intake token routing table',
          table: 'parish_public_intake_tokens',
          columns: 'id, parish_id, token_hash, request_type, expires_at, active',
        },
      ]
    )

    expect(missing).toEqual([
      'public intake parish routing columns',
      'public intake domain routing table',
      'public intake token routing table',
    ])
  })

  it('returns labels for missing tables, columns, and RPC functions', async () => {
    const missing = await runSchemaReadinessChecks(
      adminFor({
        selectErrors: {
          request_documents: {
            code: 'PGRST205',
            message: "Could not find the table 'public.request_documents' in the schema cache",
          },
          parishes: {
            code: '42703',
            message: 'column parishes.daily_ops_brief_enabled does not exist',
          },
        },
        rpcErrors: {
          create_request_workflow_steps_from_active_template: {
            code: 'PGRST202',
            message:
              'Could not find the function public.create_request_workflow_steps_from_active_template(p_request_id) in the schema cache',
          },
        },
      }) as never,
      checks
    )

    expect(missing).toEqual([
      'request_documents table',
      'daily brief parish columns',
      'workflow template copy function',
    ])
  })

  it('throws non-schema RPC errors unless the probe explicitly expects them', async () => {
    await expect(
      runSchemaReadinessChecks(
        adminFor({
          rpcErrors: {
            create_request_workflow_steps_from_active_template: {
              code: 'P0001',
              message: 'Request not found.',
            },
          },
        }) as never,
        checks
      )
    ).rejects.toMatchObject({ code: 'P0001' })
  })

  it('accepts only an explicitly expected validation error for a non-mutating RPC probe', async () => {
    const missing = await runSchemaReadinessChecks(
      adminFor({
        rpcErrors: {
          check_public_intake_rate_limit: {
            code: 'P0001',
            message: 'Rate-limit key is required.',
          },
        },
      }) as never,
      [
        {
          kind: 'rpc',
          label: 'public intake rate-limit function',
          functionName: 'check_public_intake_rate_limit',
          args: { p_key: '', p_limit: 1, p_window_seconds: 60 },
          missingCodes: ['PGRST202'],
          expectedExistingErrorCodes: ['P0001'],
        },
      ]
    )

    expect(missing).toEqual([])
  })

  it('throws unexpected RPC failures instead of treating them as schema-ready', async () => {
    await expect(
      runSchemaReadinessChecks(
        adminFor({
          rpcErrors: {
            check_public_intake_rate_limit: {
              code: '42501',
              message: 'permission denied',
            },
          },
        }) as never,
        [
          {
            kind: 'rpc',
            label: 'public intake rate-limit function',
            functionName: 'check_public_intake_rate_limit',
            args: { p_key: '', p_limit: 1, p_window_seconds: 60 },
            missingCodes: ['PGRST202'],
            expectedExistingErrorCodes: ['P0001'],
          },
        ]
      )
    ).rejects.toMatchObject({ code: '42501' })
  })

  it('throws unexpected select errors so health does not hide connectivity failures', async () => {
    await expect(
      runSchemaReadinessChecks(
        adminFor({
          selectErrors: {
            request_documents: {
              code: '42501',
              message: 'permission denied',
            },
          },
        }) as never,
        checks
      )
    ).rejects.toMatchObject({ code: '42501' })
  })
})

describe('runHealthChecks database deadline', () => {
  it('shares one bounded signal across the parish and schema probes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://safe-health.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'safe-anon-label')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'safe-service-label')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.vineaplatform.test')

    const receivedSignals: AbortSignal[] = []
    const result = { error: null }
    const admin = {
      from() {
        return {
          select() {
            return {
              limit() {
                return {
                  abortSignal(signal: AbortSignal) {
                    receivedSignals.push(signal)
                    return Promise.resolve(result)
                  },
                }
              },
            }
          },
        }
      },
      rpc() {
        return {
          abortSignal(signal: AbortSignal) {
            receivedSignals.push(signal)
            return Promise.resolve(result)
          },
        }
      },
    }
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(admin as never)

    await expect(runHealthChecks()).resolves.toMatchObject({
      ok: true,
      checks: { supabase: true, parishes: true, schema: true },
    })
    expect(HEALTH_DATABASE_TIMEOUT_MS).toBe(8_000)
    expect(receivedSignals).toHaveLength(
      REQUIRED_SCHEMA_READINESS_CHECKS.length + 1,
    )
    expect(new Set(receivedSignals).size).toBe(1)

  })

  it('returns a safe unhealthy result when the database deadline expires', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://safe-health.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'safe-anon-label')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'safe-service-label')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.vineaplatform.test')

    const admin = {
      from() {
        return {
          select() {
            return {
              limit() {
                return {
                  abortSignal(signal: AbortSignal) {
                    return new Promise((resolve) => {
                      signal.addEventListener(
                        'abort',
                        () => resolve({ error: { message: 'aborted' } }),
                        { once: true },
                      )
                    })
                  },
                }
              },
            }
          },
        }
      },
    }
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(admin as never)

    await expect(runHealthChecks({ databaseTimeoutMs: 5 })).resolves.toEqual({
      ok: false,
      checks: {
        env: true,
        supabase: false,
        parishes: false,
        schema: false,
        resend: true,
        googleOAuth: true,
      },
      error: 'supabase-timeout',
    })
  })
})

describe('buildPublicHealthCheckResponse', () => {
  const unhealthy: HealthCheckResponse = {
    ok: false,
    checks: {
      env: true,
      supabase: true,
      parishes: true,
      schema: false,
      resend: true,
      googleOAuth: true,
    },
    error: 'schema',
    missingSchema: ['request_documents table'],
  }

  it('keeps detailed failure labels available outside production', () => {
    expect(
      buildPublicHealthCheckResponse(unhealthy, {
        includeFailureDetails: true,
      })
    ).toEqual(unhealthy)
  })

  it('redacts configuration and schema labels from public production failures', () => {
    expect(
      buildPublicHealthCheckResponse(unhealthy, {
        includeFailureDetails: false,
      })
    ).toEqual({
      ok: false,
      checks: unhealthy.checks,
      error: 'unhealthy',
    })
  })

  it('preserves the successful health contract in production', () => {
    const healthy: HealthCheckResponse = {
      ok: true,
      checks: {
        env: true,
        supabase: true,
        parishes: true,
        schema: true,
        resend: true,
        googleOAuth: true,
      },
    }

    expect(
      buildPublicHealthCheckResponse(healthy, {
        includeFailureDetails: false,
      })
    ).toEqual(healthy)
  })
})
