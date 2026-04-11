import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const requestType = String(body?.requestType || 'baptism')

    let prompt: string
    if (requestType === 'funeral') {
      prompt = `
You are helping Catholic parish staff review a funeral or memorial liturgy request.

Write a short internal summary for staff.

Include:
1. family contact and relationship to the deceased
2. deceased name and date of death (if provided)
3. funeral home / location and preferred service notes
4. confirmed service time if set
5. important intake notes
6. suggested next pastoral action

Request data:
Contact Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Deceased: ${body.deceasedName}
Date of death: ${body.dateOfDeath || '—'}
Funeral home / location: ${body.funeralHome || '—'}
Preferred service notes: ${body.preferredServiceNotes || '—'}
Confirmed service: ${body.confirmedServiceAt || '—'}
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
  } catch (error: any) {
    console.error('AI SUMMARY ERROR:', error)
    return new NextResponse(`Summary route error: ${error.message}`, {
      status: 500,
    })
  }
}
