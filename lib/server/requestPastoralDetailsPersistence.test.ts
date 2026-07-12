import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const requireStaffMock = vi.hoisted(() => vi.fn())
const loadAccessMock = vi.hoisted(() => vi.fn())
const createAdminMock = vi.hoisted(() => vi.fn())
const writeAuditEventMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: requireStaffMock }))
vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: loadAccessMock,
}))
vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createAdminMock,
}))
vi.mock('@/lib/server/auditLog', () => ({ writeAuditEvent: writeAuditEventMock }))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: logServerErrorMock }))
vi.mock('@/lib/server/sameOriginMutation', () => ({
  rejectCrossOriginMutation: vi.fn(() => null),
}))

import { PATCH as saveFuneralDetails } from '@/app/api/requests/[id]/funeral-details/route'
import { PATCH as saveWeddingDetails } from '@/app/api/requests/[id]/wedding-details/route'

type RequestType = 'funeral' | 'wedding'

function adminFor(requestType: RequestType, savedDetail: { request_id: string } | null) {
  const detailTable = `${requestType}_request_details`
  const upsert = vi.fn(() => ({
    select: vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({ data: savedDetail, error: null })),
    })),
  }))
  const from = vi.fn((table: string) => {
    if (table === 'requests') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { id: 'request-a', request_type: requestType },
              error: null,
            })),
          })),
        })),
      }
    }
    if (table === detailTable) {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data: null, error: null })),
          })),
        })),
        upsert,
      }
    }
    throw new Error(`Unexpected table: ${table}`)
  })

  return { admin: { from }, upsert }
}

function routeRequest(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const context = { params: Promise.resolve({ id: 'request-a' }) }

const funeralBody = {
  deceasedName: 'Synthetic deceased label',
  familyRelationship: '',
  dateOfDeath: '',
  funeralHomeOrLocation: '',
  funeralDirectorContact: '',
  serviceLocation: '',
  visitationDetails: '',
  cemeteryOrCommittal: '',
  readingsMusicNotes: '',
  obituaryProgramNotes: '',
  postFuneralFollowUpDate: '',
  preferredServiceNotes: '',
}

const weddingBody = {
  partnerOneName: 'Synthetic partner label',
  partnerTwoName: '',
  proposedWeddingDate: '',
  ceremonyNotes: '',
}

describe('request pastoral detail persistence confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffMock.mockResolvedValue({
      ok: true,
      staff: { email: 'safe-staff@example.test' },
      supabase: {},
    })
    loadAccessMock.mockResolvedValue({ requestId: 'request-a', parishId: 'parish-a' })
    writeAuditEventMock.mockResolvedValue(true)
  })

  it.each([
    ['funeral', saveFuneralDetails, funeralBody],
    ['wedding', saveWeddingDetails, weddingBody],
  ] as const)('returns success only after the %s detail row is confirmed', async (type, handler, body) => {
    const { admin, upsert } = adminFor(type, { request_id: 'request-a' })
    createAdminMock.mockReturnValue(admin)

    const response = await handler(
      routeRequest(`/api/requests/request-a/${type}-details`, body),
      context,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['funeral', saveFuneralDetails, funeralBody, 'Could not save funeral details.'],
    ['wedding', saveWeddingDetails, weddingBody, 'Could not save wedding details.'],
  ] as const)(
    'rejects an accepted zero-row %s upsert without false audit history',
    async (type, handler, body, errorMessage) => {
      const { admin, upsert } = adminFor(type, null)
      createAdminMock.mockReturnValue(admin)

      const response = await handler(
        routeRequest(`/api/requests/request-a/${type}-details`, body),
        context,
      )

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({ ok: false, error: errorMessage })
      expect(upsert).toHaveBeenCalledTimes(1)
      expect(writeAuditEventMock).not.toHaveBeenCalled()
      expect(logServerErrorMock).toHaveBeenCalledTimes(1)
    },
  )

  it('documents confirmed persistence, preserved staff review, and production boundaries', () => {
    const doc = readFileSync(
      join(process.cwd(), 'docs/REQUEST_PASTORAL_DETAILS_PERSISTENCE_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'select only `request_id`',
      'accepted zero-row result',
      'does not create false audit history',
      'Staff-entered pastoral content',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
