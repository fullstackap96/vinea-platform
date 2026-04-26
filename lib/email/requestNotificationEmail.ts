type RequestType = 'baptism' | 'funeral' | 'wedding' | 'ocia' | 'join_parish'

export type RequestNotificationPayload = {
  requestId: string
  requestType: RequestType
  contactName: string
  contactEmail: string
  contactPhone: string
  childName?: string
  notes?: string
  requestSpecificSummary?: string
  joinParish?: {
    address?: string
    baptized?: string
    confirmed?: string
    firstCommunion?: string
    interestedInOcia?: string
    reason?: string
  }
}

function requestTypeDisplayLabel(requestType: RequestType): string {
  if (requestType === 'ocia') return 'OCIA Inquiry'
  if (requestType === 'join_parish') return 'Parish Registration Inquiry'
  return requestType.slice(0, 1).toUpperCase() + requestType.slice(1)
}

function subjectRequestTypeLabel(requestType: RequestType): string {
  if (requestType === 'ocia') return 'OCIA Inquiry'
  if (requestType === 'join_parish') return 'Parish Registration Inquiry'
  return `${requestTypeDisplayLabel(requestType)} Request`
}

function normalizeBaseUrl(raw: string | undefined | null): string | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  return s.replace(/\/+$/, '')
}

function safeSingleLine(value: unknown, fallback = ''): string {
  const s = String(value ?? '').replace(/\r/g, '').trim()
  if (!s) return fallback
  // Prevent header/body formatting injection via newlines.
  return s.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
}

function safeMultiline(value: unknown, maxChars = 2000): string | null {
  const raw = String(value ?? '').replace(/\r/g, '').trim()
  if (!raw) return null
  // Keep it readable, but avoid huge blocks or tricky formatting.
  const cleaned = raw
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, maxChars)
    .trim()
  return cleaned || null
}

