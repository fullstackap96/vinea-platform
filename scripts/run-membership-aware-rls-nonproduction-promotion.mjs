import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.NON_PRODUCTION_SUPABASE_DB_URL
const confirmation = process.env.VINEA_MEMBERSHIP_RLS_NONPRODUCTION_CONFIRM
const reusableDisposableProjectConfirmation = process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT

const confirmationValue = 'MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION'
const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'
const reusableDisposableProjectConfirmationValue = 'ALLOW_KIKQ_REUSE'
const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])

if (!databaseUrl) {
  throw new Error('NON_PRODUCTION_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_MEMBERSHIP_RLS_NONPRODUCTION_CONFIRM=${confirmationValue} is required.`
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
    'Refusing to run: database host must be a local non-production database or db.<project_ref>.supabase.co.'
  )
}

const { default: postgres } = await import('postgres')

const root = process.cwd()
const forwardPath = join(root, 'supabase', 'migrations', '20260626170000_membership_aware_operational_rls.sql')
const rollbackPath = join(root, 'docs', 'sql', 'membership_aware_operational_rls_rollback_draft.sql')

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

const operationalTables = [
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
  'request_documents',
  'funeral_request_details',
  'wedding_request_details',
  'ocia_request_details',
  'join_parish_request_details',
]

const requiredFoundationFunctions = [
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
    confirmationAccepted: true,
    requiredConfirmation: confirmationValue,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    reusableDisposableProjectRef,
    reusableDisposableProjectAllowed: isApprovedReusableDisposableProject,
    targetClass: isLocalDisposable ? 'local_nonproduction' : 'supabase_nonproduction',
    forwardPath: 'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
    rollbackPath: 'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    appliedToSupabaseMigrations: true,
  },
  preflight: {},
  baseline: {},
  forward: {},
  rollback: {},
  verification: {},
}

function policyRefCount(rows, patterns) {
  return rows.filter((row) => {
    const text = `${row.qual ?? ''}\n${row.with_check ?? ''}`.toLowerCase()
    return patterns.some((pattern) => text.includes(pattern))
  }).length
}

async function queryUnsafe(statement) {
  return await sql.unsafe(statement)
}

async function currentIdentity() {
  const rows = await sql`
    select current_database() as database_name,
           current_user as database_user,
           now() as captured_at
  `
  return rows[0]
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

async function policyRows() {
  return await sql`
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename in ${sql(operationalTables)}
    order by tablename, policyname
  `
}

async function staffRequestHelperExists() {
  const rows = await sql`
    select to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is not null as exists
  `
  return Boolean(rows[0]?.exists)
}

async function staffRequestHelperMissing() {
  const rows = await sql`
    select to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is null as missing
  `
  return Boolean(rows[0]?.missing)
}

function summarizePolicies(rows) {
  return {
    totalPolicies: rows.length,
    membershipRefCount: policyRefCount(rows, [
      'is_authorized_for_parish',
      'request_belongs_to_staff_parish',
    ]),
    primaryRefCount: policyRefCount(rows, [
      'primary_parish_id',
      'request_belongs_to_primary_parish',
    ]),
    tablesCovered: Array.from(new Set(rows.map((row) => row.tablename))).sort(),
    policyNames: rows.map((row) => `${row.tablename}.${row.policyname}`).sort(),
  }
}

try {
  evidence.preflight.identity = await currentIdentity()
  evidence.preflight.requiredFoundationFunctions = await functionRows(requiredFoundationFunctions)
  evidence.preflight.missingFoundationFunctions = requiredFoundationFunctions.filter(
    (name) => !evidence.preflight.requiredFoundationFunctions.some((row) => row.proname === name)
  )

  const baselinePolicies = await policyRows()
  evidence.baseline.policies = summarizePolicies(baselinePolicies)

  await queryUnsafe(readFileSync(forwardPath, 'utf8'))
  evidence.forward.applied = true
  evidence.forward.staffRequestHelperExists = await staffRequestHelperExists()
  const forwardPolicies = await policyRows()
  evidence.forward.policies = summarizePolicies(forwardPolicies)
  evidence.forward.primaryRefsCleared = evidence.forward.policies.primaryRefCount === 0

  await queryUnsafe(readFileSync(rollbackPath, 'utf8'))
  evidence.rollback.applied = true
  evidence.rollback.staffRequestHelperRemoved = await staffRequestHelperMissing()
  const rollbackPolicies = await policyRows()
  evidence.rollback.policies = summarizePolicies(rollbackPolicies)
  evidence.rollback.membershipRefsCleared = evidence.rollback.policies.membershipRefCount === 0

  evidence.verification.forwardPassed =
    evidence.forward.staffRequestHelperExists === true &&
    evidence.forward.policies.membershipRefCount > 0 &&
    evidence.forward.primaryRefsCleared === true

  evidence.verification.rollbackPassed =
    evidence.rollback.staffRequestHelperRemoved === true &&
    evidence.rollback.policies.primaryRefCount > 0 &&
    evidence.rollback.membershipRefsCleared === true

  evidence.status =
    evidence.preflight.missingFoundationFunctions.length === 0 &&
    evidence.verification.forwardPassed &&
    evidence.verification.rollbackPassed
      ? 'completed'
      : 'completed_with_validation_failures'
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
