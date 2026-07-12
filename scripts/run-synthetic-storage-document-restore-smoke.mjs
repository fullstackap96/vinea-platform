import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { sanitizeEvidenceError } from './sanitize-evidence-error.mjs'

const disposableRef = 'kikqtorplsswepqitjys'
const sharedQaRef = 'gnfomgsuottcuueasfvi'
const confirmationValue = 'APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE'
const documentsBucket = 'request-documents'

if (process.env.VINEA_SYNTHETIC_STORAGE_RESTORE_SMOKE_CONFIRM !== confirmationValue) {
  throw new Error(
    `VINEA_SYNTHETIC_STORAGE_RESTORE_SMOKE_CONFIRM=${confirmationValue} is required.`
  )
}

const supabaseUrl = process.env.DISPOSABLE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey =
  process.env.DISPOSABLE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey =
  process.env.DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error('Disposable Supabase app credentials are required by variable name.')
}

const supabaseHost = new URL(supabaseUrl).host
if (supabaseHost.includes(sharedQaRef)) {
  throw new Error(`Refusing shared QA project ${sharedQaRef}.`)
}
if (supabaseHost !== `${disposableRef}.supabase.co`) {
  throw new Error(`Refusing non-disposable app host ${supabaseHost}.`)
}

const port = Number(process.env.VINEA_SYNTHETIC_STORAGE_RESTORE_SMOKE_PORT || 3223)
if (!Number.isInteger(port) || port < 3000 || port > 65000) {
  throw new Error(
    'VINEA_SYNTHETIC_STORAGE_RESTORE_SMOKE_PORT must be an integer between 3000 and 65000.'
  )
}
const baseUrl = `http://127.0.0.1:${port}`

const anon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function randomLabel(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
}

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function cookieHeaderForSession(session, parishId) {
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

  chunks.push(`vinea_active_parish_id=${parishId}`)
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

async function waitForHealth() {
  const started = Date.now()
  let lastError = null
  while (Date.now() - started < 90_000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' })
      const parsed = await parseJson(response)
      if (response.status === 200 && parsed.json?.ok === true) {
        return { status: response.status, schemaTrue: parsed.json?.checks?.schema === true }
      }
      lastError = new Error(`health status ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Timed out waiting for local app health: ${lastError?.message ?? 'unknown'}`)
}

function startApp(env) {
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }
  )

  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })

  return { child, output: () => output.slice(-2000) }
}

async function stopApp(child) {
  if (!child || child.killed) return
  if (process.platform === 'win32' && child.pid) {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      })
      killer.on('exit', resolve)
      killer.on('error', resolve)
    })
    return
  }
  child.kill('SIGTERM')
}

async function insertSingle(table, row, columns = '*') {
  const { data, error } = await admin.from(table).insert(row).select(columns).single()
  if (error) throw error
  return data
}

async function assertBucketExists() {
  const { data, error } = await admin.storage.listBuckets()
  if (error) throw error
  assert(
    (data ?? []).some((bucket) => bucket.id === documentsBucket && bucket.public === false),
    'private request documents storage bucket was not available'
  )
}

const marker = randomLabel('synthetic-storage-restore-smoke')
const fixture = {
  authUserId: null,
  email: `${marker}@example.invalid`,
  password: crypto.randomBytes(18).toString('base64url'),
  parishAId: null,
  parishBId: null,
  parishionerId: null,
  requestId: null,
  workflowStepId: null,
  documentId: null,
  storagePath: null,
}

let app = null
const cleanup = {
  authUserDeleted: false,
  syntheticRowsDeleted: false,
  syntheticStorageObjectDeleted: false,
  errors: [],
}

