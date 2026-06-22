import 'server-only'

import crypto from 'node:crypto'
import { redactFamilyPortalDocuments } from '@/lib/familyPortalSafety'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { normalizeRequestDocumentRow, type RequestDocument } from '@/lib/requestDocuments'
import { normalizeRequestWorkflowStep, type RequestWorkflowStep } from '@/lib/requestWorkflowSteps'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

export type FamilyPortalRequest = {
  parish: { id: string; name: string }
  request: {
    id: string
    request_type: string
    child_name: string | null
    created_at: string
    contact_name: string | null
  }
  token: {
    id: string
    expires_at: string
  }
  familySteps: RequestWorkflowStep[]
  documents: RequestDocument[]
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

export const REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE =
  'Family document portal links are not configured yet. Apply the family portal token migration before creating upload links.'

export function isRequestPortalTokensTableMissing(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false

  return (
    error.code === 'PGRST205' &&
    String(error.message ?? '').includes("public.request_portal_tokens")
  )
}

export function generateFamilyPortalToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashFamilyPortalToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createRequestPortalToken(input: {
  admin: AdminClient
  parishId: string
  requestId: string
  createdByUserId?: string | null
  createdByEmail?: string | null
  expiresInDays?: number
}) {
  const rawToken = generateFamilyPortalToken()
  const tokenHash = hashFamilyPortalToken(rawToken)
  const days = Number.isFinite(input.expiresInDays) ? Number(input.expiresInDays) : 30
  const expiresAt = new Date(Date.now() + Math.max(1, Math.min(days, 90)) * 24 * 60 * 60 * 1000)

  const { data, error } = await input.admin
    .from('request_portal_tokens')
    .insert({
      parish_id: input.parishId,
      request_id: input.requestId,
      token_hash: tokenHash,
      purpose: 'documents',
      expires_at: expiresAt.toISOString(),
      created_by: input.createdByUserId || null,
      created_by_email: input.createdByEmail || null,
    })
    .select('id, expires_at')
    .single()

  if (error) throw error
  return { rawToken, tokenId: String(data.id), expiresAt: String(data.expires_at) }
}

export async function loadFamilyPortalByToken(
  admin: AdminClient,
  rawToken: string
): Promise<FamilyPortalRequest | null> {
  const token = text(rawToken)
  if (token.length < 32) return null

  const tokenHash = hashFamilyPortalToken(token)
  const now = new Date().toISOString()
  const { data: tokenRow, error: tokenError } = await admin
    .from('request_portal_tokens')
    .select('id, parish_id, request_id, expires_at')
    .eq('token_hash', tokenHash)
    .eq('purpose', 'documents')
    .is('revoked_at', null)
    .gt('expires_at', now)
    .maybeSingle()

  if (tokenError) throw tokenError
  if (!tokenRow?.id) return null

  const parishId = String(tokenRow.parish_id)
  const requestId = String(tokenRow.request_id)

  const { data: parish, error: parishError } = await admin
    .from('parishes')
    .select('id, name')
    .eq('id', parishId)
    .maybeSingle()
  if (parishError) throw parishError
  if (!parish?.id) return null

  const { data: request, error: requestError } = await admin
    .from('requests')
    .select('id, request_type, child_name, created_at, parishioner_id')
    .eq('id', requestId)
    .maybeSingle()
  if (requestError) throw requestError
  if (!request?.id) return null

  const { data: parishioner, error: parishionerError } = await admin
    .from('parishioners')
    .select('full_name, parish_id')
    .eq('id', request.parishioner_id)
    .maybeSingle()
  if (parishionerError) throw parishionerError
  if (String(parishioner?.parish_id ?? '') !== parishId) return null

  const { data: stepRows, error: stepError } = await admin
    .from('request_workflow_steps')
    .select('id, phase, title, description, owner_type, required, status, due_date, sort_order')
    .eq('request_id', requestId)
    .eq('parish_id', parishId)
    .eq('owner_type', 'family')
    .eq('required', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (stepError) throw stepError

  const familySteps = (stepRows ?? [])
    .map((row) => normalizeRequestWorkflowStep(row as Record<string, unknown>))
    .filter((step): step is RequestWorkflowStep => Boolean(step))
  const familyStepIds = familySteps.map((step) => step.id)

  let documents: RequestDocument[] = []
  if (familyStepIds.length > 0) {
    const { data: documentRows, error: documentError } = await admin
      .from('request_documents')
      .select(
        'id, request_id, workflow_step_id, document_type, original_filename, content_type, file_size_bytes, status, uploaded_by_email, reviewed_by_email, reviewed_at, review_note, created_at'
      )
      .eq('request_id', requestId)
      .eq('parish_id', parishId)
      .in('workflow_step_id', familyStepIds)
      .order('created_at', { ascending: false })
    if (documentError) throw documentError

    const normalizedDocuments = (documentRows ?? [])
      .map((row) => normalizeRequestDocumentRow(row as Record<string, unknown>))
      .filter((document): document is RequestDocument => Boolean(document))
    documents = redactFamilyPortalDocuments(normalizedDocuments, familyStepIds)
  }

  await admin
    .from('request_portal_tokens')
    .update({ last_used_at: now })
    .eq('id', tokenRow.id)

  return {
    parish: { id: String(parish.id), name: text(parish.name) || 'Your parish' },
    request: {
      id: requestId,
      request_type: text(request.request_type),
      child_name: text(request.child_name) || null,
      created_at: text(request.created_at),
      contact_name: text(parishioner?.full_name) || null,
    },
    token: {
      id: String(tokenRow.id),
      expires_at: String(tokenRow.expires_at),
    },
    familySteps,
    documents,
  }
}
