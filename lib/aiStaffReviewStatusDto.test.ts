import { describe, expect, it } from 'vitest'
import {
  buildAiAuditMetadataDto,
  buildRequestSummaryAuditMetadataDto,
  type AiAuditMetadataDto,
} from './aiAuditMetadataDto'
import { buildRequestSummaryRetrievalDto, type RequestSummaryRetrievalInput } from './aiRequestSummaryRetrievalDto'
import { buildAiSourceDisplayDto, buildRequestSummarySourceDisplayDto, type AiSourceDisplayDto } from './aiSourceDisplayDto'
import {
  AI_STAFF_REVIEW_STATUS_DTO_VERSION,
  buildAiStaffReviewStatusDto,
  type AiStaffReviewStatus,
} from './aiStaffReviewStatusDto'

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

function buildRequestSummaryContracts(options?: {
  readonly outputDestination?: 'internal_summary' | 'saved_staff_note'
  readonly staffDisposition?: 'pending_review' | 'accepted' | 'edited' | 'discarded' | 'blocked'
  readonly blockedReason?: string
}) {
  const retrievalResult = buildRequestSummaryRetrievalDto(requestSummaryInput)
  expect(retrievalResult.ok).toBe(true)
  if (!retrievalResult.ok) throw new Error(retrievalResult.blockedReason)

  const sourceDisplayResult = buildRequestSummarySourceDisplayDto(retrievalResult.dto)
  expect(sourceDisplayResult.ok).toBe(true)
  if (!sourceDisplayResult.ok) throw new Error(sourceDisplayResult.blockedReason)

  const auditResult = buildRequestSummaryAuditMetadataDto(retrievalResult.dto, sourceDisplayResult.dto, {
    outputDestination: options?.outputDestination,
    staffDisposition: options?.staffDisposition,
    blockedReason: options?.blockedReason,
  })
  expect(auditResult.ok).toBe(true)
  if (!auditResult.ok) throw new Error(auditResult.blockedReason)

  return {
    auditMetadataDto: auditResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  }
}

function buildEmailDraftContracts(options: {
  readonly outputDestination: 'draft_only' | 'sent_communication'
  readonly staffDisposition: 'pending_review' | 'accepted' | 'edited' | 'discarded' | 'sent' | 'blocked'
  readonly blockedReason?: string
}) {
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
      userId: 'staff-user-1',
      email: 'secretary@stmary.test',
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
    outputDestination: options.outputDestination,
    staffDisposition: options.staffDisposition,
    blockedReason: options.blockedReason,
    sourceDisplayDto: sourceDisplayResult.dto,
  })
  expect(auditResult.ok).toBe(true)
  if (!auditResult.ok) throw new Error(auditResult.blockedReason)

  return {
    auditMetadataDto: auditResult.dto,
    sourceDisplayDto: sourceDisplayResult.dto,
  }
}

function expectStatus(
  status: AiStaffReviewStatus,
  auditMetadataDto: AiAuditMetadataDto,
  sourceDisplayDto: AiSourceDisplayDto
) {
  const result = buildAiStaffReviewStatusDto({ status, auditMetadataDto, sourceDisplayDto })
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.blockedReason)
  return result.dto
}

