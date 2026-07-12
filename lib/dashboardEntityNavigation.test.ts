import { describe, expect, it } from 'vitest'
import {
  householdDetailHref,
  householdEditHref,
  massIntentionDetailHref,
  massIntentionEditHref,
  personDetailHref,
  personEditHref,
  recordDetailHref,
  recordEditHref,
} from './dashboardEntityNavigation'

describe('dashboard entity navigation', () => {
  it('builds safe person and household detail links', () => {
    expect(personDetailHref('person-1')).toBe('/dashboard/people/person-1')
    expect(personEditHref('person-1')).toBe('/dashboard/people/person-1/edit')
    expect(householdDetailHref('household-1')).toBe('/dashboard/households/household-1')
    expect(householdEditHref('household-1')).toBe('/dashboard/households/household-1/edit')
    expect(recordDetailHref('record-1')).toBe('/dashboard/records/record-1')
    expect(recordEditHref('record-1')).toBe('/dashboard/records/record-1/edit')
    expect(massIntentionDetailHref('intention-1')).toBe('/dashboard/intentions/intention-1')
    expect(massIntentionEditHref('intention-1')).toBe('/dashboard/intentions/intention-1/edit')
  })

  it('encodes unusual IDs before sending them through the dashboard href sanitizer', () => {
    expect(personDetailHref(' person with/slash?query ')).toBe(
      '/dashboard/people/person%20with%2Fslash%3Fquery'
    )
    expect(householdDetailHref('household with/slash?query')).toBe(
      '/dashboard/households/household%20with%2Fslash%3Fquery'
    )
    expect(recordEditHref('record with/slash?query')).toBe(
      '/dashboard/records/record%20with%2Fslash%3Fquery/edit'
    )
    expect(massIntentionEditHref('intention with/slash?query')).toBe(
      '/dashboard/intentions/intention%20with%2Fslash%3Fquery/edit'
    )
  })

  it('falls back to list pages for blank IDs', () => {
    expect(personDetailHref('   ')).toBe('/dashboard/people')
    expect(personDetailHref(null)).toBe('/dashboard/people')
    expect(householdDetailHref('')).toBe('/dashboard/households')
    expect(householdDetailHref(undefined)).toBe('/dashboard/households')
    expect(recordDetailHref(null)).toBe('/dashboard/records')
    expect(recordEditHref('')).toBe('/dashboard/records')
    expect(massIntentionDetailHref(null)).toBe('/dashboard/intentions')
    expect(massIntentionEditHref('')).toBe('/dashboard/intentions')
  })
})
