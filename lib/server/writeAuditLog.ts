import 'server-only'

import { sanitizeAuditMetadata } from '@/lib/server/auditLogMetadata'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const MAX_ACTOR_EMAIL_LENGTH = 320

export type WriteAuditLogInput = {
  parish_id: string | null
  actor_email: string | null | undefined
  action: string
  entity_type: string
  entity_id?: string | null
  metadata?: Record<string, unknown> | null
}

function devAuditLogFailure(context: string, detail: Record<string, unknown>): void {
  if (!isDev) return
  console.error(`[writeAuditLog] ${context}`, detail)
}

function normalizeActorEmail(value: string | null | undefined): string | null {
  const email = String(value ?? '')
    .trim()
    .toLowerCase()
    .slice(0, MAX_ACTOR_EMAIL_LENGTH)
  return email.length > 0 ? email : null
}

function normalizeUuid(value: string | null | undefined): string | null {
  const id = String(value ?? '').trim()
  if (!id) return null
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    return null
  }
  return id
}

/**
 * Append an audit log row via the service role client.
 * Failures are swallowed so the calling user action is never blocked.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  const action = String(input.action ?? '').trim()
  const entity_type = String(input.entity_type ?? '').trim()

  if (!action || !entity_type) {
    devAuditLogFailure('skipped', { reason: 'missing action or entity_type' })
    return
  }

  const row = {
    parish_id: normalizeUuid(input.parish_id),
    actor_email: normalizeActorEmail(input.actor_email),
    action,
    entity_type,
    entity_id: normalizeUuid(input.entity_id),
    metadata: sanitizeAuditMetadata(input.metadata ?? {}),
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const { error } = await admin.from('audit_logs').insert(row)

    if (error) {
      devAuditLogFailure('insert failed', {
        action,
        entity_type,
        code: error.code,
        message: error.message,
      })
    }
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Unknown error'
    devAuditLogFailure('unexpected error', {
      action,
      entity_type,
      message,
    })
  }
}
