import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

describe('Daily Brief manual-send confirmation boundary', () => {
  it('opens the shared confirmation instead of sending directly', () => {
    expect(source).toContain('onClick={() => setConfirmDailyBriefSendOpen(true)}')
    expect(source).not.toContain('onClick={sendDailyBriefNow}')
    expect(source).toContain('open={confirmDailyBriefSendOpen}')
    expect(source).toContain('title="Send today’s parish brief now?"')
    expect(source).toContain('confirmLabel="Send parish brief"')
  })

  it('keeps cancellation side-effect free and sends only after confirmation', () => {
    expect(source).toContain('onCancel={() => setConfirmDailyBriefSendOpen(false)}')
    expect(source).toContain('void sendDailyBriefNow()')

    const dialogStart = source.indexOf('open={confirmDailyBriefSendOpen}')
    const dialogEnd = source.indexOf('/>', dialogStart)
    const dialog = source.slice(dialogStart, dialogEnd)
    expect(dialog.indexOf('setConfirmDailyBriefSendOpen(false)')).toBeGreaterThan(-1)
    expect(dialog.indexOf('void sendDailyBriefNow()')).toBeGreaterThan(
      dialog.indexOf('setConfirmDailyBriefSendOpen(false)'),
    )
  })

  it('states the outbound and immediate-delivery consequence', () => {
    expect(source).toContain('email the current Daily Office Brief')
    expect(source).toContain('configured parish recipient')
    expect(source).toContain('This sends immediately.')
    expect(source).toContain('Review today’s dashboard items before continuing.')
  })
})
