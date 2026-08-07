import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const requestDetailPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'requests',
  '[id]',
  'page.tsx',
)

describe('Request Detail email template confirmation dialog', () => {
  it('replaces the native prompt with a busy-safe Vinea review step', () => {
    const source = readFileSync(requestDetailPath, 'utf8')

    for (const phrase of [
      "import { VineaConfirmDialog }",
      'const [pendingEmailTemplateId, setPendingEmailTemplateId]',
      'const [emailTemplateApplying, setEmailTemplateApplying]',
      'setPendingEmailTemplateId(templateId)',
      '!pendingEmailTemplateId ||',
      'emailTemplateApplying ||',
      'aiGenerationInFlightRef.current ||',
      'aiPersistenceInFlightRef.current ||',
      'workflowMutationRequiresRefresh',
      'title="Replace the current email draft?"',
      'confirmLabel="Replace with template"',
      'busy={emailTemplateApplying}',
      'busyLabel="Replacing..."',
      'onCancel={() => setPendingEmailTemplateId(null)}',
    ]) {
      expect(source).toContain(phrase)
    }

    expect(source).not.toContain('window.confirm')
  })

  it('keeps template application staff-reviewed and on the existing scoped draft route', () => {
    const source = readFileSync(requestDetailPath, 'utf8')
    const applyStart = source.indexOf('async function applyVineaEmailTemplateNow')
    const confirmStart = source.indexOf('async function confirmVineaEmailTemplate')
    const applySource = source.slice(applyStart, confirmStart)

    expect(applyStart).toBeGreaterThan(-1)
    expect(confirmStart).toBeGreaterThan(applyStart)
    expect(applySource).toContain('renderVineaEmailTemplate(templateId, ctx)')
    expect(applySource).toContain('setEmailSubject(subject)')
    expect(applySource).toContain('setReplyDraft(body)')
    expect(applySource).toContain('await saveReplyDraftToRequest(body)')
    expect(applySource).not.toContain("fetch('/api/email/send'")
  })

  it('documents the no-send and active-parish request boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_IMPLEMENTED_20260711',
      'does not send email',
      'existing active-parish request-scoped reply-draft API',
      'No production access',
      'No communication was sent',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
