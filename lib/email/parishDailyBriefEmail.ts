import type { ParishOpsBrief } from '@/lib/parishOpsBrief'

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function absoluteHref(appUrl: string, href: string): string {
  const base = appUrl.replace(/\/+$/, '')
  if (!href) return base
  if (/^https?:\/\//i.test(href)) return href
  return `${base}${href.startsWith('/') ? href : `/${href}`}`
}

export function buildParishDailyBriefSubject(input: {
  parishName: string
  dateLabel: string
}): string {
  return `Today's Vinea parish brief - ${input.parishName} - ${input.dateLabel}`
}

export function renderParishDailyBriefText(input: {
  parishName: string
  dateLabel: string
  brief: ParishOpsBrief
  appUrl: string
}): string {
  const focus =
    input.brief.focusItems.length > 0
      ? input.brief.focusItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.requestTypeLabel}: ${item.title}\n   Next: ${item.nextStepTitle}\n   Owner: ${item.ownerLabel}\n   Blocker: ${item.blockerLabel}\n   Open: ${absoluteHref(input.appUrl, item.href)}`
          )
          .join('\n\n')
      : 'No urgent focus rows are currently flagged.'

  return [
    `Vinea Daily Parish Brief`,
    `${input.parishName} - ${input.dateLabel}`,
    '',
    input.brief.headline,
    input.brief.subline,
    '',
    `First action: ${input.brief.firstAction}`,
    '',
    'Today at a glance:',
    `- First contact needed: ${input.brief.today.firstContactNeeded}`,
    `- Follow-ups due today: ${input.brief.today.followUpsDueToday}`,
    `- Overdue follow-ups: ${input.brief.today.overdueFollowUps}`,
    `- Urgent funerals: ${input.brief.today.urgentFunerals}`,
    `- Missing confirmed dates/times: ${input.brief.today.missingConfirmedSchedules}`,
    `- Blocked requests: ${input.brief.today.blocked}`,
    `- Completed requests: ${input.brief.today.completed}`,
    '',
    'Start here:',
    focus,
    '',
    `Open Vinea: ${absoluteHref(input.appUrl, '/dashboard')}`,
  ].join('\n')
}

export function renderParishDailyBriefHtml(input: {
  parishName: string
  dateLabel: string
  brief: ParishOpsBrief
  appUrl: string
}): string {
  const brief = input.brief
  const focusHtml =
    brief.focusItems.length > 0
      ? brief.focusItems
          .map((item) => {
            const href = absoluteHref(input.appUrl, item.href)
            return `
              <li style="margin:0 0 12px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
                <div style="font-size:12px;font-weight:700;color:#4b5563;text-transform:uppercase;">${escapeHtml(
                  item.requestTypeLabel
                )} - ${escapeHtml(item.actionLabel)}</div>
                <div style="margin-top:6px;font-size:16px;font-weight:700;color:#111827;">${escapeHtml(
                  item.nextStepTitle
                )}</div>
                <div style="margin-top:4px;font-size:14px;color:#374151;">${escapeHtml(
                  item.title
                )}</div>
                <div style="margin-top:8px;font-size:12px;color:#6b7280;">Owner: ${escapeHtml(
                  item.ownerLabel
                )} | Blocker: ${escapeHtml(item.blockerLabel)}</div>
                <div style="margin-top:10px;"><a href="${escapeHtml(
                  href
                )}" style="color:#1d4ed8;font-weight:700;">Open request</a></div>
              </li>
            `
          })
          .join('')
      : '<li style="color:#374151;">No urgent focus rows are currently flagged.</li>'

  const stat = (label: string, value: number) => `
    <td style="width:50%;padding:10px;border:1px solid #e5e7eb;border-radius:10px;background:#ffffff;">
      <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">${escapeHtml(
        label
      )}</div>
      <div style="margin-top:4px;font-size:24px;font-weight:800;color:#111827;">${value}</div>
    </td>
  `

  return `
    <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:680px;margin:0 auto;padding:24px;">
        <div style="border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;padding:24px;">
          <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">Vinea Daily Parish Brief</div>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;color:#111827;">${escapeHtml(
            input.parishName
          )}</h1>
          <div style="margin-top:4px;font-size:14px;color:#6b7280;">${escapeHtml(
            input.dateLabel
          )}</div>

          <div style="margin-top:20px;padding:16px;border-radius:14px;background:#eef2ff;border:1px solid #dbe4ff;">
            <div style="font-size:20px;font-weight:800;color:#111827;">${escapeHtml(
              brief.headline
            )}</div>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(
              brief.subline
            )}</p>
          </div>

          <div style="margin-top:16px;padding:14px;border-radius:14px;background:#fffbeb;border:1px solid #fde68a;">
            <div style="font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;">First action</div>
            <div style="margin-top:5px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(
              brief.firstAction
            )}</div>
          </div>

          <h2 style="margin:22px 0 10px;font-size:16px;color:#111827;">Today at a glance</h2>
          <table role="presentation" style="width:100%;border-spacing:8px;border-collapse:separate;">
            <tr>${stat('First contact', brief.today.firstContactNeeded)}${stat(
              'Due today',
              brief.today.followUpsDueToday
            )}</tr>
            <tr>${stat('Overdue', brief.today.overdueFollowUps)}${stat(
              'Urgent funerals',
              brief.today.urgentFunerals
            )}</tr>
            <tr>${stat('Missing dates', brief.today.missingConfirmedSchedules)}${stat(
              'Blocked',
              brief.today.blocked
            )}</tr>
          </table>

          <h2 style="margin:22px 0 10px;font-size:16px;color:#111827;">Start here</h2>
          <ol style="margin:0;padding-left:20px;">${focusHtml}</ol>

          <div style="margin-top:22px;">
            <a href="${escapeHtml(
              absoluteHref(input.appUrl, '/dashboard')
            )}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;">Open Vinea dashboard</a>
          </div>
        </div>
      </div>
    </div>
  `
}
