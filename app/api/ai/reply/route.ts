import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { openai } from '@/lib/openai'
import { buildAiReplySafetyChainAdapter } from '@/lib/server/aiReplySafetyChainAdapter'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { getAiReplySafetyRuntimeGate } from '@/lib/server/aiReplyRuntimeGate'
import { buildAiReplyRuntimeScaffold } from '@/lib/server/aiReplyRuntimeScaffold'
import { authorizeStaffUser } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

const MAX_BODY_BYTES = 256 * 1024

function logAiReplyRouteError(error: unknown) {
  logServerError('[ai/reply] unexpected failure', error, {
    route: '/api/ai/reply',
  })
}

function getSupabaseServerClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

function baseRequestBlock(body: Record<string, unknown>, requestType: string) {
  if (requestType === 'funeral') {
    return `Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Deceased: ${body.deceasedName}
Relationship: ${body.familyRelationship || '—'}
Date of death: ${body.dateOfDeath || '—'}
Funeral home / location: ${body.funeralHome || '—'}
Preferred service notes: ${body.preferredServiceNotes || '—'}
Funeral director contact: ${body.funeralDirectorContact || '—'}
Service location: ${body.serviceLocation || '—'}
Visitation: ${body.visitationDetails || '—'}
Cemetery / committal: ${body.cemeteryOrCommittal || '—'}
Readings / music: ${body.readingsMusicNotes || '—'}
Obituary / program: ${body.obituaryProgramNotes || '—'}
Post-funeral family follow-up: ${body.postFuneralFollowUpDate || '—'}
Notes: ${body.notes}`
  }
  if (requestType === 'wedding') {
    return `Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Partner: ${body.partnerOneName}
Partner: ${body.partnerTwoName || '—'}
Proposed wedding date: ${body.proposedWeddingDate || '—'}
Ceremony notes: ${body.ceremonyNotes || '—'}
Notes: ${body.notes}`
  }
  if (requestType === 'ocia') {
    return `Request data:
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
Notes: ${body.notes}`
  }
  return `Request data:
Parent Name: ${body.fullName}
Email: ${body.email}
Child Name: ${body.childName}
Preferred Dates: ${body.preferredDates}
Notes: ${body.notes}`
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const response = NextResponse.json({ ok: false })
  try {
    const supabase = getSupabaseServerClient(request, response)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const staff = await authorizeStaffUser(user)
    if (!staff.ok) {
      return NextResponse.json({ ok: false, error: staff.error }, { status: 403 })
    }

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
    const gate = getAiReplySafetyRuntimeGate()
    const scaffold = buildAiReplyRuntimeScaffold(gate)

    if (scaffold.selectedPath === 'legacy_staff_gated_reply_route') {
      return await runLegacyStaffGatedReplyRoute(body)
    }

    const safetyChain = await buildAiReplySafetyChainAdapter({
      request,
      body,
      staff: {
        email: user.email ?? '',
        userId: user.id,
      },
      staffSupabase: supabase,
    })

    return failClosedAiReply(safetyChain.genericBlockedReason)
  } catch (error: unknown) {
    logAiReplyRouteError(error)
    return new NextResponse('Reply draft is temporarily unavailable.', {
      status: 500,
    })
  }
}

function failClosedAiReply(reason: string) {
  return NextResponse.json({ ok: false, error: reason }, { status: 503 })
}

