import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  publicIntakeSubmissionClientTestInternals,
  submitPublicIntake,
} from '@/lib/publicIntakeSubmissionClient'

describe('public intake submission client', () => {
  afterEach(() => {
    publicIntakeSubmissionClientTestInternals.resetPendingSubmissionAttempt()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
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
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(String(options.body))).toMatchObject({
      requestType: 'baptism',
      fullName: 'Safe family',
      submissionAttemptId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    })
  })

  it('reuses the exact attempt after uncertainty and replaces it when reviewed content changes', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('response lost'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, requestId: 'request-a' }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, requestId: 'request-b' }), { status: 201 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const firstPayload = { requestType: 'funeral', fullName: 'Safe family' }
    await submitPublicIntake(firstPayload)
    await submitPublicIntake(firstPayload)
    await submitPublicIntake({ ...firstPayload, fullName: 'Updated family' })

    const bodies = fetchMock.mock.calls.map(([, options]) =>
      JSON.parse(String((options as RequestInit).body)) as { submissionAttemptId: string }
    )
    expect(bodies[1].submissionAttemptId).toBe(bodies[0].submissionAttemptId)
    expect(bodies[2].submissionAttemptId).not.toBe(bodies[1].submissionAttemptId)
  })

  it('bounds browser confirmation while preserving one safe attempt for retry', async () => {
    const signal = new AbortController().signal
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(signal)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('response lost')))

    await expect(submitPublicIntake({ requestType: 'ocia' })).resolves.toEqual({
      ok: false,
      error:
        "We couldn't confirm your request. Please try once more without changing the form, or contact the parish office.",
    })
    expect(timeoutSpy).toHaveBeenCalledWith(60_000)
    expect(publicIntakeSubmissionClientTestInternals.confirmationTimeoutMs).toBe(60_000)
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
