import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260626103000_public_intake_domain_verification.sql'
)

describe('public intake domain verification migration', () => {
  it('adds only additive staff-managed DNS verification metadata', () => {
    const sql = readFileSync(migrationPath, 'utf8')

    expect(sql).toContain('ALTER TABLE public.parish_public_intake_domains')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS verification_token text')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS verification_dns_name text')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS verification_dns_value text')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS verification_checked_at timestamptz')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS verification_error text')
    expect(sql).toContain('parish_public_intake_domains_verification_checked_at_idx')
    expect(sql).toContain('does not wire runtime public')
    expect(sql).toContain('does not change operational table RLS')
    expect(sql).not.toMatch(/\bDROP\b/i)
  })
})
