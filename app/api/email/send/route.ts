import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

function getSupabaseServerClient(request: NextRequest, response: NextResponse) {
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

/**
 * Some reply drafts (e.g. from the AI) start with a "Subject: ..." line even though
 * the real subject is sent via the email header. Remove that first line so it is not
 * duplicated in the body.
 */
function stripLeadingSubjectLineFromPlainText(text: string): string {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines.length === 0) return text.trim()
  if (/^\s*Subject:\s*.+\s*$/i.test(lines[0])) {
    lines.shift()
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift()
    }
    return lines.join('\n').trim()
  }
  return text.trim()
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: false })
  try {
    const supabase = getSupabaseServerClient(request, response)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const to = String(body?.to || '').trim()
    const subject = String(body?.subject || '').trim()
    let text = String(body?.text || '').trim()
    text = stripLeadingSubjectLineFromPlainText(text)

    if (!to || !subject || !text) {
      return NextResponse.json(
        { ok: false, error: 'Missing to, subject, or text' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL

    if (!apiKey || !from) {
      return NextResponse.json(
        { ok: false, error: 'Server email not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id || null })
  } catch (error: any) {
    console.error('EMAIL SEND ERROR:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

