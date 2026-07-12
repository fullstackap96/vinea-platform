import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const confirmationValue = 'CREATE_GOOGLE_CALENDAR_SHARED_QA_FIXTURES'
const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'
const root = process.cwd()
const envLocalPath = join(root, '.env.local')
const browserQaEnvPath = join(root, '.env.google-calendar-browser-qa.local')

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

function formatEnvLine(name, value) {
  const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `${name}="${escaped}"`
}

function updateEnvFile(path, updates) {
  const existing = existsSync(path) ? readFileSync(path, 'utf8').split(/\r?\n/) : []
  const seen = new Set()
  const lines = existing
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=/)
      if (!match || !(match[1] in updates)) return line
      seen.add(match[1])
      return formatEnvLine(match[1], updates[match[1]])
    })

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) lines.push(formatEnvLine(key, value))
  }

  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}

function requireValue(values, name) {
  const value = String(values[name] ?? process.env[name] ?? '').trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

async function maybeSingleRequired(query, label) {
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(`${label} failed: ${error.message}`)
  return data
}

async function insertRequired(query, label) {
  const { data, error } = await query.select().single()
  if (error) throw new Error(`${label} failed: ${error.message}`)
  if (!data?.id) throw new Error(`${label} did not return an id.`)
  return data
}

async function ensureParish(admin, name) {
  const existing = await maybeSingleRequired(
    admin.from('parishes').select('id, name').eq('name', name),
    `Load parish ${name}`
  )
  if (existing?.id) return { id: existing.id, created: false }

  const created = await insertRequired(
    admin.from('parishes').insert({ name }),
    `Create parish ${name}`
  )
  return { id: created.id, created: true }
}

async function ensureStaff(admin, parishId, email) {
  const staffPayload = {
    parish_id: parishId,
    email,
    role: 'admin',
    active: true,
    updated_at: new Date().toISOString(),
  }
  const staff = await admin
    .from('staff_users')
    .upsert(staffPayload, { onConflict: 'parish_id,email' })
  if (staff.error) throw new Error(`Upsert staff_users failed: ${staff.error.message}`)

  const membershipPayload = {
    parish_id: parishId,
    email,
    role: 'admin',
    active: true,
    updated_at: new Date().toISOString(),
  }
  const membership = await admin
    .from('parish_memberships')
    .upsert(membershipPayload, { onConflict: 'parish_id,email' })
  if (membership.error) {
    throw new Error(`Upsert parish_memberships failed: ${membership.error.message}`)
  }
}

async function ensureParishioner(admin, parishId, marker, fullName) {
  const email = `${marker}@example.invalid`
  const existing = await maybeSingleRequired(
    admin
      .from('parishioners')
      .select('id')
      .eq('parish_id', parishId)
      .eq('email', email)
      .limit(1),
    `Load parishioner ${marker}`
  )
  if (existing?.id) return { id: existing.id, created: false }

  const created = await insertRequired(
    admin.from('parishioners').insert({
      parish_id: parishId,
      full_name: fullName,
      email,
      phone: '555-0100',
    }),
    `Create parishioner ${marker}`
  )
  return { id: created.id, created: true }
}

async function ensureRequest(admin, args) {
  const existing = await maybeSingleRequired(
    admin
      .from('requests')
      .select('id')
      .eq('parishioner_id', args.parishionerId)
      .ilike('notes', `%${args.marker}%`)
      .limit(1),
    `Load request ${args.marker}`
  )
  if (existing?.id) return { id: existing.id, created: false }

  const requestPayload = {
    parishioner_id: args.parishionerId,
    request_type: 'baptism',
    child_name: args.childName,
    preferred_dates: 'Synthetic Google Calendar QA fixture',
    confirmed_baptism_date: args.confirmedAt,
    status: 'new',
    notes: args.marker,
  }

  if (args.mismatchedCalendar) {
    requestPayload.google_calendar_event_id = 'vinea-qa-mismatched-event-id'
    requestPayload.google_calendar_id = 'vinea-qa-mismatched-calendar-id'
    requestPayload.google_calendar_event_html_link = 'https://calendar.google.com/calendar/event?eid=vinea-qa'
  }

  const created = await insertRequired(
    admin.from('requests').insert(requestPayload),
    `Create request ${args.marker}`
  )
  return { id: created.id, created: true }
}

const envLocal = parseEnvFile(envLocalPath)
const browserQaEnv = parseEnvFile(browserQaEnvPath)

if (process.env.VINEA_GOOGLE_CALENDAR_QA_FIXTURES_CONFIRM !== confirmationValue) {
  throw new Error(
    `VINEA_GOOGLE_CALENDAR_QA_FIXTURES_CONFIRM=${confirmationValue} is required.`
  )
}

const supabaseUrl = requireValue(envLocal, 'NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = requireValue(envLocal, 'SUPABASE_SERVICE_ROLE_KEY')
const staffEmail = requireValue(browserQaEnv, 'QA_STAFF_EMAIL').toLowerCase()

const parsedSupabaseUrl = new URL(supabaseUrl)
if (parsedSupabaseUrl.hostname !== `${sharedQaProjectRef}.supabase.co`) {
  throw new Error(`Refusing to create fixtures outside shared QA ${sharedQaProjectRef}.`)
}

const nonProductionAppUrl = requireValue(browserQaEnv, 'NON_PRODUCTION_APP_URL')
const parsedAppUrl = new URL(nonProductionAppUrl)
if (parsedAppUrl.hostname === 'vinea.app' || parsedAppUrl.hostname.endsWith('.vinea.app')) {
  throw new Error('Refusing to prepare browser QA fixtures for a production-looking app URL.')
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const parishA = await ensureParish(admin, 'Vinea QA Google Calendar Parish A')
const parishB = await ensureParish(admin, 'Vinea QA Google Calendar Parish B')

await ensureStaff(admin, parishA.id, staffEmail)
await ensureStaff(admin, parishB.id, staffEmail)

const parishionerA = await ensureParishioner(
  admin,
  parishA.id,
  'vinea-google-calendar-qa-a',
  'Vinea Google Calendar QA Family A'
)
const parishionerB = await ensureParishioner(
  admin,
  parishB.id,
  'vinea-google-calendar-qa-b',
  'Vinea Google Calendar QA Family B'
)
const parishionerMismatch = await ensureParishioner(
  admin,
  parishA.id,
  'vinea-google-calendar-qa-mismatch',
  'Vinea Google Calendar QA Mismatch Family'
)

const sameParishRequest = await ensureRequest(admin, {
  parishionerId: parishionerA.id,
  marker: 'VINEA_GOOGLE_CALENDAR_QA_SAME_PARISH',
  childName: 'Vinea QA Same Parish Child',
  confirmedAt: '2099-07-01T10:00:00.000Z',
})
const crossParishRequest = await ensureRequest(admin, {
  parishionerId: parishionerB.id,
  marker: 'VINEA_GOOGLE_CALENDAR_QA_CROSS_PARISH',
  childName: 'Vinea QA Cross Parish Child',
  confirmedAt: '2099-07-02T10:00:00.000Z',
})
const mismatchedRequest = await ensureRequest(admin, {
  parishionerId: parishionerMismatch.id,
  marker: 'VINEA_GOOGLE_CALENDAR_QA_MISMATCHED_CALENDAR',
  childName: 'Vinea QA Mismatched Calendar Child',
  confirmedAt: '2099-07-03T10:00:00.000Z',
  mismatchedCalendar: true,
})

updateEnvFile(browserQaEnvPath, {
  QA_ACTIVE_PARISH_A_ID: parishA.id,
  QA_ACTIVE_PARISH_B_ID: parishB.id,
  QA_GOOGLE_SAME_PARISH_REQUEST_ID: sameParishRequest.id,
  QA_GOOGLE_CROSS_PARISH_REQUEST_ID: crossParishRequest.id,
  QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID: mismatchedRequest.id,
})

const evidence = {
  ok: true,
  target: {
    supabaseProjectRef: sharedQaProjectRef,
    appHost: parsedAppUrl.hostname,
  },
  fixtures: {
    parishA: { present: true, created: parishA.created },
    parishB: { present: true, created: parishB.created },
    staffMemberships: { present: true, staffEmailHashRecorded: false },
    sameParishRequest: { present: true, created: sameParishRequest.created },
    crossParishRequest: { present: true, created: crossParishRequest.created },
    mismatchedCalendarRequest: { present: true, created: mismatchedRequest.created },
  },
  localQaEnvUpdated: true,
  secretsPrinted: false,
}

console.log(JSON.stringify(evidence, null, 2))
