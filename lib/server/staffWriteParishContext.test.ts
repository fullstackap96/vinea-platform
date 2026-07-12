import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'

function createWriteContextSupabaseMock(options: {
  primaryMembershipParishId?: string | null
  primaryMembershipError?: { message: string; code?: string } | null
  requestedMembershipAuthorized?: boolean | null
  requestedMembershipError?: { message: string; code?: string } | null
  fallbackParishId?: string | null
  fallbackError?: { message: string; code?: string } | null
}) {
  const rpc = vi.fn((name: string, args?: Record<string, unknown>) => {
    if (name === 'current_staff_primary_parish_id') {
      return Promise.resolve({
        data: options.primaryMembershipParishId ?? null,
        error: options.primaryMembershipError ?? null,
      })
    }
    if (name === 'is_authorized_for_parish') {
      return Promise.resolve({
        data: options.requestedMembershipAuthorized ?? false,
        error: options.requestedMembershipError ?? null,
        args,
      })
    }
    if (name === 'primary_parish_id') {
      return Promise.resolve({
        data: options.fallbackParishId ?? null,
        error: options.fallbackError ?? null,
      })
    }
    return Promise.resolve({ data: null, error: null })
  })

  return { supabase: { rpc }, rpc }
}

describe('resolveStaffWriteParishContext', () => {
  it('resolves the primary membership parish for writes without a requested parish id', async () => {
    const { supabase, rpc } = createWriteContextSupabaseMock({
      primaryMembershipParishId: 'parish-2',
      fallbackParishId: 'parish-1',
    })

    const result = await resolveStaffWriteParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: null,
    })
    expect(rpc).toHaveBeenCalledWith('current_staff_primary_parish_id')
    expect(rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('authorizes an explicit requested parish through membership before writes', async () => {
    const { supabase, rpc } = createWriteContextSupabaseMock({
      requestedMembershipAuthorized: true,
      fallbackParishId: 'parish-1',
    })

    const result = await resolveStaffWriteParishContext(supabase as never, {
      requestedParishId: 'parish-2',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    expect(rpc).toHaveBeenCalledWith('is_authorized_for_parish', { p_parish_id: 'parish-2' })
    expect(rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('denies an explicit requested parish when membership does not match and fallback is not enabled', async () => {
    const { supabase, rpc } = createWriteContextSupabaseMock({
      requestedMembershipAuthorized: false,
      fallbackParishId: 'parish-2',
    })

    const result = await resolveStaffWriteParishContext(supabase as never, {
      requestedParishId: 'parish-2',
    })

    expect(result).toEqual({
      ok: false,
      error: 'You are not authorized to write to this parish.',
      technicalDetail: 'No active parish membership matched the requested parish.',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    expect(rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('uses primary_parish_id fallback only when explicitly enabled for legacy writes', async () => {
    const { supabase, rpc } = createWriteContextSupabaseMock({
      primaryMembershipError: { message: 'Could not find the function current_staff_primary_parish_id' },
      fallbackParishId: 'parish-1',
    })

    const result = await resolveStaffWriteParishContext(supabase as never, {
      allowPrimaryParishFallback: true,
      fallbackReason: 'Legacy create action has not been migrated yet.',
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason: 'Legacy create action has not been migrated yet.',
    })
    expect(rpc).toHaveBeenCalledWith('primary_parish_id')
  })

  it('does not allow fallback to write a different requested parish', async () => {
    const { supabase } = createWriteContextSupabaseMock({
      requestedMembershipError: { message: 'Could not find the function is_authorized_for_parish' },
      fallbackParishId: 'parish-1',
    })

    const result = await resolveStaffWriteParishContext(supabase as never, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: true,
    })

    expect(result).toEqual({
      ok: false,
      error: 'You are not authorized to write to this parish.',
      technicalDetail: 'Requested parish does not match the primary parish fallback.',
      source: 'primary_parish_fallback',
      requestedParishId: 'parish-2',
    })
  })

  it('redacts sensitive membership failure details before returning technical detail', async () => {
    const { supabase } = createWriteContextSupabaseMock({
      primaryMembershipError: {
        message:
          'membership lookup failed for owner@example.com with sk-test_1234567890abcdef at postgresql://postgres:password@example.supabase.co:5432/postgres',
      },
    })

    const result = await resolveStaffWriteParishContext(supabase as never)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail:
        'membership lookup failed for [redacted email] with [redacted token] at [redacted database url]',
      source: 'membership',
      requestedParishId: null,
    })
    expect(JSON.stringify(result)).not.toContain('owner@example.com')
    expect(JSON.stringify(result)).not.toContain('sk-test_1234567890abcdef')
    expect(JSON.stringify(result)).not.toContain('postgres:password')
  })

  it('redacts sensitive fallback reasons when legacy write fallback is explicitly enabled', async () => {
    const { supabase } = createWriteContextSupabaseMock({
      primaryMembershipError: {
        message: 'lookup failed for owner@example.com with Bearer abc.def.ghi',
      },
      fallbackParishId: 'parish-1',
    })

    const result = await resolveStaffWriteParishContext(supabase as never, {
      allowPrimaryParishFallback: true,
    })

    expect(result).toEqual({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason: 'lookup failed for [redacted email] with Bearer [redacted token]',
    })
    expect(JSON.stringify(result)).not.toContain('owner@example.com')
    expect(JSON.stringify(result)).not.toContain('abc.def.ghi')
  })
})
