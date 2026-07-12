import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL
const confirmation = process.env.VINEA_MEMBERSHIP_RLS_MANUAL_QA_CONFIRM
const reusableDisposableProjectConfirmation =
  process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT

const confirmationValue = 'MEMBERSHIP_AWARE_RLS_MANUAL_QA'
const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'
const reusableDisposableProjectConfirmationValue = 'ALLOW_KIKQ_REUSE'
const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_MEMBERSHIP_RLS_MANUAL_QA_CONFIRM=${confirmationValue} is required.`
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const isApprovedReusableDisposableProject = host.includes(
  reusableDisposableProjectRef
)
if (
  isApprovedReusableDisposableProject &&
  reusableDisposableProjectConfirmation !== reusableDisposableProjectConfirmationValue
) {
  throw new Error(
    `Refusing to run against reusable disposable project ref ${reusableDisposableProjectRef} without VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=${reusableDisposableProjectConfirmationValue}.`
  )
}

const isLocalDisposable =
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '::1' ||
  host.endsWith('.localhost')
const isSupabaseHost = /^db\.[a-z0-9]{20}\.supabase\.co$/.test(host)

if (!isLocalDisposable && !isSupabaseHost) {
  throw new Error(
    'Refusing to run: database host must be a local disposable database or db.<project_ref>.supabase.co.'
  )
}

const { default: postgres } = await import('postgres')

const root = process.cwd()
const forwardPath = join(
  root,
  'docs',
  'sql',
  'membership_aware_operational_rls_migration_candidate.sql'
)
const rollbackPath = join(
  root,
  'docs',
  'sql',
  'membership_aware_operational_rls_rollback_draft.sql'
)

if (!existsSync(forwardPath)) {
  throw new Error(`Missing forward candidate: ${forwardPath}`)
}

if (!existsSync(rollbackPath)) {
  throw new Error(`Missing rollback draft: ${rollbackPath}`)
}

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: isLocalDisposable ? false : 'require',
})

const forwardSql = readFileSync(forwardPath, 'utf8')
const rollbackSql = readFileSync(rollbackPath, 'utf8')

const qaPrefix = 'Vinea RLS QA 2026-06-26'
const emails = {
  a: 'qa.staff.a@example.test',
  ab: 'qa.staff.ab@example.test',
  c: 'qa.staff.c@example.test',
}
const staff = [
  { key: 'a', email: emails.a, allowed: ['a'] },
  { key: 'ab', email: emails.ab, allowed: ['a', 'b'] },
  { key: 'c', email: emails.c, allowed: ['c'] },
]
const parishIds = {
  a: '11111111-1111-4111-8111-111111111111',
  b: '22222222-2222-4222-8222-222222222222',
  c: '33333333-3333-4333-8333-333333333333',
}
const requestIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
}
const parishionerIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
}
const peopleIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
}
const householdIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
}
const householdMemberIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc5',
}
const recordIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc6',
}
const massIntentionIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb7',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc7',
}
const noteIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc8',
}
const communicationIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb9',
  c: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc9',
}
const workflowStepIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb10',
  c: 'cccccccc-cccc-4ccc-8ccc-cccccccccc10',
}
const documentIds = {
  a: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11',
  b: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb11',
  c: 'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
}

const areas = new Set()
const cases = []
const failures = []
let forwardApplied = false
let rollbackApplied = false
let cleanupCompleted = false

const evidence = {
  status: 'started',
  startedAt: new Date().toISOString(),
  completedAt: null,
  host,
  safety: {
    confirmationAccepted: true,
    requiredConfirmation: confirmationValue,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    reusableDisposableProjectRef,
    reusableDisposableProjectAllowed: isApprovedReusableDisposableProject,
    targetClass: isLocalDisposable ? 'local_disposable' : 'supabase_disposable',
    forwardPath: 'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
    rollbackPath: 'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    appliedToSupabaseMigrations: false,
  },
  setup: {},
  cases,
  summary: {},
  rollback: {},
  cleanup: {},
}

function isAllowed(staffUser, parishKey) {
  return staffUser.allowed.includes(parishKey)
}

function recordCase(area, staffEmail, parishKey, operation, expected, actual, detail) {
  areas.add(area)
  const passed = actual === expected
  const entry = {
    area,
    staffEmail,
    parish: `QA Parish ${parishKey.toUpperCase()}`,
    operation,
    expected,
    actual,
    passed,
  }

  if (detail) {
    entry.detail = detail
  }

  cases.push(entry)

  if (!passed) {
    failures.push(entry)
  }
}

async function asStaff(staffUser, callback) {
  return await sql.begin(async (tx) => {
    await tx.unsafe('set local role authenticated')
    await tx`
      select set_config(
        'request.jwt.claims',
        ${JSON.stringify({
          email: staffUser.email,
          role: 'authenticated',
        })},
        true
      )
    `
    await tx`select set_config('request.jwt.claim.email', ${staffUser.email}, true)`
    await tx`select set_config('request.jwt.claim.role', 'authenticated', true)`
    return await callback(tx)
  })
}

async function staffQuery(staffUser, fn) {
  try {
    const rows = await asStaff(staffUser, fn)
    return { ok: true, rows: rows.length, error: null }
  } catch (error) {
    return {
      ok: false,
      rows: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function cleanupQaData(client) {
  await client`
    delete from public.request_documents
    where id in ${client(Object.values(documentIds))}
       or storage_path like 'membership-rls-manual-qa/%'
  `
  await client`
    delete from public.request_workflow_steps
    where id in ${client(Object.values(workflowStepIds))}
       or title like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.request_communications
    where id in ${client(Object.values(communicationIds))}
       or notes like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.request_notes
    where id in ${client(Object.values(noteIds))}
       or body like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.checklist_items
    where request_id in ${client(Object.values(requestIds))}
       or item_name like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.sacramental_records
    where id in ${client(Object.values(recordIds))}
       or person_name like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.mass_intentions
    where id in ${client(Object.values(massIntentionIds))}
       or requester_name like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.household_members
    where id in ${client(Object.values(householdMemberIds))}
       or parish_id in ${client(Object.values(parishIds))}
  `
  await client`
    delete from public.households
    where id in ${client(Object.values(householdIds))}
       or name like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.people
    where id in ${client(Object.values(peopleIds))}
       or first_name = 'VineaRlsQa'
  `
  await client`
    delete from public.requests
    where id in ${client(Object.values(requestIds))}
  `
  await client`
    delete from public.parishioners
    where id in ${client(Object.values(parishionerIds))}
       or full_name like ${`${qaPrefix}%`}
  `
  await client`
    delete from public.parish_memberships
    where email in ${client(Object.values(emails))}
       or parish_id in ${client(Object.values(parishIds))}
  `
  await client`
    delete from public.staff_users
    where email in ${client(Object.values(emails))}
       or parish_id in ${client(Object.values(parishIds))}
  `
  await client`
    delete from public.parishes
    where id in ${client(Object.values(parishIds))}
       or name like ${`${qaPrefix}%`}
  `
}

async function seedQaData() {
  await cleanupQaData(sql)
  await ensureDisposableLegacyRequestColumns()

  await sql`
    insert into public.parishes (id, name)
    values
      (${parishIds.a}, ${`${qaPrefix} Parish A`}),
      (${parishIds.b}, ${`${qaPrefix} Parish B`}),
      (${parishIds.c}, ${`${qaPrefix} Parish C`})
    on conflict (id) do update
    set name = excluded.name,
        updated_at = now()
  `

  await sql`
    insert into public.staff_users (parish_id, email, role, active)
    values
      (${parishIds.a}, ${emails.a}, 'admin', true),
      (${parishIds.a}, ${emails.ab}, 'admin', true),
      (${parishIds.b}, ${emails.ab}, 'admin', true),
      (${parishIds.c}, ${emails.c}, 'admin', true)
    on conflict (parish_id, email) do update
    set role = excluded.role,
        active = excluded.active,
        updated_at = now()
  `

  await sql`
    insert into public.parish_memberships (parish_id, email, role, active)
    values
      (${parishIds.a}, ${emails.a}, 'admin', true),
      (${parishIds.a}, ${emails.ab}, 'admin', true),
      (${parishIds.b}, ${emails.ab}, 'admin', true),
      (${parishIds.c}, ${emails.c}, 'admin', true)
    on conflict (parish_id, email) do update
    set role = excluded.role,
        active = excluded.active,
        updated_at = now()
  `

  for (const key of Object.keys(parishIds)) {
    await sql`
      insert into public.parishioners (id, parish_id, full_name, email, phone)
      values (
        ${parishionerIds[key]},
        ${parishIds[key]},
        ${`${qaPrefix} Parish ${key.toUpperCase()} Family`},
        ${`qa.family.${key}@example.test`},
        '555-0100'
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          full_name = excluded.full_name,
          email = excluded.email,
          phone = excluded.phone
    `

    await sql`
      insert into public.requests (
        id,
        parishioner_id,
        request_type,
        child_name,
        notes,
        status
      )
      values (
        ${requestIds[key]},
        ${parishionerIds[key]},
        'baptism',
        ${`${qaPrefix} Child ${key.toUpperCase()}`},
        ${`${qaPrefix} request ${key.toUpperCase()}`},
        'new'
      )
      on conflict (id) do update
      set parishioner_id = excluded.parishioner_id,
          request_type = excluded.request_type,
          child_name = excluded.child_name,
          notes = excluded.notes,
          status = excluded.status
    `

    await sql`
      insert into public.people (
        id,
        parish_id,
        first_name,
        last_name,
        email,
        notes
      )
      values (
        ${peopleIds[key]},
        ${parishIds[key]},
        'VineaRlsQa',
        ${`Person ${key.toUpperCase()}`},
        ${`qa.person.${key}@example.test`},
        ${`${qaPrefix} person seed`}
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          email = excluded.email,
          notes = excluded.notes
    `

    await sql`
      insert into public.households (
        id,
        parish_id,
        name,
        notes
      )
      values (
        ${householdIds[key]},
        ${parishIds[key]},
        ${`${qaPrefix} Household ${key.toUpperCase()}`},
        ${`${qaPrefix} household seed`}
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          name = excluded.name,
          notes = excluded.notes
    `

    await sql`
      insert into public.household_members (
        id,
        parish_id,
        household_id,
        person_id,
        relationship,
        is_primary_contact
      )
      values (
        ${householdMemberIds[key]},
        ${parishIds[key]},
        ${householdIds[key]},
        ${peopleIds[key]},
        'member',
        true
      )
      on conflict (household_id, person_id) do update
      set relationship = excluded.relationship,
          is_primary_contact = excluded.is_primary_contact
    `

    await sql`
      insert into public.sacramental_records (
        id,
        parish_id,
        request_id,
        person_id,
        record_type,
        person_name,
        place,
        notes
      )
      values (
        ${recordIds[key]},
        ${parishIds[key]},
        ${requestIds[key]},
        ${peopleIds[key]},
        'baptism',
        ${`${qaPrefix} Record ${key.toUpperCase()}`},
        'Disposable Parish',
        ${`${qaPrefix} record seed`}
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          request_id = excluded.request_id,
          person_id = excluded.person_id,
          record_type = excluded.record_type,
          person_name = excluded.person_name,
          place = excluded.place,
          notes = excluded.notes
    `

    await sql`
      insert into public.mass_intentions (
        id,
        parish_id,
        requester_name,
        intention_text,
        notes
      )
      values (
        ${massIntentionIds[key]},
        ${parishIds[key]},
        ${`${qaPrefix} Requester ${key.toUpperCase()}`},
        ${`${qaPrefix} intention ${key.toUpperCase()}`},
        ${`${qaPrefix} mass seed`}
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          requester_name = excluded.requester_name,
          intention_text = excluded.intention_text,
          notes = excluded.notes
    `

    await sql`
      insert into public.request_notes (id, request_id, body)
      values (
        ${noteIds[key]},
        ${requestIds[key]},
        ${`${qaPrefix} note ${key.toUpperCase()}`}
      )
      on conflict (id) do update
      set request_id = excluded.request_id,
          body = excluded.body
    `

    await sql`
      insert into public.request_communications (id, request_id, method, notes)
      values (
        ${communicationIds[key]},
        ${requestIds[key]},
        'email',
        ${`${qaPrefix} communication ${key.toUpperCase()}`}
      )
      on conflict (id) do update
      set request_id = excluded.request_id,
          method = excluded.method,
          notes = excluded.notes
    `

    await sql`
      insert into public.request_workflow_steps (
        id,
        parish_id,
        request_id,
        phase,
        title,
        owner_type,
        required,
        status,
        sort_order
      )
      values (
        ${workflowStepIds[key]},
        ${parishIds[key]},
        ${requestIds[key]},
        'QA',
        ${`${qaPrefix} Workflow Step ${key.toUpperCase()}`},
        'staff',
        true,
        'not_started',
        1
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          request_id = excluded.request_id,
          phase = excluded.phase,
          title = excluded.title,
          owner_type = excluded.owner_type,
          required = excluded.required,
          status = excluded.status,
          sort_order = excluded.sort_order
    `

    await sql`
      insert into public.request_documents (
        id,
        parish_id,
        request_id,
        workflow_step_id,
        storage_bucket,
        storage_path,
        document_type,
        original_filename,
        content_type,
        file_size_bytes,
        status
      )
      values (
        ${documentIds[key]},
        ${parishIds[key]},
        ${requestIds[key]},
        ${workflowStepIds[key]},
        'request-documents',
        ${`membership-rls-manual-qa/${key}/seed.pdf`},
        'qa',
        ${`${qaPrefix} ${key.toUpperCase()}.pdf`},
        'application/pdf',
        12,
        'pending_review'
      )
      on conflict (id) do update
      set parish_id = excluded.parish_id,
          request_id = excluded.request_id,
          workflow_step_id = excluded.workflow_step_id,
          storage_bucket = excluded.storage_bucket,
          storage_path = excluded.storage_path,
          document_type = excluded.document_type,
          original_filename = excluded.original_filename,
          content_type = excluded.content_type,
          file_size_bytes = excluded.file_size_bytes,
          status = excluded.status,
          reviewed_at = null,
          reviewed_by = null,
          reviewed_by_email = null
    `
  }
}

async function ensureDisposableLegacyRequestColumns() {
  const requiredColumns = [
    'suggested_date_1',
    'suggested_date_2',
    'suggested_date_3',
    'confirmed_baptism_date',
  ]
  const existing = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'requests'
      and column_name in ${sql(requiredColumns)}
    order by column_name
  `
  const existingNames = new Set(existing.map((row) => row.column_name))
  const missing = requiredColumns.filter((column) => !existingNames.has(column))

  if (missing.length > 0) {
    await sql`
      alter table public.requests
        add column if not exists suggested_date_1 timestamptz null,
        add column if not exists suggested_date_2 timestamptz null,
        add column if not exists suggested_date_3 timestamptz null,
        add column if not exists confirmed_baptism_date timestamptz null
    `
  }

  evidence.setup.legacyRequestScheduleColumns = {
    required: requiredColumns,
    addedIfMissing: missing,
  }
}

async function testPeople(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.people where id = ${peopleIds[parishKey]}
  `)
  recordCase('People', staffUser.email, parishKey, 'read', allowed, rows.ok && rows.rows === 1)

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.people
    set notes = ${`${qaPrefix} updated by ${staffUser.key}`}
    where id = ${peopleIds[parishKey]}
    returning id
  `)
  recordCase(
    'People',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.people (parish_id, first_name, last_name, notes)
    values (
      ${parishIds[parishKey]},
      'VineaRlsQa',
      ${`Inserted Person ${staffUser.key} ${parishKey}`},
      ${`${qaPrefix} inserted`}
    )
    returning id
  `)
  recordCase(
    'People',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testHouseholds(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.households where id = ${householdIds[parishKey]}
  `)
  recordCase('Households', staffUser.email, parishKey, 'read', allowed, rows.ok && rows.rows === 1)

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.households
    set notes = ${`${qaPrefix} updated by ${staffUser.key}`}
    where id = ${householdIds[parishKey]}
    returning id
  `)
  recordCase(
    'Households',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.households (parish_id, name, notes)
    values (
      ${parishIds[parishKey]},
      ${`${qaPrefix} Inserted Household ${staffUser.key} ${parishKey}`},
      ${`${qaPrefix} inserted`}
    )
    returning id
  `)
  recordCase(
    'Households',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testSacramentalRecords(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.sacramental_records where id = ${recordIds[parishKey]}
  `)
  recordCase(
    'Sacramental Records',
    staffUser.email,
    parishKey,
    'read',
    allowed,
    rows.ok && rows.rows === 1
  )

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.sacramental_records
    set notes = ${`${qaPrefix} updated by ${staffUser.key}`}
    where id = ${recordIds[parishKey]}
    returning id
  `)
  recordCase(
    'Sacramental Records',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.sacramental_records (
      parish_id,
      record_type,
      person_name,
      place,
      notes
    )
    values (
      ${parishIds[parishKey]},
      'baptism',
      ${`${qaPrefix} Inserted Record ${staffUser.key} ${parishKey}`},
      'Disposable Parish',
      ${`${qaPrefix} inserted`}
    )
    returning id
  `)
  recordCase(
    'Sacramental Records',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testMassIntentions(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.mass_intentions where id = ${massIntentionIds[parishKey]}
  `)
  recordCase(
    'Mass Intentions',
    staffUser.email,
    parishKey,
    'read',
    allowed,
    rows.ok && rows.rows === 1
  )

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.mass_intentions
    set notes = ${`${qaPrefix} updated by ${staffUser.key}`}
    where id = ${massIntentionIds[parishKey]}
    returning id
  `)
  recordCase(
    'Mass Intentions',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.mass_intentions (
      parish_id,
      requester_name,
      intention_text,
      notes
    )
    values (
      ${parishIds[parishKey]},
      ${`${qaPrefix} Inserted Requester ${staffUser.key} ${parishKey}`},
      ${`${qaPrefix} inserted intention`},
      ${`${qaPrefix} inserted`}
    )
    returning id
  `)
  recordCase(
    'Mass Intentions',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testRequests(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.requests where id = ${requestIds[parishKey]}
  `)
  recordCase('Requests', staffUser.email, parishKey, 'read', allowed, rows.ok && rows.rows === 1)

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.requests
    set notes = ${`${qaPrefix} updated by ${staffUser.key}`}
    where id = ${requestIds[parishKey]}
    returning id
  `)
  recordCase(
    'Requests',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )
}

async function testRequestNotes(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.request_notes where id = ${noteIds[parishKey]}
  `)
  recordCase(
    'Request Notes',
    staffUser.email,
    parishKey,
    'read',
    allowed,
    rows.ok && rows.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.request_notes (request_id, body)
    values (
      ${requestIds[parishKey]},
      ${`${qaPrefix} inserted note ${staffUser.key} ${parishKey}`}
    )
    returning id
  `)
  recordCase(
    'Request Notes',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testRequestCommunications(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.request_communications
    where id = ${communicationIds[parishKey]}
  `)
  recordCase(
    'Request Communications',
    staffUser.email,
    parishKey,
    'read',
    allowed,
    rows.ok && rows.rows === 1
  )

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.request_communications (request_id, method, notes)
    values (
      ${requestIds[parishKey]},
      'email',
      ${`${qaPrefix} inserted communication ${staffUser.key} ${parishKey}`}
    )
    returning id
  `)
  recordCase(
    'Request Communications',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )
}

async function testWorkflowSteps(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.request_workflow_steps
    where id = ${workflowStepIds[parishKey]}
  `)
  recordCase(
    'Workflow Steps',
    staffUser.email,
    parishKey,
    'read',
    allowed,
    rows.ok && rows.rows === 1
  )

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.request_workflow_steps
    set status = 'in_progress'
    where id = ${workflowStepIds[parishKey]}
    returning id
  `)
  recordCase(
    'Workflow Steps',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )
}

async function testDocuments(staffUser, parishKey, allowed) {
  const rows = await staffQuery(staffUser, (tx) => tx`
    select id from public.request_documents where id = ${documentIds[parishKey]}
  `)
  recordCase('Documents', staffUser.email, parishKey, 'read', allowed, rows.ok && rows.rows === 1)

  const inserted = await staffQuery(staffUser, (tx) => tx`
    insert into public.request_documents (
      parish_id,
      request_id,
      storage_bucket,
      storage_path,
      document_type,
      original_filename,
      content_type,
      file_size_bytes,
      status
    )
    values (
      ${parishIds[parishKey]},
      ${requestIds[parishKey]},
      'request-documents',
      ${`membership-rls-manual-qa/${staffUser.key}/${parishKey}/${Date.now()}.pdf`},
      'qa',
      ${`${qaPrefix} inserted document ${staffUser.key} ${parishKey}.pdf`},
      'application/pdf',
      12,
      'pending_review'
    )
    returning id
  `)
  recordCase(
    'Documents',
    staffUser.email,
    parishKey,
    'create',
    allowed,
    inserted.ok && inserted.rows === 1
  )

  const updated = await staffQuery(staffUser, (tx) => tx`
    update public.request_documents
    set status = 'approved',
        reviewed_by_email = ${staffUser.email},
        reviewed_at = now()
    where id = ${documentIds[parishKey]}
    returning id
  `)
  recordCase(
    'Documents',
    staffUser.email,
    parishKey,
    'update',
    allowed,
    updated.ok && updated.rows === 1
  )
}

async function runAreaCases() {
  for (const staffUser of staff) {
    for (const parishKey of Object.keys(parishIds)) {
      const allowed = isAllowed(staffUser, parishKey)
      await testPeople(staffUser, parishKey, allowed)
      await testHouseholds(staffUser, parishKey, allowed)
      await testSacramentalRecords(staffUser, parishKey, allowed)
      await testMassIntentions(staffUser, parishKey, allowed)
      await testRequests(staffUser, parishKey, allowed)
      await testRequestNotes(staffUser, parishKey, allowed)
      await testRequestCommunications(staffUser, parishKey, allowed)
      await testWorkflowSteps(staffUser, parishKey, allowed)
      await testDocuments(staffUser, parishKey, allowed)
    }
  }
}

async function summarizePolicyShape() {
  const rows = await sql`
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'parishioners',
        'people',
        'households',
        'household_members',
        'sacramental_records',
        'sacramental_record_events',
        'mass_intentions',
        'requests',
        'checklist_items',
        'request_communications',
        'request_notes',
        'request_workflow_steps',
        'request_documents'
      )
  `
  const text = rows
    .map((row) => `${row.qual ?? ''}\n${row.with_check ?? ''}`)
    .join('\n')
    .toLowerCase()

  return {
    policyCount: rows.length,
    membershipRefCount:
      (text.match(/is_authorized_for_parish/g) ?? []).length +
      (text.match(/request_belongs_to_staff_parish/g) ?? []).length,
    primaryRefCount:
      (text.match(/primary_parish_id/g) ?? []).length +
      (text.match(/request_belongs_to_primary_parish/g) ?? []).length,
  }
}

try {
  evidence.setup.identity = (
    await sql`
      select current_database() as database_name,
             current_user as database_user,
             now() as captured_at
    `
  )[0]

  await seedQaData()
  evidence.setup.seededParishes = 3
  evidence.setup.seededStaffIdentities = 3
  evidence.setup.seededOperationalParishRows = 3

  await sql.unsafe(forwardSql)
  forwardApplied = true
  evidence.forwardPolicyShape = await summarizePolicyShape()

  await runAreaCases()

  await sql.unsafe(rollbackSql)
  rollbackApplied = true
  evidence.rollback.policyShape = await summarizePolicyShape()
} catch (error) {
  evidence.error = {
    message: error instanceof Error ? error.message : String(error),
  }
  process.exitCode = 1
} finally {
  if (forwardApplied && !rollbackApplied) {
    try {
      await sql.unsafe(rollbackSql)
      rollbackApplied = true
    } catch (error) {
      evidence.rollback.error =
        error instanceof Error ? error.message : String(error)
      process.exitCode = 1
    }
  }

  evidence.rollback.applied = rollbackApplied

  try {
    await cleanupQaData(sql)
    cleanupCompleted = true
  } catch (error) {
    evidence.cleanup.error =
      error instanceof Error ? error.message : String(error)
    process.exitCode = 1
  }

  evidence.cleanup.completed = cleanupCompleted
  evidence.summary = {
    areasCovered: Array.from(areas).sort(),
    totalCases: cases.length,
    passedCases: cases.filter((entry) => entry.passed).length,
    failedCases: failures.length,
    failedCaseSummaries: failures.map((entry) => ({
      area: entry.area,
      staffEmail: entry.staffEmail,
      parish: entry.parish,
      operation: entry.operation,
      expected: entry.expected,
      actual: entry.actual,
    })),
  }
  evidence.status =
    process.exitCode || failures.length > 0 || !rollbackApplied || !cleanupCompleted
      ? 'completed_with_failures'
      : 'completed'
  evidence.completedAt = new Date().toISOString()

  await sql.end({ timeout: 5 }).catch(() => {})
  console.log(JSON.stringify(evidence, null, 2))
}
