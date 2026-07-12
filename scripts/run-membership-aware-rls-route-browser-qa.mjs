import { createClient } from '@supabase/supabase-js'

const disposableRef = 'kikqtorplsswepqitjys'
const sharedQaRef = 'gnfomgsuottcuueasfvi'
const confirmationValue = 'MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA'

const confirmation = process.env.VINEA_MEMBERSHIP_RLS_ROUTE_BROWSER_QA_CONFIRM
if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_MEMBERSHIP_RLS_ROUTE_BROWSER_QA_CONFIRM=${confirmationValue} is required.`
  )
}

const baseUrl = (process.env.VINEA_ROUTE_BROWSER_QA_BASE_URL || 'http://127.0.0.1:3211').trim()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DISPOSABLE_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.DISPOSABLE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error('Disposable Supabase app credentials are required.')
}

const host = new URL(supabaseUrl).host
if (host.includes(sharedQaRef)) {
  throw new Error(`Refusing shared QA project ${sharedQaRef}.`)
}
if (host !== `${disposableRef}.supabase.co`) {
  throw new Error(`Refusing non-disposable app host ${host}.`)
}

const qa = {
  email: process.env.VINEA_ROUTE_BROWSER_QA_EMAIL,
  password: process.env.VINEA_ROUTE_BROWSER_QA_PASSWORD,
  parishId: process.env.VINEA_ROUTE_BROWSER_QA_PARISH_ID,
  requestId: process.env.VINEA_ROUTE_BROWSER_QA_REQUEST_ID,
  workflowStepId: process.env.VINEA_ROUTE_BROWSER_QA_WORKFLOW_STEP_ID,
}

for (const [key, value] of Object.entries(qa)) {
  if (!value) throw new Error(`${key} is required for route/browser QA.`)
}

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function cookieHeaderForSession(session) {
  const name = `sb-${disposableRef}-auth-token`
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

  chunks.push(`vinea_active_parish_id=${qa.parishId}`)
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

const anon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const signIn = await anon.auth.signInWithPassword({
  email: qa.email,
  password: qa.password,
})
if (signIn.error || !signIn.data.session) {
  throw new Error(`signIn failed: ${signIn.error?.message ?? 'no session'}`)
}

const cookieHeader = cookieHeaderForSession(signIn.data.session)
const results = []

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

const detailAccessRes = await route(`/api/requests/${qa.requestId}/detail-access`)
const detailAccess = await parseJson(detailAccessRes)
results.push({
  check: 'request_detail_access_api',
  status: detailAccessRes.status,
  ok: detailAccess.json?.ok === true,
})
assert(detailAccessRes.status === 200 && detailAccess.json?.ok === true, 'detail access api failed')

const detailPageRes = await route(`/dashboard/requests/${qa.requestId}`)
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

const listBeforeRes = await route(`/api/requests/${qa.requestId}/documents`)
const listBefore = await parseJson(listBeforeRes)
results.push({
  check: 'staff_document_list_before_upload',
  status: listBeforeRes.status,
  ok: listBefore.json?.ok === true,
})
assert(listBeforeRes.status === 200 && listBefore.json?.ok === true, 'document list before upload failed')

const uploadForm = new FormData()
uploadForm.set('workflowStepId', qa.workflowStepId)
uploadForm.set('documentType', 'Birth certificate')
uploadForm.set(
  'file',
  new File([Buffer.from('Vinea disposable staff document QA')], 'staff-qa-document.txt', {
    type: 'text/plain',
  })
)
const uploadRes = await route(`/api/requests/${qa.requestId}/documents`, {
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

const signedRes = await route(`/api/requests/${qa.requestId}/documents/${staffDocumentId}`)
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
  bodyMatched: signedText.includes('Vinea disposable staff document QA'),
})
assert(
  signedFetch.status === 200 && signedText.includes('Vinea disposable staff document QA'),
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

const reviewRes = await route(`/api/requests/${qa.requestId}/documents/${staffDocumentId}`, {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'approved', reviewNote: 'Disposable QA approved' }),
})
const review = await parseJson(reviewRes)
results.push({
  check: 'staff_document_review',
  status: reviewRes.status,
  ok: review.json?.ok === true,
  statusValue: review.json?.document?.status ?? null,
})
assert(reviewRes.status === 200 && review.json?.ok === true, 'document review failed')

const tokenRes = await route(`/api/requests/${qa.requestId}/portal-token`, { method: 'POST' })
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
const unsafeMarkers = ['Route/browser QA private staff note', 'audit', 'AI notes', 'Internal Notes', 'token_hash']
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
familyForm.set('workflowStepId', qa.workflowStepId)
familyForm.set(
  'file',
  new File([Buffer.from('Vinea disposable family document QA')], 'family-qa-document.txt', {
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
  .eq('parish_id', qa.parishId)
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
      requestId: qa.requestId,
      results,
    },
    null,
    2
  )
)
