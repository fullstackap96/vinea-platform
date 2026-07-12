import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { logServerError } from '@/lib/server/safeErrorLogging'

type AuditMetadata = Record<string, unknown>

export async function writeAuditEvent(input: {
  parishId?: string | null
  actorEmail?: string | null
  action: string
  targetType: string
  targetId?: string | null
  metadata?: AuditMetadata
}): Promise<boolean> {
  try {
    const admin = createSupabaseServiceRoleClient()
    const result = await admin.from('audit_events').insert({
      parish_id: input.parishId || null,
      actor_email: input.actorEmail || null,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId || null,
      metadata: input.metadata ?? {},
    })
    if (result?.error) throw result.error
    return true
  } catch (error) {
    logServerError('[audit] write failed', error, {
      action: input.action,
      targetType: input.targetType,
      hasParishId: Boolean(input.parishId),
      hasActorEmail: Boolean(input.actorEmail),
      hasTargetId: Boolean(input.targetId),
      hasMetadata: Boolean(input.metadata && Object.keys(input.metadata).length > 0),
    })
    return false
  }
}
