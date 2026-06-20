import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type AuditMetadata = Record<string, unknown>

export async function writeAuditEvent(input: {
  parishId?: string | null
  actorEmail?: string | null
  action: string
  targetType: string
  targetId?: string | null
  metadata?: AuditMetadata
}) {
  try {
    const admin = createSupabaseServiceRoleClient()
    await admin.from('audit_events').insert({
      parish_id: input.parishId || null,
      actor_email: input.actorEmail || null,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId || null,
      metadata: input.metadata ?? {},
    })
  } catch (error) {
    console.error('[audit] Could not write audit event:', error)
  }
}
