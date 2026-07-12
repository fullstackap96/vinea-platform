import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.SHARED_QA_SUPABASE_DB_URL
const confirmation = process.env.VINEA_MEMBERSHIP_RLS_SHARED_QA_CONFIRM

const confirmationValue = 'MEMBERSHIP_AWARE_RLS_SHARED_QA_PROMOTION'
const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'
const hardBlockedProjectRefs = new Set([
  'kikqtorplsswepqitjys', // reusable disposable project
])

if (!databaseUrl) {
  throw new Error('SHARED_QA_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(
    `VINEA_MEMBERSHIP_RLS_SHARED_QA_CONFIRM=${confirmationValue} is required.`
  )
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

if (!host.includes(sharedQaProjectRef)) {
  throw new Error(`Refusing to run: target host is not approved shared QA project ref ${sharedQaProjectRef}.`)
}

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

const isApprovedSharedQaHost = /^db\.gnfomgsuottcuueasfvi\.supabase\.co$/.test(host)

if (!isApprovedSharedQaHost) {
  throw new Error('Refusing to run: database host must be the approved shared QA direct database host.')
}

const { default: postgres } = await import('postgres')

const root = process.cwd()
const forwardPath = join(root, 'supabase', 'migrations', '20260626170000_membership_aware_operational_rls.sql')
const rollbackPath = join(root, 'docs', 'sql', 'membership_aware_operational_rls_rollback_draft.sql')

if (!existsSync(forwardPath)) {
  throw new Error(`Missing forward migration: ${forwardPath}`)
}

if (!existsSync(rollbackPath)) {
  throw new Error(`Missing rollback draft: ${rollbackPath}`)
}

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
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
    approvedSharedQaProjectRef: sharedQaProjectRef,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    targetClass: 'shared_qa',
    forwardPath: 'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
    rollbackPath: 'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    finalTargetState: 'forward_applied_membership_aware',
  },
  preflight: {},
  baseline: {},
  forward: {},
  rollbackRehearsal: {},
  finalForward: {},
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

function forwardPassed(section) {
  return (
    section.staffRequestHelperExists === true &&
    section.policies.membershipRefCount > 0 &&
    section.policies.primaryRefCount === 0
  )
}

try {
  evidence.preflight.identity = await currentIdentity()
  evidence.preflight.requiredFoundationFunctions = await functionRows(requiredFoundationFunctions)
  evidence.preflight.missingFoundationFunctions = requiredFoundationFunctions.filter(
    (name) => !evidence.preflight.requiredFoundationFunctions.some((row) => row.proname === name)
  )

  const baselinePolicies = await policyRows()
  evidence.baseline.policies = summarizePolicies(baselinePolicies)

  const forwardSql = readFileSync(forwardPath, 'utf8')
  const rollbackSql = readFileSync(rollbackPath, 'utf8')

  await queryUnsafe(forwardSql)
  evidence.forward.applied = true
  evidence.forward.staffRequestHelperExists = await staffRequestHelperExists()
  evidence.forward.policies = summarizePolicies(await policyRows())
  evidence.forward.verificationPassed = forwardPassed(evidence.forward)

  await queryUnsafe(rollbackSql)
  evidence.rollbackRehearsal.applied = true
  evidence.rollbackRehearsal.staffRequestHelperRemoved = await staffRequestHelperMissing()
  evidence.rollbackRehearsal.policies = summarizePolicies(await policyRows())
  evidence.rollbackRehearsal.verificationPassed =
    evidence.rollbackRehearsal.staffRequestHelperRemoved === true &&
    evidence.rollbackRehearsal.policies.primaryRefCount > 0 &&
    evidence.rollbackRehearsal.policies.membershipRefCount === 0

  await queryUnsafe(forwardSql)
  evidence.finalForward.applied = true
  evidence.finalForward.staffRequestHelperExists = await staffRequestHelperExists()
  evidence.finalForward.policies = summarizePolicies(await policyRows())
  evidence.finalForward.verificationPassed = forwardPassed(evidence.finalForward)

  evidence.verification.preflightPassed = evidence.preflight.missingFoundationFunctions.length === 0
  evidence.verification.forwardPassed = evidence.forward.verificationPassed
  evidence.verification.rollbackRehearsalPassed = evidence.rollbackRehearsal.verificationPassed
  evidence.verification.finalForwardPassed = evidence.finalForward.verificationPassed

  evidence.status =
    evidence.verification.preflightPassed &&
    evidence.verification.forwardPassed &&
    evidence.verification.rollbackRehearsalPassed &&
    evidence.verification.finalForwardPassed
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
