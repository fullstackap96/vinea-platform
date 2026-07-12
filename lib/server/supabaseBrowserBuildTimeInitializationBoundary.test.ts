import { afterEach, describe, expect, it, vi } from 'vitest'

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

afterEach(() => {
  vi.resetModules()
  restoreEnvironmentValue('NEXT_PUBLIC_SUPABASE_URL', originalUrl)
  restoreEnvironmentValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', originalAnonKey)
})

describe('Supabase browser build-time initialization boundary', () => {
  it('loads without credentials and fails closed only when a browser client is requested', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    vi.resetModules()

    const supabaseModule = await import('@/lib/supabase')

    expect(supabaseModule.getSupabaseBrowserClient).toBeTypeOf('function')
    expect(() => supabaseModule.getSupabaseBrowserClient()).toThrow(
      'Authentication service is not configured.',
    )
  })
})

function restoreEnvironmentValue(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}
