import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import { resolve } from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { sanitizeEvidenceError } from './sanitize-evidence-error.mjs'

const APPROVAL = 'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL'
const ACTIVE_PARISH_COOKIE = 'vinea_active_parish_id'
const APPROVED_SUPABASE_HOST = 'gnfomgsuottcuueasfvi.supabase.co'
const RUNTIME_FLAGS = {
  VINEA_EXPORT_RUNTIME: 'ENABLED',
  VINEA_EXPORT_RUNTIME_ACK: 'APPROVED_EXPORT_RUNTIME_QA',
  VINEA_EXPORT_RUNTIME_ENV: 'NON_PRODUCTION',
}

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

function envOrUser(name) {
  return process.env[name] ?? ''
}

function requireEnv(name) {
  const value = envOrUser(name).trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function validateApproval() {
  if (process.env.VINEA_EXPORT_AUDIT_DRILL_CONFIRM !== APPROVAL) {
    throw new Error(`Refusing to run without VINEA_EXPORT_AUDIT_DRILL_CONFIRM=${APPROVAL}`)
  }
}

function validateNonProductionTarget(supabaseUrl) {
  const host = new URL(supabaseUrl).host
  if (host !== APPROVED_SUPABASE_HOST) {
    throw new Error(`Refusing to run against unapproved Supabase host: ${host}`)
  }
}

async function findFreePort() {
  return await new Promise((resolvePort, reject) => {
    const server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => {
        if (!address || typeof address === 'string') {
          reject(new Error('Could not allocate a local port.'))
          return
        }
        resolvePort(address.port)
      })
    })
    server.on('error', reject)
  })
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms))
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

function childProcessEnv(envOverrides) {
  const safeEntries = Object.entries(process.env).filter(([key, value]) => {
    return key && !key.startsWith('=') && typeof value === 'string'
  })

  return {
    ...Object.fromEntries(safeEntries),
    ...envOverrides,
    NODE_ENV: 'development',
    VERCEL_ENV: 'preview',
  }
}

