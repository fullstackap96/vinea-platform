import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import {
  REQUIRED_SCHEMA_READINESS_CHECKS,
  publicHealthCheckResponse,
  runSchemaReadinessChecks,
  type SchemaReadinessCheck,
} from './healthCheck'

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
            p_limit: 0,
          }),
        }),
      ])
    )
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

  it('does not flag expected non-schema RPC errors from an existing function', async () => {
    const missing = await runSchemaReadinessChecks(
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

    expect(missing).toEqual([])
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

describe('publicHealthCheckResponse', () => {
  it('does not expose internal env, schema, or check details when unhealthy', () => {
    expect(
      publicHealthCheckResponse({
        ok: false,
        checks: {
          env: false,
          supabase: false,
          parishes: false,
          schema: false,
          resend: false,
          googleOAuth: false,
        },
        error: 'SUPABASE_SERVICE_ROLE_KEY',
        missingSchema: ['request_portal_tokens table'],
      })
    ).toEqual({ ok: false, error: 'Service unavailable' })
  })

  it('returns only ok for healthy public health responses', () => {
    expect(
      publicHealthCheckResponse({
        ok: true,
        checks: {
          env: true,
          supabase: true,
          parishes: true,
          schema: true,
          resend: true,
          googleOAuth: true,
        },
      })
    ).toEqual({ ok: true })
  })
})
