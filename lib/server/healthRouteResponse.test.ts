import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/healthCheck', () => ({
  runHealthChecks: vi.fn(),
}))

import { GET } from '@/app/api/health/route'
import { runHealthChecks } from '@/lib/server/healthCheck'

const mockedRunHealthChecks = vi.mocked(runHealthChecks)

describe('health route response', () => {
  it('does not expose check details or missing configuration names', async () => {
    mockedRunHealthChecks.mockResolvedValueOnce({
      ok: false,
      checks: {
        env: false,
        supabase: false,
        parishes: false,
        resend: true,
        googleOAuth: true,
      },
      error: 'SUPABASE_SERVICE_ROLE_KEY',
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ ok: false })
  })
})
