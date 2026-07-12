import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitPublicIntake } from '@/lib/publicIntakeSubmissionClient'

describe('public intake submission client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the confirmed request id and preserves the JSON payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, requestId: ' request-a ' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      submitPublicIntake({ requestType: 'baptism', fullName: 'Safe family' }),
    ).resolves.toEqual({ ok: true, requestId: 'request-a' })
    expect(fetchMock).toHaveBeenCalledWith('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'baptism', fullName: 'Safe family' }),
    })
  })

  it('preserves allowlisted public validation guidance', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: 'Child name is required.' }), {
          status: 400,
        }),
      ),
    )

    await expect(submitPublicIntake({ requestType: 'baptism' })).resolves.toEqual({
      ok: false,
      error: 'Child name is required.',
    })
  })

  it.each([
    ['network rejection', () => Promise.reject(new Error('private network detail'))],
    ['malformed response', () => Promise.resolve(new Response('<html>', { status: 502 }))],
    [
      'successful response without a request id',
      () => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 201 })),
    ],
  ])('returns generic recovery guidance for %s', async (_label, implementation) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(implementation))

    await expect(submitPublicIntake({ requestType: 'funeral' })).resolves.toEqual({
      ok: false,
      error: 'Could not submit your request. Please try again or contact the parish office.',
    })
  })
})
