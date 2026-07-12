import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { sanitizeEvidenceError } from './sanitize-evidence-error.mjs'

const disposableRef = 'kikqtorplsswepqitjys'
const sharedQaRef = 'gnfomgsuottcuueasfvi'
const confirmationValue = 'NONPRODUCTION_RESTORE_APP_AUTH_SMOKE'

if (process.env.VINEA_NONPRODUCTION_RESTORE_APP_AUTH_SMOKE_CONFIRM !== confirmationValue) {
  throw new Error(
    `VINEA_NONPRODUCTION_RESTORE_APP_AUTH_SMOKE_CONFIRM=${confirmationValue} is required.`
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

const port = Number(process.env.VINEA_RESTORE_APP_AUTH_SMOKE_PORT || 3222)
if (!Number.isInteger(port) || port < 3000 || port > 65000) {
  throw new Error('VINEA_RESTORE_APP_AUTH_SMOKE_PORT must be an integer between 3000 and 65000.')
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

const marker = randomLabel('restore-app-auth-smoke')
const fixture = {
  authUserId: null,
  email: `${marker}@example.invalid`,
  password: crypto.randomBytes(18).toString('base64url'),
  parishAId: null,
  parishBId: null,
  parishionerId: null,
  requestId: null,
  workflowStepId: null,
}

let app = null
const cleanup = {
  authUserDeleted: false,
  syntheticRowsDeleted: false,
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

try {
  const createdUser = await admin.auth.admin.createUser({
    email: fixture.email,
    password: fixture.password,
    email_confirm: true,
    user_metadata: { purpose: 'vinea_restore_app_auth_smoke' },
  })
  if (createdUser.error || !createdUser.data.user?.id) {
    throw new Error(`synthetic auth user creation failed: ${createdUser.error?.message ?? 'no user'}`)
  }
  fixture.authUserId = createdUser.data.user.id

  const parishA = await insertSingle('parishes', {
    name: 'Restore Smoke Parish A',
    public_display_name: 'Restore Smoke Parish A',
    public_slug: `${marker}-a`,
    public_intake_enabled: false,
  })
  const parishB = await insertSingle('parishes', {
    name: 'Restore Smoke Parish B',
    public_display_name: 'Restore Smoke Parish B',
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
    full_name: 'Restore Smoke Family',
    email: 'restore-smoke-family@example.invalid',
  })
  fixture.parishionerId = parishioner.id

  const request = await insertSingle('requests', {
    parishioner_id: fixture.parishionerId,
    request_type: 'baptism',
    child_name: 'Restore Smoke Child',
    status: 'new',
  })
  fixture.requestId = request.id

  const step = await insertSingle('request_workflow_steps', {
    parish_id: fixture.parishAId,
    request_id: fixture.requestId,
    phase: 'Family documents',
    title: 'Upload family document',
    description: 'Please upload the requested family document.',
    owner_type: 'family',
    required: true,
    status: 'not_started',
    sort_order: 1,
  })
  fixture.workflowStepId = step.id

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

  const detailAccessRes = await staffRoute(
    `/api/requests/${fixture.requestId}/detail-access`,
    cookieA
  )
  const detailAccess = await parseJson(detailAccessRes)
  assert(
    detailAccessRes.status === 200 && detailAccess.json?.ok === true,
    'same-parish request detail access failed'
  )

  const detailPageRes = await staffRoute(`/dashboard/requests/${fixture.requestId}`, cookieA)
  const detailPageText = await detailPageRes.text()
  assert(
    detailPageRes.status === 200 &&
      !detailPageText.includes('Staff login') &&
      !detailPageText.includes('not authorized') &&
      !detailPageText.includes('Request not found'),
    `same-parish request detail page failed with status ${detailPageRes.status}`
  )

  const crossParishRes = await staffRoute(
    `/api/requests/${fixture.requestId}/detail-access`,
    cookieB
  )
  const crossParish = await parseJson(crossParishRes)
  assert(
    crossParishRes.status === 404 && crossParish.json?.ok === false,
    'cross-parish selected parish denial failed'
  )

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
    fixture.email,
  ]
  const unsafeMarkerFound = unsafeMarkers.find((marker) => familyPageText.includes(marker)) ?? null
  assert(
    familyPageRes.status === 200 &&
      familyPageText.includes('Upload documents') &&
      familyPageText.includes('Upload family document') &&
      !unsafeMarkerFound,
    'family portal safety failed'
  )

  await cleanupFixtures()

  console.log(
    JSON.stringify(
      {
        status: 'completed',
        target: {
          supabaseHost,
          appBaseUrl: baseUrl,
          approvedReusableDisposable: true,
          blockedSharedQa: false,
        },
        fixtures: {
          staff: 'temporary synthetic staff user',
          activeParish: 'temporary synthetic parish A',
          deniedParish: 'temporary synthetic parish B without membership',
          request: 'temporary synthetic baptism request',
          familyPortal: 'temporary family portal token used internally but not recorded',
        },
        checks: [
          { name: 'api_health', passed: true, status: health.status, schemaTrue: health.schemaTrue },
          { name: 'synthetic_staff_sign_in', passed: true },
          { name: 'selected_parish_same_parish_detail_access', passed: true, status: detailAccessRes.status },
          { name: 'selected_parish_request_detail_page', passed: true, status: detailPageRes.status },
          { name: 'selected_parish_cross_parish_denial', passed: true, status: crossParishRes.status },
          { name: 'family_portal_token_create_without_hash_exposure', passed: true, status: portalTokenRes.status },
          { name: 'family_portal_page_safety_without_storage', passed: true, status: familyPageRes.status },
        ],
        exclusions: {
          storageAccessed: false,
          signedUrlsCreated: false,
          googleCalendarTouched: false,
          externalIntegrationsCalled: false,
          rawExportsExposed: false,
          rawMetadataExposed: false,
          privateDocumentsAccessed: false,
          rawIdsPrinted: false,
          secretsPrinted: false,
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
