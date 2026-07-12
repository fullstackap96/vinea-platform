import { describe, expect, it } from 'vitest'
import {
  AI_AUDIT_METADATA_DTO_VERSION,
  buildAiAuditMetadataDto,
  buildRequestSummaryAuditMetadataDto,
} from './aiAuditMetadataDto'
import { AI_AUDIT_METADATA_REQUIREMENTS } from './aiSafetyRegistry'
import { buildRequestSummaryRetrievalDto, type RequestSummaryRetrievalInput } from './aiRequestSummaryRetrievalDto'
import { buildAiSourceDisplayDto, buildRequestSummarySourceDisplayDto } from './aiSourceDisplayDto'

const requestSummaryInput = {
  staff: {
    userId: 'staff-user-1',
    email: 'Secretary@StMary.test',
  },
  scope: {
    activeParishId: 'parish-1',
    requestParishId: 'parish-1',
    authorizedParishIds: ['parish-1'],
  },
  request: {
    id: 'request-1',
    requestType: 'baptism',
    safeTitle: 'Baptism request for the Garcia family',
  },
  sources: [
    {
      id: 'request-1',
      type: 'request',
      dataClass: 'request_core',
      label: 'Request overview',
      timestamp: '2026-06-27T12:00:00.000Z',
      staffOnly: false,
      familyFacingSafe: true,
      sourcePath: '/dashboard/requests/request-1',
    },
    {
      id: 'note-1',
      type: 'staff_note',
      dataClass: 'request_notes_staff_only',
      label: 'Staff note reference',
      timestamp: '2026-06-27T13:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sourcePath: '/dashboard/requests/request-1#notes',
    },
    {
      id: 'record-1',
      type: 'sacramental_record',
      dataClass: 'sacramental_record_metadata',
      label: 'Related sacramental record metadata',
      timestamp: '2026-06-27T14:00:00.000Z',
      staffOnly: true,
      familyFacingSafe: false,
      sacramentalCanonicalRestricted: true,
      sourcePath: '/dashboard/records/record-1',
    },
  ],
} satisfies RequestSummaryRetrievalInput

function buildRequestSummaryContracts() {
  const retrievalResult = buildRequestSummaryRetrievalDto(requestSummaryInput)
  expect(retrievalResult.ok).toBe(true)
  if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

  const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
  expect(sourceDisplayResult.ok).toBe(true)
  if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

  return {
    retrievalDto: retrievalResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  }
}

