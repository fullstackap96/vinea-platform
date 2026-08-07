import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL
const confirmation = process.env.VINEA_FUNCTION_PRIVILEGE_DISPOSABLE_CONFIRM
const reusableDisposableConfirmation = process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT

const confirmationValue = 'FUNCTION_PRIVILEGE_DISPOSABLE_VALIDATION'
const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'
const reusableDisposableConfirmationValue = 'ALLOW_KIKQ_REUSE'
const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_FUNCTION_PRIVILEGE_DISPOSABLE_CONFIRM=${confirmationValue} is required.`,
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const isApprovedReusableDisposable = host.includes(reusableDisposableProjectRef)
if (
  isApprovedReusableDisposable &&
  reusableDisposableConfirmation !== reusableDisposableConfirmationValue
) {
  throw new Error(
    `Refusing reusable disposable project ${reusableDisposableProjectRef} without VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=${reusableDisposableConfirmationValue}.`,
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
    'Refusing to run: target must be a local disposable database or db.<project_ref>.supabase.co.',
  )
}

const root = process.cwd()
const candidatePath = join(
  root,
  'docs',
  'sql',
  'shared_qa_function_privilege_hardening_candidate.sql',
)

if (!existsSync(candidatePath)) {
  throw new Error(`Missing function privilege candidate: ${candidatePath}`)
}

const candidate = readFileSync(candidatePath, 'utf8')
if (!candidate.includes('NON-APPLIED SECURITY CANDIDATE')) {
  throw new Error('Candidate is missing its non-applied safety marker.')
}

const beginMatches = candidate.match(/^\s*BEGIN;\s*$/gim) ?? []
const commitMatches = candidate.match(/^\s*COMMIT;\s*$/gim) ?? []
if (beginMatches.length !== 1 || commitMatches.length !== 1) {
  throw new Error('Candidate must contain exactly one BEGIN and one COMMIT wrapper.')
}

const candidateBody = candidate
  .replace(/^\s*BEGIN;\s*$/im, '')
  .replace(/^\s*COMMIT;\s*$/im, '')

const functionNames = [
  'check_public_intake_rate_limit',
  'create_request_workflow_steps_from_active_template',
  'current_staff_parish_ids',
  'current_staff_primary_parish_id',
  'household_members_before_write',
  'is_authorized_for_parish',
  'is_authorized_staff',
  'parishioners_set_parish_id_before_insert',
  'people_households_before_write',
  'primary_parish_id',
  'request_belongs_to_primary_parish',
  'request_belongs_to_staff_parish',
  'sacramental_record_events_after_write',
  'sacramental_records_before_write',
  'sync_parish_membership_from_staff_user',
  'vinea_validate_schedule_not_past',
  'workflow_templates_touch_updated_at',
]

const authenticatedFunctions = new Set([
  'current_staff_parish_ids',
  'current_staff_primary_parish_id',
  'is_authorized_for_parish',
  'is_authorized_staff',
  'primary_parish_id',
  'request_belongs_to_primary_parish',
  'request_belongs_to_staff_parish',
])

const serviceRpcFunctions = new Set([
  'check_public_intake_rate_limit',
  'create_request_workflow_steps_from_active_template',
])

const serviceRoleFunctions = new Set([
  ...serviceRpcFunctions,
  'current_staff_parish_ids',
  'is_authorized_for_parish',
])

const { default: postgres } = await import('postgres')
const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: isLocalDisposable ? false : 'require',
})

async function privilegeRows() {
  return await sql`
    select
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as identity_arguments,
      p.proconfig as function_config,
      has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
      has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
    from pg_catalog.pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ${sql(functionNames)}
    order by p.proname, pg_get_function_identity_arguments(p.oid)
  `
}

function summarize(rows) {
  return rows.map((row) => ({
    functionName: row.function_name,
    identityArguments: row.identity_arguments,
    functionConfig: row.function_config ?? [],
    anonExecute: Boolean(row.anon_execute),
    authenticatedExecute: Boolean(row.authenticated_execute),
    serviceRoleExecute: Boolean(row.service_role_execute),
  }))
}

function sameRows(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

const evidence = {
  status: 'started',
  startedAt: new Date().toISOString(),
  completedAt: null,
  targetClass: isLocalDisposable ? 'local_disposable' : 'supabase_disposable',
  host,
  safety: {
    confirmationAccepted: true,
    requiredConfirmation: confirmationValue,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    reusableDisposableAllowed: isApprovedReusableDisposable,
    candidatePath: 'docs/sql/shared_qa_function_privilege_hardening_candidate.sql',
    transactionRollbackRequired: true,
    sharedQaTouched: false,
    productionTouched: false,
  },
  baseline: {},
  candidate: {},
  rollback: {},
}

let transactionOpen = false

try {
  const baseline = summarize(await privilegeRows())
  evidence.baseline.functionCount = baseline.length
  evidence.baseline.allFunctionsPresent = baseline.length === functionNames.length

  await sql.unsafe('BEGIN')
  transactionOpen = true
  await sql.unsafe(candidateBody)

  const candidateRows = summarize(await privilegeRows())
  const scheduleFunction = candidateRows.find(
    (row) => row.functionName === 'vinea_validate_schedule_not_past',
  )

  evidence.candidate.functionCount = candidateRows.length
  evidence.candidate.allAnonRevoked = candidateRows.every((row) => !row.anonExecute)
  evidence.candidate.authenticatedSurfaceExact = candidateRows.every(
    (row) => row.authenticatedExecute === authenticatedFunctions.has(row.functionName),
  )
  evidence.candidate.serviceRpcSurfacePreserved = candidateRows
    .filter((row) => serviceRpcFunctions.has(row.functionName))
    .every((row) => row.serviceRoleExecute)
  evidence.candidate.serviceRoleSurfaceExact = candidateRows.every(
    (row) => row.serviceRoleExecute === serviceRoleFunctions.has(row.functionName),
  )
  evidence.candidate.scheduleSearchPathFixed =
    scheduleFunction?.functionConfig.some(
      (value) => value === 'search_path=' || value === 'search_path=""',
    ) === true

  await sql.unsafe('ROLLBACK')
  transactionOpen = false

  const restored = summarize(await privilegeRows())
  evidence.rollback.baselineRestored = sameRows(baseline, restored)

  const passed =
    evidence.baseline.allFunctionsPresent &&
    evidence.candidate.allAnonRevoked &&
    evidence.candidate.authenticatedSurfaceExact &&
    evidence.candidate.serviceRpcSurfacePreserved &&
    evidence.candidate.serviceRoleSurfaceExact &&
    evidence.candidate.scheduleSearchPathFixed &&
    evidence.rollback.baselineRestored

  evidence.status = passed ? 'completed' : 'completed_with_validation_failures'
  evidence.completedAt = new Date().toISOString()
  if (!passed) process.exitCode = 1
} catch (error) {
  if (transactionOpen) {
    await sql.unsafe('ROLLBACK').catch(() => {})
    transactionOpen = false
  }
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