async function cleanupFixtures() {
  const safe = async (label, fn) => {
    try {
      await fn()
    } catch (error) {
      cleanup.errors.push(`${label}: ${error instanceof Error ? error.message : 'failed'}`)
    }
  }

  if (fixture.documentId) {
    await safe('request_documents', () =>
      admin.from('request_documents').delete().eq('id', fixture.documentId)
    )
  }
  if (fixture.storagePath) {
    await safe('storage object', async () => {
      const { error } = await admin.storage.from(documentsBucket).remove([fixture.storagePath])
      if (error) throw error
      cleanup.syntheticStorageObjectDeleted = true
    })
  }
  if (fixture.requestId) {
    await safe('request_portal_tokens', () =>
      admin.from('request_portal_tokens').delete().eq('request_id', fixture.requestId)
    )
    await safe('request_workflow_steps', () =>
      admin.from('request_workflow_steps').delete().eq('request_id', fixture.requestId)
    )
    await safe('requests', () => admin.from('requests').delete().eq('id', fixture.requestId))
  }
  if (fixture.parishAId || fixture.parishBId) {
    const parishIds = [fixture.parishAId, fixture.parishBId].filter(Boolean)
    await safe('audit_events', () => admin.from('audit_events').delete().in('parish_id', parishIds))
    await safe('parish_memberships', () =>
      admin.from('parish_memberships').delete().ilike('email', fixture.email)
    )
    await safe('staff_users', () => admin.from('staff_users').delete().ilike('email', fixture.email))
  }
  if (fixture.parishionerId) {
    await safe('parishioners', () =>
      admin.from('parishioners').delete().eq('id', fixture.parishionerId)
    )
  }
  if (fixture.parishAId || fixture.parishBId) {
    const parishIds = [fixture.parishAId, fixture.parishBId].filter(Boolean)
    await safe('parishes', () => admin.from('parishes').delete().in('id', parishIds))
  }
  if (fixture.authUserId) {
    await safe('auth user', async () => {
      const { error } = await admin.auth.admin.deleteUser(fixture.authUserId)
      if (error) throw error
      cleanup.authUserDeleted = true
    })
  }
  cleanup.syntheticRowsDeleted = cleanup.errors.length === 0
}

function assertSanitizedRoutePayload(parsed, rawText) {
  assert(parsed.json?.ok === true, 'document route did not return ok')
  assert(Array.isArray(parsed.json?.documents), 'document route did not return documents array')
  assert(parsed.json.documents.length >= 1, 'document route did not include synthetic document')
  assert(!rawText.includes('storage_path'), 'document route exposed storage_path field')
  assert(!rawText.includes('signedUrl'), 'document route exposed signedUrl field')
  assert(!rawText.includes('token_hash'), 'document route exposed token hash marker')
  assert(
    !fixture.storagePath || !rawText.includes(fixture.storagePath),
    'document route exposed synthetic storage path'
  )
}

