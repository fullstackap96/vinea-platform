import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const expectedProjectRef = 'kikqtorplsswepqitjys'
const databaseUrl = process.env.DISPOSABLE_SUPABASE_DB_URL

if (!databaseUrl) {
  throw new Error('DISPOSABLE_SUPABASE_DB_URL is required.')
}

const parsedUrl = new URL(databaseUrl)
if (!parsedUrl.hostname.includes(expectedProjectRef)) {
  throw new Error(`Refusing to run: database host is not ${expectedProjectRef}.`)
}

if (parsedUrl.hostname.includes('gnfomgsuottcuueasfvi')) {
  throw new Error('Refusing to run against shared QA project gnfomgsuottcuueasfvi.')
}

const { default: postgres } = await import('postgres')

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  ssl: 'require',
})

const root = process.cwd()
const forwardSql = readFileSync(
  join(root, 'docs', 'sql', 'public_intake_parish_routing_migration_candidate.sql'),
  'utf8'
)
const rollbackSql = readFileSync(
  join(root, 'docs', 'sql', 'public_intake_parish_routing_rollback_draft.sql'),
  'utf8'
)

const startedAt = new Date().toISOString()
const evidence = {
  status: 'started',
  startedAt,
  completedAt: null,
  projectRef: expectedProjectRef,
  host: parsedUrl.hostname,
  currentDatabase: null,
  currentUser: null,
  foundation: {},
  baseline: {},
  forward: {},
  validation: {},
  rollback: {},
  cleanup: {},
}

async function query(name, queryPromise) {
  const rows = await queryPromise
  return { name, rowCount: rows.length, rows }
}

async function queryUnsafe(name, statement) {
  const rows = await sql.unsafe(statement)
  return { name, rowCount: rows.length, rows }
}

async function expectFailure(name, fn) {
  try {
    await fn()
    return { name, passed: false, message: 'Expected failure, but statement succeeded.' }
  } catch (error) {
    return { name, passed: true, message: error.message }
  }
}

async function tableColumns() {
  return query('parishes routing columns', sql`
    select column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'parishes'
      and column_name in ('public_slug', 'public_display_name', 'public_intake_enabled')
    order by column_name
  `)
}

async function routingTables() {
  return query('routing tables', sql`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
    order by tablename
  `)
}

async function routingIndexes() {
  return query('routing indexes', sql`
    select indexname
    from pg_indexes
    where schemaname = 'public'
      and indexname in (
        'parishes_public_slug_lower_unique',
        'parish_public_intake_domains_hostname_lower_unique',
        'parish_public_intake_tokens_token_hash_unique'
      )
    order by indexname
  `)
}

async function routingPolicies() {
  return query('routing policies', sql`
    select policyname, tablename, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
    order by tablename, policyname
  `)
}

async function routingRowSecurity() {
  return query('routing rowsecurity', sql`
    select tablename, rowsecurity
    from pg_tables
    where schemaname = 'public'
      and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
    order by tablename
  `)
}