describe('AI audit metadata DTO', () => {
  it('builds request-summary audit metadata from retrieval and source-display DTOs', () => {
    const { retrievalDto, sourceDisplayDto } = buildRequestSummaryContracts()

    const auditResult = buildRequestSummaryAuditMetadataDto(retrievalDto, sourceDisplayDto, {
      timestamp: '2026-06-27T16:00:00.000Z',
    })

    expect(auditResult.ok).toBe(true)
    if (!auditResult.ok) throw new Error(auditResult.blockedReason)

    expect(auditResult.dto).toMatchObject({
      dtoVersion: AI_AUDIT_METADATA_DTO_VERSION,
      runtimeState: 'non_runtime_audit_metadata_only',
      auditMetadataRequirements: AI_AUDIT_METADATA_REQUIREMENTS,
      staffIdentity: {
        userId: 'staff-user-1',
        email: 'secretary@stmary.test',
      },
      staff_user_id_or_email: 'staff-user-1',
      parish_id: 'parish-1',
      active_parish_context: 'parish-1',
      target_object_type: 'request',
      target_object_id: 'request-1',
      ai_feature_id: 'request_summary',
      output_destination: 'internal_summary',
      staff_disposition: 'pending_review',
      model_or_provider_family: 'not_invoked',
      timestamp: '2026-06-27T16:00:00.000Z',
      blocked_reason: null,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
    })
    expect(auditResult.dto.input_data_classes).toEqual([
      'request_core',
      'request_notes_staff_only',
      'sacramental_record_metadata',
    ])
    expect(auditResult.dto.safe_source_references).toEqual([
      'request:request-1',
      'staff_note:note-1',
      'sacramental_record:record-1',
    ])
    expect(auditResult.dto.source_display).toEqual({
      dtoVersion: sourceDisplayDto.dtoVersion,
      sourceCardIds: ['request-1', 'note-1', 'record-1'],
      staffOnlySourceCount: 2,
      familyFacingSafeSourceCount: 1,
      sacramentalCanonicalRestrictedSourceCount: 1,
    })
    expect(auditResult.dto.auditStoragePolicy).toEqual({
      safeReferencesOnly: true,
      generatedTextStoredElsewhereOnlyAfterStaffAction: true,
      privateProviderPayloadNotStoredHere: true,
    })
  })

  it('builds email-draft audit metadata with staff disposition and safe source references', () => {
    const sourceDisplayResult = buildAiSourceDisplayDto({
      featureId: 'email_draft',
      target: {
        objectType: 'communication_draft',
        objectId: 'draft-1',
        safeLabel: 'Follow-up email draft',
      },
      activeParishId: 'parish-1',
      sources: [
        {
          id: 'request-1',
          type: 'request',
          dataClass: 'request_core',
          label: 'Request overview',
          timestamp: '2026-06-27T12:00:00.000Z',
          parishScope: 'parish-1',
          staffOnly: false,
          familyFacingSafe: true,
          permissionCheckedSourcePath: '/dashboard/requests/request-1',
        },
        {
          id: 'communication-1',
          type: 'communication',
          dataClass: 'communication_history',
          label: 'Prior family email reference',
          timestamp: '2026-06-27T13:00:00.000Z',
          parishScope: 'parish-1',
          staffOnly: true,
          familyFacingSafe: false,
          permissionCheckedSourcePath: '/dashboard/communications?request=request-1',
        },
      ],
    })

    expect(sourceDisplayResult.ok).toBe(true)
    if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

    const auditResult = buildAiAuditMetadataDto({
      featureId: 'email_draft',
      staff: {
        userId: null,
        email: 'deacon@stmary.test',
      },
      parish: {
        parishId: 'parish-1',
        activeParishId: 'parish-1',
      },
      target: {
        objectType: 'communication_draft',
        objectId: 'draft-1',
      },
      inputDataClasses: ['request_core', 'communication_history'],
      safeSourceReferences: ['request:request-1', 'communication:communication-1'],
      outputDestination: 'sent_communication',
      staffDisposition: 'sent',
      sourceDisplayDto: sourceDisplayResult.dto,
    })

    expect(auditResult.ok).toBe(true)
    if (!auditResult.ok) throw new Error(auditResult.blockedReason)

    expect(auditResult.dto.staff_user_id_or_email).toBe('deacon@stmary.test')
    expect(auditResult.dto.ai_feature_id).toBe('email_draft')
    expect(auditResult.dto.output_destination).toBe('sent_communication')
    expect(auditResult.dto.staff_disposition).toBe('sent')
    expect(auditResult.dto.model_or_provider_family).toBe('not_invoked')
    expect(auditResult.dto.source_display.sourceCardIds).toEqual(['request-1', 'communication-1'])
  })

  it('preserves blocked reasons without storing unsafe payload material', () => {
    const { sourceDisplayDto } = buildRequestSummaryContracts()

    const auditResult = buildAiAuditMetadataDto({
      featureId: 'request_summary',
      staff: {
        userId: 'staff-user-1',
        email: 'secretary@stmary.test',
      },
      parish: {
        parishId: 'parish-1',
        activeParishId: 'parish-1',
      },
      target: {
        objectType: 'request',
        objectId: 'request-1',
      },
      inputDataClasses: ['request_core', 'request_notes_staff_only', 'sacramental_record_metadata'],
      safeSourceReferences: ['request:request-1', 'staff_note:note-1', 'sacramental_record:record-1'],
      outputDestination: 'internal_summary',
      staffDisposition: 'blocked',
      blockedReason: 'staff_not_authorized_for_active_parish',
      sourceDisplayDto,
    })

    expect(auditResult.ok).toBe(true)
    if (!auditResult.ok) throw new Error(auditResult.blockedReason)

    expect(auditResult.dto.blocked_reason).toBe('staff_not_authorized_for_active_parish')
    expect(JSON.stringify(auditResult.dto)).not.toMatch(
      /RAW_PROMPT_SHOULD_NOT_STORE|RAW_OUTPUT_SHOULD_NOT_STORE|PLAINTEXT_PORTAL_TOKEN|TOKEN_HASH/i
    )
  })

  it('fails closed for unsafe audit references and feature-disallowed destinations or data classes', () => {
    const { sourceDisplayDto } = buildRequestSummaryContracts()

    const baseInput = {
      featureId: 'request_summary' as const,
      staff: {
        userId: 'staff-user-1',
        email: 'secretary@stmary.test',
      },
      parish: {
        parishId: 'parish-1',
        activeParishId: 'parish-1',
      },
      target: {
        objectType: 'request' as const,
        objectId: 'request-1',
      },
      inputDataClasses: ['request_core'] as const,
      safeSourceReferences: ['request:request-1'] as const,
      outputDestination: 'internal_summary' as const,
      staffDisposition: 'pending_review' as const,
      sourceDisplayDto,
    }

    expect(
      buildAiAuditMetadataDto({
        ...baseInput,
        safeSourceReferences: ['request:request-1', 'plaintext token:RAW_PROMPT_SHOULD_NOT_STORE'],
      })
    ).toEqual({ ok: false, blockedReason: 'unsafe_audit_source_reference' })

    expect(
      buildAiAuditMetadataDto({
        ...baseInput,
        outputDestination: 'sent_communication',
      })
    ).toEqual({
      ok: false,
      blockedReason: 'output_destination_not_allowed_for_ai_feature:sent_communication',
    })

    expect(
      buildAiAuditMetadataDto({
        ...baseInput,
        inputDataClasses: ['request_document_contents'],
      })
    ).toEqual({
      ok: false,
      blockedReason: 'data_class_not_allowed_for_ai_audit_feature:request_document_contents',
    })
  })

  it('fails closed when source-display metadata no longer matches the audit target or active parish', () => {
    const { sourceDisplayDto } = buildRequestSummaryContracts()

    expect(
      buildAiAuditMetadataDto({
        featureId: 'request_summary',
        staff: {
          userId: 'staff-user-1',
          email: 'secretary@stmary.test',
        },
        parish: {
          parishId: 'parish-1',
          activeParishId: 'parish-2',
        },
        target: {
          objectType: 'request',
          objectId: 'request-1',
        },
        inputDataClasses: ['request_core', 'request_notes_staff_only', 'sacramental_record_metadata'],
        safeSourceReferences: ['request:request-1', 'staff_note:note-1', 'sacramental_record:record-1'],
        outputDestination: 'internal_summary',
        staffDisposition: 'pending_review',
        sourceDisplayDto,
      })
    ).toEqual({
      ok: false,
      blockedReason: 'audit_active_parish_context_does_not_match_parish_scope',
    })

    expect(
      buildAiAuditMetadataDto({
        featureId: 'request_summary',
        staff: {
          userId: 'staff-user-1',
          email: 'secretary@stmary.test',
        },
        parish: {
          parishId: 'parish-1',
          activeParishId: 'parish-1',
        },
        target: {
          objectType: 'request',
          objectId: 'request-2',
        },
        inputDataClasses: ['request_core', 'request_notes_staff_only', 'sacramental_record_metadata'],
        safeSourceReferences: ['request:request-1', 'staff_note:note-1', 'sacramental_record:record-1'],
        outputDestination: 'internal_summary',
        staffDisposition: 'pending_review',
        sourceDisplayDto,
      })
    ).toEqual({
      ok: false,
      blockedReason: 'source_display_target_id_does_not_match_audit_target',
    })
  })
})
