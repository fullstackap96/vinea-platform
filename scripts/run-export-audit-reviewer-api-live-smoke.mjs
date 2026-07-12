import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import { resolve } from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { sanitizeEvidenceError } from './sanitize-evidence-error.mjs'

const APPROVAL = 'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE'
const ACTIVE_PARISH_COOKIE = 'vinea_active_parish_id'
const APPROVED_SUPABASE_HOST = 'gnfomgsuottcuueasfvi.supabase.co'
const REVIEWER_FLAGS = {
  VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE: 'ENABLED',
  VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK: 'APPROVED_EXPORT_AUDIT_REVIEWER_QA',
  VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV: 'NON_PRODUCTION',
}

const approvedAuditActions = [
  'export.request_list_basic.downloaded',
  'export.request_list_basic.denied',
  'export.request_document_manifest.downloaded',
  'export.request_document_manifest.denied',
]

const filtersUnderSmoke = [
  null,
  'exports_downloaded_recent',
  'exports_denied_recent',
  'document_manifest_safety_review',
  'request_list_basic_safety_review',
]

const forbiddenMarkers = [
  'postgresql://',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'access_token',
  'refresh_token',
  'signed_url',
  'storage_path',
  'original_filename',
  'portal_token',
  'token_hash',
  'password',
  'file_contents',
  'internal_notes',
  'communications',
  'ai_prompt',
  'ai_output',
  'raw_csv',
  'raw export',
  'sacramental',
  'canonical',
]

function loadDotEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return

  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equals = trimmed.indexOf('=')
    if (equals <= 0) continue
    const key = trimmed.slice(0, equals).trim()
    let value = trimmed.slice(equals + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function requireEnv(name) {
  const value = String(process.env[name] ?? '').trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function validateApproval() {
  if (process.env.EXPORT_AUDIT_REVIEWER_API_LIVE_SMOKE_CONFIRM !== APPROVAL) {
    throw new Error(
      `Refusing to run without EXPORT_AUDIT_REVIEWER_API_LIVE_SMOKE_CONFIRM=${APPROVAL}`
    )
  }
}

function validateNonProductionTarget({ appUrl, supabaseUrl }) {
  const app = new URL(appUrl)
  const supabase = new URL(supabaseUrl)
  const appHost = app.hostname.toLowerCase()

  if (!['http:', 'https:'].includes(app.protocol)) {
    throw new Error('NON_PRODUCTION_APP_URL must use http or https.')
  }
  if (!['localhost', '127.0.0.1'].includes(appHost)) {
    throw new Error(`Refusing live smoke against non-local app host: ${app.hostname}`)
  }
  if (supabase.host !== APPROVED_SUPABASE_HOST) {
    throw new Error(`Refusing live smoke against unapproved Supabase host: ${supabase.host}`)
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    throw new Error('Refusing live smoke while the current process is marked production.')
  }
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms))
}

async function isPortFree(port) {
  return await new Promise((resolvePort) => {
    const server = net.createServer()
    server.once('error', () => resolvePort(false))
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolvePort(true))
    })
  })
}

