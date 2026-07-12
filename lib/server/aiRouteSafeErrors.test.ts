import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const openAiCreateMock = vi.hoisted(() => vi.fn())
const requireStaffFromRequestMock = vi.hoisted(() => vi.fn())
const authorizeStaffUserMock = vi.hoisted(() => vi.fn())
const getUserMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/openai', () => ({
  openai: {
    responses: {
      create: openAiCreateMock,
    },
  },
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: requireStaffFromRequestMock,
  authorizeStaffUser: authorizeStaffUserMock,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

vi.mock('server-only', () => ({}))

import { POST as postAiReply } from '../../app/api/ai/reply/route'
import { POST as postAiSummary } from '../../app/api/ai/summary/route'

const originalEnv = { ...process.env }
const root = process.cwd()
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const evidencePath = join(root, 'docs', 'AI_ROUTES_SAFE_ERROR_LOGGING_20260706.md')

function aiRequest(route: '/api/ai/summary' | '/api/ai/reply') {
  return new NextRequest(`https://vinea.test${route}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
    },
    body: JSON.stringify({
      requestType: 'baptism',
      fullName: 'Maria Garcia',
      email: 'owner@example.com',
      childName: 'Ana Garcia',
      preferredDates: 'Next month',
      notes: 'Please call after 3 PM.',
      status: 'new',
    }),
  })
}

describe('AI routes safe error logging', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.VINEA_AI_SUMMARY_SAFETY_RUNTIME
    delete process.env.VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('logs summary failures through the shared redacting logger and returns a generic staff error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    requireStaffFromRequestMock.mockResolvedValue({ ok: true })
    openAiCreateMock.mockRejectedValue(
      new Error('OpenAI failed for owner@example.com with token sk-test_1234567890abcdef'),
    )

    const response = await postAiSummary(aiRequest('/api/ai/summary'))

    await expect(response.text()).resolves.toBe('Summary is temporarily unavailable.')
    expect(response.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[ai/summary] unexpected failure')
    expect(logPayload).toContain('/api/ai/summary')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('owner@example.com')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
  })

  it('logs reply failures through the shared redacting logger and returns a generic staff error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'staff@example.test' } },
      error: null,
    })
    authorizeStaffUserMock.mockResolvedValue({ ok: true })
    openAiCreateMock.mockRejectedValue(
      new Error('OpenAI failed for owner@example.com with token sk-test_1234567890abcdef'),
    )

    const response = await postAiReply(aiRequest('/api/ai/reply'))

    await expect(response.text()).resolves.toBe('Reply draft is temporarily unavailable.')
    expect(response.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[ai/reply] unexpected failure')
    expect(logPayload).toContain('/api/ai/reply')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('owner@example.com')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
  })

  it('uses the safe logger instead of raw console error in AI route source', () => {
    const summarySource = readFileSync(summaryRoutePath, 'utf8')
    const replySource = readFileSync(replyRoutePath, 'utf8')

    for (const source of [summarySource, replySource]) {
      expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
      expect(source).not.toContain('console.error')
      expect(source).not.toContain('error.message')
    }

    expect(summarySource).toContain("logServerError('[ai/summary] unexpected failure'")
    expect(summarySource).toContain("route: '/api/ai/summary'")
    expect(summarySource).toContain("'Summary is temporarily unavailable.'")
    expect(replySource).toContain("logServerError('[ai/reply] unexpected failure'")
    expect(replySource).toContain("route: '/api/ai/reply'")
    expect(replySource).toContain("'Reply draft is temporarily unavailable.'")
  })

  it('documents the AI route hardening without claiming broader AI runtime readiness', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')
    const roadmap = readFileSync(join(root, 'docs', 'VINEA_ROADMAP.md'), 'utf8')
    const sourceOfTruth = readFileSync(
      join(root, 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md'),
      'utf8',
    )

    for (const expected of [
      'AI Routes Safe Error Logging',
      'IMPLEMENTED - STAFF AI ROUTE ERROR REDACTION',
      'No OpenAI model, prompt, or provider behavior was changed by this safe-error-logging slice.',
      '`/api/ai/reply` now has a separate disabled-by-default safety gate scaffold as of 2026-07-07',
      'no permission-scoped reply adapter, audit-write path, safe-response exposure, or safety-chain generation path is implemented.',
      'No production flags were enabled.',
      'No operational RLS changes were made.',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(buildStatus).toContain('AI Routes Safe Error Logging Implemented')
    expect(roadmap).toContain('AI Routes Safe Error Logging')
    expect(sourceOfTruth).toContain('AI summary/reply routes with safe error logging')
  })
})
