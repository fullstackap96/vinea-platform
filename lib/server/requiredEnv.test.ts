import { afterEach, describe, expect, it } from 'vitest'
import {
  assertRequiredEnv,
  getMissingRequiredEnv,
  MissingRequiredEnvError,
} from './requiredEnv'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('requiredEnv', () => {
  it('reports a single missing variable by exact name', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    expect(getMissingRequiredEnv(['SUPABASE_SERVICE_ROLE_KEY'])).toEqual([
      'SUPABASE_SERVICE_ROLE_KEY',
    ])
    expect(() => assertRequiredEnv(['SUPABASE_SERVICE_ROLE_KEY'])).toThrow(
      MissingRequiredEnvError
    )
    expect(() => assertRequiredEnv(['SUPABASE_SERVICE_ROLE_KEY'])).toThrow(
      'Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY'
    )
  })

  it('treats empty string as missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '   '
    expect(getMissingRequiredEnv(['NEXT_PUBLIC_SUPABASE_ANON_KEY'])).toEqual([
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ])
  })

  it('accepts one-of when any listed variable is set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    expect(
      getMissingRequiredEnv([{ oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] }])
    ).toEqual([])
  })

  it('lists multiple missing variables', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    expect(() =>
      assertRequiredEnv(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'])
    ).toThrow(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY'
    )
  })
})
