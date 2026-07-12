import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/openai', () => ({
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { openai } from '@/lib/openai'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from '@/lib/server/aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from '@/lib/server/aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from '@/lib/server/aiSummarySafeResponseExposureAcceptance'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from '@/lib/server/aiSummaryRuntimeGate'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { POST } from '../../app/api/ai/summary/route'

const root = process.cwd()
const requestDetailPagePath = join(root, 'app', 'dashboard', 'requests', '[id]', 'page.tsx')
const openAiCreateMock = vi.mocked(openai.responses.create)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)

function queryBuilder(response: { data: Record<string, unknown> | null; error?: { message: string } | null }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve({ data: response.data, error: response.error ?? null })),
  }

  return builder
}

function adminForSameParishRequest() {
  const builders = {
    requests: queryBuilder({
      data: {
        id: 'request-1',
        request_type: 'baptism',
        child_name: 'Ana Garcia',
        created_at: '2026-06-27T10:00:00.000Z',
        parishioner_id: 'parishioner-1',
        status: 'new',
        notes: 'Please call after 3 PM.',
      },
    }),
    parishioners: queryBuilder({
      data: {
        parish_id: 'parish-2',
        full_name: 'Maria Garcia',
        email: 'maria@example.test',
      },
    }),
  }

  return {
    from: vi.fn((table: string) => {
      const builder = builders[table as keyof typeof builders]
      if (!builder) throw new Error(`Unexpected table: ${table}`)
      return builder
    }),
    builders,
  }
}

function nextRequestForSummary(body: Record<string, unknown>) {
  return new NextRequest('https://vinea.test/api/ai/summary', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
      cookie: 'vinea_active_parish_id=parish-2',
    },
    body: JSON.stringify(body),
  })
}

describe('AI summary route safety-chain adapter integration', () => {
  beforeEach(() => {
    delete process.env[AI_SUMMARY_AUDIT_WRITE_FLAG]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_ACK]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK]
    process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG] = AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK] = AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE
    process.env.VERCEL_ENV = 'preview'
    openAiCreateMock.mockReset()
    requireStaffFromRequestMock.mockReset()
    resolveActiveStaffParishContextMock.mockReset()
    createSupabaseServiceRoleClientMock.mockReset()
  })

  afterEach(() => {
    delete process.env[AI_SUMMARY_AUDIT_WRITE_FLAG]
    delete process.env[AI_SUMMARY_AUDIT_WRITE_ACK]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG]
    delete process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK]
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_FLAG]
    delete process.env[AI_SUMMARY_SAFETY_RUNTIME_ACK]
    delete process.env.VERCEL_ENV
  })

  it('validates a real same-parish request through the safety-chain adapter and still fails closed before OpenAI', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    const admin = adminForSameParishRequest()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      staff: { email: 'staff@example.test' },
      user: { id: 'user-1' },
      supabase: staffSupabase,
    } as unknown as Awaited<ReturnType<typeof requireStaffFromRequest>>)
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin as never)

    const response = await POST(
      nextRequestForSummary({
        requestId: 'request-1',
        requestType: 'baptism',
        fullName: 'Maria Garcia',
        email: 'maria@example.test',
        childName: 'Ana Garcia',
      })
    )

    await expect(response.json()).resolves.toEqual({ ok: false, error: 'ai_retrieval_unavailable' })
    expect(response.status).toBe(503)
    expect(openAiCreateMock).not.toHaveBeenCalled()
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
    })
    expect(createSupabaseServiceRoleClientMock).toHaveBeenCalledTimes(1)
    expect(admin.from).toHaveBeenCalledWith('requests')
    expect(admin.from).toHaveBeenCalledWith('parishioners')
  })

  it('adds requestId to the staff summary payload before posting to the AI summary route', () => {
    const source = readFileSync(requestDetailPagePath, 'utf8')
    const requestIdIndex = source.indexOf('body.requestId = routeId')
    const fetchIndex = source.indexOf("fetch('/api/ai/summary'")

    expect(requestIdIndex).toBeGreaterThanOrEqual(0)
    expect(fetchIndex).toBeGreaterThan(requestIdIndex)
  })
})
