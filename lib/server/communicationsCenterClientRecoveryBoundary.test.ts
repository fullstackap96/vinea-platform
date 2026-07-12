import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/communications/DashboardCommunicationsPageClient.tsx'),
  'utf8',
)

describe('Communications Center client recovery boundary', () => {
  it('bounds staff-reviewed communication writes', () => {
    expect(source).toContain('const COMMUNICATION_MUTATION_TIMEOUT_MS = 60_000')
    expect(source).toContain('signal: AbortSignal.timeout(COMMUNICATION_MUTATION_TIMEOUT_MS)')
  })

  it('requires a page refresh after either write has uncertain completion', () => {
    expect(source).toContain(
      'Could not confirm whether this change finished. Refresh Communications and review the request before trying again.',
    )
    expect(source).toContain(
      'const [mutationRequiresRefresh, setMutationRequiresRefresh] = useState(false)',
    )
    expect(source.match(/setMutationRequiresRefresh\(true\)/g)).toHaveLength(2)
    expect(source.match(/mutationInFlightRef\.current \|\| mutationRequiresRefresh/g)).toHaveLength(
      2,
    )
  })

  it('freezes every mutation control until the page is refreshed', () => {
    expect(
      source.match(/disabled=\{mutationBusy \|\| mutationRequiresRefresh\}/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(7)
  })

  it('preserves single-flight ordering and does not automatically replay writes', () => {
    const touchpointStart = source.indexOf('async function saveTouchpoint')
    const touchpointCall = source.indexOf('await logCommunicationTouchpoint', touchpointStart)
    const followUpStart = source.indexOf('async function saveFollowUp')
    const followUpCall = source.indexOf('await updateCommunicationFollowUp', followUpStart)

    expect(source.indexOf('mutationInFlightRef.current = true', touchpointStart)).toBeLessThan(
      touchpointCall,
    )
    expect(source.indexOf('mutationInFlightRef.current = true', followUpStart)).toBeLessThan(
      followUpCall,
    )
    expect(source).not.toContain('await saveTouchpoint(')
    expect(source).not.toContain('await saveFollowUp(')
  })
})
