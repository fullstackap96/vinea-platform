import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type SupabaseAdmin = ReturnType<typeof createSupabaseServiceRoleClient>

function isMissingWorkflowTemplateRpc(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  return (
    error.code === 'PGRST202' &&
    String(error.message ?? '').includes('create_request_workflow_steps_from_active_template')
  )
}

export async function createRequestWorkflowStepsFromActiveTemplate(input: {
  admin?: SupabaseAdmin
  requestId: string
}): Promise<number> {
  const requestId = String(input.requestId || '').trim()
  if (!requestId) return 0

  const admin = input.admin ?? createSupabaseServiceRoleClient()
  const { data, error } = await admin.rpc('create_request_workflow_steps_from_active_template', {
    p_request_id: requestId,
  })
  if (isMissingWorkflowTemplateRpc(error)) {
    console.warn(
      'Workflow template RPC is unavailable; request intake will continue without workflow steps.'
    )
    return 0
  }
  if (error) throw error

  const inserted = Number(data ?? 0)
  return Number.isFinite(inserted) && inserted > 0 ? inserted : 0
}