export function buildRequestNotificationEmail(input: {
  payload: RequestNotificationPayload
  appBaseUrl: string | null
  logoUrl?: string | null
}): {
  subject: string
  text: string
  html: string
  dashboardPath: string
  dashboardUrl: string | null
} {
  const { payload, appBaseUrl } = input

  const safeName = safeSingleLine(payload.contactName, 'Unknown contact')
  const subject =
    payload.requestType === 'join_parish'
      ? `New Parish Registration Inquiry from ${safeName}`
      : `New ${subjectRequestTypeLabel(payload.requestType)} from ${safeName}`

  const dashboardPath = `/dashboard/requests/${payload.requestId}`
  const base = normalizeBaseUrl(appBaseUrl)
  const dashboardUrl = base ? `${base}${dashboardPath}` : null

  const requestTypeLabel = requestTypeDisplayLabel(payload.requestType)
  const contactName = safeSingleLine(payload.contactName)
  const contactEmail = safeSingleLine(payload.contactEmail)
  const contactPhone = safeSingleLine(payload.contactPhone)
  const childName = safeSingleLine(payload.childName)
  const notes = safeMultiline(payload.notes)
  const requestSpecificSummary = safeMultiline(payload.requestSpecificSummary)
  const joinParish = payload.joinParish ?? null

  const lines: string[] = []

  lines.push('A new request has been submitted through your parish intake form.')
  lines.push('')
  lines.push('Request Overview')
  lines.push(`Request type: ${requestTypeLabel}`)
  lines.push(`Submitted by: ${contactName}`)
  lines.push(`Email: ${contactEmail}`)
  lines.push(`Phone: ${contactPhone}`)

  const detailLines: string[] = []
  if (payload.requestType === 'baptism' && childName) {
    detailLines.push(`Child name: ${childName}`)
  }
  if (payload.requestType === 'join_parish' && joinParish) {
    const address = safeSingleLine(joinParish.address)
    const baptized = safeSingleLine(joinParish.baptized)
    const confirmed = safeSingleLine(joinParish.confirmed)
    const firstCommunion = safeSingleLine(joinParish.firstCommunion)
    const interestedInOcia = safeSingleLine(joinParish.interestedInOcia)
    const reason = safeSingleLine(joinParish.reason)

    if (address) detailLines.push(`Address: ${address}`)
    const sacParts = [
      baptized ? `Baptized: ${baptized}` : null,
      confirmed ? `Confirmed: ${confirmed}` : null,
      firstCommunion ? `First Communion: ${firstCommunion}` : null,
    ].filter(Boolean)
    if (sacParts.length) {
      detailLines.push('Sacramental status:')
      detailLines.push(`- ${sacParts.join('\n- ')}`)
    }
    if (interestedInOcia) detailLines.push(`Interested in OCIA: ${interestedInOcia}`)
    if (reason) detailLines.push(`Reason: ${reason}`)
  }
  if (requestSpecificSummary) {
    detailLines.push(requestSpecificSummary)
  }
  if (notes) {
    detailLines.push(`Notes:\n${notes}`)
  }

  if (detailLines.length > 0) {
    lines.push('')
    lines.push('Request Details')
    lines.push(...detailLines)
  }

  lines.push('')
  lines.push(
    'Next step: Open this request in Vinea to review details, assign staff, and follow up with the family.'
  )
  lines.push('')
  lines.push('Open request in Vinea:')
  lines.push(dashboardUrl ?? dashboardPath)

  lines.push('')
  lines.push('—')
  lines.push('This notification was generated by Vinea Platform')
  lines.push('Parish Operations, simplified')

  function escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function htmlPreWrap(value: string): string {
    // Convert newline text into <br/> lines (already cleaned by safeMultiline).
    return escapeHtml(value).replace(/\n/g, '<br/>')
  }

  function normalizeLogoUrl(raw: unknown): string | null {
    const s = safeSingleLine(raw, '')
    if (!s) return null
    // Require absolute URL for email clients (avoid accidental relative URLs).
    if (!/^https?:\/\//i.test(s)) return null
    return s
  }

  const title =
    payload.requestType === 'ocia'
      ? 'New OCIA Inquiry'
      : payload.requestType === 'join_parish'
        ? 'New Parish Registration Inquiry'
        : `New ${requestTypeLabel} Request`
  const ctaHref = dashboardUrl ?? dashboardPath
  const logoUrl = normalizeLogoUrl(input.logoUrl)

  const htmlDetails: Array<{ label: string; valueHtml: string }> = []
  if (payload.requestType === 'baptism' && childName) {
    htmlDetails.push({ label: 'Child name', valueHtml: escapeHtml(childName) })
  }
  if (payload.requestType === 'join_parish' && joinParish) {
    const address = safeSingleLine(joinParish.address)
    const baptized = safeSingleLine(joinParish.baptized)
    const confirmed = safeSingleLine(joinParish.confirmed)
    const firstCommunion = safeSingleLine(joinParish.firstCommunion)
    const interestedInOcia = safeSingleLine(joinParish.interestedInOcia)
    const reason = safeSingleLine(joinParish.reason)

    if (address) htmlDetails.push({ label: 'Address', valueHtml: escapeHtml(address) })
    const sac = [baptized, confirmed, firstCommunion].filter(Boolean).join(' · ')
    if (sac) {
      htmlDetails.push({
        label: 'Sacramental status',
        valueHtml: escapeHtml(
          [
            baptized ? `Baptized: ${baptized}` : null,
            confirmed ? `Confirmed: ${confirmed}` : null,
            firstCommunion ? `First Communion: ${firstCommunion}` : null,
          ]
            .filter(Boolean)
            .join(' · ')
        ),
      })
    }
    if (interestedInOcia) {
      htmlDetails.push({
        label: 'Interested in OCIA',
        valueHtml: escapeHtml(interestedInOcia),
      })
    }
    if (reason) htmlDetails.push({ label: 'Reason', valueHtml: escapeHtml(reason) })
  }
  if (requestSpecificSummary) {
    htmlDetails.push({ label: 'Summary', valueHtml: htmlPreWrap(requestSpecificSummary) })
  }
  if (notes) {
    htmlDetails.push({ label: 'Notes', valueHtml: htmlPreWrap(notes) })
  }

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
          <img src="${escapeHtml(logoUrl)}" alt="Vinea Platform" style="display:block;max-width:120px;height:auto;border:0;outline:none;text-decoration:none;" />
        </div>`
            : `<div style="font-family:Arial, Helvetica, sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin:0 0 10px 2px;">
          VINEA PLATFORM
        </div>`
        }
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;box-sizing:border-box;">
          <div style="font-family:Arial, Helvetica, sans-serif;font-size:20px;line-height:1.3;font-weight:700;color:#111827;margin:0 0 10px 0;">
            ${escapeHtml(title)}
          </div>
          <div style="font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.4;color:#6b7280;margin:0 0 14px 0;">
            Submitted through Vinea Platform
          </div>
          <div style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.55;color:#374151;margin:0 0 16px 0;">
            A new request has been submitted through your parish intake form.
          </div>

          <div style="font-family:Arial, Helvetica, sans-serif;font-size:13px;line-height:1.4;font-weight:700;color:#111827;margin:0 0 8px 0;">
            Request Overview
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px 0;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;width:160px;">Request type</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;">${escapeHtml(requestTypeLabel)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;">Submitted by</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;">${escapeHtml(contactName)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;">Email</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;">${escapeHtml(contactEmail)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;">Phone</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;">${escapeHtml(contactPhone)}</td>
            </tr>
          </table>

          ${
            htmlDetails.length > 0
              ? `<div style="font-family:Arial, Helvetica, sans-serif;font-size:13px;line-height:1.4;font-weight:700;color:#111827;margin:0 0 8px 0;">
            Request Details
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px 0;">
            ${htmlDetails
              .map(
                (row) => `<tr>
              <td style="padding:6px 0;color:#6b7280;font-family:Arial, Helvetica, sans-serif;font-size:13px;width:160px;vertical-align:top;">${escapeHtml(
                row.label
              )}</td>
              <td style="padding:6px 0;color:#111827;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:600;vertical-align:top;">${row.valueHtml}</td>
            </tr>`
              )
              .join('')}
          </table>`
              : ''
          }

          <div style="font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.55;color:#374151;margin:0 0 14px 0;">
            <strong style="color:#111827;">Next step:</strong> Open this request in Vinea to review details, assign staff, and follow up with the family.
          </div>

          <div style="margin:18px 0 0 0;padding-top:16px;border-top:1px solid #f3f4f6;">
            <div style="margin:0 0 10px 0;font-family:Arial, Helvetica, sans-serif;font-size:13px;color:#111827;font-weight:700;">
              Open request in Vinea:
            </div>
            <a href="${escapeHtml(ctaHref)}"
               style="display:inline-block;background-color:#5b21b6;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;padding:12px 16px;border-radius:10px;">
              Open request in Vinea
            </a>
          </div>

          <div style="font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.5;color:#6b7280;border-top:1px solid #f3f4f6;padding-top:14px;margin-top:18px;">
            This notification was generated by Vinea Platform.<br/>
            Parish operations, simplified.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`

  return { subject, text: lines.join('\n'), html, dashboardPath, dashboardUrl }
}