async function waitForHealth(baseUrl) {
  const started = Date.now()
  let lastError = null
  while (Date.now() - started < 90000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' })
      if (response.ok) {
        const json = await response.json()
        return { status: response.status, schemaTrue: json?.checks?.schema === true }
      }
      lastError = new Error(`Health returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await delay(1000)
  }
  throw new Error(`Timed out waiting for local app health: ${lastError?.message ?? 'unknown'}`)
}

function childProcessEnv(envOverrides, baseUrl) {
  const safeEntries = Object.entries(process.env).filter(([key, value]) => {
    return key && !key.startsWith('=') && typeof value === 'string'
  })

  return {
    ...Object.fromEntries(safeEntries),
    ...envOverrides,
    NODE_ENV: 'development',
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_APP_URL: baseUrl,
  }
}

async function stopServer(child) {
  if (!child || child.killed) return
  if (process.platform === 'win32') {
    await new Promise((resolveStop) => {
      const killer = spawn(`taskkill.exe /pid ${child.pid} /T /F`, [], {
        shell: true,
        stdio: 'ignore',
      })
      killer.on('exit', () => resolveStop())
      killer.on('error', () => resolveStop())
    })
    return
  }
  child.kill('SIGTERM')
  await delay(1000)
}

async function startServer(port, envOverrides) {
  if (!(await isPortFree(port))) {
    throw new Error(`Refusing to run live smoke because local port ${port} is already in use.`)
  }

  const baseUrl = `http://127.0.0.1:${port}`
  const child = spawn(`npm.cmd run dev -- -p ${port}`, [], {
    cwd: process.cwd(),
    env: childProcessEnv(envOverrides, baseUrl),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true,
  })

  const output = []
  const capture = (chunk) => {
    const text = String(chunk ?? '')
    if (text) output.push(text.slice(-1000))
    if (output.length > 20) output.shift()
  }
  child.stdout.on('data', capture)
  child.stderr.on('data', capture)

  try {
    const health = await waitForHealth(baseUrl)
    return { child, baseUrl, health }
  } catch (error) {
    await stopServer(child)
    throw new Error(`${error.message}\nServer output tail:\n${output.join('')}`)
  }
}

function upsertCookie(cookies, cookie) {
  const next = cookies.filter((existing) => existing.name !== cookie.name)
  next.push({ name: cookie.name, value: cookie.value })
  return next
}

async function createAuthenticatedCookieHeader({ supabaseUrl, anonKey, email, password, activeParishId }) {
  let cookies = []
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookies
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookies = upsertCookie(cookies, cookie)
        }
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`QA staff sign-in failed: ${error.message}`)

  cookies = upsertCookie(cookies, { name: ACTIVE_PARISH_COOKIE, value: activeParishId })
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
}

function withForgedActiveParish(cookieHeader) {
  const forged = '11111111-1111-4111-8111-111111111111'
  const withoutActive = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !value.startsWith(`${ACTIVE_PARISH_COOKIE}=`))
  return [...withoutActive, `${ACTIVE_PARISH_COOKIE}=${forged}`].join('; ')
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, cache: 'no-store' })
  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()
  let json = null
  if (contentType.includes('application/json')) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }
  return { status: response.status, contentType, text, json }
}

