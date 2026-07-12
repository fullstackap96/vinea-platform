import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const openAiCreateMock = vi.hoisted(() => vi.fn())
const authorizeStaffUserMock = vi.hoisted(() => vi.fn())
const getUserMock = vi.hoisted(() => vi.fn())
const buildAiReplySafetyChainAdapterMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/openai', () => ({
  openai: {
    responses: {
      create: openAiCreateMock,
    },
  },
}))

vi.mock('@/lib/server/requireStaff', () => ({
  authorizeStaffUser: authorizeStaffUserMock,
}))

vi.mock('@/lib/server/aiReplySafetyChainAdapter', () => ({
  buildAiReplySafetyChainAdapter: buildAiReplySafetyChainAdapterMock,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

import {
  AI_REPLY_SAFETY_RUNTIME_ACK,
  AI_REPLY_SAFETY_RUNTIME_ACK_VALUE,
  AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_REPLY_SAFETY_RUNTIME_FLAG,
  getAiReplySafetyRuntimeGate,
} from './aiReplyRuntimeGate'
import {
  AI_REPLY_REQUIRED_PRE_OPENAI_GATES,
  AI_REPLY_RUNTIME_SCAFFOLD_VERSION,
  buildAiReplyRuntimeScaffold,
} from './aiReplyRuntimeScaffold'
import { POST as postAiReply } from '../../app/api/ai/reply/route'

const root = process.cwd()
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const requiredEnvPath = join(root, 'lib', 'server', 'requiredEnv.ts')
const evidencePath = join(root, 'docs', 'AI_REPLY_RUNTIME_GATE_SCAFFOLD_20260707.md')
const readmePath = join(root, 'README.md')
const originalEnv = { ...process.env }

function env(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return values as NodeJS.ProcessEnv
}

function aiReplyRequest() {
  return new Request('https://vinea.test/api/ai/reply', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
    },
    body: JSON.stringify({
      requestType: 'baptism',
      fullName: 'Maria Garcia',
      email: 'owner@example.test',
      childName: 'Ana Garcia',
      preferredDates: 'Next month',
      notes: 'Please call after 3 PM.',
    }),
  }) as never
}

function expectBefore(source: string, earlier: string, later: string): void {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('AI reply disabled runtime gate and scaffold', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env[AI_REPLY_SAFETY_RUNTIME_FLAG]
    delete process.env[AI_REPLY_SAFETY_RUNTIME_ACK]
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('keeps the reply safety chain disabled by default with legacy behavior selected', () => {
    const gate = getAiReplySafetyRuntimeGate(env())
    const scaffold = buildAiReplyRuntimeScaffold(gate)

    expect(gate).toEqual({
      enabled: false,
      reason: `${AI_REPLY_SAFETY_RUNTIME_FLAG} is not enabled.`,
      mode: 'legacy_reply_prompt',
      legacyFallback: true,
      route: '/api/ai/reply',
    })
    expect(scaffold).toEqual({
      version: AI_REPLY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/reply',
      selectedPath: 'legacy_staff_gated_reply_route',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: false,
      shouldCallOpenAiFromSafetyChain: false,
      requiredPreOpenAiGates: [],
      genericBlockedReason: 'ai_reply_unavailable',
      reason: `${AI_REPLY_SAFETY_RUNTIME_FLAG} is not enabled.`,
    })
  })

  it('requires exact flag and approval acknowledgement before selecting the fail-closed scaffold', () => {
    expect(
      getAiReplySafetyRuntimeGate(
        env({
          [AI_REPLY_SAFETY_RUNTIME_FLAG]: 'enabled',
          [AI_REPLY_SAFETY_RUNTIME_ACK]: AI_REPLY_SAFETY_RUNTIME_ACK_VALUE,
        })
      )
    ).toMatchObject({ enabled: false, mode: 'legacy_reply_prompt' })

    expect(
      getAiReplySafetyRuntimeGate(
        env({
          [AI_REPLY_SAFETY_RUNTIME_FLAG]: AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE,
        })
      )
    ).toEqual({
      enabled: false,
      reason: `${AI_REPLY_SAFETY_RUNTIME_ACK} approval is missing.`,
      mode: 'legacy_reply_prompt',
      legacyFallback: true,
      route: '/api/ai/reply',
    })

    const gate = getAiReplySafetyRuntimeGate(
      env({
        [AI_REPLY_SAFETY_RUNTIME_FLAG]: AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE,
        [AI_REPLY_SAFETY_RUNTIME_ACK]: AI_REPLY_SAFETY_RUNTIME_ACK_VALUE,
      })
    )
    const scaffold = buildAiReplyRuntimeScaffold(gate)

    expect(scaffold).toEqual({
      version: AI_REPLY_RUNTIME_SCAFFOLD_VERSION,
      route: '/api/ai/reply',
      selectedPath: 'permission_scoped_reply_safety_chain_scaffold',
      legacyBehaviorPreserved: true,
      safetyChainWouldRun: true,
      shouldCallOpenAiFromSafetyChain: false,
      requiredPreOpenAiGates: AI_REPLY_REQUIRED_PRE_OPENAI_GATES,
      genericBlockedReason: 'ai_reply_unavailable',
      reason: null,
    })
  })

  it('preserves flag-off legacy reply behavior by calling OpenAI with the current prompt', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'staff@example.test' } },
      error: null,
    })
    authorizeStaffUserMock.mockResolvedValue({ ok: true })
    openAiCreateMock.mockResolvedValue({ output_text: 'Legacy reply draft' })

    const response = await postAiReply(aiReplyRequest())

    await expect(response.json()).resolves.toEqual({ reply: 'Legacy reply draft' })
    expect(response.status).toBe(200)
    expect(openAiCreateMock).toHaveBeenCalledTimes(1)
    expect(openAiCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-mini',
        input: expect.stringContaining('You are helping a Catholic parish reply to a baptism request.'),
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(openAiCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.stringContaining('Child Name: Ana Garcia'),
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('fails closed before OpenAI when the reply safety scaffold is explicitly selected', async () => {
    process.env[AI_REPLY_SAFETY_RUNTIME_FLAG] = AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE
    process.env[AI_REPLY_SAFETY_RUNTIME_ACK] = AI_REPLY_SAFETY_RUNTIME_ACK_VALUE
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'staff@example.test' } },
      error: null,
    })
    authorizeStaffUserMock.mockResolvedValue({ ok: true })
    buildAiReplySafetyChainAdapterMock.mockResolvedValue({
      ok: true,
      genericBlockedReason: 'ai_reply_unavailable',
      internalBlockedReason: 'generation_disabled_until_runtime_openai_approval',
    })

    const response = await postAiReply(aiReplyRequest())

    await expect(response.json()).resolves.toEqual({ ok: false, error: 'ai_reply_unavailable' })
    expect(response.status).toBe(503)
    expect(buildAiReplySafetyChainAdapterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ requestType: 'baptism' }),
        staff: { email: 'staff@example.test', userId: 'user-1' },
      })
    )
    expect(openAiCreateMock).not.toHaveBeenCalled()
  })

  it('wires the reply route through the disabled gate while keeping safety flags out of boot requirements', () => {
    const source = readFileSync(replyRoutePath, 'utf8')
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    for (const flag of [AI_REPLY_SAFETY_RUNTIME_FLAG, AI_REPLY_SAFETY_RUNTIME_ACK]) {
      expect(requiredEnv).not.toContain(flag)
    }

    for (const required of [
      'getAiReplySafetyRuntimeGate',
      'buildAiReplyRuntimeScaffold',
      'buildAiReplySafetyChainAdapter',
      'runLegacyStaffGatedReplyRoute',
      'buildLegacyReplyPrompt',
      'failClosedAiReply(safetyChain.genericBlockedReason)',
      "scaffold.selectedPath === 'legacy_staff_gated_reply_route'",
      'openai.responses.create',
      "model: 'gpt-5-mini'",
    ]) {
      expect(source).toContain(required)
    }

    expect(source).not.toContain('buildRequestSummaryRetrievalDto')
    expect(source).not.toContain('writeAuditEvent')
    expect(source).not.toContain(".from('audit_events').insert")

    expectBefore(source, 'const {', 'const staff = await authorizeStaffUser(user)')
    expectBefore(source, 'const staff = await authorizeStaffUser(user)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(source, 'const parsedBody = await readBoundedJsonBody', 'const gate = getAiReplySafetyRuntimeGate()')
    expectBefore(source, 'const gate = getAiReplySafetyRuntimeGate()', 'const scaffold = buildAiReplyRuntimeScaffold(gate)')
    expectBefore(
      source,
      'const scaffold = buildAiReplyRuntimeScaffold(gate)',
      "scaffold.selectedPath === 'legacy_staff_gated_reply_route'"
    )
    expectBefore(source, "scaffold.selectedPath === 'legacy_staff_gated_reply_route'", 'return await runLegacyStaffGatedReplyRoute(body)')
    expectBefore(source, 'const safetyChain = await buildAiReplySafetyChainAdapter', 'return failClosedAiReply(safetyChain.genericBlockedReason)')
    expectBefore(source, 'return failClosedAiReply(safetyChain.genericBlockedReason)', 'function buildLegacyReplyPrompt')
  })

  it('documents the reply scaffold as disabled, fail-closed, and non-production-approved only', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const readme = readFileSync(readmePath, 'utf8')

    for (const required of [
      'AI Reply Runtime Gate Scaffold',
      'IMPLEMENTED - DISABLED-BY-DEFAULT REPLY SAFETY GATE',
      'legacy_staff_gated_reply_route',
      'permission_scoped_reply_safety_chain_scaffold',
      AI_REPLY_SAFETY_RUNTIME_FLAG,
      AI_REPLY_SAFETY_RUNTIME_ACK,
      AI_REPLY_SAFETY_RUNTIME_ENABLED_VALUE,
      AI_REPLY_SAFETY_RUNTIME_ACK_VALUE,
      'fails closed with `ai_reply_unavailable` before any OpenAI call',
      'No production flags were enabled.',
      'No operational RLS changes were made.',
      'No audit events are written by this scaffold.',
      'A future `/api/ai/reply` safety-chain implementation remains `NO_GO`',
      'permission-scoped reply adapter',
      'staff review/status labels and disposition tracking',
      'production-safe smoke fixtures',
    ]) {
      expect(evidence).toContain(required)
    }

    expect(readme).toContain('docs/AI_REPLY_RUNTIME_GATE_SCAFFOLD_20260707.md')
    expect(readme).toContain('Disabled-by-default AI reply safety gate scaffold')
  })
})
