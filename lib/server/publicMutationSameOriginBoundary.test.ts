import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { POST as submitDemoRequest } from '@/app/api/demo-request/route'
import { POST as uploadFamilyDocument } from '@/app/api/family/request-portal/[token]/documents/route'
import { POST as submitIntake } from '@/app/api/intake/route'
import { POST as sendRequestNotification } from '@/app/api/request-notifications/route'

function crossOriginRequest(path: string) {
  return new NextRequest(`https://vinea.test${path}`, {
    method: 'POST',
    headers: {
      origin: 'https://untrusted.test',
      'sec-fetch-site': 'cross-site',
    },
  })
}

async function expectGenericOriginDenial(response: Response) {
  expect(response.status).toBe(403)
  await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
}

describe('first-party public mutation same-origin boundary', () => {
  it('rejects cross-origin public intake before privileged work', async () => {
    await expectGenericOriginDenial(await submitIntake(crossOriginRequest('/api/intake')))
  })

  it('rejects cross-origin demo requests before privileged work', async () => {
    await expectGenericOriginDenial(await submitDemoRequest(crossOriginRequest('/api/demo-request')))
  })

  it('rejects cross-origin request notifications before privileged work', async () => {
    await expectGenericOriginDenial(
      await sendRequestNotification(crossOriginRequest('/api/request-notifications')),
    )
  })

  it('rejects cross-origin family uploads before resolving route params or storage work', async () => {
    let paramsRead = false
    const params = {
      then(resolve: (value: { token: string }) => unknown) {
        paramsRead = true
        return Promise.resolve(resolve({ token: 'synthetic-token' }))
      },
    } as Promise<{ token: string }>

    await expectGenericOriginDenial(
      await uploadFamilyDocument(
        crossOriginRequest('/api/family/request-portal/synthetic-token/documents'),
        { params },
      ),
    )
    expect(paramsRead).toBe(false)
  })
})
