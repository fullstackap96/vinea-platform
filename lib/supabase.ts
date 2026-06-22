import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

function getRequiredPublicEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`)
  }
  return value
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(
      getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    )
  }

  return browserClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseBrowserClient(), prop, receiver)
  },
})
