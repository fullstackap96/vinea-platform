import { NextRequest, NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireStaffFromRequestMock = vi.hoisted(() => vi.fn())
const resolveActiveStaffParishContextMock = vi.hoisted(() => vi.fn())
const buildBaptismCertificatePdfMock = vi.hoisted(() => vi.fn())
const baptismCertificateFilenameMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: requireStaffFromRequestMock,
}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: resolveActiveStaffParishContextMock,
}))

vi.mock('@/lib/server/baptismCertificatePdf', () => ({
  baptismCertificateFilename: baptismCertificateFilenameMock,
  buildBaptismCertificatePdf: buildBaptismCertificatePdfMock,
}))

vi.mock('@/lib/server/safeErrorLogging', () => ({
  logServerError: logServerErrorMock,
}))

import { POST } from '@/app/api/records/[id]/certificate/route'

type QueryResult = { data: unknown; error: Error | null }

function query(result: QueryResult) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  }
  builder.select.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.maybeSingle.mockResolvedValue(result)
  return builder
}

function staffClient(input?: {
  record?: Record<string, unknown> | null
  recordError?: Error | null
  parishName?: string | null
  eventError?: Error | null
  eventPresent?: boolean
}) {
  const recordQuery = query({
    data:
      input?.record === undefined
        ? {
            id: 'record-a',
            parish_id: 'parish-a',
            record_type: 'baptism',
            person_name: 'Synthetic Parishioner',
            sacrament_date: '2026-06-15',
            place: 'Safe Parish Church',
            minister: 'Staff-reviewed minister',
            book: 'Register A',
            page: '10',
            line: '2',
          }
        : input.record,
    error: input?.recordError ?? null,
  })
  const parishQuery = query({
    data: { name: input?.parishName ?? 'Safe Parish A' },
    error: null,
  })
  const eventWrite = {
    insert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  }
  eventWrite.insert.mockReturnValue(eventWrite)
  eventWrite.select.mockReturnValue(eventWrite)
  eventWrite.maybeSingle.mockResolvedValue({
    data: input?.eventPresent === false ? null : { id: 'event-a' },
    error: input?.eventError ?? null,
  })
  const from = vi.fn((table: string) => {
    if (table === 'sacramental_records') return recordQuery
    if (table === 'parishes') return parishQuery
    if (table === 'sacramental_record_events') return eventWrite
    throw new Error(`Unexpected table: ${table}`)
  })

  return {
    client: { from },
    recordQuery,
    parishQuery,
    eventInsert: eventWrite.insert,
    eventSelect: eventWrite.select,
    eventMaybeSingle: eventWrite.maybeSingle,
    from,
  }
}

function request(parishId = 'parish-a', origin = 'https://vinea.test') {
  return new NextRequest('https://vinea.test/api/records/record-a/certificate', {
    method: 'POST',
    headers: {
      cookie: `vinea_active_parish_id=${parishId}`,
      origin,
      'sec-fetch-site': origin === 'https://vinea.test' ? 'same-origin' : 'cross-site',
    },
  })
}

const context = { params: Promise.resolve({ id: 'record-a' }) }

describe('record certificate active parish route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildBaptismCertificatePdfMock.mockResolvedValue(
      Uint8Array.from([0x25, 0x50, 0x44, 0x46]),
    )
    baptismCertificateFilenameMock.mockReturnValue('baptism-certificate-safe.pdf')
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-a',
      requestedParishId: 'parish-a',
    })
  })

  it('rejects a cross-origin generation attempt before authentication or record work', async () => {
    const { from } = staffClient()

    const response = await POST(request('parish-a', 'https://forged.example'), context)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
    expect(buildBaptismCertificatePdfMock).not.toHaveBeenCalled()
  })

  it('stops unauthenticated requests before parish or record work', async () => {
    const { client, from } = staffClient()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(request(), context)

    expect(response.status).toBe(401)
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
    expect(buildBaptismCertificatePdfMock).not.toHaveBeenCalled()
    expect(client).toBeDefined()
  })

  it('denies a forged selected parish generically before record work', async () => {
    const { client, from, eventInsert } = staffClient()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: client,
      user: { id: 'staff-user' },
      staff: { email: 'staff@example.test' },
    })
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-a',
      requestedParishId: 'parish-b',
      ignoredRequestedParishReason: 'Requested parish is not authorized.',
    })

    const response = await POST(request('parish-b'), context)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Record not found.' })
    expect(from).not.toHaveBeenCalled()
    expect(buildBaptismCertificatePdfMock).not.toHaveBeenCalled()
    expect(eventInsert).not.toHaveBeenCalled()
  })

  it('constrains the record lookup to the selected parish and denies missing rows', async () => {
    const { client, recordQuery, eventInsert } = staffClient({ record: null })
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: client,
      user: { id: 'staff-user' },
      staff: { email: 'staff@example.test' },
    })

    const response = await POST(request(), context)

    expect(response.status).toBe(404)
    expect(recordQuery.select).toHaveBeenCalledWith(
      'id, parish_id, record_type, person_name, sacrament_date, place, minister, book, page, line',
    )
    expect(recordQuery.eq).toHaveBeenNthCalledWith(1, 'id', 'record-a')
    expect(recordQuery.eq).toHaveBeenNthCalledWith(2, 'parish_id', 'parish-a')
    expect(buildBaptismCertificatePdfMock).not.toHaveBeenCalled()
    expect(eventInsert).not.toHaveBeenCalled()
  })

  it('generates the existing baptism PDF before writing the scoped event', async () => {
    const { client, eventInsert, eventSelect, eventMaybeSingle } = staffClient()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: client,
      user: { id: 'staff-user' },
      staff: { email: 'staff@example.test' },
    })

    const response = await POST(request(), context)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(buildBaptismCertificatePdfMock).toHaveBeenCalledTimes(1)
    expect(eventInsert).toHaveBeenCalledWith({
      parish_id: 'parish-a',
      sacramental_record_id: 'record-a',
      action: 'certificate_generated',
      actor_id: 'staff-user',
      actor_email: 'staff@example.test',
      metadata: { template: 'baptism_v1' },
    })
    expect(eventSelect).toHaveBeenCalledWith('id')
    expect(eventMaybeSingle).toHaveBeenCalledTimes(1)
    expect(buildBaptismCertificatePdfMock.mock.invocationCallOrder[0]).toBeLessThan(
      eventInsert.mock.invocationCallOrder[0],
    )
  })

  it('does not write a certificate event when PDF generation fails', async () => {
    const { client, eventInsert } = staffClient()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: client,
      user: { id: 'staff-user' },
      staff: { email: 'staff@example.test' },
    })
    buildBaptismCertificatePdfMock.mockRejectedValue(new Error('synthetic pdf failure'))

    const response = await POST(request(), context)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not generate certificate.',
    })
    expect(eventInsert).not.toHaveBeenCalled()
    expect(logServerErrorMock).toHaveBeenCalled()
  })

  it('does not return a certificate when the generation event insert matches no row', async () => {
    const { client, eventInsert } = staffClient({ eventPresent: false })
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: client,
      user: { id: 'staff-user' },
      staff: { email: 'staff@example.test' },
    })

    const response = await POST(request(), context)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not log certificate generation.',
    })
    expect(buildBaptismCertificatePdfMock).toHaveBeenCalledTimes(1)
    expect(eventInsert).toHaveBeenCalledTimes(1)
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[record-certificate] log certificate generation failed',
      expect.any(Error),
    )
  })
})
