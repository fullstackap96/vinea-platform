import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const databaseUrl = process.env.SHARED_QA_SUPABASE_DB_URL
const confirmation = process.env.VINEA_PARISHES_RLS_SHARED_QA_CONFIRM

const confirmationValue = 'PARISHES_RLS_SHARED_QA_PROMOTION'
const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'
const migrationRelativePath = 'supabase/migrations/20260630170000_enable_parishes_rls.sql'
const hardBlockedProjectRefs = new Set([
  'kikqtorplsswepqitjys', // reusable disposable project
])

if (!databaseUrl) {
  throw new Error('SHARED_QA_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(`VINEA_PARISHES_RLS_SHARED_QA_CONFIRM=${confirmationValue} is required.`)
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

const migrationPath = join(process.cwd(), ...migrationRelativePath.split('/'))

if (!existsSync(migrationPath)) {
  throw new Error(`Missing migration: ${migrationRelativePath}`)
}

const { default: postgres } = await import('postgres')

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
})

const evidence = {
  status: 'started',
  startedAt: new Date().toISOString(),
  completedAt: null,
  host,
  safety: {
    confirmationAccepted: true,
    requiredConfirmation: confirmationValue,
    approvedSharedQaProjectRef: sharedQaProjectRef,
    hardBlockedProjectRefs: Array.from(hardBlockedProjectRefs),
    targetClass: 'shared_qa',
    migrationPath: migrationRelativePath,
    productionTouched: false,
  },
  preflight: {},
  apply: {},
  verification: {},
}

async function currentIdentity() {
  const rows = await sql`
    select current_database() as database_name,
           current_user as database_user,
           now() as captured_at
  `
  return rows[0]
}

async function parishesRlsState() {
  const rows = await sql`
    select c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'parishes'
      and c.relkind in ('r', 'p')
    limit 1
  `
  return rows[0] ?? null
}

async function parishesPolicyRows() {
  return await sql`
    select policyname, cmd, roles, qual
    from pg_policies
    where schemaname = 'public'
      and tablename = 'parishes'
    order by policyname
  `
}

async function rlsDisabledRows() {
  return await sql`
    select n.nspname as schema_name,
           c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity = false
      and not exists (
        select 1
        from pg_depend d
        where d.objid = c.oid
          and d.deptype = 'e'
      )
    order by c.relname
  `
}

function summarizeParishesPolicies(rows) {
  return rows.map((row) => ({
    policyname: row.policyname,
    cmd: row.cmd,
    roles: row.roles,
    isMembershipScoped: String(row.qual ?? '').includes('is_authorized_for_parish'),
    hasServiceRoleGrant: Array.isArray(row.roles) && row.roles.includes('service_role'),
    hasDeprecatedRolePredicate: /auth\s*\.\s*role\s*\(/i.test(String(row.qual ?? '')),
  }))
}

function verificationPassed(state, policies, remainingRlsDisabledTables) {
  return (
    state?.rls_enabled === true &&
    policies.some(
      (policy) =>
        policy.policyname === 'parishes_select_authorized_staff' &&
        policy.cmd === 'SELECT' &&
        policy.roles.includes('authenticated') &&
        policy.hasServiceRoleGrant === true &&
        policy.isMembershipScoped === true &&
        policy.hasDeprecatedRolePredicate === false
    ) &&
    remainingRlsDisabledTables.length === 0
  )
}

try {
  evidence.preflight.identity = await currentIdentity()
  evidence.preflight.parishesRlsBefore = await parishesRlsState()
  evidence.preflight.parishesPoliciesBefore = summarizeParishesPolicies(await parishesPolicyRows())
  evidence.preflight.remainingRlsDisabledTablesBefore = await rlsDisabledRows()

  await sql.unsafe(readFileSync(migrationPath, 'utf8'))
  evidence.apply.migrationApplied = true

  const stateAfter = await parishesRlsState()
  const policiesAfter = summarizeParishesPolicies(await parishesPolicyRows())
  const remainingAfter = await rlsDisabledRows()

  evidence.verification.parishesRlsAfter = stateAfter
  evidence.verification.parishesPoliciesAfter = policiesAfter
  evidence.verification.remainingRlsDisabledTablesAfter = remainingAfter
  evidence.verification.passed = verificationPassed(stateAfter, policiesAfter, remainingAfter)
  evidence.status = evidence.verification.passed ? 'completed' : 'completed_with_validation_failures'
  evidence.completedAt = new Date().toISOString()
  if (!evidence.verification.passed) {
    process.exitCode = 1
  }
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
