import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import type { NextResponse } from 'next/server'

export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

/** Read session from the request without writing refreshed cookies (fine for short OAuth callbacks). */
export function createSupabaseRouteHandlerReadOnlyClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {
        /* no-op: avoid carrying a throwaway NextResponse through redirect responses */
      },
    },
  })
}
