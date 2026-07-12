import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  existingPublicIntakeAttemptMatches,
  isValidPublicIntakeSubmissionAttemptId,
} from '@/lib/publicIntakeSubmissionAttempt'

const routePath = join(process.cwd(), 'app', 'api', 'intake', 'route.ts')
const clientPath = join(process.cwd(), 'lib', 'publicIntakeSubmissionClient.ts')

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)
  expect(earlierIndex).toBeGreaterThanOrEqual(0)
  expect(laterIndex).toBeGreaterThanOrEqual(0)
  expect(earlierIndex).toBeLessThan(laterIndex)
}

describe('public intake submission attempt identity', () => {
  const expected = {
    submissionAttemptId: '9c12ce45-d817-4fb2-bf59-1c7f02f6bde4',
    requestType: 'baptism',
    parishId: 'parish-a',
    fullName: 'Safe Family',
    email: 'family@example.test',
    phone: '555-0100',
  }
  const existing = {
    requestId: expected.submissionAttemptId,
    requestType: expected.requestType,
    parishionerId: 'parishioner-a',
    parishId: expected.parishId,
    fullName: expected.fullName,
    email: 'FAMILY@example.test',
    phone: expected.phone,
    completionAuditConfirmed: true,
  }

  it('accepts only random UUID v4 attempt ids', () => {
    expect(isValidPublicIntakeSubmissionAttemptId(expected.submissionAttemptId)).toBe(true)
    expect(isValidPublicIntakeSubmissionAttemptId('00000000-0000-0000-0000-000000000000')).toBe(
      false
    )
    expect(isValidPublicIntakeSubmissionAttemptId('request-private-id')).toBe(false)
  })

  it('recovers only an exact request, parish, and contact identity match', () => {
    expect(existingPublicIntakeAttemptMatches(existing, expected)).toBe(true)
    expect(
      existingPublicIntakeAttemptMatches({ ...existing, parishId: 'parish-b' }, expected)
    ).toBe(false)
    expect(
      existingPublicIntakeAttemptMatches({ ...existing, requestType: 'funeral' }, expected)
    ).toBe(false)
    expect(
      existingPublicIntakeAttemptMatches({ ...existing, email: 'other@example.test' }, expected)
    ).toBe(false)
    expect(
      existingPublicIntakeAttemptMatches({ ...existing, fullName: 'Another family' }, expected)
    ).toBe(false)
    expect(
      existingPublicIntakeAttemptMatches(
        { ...existing, completionAuditConfirmed: false },
        expected
      )
    ).toBe(false)
  })

  it('keeps durable rate limiting and parish scope before attempt recovery or inserts', () => {
    const route = readFileSync(routePath, 'utf8')

    expect(route).toContain('isValidPublicIntakeSubmissionAttemptId(submissionAttemptId)')
    expect(route).toContain('const existingAttempt = await loadExistingPublicIntakeAttempt')
    expect(route).toContain('existingPublicIntakeAttemptMatches(existingAttempt')
    expect(route).toContain(".eq('action', 'public_intake.created')")
    expect(route).toContain('if (!auditWritten)')
    expect(route).toContain('id: submissionAttemptId')
    expectBefore(route, 'const rateLimit = await checkDurableRateLimit', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const scope = await resolvePublicIntakeRequestParishScopeForFutureRuntime', 'const existingAttempt = await loadExistingPublicIntakeAttempt')
    expectBefore(route, 'const existingAttempt = await loadExistingPublicIntakeAttempt', "const { data: parishioner")
    expectBefore(route, 'existingPublicIntakeAttemptMatches(existingAttempt', 'id: submissionAttemptId')
    expectBefore(route, 'if (!auditWritten)', 'status: 201')
  })

  it('keeps attempt state in memory and sends no raw fingerprint to the server', () => {
    const client = readFileSync(clientPath, 'utf8')

    expect(client).toContain('let pendingSubmissionAttempt')
    expect(client).toContain('const fingerprint = JSON.stringify(payload)')
    expect(client).toContain('id: crypto.randomUUID()')
    expect(client).toContain('submissionAttemptId: attempt.id')
    expect(client).not.toContain('localStorage')
    expect(client).not.toContain('sessionStorage')
    expect(client).not.toContain('fingerprint, submissionAttemptId')
  })
})
