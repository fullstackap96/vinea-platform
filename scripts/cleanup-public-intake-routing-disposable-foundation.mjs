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
const evidencePath = join(root, 'docs', 'PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_EXECUTED.json')
const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'))

try {
  const markerRows = await sql`
    select count(*)::int as count
    from public.parishes
    where name = 'Disposable Default Parish'
  `

  const routingTables = await sql`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ('parish_public_intake_domains', 'parish_public_intake_tokens')
  `

  if (markerRows[0].count < 1) {
    throw new Error('Refusing cleanup: disposable foundation marker parish was not found.')
  }

  if (routingTables.length > 0) {
    throw new Error('Refusing cleanup: routing tables still exist; rollback verification is incomplete.')
  }

  await sql.unsafe(`
    drop function if exists public.is_authorized_for_parish(uuid);
    drop function if exists public.current_staff_parish_ids();
    drop table if exists public.parish_memberships;
    drop table if exists public.staff_users;
    drop table if exists public.parishes;
  `)

  const remainingTables = await sql`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ('parishes', 'staff_users', 'parish_memberships', 'parish_public_intake_domains', 'parish_public_intake_tokens')
    order by tablename
  `

  evidence.cleanup = {
    disposableFoundationDropped: true,
    remainingRelevantTables: remainingTables,
    cleanedAt: new Date().toISOString(),
  }
  evidence.status = evidence.status === 'completed' ? 'completed_and_cleaned' : evidence.status
} finally {
  await sql.end({ timeout: 5 }).catch(() => {})
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`)
}
