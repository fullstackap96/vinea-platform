const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL
const confirmation = process.env.VINEA_DISPOSABLE_RLS_FIX_CONFIRM
const executeConfirmation = process.env.VINEA_DISPOSABLE_RLS_FIX_EXECUTE

const approvedProjectRef = 'kikqtorplsswepqitjys'
const expectedHost = `db.${approvedProjectRef}.supabase.co`
const confirmationValue = 'FIX_KIKQ_RLS_DISABLED_IN_PUBLIC'
const executeConfirmationValue = 'EXECUTE_FIX'
const hardBlockedProjectRefs = new Set([
  'gnfomgsuottcuueasfvi', // shared QA
])

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

if (confirmation !== confirmationValue) {
  throw new Error(`VINEA_DISPOSABLE_RLS_FIX_CONFIRM=${confirmationValue} is required.`)
}

const parsedUrl = new URL(databaseUrl)
const host = parsedUrl.hostname.toLowerCase()

for (const projectRef of hardBlockedProjectRefs) {
  if (host.includes(projectRef)) {
    throw new Error(`Refusing to run against blocked project ref ${projectRef}.`)
  }
}

if (host !== expectedHost) {
  throw new Error(`Refusing to run: RLS fix is approved only for ${expectedHost}.`)
}

const executeFix = executeConfirmation === executeConfirmationValue
const { default: postgres } = await import('postgres')

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
})

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`
}

async function rlsDisabledRows() {
  return await sql`
    select n.nspname as schema_name,
           c.relname as table_name,
           c.relrowsecurity as rls_enabled
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

async function allPublicTableRows() {
  return await sql`
    select n.nspname as schema_name,
           c.relname as table_name,
           c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not exists (
        select 1
        from pg_depend d
        where d.objid = c.oid
          and d.deptype = 'e'
      )
    order by c.relname
  `
}

async function ensureParishesReadPolicy() {
  await sql.unsafe(`
    alter table public.parishes enable row level security;

    drop policy if exists "parishes_select_authorized_staff" on public.parishes;
    create policy "parishes_select_authorized_staff"
      on public.parishes
      for select
      to authenticated, service_role
      using (
        auth.role() = 'service_role'
        or public.is_authorized_for_parish(id)
      );
  `)
}

async function parishesPolicies() {
  return await sql`
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'parishes'
    order by policyname
  `
}

const evidence = {
  status: executeFix ? 'started' : 'dry_run',
  startedAt: new Date().toISOString(),
  completedAt: null,
  projectRef: approvedProjectRef,
  host,
  execute: executeFix,
  advisorIssue: 'rls_disabled_in_public',
  before: [],
  alteredTables: [],
  parishesPolicyApplied: false,
  parishesPolicyNames: [],
  after: [],
  remainingRlsDisabledTables: [],
}

try {
  evidence.before = await rlsDisabledRows()
  evidence.alteredTables = evidence.before.map((row) => `${row.schema_name}.${row.table_name}`)

  if (executeFix) {
    for (const row of evidence.before) {
      const qualifiedName = `${quoteIdentifier(row.schema_name)}.${quoteIdentifier(row.table_name)}`
      await sql.unsafe(`alter table ${qualifiedName} enable row level security`)
    }
    await ensureParishesReadPolicy()
    evidence.parishesPolicyApplied = true
  }

  evidence.parishesPolicyNames = (await parishesPolicies()).map((row) => row.policyname)
  evidence.after = await allPublicTableRows()
  evidence.remainingRlsDisabledTables = await rlsDisabledRows()
  evidence.status =
    evidence.remainingRlsDisabledTables.length === 0
      ? executeFix
        ? 'fixed'
        : 'dry_run_ready'
      : executeFix
        ? 'fix_incomplete'
        : 'dry_run_needs_fix'
  evidence.completedAt = new Date().toISOString()
  await sql.end()
  console.log(JSON.stringify(evidence, null, 2))
} catch (error) {
  evidence.status = executeFix ? 'failed' : 'dry_run_failed'
  evidence.completedAt = new Date().toISOString()
  evidence.error = error instanceof Error ? error.message : String(error)
  await sql.end({ timeout: 5 }).catch(() => {})
  console.log(JSON.stringify(evidence, null, 2))
  process.exitCode = 1
}
