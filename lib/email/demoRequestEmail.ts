type DemoRequestPayload = {
  name: string
  parishName: string
  email: string
  roleTitle?: string
  message?: string
}

function safeSingleLine(value: unknown, fallback = ''): string {
  const s = String(value ?? '').replace(/\r/g, '').trim()
  if (!s) return fallback
  return s.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
}

function safeMultiline(value: unknown, maxChars = 2500): string | null {
  const raw = String(value ?? '').replace(/\r/g, '').trim()
  if (!raw) return null
  const cleaned = raw
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, maxChars)
    .trim()
  return cleaned || null
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function htmlPreWrap(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br/>')
}

export function buildDemoRequestEmail(input: {
  payload: DemoRequestPayload
  logoUrl?: string | null
}): { subject: string; text: string; html: string } {
  const name = safeSingleLine(input.payload.name, 'Unknown')
  const parishName = safeSingleLine(input.payload.parishName, 'Unknown parish')
  const email = safeSingleLine(input.payload.email, '—')
  const roleTitle = safeSingleLine(input.payload.roleTitle, '')
  const message = safeMultiline(input.payload.message)

  const subject = `New Vinea Demo Request — ${parishName}`

  const lines: string[] = []
  lines.push('A new demo request was submitted on usevinea.com.')
  lines.push('')
  lines.push(`Name: ${name}`)
  lines.push(`Parish: ${parishName}`)
  lines.push(`Email: ${email}`)
  if (roleTitle) lines.push(`Role / title: ${roleTitle}`)
  if (message) {
    lines.push('')
    lines.push('Message:')
    lines.push(message)
  }
  lines.push('')
  lines.push('Submitted from: usevinea.com')

  const detailsRows: Array<{ label: string; valueHtml: string }> = [
    { label: 'Name', valueHtml: escapeHtml(name) },
    { label: 'Parish', valueHtml: escapeHtml(parishName) },
    { label: 'Email', valueHtml: escapeHtml(email) },
  ]
  if (roleTitle) detailsRows.push({ label: 'Role / title', valueHtml: escapeHtml(roleTitle) })
  if (message) detailsRows.push({ label: 'Message', valueHtml: htmlPreWrap(message) })
  detailsRows.push({ label: 'Submitted from', valueHtml: 'usevinea.com' })

  const logoUrlRaw = safeSingleLine(input.logoUrl, '')
  const logoUrl =
    logoUrlRaw && /^https?:\/\//i.test(logoUrlRaw) ? logoUrlRaw : null

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f6fb;color:#111827;">
    <div style="width:100%;padding:24px 12px;box-sizing:border-box;">
      <div style="max-width:600px;margin:0 auto;">
        ${
          logoUrl
            ? `<div style="margin:0 0 10px 2px;">
          <img src="${escapeHtml(logoUrl)}" alt="Vinea" style="display:block;max-width:120px;height:auto;border:0;outline:none;text-decoration:none;" />
        </div>`
            : `<div style="font-family:Arial, Helvetica, sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin:0 0 10px 2px;">
          VINEA
        </div>`
        }
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;box-sizing:border-box;">
          <div style="font-family:Arial, Helvetica, sans-serif;font-size:20px;line-height:1.3;font-weight:700;color:#111827;margin:0 0 10px 0;">
            New demo request
          </div>
          <div style="font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.4;color:#6b7280;margin:0 0 14px 0;">
            Submitted from usevinea.com
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0;">
            ${detailsRows
              .map(
                (row) => `<tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;width:160px;vertical-align:top;">${escapeHtml(
                row.label
              )}</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;vertical-align:top;">${row.valueHtml}</td>
            </tr>`
              )
              .join('')}
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`

  return { subject, text: lines.join('\n'), html }
}

