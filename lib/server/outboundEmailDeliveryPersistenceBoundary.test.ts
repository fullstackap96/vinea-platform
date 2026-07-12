import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('outbound email delivery persistence boundary', () => {
  for (const routePath of [
    'app/api/email/send/route.ts',
    'app/api/request-notifications/route.ts',
    'app/api/demo-request/route.ts',
  ]) {
    it(`${routePath} requires a provider message id before audit or success`, () => {
      const source = read(routePath)
      const sendIndex = source.indexOf('await resend.emails.send({')
      const idIndex = source.indexOf('const providerMessageId = String(data?.id', sendIndex)
      const confirmationIndex = source.indexOf('!providerMessageId', idIndex)
      const successIndex = source.indexOf(
        'return NextResponse.json({ ok: true, id: providerMessageId })',
        confirmationIndex,
      )

      expect(sendIndex).toBeGreaterThanOrEqual(0)
      expect(idIndex).toBeGreaterThan(sendIndex)
      expect(confirmationIndex).toBeGreaterThan(idIndex)
      expect(successIndex).toBeGreaterThan(confirmationIndex)
      expect(source).not.toContain('id: data?.id || null')
    })
  }

  it('requires a provider message id and confirmed parish state for Daily Brief success', () => {
    const source = read('app/api/parish/daily-brief/route.ts')
    const sendIndex = source.indexOf('await resend.emails.send({')
    const providerConfirmationIndex = source.indexOf('!providerMessageId', sendIndex)
    const stateHelperIndex = source.indexOf('async function recordDailyBriefState')
    const stateConfirmationIndex = source.indexOf('!data?.id', stateHelperIndex)
    const manualSendIndex = source.indexOf(
      'const id = await sendBriefEmail({ loaded, appUrl: resolveAppOrigin(request), now })',
    )
    const manualStateIndex = source.indexOf(
      'const stateRecorded = await recordDailyBriefState({',
      manualSendIndex,
    )
    const partialGuidanceIndex = source.indexOf(
      'Daily brief was accepted by the email provider, but Vinea could not record delivery.',
      manualStateIndex,
    )
    const manualSuccessIndex = source.indexOf(
      'return NextResponse.json({ ok: true, id, to: loaded.toEmail }',
      partialGuidanceIndex,
    )

    expect(providerConfirmationIndex).toBeGreaterThan(sendIndex)
    expect(source.slice(stateHelperIndex, stateConfirmationIndex)).toMatch(
      /\.from\('parishes'\)[\s\S]*?\.update\(input\.patch\)[\s\S]*?\.eq\('id', input\.parishId\)[\s\S]*?\.select\('id'\)[\s\S]*?\.maybeSingle\(\)/,
    )
    expect(stateConfirmationIndex).toBeGreaterThan(stateHelperIndex)
    expect(manualStateIndex).toBeGreaterThan(manualSendIndex)
    expect(partialGuidanceIndex).toBeGreaterThan(manualStateIndex)
    expect(manualSuccessIndex).toBeGreaterThan(partialGuidanceIndex)
  })

  it('keeps cron accepted-but-unrecorded sends out of the clean sent list', () => {
    const source = read('app/api/parish/daily-brief/route.ts')
    const cronIndex = source.indexOf('export async function GET(request: NextRequest)')
    const stateIndex = source.indexOf('const stateRecorded = await recordDailyBriefState({', cronIndex)
    const sentPushIndex = source.indexOf('sent.push({ parishId:', stateIndex)
    const failedPushIndex = source.indexOf("error: 'Daily brief sent, but delivery state was not recorded.'", stateIndex)

    expect(stateIndex).toBeGreaterThan(cronIndex)
    expect(sentPushIndex).toBeGreaterThan(stateIndex)
    expect(failedPushIndex).toBeGreaterThan(sentPushIndex)
  })

  it('documents provider acknowledgement and Daily Brief partial-success boundaries', () => {
    const doc = read('docs/OUTBOUND_EMAIL_DELIVERY_PERSISTENCE_BOUNDARY_20260711.md')

    for (const phrase of [
      'non-empty provider message id',
      'request notification',
      'staff-request email',
      'public demo request',
      'Daily Brief',
      'minimal parish id',
      'accepted by the email provider',
      'No email was sent',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
