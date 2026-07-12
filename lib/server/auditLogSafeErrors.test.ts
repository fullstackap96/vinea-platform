import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const insertMock = vi.hoisted(() => vi.fn())
const fromMock = vi.hoisted(() => vi.fn(() => ({ insert: insertMock })))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(() => ({
    from: fromMock,
  })),
}))

import { writeAuditEvent } from './auditLog'

const auditLogPath = join(process.cwd(), 'lib', 'server', 'auditLog.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'AUDIT_LOG_HELPER_SAFE_ERROR_LOGGING_20260706.md',
)

describe('audit log helper safe error logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false for thrown audit failures while logging only redacted safe metadata', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    insertMock.mockRejectedValue(
      new Error('Database insert failed for owner@example.com using sk-test_1234567890abcdef'),
    )

    await expect(
      writeAuditEvent({
        parishId: 'raw-parish-id',
        actorEmail: 'owner@example.com',
        action: 'request.updated',
        targetType: 'request',
        targetId: 'raw-target-id',
        metadata: {
          privateNote: 'Do not log this owner@example.com',
          token: 'sk-test_1234567890abcdef',
        },
      }),
    ).resolves.toBe(false)

    expect(fromMock).toHaveBeenCalledWith('audit_events')
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[audit] write failed')
    expect(logPayload).toContain('request.updated')
    expect(logPayload).toContain('request')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).toContain('"hasParishId":true')
    expect(logPayload).toContain('"hasActorEmail":true')
    expect(logPayload).toContain('"hasTargetId":true')
    expect(logPayload).toContain('"hasMetadata":true')
    expect(logPayload).not.toContain('owner@example.com')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
    expect(logPayload).not.toContain('raw-parish-id')
    expect(logPayload).not.toContain('raw-target-id')
    expect(logPayload).not.toContain('privateNote')
  })

  it('detects Supabase returned errors without requiring the client to throw', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    insertMock.mockResolvedValue({
      data: null,
      error: new Error('Returned insert failure for owner@example.com'),
    })

    await expect(
      writeAuditEvent({
        parishId: 'raw-parish-id',
        actorEmail: 'owner@example.com',
        action: 'request.updated',
        targetType: 'request',
        targetId: 'raw-target-id',
      }),
    ).resolves.toBe(false)

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[audit] write failed')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).not.toContain('owner@example.com')
    expect(logPayload).not.toContain('raw-parish-id')
    expect(logPayload).not.toContain('raw-target-id')
  })

  it('returns true only when Supabase accepts the audit insert', async () => {
    insertMock.mockResolvedValue({ data: null, error: null })

    await expect(
      writeAuditEvent({
        parishId: 'parish-a',
        actorEmail: 'staff@example.test',
        action: 'request.updated',
        targetType: 'request',
        targetId: 'request-a',
      }),
    ).resolves.toBe(true)
  })

  it('uses the shared safe logger instead of raw console error in source', () => {
    const source = readFileSync(auditLogPath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[audit] write failed'")
    expect(source).toContain('if (result?.error) throw result.error')
    expect(source).toContain('return true')
    expect(source).toContain('return false')
    expect(source).toContain('hasParishId: Boolean(input.parishId)')
    expect(source).toContain('hasActorEmail: Boolean(input.actorEmail)')
    expect(source).toContain('hasMetadata: Boolean(input.metadata')
    expect(source).not.toContain('console.error')
    expect(source).not.toContain('targetId: input.targetId')
  })

  it('documents the audit helper hardening without claiming broader monitoring readiness', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const buildStatus = readFileSync(
      join(process.cwd(), 'docs', 'VINEA_BUILD_STATUS.md'),
      'utf8',
    )
    const roadmap = readFileSync(join(process.cwd(), 'docs', 'VINEA_ROADMAP.md'), 'utf8')
    const sourceOfTruth = readFileSync(
      join(process.cwd(), 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md'),
      'utf8',
    )

    for (const expected of [
      'Audit Log Helper Safe Error Logging',
      'IMPLEMENTED - CENTRAL AUDIT WRITE ERROR REDACTION',
      'No audit table schema changed.',
      'No migrations were applied.',
      'No operational RLS changes were made.',
      'Raw actor emails, parish IDs, target IDs, audit metadata',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(buildStatus).toContain('Audit Log Helper Safe Error Logging Implemented')
    expect(roadmap).toContain('Audit Log Helper Safe Error Logging')
    expect(sourceOfTruth).toContain('central `writeAuditEvent` helper with safe error logging')
  })
})