try {
  await assertBucketExists()

  const createdUser = await admin.auth.admin.createUser({
    email: fixture.email,
    password: fixture.password,
    email_confirm: true,
    user_metadata: { purpose: 'vinea_synthetic_storage_document_restore_smoke' },
  })
  if (createdUser.error || !createdUser.data.user?.id) {
    throw new Error(`synthetic auth user creation failed: ${createdUser.error?.message ?? 'no user'}`)
  }
  fixture.authUserId = createdUser.data.user.id

  const parishA = await insertSingle('parishes', {
    name: 'Synthetic Storage Restore Parish A',
    public_display_name: 'Synthetic Storage Restore Parish A',
    public_slug: `${marker}-a`,
    public_intake_enabled: false,
  })
  const parishB = await insertSingle('parishes', {
    name: 'Synthetic Storage Restore Parish B',
    public_display_name: 'Synthetic Storage Restore Parish B',
    public_slug: `${marker}-b`,
    public_intake_enabled: false,
  })
  fixture.parishAId = parishA.id
  fixture.parishBId = parishB.id

  await insertSingle('staff_users', {
    parish_id: fixture.parishAId,
    email: fixture.email,
    role: 'admin',
    active: true,
  })
  const syncedMembership = await admin
    .from('parish_memberships')
    .update({
      user_id: fixture.authUserId,
      role: 'admin',
      active: true,
    })
    .eq('parish_id', fixture.parishAId)
    .ilike('email', fixture.email)
    .select('id')
  if (syncedMembership.error) throw syncedMembership.error
  if ((syncedMembership.data ?? []).length === 0) {
    await insertSingle('parish_memberships', {
      parish_id: fixture.parishAId,
      user_id: fixture.authUserId,
      email: fixture.email,
      role: 'admin',
      active: true,
    })
  }

  const parishioner = await insertSingle('parishioners', {
    parish_id: fixture.parishAId,
    full_name: 'Synthetic Storage Restore Family',
    email: 'synthetic-storage-restore-family@example.invalid',
  })
  fixture.parishionerId = parishioner.id

  const request = await insertSingle('requests', {
    parishioner_id: fixture.parishionerId,
    request_type: 'baptism',
    child_name: 'Synthetic Storage Restore Child',
    status: 'new',
  })
  fixture.requestId = request.id

  const step = await insertSingle('request_workflow_steps', {
    parish_id: fixture.parishAId,
    request_id: fixture.requestId,
    phase: 'Family documents',
    title: 'Synthetic restore smoke document request',
    description: 'Synthetic restore smoke document request.',
    owner_type: 'family',
    required: true,
    status: 'not_started',
    sort_order: 1,
  })
  fixture.workflowStepId = step.id

  fixture.storagePath = [fixture.parishAId, fixture.requestId, 'synthetic-restore-smoke.txt'].join(
    '/'
  )
  const { error: uploadError } = await admin.storage
    .from(documentsBucket)
    .upload(
      fixture.storagePath,
      Buffer.from('Synthetic restore smoke content. No parish data.', 'utf8'),
      { contentType: 'text/plain', upsert: false }
    )
  if (uploadError) throw uploadError

  const documentRow = await insertSingle(
    'request_documents',
    {
      parish_id: fixture.parishAId,
      request_id: fixture.requestId,
      workflow_step_id: fixture.workflowStepId,
      storage_bucket: documentsBucket,
      storage_path: fixture.storagePath,
      document_type: 'Synthetic restore smoke document',
      original_filename: 'synthetic-restore-smoke.txt',
      content_type: 'text/plain',
      file_size_bytes: 48,
      status: 'pending_review',
      uploaded_by: fixture.authUserId,
      uploaded_by_email: fixture.email,
    },
    'id'
  )
  fixture.documentId = documentRow.id

  app = startApp({
    ...process.env,
    NODE_ENV: 'development',
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    STAFF_ALLOWLIST_EMAILS: fixture.email,
    RESEND_API_KEY: '',
    RESEND_FROM_EMAIL: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    OPENAI_API_KEY: '',
  })

  const health = await waitForHealth()
  assert(health.schemaTrue === true, 'health check did not report schema true')

  const signIn = await anon.auth.signInWithPassword({
    email: fixture.email,
    password: fixture.password,
  })
  assert(!signIn.error && signIn.data.session, 'synthetic staff sign-in failed')

  const cookieA = cookieHeaderForSession(signIn.data.session, fixture.parishAId)
  const cookieB = cookieHeaderForSession(signIn.data.session, fixture.parishBId)

  async function staffRoute(path, cookieHeader, options = {}) {
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        cookie: cookieHeader,
        ...(options.headers ?? {}),
      },
    })
  }

  const staffDocumentsRes = await staffRoute(`/api/requests/${fixture.requestId}/documents`, cookieA)
  const staffDocuments = await parseJson(staffDocumentsRes)
  assert(staffDocumentsRes.status === 200, 'staff document route failed')
  assertSanitizedRoutePayload(staffDocuments, staffDocuments.text)

  const crossParishDocumentsRes = await staffRoute(
    `/api/requests/${fixture.requestId}/documents`,
    cookieB
  )
  const crossParishDocuments = await parseJson(crossParishDocumentsRes)
  assert(
    crossParishDocumentsRes.status === 404 && crossParishDocuments.json?.ok === false,
    'cross-parish document route denial failed'
  )

  const publicUrl = admin.storage.from(documentsBucket).getPublicUrl(fixture.storagePath).data.publicUrl
  const directStorageRes = await fetch(publicUrl, { cache: 'no-store' })
  assert(directStorageRes.status !== 200, 'direct anonymous storage access unexpectedly succeeded')

  const portalTokenRes = await staffRoute(`/api/requests/${fixture.requestId}/portal-token`, cookieA, {
    method: 'POST',
  })
  const portalToken = await parseJson(portalTokenRes)
  assert(
    portalTokenRes.status === 200 &&
      portalToken.json?.ok === true &&
      typeof portalToken.json?.url === 'string' &&
      !portalToken.text.includes('token_hash'),
    'family portal token creation failed or exposed token hash'
  )

  const familyPageRes = await fetch(portalToken.json.url)
  const familyPageText = await familyPageRes.text()
  const unsafeMarkers = [
    'Internal Notes',
    'AI notes',
    'audit',
    'token_hash',
    'signedUrl',
    'storage_path',
    'service_role',
    fixture.storagePath,
    fixture.email,
  ]
  const unsafeMarkerFound = unsafeMarkers.find((unsafe) => familyPageText.includes(unsafe)) ?? null
  assert(
    familyPageRes.status === 200 &&
      familyPageText.includes('Upload documents') &&
      familyPageText.includes('Synthetic restore smoke document request') &&
      !unsafeMarkerFound,
    'family portal document surface safety failed'
  )

  await cleanupFixtures()

  console.log(
    JSON.stringify(
      {
        status: 'completed',
        target: {
          supabaseHost: 'approved disposable Supabase host',
          appBaseUrl: baseUrl,
          approvedReusableDisposable: true,
          blockedSharedQa: false,
        },
        fixtures: {
          staff: 'temporary synthetic staff user',
          activeParish: 'temporary synthetic parish A',
          deniedParish: 'temporary synthetic parish B without membership',
          request: 'temporary synthetic baptism request',
          workflowStep: 'temporary synthetic family-facing workflow step',
          document: 'temporary synthetic document row',
          storageObject: 'temporary synthetic storage object',
          familyPortal: 'temporary family portal token used internally but not recorded',
        },
        checks: [
          { name: 'api_health', passed: true, status: health.status, schemaTrue: health.schemaTrue },
          { name: 'private_documents_bucket_available', passed: true },
          { name: 'synthetic_storage_object_uploaded', passed: true },
          { name: 'synthetic_request_document_row_created', passed: true },
          { name: 'staff_document_manifest_safe', passed: true, status: staffDocumentsRes.status },
          {
            name: 'cross_parish_staff_document_denial',
            passed: true,
            status: crossParishDocumentsRes.status,
          },
          {
            name: 'direct_anonymous_storage_denied',
            passed: true,
            status: directStorageRes.status,
          },
          {
            name: 'family_portal_token_create_without_hash_exposure',
            passed: true,
            status: portalTokenRes.status,
          },
          {
            name: 'family_portal_document_surface_safe',
            passed: true,
            status: familyPageRes.status,
          },
        ],
        exclusions: {
          productionAccessed: false,
          sharedQaAccessed: false,
          realPrivateDocumentsAccessed: false,
          signedUrlsCreated: false,
          signedUrlValuesPrinted: false,
          storagePathsPrinted: false,
          originalFilenamesPrinted: false,
          googleCalendarTouched: false,
          externalIntegrationsCalled: false,
          rawExportsExposed: false,
          rawMetadataExposed: false,
          rawIdsPrinted: false,
          secretsPrinted: false,
          operationalRlsChanged: false,
          migrationsApplied: false,
        },
        cleanup,
      },
      null,
      2
    )
  )
} catch (error) {
  await cleanupFixtures()
  console.error(JSON.stringify({ ok: false, error: sanitizeEvidenceError(error) }, null, 2))
  process.exitCode = 1
} finally {
  if (app) await stopApp(app.child)
}
