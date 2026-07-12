import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import {
  AI_SUMMARY_AUDIT_METADATA_PREPARATION_VERSION,
  AI_SUMMARY_PROMPT_ASSEMBLY_VERSION,
  AI_SUMMARY_RESPONSE_SCAFFOLD_VERSION,
  AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
  aiSummarySafetyChainAdapterTestInternals,
  buildAiSummaryAuditMetadataPreparation,
  buildAiSummaryPromptAssembly,
  buildAiSummaryResponseScaffold,
  buildAiSummarySafetyChainAdapter,
} from './aiSummarySafetyChainAdapter'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

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

function queryBuilder(response: { data: Record<string, unknown> | null; error?: { message: string } | null }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve({ data: response.data, error: response.error ?? null })),
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
              created_at: '2026-06-27T10:00:00.000Z',
              parishioner_id: 'parishioner-1',
              status: 'new',
              notes: 'Call after 3 PM.',
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

describe('buildAiSummarySafetyChainAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the prepared DTO chain for an authenticated staff request in the active parish', async () => {
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

    const result = await buildAiSummarySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'STAFF@EXAMPLE.TEST', userId: 'user-1' },
      staffSupabase: staffSupabase as never,
      admin: admin as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: true,
      genericBlockedReason: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'generation_disabled_until_runtime_openai_approval',
      activeParishId: 'parish-2',
      requestParishId: 'parish-2',
      requestId: 'request-1',
      staffReviewStatus: 'review_required',
    })
    if (result.ok) {
      expect(result.sourceCardCount).toBeGreaterThanOrEqual(3)
      expect(result.promptAssembly).toMatchObject({
        dtoVersion: AI_SUMMARY_PROMPT_ASSEMBLY_VERSION,
        runtimeState: 'dto_backed_prompt_assembly_only',
        activeParishId: 'parish-2',
        requestParishId: 'parish-2',
        sourceReferenceIds: expect.arrayContaining([
          'request:request-1',
          'person:request-1:contact',
          'staff_note:request-1:staff-notes',
        ]),
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
        modelOrProviderFamily: 'not_invoked',
      })
      expect(result.promptAssembly.prompt).toContain('Safe source references:')
      expect(result.promptAssembly.prompt).toContain('request:request-1')
      expect(result.promptAssembly.prompt).toContain('label="Baptism request for Ana Garcia"')
      expect(result.promptAssembly.prompt).toContain('label="Staff request notes on file"')
      expect(result.promptAssembly.prompt).toContain('Family-facing output allowed: no')
      expect(result.promptAssembly.prompt).not.toContain('Call after 3 PM')
      expect(result.promptAssembly.prompt).not.toContain('maria@example.test')
      expect(result.promptAssembly.prompt).not.toContain('VineaAl1996')
      expect(result.auditPreparation).toMatchObject({
        dtoVersion: AI_SUMMARY_AUDIT_METADATA_PREPARATION_VERSION,
        runtimeState: 'audit_metadata_preparation_only',
        writeStatus: 'not_written',
        writeBlockedUntil: 'runtime_audit_write_approval',
        futureAuditEvent: {
          table: 'audit_events',
          action: 'ai.summary.audit_metadata_prepared',
          parishId: 'parish-2',
          actorEmail: 'staff@example.test',
          targetType: 'request',
          targetId: 'request-1',
          metadata: {
            ai_feature_id: 'request_summary',
            active_parish_context: 'parish-2',
            target_object_type: 'request',
            target_object_id: 'request-1',
            safe_source_references: expect.arrayContaining([
              'request:request-1',
              'person:request-1:contact',
              'staff_note:request-1:staff-notes',
            ]),
            staff_review_status: 'review_required',
            prompt_assembly: {
              dtoVersion: AI_SUMMARY_PROMPT_ASSEMBLY_VERSION,
              runtimeState: 'dto_backed_prompt_assembly_only',
              promptTextIncluded: false,
              promptTextStored: false,
            },
            rawPromptStored: false,
            rawOutputStored: false,
            providerPayloadStored: false,
            tokenMaterialStored: false,
            humanApprovalRequired: true,
            familyFacingOutputAllowed: false,
          },
        },
      })
      expect(JSON.stringify(result.auditPreparation)).not.toContain('You are helping Catholic parish staff')
      expect(JSON.stringify(result.auditPreparation)).not.toContain('Call after 3 PM')
      expect(JSON.stringify(result.auditPreparation)).not.toContain('maria@example.test')
      expect(JSON.stringify(result.auditPreparation)).not.toContain('VineaAl1996')
      expect(result.responseScaffold).toMatchObject({
        dtoVersion: AI_SUMMARY_RESPONSE_SCAFFOLD_VERSION,
        runtimeState: 'source_display_staff_review_response_scaffold_only',
        clientExposure: 'not_returned_while_generation_disabled',
        failClosedResponse: {
          ok: false,
          error: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
          status: 503,
        },
        target: {
          objectType: 'request',
          objectId: 'request-1',
          safeLabel: 'Baptism request for Ana Garcia',
        },
        activeParishId: 'parish-2',
        sourceDisplay: {
          sourceCardCount: expect.any(Number),
          sourceCards: expect.arrayContaining([
            expect.objectContaining({
              reference: 'request:request-1',
              safeLabel: 'Baptism request for Ana Garcia',
              displayOnly: true,
            }),
            expect.objectContaining({
              reference: 'staff_note:request-1:staff-notes',
              safeLabel: 'Staff request notes on file',
              staffOnly: true,
              displayOnly: true,
            }),
          ]),
        },
        staffReview: {
          reviewStatus: 'review_required',
          displayLabel: 'Review required',
          humanApprovalRequired: true,
          familyFacingOutputAllowed: false,
        },
        privateMaterialPolicy: {
          promptIncluded: false,
          generatedOutputIncluded: false,
          providerPayloadIncluded: false,
          tokenMaterialIncluded: false,
          internalNoteBodiesIncluded: false,
          documentContentsIncluded: false,
        },
      })
      expect(JSON.stringify(result.responseScaffold)).not.toContain('You are helping Catholic parish staff')
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

  it('encodes AI source-display request paths through the safe dashboard request helper', () => {
    const sources = aiSummarySafetyChainAdapterTestInternals.buildSources({
      requestId: 'request/with query?and#fragment',
      activeParishId: 'parish-2',
      requestRow: {
        request_type: 'baptism',
        child_name: 'Ana Garcia',
        created_at: '2026-06-27T10:00:00.000Z',
        status: 'new',
        notes: 'Staff-only note exists.',
      },
      parishioner: {
        parish_id: 'parish-2',
        full_name: 'Maria Garcia',
        email: 'maria@example.test',
      },
    })

    expect(sources).toHaveLength(4)
    expect(sources.map((source) => source.sourcePath)).toEqual([
      '/dashboard/requests/request%2Fwith%20query%3Fand%23fragment',
      '/dashboard/requests/request%2Fwith%20query%3Fand%23fragment',
      '/dashboard/requests/request%2Fwith%20query%3Fand%23fragment',
      '/dashboard/requests/request%2Fwith%20query%3Fand%23fragment',
    ])
  })

  it('preserves explicit fallback only when no active parish cookie is present', async () => {
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

    const result = await buildAiSummarySafetyChainAdapter({
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
    const result = await buildAiSummarySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestType: 'baptism' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toEqual({
      ok: false,
      version: expect.any(String),
      genericBlockedReason: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'missing_request_id_for_object_scope',
    })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
  })

  it('fails closed when an active parish cookie cannot be validated through membership context', async () => {
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

    const result = await buildAiSummarySafetyChainAdapter({
      request: requestWithCookie('parish-1') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'active_parish_cookie_requires_membership_context',
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

    const result = await buildAiSummarySafetyChainAdapter({
      request: requestWithCookie('parish-1') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({ parishionerRow: null }) as never,
      env: { VERCEL_ENV: 'preview' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'request_not_found_in_active_parish_scope',
    })
  })

  it('fails closed when the enabled safety path is attempted in production runtime', async () => {
    const result = await buildAiSummarySafetyChainAdapter({
      request: requestWithCookie('parish-2') as never,
      body: { requestId: 'request-1' },
      staff: { email: 'staff@example.test', userId: 'user-1' },
      staffSupabase: { from: vi.fn(), rpc: vi.fn() } as never,
      admin: adminFor({}) as never,
      env: { VERCEL_ENV: 'production' } as never,
    })

    expect(result).toMatchObject({
      ok: false,
      genericBlockedReason: AI_SUMMARY_SAFETY_CHAIN_GENERIC_BLOCKED_REASON,
      internalBlockedReason: 'runtime_gate_must_not_run_in_production',
    })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
  })

  it('rejects prompt assembly when source cards are not present in safe DTO references', () => {
    const retrievalDto = {
      featureId: 'request_summary',
      target: {
        objectId: 'request-1',
        requestType: 'baptism',
      },
      retrievalScope: {
        activeParishId: 'parish-1',
        requestParishId: 'parish-1',
      },
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
      sourceReferences: [
        {
          type: 'request',
          id: 'request-1',
        },
      ],
    }
    const sourceDisplayDto = {
      featureId: 'request_summary',
      target: {
        objectId: 'request-1',
        safeLabel: 'Baptism request for Ana Garcia',
      },
      activeParishId: 'parish-1',
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
      sourceCards: [
        {
          id: 'request-1',
          type: 'request',
          dataClass: 'request_core',
          safeLabel: 'Baptism request for Ana Garcia',
          staffOnly: false,
          familyFacingSafe: true,
          sacramentalCanonicalRestricted: false,
        },
        {
          id: 'request-1:unsafe-extra',
          type: 'staff_note',
          dataClass: 'request_notes_staff_only',
          safeLabel: 'Staff request notes on file',
          staffOnly: true,
          familyFacingSafe: false,
          sacramentalCanonicalRestricted: false,
        },
      ],
    }
    const auditMetadataDto = {
      ai_feature_id: 'request_summary',
      active_parish_context: 'parish-1',
      target_object_id: 'request-1',
      output_destination: 'internal_summary',
      input_data_classes: ['request_core'],
      safe_source_references: ['request:request-1'],
      source_display: {
        staffOnlySourceCount: 0,
        familyFacingSafeSourceCount: 1,
        sacramentalCanonicalRestrictedSourceCount: 0,
      },
      retentionRule: 'Retain according to parish AI audit policy.',
    }
    const staffReviewStatusDto = {
      featureId: 'request_summary',
      target: {
        objectId: 'request-1',
      },
      parishScope: {
        activeParishId: 'parish-1',
      },
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      displayLabel: 'Review required',
    }

    const result = buildAiSummaryPromptAssembly({
      retrievalDto: retrievalDto as never,
      sourceDisplayDto: sourceDisplayDto as never,
      auditMetadataDto: auditMetadataDto as never,
      staffReviewStatusDto: staffReviewStatusDto as never,
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'prompt_assembly_source_reference_not_in_safe_dtos',
    })
  })

  it('rejects audit metadata preparation when prompt sources are not present in safe audit references', () => {
    const result = buildAiSummaryAuditMetadataPreparation({
      auditMetadataDto: {
        ai_feature_id: 'request_summary',
        active_parish_context: 'parish-1',
        parish_id: 'parish-1',
        target_object_type: 'request',
        target_object_id: 'request-1',
        staffIdentity: {
          email: 'staff@example.test',
        },
        input_data_classes: ['request_core'],
        safe_source_references: ['request:request-1'],
        output_destination: 'internal_summary',
        staff_disposition: 'pending_review',
        model_or_provider_family: 'not_invoked',
        blocked_reason: null,
        source_display: {
          dtoVersion: 'source-display-version',
          sourceCardIds: ['request-1'],
          staffOnlySourceCount: 0,
          familyFacingSafeSourceCount: 1,
          sacramentalCanonicalRestrictedSourceCount: 0,
        },
        humanApprovalRequired: true,
        familyFacingOutputAllowed: false,
      } as never,
      promptAssemblyDto: {
        dtoVersion: AI_SUMMARY_PROMPT_ASSEMBLY_VERSION,
        runtimeState: 'dto_backed_prompt_assembly_only',
        target: {
          objectType: 'request',
          objectId: 'request-1',
          safeLabel: 'Baptism request for Ana Garcia',
        },
        activeParishId: 'parish-1',
        requestParishId: 'parish-1',
        sourceReferenceIds: ['request:request-1', 'staff_note:unsafe-extra'],
        inputDataClasses: ['request_core'],
        familyFacingOutputAllowed: false,
        humanApprovalRequired: true,
        modelOrProviderFamily: 'not_invoked',
        prompt: 'This prompt text must never be copied into audit metadata.',
      },
      staffReviewStatusDto: {
        featureId: 'request_summary',
        target: {
          objectId: 'request-1',
        },
        parishScope: {
          parishId: 'parish-1',
          activeParishId: 'parish-1',
        },
        reviewStatus: 'review_required',
        humanApprovalRequired: true,
        familyFacingOutputAllowed: false,
      } as never,
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'audit_preparation_prompt_source_not_in_safe_audit_references',
    })
  })

  it('rejects response scaffolding when source display includes a source not approved in audit preparation', () => {
    const sourceDisplayDto = {
      featureId: 'request_summary',
      target: {
        objectType: 'request',
        objectId: 'request-1',
        safeLabel: 'Baptism request for Ana Garcia',
      },
      activeParishId: 'parish-1',
      familyFacingOutputAllowed: false,
      humanApprovalRequired: true,
      sourceCards: [
        {
          id: 'request-1',
          type: 'request',
          dataClass: 'request_core',
          safeLabel: 'Baptism request for Ana Garcia',
          staffOnly: false,
          familyFacingSafe: true,
          sacramentalCanonicalRestricted: false,
          displayOnly: true,
        },
        {
          id: 'request-1:unsafe-extra',
          type: 'staff_note',
          dataClass: 'request_notes_staff_only',
          safeLabel: 'Staff request notes on file',
          staffOnly: true,
          familyFacingSafe: false,
          sacramentalCanonicalRestricted: false,
          displayOnly: true,
        },
      ],
      dtoVersion: 'source-display-version',
    }
    const staffReviewStatusDto = {
      featureId: 'request_summary',
      target: {
        objectId: 'request-1',
      },
      parishScope: {
        parishId: 'parish-1',
        activeParishId: 'parish-1',
      },
      reviewStatus: 'review_required',
      displayLabel: 'Review required',
      staffGuidance: 'Staff must review the AI-assisted text before using it.',
      staffActionRequired: true,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      dtoVersion: 'review-status-version',
    }
    const auditPreparationDto = {
      runtimeState: 'audit_metadata_preparation_only',
      writeStatus: 'not_written',
      futureAuditEvent: {
        targetId: 'request-1',
        metadata: {
          active_parish_context: 'parish-1',
          safe_source_references: ['request:request-1'],
          familyFacingOutputAllowed: false,
          humanApprovalRequired: true,
        },
      },
    }

    const result = buildAiSummaryResponseScaffold({
      sourceDisplayDto: sourceDisplayDto as never,
      staffReviewStatusDto: staffReviewStatusDto as never,
      auditPreparationDto: auditPreparationDto as never,
    })

    expect(result).toEqual({
      ok: false,
      blockedReason: 'response_scaffold_source_not_in_safe_audit_references',
    })
  })
})