async function tableExists(tableName) {
  const rows = await sql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = ${tableName}
    ) as exists
  `
  return rows[0].exists
}

async function applyMinimalFoundationIfNeeded() {
  const parishesExists = await tableExists('parishes')
  if (parishesExists) {
    return { applied: false, reason: 'public.parishes already exists' }
  }

  await sql.unsafe(`
    create table if not exists public.parishes (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    insert into public.parishes (name)
    select 'Disposable Default Parish'
    where not exists (select 1 from public.parishes);

    create table if not exists public.staff_users (
      id uuid primary key default gen_random_uuid(),
      parish_id uuid not null references public.parishes (id) on delete cascade,
      email text not null,
      role text not null default 'staff' check (role in ('admin', 'staff')),
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (parish_id, email)
    );

    create index if not exists staff_users_email_active_idx
      on public.staff_users (lower(email), active);

    alter table public.staff_users enable row level security;

    create table if not exists public.parish_memberships (
      id uuid primary key default gen_random_uuid(),
      parish_id uuid not null references public.parishes (id) on delete cascade,
      user_id uuid null references auth.users (id) on delete set null,
      email text not null,
      role text not null default 'staff' check (role in ('admin', 'staff')),
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint parish_memberships_email_not_blank check (char_length(btrim(email)) > 0),
      constraint parish_memberships_email_lowercase check (email = lower(email)),
      constraint parish_memberships_parish_email_unique unique (parish_id, email)
    );

    create index if not exists parish_memberships_user_active_idx
      on public.parish_memberships (user_id, active)
      where user_id is not null;

    create index if not exists parish_memberships_email_active_idx
      on public.parish_memberships (email, active);

    create unique index if not exists parish_memberships_parish_user_unique_idx
      on public.parish_memberships (parish_id, user_id)
      where user_id is not null;

    alter table public.parish_memberships enable row level security;

    create or replace function public.current_staff_parish_ids()
    returns setof uuid
    language sql
    stable
    security definer
    set search_path = public
    as $$
      select distinct pm.parish_id
      from public.parish_memberships pm
      where pm.active = true
        and (
          pm.user_id = auth.uid()
          or pm.email = lower(coalesce(auth.jwt() ->> 'email', ''))
        )

      union

      select distinct su.parish_id
      from public.staff_users su
      where su.active = true
        and lower(su.email) = lower(coalesce(auth.jwt() ->> 'email', ''));
    $$;

    create or replace function public.is_authorized_for_parish(p_parish_id uuid)
    returns boolean
    language sql
    stable
    security definer
    set search_path = public
    as $$
      select p_parish_id is not null
        and exists (
          select 1
          from public.current_staff_parish_ids() scoped(parish_id)
          where scoped.parish_id = p_parish_id
        );
    $$;

    revoke execute on function public.current_staff_parish_ids() from public;
    revoke execute on function public.is_authorized_for_parish(uuid) from public;
    grant execute on function public.current_staff_parish_ids() to authenticated;
    grant execute on function public.is_authorized_for_parish(uuid) to authenticated;
  `)

  return {
    applied: true,
    reason: 'Applied minimal disposable foundation because public.parishes was missing',
  }
}

async function dataValidation() {
  const createdParishes = await sql`
    insert into public.parishes (name)
    values
      ('Disposable St Ann Routing QA'),
      ('Disposable St Mark Routing QA')
    returning id, name
  `

  const parishA = createdParishes[0].id
  const parishB = createdParishes[1].id

  const results = []

  await sql`update public.parishes set public_slug = 'st-ann-routing-qa' where id = ${parishA}`
  results.push({ name: 'Insert slug st-ann-routing-qa', passed: true })

  results.push(await expectFailure('Insert uppercase slug St-Ann-Routing-QA fails', async () => {
    await sql`update public.parishes set public_slug = 'St-Ann-Routing-QA' where id = ${parishB}`
  }))

  results.push(await expectFailure('Insert slug with spaces fails', async () => {
    await sql`update public.parishes set public_slug = 'st ann routing qa' where id = ${parishB}`
  }))

  results.push(await expectFailure('Insert duplicate slug with different case fails', async () => {
    await sql`update public.parishes set public_slug = 'ST-ANN-ROUTING-QA' where id = ${parishB}`
  }))

  await sql`
    insert into public.parish_public_intake_domains (parish_id, hostname, verified_at)
    values (${parishA}, 'intake.stann-routing-qa.example', now())
  `
  results.push({ name: 'Insert verified lowercase hostname', passed: true })

  results.push(await expectFailure('Insert uppercase hostname fails', async () => {
    await sql`
      insert into public.parish_public_intake_domains (parish_id, hostname)
      values (${parishB}, 'Intake.StMark-Routing-QA.Example')
    `
  }))

  results.push(await expectFailure('Insert duplicate hostname with different case fails', async () => {
    await sql`
      insert into public.parish_public_intake_domains (parish_id, hostname)
      values (${parishB}, 'INTAKE.STANN-ROUTING-QA.EXAMPLE')
    `
  }))

  await sql`
    insert into public.parish_public_intake_tokens (parish_id, token_hash, label, request_type)
    values (${parishA}, 'disposable-token-hash-routing-qa', 'Disposable token', 'baptism')
  `
  results.push({ name: 'Insert token hash for Baptism', passed: true })

  results.push(await expectFailure('Insert duplicate token hash fails', async () => {
    await sql`
      insert into public.parish_public_intake_tokens (parish_id, token_hash, label, request_type)
      values (${parishB}, 'disposable-token-hash-routing-qa', 'Duplicate token', 'baptism')
    `
  }))

  results.push(await expectFailure('Insert invalid token request type fails', async () => {
    await sql`
      insert into public.parish_public_intake_tokens (parish_id, token_hash, label, request_type)
      values (${parishB}, 'disposable-token-invalid-type-routing-qa', 'Invalid token', 'invalid_type')
    `
  }))

  const tokenColumns = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'parish_public_intake_tokens'
    order by column_name
  `
  results.push({
    name: 'Confirm raw token value is not stored',
    passed: tokenColumns.some((row) => row.column_name === 'token_hash') &&
      !tokenColumns.some((row) => row.column_name === 'token'),
  })

  await sql`delete from public.parishes where id in (${parishA}, ${parishB})`

  return results
}

try {
  const identity = await sql`
    select current_database() as database_name, current_user as database_user, now() as captured_at
  `
  evidence.currentDatabase = identity[0].database_name
  evidence.currentUser = identity[0].database_user
  evidence.baseline.identityCapturedAt = identity[0].captured_at
  evidence.foundation = await applyMinimalFoundationIfNeeded()

  evidence.baseline.columns = await tableColumns()
  evidence.baseline.tables = await routingTables()
  evidence.baseline.indexes = await routingIndexes()

  evidence.forward.apply = await queryUnsafe('apply forward candidate', forwardSql)
  evidence.forward.columns = await tableColumns()
  evidence.forward.tables = await routingTables()
  evidence.forward.indexes = await routingIndexes()
  evidence.forward.rowsecurity = await routingRowSecurity()
  evidence.forward.policies = await routingPolicies()
  evidence.validation.dataCases = await dataValidation()

  evidence.rollback.apply = await queryUnsafe('apply rollback draft', rollbackSql)
  evidence.rollback.columns = await tableColumns()
  evidence.rollback.tables = await routingTables()
  evidence.rollback.indexes = await routingIndexes()

  evidence.cleanup.noDatabaseCleanupRequired = true
  evidence.status = 'completed'
} catch (error) {
  evidence.status = 'failed'
  evidence.error = error.message
  throw error
} finally {
  evidence.completedAt = new Date().toISOString()
  await sql.end({ timeout: 5 }).catch(() => {})
  writeFileSync(
    join(root, 'docs', 'PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_EXECUTED.json'),
    `${JSON.stringify(evidence, null, 2)}\n`
  )
}
