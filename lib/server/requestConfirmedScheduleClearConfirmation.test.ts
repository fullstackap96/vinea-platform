import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', '[id]', 'page.tsx'),
  'utf8',
)

describe('request confirmed schedule clear confirmation', () => {
  it('routes every clear control through the shared confirmation state', () => {
    for (const kind of ['baptism', 'funeral', 'wedding', 'ocia']) {
      expect(source).toContain(`onClear={() => setPendingConfirmedScheduleClear('${kind}')}`)
    }

    expect(source).toContain('<VineaConfirmDialog')
    expect(source).toContain('open={pendingConfirmedScheduleClear !== null}')
    expect(source).toContain('confirmLabel="Clear confirmed time"')
    expect(source).not.toContain('onClear={clearConfirmed')
  })

  it('dispatches only the confirmed schedule clear action', () => {
    const start = source.indexOf('function confirmConfirmedScheduleClear()')
    const end = source.indexOf('async function logCommunication()', start)
    const block = source.slice(start, end)

    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    expect(block).toContain('setPendingConfirmedScheduleClear(null)')
    expect(block).toContain('void clearConfirmedBaptismDate()')
    expect(block).toContain('void clearConfirmedFuneralService()')
    expect(block).toContain('void clearConfirmedWeddingCeremony()')
    expect(block).toContain('void clearConfirmedOciaSession()')
  })

  it('keeps Google Calendar consequences explicit and separate', () => {
    expect(source).toContain(
      'This does not delete or update any existing Google Calendar event. Review the Calendar section separately.',
    )
    expect(source).toContain('Staff can enter a new confirmed time later.')
  })
})
