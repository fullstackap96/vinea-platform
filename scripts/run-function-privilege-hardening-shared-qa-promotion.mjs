import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.SHARED_QA_SUPABASE_DB_URL
const confirmation = process.env.VINEA_FUNCTION_PRIVILEGE_SHARED_QA_CONFIRM
const executeConfirmation = process.env.VINEA_FUNCTION_PRIVILEGE_SHARED_QA_EXECUTE

const confirmationValue = 'FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION'
const executeConfirmationValue = 'EXECUTE_FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION'
const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'
const approvedHost = `db.${sharedQaProjectRef}.supabase.co`
const hardBlockedProjectRefs = new Set([
  'kikqtorplsswepqitjys', // reusable disposable project
])
const candidateRelativePath =
  'docs/sql/shared_qa_function_privilege_hardening_candidate.sql'
const expectedCandidateSha256 =
  '82D84FF5C81B215330A49F51ED1DB7F7025D982FC2405DA83CD1736CA3622DF8'

const requiredMigrationVersions = [
  '20260625193000',
  '20260626170000',
  '20260630170000',
]

if (!databaseUrl) {
  throw new Error('SHARED_QA_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_FUNCTION_PRIVILEGE_SHARED_QA_CONFIRM=${confirmationValue} is required.`,
  )
}

if (executeConfirmation !== executeConfirmationValue) {
  throw new Error(
    `VINEA_FUNCTION_PRIVILEGE_SHARED_QA_EXECUTE=${executeConfirmationValue} is required.`,
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

if (host !== approvedHost) {
  throw new Error(
    `Refusing to run: database host must be the approved shared QA direct host ${approvedHost}.`,
  )
}

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const candidatePath = join(process.cwd(), ...candidateRelativePath.split('/'))
if (!existsSync(candidatePath)) {
  throw new Error(`Missing function privilege candidate: ${candidateRelativePath}`)
}

const candidate = readFileSync(candidatePath, 'utf8')
const candidateSha256 = createHash('sha256').update(candidate).digest('hex').toUpperCase()
if (candidateSha256 !== expectedCandidateSha256) {
  throw new Error('Function privilege candidate hash does not match the approved packet.')
}

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

const serviceRoleFunctions = new Set([
  'check_public_intake_rate_limit',
  'create_request_workflow_steps_from_active_template',
  'current_staff_parish_ids',
  'is_authorized_for_parish',
])

const { default: postgres } = await import('postgres')
const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
})

async function migrationVersions() {
  const rows = await sql`
    select version
    from supabase_migrations.schema_migrations
    where version in ${sql(requiredMigrationVersions)}
    order by version
  `
  return rows.map((row) => String(row.version))
}

async function privilegeRows() {
  return await sql`
    select
      p.proname as function_name,
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
    functionConfig: row.function_config ?? [],
    anonExecute: Boolean(row.anon_execute),
    authenticatedExecute: Boolean(row.authenticated_execute),
    serviceRoleExecute: Boolean(row.service_role_execute),
  }))
}

function verifyCandidate(rows) {
  const scheduleFunction = rows.find(
    (row) => row.functionName === 'vinea_validate_schedule_not_past',
  )

  return {
    functionCount: rows.length,
    allFunctionsPresent: rows.length === functionNames.length,
    allAnonRevoked: rows.every((row) => !row.anonExecute),
    authenticatedSurfaceExact: rows.every(
      (row) => row.authenticatedExecute === authenticatedFunctions.has(row.functionName),
    ),
    serviceRoleSurfaceExact: rows.every(
      (row) => row.serviceRoleExecute === serviceRoleFunctions.has(row.functionName),
    ),
    scheduleSearchPathFixed:
      scheduleFunction?.functionConfig.some(
        (value) => value === 'search_path=' || value === 'search_path=""',
      ) === true,
  }
}

function allChecksPass(result) {
  return (
    result.allFunctionsPresent &&
    result.allAnonRevoked &&
    result.authenticatedSurfaceExact &&
    result.serviceRoleSurfaceExact &&
    result.scheduleSearchPathFixed
  )
}

const evidence = {
  status: 'started',
  startedAt: new Date().toISOString(),
  completedAt: null,
  targetClass: 'shared_qa',
  targetLabel: 'approved shared QA project',
  safety: {
    confirmationAccepted: true,
    executeConfirmationAccepted: true,
    approvedProjectRef: sharedQaProjectRef,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    candidatePath: candidateRelativePath,
    candidateSha256,
    transactionRequired: true,
    migrationHistoryPrerequisiteRequired: true,
    parishDataRead: false,
    productionTouched: false,
  },
  preflight: {},
  apply: {},
  verification: {},
}

let transactionOpen = false

try {
  const trackedVersions = await migrationVersions()
  const missingVersions = requiredMigrationVersions.filter(
    (version) => !trackedVersions.includes(version),
  )
  const baseline = summarize(await privilegeRows())

  evidence.preflight.requiredMigrationVersions = requiredMigrationVersions
  evidence.preflight.trackedMigrationCount = trackedVersions.length
  evidence.preflight.missingMigrationVersions = missingVersions
  evidence.preflight.functionCount = baseline.length
  evidence.preflight.allFunctionsPresent = baseline.length === functionNames.length

  if (missingVersions.length > 0 || baseline.length !== functionNames.length) {
    evidence.status = 'blocked_by_preflight'
    process.exitCode = 1
  } else {
    await sql.unsafe('BEGIN')
    transactionOpen = true
    await sql.unsafe(candidateBody)

    const result = verifyCandidate(summarize(await privilegeRows()))
    evidence.verification = result

    if (!allChecksPass(result)) {
      await sql.unsafe('ROLLBACK')
      transactionOpen = false
      evidence.status = 'rolled_back_validation_failure'
      process.exitCode = 1
    } else {
      await sql.unsafe('COMMIT')
      transactionOpen = false
      evidence.apply.committed = true
      evidence.status = 'completed'
    }
  }
} catch (error) {
  if (transactionOpen) {
    await sql.unsafe('ROLLBACK').catch(() => {})
    transactionOpen = false
    evidence.apply.rolledBackAfterError = true
  }
  evidence.status = 'failed'
  evidence.error = {
    code: typeof error?.code === 'string' ? error.code : 'unclassified',
    message: 'Shared-QA function privilege promotion failed; inspect operator logs.',
  }
  process.exitCode = 1
} finally {
  evidence.completedAt = new Date().toISOString()
  await sql.end({ timeout: 5 }).catch(() => {})
  console.log(JSON.stringify(evidence, null, 2))
}
