import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const confirmationValue = 'QA_PARISH_DISPLAY_NAME_CLEANUP'
const executeValue = 'EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP'
const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'
const root = process.cwd()
const envLocalPath = join(root, '.env.local')
const browserQaEnvPath = join(root, '.env.google-calendar-browser-qa.local')

const targetLabels = {
  QA_ACTIVE_PARISH_A_ID: 'Vinea QA Google Calendar Parish A',
  QA_ACTIVE_PARISH_B_ID: 'Vinea QA Google Calendar Parish B',
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[match[1]] = value.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }

  return out
}

function requireValue(values, name) {
  const value = String(values[name] ?? process.env[name] ?? '').trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function assertSafeFixtureId(name, value) {
  if (!value || value === 'NOT_AVAILABLE') {
    throw new Error(`${name} must be a real safe QA fixture id.`)
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${name} must be a UUID.`)
  }
}

function assertNonProductionAppUrl(value) {
  if (!value) return null
  const parsed = new URL(value)
  if (parsed.hostname === 'vinea.app' || parsed.hostname.endsWith('.vinea.app')) {
    throw new Error('Refusing production-looking app URL.')
  }
  return parsed.hostname
}

function summarizeName(value) {
  const text = String(value ?? '').trim()
  return {
    present: text.length > 0,
    length: text.length,
  }
}

async function selectRows(admin, ids) {
  const { data, error } = await admin
    .from('parishes')
    .select('id, name, public_display_name')
    .in('id', ids)
    .order('id')

  if (error) throw new Error(`Load QA parish fixtures failed: ${error.message}`)
  return data ?? []
}

async function updateParish(admin, id, label) {
  const { data, error } = await admin
    .from('parishes')
    .update({ name: label, public_display_name: label })
    .eq('id', id)
    .select('id, name, public_display_name')

  if (error) throw new Error(`Update QA parish fixture failed: ${error.message}`)
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error('Expected exactly one approved QA parish fixture row to be updated.')
  }
  return data[0]
}

function summarizeVerifiedRow(row, label) {
  const name = String(row?.name ?? '').trim()
  const publicDisplayName = String(row?.public_display_name ?? '').trim()

  return {
    idPresent: Boolean(row?.id),
    nameMatchesExpected: name === label,
    publicDisplayNameMatchesExpected: publicDisplayName === label,
    nameLength: name.length,
    publicDisplayNameLength: publicDisplayName.length,
  }
}

if (process.env.VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM !== confirmationValue) {
  throw new Error(
    `VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=${confirmationValue} is required.`
  )
}

const envLocal = parseEnvFile(envLocalPath)
const browserQaEnv = parseEnvFile(browserQaEnvPath)
const supabaseUrl = requireValue(envLocal, 'NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = requireValue(envLocal, 'SUPABASE_SERVICE_ROLE_KEY')
const parsedSupabaseUrl = new URL(supabaseUrl)

if (parsedSupabaseUrl.hostname !== `${sharedQaProjectRef}.supabase.co`) {
  throw new Error(`Refusing to clean QA parish names outside shared QA ${sharedQaProjectRef}.`)
}

const nonProductionAppHost = assertNonProductionAppUrl(
  String(browserQaEnv.NON_PRODUCTION_APP_URL ?? process.env.NON_PRODUCTION_APP_URL ?? '').trim()
)

const targetEntries = Object.entries(targetLabels).map(([envName, label]) => {
  const id = String(browserQaEnv[envName] ?? process.env[envName] ?? '').trim()
  assertSafeFixtureId(envName, id)
  return { envName, id, label }
})

const uniqueIds = new Set(targetEntries.map((entry) => entry.id))
if (uniqueIds.size !== targetEntries.length) {
  throw new Error('QA parish display-name cleanup requires distinct parish fixture ids.')
}

const execute = process.env.VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTE === executeValue
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const rows = await selectRows(
  admin,
  targetEntries.map((entry) => entry.id)
)

if (rows.length !== targetEntries.length) {
  throw new Error('Expected all approved QA parish fixture rows to exist before cleanup.')
}

const rowsById = new Map(rows.map((row) => [String(row.id), row]))
const changes = targetEntries.map((entry) => {
  const row = rowsById.get(entry.id)
  return {
    envName: entry.envName,
    idPresent: Boolean(row?.id),
    currentName: summarizeName(row?.name),
    currentPublicDisplayName: summarizeName(row?.public_display_name),
    nextLabel: entry.label,
  }
})

if (execute) {
  for (const entry of targetEntries) {
    await updateParish(admin, entry.id, entry.label)
  }
}

const postRows = execute
  ? await selectRows(
      admin,
      targetEntries.map((entry) => entry.id)
    )
  : []
const postRowsById = new Map(postRows.map((row) => [String(row.id), row]))
const postVerification = execute
  ? targetEntries.map((entry) => ({
      envName: entry.envName,
      ...summarizeVerifiedRow(postRowsById.get(entry.id), entry.label),
    }))
  : []

if (execute && postVerification.some((entry) => !entry.nameMatchesExpected || !entry.publicDisplayNameMatchesExpected)) {
  throw new Error('Post-update verification failed for one or more approved QA parish fixtures.')
}

console.log(
  JSON.stringify(
    {
      ok: true,
      target: {
        supabaseProjectRef: sharedQaProjectRef,
        appHost: nonProductionAppHost,
      },
      dryRun: !execute,
      execute,
      approvedColumns: ['name', 'public_display_name'],
      approvedFixtureVariables: Object.keys(targetLabels),
      changes,
      updatedApprovedFixtureRows: execute ? postVerification.length : 0,
      postVerification,
      secretsPrinted: false,
    },
    null,
    2
  )
)
