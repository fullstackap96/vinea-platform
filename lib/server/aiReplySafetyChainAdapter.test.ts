import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import {
  AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION,
  aiReplySafetyChainAdapterTestInternals,
  buildAiReplySafetyChainAdapter,
} from './aiReplySafetyChainAdapter'
import {
  AI_REPLY_AUDIT_METADATA_PREPARATION_VERSION,
  AI_REPLY_PROMPT_ASSEMBLY_VERSION,
  AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
  AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
} from '@/lib/aiReplySafetyChainDtos'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const root = process.cwd()
const adapterPath = join(root, 'lib', 'server', 'aiReplySafetyChainAdapter.ts')

function requestWithCookie(activeParishId?: string | null) {
  return {
    cookies: {
      get: vi.fn((name: string) =>
        name === 'vinea_active_parish_id' && activeParishId
          ? { name, value: activeParishId }
          : undefined
      ),
    },
  }
}

function queryBuilder(response: {
  data: Record<string, unknown> | null
  error?: { message: string } | null
}) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({ data: response.data, error: response.error ?? null })
    ),
  }

  return builder
}

function adminFor(input: {
  requestRow?: Record<string, unknown> | null
  parishionerRow?: Record<string, unknown> | null
}) {
  const builders = {
    requests: queryBuilder({
      data:
        input.requestRow === undefined
          ? {
              id: 'request-1',
              request_type: 'baptism',
              child_name: 'Ana Garcia',
              created_at: '2026-07-07T10:00:00.000Z',
              parishioner_id: 'parishioner-1',
              status: 'waiting_on_documents',
              notes: 'Call after 3 PM with private family details.',
            }
          : input.requestRow,
    }),
    parishioners: queryBuilder({
      data:
        input.parishionerRow === undefined
          ? {
              parish_id: 'parish-2',
              full_name: 'Maria Garcia',
              email: 'maria@example.test',
            }
          : input.parishionerRow,
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

describe('buildAiReplySafetyChainAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the prepared reply DTO chain for an authenticated staff request in the active parish', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    const admin = adminFor({})
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
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

    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: {
        requestId: 'request-1',
        intent: 'followup',
        recipientKind: 'family',
      },
      staff: { email: 'STAFF@EXAMPLE.TEST', userId: 'user-1' },
      staffSupabase: staffSupabase as never,
      admin: admin as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: true,
      version: AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'generation_disabled_until_runtime_openai_approval',
      activeParishId: 'parish-2',
      requestParishId: 'parish-2',
      requestId: 'request-1',
      draftId: 'reply-draft:request-1:follow_up',
      staffReviewStatus: 'review_required',
    })
    if (result.ok) {
      expect(result.sourceCardCount).toBeGreaterThanOrEqual(4)
      expect(result.promptAssembly).toMatchObject({
        dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
        runtimeState: 'dto_backed_reply_prompt_assembly_only',
        activeParishId: 'parish-2',
        requestParishId: 'parish-2',
        draftIntent: 'follow_up',
        recipientKind: 'family',
        outputDestination: 'draft_only',
        autonomousSendAllowed: false,
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
        modelOrProviderFamily: 'not_invoked',
      })
      expect(result.promptAssembly.sourceReferenceIds).toEqual(
        expect.arrayContaining([
          'request:request-1',
          'person:request-1:contact',
          'request:request-1:status',
          'staff_note:request-1:staff-notes',
        ])
      )
      expect(result.promptAssembly.prompt).toContain('staff-reviewed reply draft')
      expect(result.promptAssembly.prompt).toContain('Safe source references:')
      expect(result.promptAssembly.prompt).toContain('request:request-1')
      expect(result.promptAssembly.prompt).toContain('label="Baptism request for Ana Garcia"')
      expect(result.promptAssembly.prompt).toContain('Autonomous send allowed: no')
      expect(result.promptAssembly.prompt).not.toContain('Call after 3 PM')
      expect(result.promptAssembly.prompt).not.toContain('maria@example.test')
      expect(result.promptAssembly.prompt).not.toContain('VineaAl1996')

      expect(result.auditPreparation).toMatchObject({
        dtoVersion: AI_REPLY_AUDIT_METADATA_PREPARATION_VERSION,
        runtimeState: 'reply_audit_metadata_preparation_only',
        writeStatus: 'not_written',
        writeBlockedUntil: 'runtime_ai_reply_audit_write_approval',
        futureAuditEvent: {
          table: 'audit_events',
          action: 'ai.reply.audit_metadata_prepared',
          parishId: 'parish-2',
          actorEmail: 'staff@example.test',
          targetType: 'communication_draft',
          targetId: 'reply-draft:request-1:follow_up',
          metadata: {
            ai_feature_id: 'email_draft',
            active_parish_context: 'parish-2',
            target_object_type: 'communication_draft',
            target_object_id: 'reply-draft:request-1:follow_up',
            request_id: 'request-1',
            staff_review_status: 'review_required',
            prompt_assembly: {
              dtoVersion: AI_REPLY_PROMPT_ASSEMBLY_VERSION,
              promptTextIncluded: false,
              promptTextStored: false,
            },
            rawPromptStored: false,
            rawOutputStored: false,
            providerPayloadStored: false,
            tokenMaterialStored: false,
            autonomousSendAllowed: false,
            humanApprovalRequired: true,
            familyFacingOutputAllowed: false,
          },
        },
      })
      expect(JSON.stringify(result.auditPreparation)).not.toContain('Call after 3 PM')
      expect(JSON.stringify(result.auditPreparation)).not.toContain('maria@example.test')
      expect(JSON.stringify(result.auditPreparation)).not.toContain('VineaAl1996')

      expect(result.responseScaffold).toMatchObject({
        dtoVersion: AI_REPLY_RESPONSE_SCAFFOLD_VERSION,
        runtimeState: 'reply_source_display_staff_review_response_scaffold_only',
        clientExposure: 'not_returned_while_generation_disabled',
        failClosedResponse: {
          ok: false,
          error: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
          status: 503,
        },
        target: {
          objectType: 'communication_draft',
          objectId: 'reply-draft:request-1:follow_up',
          requestId: 'request-1',
        },
        staffReview: {
          reviewStatus: 'review_required',
          humanApprovalRequired: true,
          familyFacingOutputAllowed: false,
        },
        privateMaterialPolicy: {
          promptIncluded: false,
          generatedOutputIncluded: false,
          providerPayloadIncluded: false,
          tokenMaterialIncluded: false,
          internalNoteBodiesIncluded: false,
          communicationBodiesIncluded: false,
          documentContentsIncluded: false,
          autonomousSendControlsIncluded: false,
        },
      })
      expect(JSON.stringify(result.responseScaffold)).not.toContain('Call after 3 PM')
      expect(JSON.stringify(result.responseScaffold)).not.toContain('maria@example.test')
      expect(JSON.stringify(result.responseScaffold)).not.toContain('VineaAl1996')
    }
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
    })
    expect(admin.from).toHaveBeenCalledWith('requests')
    expect(admin.from).toHaveBeenCalledWith('parishioners')
    expect(admin.builders.parishioners.eq).toHaveBeenCalledWith('parish_id', 'parish-2')
  })

  it('encodes AI reply source-display request paths through the safe dashboard request helper', () => {
    const sources = aiReplySafetyChainAdapterTestInternals.buildSources({
      requestId: 'reply/request?unsafe#fragment',
      requestRow: {
        request_type: 'baptism',
        child_name: 'Ana Garcia',
        created_at: '2026-07-07T10:00:00.000Z',
        status: 'waiting_on_documents',
        notes: 'Private family note exists.',
      },
      parishioner: {
        parish_id: 'parish-2',
        full_name: 'Maria Garcia',
        email: 'maria@example.test',
      },
    })

    expect(sources).toHaveLength(4)
    expect(sources.map((source) => source.sourcePath)).toEqual([
      '/dashboard/requests/reply%2Frequest%3Funsafe%23fragment',
      '/dashboard/requests/reply%2Frequest%3Funsafe%23fragment',
      '/dashboard/requests/reply%2Frequest%3Funsafe%23fragment',
      '/dashboard/requests/reply%2Frequest%3Funsafe%23fragment',
    ])
  })

  it('preserves primary-parish fallback only when no active parish cookie is present', async () => {
    const admin = adminFor({
      parishionerRow: {
        parish_id: 'parish-1',
        full_name: 'Maria Garcia',
        email: 'maria@example.test',
      },
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: null,
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie(null) as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: admin as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: true,
      activeParishId: 'parish-1',
      requestParishId: 'parish-1',
    })
  })

  it('fails closed when the enabled path lacks an object-level request id', async () => {
    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestType: 'baptism' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toEqual({
      ok: false,
      version: AI_REPLY_SAFETY_CHAIN_ADAPTER_VERSION,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'missing_request_id_for_reply_object_scope',
    })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
  })

  it('fails closed when an active parish cookie cannot be membership-validated', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-1') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'active_parish_cookie_requires_membership_context',
    })
  })

  it('fails closed when the active parish cookie is explicitly ignored as unauthorized', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not in staff membership scope.',
    })

    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'active_parish_cookie_not_authorized',
    })
  })

  it('fails closed when the request belongs to another parish', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
    })

    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-1') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({ parishionerRow: null }) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'reply_request_not_found_in_active_parish_scope',
    })
  })

  it('fails closed when the enabled safety path is attempted in production runtime', async () => {
    const result = await buildAiReplySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'production' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_REPLY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'runtime_gate_must_not_run_in_production',
    })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
  })

  it('keeps the adapter non-generative and non-writing at source level', () => {
    const source = readFileSync(adapterPath, 'utf8')

    for (const forbidden of [
      'openai.responses.create',
      'writeAuditEvent',
      ".from('audit_events').insert",
      '.storage',
      'createSignedUrl',
      'sendEmail',
    ]) {
      expect(source).not.toContain(forbidden)
    }

    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain("from('requests')")
    expect(source).toContain("from('parishioners')")
    expect(source).toContain('buildAiReplyRetrievalDto')
    expect(source).toContain('buildAiReplyPromptAssembly')
    expect(source).toContain('buildAiReplyAuditMetadataPreparation')
    expect(source).toContain('buildAiReplyResponseScaffold')
    expect(source).toContain('generation_disabled_until_runtime_openai_approval')
  })
})
