import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const sharedQaRef = 'gnfomgsuottcuueasfvi'
const blockedRefs = new Set(['kikqtorplsswepqitjys'])
const confirmationValue = 'MEMBERSHIP_AWARE_RLS_SHARED_QA_ROUTE_SMOKE'
const confirmation = process.env.VINEA_MEMBERSHIP_RLS_SHARED_QA_ROUTE_SMOKE_CONFIRM

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_MEMBERSHIP_RLS_SHARED_QA_ROUTE_SMOKE_CONFIRM=${confirmationValue} is required.`
  )
}

function readDotEnvValue(name) {
  if (!existsSync('.env.local')) return null
  const line = readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${name}=`))
  if (!line) return null
  return line.slice(name.length + 1).trim().replace(/^['"]|['"]$/g, '')
}

const baseUrl = (process.env.VINEA_SHARED_QA_ROUTE_SMOKE_BASE_URL || 'http://127.0.0.1:3214').trim()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || readDotEnvValue('NEXT_PUBLIC_SUPABASE_URL')
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || readDotEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || readDotEnvValue('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error('Shared QA Supabase app credentials are required.')
}

const host = new URL(supabaseUrl).host
if (host !== `${sharedQaRef}.supabase.co`) {
  throw new Error(`Refusing non-shared-QA app host ${host}.`)
}
for (const ref of blockedRefs) {
  if (host.includes(ref)) throw new Error(`Refusing blocked project ref ${ref}.`)
}

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function cookieHeaderForSession(session, activeParishId) {
  const name = `sb-${sharedQaRef}-auth-token`
  const value = `base64-${base64url(JSON.stringify(session))}`
  const chunks = []
  const chunkSize = 3000

  if (value.length <= chunkSize) {
    chunks.push(`${name}=${value}`)
  } else {
    for (let i = 0; i < value.length; i += chunkSize) {
      chunks.push(`${name}.${chunks.length}=${value.slice(i, i + chunkSize)}`)
    }
  }

  if (activeParishId) {
    chunks.push(`vinea_active_parish_id=${activeParishId}`)
  }

  return chunks.join('; ')
}

async function parseJson(response) {
  const text = await response.text()
  try {
    return { json: JSON.parse(text), text }
  } catch {
    return { json: null, text }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function upsertOrThrow(query, label) {
  const { data, error } = await query
  if (error) throw new Error(`${label}: ${error.message}`)
  return data
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
let parishId = randomUUID()
const parishionerId = randomUUID()
const requestId = randomUUID()
const workflowStepId = randomUUID()
const email = `shared.qa.rls.${suffix}.${randomUUID().slice(0, 8)}@example.test`
const password = `SharedQaRls${randomUUID()}!aA1`
const qaPrefix = `Shared QA RLS Route Smoke ${suffix}`
const results = []

const createdUser = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})
if (createdUser.error || !createdUser.data.user?.id) {
  throw new Error(`create staff auth user failed: ${createdUser.error?.message ?? 'missing user id'}`)
}
const userId = createdUser.data.user.id

try {
  const { data: primaryParish, error: primaryParishError } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (primaryParishError) throw new Error(`load primary parish: ${primaryParishError.message}`)
  const primaryParishId = primaryParish?.id ? String(primaryParish.id) : parishId
  parishId = primaryParishId

  if (!primaryParish?.id) {
    await upsertOrThrow(
      admin.from('parishes').upsert({ id: parishId, name: `${qaPrefix} Parish` }).select('id'),
      'seed parish'
    )
  }
  await upsertOrThrow(
    admin
      .from('staff_users')
      .upsert({ parish_id: parishId, email, role: 'admin', active: true }, { onConflict: 'parish_id,email' })
      .select('email'),
    'seed staff user'
  )
  await upsertOrThrow(
    admin
      .from('parish_memberships')
      .upsert(
        { parish_id: parishId, user_id: userId, email: email.toLowerCase(), role: 'admin', active: true },
        { onConflict: 'parish_id,email' }
      )
      .select('email'),
    'seed parish membership'
  )
  await upsertOrThrow(
    admin
      .from('parishioners')
      .upsert({
        id: parishionerId,
        parish_id: parishId,
        full_name: `${qaPrefix} Family`,
        email: `family.${suffix}@example.test`,
        phone: '555-0199',
      })
      .select('id'),
    'seed parishioner'
  )
  await upsertOrThrow(
    admin
      .from('requests')
      .upsert({
        id: requestId,
        parishioner_id: parishionerId,
        request_type: 'baptism',
        child_name: `${qaPrefix} Child`,
        notes: `${qaPrefix} request notes`,
        status: 'new',
      })
      .select('id'),
    'seed request'
  )
  await upsertOrThrow(
    admin
      .from('request_notes')
      .insert({ request_id: requestId, body: `${qaPrefix} private staff note` })
      .select('id'),
    'seed private request note'
  )
  await upsertOrThrow(
    admin
      .from('request_workflow_steps')
      .upsert({
        id: workflowStepId,
        parish_id: parishId,
        request_id: requestId,
        phase: 'Documentation',
        title: 'Upload birth certificate',
        description: `${qaPrefix} family-facing document request`,
        owner_type: 'family',
        required: true,
        status: 'not_started',
        sort_order: 10,
      })
      .select('id'),
    'seed workflow step'
  )

  const anon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const signIn = await anon.auth.signInWithPassword({ email, password })
  if (signIn.error || !signIn.data.session) {
    throw new Error(`signIn failed: ${signIn.error?.message ?? 'no session'}`)
  }

  const cookieHeader = cookieHeaderForSession(signIn.data.session, parishId)
  async function route(path, options = {}) {
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        cookie: cookieHeader,
        ...(options.headers ?? {}),
      },
    })
  }

  const healthRes = await fetch(`${baseUrl}/api/health`)
  const health = await parseJson(healthRes)
  results.push({
    check: 'api_health',
    status: healthRes.status,
    ok: health.json?.ok === true,
    schema: health.json?.checks?.schema === true,
  })
  assert(
    healthRes.status === 200 && health.json?.ok === true && health.json?.checks?.schema === true,
    'api health failed'
  )

  const requestUpdate = await anon
    .from('requests')
    .update({
      status: 'in_progress',
      assigned_staff_name: 'Shared QA Staff',
      assigned_priest_name: 'Shared QA Priest',
      next_follow_up_date: '2026-07-15',
    })
    .eq('id', requestId)
    .select('id, status, assigned_staff_name, assigned_priest_name, next_follow_up_date')
    .single()
  results.push({
    check: 'authenticated_request_status_assignment_followup_update',
    ok: !requestUpdate.error,
    statusValue: requestUpdate.data?.status ?? null,
  })
  assert(!requestUpdate.error && requestUpdate.data?.status === 'in_progress', 'request update failed')

  const noteInsert = await anon
    .from('request_notes')
    .insert({ request_id: requestId, body: `${qaPrefix} authenticated note insert` })
    .select('id')
    .single()
  results.push({ check: 'authenticated_request_note_insert', ok: !noteInsert.error })
  assert(!noteInsert.error && noteInsert.data?.id, 'request note insert failed')

  const workflowUpdate = await anon
    .from('request_workflow_steps')
    .update({
      status: 'complete',
      completed_at: new Date().toISOString(),
      completed_by: userId,
    })
    .eq('id', workflowStepId)
    .select('id, status')
    .single()
  results.push({
    check: 'authenticated_workflow_step_update',
    ok: !workflowUpdate.error,
    statusValue: workflowUpdate.data?.status ?? null,
  })
  assert(!workflowUpdate.error && workflowUpdate.data?.status === 'complete', 'workflow step update failed')

  const detailAccessRes = await route(`/api/requests/${requestId}/detail-access`)
  const detailAccess = await parseJson(detailAccessRes)
  results.push({
    check: 'request_detail_access_api',
    status: detailAccessRes.status,
    ok: detailAccess.json?.ok === true,
  })
  assert(detailAccessRes.status === 200 && detailAccess.json?.ok === true, 'detail access api failed')

  const detailPageRes = await route(`/dashboard/requests/${requestId}`)
  const detailPageText = await detailPageRes.text()
  results.push({
    check: 'request_detail_page',
    status: detailPageRes.status,
    renderedWithoutLoginRedirect:
      !detailPageText.includes('Staff login') && !detailPageText.includes('not authorized'),
  })
  assert(
    detailPageRes.status === 200 &&
      !detailPageText.includes('Staff login') &&
      !detailPageText.includes('not authorized'),
    'request detail page failed'
  )

  const listBeforeRes = await route(`/api/requests/${requestId}/documents`)
  const listBefore = await parseJson(listBeforeRes)
  results.push({
    check: 'staff_document_list_before_upload',
    status: listBeforeRes.status,
    ok: listBefore.json?.ok === true,
  })
  assert(listBeforeRes.status === 200 && listBefore.json?.ok === true, 'document list before upload failed')

  const uploadForm = new FormData()
  uploadForm.set('workflowStepId', workflowStepId)
  uploadForm.set('documentType', 'Birth certificate')
  uploadForm.set(
    'file',
    new File([Buffer.from('Vinea shared QA staff document smoke')], 'shared-qa-staff-document.txt', {
      type: 'text/plain',
    })
  )
  const uploadRes = await route(`/api/requests/${requestId}/documents`, {
    method: 'POST',
    body: uploadForm,
  })
  const upload = await parseJson(uploadRes)
  const staffDocumentId = upload.json?.document?.id
  results.push({
    check: 'staff_document_upload',
    status: uploadRes.status,
    ok: upload.json?.ok === true,
    documentIdPresent: Boolean(staffDocumentId),
  })
  assert(uploadRes.status === 200 && upload.json?.ok === true && staffDocumentId, 'staff document upload failed')

  const signedRes = await route(`/api/requests/${requestId}/documents/${staffDocumentId}`)
  const signed = await parseJson(signedRes)
  results.push({
    check: 'staff_signed_url_route',
    status: signedRes.status,
    ok: signed.json?.ok === true,
    signedUrlPresent: Boolean(signed.json?.url),
  })
  assert(signedRes.status === 200 && signed.json?.ok === true && signed.json?.url, 'signed url route failed')

  const signedFetch = await fetch(signed.json.url)
  const signedText = await signedFetch.text()
  results.push({
    check: 'staff_signed_url_fetch',
    status: signedFetch.status,
    bodyMatched: signedText.includes('Vinea shared QA staff document smoke'),
  })
  assert(
    signedFetch.status === 200 && signedText.includes('Vinea shared QA staff document smoke'),
    'signed url fetch failed'
  )

  const { data: docRow, error: docError } = await admin
    .from('request_documents')
    .select('storage_path, storage_bucket')
    .eq('id', staffDocumentId)
    .single()
  if (docError) throw docError

  const directDownload = await anon.storage.from(docRow.storage_bucket).download(docRow.storage_path)
  results.push({
    check: 'direct_storage_privacy',
    denied: Boolean(directDownload.error),
    statusCode: directDownload.error?.statusCode ?? null,
  })
  assert(Boolean(directDownload.error), 'direct storage download unexpectedly succeeded')

  const reviewRes = await route(`/api/requests/${requestId}/documents/${staffDocumentId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'approved', reviewNote: 'Shared QA smoke approved' }),
  })
  const review = await parseJson(reviewRes)
  results.push({
    check: 'staff_document_review',
    status: reviewRes.status,
    ok: review.json?.ok === true,
    statusValue: review.json?.document?.status ?? null,
  })
  assert(reviewRes.status === 200 && review.json?.ok === true, 'document review failed')

  const tokenRes = await route(`/api/requests/${requestId}/portal-token`, { method: 'POST' })
  const token = await parseJson(tokenRes)
  results.push({
    check: 'staff_portal_token_create',
    status: tokenRes.status,
    ok: token.json?.ok === true,
    urlPresent: Boolean(token.json?.url),
    tokenHashExposed: token.text.includes('token_hash'),
  })
  assert(
    tokenRes.status === 200 &&
      token.json?.ok === true &&
      token.json?.url &&
      !token.text.includes('token_hash'),
    'portal token create failed or exposed hash'
  )

  const portalUrl = token.json.url
  const rawToken = portalUrl.split('/family/request/')[1]
  const familyPageRes = await fetch(portalUrl)
  const familyPageText = await familyPageRes.text()
  const unsafeMarkers = [`${qaPrefix} private staff note`, 'Internal Notes', 'token_hash']
  results.push({
    check: 'family_portal_page_safety',
    status: familyPageRes.status,
    hasFamilyStep: familyPageText.includes('Upload birth certificate'),
    unsafeMarkerFound: unsafeMarkers.find((marker) => familyPageText.includes(marker)) ?? null,
  })
  assert(
    familyPageRes.status === 200 &&
      familyPageText.includes('Upload birth certificate') &&
      !unsafeMarkers.some((marker) => familyPageText.includes(marker)),
    'family portal page safety failed'
  )

  const familyForm = new FormData()
  familyForm.set('workflowStepId', workflowStepId)
  familyForm.set(
    'file',
    new File([Buffer.from('Vinea shared QA family document smoke')], 'shared-qa-family-document.txt', {
      type: 'text/plain',
    })
  )
  const familyUploadRes = await fetch(`${baseUrl}/api/family/request-portal/${rawToken}/documents`, {
    method: 'POST',
    body: familyForm,
  })
  const familyUpload = await parseJson(familyUploadRes)
  results.push({
    check: 'family_portal_document_upload',
    status: familyUploadRes.status,
    ok: familyUpload.json?.ok === true,
  })
  assert(familyUploadRes.status === 200 && familyUpload.json?.ok === true, 'family portal upload failed')

  const auditRows = await admin
    .from('audit_events')
    .select('action, target_type, target_id')
    .eq('parish_id', parishId)
    .in('action', [
      'request.document.uploaded',
      'request.document.reviewed',
      'request.portal_token.created',
      'request.document.family_uploaded',
    ])
    .limit(10)
  results.push({
    check: 'audit_events_for_document_and_portal_actions',
    ok: !auditRows.error,
    count: auditRows.data?.length ?? 0,
  })
  assert(!auditRows.error && (auditRows.data?.length ?? 0) >= 4, 'audit events missing')

  console.log(
    JSON.stringify(
      {
        status: 'completed',
        host,
        baseUrl,
        parishId,
        requestId,
        workflowStepId,
        staffEmail: email,
        activeParishCookieUsed: true,
        results,
      },
      null,
      2
    )
  )
} catch (error) {
  console.log(
    JSON.stringify(
      {
        status: 'failed',
        host,
        baseUrl,
        parishId,
        requestId,
        workflowStepId,
        staffEmail: email,
        activeParishCookieUsed: true,
        results,
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      },
      null,
      2
    )
  )
  process.exitCode = 1
}
