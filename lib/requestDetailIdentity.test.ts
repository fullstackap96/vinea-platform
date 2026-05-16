import { describe, expect, it } from 'vitest'
import { getRequestDetailPrimaryHeading } from './requestDetailIdentity'

describe('getRequestDetailPrimaryHeading', () => {
  it('uses child name for baptism', () => {
    expect(
      getRequestDetailPrimaryHeading({
        request_type: 'baptism',
        child_name: 'Lucia Smith',
        parishioner: { full_name: 'Maria Smith' },
      })
    ).toBe('Lucia Smith')
  })

  it('uses deceased name for funeral', () => {
    expect(
      getRequestDetailPrimaryHeading({
        request_type: 'funeral',
        parishioner: { full_name: 'Jane Doe' },
        funeralDetail: { deceased_name: 'John Doe' },
      })
    ).toBe('John Doe')
  })

  it('uses partners for wedding', () => {
    expect(
      getRequestDetailPrimaryHeading({
        request_type: 'wedding',
        parishioner: { full_name: 'Contact Person' },
        weddingDetail: { partner_one_name: 'Ann', partner_two_name: 'Bob' },
      })
    ).toBe('Ann & Bob')
  })

  it('uses parishioner for join parish', () => {
    expect(
      getRequestDetailPrimaryHeading({
        request_type: 'join_parish',
        parishioner: { full_name: 'New Member' },
      })
    ).toBe('New Member')
  })

  it('falls back to contact when subject name is missing', () => {
    expect(
      getRequestDetailPrimaryHeading({
        request_type: 'baptism',
        parishioner: { full_name: 'Maria Smith' },
      })
    ).toBe('Maria Smith')
  })
})