async function discoverReviewerFixtures(admin, email) {
  const { data: memberships, error: membershipsError } = await admin
    .from('parish_memberships')
    .select('parish_id, active, role, parishes(id, name)')
    .eq('active', true)
    .ilike('email', email)

  if (membershipsError) throw membershipsError
  if (!memberships?.length) throw new Error('No active QA staff parish memberships found.')

  const candidates = []
  for (const membership of memberships) {
    const parishId = String(membership.parish_id ?? '')
    if (!parishId) continue

    const { count, error } = await admin
      .from('audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .in('action', approvedAuditActions)

    if (error) throw error
    candidates.push({
      parishId,
      parishNamePresent: Boolean(membership.parishes?.name),
      auditEventCount: count ?? 0,
    })
  }

  candidates.sort((a, b) => {
    if (b.auditEventCount !== a.auditEventCount) return b.auditEventCount - a.auditEventCount
    return a.parishId.localeCompare(b.parishId)
  })

  const selected = candidates[0]
  if (!selected) throw new Error('No usable reviewer QA parish candidates found.')

  return {
    activeParishId: selected.parishId,
    safeStaffMembershipsFound: candidates.length,
    selectedParishLabel: selected.parishNamePresent
      ? 'Derived active parish with display name'
      : 'Derived active parish',
    approvedAuditEventsFound: selected.auditEventCount,
  }
}

async function auditEventCountSince(admin, startIso) {
  const { count, error } = await admin
    .from('audit_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startIso)
    .in('action', approvedAuditActions)

  if (error) throw error
  return count ?? 0
}

function forbiddenMarkersIn(value) {
  const lowered = JSON.stringify(value ?? '').toLowerCase()
  return forbiddenMarkers.filter((marker) => lowered.includes(marker.toLowerCase()))
}

function responseSummary(response) {
  return {
    status: response.status,
    json: response.json
      ? {
          ok: response.json.ok,
          error: response.json.error ?? null,
          productionExports: response.json.prototype?.productionExports ?? null,
          scopeSource: response.json.scope?.source ?? null,
          selectedFilter: response.json.filters?.selected ?? null,
          rowCount: response.json.filters?.rowCount ?? null,
          availableFilterCount: Array.isArray(response.json.filters?.available)
            ? response.json.filters.available.length
            : null,
          severityCountBuckets: Array.isArray(response.json.filters?.severityCounts)
            ? response.json.filters.severityCounts.length
            : null,
        }
      : null,
    contentTypeJson: response.contentType.includes('application/json'),
    forbiddenMarkers: forbiddenMarkersIn(response.json ?? response.text),
  }
}

async function runSmoke() {
  loadDotEnvLocal()
  validateApproval()

  const configuredAppUrl = requireEnv('NON_PRODUCTION_APP_URL')
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = requireEnv('QA_STAFF_EMAIL')
  const password = requireEnv('QA_STAFF_PASSWORD')

  validateNonProductionTarget({ appUrl: configuredAppUrl, supabaseUrl })

  const configured = new URL(configuredAppUrl)
  const port = Number(configured.port || (configured.protocol === 'https:' ? 443 : 80))
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Could not determine local port from NON_PRODUCTION_APP_URL: ${configuredAppUrl}`)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const startedAt = new Date().toISOString()
  const fixtures = await discoverReviewerFixtures(admin, email)
  let flagOffServer = null
  let flagOnServer = null
  let rollbackServer = null

  const evidence = {
    evidenceRecordId: 'EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_20260701',
    environment: 'local non-production app backed by shared QA Supabase',
    appTargetLabel: 'localhost non-production',
    configuredAppUrlLabel: 'NON_PRODUCTION_APP_URL local target, value not printed',
    productionTouched: false,
    productionFlagsEnabled: false,
    dashboardUiAdded: false,
    migrationsApplied: false,
    operationalRlsChanged: false,
    googleCalendarTouched: false,
    recordsMutated: false,
    storageAccessed: false,
    signedUrlsCreated: false,
    rawExportsExposed: false,
    secretsPrinted: false,
    startedAt,
    reviewerFlagsUsed: Object.keys(REVIEWER_FLAGS),
    fixtureDiscovery: {
      safeStaffFixture: 'Existing non-production QA staff environment values, not printed',
      safeStaffMembershipsFound: fixtures.safeStaffMembershipsFound,
      safeActiveParishFixture: fixtures.selectedParishLabel,
      approvedAuditEventsFound: fixtures.approvedAuditEventsFound,
      downloadedRequestListFixture:
        'Prior non-production export drill event: export.request_list_basic.downloaded',
      deniedRequestListFixture:
        'Prior non-production export drill event: export.request_list_basic.denied',
      downloadedDocumentManifestFixture:
        'Prior non-production export drill event: export.request_document_manifest.downloaded',
      deniedDocumentManifestFixture:
        'Prior non-production export drill event: export.request_document_manifest.denied',
      crossParishDeniedFixture: 'forged_unauthorized_active_parish_cookie',
      familyOrUnauthenticatedDenialMethod: 'unauthenticated_direct_route_access',
      rollbackOwner: 'Codex local QA operator',
    },
  }

  try {
    flagOffServer = await startServer(port, {
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE: '',
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK: '',
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV: '',
    })
    const flagOff = await fetchJson(`${flagOffServer.baseUrl}/api/export-audit-reviewer`)
    evidence.flagOffBaseline = {
      health: flagOffServer.health,
      reviewerRoute: responseSummary(flagOff),
    }
    await stopServer(flagOffServer.child)
    flagOffServer = null

    flagOnServer = await startServer(port, REVIEWER_FLAGS)
    const cookieHeader = await createAuthenticatedCookieHeader({
      supabaseUrl,
      anonKey,
      email,
      password,
      activeParishId: fixtures.activeParishId,
    })

    const unauthenticated = await fetchJson(`${flagOnServer.baseUrl}/api/export-audit-reviewer`)
    const filterResponses = {}
    for (const filter of filtersUnderSmoke) {
      const suffix = filter ? `?filter=${encodeURIComponent(filter)}` : ''
      const response = await fetchJson(`${flagOnServer.baseUrl}/api/export-audit-reviewer${suffix}`, {
        headers: { cookie: cookieHeader },
      })
      filterResponses[filter ?? 'all'] = responseSummary(response)
    }
    const forged = await fetchJson(`${flagOnServer.baseUrl}/api/export-audit-reviewer`, {
      headers: { cookie: withForgedActiveParish(cookieHeader) },
    })
    const newAuditEventCount = await auditEventCountSince(admin, startedAt)

    evidence.flagOn = {
      health: flagOnServer.health,
      unauthenticated: responseSummary(unauthenticated),
      savedFilters: filterResponses,
      forgedActiveParish: responseSummary(forged),
      noNewExportDeliveryAuditEvents: newAuditEventCount === 0,
      newExportDeliveryAuditEventCount: newAuditEventCount,
      responseForbiddenMarkers: forbiddenMarkersIn(filterResponses),
      allResponsesJson: Object.values(filterResponses).every((summary) => summary.contentTypeJson),
    }
    await stopServer(flagOnServer.child)
    flagOnServer = null

    rollbackServer = await startServer(port, {
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE: '',
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK: '',
      VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV: '',
    })
    const rollback = await fetchJson(`${rollbackServer.baseUrl}/api/export-audit-reviewer`, {
      headers: { cookie: cookieHeader },
    })
    evidence.rollback = {
      health: rollbackServer.health,
      reviewerRoute: responseSummary(rollback),
      flagsDisabled: true,
    }
    await stopServer(rollbackServer.child)
    rollbackServer = null

    const allFilterStatusesPass = Object.values(evidence.flagOn.savedFilters).every(
      (summary) => summary.status === 200 && summary.json?.ok === true
    )
    const allFilterForbiddenMarkersEmpty = Object.values(evidence.flagOn.savedFilters).every(
      (summary) => summary.forbiddenMarkers.length === 0
    )

    evidence.completedAt = new Date().toISOString()
    evidence.finalOutcome =
      evidence.flagOffBaseline.health.schemaTrue &&
      evidence.flagOffBaseline.reviewerRoute.status === 404 &&
      evidence.flagOn.health.schemaTrue &&
      evidence.flagOn.unauthenticated.status === 401 &&
      allFilterStatusesPass &&
      allFilterForbiddenMarkersEmpty &&
      evidence.flagOn.forgedActiveParish.status === 403 &&
      evidence.flagOn.noNewExportDeliveryAuditEvents &&
      evidence.rollback.health.schemaTrue &&
      evidence.rollback.reviewerRoute.status === 404
        ? 'pass'
        : 'blocked'
    evidence.productionExportsRemainNoGo = true

    return evidence
  } finally {
    await stopServer(flagOffServer?.child)
    await stopServer(flagOnServer?.child)
    await stopServer(rollbackServer?.child)
  }
}

const outArgIndex = process.argv.indexOf('--out')
const outPath = outArgIndex >= 0 ? process.argv[outArgIndex + 1] : ''

runSmoke()
  .then((evidence) => {
    const sanitized = JSON.stringify(evidence, null, 2)
    if (outPath) writeFileSync(resolve(process.cwd(), outPath), `${sanitized}\n`)
    console.log(sanitized)
  })
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: sanitizeEvidenceError(error) }, null, 2))
    process.exitCode = 1
  })
