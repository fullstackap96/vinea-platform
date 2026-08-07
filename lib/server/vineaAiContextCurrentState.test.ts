import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

describe('Vinea AI context current state', () => {
  const context = readFileSync(
    join(repoRoot, 'docs', 'VINEA_AI_CONTEXT.md'),
    'utf8',
  )
  const packageJson = JSON.parse(
    readFileSync(join(repoRoot, 'package.json'), 'utf8'),
  ) as { dependencies: { next: string } }

  it('matches the installed Next.js version and current Supabase layout', () => {
    expect(context).toContain(`Next.js ${packageJson.dependencies.next} App Router.`)
    expect(context).toContain('- `lib/supabase.ts`')
    expect(context).toContain('- `lib/supabase/server.ts`')
    expect(context).toContain('`lib/supabase/routeHandlerClient.ts`')
    expect(context).not.toContain('app/lib/supabase')
  })

  it('keeps production rollout and sensitive capabilities explicitly gated', () => {
    expect(context).toContain('Production domain: `https://vineaplatform.com`')
    expect(context).toContain('production rollout is not currently approved')
    expect(context).toContain('stopped before promotion')
    expect(context).toContain('remain separately gated')
  })
})
