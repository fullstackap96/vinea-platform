import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const appApiRoot = join(process.cwd(), 'app', 'api')

function listRouteFiles(dir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = join(dir, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) return listRouteFiles(absolutePath)
    return entry === 'route.ts' ? [absolutePath] : []
  })
}

function relativeRoute(path: string): string {
  return relative(process.cwd(), path).replaceAll('\\', '/')
}

const forbiddenRawErrorPatterns: readonly {
  readonly name: string
  readonly pattern: RegExp
}[] = [
  {
    name: 'direct raw Error.message in 5xx JSON response',
    pattern:
      /NextResponse\.json\(\s*\{[\s\S]{0,260}\b(?:error|details|message):\s*[^,}\n]+\.message\b[\s\S]{0,160}\}\s*,\s*\{\s*status:\s*5\d\d\s*\}/g,
  },
  {
    name: 'catch-derived message variable in 5xx JSON response',
    pattern:
      /const\s+message\s*=\s*[^;\n]+\.message[\s\S]{0,320}NextResponse\.json\(\s*\{[\s\S]{0,180}\berror:\s*message\b[\s\S]{0,160}\}\s*,\s*\{\s*status:\s*5\d\d\s*\}/g,
  },
  {
    name: 'messageFromError helper returned in JSON response',
    pattern:
      /function\s+messageFromError[\s\S]{0,260}\.message[\s\S]{0,720}NextResponse\.json\(\s*\{[\s\S]{0,180}\berror:\s*messageFromError\(/g,
  },
  {
    name: 'raw Error.message in plain Response body',
    pattern: /new\s+Response\(\s*[^,\n]+\.message\b[\s\S]{0,160}\{\s*status:\s*5\d\d\s*\}/g,
  },
  {
    name: 'exception message assigned directly to a response error field',
    pattern:
      /error\s*:\s*(?:[A-Za-z_$][\w$]*\s*instanceof\s+Error\s*\?\s*)?[A-Za-z_$][\w$]*\.message\b/g,
  },
  {
    name: 'exception coerced directly into a response error field',
    pattern: /error\s*:\s*String\s*\(\s*[A-Za-z_$][\w$]*\s*\)/g,
  },
  {
    name: 'exception serialized directly',
    pattern: /JSON\.stringify\s*\(\s*[A-Za-z_$][\w$]*\s*\)/g,
  },
  {
    name: 'exception message returned directly as response text',
    pattern: /new\s+(?:Next)?Response\s*\(\s*[A-Za-z_$][\w$]*\.message\b/g,
  },
  {
    name: 'raw exception passed directly to a JSON response',
    pattern: /(?:NextResponse|Response)\.json\s*\(\s*(?:error|exception|cause|caught)\s*[,)]/g,
  },
]

function unsafeResponseFindings(source: string): string[] {
  return forbiddenRawErrorPatterns.flatMap(({ name, pattern }) =>
    [...source.matchAll(pattern)].map((match) => `${name}: ${match[0].slice(0, 180)}`),
  )
}

describe('app/api route safe-error regression guard', () => {
  it.each([
    "NextResponse.json({ ok: false, error: error.message })",
    "NextResponse.json({ error: caught instanceof Error ? caught.message : 'failed' })",
    'Response.json({ error: String(exception) })',
    'new NextResponse(error.message, { status: 500 })',
    'NextResponse.json(error, { status: 500 })',
    'const payload = JSON.stringify(cause)',
  ])('recognizes an unsafe response form: %s', (source) => {
    expect(unsafeResponseFindings(source)).not.toEqual([])
  })

  it('allows redacted server logging with a generic user response', () => {
    const source = `
      logServerError('[route] failed', error, { route: '/api/example' })
      return NextResponse.json({ ok: false, error: 'Could not complete this request.' }, { status: 500 })
    `

    expect(unsafeResponseFindings(source)).toEqual([])
  })

  it('keeps route handlers from returning raw database/provider/exception messages in 5xx responses', () => {
    const findings = listRouteFiles(appApiRoot).flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return unsafeResponseFindings(source).map((finding) => `${relativeRoute(file)}: ${finding}`)
    })

    expect(findings).toEqual([])
  })
})
