import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const actionsSource = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts'),
  'utf8',
)

describe('request note audit metadata privacy', () => {
  it('keeps internal note text out of request.note.created audit metadata', () => {
    const actionStart = actionsSource.indexOf("action: 'request.note.created'")
    const actionEnd = actionsSource.indexOf('})', actionStart)
    const auditBlock = actionsSource.slice(actionStart, actionEnd)

    expect(actionStart).toBeGreaterThan(-1)
    expect(auditBlock).toContain("source: 'staff_request_detail'")
    expect(auditBlock).toContain('noteLength: body.length')
    expect(auditBlock).not.toContain('summary')
    expect(auditBlock).not.toContain('body.slice')
    expect(auditBlock).not.toContain('body,')
  })
})
