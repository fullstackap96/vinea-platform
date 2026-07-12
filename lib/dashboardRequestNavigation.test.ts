import { describe, expect, it } from 'vitest'
import {
  REQUEST_DETAIL_FALLBACK_HREF,
  isRequestDetailHref,
  requestDetailHref,
} from '@/lib/dashboardRequestNavigation'

describe('dashboard request navigation', () => {
  it('builds encoded dashboard-only request detail hrefs', () => {
    expect(requestDetailHref('request with/slash?query')).toBe(
      '/dashboard/requests/request%20with%2Fslash%3Fquery'
    )
  })

  it('falls back to the requests dashboard when the request id is blank', () => {
    expect(requestDetailHref('   ')).toBe(REQUEST_DETAIL_FALLBACK_HREF)
    expect(requestDetailHref(null)).toBe(REQUEST_DETAIL_FALLBACK_HREF)
  })

  it('recognizes only safe request detail dashboard links', () => {
    expect(isRequestDetailHref('/dashboard/requests/request-1')).toBe(true)
    expect(isRequestDetailHref('/dashboard/requests/request-1#communication')).toBe(true)
    expect(isRequestDetailHref('/dashboard/requests')).toBe(false)
    expect(isRequestDetailHref('/dashboard/requests/request-1/details')).toBe(false)
    expect(isRequestDetailHref('/dashboard/requests/request-1?download=true')).toBe(false)
    expect(isRequestDetailHref('/api/requests/request-1')).toBe(false)
    expect(isRequestDetailHref('https://example.test/dashboard/requests/request-1')).toBe(false)
  })
})
