import { describe, expect, it } from 'vitest'
import {
  REQUEST_WORKFLOW_DETAIL_FALLBACK_HREF,
  requestWorkflowDetailHref,
} from '@/lib/requestWorkflowV2'

describe('requestWorkflowDetailHref', () => {
  it('builds encoded dashboard-only request detail anchors', () => {
    expect(requestWorkflowDetailHref('request 1/with?chars', 'next-follow-up')).toBe(
      '/dashboard/requests/request%201%2Fwith%3Fchars#next-follow-up'
    )
  })

  it('falls back to the requests dashboard when the request id is blank', () => {
    expect(requestWorkflowDetailHref('   ', 'communication')).toBe(
      REQUEST_WORKFLOW_DETAIL_FALLBACK_HREF
    )
  })
})
