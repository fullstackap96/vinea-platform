import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

function normalizeText(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase()
}

function normalizePhone(value: unknown): string {
  const s = normalizeText(value)
  if (!s || s === '—' || s === '-') return ''
  return s.replace(/\D/g, '')
}

function namesMatch(expected: string, actual: string): boolean {
  const a = normalizeText(expected).toLowerCase()
  const b = normalizeText(actual).toLowerCase()
  if (!a || !b) return false
  return a === b
}

export async function verifyRequestNotificationPayload(input: {
  requestId: string
  requestType: string
  contactName: string
  contactEmail: string
  contactPhone: string
}): Promise<{ ok: true } | { ok: false; error: string; status: 403 | 404 }> {
  const admin = createSupabaseServiceRoleClient()

  const { data: reqRow, error: reqErr } = await admin
    .from('requests')
    .select('id, request_type, parishioner_id')
    .eq('id', input.requestId)
    .maybeSingle()

  if (reqErr) {
    return { ok: false, error: 'Could not verify request.', status: 404 }
  }
  if (!reqRow?.id) {
    return { ok: false, error: 'Request not found.', status: 404 }
  }

  const storedType = normalizeText(reqRow.request_type).toLowerCase()
  if (storedType !== normalizeText(input.requestType).toLowerCase()) {
    return { ok: false, error: 'Request type mismatch.', status: 403 }
  }

  const parishionerId = normalizeText(reqRow.parishioner_id)
  if (!parishionerId) {
    return { ok: false, error: 'Request has no linked contact.', status: 403 }
  }

  const { data: parishioner, error: parishionerErr } = await admin
    .from('parishioners')
    .select('full_name, email, phone')
    .eq('id', parishionerId)
    .maybeSingle()

  if (parishionerErr || !parishioner) {
    return { ok: false, error: 'Contact not found for this request.', status: 403 }
  }

  if (!namesMatch(input.contactName, parishioner.full_name)) {
    return { ok: false, error: 'Contact name does not match this request.', status: 403 }
  }

  if (normalizeEmail(input.contactEmail) !== normalizeEmail(parishioner.email)) {
    return { ok: false, error: 'Contact email does not match this request.', status: 403 }
  }

  const bodyPhone = normalizePhone(input.contactPhone)
  const storedPhone = normalizePhone(parishioner.phone)
  if (bodyPhone && storedPhone && bodyPhone !== storedPhone) {
    return { ok: false, error: 'Contact phone does not match this request.', status: 403 }
  }

  return { ok: true }
}
