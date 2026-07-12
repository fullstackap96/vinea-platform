import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  isStaffEmailAllowlisted,
  normalizeStaffEmail,
  staffAccessNotConfiguredAllowsDev,
} from '@/lib/staffAuthorization'

function normalizeAuthorizedParishIds(data: unknown): string[] {
  const values = data == null ? [] : Array.isArray(data) ? data : [data]
  const ids = values
    .map((value) => {
      if (typeof value === 'string') return value.trim()
      if (!value || typeof value !== 'object') return ''
      const row = value as Record<string, unknown>
      return String(row.current_staff_parish_ids ?? row.parish_id ?? row.id ?? '').trim()
    })
    .filter(Boolean)
  return Array.from(new Set(ids))
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )
    return NextResponse.redirect(loginUrl)
  }

  const email = normalizeStaffEmail(user.email)
  let authorized = isStaffEmailAllowlisted(email)
  let staffLookupError = false

  if (!authorized && email) {
    try {
      const { data, error } = await supabase.rpc('current_staff_parish_ids')
      if (error) throw error
      const authorizedParishIds = normalizeAuthorizedParishIds(data)
      authorized = authorizedParishIds.length > 0
    } catch {
      staffLookupError = true
      authorized = false
    }
  }

  if (staffLookupError && process.env.NODE_ENV === 'production') {
    authorized = false
  }

  if (!authorized && staffAccessNotConfiguredAllowsDev()) {
    authorized = true
  }

  if (!authorized) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('staff', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
