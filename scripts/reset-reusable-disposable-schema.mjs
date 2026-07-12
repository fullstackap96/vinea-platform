const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL
const resetConfirmation = process.env.VINEA_DISPOSABLE_RESET_CONFIRM
const reusableDisposableProjectConfirmation = process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT
const executeConfirmation = process.env.VINEA_DISPOSABLE_RESET_EXECUTE

const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])
const approvedReusableDisposableProjectRef = 'kikqtorplsswepqitjys'
const resetConfirmationValue = 'RESET_KIKQ_DISPOSABLE_SCHEMA'
const reusableDisposableProjectConfirmationValue = 'ALLOW_KIKQ_REUSE'
const executeConfirmationValue = 'EXECUTE_RESET'

const approvedTables = [
  'audit_events',
  'checklist_items',
  'funeral_request_details',
  'household_members',
  'households',
  'import_batches',
  'join_parish_request_details',
  'mass_intentions',
  'ocia_request_details',
  'parish_google_integrations',
  'parish_memberships',
  'parishes',
  'parishioners',
  'people',
  'rate_limit_buckets',
  'request_communications',
  'request_documents',
  'request_notes',
  'request_portal_tokens',
  'request_workflow_steps',
  'requests',
  'sacramental_record_events',
  'sacramental_records',
  'staff_users',
  'wedding_request_details',
  'workflow_template_steps',
  'workflow_templates',
]

const approvedFunctions = [
  'check_public_intake_rate_limit(text, integer, integer)',
  'current_staff_parish_ids()',
  'current_staff_primary_parish_id()',
  'household_members_before_write()',
  'is_authorized_for_parish(uuid)',
  'is_authorized_staff()',
  'parishioners_set_parish_id_before_insert()',
  'people_households_before_write()',
  'primary_parish_id()',
  'request_belongs_to_primary_parish(uuid)',
  'sacramental_record_events_after_write()',
  'sacramental_records_before_write()',
  'sync_parish_membership_from_staff_user()',
  'vinea_validate_schedule_not_past()',
  'workflow_templates_touch_updated_at()',
  'create_request_workflow_steps_from_active_template(uuid)',
]

const approvedTypes = ['sacramental_record_type']

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`
}

function publicName(identifier) {
  return `public.${quoteIdentifier(identifier)}`
}

const tableDropStatements = approvedTables.map(
  (table) => `DROP TABLE IF EXISTS ${publicName(table)} CASCADE;`
)
const functionDropStatements = approvedFunctions.map(
  (fn) => `DROP FUNCTION IF EXISTS public.${fn} CASCADE;`
)
const typeDropStatements = approvedTypes.map(
  (type) => `DROP TYPE IF EXISTS ${publicName(type)} CASCADE;`
)
const dropStatements = [...tableDropStatements, ...functionDropStatements, ...typeDropStatements]

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

if (resetConfirmation !== resetConfirmationValue) {
  throw new Error(
    `VINEA_DISPOSABLE_RESET_CONFIRM=${resetConfirmationValue} is required.`
  )
}

if (reusableDisposableProjectConfirmation !== reusableDisposableProjectConfirmationValue) {
  throw new Error(
    `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=${reusableDisposableProjectConfirmationValue} is required.`
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const expectedHost = `db.${approvedReusableDisposableProjectRef}.supabase.co`
if (host !== expectedHost) {
  throw new Error(
    `Refusing to run: reusable disposable reset is approved only for ${expectedHost}.`
  )
}

const executeReset = executeConfirmation === executeConfirmationValue
const { default: postgres } = await import('postgres')

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
})

async function tableRows() {
  return await sql`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ${sql(approvedTables)}
    order by tablename
  `
}

async function functionRows() {
  return await sql`
    select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as signature
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ${sql(approvedFunctions.map((fn) => fn.split('(')[0]))}
    order by signature
  `
}

async function typeRows() {
  return await sql`
    select typname
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname in ${sql(approvedTypes)}
    order by typname
  `
}

const evidence = {
  status: executeReset ? 'started' : 'dry_run',
  startedAt: new Date().toISOString(),
  completedAt: null,
  host,
  safety: {
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    approvedReusableDisposableProjectRef,
    resetConfirmationAccepted: true,
    reusableDisposableProjectAllowed: true,
    executeReset,
  },
  approvedScope: {
    tables: approvedTables,
    functions: approvedFunctions,
    types: approvedTypes,
  },
  statements: dropStatements,
  baseline: {},
  cleanup: {},
  verification: {},
}

try {
  const identity = await sql`
    select current_database() as database_name,
           current_user as database_user,
           now() as captured_at
  `
  evidence.baseline.identity = identity[0]
  evidence.baseline.tables = await tableRows()
  evidence.baseline.functions = await functionRows()
  evidence.baseline.types = await typeRows()

  if (executeReset) {
    for (const statement of dropStatements) {
      await sql.unsafe(statement)
    }
    evidence.cleanup.executedStatements = dropStatements.length
    evidence.verification.remainingTables = await tableRows()
    evidence.verification.remainingFunctions = await functionRows()
    evidence.verification.remainingTypes = await typeRows()
    evidence.status =
      evidence.verification.remainingTables.length === 0 &&
      evidence.verification.remainingFunctions.length === 0 &&
      evidence.verification.remainingTypes.length === 0
        ? 'completed'
        : 'completed_with_remaining_objects'
  }

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
