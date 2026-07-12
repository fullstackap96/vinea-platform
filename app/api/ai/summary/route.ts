import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { validateAiSummaryAuditEventForSafeWrite } from '@/lib/aiSummaryAuditEventSafety'
import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from '@/lib/server/aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from '@/lib/server/aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from '@/lib/server/aiSummarySafeResponseExposureAcceptance'
import { buildAiSummarySafetyChainAdapter } from '@/lib/server/aiSummarySafetyChainAdapter'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { getAiSummarySafetyRuntimeGate } from '@/lib/server/aiSummaryRuntimeGate'
import { buildAiSummaryRuntimeScaffold } from '@/lib/server/aiSummaryRuntimeScaffold'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

const MAX_BODY_BYTES = 256 * 1024

function logAiSummaryRouteError(error: unknown) {
  logServerError('[ai/summary] unexpected failure', error, {
    route: '/api/ai/summary',
  })
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  try {
    const staff = await requireStaffFromRequest(request)
    if (!staff.ok) return staff.response

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok) {
      return NextResponse.json(
        { error: parsedBody.reason === 'too_large' ? 'AI request is too large.' : 'Invalid request.' },
        { status: parsedBody.reason === 'too_large' ? 413 : 400 },
      )
    }
    const body =
      parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : {}
    const gate = getAiSummarySafetyRuntimeGate()
    const scaffold = buildAiSummaryRuntimeScaffold(gate)

    if (scaffold.selectedPath === 'legacy_staff_gated_summary_route') {
      return await runLegacyStaffGatedSummaryRoute(body)
    }

    const safetyChain = await buildAiSummarySafetyChainAdapter({
      request,
      body,
      staff: {
        email: staff.staff.email,
        userId: staff.user.id,
      },
      staffSupabase: staff.supabase,
    })

    const auditWriteApproved =
      process.env[AI_SUMMARY_AUDIT_WRITE_FLAG] === AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE &&
      process.env[AI_SUMMARY_AUDIT_WRITE_ACK] === AI_SUMMARY_AUDIT_WRITE_ACK_VALUE
    let safeAuditMetadataWritten = false

    if (
      auditWriteApproved &&
      safetyChain.ok &&
      safetyChain.auditPreparation.writeStatus === 'not_written'
    ) {
      const futureAudit = safetyChain.auditPreparation.futureAuditEvent
      const safeAuditEvent = validateAiSummaryAuditEventForSafeWrite(futureAudit)
      if (safeAuditEvent.ok) {
        safeAuditMetadataWritten = await writeAuditEvent({
          parishId: safeAuditEvent.dto.event.parishId,
          actorEmail: safeAuditEvent.dto.event.actorEmail,
          action: safeAuditEvent.dto.event.action,
          targetType: safeAuditEvent.dto.event.targetType,
          targetId: safeAuditEvent.dto.event.targetId,
          metadata: safeAuditEvent.dto.event.metadata,
        })
      }
    }

    const safeResponseExposureApproved =
      safeAuditMetadataWritten &&
      process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG] ===
        AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE &&
      process.env[AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK] ===
        AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE

    const generationApproved =
      safeResponseExposureApproved &&
      process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG] ===
        AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE &&
      process.env[AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK] ===
        AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE

    if (generationApproved && safetyChain.ok) {
      if (
        !isNonEmptyString(safetyChain.promptAssembly?.prompt) ||
        !safetyChain.responseScaffold
      ) {
        return failClosedAiSummaryRetrieval(safetyChain.genericBlockedReason)
      }

      const response = await openai.responses.create({
        model: 'gpt-5-mini',
        input: safetyChain.promptAssembly.prompt,
      })

      if (
        !response ||
        typeof response !== 'object' ||
        !isNonEmptyString((response as { output_text?: unknown }).output_text)
      ) {
        return failClosedAiSummaryRetrieval(safetyChain.genericBlockedReason)
      }

      return NextResponse.json({
        summary: response.output_text,
        sourceDisplay: safetyChain.responseScaffold.sourceDisplay,
        staffReview: safetyChain.responseScaffold.staffReview,
      })
    }

    if (safeResponseExposureApproved && safetyChain.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: safetyChain.genericBlockedReason,
          sourceDisplay: safetyChain.responseScaffold.sourceDisplay,
          staffReview: safetyChain.responseScaffold.staffReview,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: safetyChain.genericBlockedReason },
      { status: 503 }
    )
  } catch (error: unknown) {
    logAiSummaryRouteError(error)
    return new NextResponse('Summary is temporarily unavailable.', {
      status: 500,
    })
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function failClosedAiSummaryRetrieval(reason: string) {
  return NextResponse.json({ ok: false, error: reason }, { status: 503 })
}

function buildLegacySummaryPrompt(body: Record<string, unknown>, requestType: string): string {
  if (requestType === 'funeral') {
    return `
You are helping Catholic parish staff review a funeral or memorial liturgy request.

Write a short internal summary for staff.

Include:
1. family contact and relationship to the deceased
2. deceased name and date of death (if provided)
3. funeral home, funeral director, and service location
4. visitation, committal, readings, music, and program details
5. confirmed service time and family follow-up date if set
6. important intake notes
7. suggested next pastoral action

Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Deceased: ${body.deceasedName}
Relationship: ${body.familyRelationship || '—'}
Date of death: ${body.dateOfDeath || '—'}
Funeral home / location: ${body.funeralHome || '—'}
Preferred service notes: ${body.preferredServiceNotes || '—'}
Confirmed service: ${body.confirmedServiceAt || '—'}
Funeral director contact: ${body.funeralDirectorContact || '—'}
Service location: ${body.serviceLocation || '—'}
Visitation: ${body.visitationDetails || '—'}
Cemetery / committal: ${body.cemeteryOrCommittal || '—'}
Readings / music: ${body.readingsMusicNotes || '—'}
Obituary / program: ${body.obituaryProgramNotes || '—'}
Post-funeral family follow-up: ${body.postFuneralFollowUpDate || '—'}
Notes: ${body.notes}
Status: ${body.status}
`
  }

  if (requestType === 'wedding') {
    return `
You are helping Catholic parish staff review a wedding (marriage) request.

Write a short internal summary for staff.

Include:
1. who submitted the request and couple names
2. proposed wedding date if provided
3. ceremony notes and intake notes
4. confirmed ceremony time if set
5. suggested next action

Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Partner: ${body.partnerOneName}
Partner: ${body.partnerTwoName || '—'}
Proposed wedding date: ${body.proposedWeddingDate || '—'}
Ceremony notes: ${body.ceremonyNotes || '—'}
Confirmed ceremony: ${body.confirmedCeremonyAt || '—'}
Notes: ${body.notes}
Status: ${body.status}
`
  }

  if (requestType === 'ocia') {
    return `
You are helping Catholic parish staff review an OCIA / RCIA inquiry.

Write a short internal summary for staff.

Include:
1. inquirer's contact information
2. sacramental background and what they are seeking
3. parish connection and preferred contact method
4. availability and intake notes
5. confirmed OCIA meeting time if set
6. suggested next pastoral step

Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone || '—'}
Date of birth: ${body.dateOfBirth || '—'}
Age / DOB note: ${body.ageOrDobNote || '—'}
Sacramental background: ${body.sacramentalBackground || '—'}
Seeking: ${body.seeking || '—'}
Parishioner status: ${body.parishionerStatus || '—'}
Preferred contact: ${body.preferredContactMethod || '—'}
Availability: ${body.availability || '—'}
Confirmed OCIA meeting: ${body.confirmedSessionAt || '—'}
Notes: ${body.notes}
Status: ${body.status}
`
  }

  return `
You are helping Catholic parish staff review a baptism request.

Write a short internal summary for staff.

Include:
1. who submitted the request
2. child name
3. preferred dates
4. important notes
5. suggested next action

Request data:
Parent Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Child Name: ${body.childName}
Preferred Dates: ${body.preferredDates}
Notes: ${body.notes}
Status: ${body.status}
`
}

async function runLegacyStaffGatedSummaryRoute(body: Record<string, unknown>) {
  const requestType = String(body?.requestType || 'baptism')
  const prompt = buildLegacySummaryPrompt(body, requestType)

  const response = await openai.responses.create({
    model: 'gpt-5-mini',
    input: prompt,
  })

  return NextResponse.json({ summary: response.output_text })
}
