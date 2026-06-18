import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const requestType = String(body?.requestType || 'baptism')

    let prompt: string
    if (requestType === 'funeral') {
      prompt = `
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
    } else if (requestType === 'wedding') {
      prompt = `
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
    } else if (requestType === 'ocia') {
      prompt = `
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
    } else {
      prompt = `
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

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: prompt,
    })

    return NextResponse.json({ summary: response.output_text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('AI SUMMARY ERROR:', error)
    return new NextResponse(`Summary route error: ${message}`, {
      status: 500,
    })
  }
}
