import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL
const confirmation = process.env.VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM
const reusableDisposableProjectConfirmation = process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT

const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])
const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'
const reusableDisposableProjectConfirmationValue = 'ALLOW_KIKQ_REUSE'

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

if (confirmation !== 'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP') {
  throw new Error(
    'VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM=DISPOSABLE_BASE_SCHEMA_BOOTSTRAP is required.'
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const isApprovedReusableDisposableProject = host.includes(reusableDisposableProjectRef)
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
const bootstrapPath = join(root, 'docs', 'sql', 'disposable_base_schema_bootstrap_candidate.sql')
const migrationsDir = join(root, 'supabase', 'migrations')

if (!existsSync(bootstrapPath)) {
  throw new Error(`Missing bootstrap candidate: ${bootstrapPath}`)
}

if (!existsSync(migrationsDir)) {
  throw new Error(`Missing migrations directory: ${migrationsDir}`)
}

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b))

if (migrationFiles.length === 0) {
  throw new Error('No migration files found in supabase/migrations.')
}

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: isLocalDisposable ? false : 'require',
})

async function queryUnsafe(statement) {
  return await sql.unsafe(statement)
}

async function tableRows(names) {
  return await sql`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ${sql(names)}
    order by tablename
  `
}

async function functionRows(names) {
  return await sql`
    select proname
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in ${sql(names)}
    order by proname
  `
}

async function columnRows() {
  return await sql`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'parishioners',
        'requests',
        'checklist_items',
        'request_communications'
      )
    order by table_name, ordinal_position
  `
}

const requiredBaseTables = [
  'checklist_items',
  'parishioners',
  'request_communications',
  'requests',
]

const requiredPostMigrationTables = [
  'audit_events',
  'checklist_items',
  'parish_memberships',
  'parishes',
  'parishioners',
  'rate_limit_buckets',
  'request_communications',
  'request_documents',
  'request_portal_tokens',
  'request_workflow_steps',
  'requests',
  'staff_users',
  'workflow_templates',
]

const requiredFunctions = [
  'check_public_intake_rate_limit',
  'create_request_workflow_steps_from_active_template',
  'current_staff_parish_ids',
  'is_authorized_for_parish',
  'primary_parish_id',
  'request_belongs_to_primary_parish',
]

const startedAt = new Date().toISOString()
const evidence = {
  status: 'started',
  startedAt,
  completedAt: null,
  host,
  safety: {
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    reusableDisposableProjectRef,
    reusableDisposableProjectAllowed: isApprovedReusableDisposableProject,
    confirmationAccepted: true,
    targetClass: isLocalDisposable ? 'local_disposable' : 'supabase_disposable',
  },
  baseline: {},
  bootstrap: {},
  migrations: {
    appliedCount: 0,
    appliedFiles: [],
  },
  verification: {},
}

try {
  const identity = await sql`
    select current_database() as database_name,
           current_user as database_user,
           now() as captured_at
  `
  evidence.baseline.identity = identity[0]
  evidence.baseline.existingRelevantTables = await tableRows([
    ...requiredBaseTables,
    'parishes',
    'staff_users',
    'parish_memberships',
    'workflow_templates',
    'request_documents',
    'rate_limit_buckets',
  ])

  await queryUnsafe(readFileSync(bootstrapPath, 'utf8'))
  evidence.bootstrap.appliedPath = 'docs/sql/disposable_base_schema_bootstrap_candidate.sql'
  evidence.bootstrap.tables = await tableRows(requiredBaseTables)
  evidence.bootstrap.columns = await columnRows()

  for (const file of migrationFiles) {
    const sqlPath = join(migrationsDir, file)
    await queryUnsafe(readFileSync(sqlPath, 'utf8'))
    evidence.migrations.appliedFiles.push(file)
    evidence.migrations.appliedCount += 1
  }

  evidence.verification.requiredTables = await tableRows(requiredPostMigrationTables)
  evidence.verification.requiredFunctions = await functionRows(requiredFunctions)

  const foundTables = new Set(evidence.verification.requiredTables.map((row) => row.tablename))
  const foundFunctions = new Set(evidence.verification.requiredFunctions.map((row) => row.proname))

  evidence.verification.missingTables = requiredPostMigrationTables.filter(
    (table) => !foundTables.has(table)
  )
  evidence.verification.missingFunctions = requiredFunctions.filter(
    (functionName) => !foundFunctions.has(functionName)
  )

  evidence.status =
    evidence.verification.missingTables.length === 0 &&
    evidence.verification.missingFunctions.length === 0
      ? 'completed'
      : 'completed_with_missing_schema'
  evidence.completedAt = new Date().toISOString()
} catch (error) {
  evidence.status = 'failed'
  evidence.completedAt = new Date().toISOString()
  evidence.error = {
    message: error instanceof Error ? error.message : String(error),
  }
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 }).catch(() => {})
  console.log(JSON.stringify(evidence, null, 2))
}
