import { afterEach, describe, expect, it, vi } from 'vitest'

import { queuePublicIntakeStaffNotification } from '@/lib/publicIntakeNotificationClient'

describe('public intake staff notification client', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns immediately and queues the reviewed notification payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const payload = { requestId: 'request-a', requestType: 'baptism' }

    expect(queuePublicIntakeStaffNotification(payload)).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()

    await Promise.resolve()

    expect(fetchMock).toHaveBeenCalledWith('/api/request-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: expect.any(AbortSignal),
    })
  })

  it('contains a stalled notification and aborts it after the client deadline', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    let requestSignal: AbortSignal | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_input: string, init: RequestInit) => {
        requestSignal = init.signal as AbortSignal
        return new Promise<Response>((_resolve, reject) => {
          requestSignal?.addEventListener('abort', () => reject(new Error('aborted')))
        })
      })
    )

    queuePublicIntakeStaffNotification({ requestId: 'request-a' })
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(15_000)

    expect(requestSignal?.aborted).toBe(true)
  })

  it('contains a synchronous fetch exception after the intake has settled', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        throw new Error('private network detail')
      })
    )

    expect(() =>
      queuePublicIntakeStaffNotification({ requestId: 'request-a' })
    ).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()
  })
})