describe('AI staff review status DTO', () => {
  it('builds review-required labels with human approval and safety boundaries visible', () => {
    const { auditMetadataDto, sourceDisplayDto } = buildRequestSummaryContracts()

    const dto = expectStatus('review_required', auditMetadataDto, sourceDisplayDto)

    expect(dto).toMatchObject({
      dtoVersion: AI_STAFF_REVIEW_STATUS_DTO_VERSION,
      runtimeState: 'non_runtime_staff_review_status_only',
      featureId: 'request_summary',
      featureLabel: 'Request AI summary',
      reviewStatus: 'review_required',
      displayLabel: 'Review required',
      staffActionRequired: true,
      humanApprovalRequired: true,
      familyFacingOutputAllowed: false,
      sourceDisplayRequired: true,
      auditMetadataRequired: true,
      outputDestination: 'internal_summary',
      staffDisposition: 'pending_review',
      blockedReason: null,
    })
    expect(dto.parishScope).toEqual({ parishId: 'parish-1', activeParishId: 'parish-1' })
    expect(dto.safeSourceSummary).toEqual({
      sourceCardCount: 3,
      staffOnlySourceCount: 2,
      familyFacingSafeSourceCount: 1,
      sacramentalCanonicalRestrictedSourceCount: 1,
    })
    expect(dto.familyFacingBoundary.familyFacingExcluded).toBe(true)
    expect(dto.sacramentalCanonicalBoundary).toMatchObject({
      restrictionsVisible: true,
      restrictedSourcePresent: true,
    })
  })

  it('distinguishes draft, saved, sent, discarded, and blocked staff states', () => {
    const draftContracts = buildEmailDraftContracts({ outputDestination: 'draft_only', staffDisposition: 'edited' })
    const draft = expectStatus('draft', draftContracts.auditMetadataDto, draftContracts.sourceDisplayDto)
    const savedContracts = buildRequestSummaryContracts({
      outputDestination: 'saved_staff_note',
      staffDisposition: 'accepted',
    })
    const sentContracts = buildEmailDraftContracts({
      outputDestination: 'sent_communication',
      staffDisposition: 'sent',
    })
    const discardedContracts = buildEmailDraftContracts({
      outputDestination: 'draft_only',
      staffDisposition: 'discarded',
    })
    const blockedContracts = buildRequestSummaryContracts({
      staffDisposition: 'blocked',
      blockedReason: 'staff_not_authorized_for_active_parish',
    })

    expect(draft.displayLabel).toBe('Draft')
    expect(draft.staffActionRequired).toBe(true)

    const saved = expectStatus('saved', savedContracts.auditMetadataDto, savedContracts.sourceDisplayDto)
    const sent = expectStatus('sent', sentContracts.auditMetadataDto, sentContracts.sourceDisplayDto)
    const discarded = expectStatus(
      'discarded',
      discardedContracts.auditMetadataDto,
      discardedContracts.sourceDisplayDto
    )
    const blocked = expectStatus('blocked', blockedContracts.auditMetadataDto, blockedContracts.sourceDisplayDto)

    expect(saved).toMatchObject({ reviewStatus: 'saved', displayLabel: 'Saved', staffActionRequired: false })
    expect(sent).toMatchObject({ reviewStatus: 'sent', displayLabel: 'Sent', staffActionRequired: false })
    expect(discarded).toMatchObject({
      reviewStatus: 'discarded',
      displayLabel: 'Discarded',
      staffActionRequired: false,
    })
    expect(blocked).toMatchObject({
      reviewStatus: 'blocked',
      displayLabel: 'Blocked',
      staffActionRequired: true,
      blockedReason: 'staff_not_authorized_for_active_parish',
    })
  })

  it('excludes private payload material from the staff review label DTO', () => {
    const { auditMetadataDto, sourceDisplayDto } = buildRequestSummaryContracts()

    const dto = expectStatus('review_required', auditMetadataDto, sourceDisplayDto)

    expect(dto.privateMaterialPolicy).toEqual({
      safeReferencesOnly: true,
      generatedTextStoredElsewhereOnlyAfterStaffAction: true,
      internalPayloadExcluded: true,
    })
    expect(JSON.stringify(dto)).not.toMatch(
      /RAW_PROMPT_SHOULD_NOT_STORE|RAW_OUTPUT_SHOULD_NOT_STORE|PLAINTEXT_PORTAL_TOKEN|TOKEN_HASH/i
    )
  })

  it('fails closed for misleading labels that do not match audit disposition or output destination', () => {
    const reviewContracts = buildRequestSummaryContracts()
    const draftContracts = buildEmailDraftContracts({
      outputDestination: 'draft_only',
      staffDisposition: 'edited',
    })
    const savedContracts = buildRequestSummaryContracts({
      outputDestination: 'saved_staff_note',
      staffDisposition: 'accepted',
    })

    expect(
      buildAiStaffReviewStatusDto({
        status: 'sent',
        auditMetadataDto: draftContracts.auditMetadataDto,
        sourceDisplayDto: draftContracts.sourceDisplayDto,
      })
    ).toEqual({ ok: false, blockedReason: 'sent_status_requires_sent_communication_destination' })

    expect(
      buildAiStaffReviewStatusDto({
        status: 'saved',
        auditMetadataDto: reviewContracts.auditMetadataDto,
        sourceDisplayDto: reviewContracts.sourceDisplayDto,
      })
    ).toEqual({ ok: false, blockedReason: 'saved_status_requires_saved_staff_note_destination' })

    expect(
      buildAiStaffReviewStatusDto({
        status: 'review_required',
        auditMetadataDto: savedContracts.auditMetadataDto,
        sourceDisplayDto: savedContracts.sourceDisplayDto,
      })
    ).toEqual({ ok: false, blockedReason: 'review_required_status_requires_pending_review_disposition' })
  })

  it('fails closed when source-display metadata no longer matches the audit metadata', () => {
    const requestSummaryContracts = buildRequestSummaryContracts()
    const emailDraftContracts = buildEmailDraftContracts({
      outputDestination: 'draft_only',
      staffDisposition: 'pending_review',
    })

    expect(
      buildAiStaffReviewStatusDto({
        status: 'review_required',
        auditMetadataDto: requestSummaryContracts.auditMetadataDto,
        sourceDisplayDto: emailDraftContracts.sourceDisplayDto,
      })
    ).toEqual({
      ok: false,
      blockedReason: 'source_display_feature_does_not_match_review_status_feature',
    })
  })
})