function buildLegacyReplyPrompt(body: Record<string, unknown>, requestType: string): string {
  const isFollowUp = String(body?.intent || '').trim() === 'followup'
  const block = baseRequestBlock(body, requestType)

  if (requestType === 'funeral') {
    return isFollowUp
      ? `
You are helping a Catholic parish send a FOLLOW-UP email to a family regarding funeral or memorial liturgy planning.

This is not the first acknowledgment. Write a warm, compassionate, professional follow-up. Be sensitive to grief; avoid sounding transactional.

Staff context on why this follow-up is needed:
${String(body.followUpContext || '').trim() || '(No extra context provided.)'}

${block}

Include:
1. a brief, pastoral opening appropriate to a follow-up
2. concrete next steps (scheduling, paperwork, or what the parish needs)
3. an invitation to reply with questions
`
      : `
You are helping a Catholic parish reply by email to a family who submitted a funeral or memorial liturgy request.

Write a warm, compassionate, professional reply. The tone should acknowledge grief with dignity and hope.

Include:
1. acknowledgment of the request and care for the family
2. appreciation for entrusting the parish
3. brief next steps for planning the liturgy
4. a note that parish staff will follow up regarding details

${block}
`
  }

  if (requestType === 'wedding') {
    return isFollowUp
      ? `
You are helping a Catholic parish send a FOLLOW-UP email about a wedding the couple has inquired about with the parish.

This is not the first acknowledgment. Write a warm, clear, professional follow-up.

Staff context on why this follow-up is needed:
${String(body.followUpContext || '').trim() || '(No extra context provided.)'}

${block}

Include:
1. a brief, pastoral opening appropriate to a follow-up
2. concrete next steps (scheduling a meeting, confirming date, or what the parish needs)
3. an invitation to reply with questions
`
      : `
You are helping a Catholic parish reply by email to a couple who submitted a wedding request.

Write a warm, clear, professional reply. The tone should be joyful and pastoral.

Include:
1. acknowledgment that the request was received
2. appreciation for considering the parish
3. brief next steps for wedding planning at the parish
4. a note that parish staff will follow up regarding details

${block}
`
  }

  if (requestType === 'ocia') {
    return isFollowUp
      ? `
You are helping a Catholic parish send a FOLLOW-UP email to someone who inquired about OCIA / RCIA.

This is not the first acknowledgment. Write a warm, respectful, professional follow-up.

Staff context on why this follow-up is needed:
${String(body.followUpContext || '').trim() || '(No extra context provided.)'}

${block}

Include:
1. a brief, pastoral opening appropriate to a follow-up
2. concrete next steps (meeting, inquiry session, or how to connect with the parish OCIA team)
3. an invitation to reply with questions
`
      : `
You are helping a Catholic parish reply by email to someone who submitted an OCIA / RCIA inquiry.

Write a warm, respectful, professional reply. The tone should be welcoming and clear without pressure.

Include:
1. acknowledgment that the inquiry was received
2. appreciation for reaching out
3. brief next steps for learning more about OCIA at the parish
4. a note that parish staff will follow up regarding details

${block}
`
  }

  if (isFollowUp) {
    return `
You are helping a Catholic parish send a FOLLOW-UP email about a baptism request the family already submitted.

This is not the first acknowledgment. Write a warm, clear, professional follow-up that does not read like a duplicate "we just received your request" message unless truly appropriate. Acknowledge ongoing coordination where it fits.

Staff context on why this follow-up is needed:
${String(body.followUpContext || '').trim() || '(No extra context provided.)'}

${block}

Include:
1. a brief, pastoral opening appropriate to a follow-up
2. concrete next steps (dates, paperwork, or what the parish needs from the family)
3. an invitation to reply with questions
`
  }

  return `
You are helping a Catholic parish reply to a baptism request.

Write a warm, clear, professional email reply to the family.
The tone should be kind, pastoral, and concise.

Include:
1. confirmation that the request was received
2. appreciation for reaching out
3. brief next steps
4. a note that parish staff will follow up regarding dates and required items

${block}
`
}

async function runLegacyStaffGatedReplyRoute(body: Record<string, unknown>) {
  const requestType = String(body?.requestType || 'baptism')
  const prompt = buildLegacyReplyPrompt(body, requestType)

  const aiResponse = await openai.responses.create({
    model: 'gpt-5-mini',
    input: prompt,
  })

  return NextResponse.json({ reply: aiResponse.output_text })
}
