import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { isRequestPortalTokensTableMissing } from './requestPortalTokens'

describe('requestPortalTokens', () => {
  it('detects missing family portal token migrations', () => {
    expect(
      isRequestPortalTokensTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.request_portal_tokens' in the schema cache",
      })
    ).toBe(true)

    expect(
      isRequestPortalTokensTableMissing({
        code: 'PGRST205',
        message: "Could not find the table 'public.request_documents' in the schema cache",
      })
    ).toBe(false)
  })
})
