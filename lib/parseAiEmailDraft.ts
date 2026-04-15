/**
 * Split an AI reply that may begin with `Subject: ...` into subject + body for email fields.
 * Only the first non-empty line is inspected; body keeps line breaks after that line.
 */
export function parseAiEmailDraft(raw: string): {
  hadSubjectLine: boolean
  subject: string
  body: string
} {
  if (raw == null) {
    return { hadSubjectLine: false, subject: '', body: '' }
  }
  const str = String(raw)
  const lines = str.split(/\r?\n/)
  let i = 0
  while (i < lines.length && lines[i].trim() === '') {
    i += 1
  }
  if (i >= lines.length) {
    return { hadSubjectLine: false, subject: '', body: str.trimEnd() }
  }
  const m = lines[i].match(/^Subject:\s*(.*)$/i)
  if (!m) {
    return { hadSubjectLine: false, subject: '', body: str }
  }
  const subject = (m[1] ?? '').trim()
  const rest = lines.slice(i + 1).join('\n')
  const body = rest.replace(/\s+$/, '')
  return { hadSubjectLine: true, subject, body }
}
