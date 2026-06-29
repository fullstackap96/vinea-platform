import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserSupabase: SupabaseClient | null = null

function getBrowserSupabaseClient(): SupabaseClient {
  if (!browserSupabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase browser client is not configured.')
    }

    browserSupabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return browserSupabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(getBrowserSupabaseClient(), property, receiver)
  },
})
