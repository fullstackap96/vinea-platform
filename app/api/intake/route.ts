import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { checkDurableRateLimit } from '@/lib/server/durableRateLimit'
import { durableRateLimitKeyFromRequest } from '@/lib/server/simpleRateLimit'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createRequestWorkflowStepsFromActiveTemplate } from '@/lib/server/requestWorkflowTemplates'
import { extractPublicIntakeRouteSignalsForDryRun } from '@/lib/server/publicIntakeRouteSignalDryRun'
import {
  createSupabasePublicIntakeParishScopeDataSource,
  resolvePublicIntakeParishScope,
} from '@/lib/server/publicIntakeParishScope'
import { resolvePublicIntakeRequestParishScopeForFutureRuntime } from '@/lib/server/publicIntakeRequestParishScopeAdapter'
import { getPublicIntakeRoutingRuntimeGate } from '@/lib/server/publicIntakeRoutingRuntimeGate'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { cleanupPartialPublicIntake } from '@/lib/server/publicIntakePartialCleanup'
import {
  existingPublicIntakeAttemptMatches,
  isValidPublicIntakeSubmissionAttemptId,
} from '@/lib/publicIntakeSubmissionAttempt'

export const runtime = 'nodejs'

const ALLOWED_TYPES = new Set(['baptism', 'funeral', 'wedding', 'ocia', 'join_parish'])
const RATE_LIMIT = { limit: 8, windowMs: 60_000 }
const MAX_BODY_BYTES = 64 * 1024

function text(value: unknown, max = 2000): string {
  return String(value ?? '').trim().slice(0, max)
}

function optionalText(value: unknown, max = 2000): string | null {
  const valueText = text(value, max)
  return valueText ? valueText : null
}

function validEmail(value: string): boolean {
  return value.includes('@') && !/\s/.test(value)
}

function checklistFor(body: Record<string, unknown>): Array<{ item_name: string }> {
  const type = text(body.requestType).toLowerCase()
  if (type === 'funeral') {
    return [
      'Initial family contact / pastoral care',
      'Coordinate with funeral home',
      'Confirm service date and time',
      'Collect death certificate / vital records',
      'Readings and music selected',
      'Obituary, worship aid, or livestream details',
      'Cemetery, cremation, or committal arrangements',
      'Post-funeral family follow-up',
    ].map((item_name) => ({ item_name }))
  }
  if (type === 'wedding') {
    return [
      'Initial meeting with parish',
      'Wedding date confirmed',
      'Liturgy details finalized',
    ].map((item_name) => ({ item_name }))
  }
  if (type === 'ocia') {
    return [
      'Initial conversation with OCIA coordinator',
      'Inquiry / evangelization materials shared',
      'Rite of Acceptance / Welcome (as applicable)',
    ].map((item_name) => ({ item_name }))
  }
  if (type === 'join_parish') {
    const items = [
      'Welcome outreach (email/phone)',
      'Registration info sent / collected',
      'Introduce ministries / next steps',
    ]
    if (text(body.interestedInOcia) === 'Yes') items.push('Connect with OCIA coordinator')
    return items.map((item_name) => ({ item_name }))
  }
  return [
    'Birth certificate',
    'Godparent information',
    'Prep class completion',
    'Baptism date confirmed',
  ].map((item_name) => ({ item_name }))
}

async function loadExistingPublicIntakeAttempt(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  submissionAttemptId: string
) {
  const { data: requestRow, error: requestError } = await admin
    .from('requests')
    .select('id, request_type, parishioner_id')
    .eq('id', submissionAttemptId)
    .maybeSingle()
  if (requestError) throw requestError
  if (!requestRow?.id || !requestRow.parishioner_id) return null

  const { data: existingParishioner, error: parishionerError } = await admin
    .from('parishioners')
    .select('id, parish_id, full_name, email, phone')
    .eq('id', requestRow.parishioner_id)
    .maybeSingle()
  if (parishionerError) throw parishionerError
  if (!existingParishioner?.id || !existingParishioner.parish_id) return null

  const { data: completionAudit, error: completionAuditError } = await admin
    .from('audit_events')
    .select('id')
    .eq('parish_id', existingParishioner.parish_id)
    .eq('action', 'public_intake.created')
    .eq('target_type', 'request')
    .eq('target_id', requestRow.id)
    .limit(1)
    .maybeSingle()
  if (completionAuditError) throw completionAuditError

  return {
    requestId: String(requestRow.id),
    requestType: String(requestRow.request_type ?? ''),
    parishionerId: String(existingParishioner.id),
    parishId: String(existingParishioner.parish_id),
    fullName: String(existingParishioner.full_name ?? ''),
    email: String(existingParishioner.email ?? ''),
    phone: String(existingParishioner.phone ?? ''),
    completionAuditConfirmed: Boolean(completionAudit?.id),
  }
}

