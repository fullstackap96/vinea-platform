import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('parish admin audited update persistence boundary', () => {
  it.each([
    {
      path: 'app/api/parish/settings/route.ts',
      update: '.update({',
      audit: "action: 'parish_settings.updated'",
    },
    {
      path: 'app/api/parish/public-intake-routing/route.ts',
      update: '.update(normalized.patch)',
      audit: "action: 'public_intake_routing.updated'",
    },
  ])('$path confirms the updated parish before audit history', ({ path, update, audit }) => {
    const source = read(path)
    const updateIndex = source.lastIndexOf(update)
    const selectIndex = source.indexOf(".select('id')", updateIndex)
    const completionIndex = source.indexOf('.maybeSingle()', selectIndex)
    const confirmationIndex = source.lastIndexOf('!updatedParish?.id')
    const auditIndex = source.lastIndexOf(audit)

    expect(updateIndex).toBeGreaterThan(-1)
    expect(selectIndex).toBeGreaterThan(updateIndex)
    expect(completionIndex).toBeGreaterThan(selectIndex)
    expect(confirmationIndex).toBeGreaterThan(completionIndex)
    expect(auditIndex).toBeGreaterThan(confirmationIndex)
  })

  it('documents the scoped runtime and production boundaries', () => {
    const evidence = read('docs/PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md')

    for (const phrase of [
      'PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_IMPLEMENTED_20260711',
      'Parish Settings and Public Intake Routing metadata',
      'minimal persisted parish id',
      'write no false `parish_settings.updated` or `public_intake_routing.updated` event',
      'Public intake runtime routing remains separately gated and unchanged',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
