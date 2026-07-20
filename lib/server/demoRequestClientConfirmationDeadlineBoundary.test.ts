import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const form = readFileSync(
  join(process.cwd(), 'app/_components/landing/ScheduleDemoForm.tsx'),
  'utf8',
)
const route = readFileSync(join(process.cwd(), 'app/api/demo-request/route.ts'), 'utf8')

describe('Schedule Demo client confirmation deadline boundary', () => {
  it('bounds browser confirmation beyond the server provider deadline', () => {
    expect(form).toContain('const DEMO_REQUEST_CONFIRMATION_TIMEOUT_MS = 20_000')
    expect(form).toContain('const controller = new AbortController()')
    expect(form).toContain(
      'const confirmationTimeoutId = window.setTimeout(\n      () => controller.abort(),\n      DEMO_REQUEST_CONFIRMATION_TIMEOUT_MS,\n    )',
    )
    expect(form).toContain('signal: controller.signal')
    expect(route).toContain('DEMO_REQUEST_PROVIDER_TIMEOUT_MS')
  })

  it('settles an unconfirmed current request with duplicate-aware guidance', () => {
    const catchStart = form.indexOf('} catch (err: unknown)')
    const catchBlock = form.slice(catchStart, form.indexOf('} finally {', catchStart))

    expect(form).toContain('controller.signal.aborted')
    expect(form).toContain("We couldn't confirm your demo request.")
    expect(form).toContain('Please try once more without changing the form')
    expect(catchBlock).not.toContain('deliveryAttemptRef.current = null')
  })

  it('keeps the same reviewed payload on one retry identity', () => {
    expect(form).toContain('const fingerprint = JSON.stringify(reviewedSubmission)')
    expect(form).toContain('deliveryAttemptRef.current?.fingerprint !== fingerprint')
    expect(form).toContain('const deliveryAttemptId = deliveryAttemptRef.current.id')
    expect(form).toContain('deliveryAttemptId,')
    expect(route).toContain('createDemoRequestProviderOptions({ deliveryAttemptId })')
  })

  it('cleans up the deadline and suppresses obsolete unmount settlement', () => {
    expect(form).toContain('const submissionAbortRef = useRef<AbortController | null>(null)')
    expect(form).toContain('submissionAbortRef.current?.abort()')
    expect(form).toContain('submissionAbortRef.current = null')
    expect(form).toContain('if (submissionAbortRef.current !== controller) return')
    expect(form).toContain('window.clearTimeout(confirmationTimeoutId)')
    expect(form).toContain('if (submissionAbortRef.current === controller) {')
  })

  it('keeps the public request mutation single-flight and first-party scoped', () => {
    expect(form).toContain('if (submissionInFlightRef.current) return')
    expect(form.indexOf('submissionInFlightRef.current = true')).toBeLessThan(
      form.indexOf("fetch('/api/demo-request'"),
    )
    expect(form).toContain("method: 'POST'")
    expect(route).toContain('rejectCrossOriginMutation(request)')
    expect(route.indexOf('rejectCrossOriginMutation(request)')).toBeLessThan(
      route.indexOf('checkDurableRateLimit({'),
    )
    expect(form).not.toContain('setInterval(')
    expect(form).not.toContain('createSignedUrl')
  })
})
