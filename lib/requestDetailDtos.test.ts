import { describe, expect, it } from 'vitest'

import {
  parseRequestChecklistItems,
  parseRequestCommunications,
  parseRequestDetailAccess,
  parseRequestTypeSupport,
} from '@/lib/requestDetailDtos'

describe('request detail DTOs', () => {
  it('allowlists and normalizes the active-parish request detail response', () => {
    const parsed = parseRequestDetailAccess({
      ok: true,
      requestId: 'request-a',
      parishId: 'parish-a',
      request: {
        id: 'request-a',
        parish_id: 'parish-a',
        request_type: 'FUNERAL',
        status: 'new',
        notes: 'Staff-reviewed note',
        unexpected_secret: 'must not cross the boundary',
      },
      parishioner: {
        id: 'parishioner-a',
        parish_id: 'parish-a',
        full_name: 'Safe fixture',
        email: 'fixture@example.test',
        unexpected_secret: 'must not cross the boundary',
      },
    })

    expect(parsed?.request.request_type).toBe('funeral')
    expect(parsed?.request.status).toBe('new')
    expect(parsed?.request).not.toHaveProperty('unexpected_secret')
    expect(parsed?.parishioner).not.toHaveProperty('unexpected_secret')
  })

  it('fails closed for mismatched request or parish scope', () => {
    const base = {
      ok: true,
      requestId: 'request-a',
      parishId: 'parish-a',
      request: { id: 'request-a', parish_id: 'parish-a', request_type: 'baptism' },
      parishioner: { id: 'person-a', parish_id: 'parish-a' },
    }
    expect(parseRequestDetailAccess({ ...base, requestId: 'request-b' })).toBeNull()
    expect(parseRequestDetailAccess({
      ...base,
      parishioner: { id: 'person-a', parish_id: 'parish-b' },
    })).toBeNull()
    expect(parseRequestDetailAccess({
      ...base,
      request: {
        id: 'request-a',
        parish_id: 'parish-a',
        request_type: 'baptism',
        notes: { raw: 'structured value must not be stringified' },
      },
    })).toBeNull()
  })

  it('rejects malformed checklist and communication rows as a whole', () => {
    expect(parseRequestChecklistItems([
      { id: 'item-a', item_name: 'Call family', is_complete: false },
    ])).toEqual([
      { id: 'item-a', item_name: 'Call family', is_complete: false, created_at: null },
    ])
    expect(parseRequestChecklistItems([{ id: 'item-a', is_complete: false }])).toBeNull()

    expect(parseRequestCommunications([
      { id: 'comm-a', contacted_at: '2026-07-10T12:00:00Z', method: 'phone' },
    ])).toEqual([
      {
        id: 'comm-a',
        contacted_at: '2026-07-10T12:00:00Z',
        method: 'phone',
        notes: null,
        created_at: null,
      },
    ])
    expect(parseRequestCommunications([{ id: 'comm-a', method: 'phone' }])).toBeNull()
    expect(parseRequestCommunications([{
      id: 'comm-a',
      contacted_at: '2026-07-10T12:00:00Z',
      method: 'phone',
      notes: { raw: 'must fail closed' },
    }])).toBeNull()
  })

  it('allowlists Catholic type support and rejects malformed linked records', () => {
    const parsed = parseRequestTypeSupport({
      ok: true,
      funeralDetail: {
        request_id: 'request-a',
        deceased_name: 'Safe fixture',
        confirmed_service_at: '2026-07-12T15:00:00Z',
        internal_future_field: 'must not cross',
      },
      weddingDetail: null,
      ociaDetail: null,
      joinParishDetail: null,
      linkedSacramentalRecord: {
        id: 'record-a',
        person_name: 'Safe fixture',
        created_at: '2026-07-10T12:00:00Z',
        register_notes: 'must not cross',
      },
    })

    expect(parsed?.funeralDetail?.deceased_name).toBe('Safe fixture')
    expect(parsed?.funeralDetail).not.toHaveProperty('internal_future_field')
    expect(parsed?.linkedSacramentalRecord).not.toHaveProperty('register_notes')
    expect(parseRequestTypeSupport({
      ok: true,
      funeralDetail: null,
      weddingDetail: null,
      ociaDetail: null,
      joinParishDetail: null,
      linkedSacramentalRecord: { id: 'record-a' },
    })).toBeNull()
    expect(parseRequestTypeSupport({
      ok: true,
      funeralDetail: {
        request_id: 'request-a',
        deceased_name: { raw: 'must fail closed' },
      },
      weddingDetail: null,
      ociaDetail: null,
      joinParishDetail: null,
      linkedSacramentalRecord: null,
    })).toBeNull()
  })
})