async function startServer(envOverrides) {
  const port = await findFreePort()
  const baseUrl = `http://127.0.0.1:${port}`
  const child = spawn(`npm.cmd run dev -- -p ${port}`, [], {
    cwd: process.cwd(),
    env: childProcessEnv(envOverrides),
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

async function fetchJsonOrText(url, options = {}) {
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
  return {
    status: response.status,
    contentType,
    text,
    json,
  }
}

function csvSummary(text, expectedHeader) {
  const firstLine = text.split(/\r?\n/)[0] ?? ''
  const rowCountIncludingHeader = text.trim() ? text.split(/\r?\n/).length : 0
  const lowered = text.toLowerCase()
  return {
    contentTypeCsv: true,
    approvedHeader: firstLine === expectedHeader,
    rowCountIncludingHeader,
    forbiddenCsvMarkers: forbiddenMarkers.filter((marker) => lowered.includes(marker.toLowerCase())),
  }
}

async function discoverFixtures(admin, email) {
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

    const { data: parishioners, error: parishionersError } = await admin
      .from('parishioners')
      .select('id')
      .eq('parish_id', parishId)
      .limit(500)
    if (parishionersError) throw parishionersError

    const parishionerIds = (parishioners ?? []).map((row) => String(row.id)).filter(Boolean)
    let requestCount = 0
    let workflowStepCount = 0
    let documentCount = 0

    if (parishionerIds.length > 0) {
      const { data: requests, error: requestsError } = await admin
        .from('requests')
        .select('id')
        .in('parishioner_id', parishionerIds)
        .limit(500)
      if (requestsError) throw requestsError

      const requestIds = (requests ?? []).map((row) => String(row.id)).filter(Boolean)
      requestCount = requestIds.length
      if (requestIds.length > 0) {
        const { count: stepCount, error: stepError } = await admin
          .from('request_workflow_steps')
          .select('id', { count: 'exact', head: true })
          .eq('parish_id', parishId)
          .in('request_id', requestIds)
        if (stepError) throw stepError
        workflowStepCount = stepCount ?? 0

        const { count: docCount, error: docError } = await admin
          .from('request_documents')
          .select('id', { count: 'exact', head: true })
          .eq('parish_id', parishId)
          .in('request_id', requestIds)
        if (docError) throw docError
        documentCount = docCount ?? 0
      }
    }

    candidates.push({
      parishId,
      requestCount,
      workflowStepCount,
      documentCount,
      parishNamePresent: Boolean(membership.parishes?.name),
    })
  }

  candidates.sort((a, b) => {
    if (b.documentCount !== a.documentCount) return b.documentCount - a.documentCount
    if (b.requestCount !== a.requestCount) return b.requestCount - a.requestCount
    return a.parishId.localeCompare(b.parishId)
  })

  const selected = candidates.find((candidate) => candidate.requestCount > 0) ?? candidates[0]
  if (!selected) throw new Error('No usable QA parish fixture candidates found.')

  return {
    safeStaffMembershipsFound: candidates.length,
    selectedParishLabel: selected.parishNamePresent ? 'Derived active parish with display name' : 'Derived active parish',
    activeParishId: selected.parishId,
    sameParishRequestsFound: selected.requestCount,
    sameParishWorkflowStepsFound: selected.workflowStepCount,
    sameParishDocumentsFound: selected.documentCount,
    documentFixtureSource:
      selected.documentCount > 0
        ? 'derived_from_same_parish_request_documents'
        : 'no_documents_available_in_selected_parish_fixture',
  }
}

async function auditSummary(admin, startIso) {
  const { data, error } = await admin
    .from('audit_events')
    .select('action, target_type, target_id, metadata, created_at')
    .gte('created_at', startIso)
    .in('action', [
      'export.request_list_basic.downloaded',
      'export.request_document_manifest.downloaded',
      'export.request_list_basic.denied',
      'export.request_document_manifest.denied',
    ])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const rows = data ?? []
  const downloaded = rows.filter((row) => String(row.action ?? '').endsWith('.downloaded'))
  const denied = rows.filter((row) => String(row.action ?? '').endsWith('.denied'))
  const metadataText = JSON.stringify(rows.map((row) => row.metadata ?? {})).toLowerCase()
  return {
    eventCount: rows.length,
    downloadedEvents: downloaded.length,
    deniedEvents: denied.length,
    latestActions: Array.from(new Set(rows.map((row) => String(row.action ?? '')).filter(Boolean))).slice(0, 4),
    latestTargetIds: Array.from(new Set(rows.map((row) => String(row.target_id ?? '')).filter(Boolean))).slice(0, 4),
    hasRuntimeGateState: metadataText.includes('enabled_non_production'),
    routeIdPresent:
      metadataText.includes('app/api/exports/requests/basic') &&
      metadataText.includes('app/api/exports/requests/documents/manifest'),
    exportPresetIdPresent:
      metadataText.includes('request_list_basic') &&
      metadataText.includes('request_document_manifest'),
    forbiddenMetadataMarkers: forbiddenMarkers.filter((marker) =>
      metadataText.includes(marker.toLowerCase())
    ),
  }
}

async function runDrill() {
  loadDotEnvLocal()
  validateApproval()

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = requireEnv('QA_STAFF_EMAIL')
  const password = requireEnv('QA_STAFF_PASSWORD')
  validateNonProductionTarget(supabaseUrl)

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const startedAt = new Date().toISOString()
  const fixtures = await discoverFixtures(admin, email)
  let flagOffServer = null
  let flagOnServer = null
  let rollbackServer = null
  const evidence = {
    evidenceRecordId: 'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_20260630',
    environment: 'local non-production app backed by shared QA Supabase',
    productionTouched: false,
    productionFlagsEnabled: false,
    productionUiAdded: false,
    migrationsApplied: false,
    operationalRlsChanged: false,
    googleCalendarTouched: false,
    recordsMutatedBeyondAuditMetadata: false,
    secretsPrinted: false,
    startedAt,
    runtimeFlagsUsed: Object.keys(RUNTIME_FLAGS),
    fixtureDiscovery: {
      safeStaffFixture: 'Existing non-production QA staff environment values, not printed',
      safeStaffMembershipsFound: fixtures.safeStaffMembershipsFound,
      safeActiveParishFixture: fixtures.selectedParishLabel,
      sameParishRequestFixture: 'derived_from_staff_membership',
      sameParishRequestsFound: fixtures.sameParishRequestsFound,
      sameParishWorkflowStepsFound: fixtures.sameParishWorkflowStepsFound,
      sameParishDocumentsFound: fixtures.sameParishDocumentsFound,
      documentFixtureSource: fixtures.documentFixtureSource,
      crossParishDeniedFixture: 'forged_unauthorized_active_parish_cookie',
      familyOrUnauthenticatedDenialMethod: 'unauthenticated_direct_route_access',
    },
  }

  try {
    flagOffServer = await startServer({
      VINEA_EXPORT_RUNTIME: '',
      VINEA_EXPORT_RUNTIME_ACK: '',
      VINEA_EXPORT_RUNTIME_ENV: '',
    })
    evidence.flagOffBaseline = {
      health: flagOffServer.health,
      requestList: await fetchJsonOrText(`${flagOffServer.baseUrl}/api/exports/requests/basic`),
      documentManifest: await fetchJsonOrText(
        `${flagOffServer.baseUrl}/api/exports/requests/documents/manifest`
      ),
    }
    await stopServer(flagOffServer.child)
    flagOffServer = null

    flagOnServer = await startServer(RUNTIME_FLAGS)
    const cookieHeader = await createAuthenticatedCookieHeader({
      supabaseUrl,
      anonKey,
      email,
      password,
      activeParishId: fixtures.activeParishId,
    })
    const forgedCookieHeader = withForgedActiveParish(cookieHeader)

    const unauthBasic = await fetchJsonOrText(`${flagOnServer.baseUrl}/api/exports/requests/basic`)
    const unauthManifest = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/documents/manifest`
    )
    const basic = await fetchJsonOrText(`${flagOnServer.baseUrl}/api/exports/requests/basic`, {
      headers: { cookie: cookieHeader },
    })
    const manifest = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/documents/manifest`,
      { headers: { cookie: cookieHeader } }
    )
    const blockedBasic = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/basic?fields=request_reference,access_token`,
      { headers: { cookie: cookieHeader } }
    )
    const blockedSignedUrl = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/documents/manifest?fields=request_reference,signed_url`,
      { headers: { cookie: cookieHeader } }
    )
    const blockedStoragePath = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/documents/manifest?fields=request_reference,storage_path`,
      { headers: { cookie: cookieHeader } }
    )
    const forgedBasic = await fetchJsonOrText(`${flagOnServer.baseUrl}/api/exports/requests/basic`, {
      headers: { cookie: forgedCookieHeader },
    })
    const forgedManifest = await fetchJsonOrText(
      `${flagOnServer.baseUrl}/api/exports/requests/documents/manifest`,
      { headers: { cookie: forgedCookieHeader } }
    )

    const auditAfterFlagOn = await auditSummary(admin, startedAt)

    evidence.flagOn = {
      health: flagOnServer.health,
      unauthenticated: {
        requestListStatus: unauthBasic.status,
        documentManifestStatus: unauthManifest.status,
      },
      requestListBasic: {
        status: basic.status,
        contentTypeCsv: basic.contentType.includes('text/csv'),
        ...csvSummary(
          basic.text,
          'request_reference,request_type,request_status,workflow_phase,assigned_staff,follow_up_date,created_date,updated_date,required_steps_incomplete,optional_steps_incomplete'
        ),
      },
      requestDocumentManifest: {
        status: manifest.status,
        contentTypeCsv: manifest.contentType.includes('text/csv'),
        ...csvSummary(
          manifest.text,
          'request_reference,request_type,request_status,workflow_phase,workflow_step_title,workflow_step_required,document_label,document_status,submitted_date,reviewed_date,reviewer_display,missing_received'
        ),
      },
      deniedCases: {
        blockedFieldStatus: blockedBasic.status,
        blockedSignedUrlFieldStatus: blockedSignedUrl.status,
        blockedStoragePathFieldStatus: blockedStoragePath.status,
        forgedCookieRequestListStatus: forgedBasic.status,
        forgedCookieDocumentManifestStatus: forgedManifest.status,
        familyOrUnauthenticatedRequestListStatus: unauthBasic.status,
        familyOrUnauthenticatedDocumentManifestStatus: unauthManifest.status,
      },
      audit: auditAfterFlagOn,
    }

    await stopServer(flagOnServer.child)
    flagOnServer = null

    const rollbackStartedAt = new Date().toISOString()
    rollbackServer = await startServer({
      VINEA_EXPORT_RUNTIME: '',
      VINEA_EXPORT_RUNTIME_ACK: '',
      VINEA_EXPORT_RUNTIME_ENV: '',
    })
    const rollbackBasic = await fetchJsonOrText(`${rollbackServer.baseUrl}/api/exports/requests/basic`, {
      headers: { cookie: cookieHeader },
    })
    const rollbackManifest = await fetchJsonOrText(
      `${rollbackServer.baseUrl}/api/exports/requests/documents/manifest`,
      { headers: { cookie: cookieHeader } }
    )
    const postRollbackAudit = await auditSummary(admin, rollbackStartedAt)
    evidence.rollback = {
      health: rollbackServer.health,
      requestListStatus: rollbackBasic.status,
      requestListError: rollbackBasic.json?.error ?? null,
      documentManifestStatus: rollbackManifest.status,
      documentManifestError: rollbackManifest.json?.error ?? null,
      postRollbackDownloadedEvents: postRollbackAudit.downloadedEvents,
      postRollbackDeniedEvents: postRollbackAudit.deniedEvents,
      flagsDisabled: true,
    }
    await stopServer(rollbackServer.child)
    rollbackServer = null

    evidence.completedAt = new Date().toISOString()
    evidence.finalOutcome =
      auditAfterFlagOn.downloadedEvents >= 2 &&
      auditAfterFlagOn.deniedEvents >= 6 &&
      auditAfterFlagOn.forbiddenMetadataMarkers.length === 0 &&
      postRollbackAudit.downloadedEvents === 0 &&
      postRollbackAudit.deniedEvents === 0
        ? 'pass'
        : 'blocked'
    evidence.followUp =
      auditAfterFlagOn.deniedEvents >= 6
        ? 'Denied export audit events were present for blocked-field, forged active-parish, and unauthenticated/family-substitute denial paths.'
        : 'Denied export audit events were missing or incomplete for one or more denial paths.'
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

runDrill()
  .then((evidence) => {
    const sanitized = JSON.stringify(evidence, null, 2)
    if (outPath) {
      writeFileSync(resolve(process.cwd(), outPath), `${sanitized}\n`)
    }
    console.log(sanitized)
  })
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: sanitizeEvidenceError(error) }, null, 2))
    process.exitCode = 1
  })
