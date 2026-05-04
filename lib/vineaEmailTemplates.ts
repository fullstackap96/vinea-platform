/**
 * Vinea — reusable staff email templates for the request detail send flow.
 * Placeholders use `{{name}}` syntax; see {@link renderVineaEmailTemplate}.
 */

export type VineaEmailTemplateId =
  | 'baptism_first_response'
  | 'wedding_first_response'
  | 'funeral_first_response'
  | 'ocia_first_response'
  | 'general_follow_up'
  | 'missing_information'
  | 'schedule_confirmation'

export type VineaEmailTemplateContext = {
  contactName: string
  firstName: string
  requestType: string
  childName: string
  partnerOne: string
  partnerTwo: string
  deceasedName: string
  /** Empty, or a short clause when `deceasedName` is set (for funeral first response). */
  deceasedNameLine: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applyPlaceholders(template: string, ctx: VineaEmailTemplateContext): string {
  const map: Record<string, string> = {
    contactName: ctx.contactName,
    firstName: ctx.firstName,
    requestType: ctx.requestType,
    childName: ctx.childName,
    partnerOne: ctx.partnerOne,
    partnerTwo: ctx.partnerTwo,
    deceasedName: ctx.deceasedName,
    deceasedNameLine: ctx.deceasedNameLine,
  }
  let out = template
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g'), value)
  }
  return out
}

type TemplateDef = {
  id: VineaEmailTemplateId
  label: string
  /** Shown in the template picker for this request type only (empty = always). */
  requestTypes: string[] | null
  subject: string
  body: string
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'baptism_first_response',
    label: 'Baptism — first response',
    requestTypes: ['baptism'],
    subject: 'Thank you for your baptism inquiry',
    body: `Dear {{contactName}},

Thank you for reaching out about baptism for {{childName}}. We have received your request and our parish team will review the details you provided.

A staff member will follow up with you shortly about next steps, preparation, and scheduling. If you have any questions in the meantime, simply reply to this email.

Peace in Christ,
[Your name]
[Parish name]`,
  },
  {
    id: 'wedding_first_response',
    label: 'Wedding — first response',
    requestTypes: ['wedding'],
    subject: 'Thank you for your wedding inquiry',
    body: `Dear {{contactName}},

Thank you for your inquiry regarding the Sacrament of Matrimony. We are grateful that you are considering celebrating your marriage in the Church.

We have received your request and will review the information you submitted. Someone from our parish team will contact you soon about marriage preparation, available dates, and parish requirements.

If anything changes or you have questions, please reply to this message.

Blessings,
[Your name]
[Parish name]`,
  },
  {
    id: 'funeral_first_response',
    label: 'Funeral — first response',
    requestTypes: ['funeral'],
    subject: 'We are holding you in prayer',
    body: `Dear {{contactName}},

Please accept our heartfelt condolences{{deceasedNameLine}}. We are praying for you and your loved ones during this difficult time.

We have received your message and a member of our parish staff will reach out shortly to walk with you regarding funeral arrangements and the liturgy.

If you need immediate pastoral assistance, please contact the parish office by phone.

In the peace of Christ,
[Your name]
[Parish name]`,
  },
  {
    id: 'ocia_first_response',
    label: 'OCIA — first response',
    requestTypes: ['ocia'],
    subject: 'Thank you for your interest in OCIA',
    body: `Dear {{contactName}},

Thank you for contacting us about the Order of Christian Initiation of Adults (OCIA). We are glad you are exploring this journey of faith.

We have received your request and someone from our parish team will be in touch soon with information about inquiry sessions, expectations, and how to begin.

If you have any questions, you are welcome to reply to this email.

In Christ,
[Your name]
[Parish name]`,
  },
  {
    id: 'general_follow_up',
    label: 'General follow-up',
    requestTypes: null,
    subject: 'Following up on your request',
    body: `Dear {{contactName}},

I hope this message finds you well. I am writing to follow up regarding your recent request to our parish.

[Add a brief, specific update or question here.]

Please reply at your convenience, or contact the parish office if you prefer to speak by phone.

Kind regards,
[Your name]
[Parish name]`,
  },
  {
    id: 'missing_information',
    label: 'Missing information request',
    requestTypes: null,
    subject: 'More information needed for your parish request',
    body: `Dear {{contactName}},

Thank you for contacting [Parish name]. As we continue processing your request, we need a few additional details to move forward:

• [Item 1]
• [Item 2]

You can reply to this email with the information, or call the parish office if that is easier.

Thank you for your help.

Sincerely,
[Your name]
[Parish name]`,
  },
  {
    id: 'schedule_confirmation',
    label: 'Schedule confirmation',
    requestTypes: null,
    subject: 'Confirming your date and time',
    body: `Dear {{contactName}},

This message is to confirm the following with our parish:

Date & time: [Insert confirmed date/time]
Location: [Insert location, if applicable]

If this does not match your understanding, please reply as soon as possible so we can adjust.

We look forward to serving you.

Warm regards,
[Your name]
[Parish name]`,
  },
]

/**
 * Builds substitution values from live request / parishioner data (with sensible fallbacks).
 */
export function buildVineaEmailTemplateContext(input: {
  parishioner: { full_name?: unknown } | null | undefined
  request: { request_type?: unknown; child_name?: unknown } | null | undefined
  funeralDetail?: { deceased_name?: unknown } | null
  weddingDetail?: { partner_one_name?: unknown; partner_two_name?: unknown } | null
  funeralDeceasedName?: string
  weddingPartnerOne?: string
  weddingPartnerTwo?: string
}): VineaEmailTemplateContext {
  const full = String(input.parishioner?.full_name ?? '').trim()
  const firstToken = full.split(/\s+/).filter(Boolean)[0] || ''
  const firstName = firstToken || 'Friend'
  const contactName = full || 'Friend'

  const rt = String(input.request?.request_type ?? 'baptism').trim() || 'baptism'
  const child = String(input.request?.child_name ?? '').trim()
  const childName = child || 'your child'

  const p1 = String(
    input.weddingDetail?.partner_one_name ?? input.weddingPartnerOne ?? ''
  ).trim()
  const p2 = String(
    input.weddingDetail?.partner_two_name ?? input.weddingPartnerTwo ?? ''
  ).trim()
  const partnerOne = p1 || 'you'
  const partnerTwo = p2 || 'your fiancé(e)'

  const deceased = String(
    input.funeralDetail?.deceased_name ?? input.funeralDeceasedName ?? ''
  ).trim()
  const deceasedName = deceased || ''
  const deceasedNameLine = deceasedName ? ` on the loss of ${deceasedName}` : ''

  return {
    contactName,
    firstName,
    requestType: rt,
    childName,
    partnerOne,
    partnerTwo,
    deceasedName,
    deceasedNameLine,
  }
}

export function listVineaEmailTemplateOptions(requestType: string): Array<{
  id: VineaEmailTemplateId
  label: string
}> {
  const t = String(requestType || '').trim().toLowerCase()
  return TEMPLATES.filter((def) => {
    if (def.requestTypes == null) return true
    return def.requestTypes.includes(t)
  }).map(({ id, label }) => ({ id, label }))
}

export function renderVineaEmailTemplate(
  id: VineaEmailTemplateId,
  ctx: VineaEmailTemplateContext
): { subject: string; body: string } {
  const def = TEMPLATES.find((d) => d.id === id)
  if (!def) {
    return { subject: '', body: '' }
  }
  return {
    subject: applyPlaceholders(def.subject, ctx),
    body: applyPlaceholders(def.body, ctx),
  }
}