async function primaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  // Deliberate legacy fallback only: keep this isolated behind
  // resolvePublicIntakeRequestParishScopeForFutureRuntime while runtime routing is disabled.
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.id ? String(data.id) : null
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const admin = createSupabaseServiceRoleClient()
  const rateLimit = await checkDurableRateLimit({
    admin,
    key: durableRateLimitKeyFromRequest(request, 'public-intake'),
    ...RATE_LIMIT,
  }).catch(() => null)
  if (!rateLimit) {
    return NextResponse.json(
      { ok: false, error: 'Could not submit request. Please try again later.' },
      { status: 503 }
    )
  }
  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok && parsedBody.reason === 'too_large') {
    return NextResponse.json({ ok: false, error: 'Request is too large.' }, { status: 413 })
  }

  const body =
    parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
      ? (parsedBody.value as Record<string, unknown>)
      : null
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const requestType = text(body.requestType).toLowerCase()
  const fullName = text(body.fullName, 200)
  const email = text(body.email, 320)
  const phone = text(body.phone, 80)
  const notes = optionalText(body.notes, 4000)
  const submissionAttemptId = text(body.submissionAttemptId, 80).toLowerCase()

  if (!ALLOWED_TYPES.has(requestType)) {
    return NextResponse.json({ ok: false, error: 'Invalid request type.' }, { status: 400 })
  }
  if (!fullName || !validEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a name and valid email.' },
      { status: 400 }
    )
  }
  if (!isValidPublicIntakeSubmissionAttemptId(submissionAttemptId)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }
  if (requestType === 'baptism' && !text(body.childName, 200)) {
    return NextResponse.json({ ok: false, error: 'Child name is required.' }, { status: 400 })
  }
  if (requestType === 'funeral' && !text(body.deceasedName, 200)) {
    return NextResponse.json({ ok: false, error: 'Deceased name is required.' }, { status: 400 })
  }
  if (requestType === 'wedding' && !text(body.partnerOneName, 200)) {
    return NextResponse.json({ ok: false, error: 'Partner name is required.' }, { status: 400 })
  }
  if (requestType === 'ocia' && !text(body.dateOfBirth) && !text(body.ageOrDobNote, 200)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide either date of birth or age.' },
      { status: 400 }
    )
  }

  const ids: { requestId?: string; parishionerId?: string } = {}

  try {
    const gate = getPublicIntakeRoutingRuntimeGate()
    const routeSignals = extractPublicIntakeRouteSignalsForDryRun({
      gate,
      requestUrl: request.url,
      headers: request.headers,
      body,
    })
    const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime({
      gate,
      routingInput: routeSignals.routingInput,
      loadLegacyPrimaryParishId: () => primaryParishId(admin),
      resolveRoutedParishScope: (input) =>
        resolvePublicIntakeParishScope(
          createSupabasePublicIntakeParishScopeDataSource(admin),
          input
        ),
    })
    if (!scope.ok) {
      return NextResponse.json({ ok: false, error: scope.error }, { status: scope.status })
    }

    const parishId = scope.parishId

    const existingAttempt = await loadExistingPublicIntakeAttempt(
      admin,
      submissionAttemptId
    )
    if (existingAttempt) {
      if (
        !existingPublicIntakeAttemptMatches(existingAttempt, {
          submissionAttemptId,
          requestType,
          parishId,
          fullName,
          email,
          phone,
        })
      ) {
        return NextResponse.json(
          { ok: false, error: 'Could not submit request.' },
          { status: 409 }
        )
      }

      return NextResponse.json({
        ok: true,
        requestId: existingAttempt.requestId,
        parishionerId: existingAttempt.parishionerId,
      })
    }

    const { data: parishioner, error: parishionerError } = await admin
      .from('parishioners')
      .insert({
        parish_id: parishId,
        full_name: fullName,
        email,
        phone,
      })
      .select('id')
      .single()
    if (parishionerError || !parishioner?.id) throw parishionerError
    ids.parishionerId = String(parishioner.id)

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .insert({
        id: submissionAttemptId,
        parishioner_id: ids.parishionerId,
        request_type: requestType,
        child_name: requestType === 'baptism' ? text(body.childName, 200) : null,
        preferred_dates: requestType === 'baptism' ? optionalText(body.preferredDates, 1000) : null,
        notes,
      })
      .select('id')
      .single()
    if (requestError || !requestRow?.id) throw requestError
    ids.requestId = String(requestRow.id)

    if (requestType === 'funeral') {
      const { data: detail, error } = await admin
        .from('funeral_request_details')
        .insert({
          request_id: ids.requestId,
          deceased_name: text(body.deceasedName, 200),
          family_relationship: optionalText(body.familyRelationship, 200),
          date_of_death: optionalText(body.dateOfDeath, 50),
          funeral_home_or_location: optionalText(body.funeralHome, 500),
          funeral_director_contact: optionalText(body.funeralDirectorContact, 500),
          service_location: optionalText(body.serviceLocation, 500),
          visitation_details: optionalText(body.visitationDetails, 1000),
          cemetery_or_committal: optionalText(body.cemeteryOrCommittal, 1000),
          readings_music_notes: optionalText(body.readingsMusicNotes, 1000),
          obituary_program_notes: optionalText(body.obituaryProgramNotes, 1000),
          post_funeral_follow_up_date: optionalText(body.postFuneralFollowUpDate, 50),
          preferred_service_notes: optionalText(body.preferredServiceNotes, 1000),
        })
        .select('request_id')
        .maybeSingle()
      if (error || detail?.request_id !== ids.requestId) {
        throw error ?? new Error('Funeral request details were not created.')
      }
    } else if (requestType === 'wedding') {
      const { data: detail, error } = await admin
        .from('wedding_request_details')
        .insert({
          request_id: ids.requestId,
          partner_one_name: text(body.partnerOneName, 200),
          partner_two_name: optionalText(body.partnerTwoName, 200),
          proposed_wedding_date: optionalText(body.proposedWeddingDate, 50),
          ceremony_notes: optionalText(body.ceremonyNotes, 1000),
        })
        .select('request_id')
        .maybeSingle()
      if (error || detail?.request_id !== ids.requestId) {
        throw error ?? new Error('Wedding request details were not created.')
      }
    } else if (requestType === 'ocia') {
      const { data: detail, error } = await admin
        .from('ocia_request_details')
        .insert({
          request_id: ids.requestId,
          date_of_birth: optionalText(body.dateOfBirth, 50),
          age_or_dob_note: optionalText(body.ageOrDobNote, 200),
          sacramental_background: text(body.sacramentalBackground, 200) || 'unknown',
          seeking: text(body.seeking, 200) || 'unknown',
          parishioner_status: text(body.parishionerStatus, 200) || 'unknown',
          preferred_contact_method: text(body.preferredContactMethod, 80) || 'email',
          availability: optionalText(body.availability, 1000),
        })
        .select('request_id')
        .maybeSingle()
      if (error || detail?.request_id !== ids.requestId) {
        throw error ?? new Error('OCIA request details were not created.')
      }
    } else if (requestType === 'join_parish') {
      const { data: detail, error } = await admin
        .from('join_parish_request_details')
        .insert({
          request_id: ids.requestId,
          moving_into_parish: optionalText(body.movingIntoParish, 50),
          address: optionalText(body.address, 500),
          household_members: optionalText(body.householdMembers, 1000),
          baptized: optionalText(body.baptized, 50),
          confirmed: optionalText(body.confirmed, 50),
          first_communion: optionalText(body.firstCommunion, 50),
          already_catholic: optionalText(body.alreadyCatholic, 50),
          interested_in_ocia: optionalText(body.interestedInOcia, 50),
          reason: optionalText(body.reason, 1000),
          notes,
        })
        .select('request_id')
        .maybeSingle()
      if (error || detail?.request_id !== ids.requestId) {
        throw error ?? new Error('Join Parish request details were not created.')
      }
    }

    const checklist = checklistFor({ ...body, requestType }).map((item) => ({
      request_id: ids.requestId,
      item_name: item.item_name,
    }))
    const { data: insertedChecklist, error: checklistError } = await admin
      .from('checklist_items')
      .insert(checklist)
      .select('id')
    if (checklistError || (insertedChecklist?.length ?? 0) !== checklist.length) {
      throw checklistError ?? new Error('The intake checklist was not created completely.')
    }

    const workflowStepsCreated = await createRequestWorkflowStepsFromActiveTemplate({
      admin,
      requestId: ids.requestId,
    })

    const auditWritten = await writeAuditEvent({
      parishId,
      actorEmail: email,
      action: 'public_intake.created',
      targetType: 'request',
      targetId: ids.requestId,
      metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata },
    })
    if (!auditWritten) {
      throw new Error('Public intake completion audit was not recorded.')
    }

    return NextResponse.json(
      {
        ok: true,
        requestId: ids.requestId,
        parishionerId: ids.parishionerId,
      },
      { status: 201 }
    )
  } catch (error) {
    const cleanup = await cleanupPartialPublicIntake(admin, ids)
    logServerError('[intake] public submission failed', error, {
      route: '/api/intake',
      requestType,
      partialRequestCreated: Boolean(ids.requestId),
      partialParishionerCreated: Boolean(ids.parishionerId),
      partialCleanupComplete: cleanup.ok,
      requestCleanupFailed: cleanup.requestCleanupFailed,
      parishionerCleanupFailed: cleanup.parishionerCleanupFailed,
    })
    return NextResponse.json({ ok: false, error: 'Could not submit request.' }, { status: 500 })
  }
}
