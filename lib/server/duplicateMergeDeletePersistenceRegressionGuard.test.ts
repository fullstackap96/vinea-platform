import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

type MergeDeleteBoundary = {
  route: string[]
  canonicalUpdateMarker: string
  canonicalConfirmationMarker: string
  firstTransferMarker: string
  finalDeleteMarker: string
  finalConfirmationMarker: string
  auditMarker: string
  intermediateConfirmationMarker: string
  replacementInsertMarker: string
  replacementConfirmationMarker: string
  duplicateRelationshipDeleteMarker: string
}

const boundaries: MergeDeleteBoundary[] = [
  {
    route: ['app', 'api', 'people', 'duplicates', 'route.ts'],
    canonicalUpdateMarker: "const { data: updatedCanonical, error: updateCanonicalError }",
    canonicalConfirmationMarker: '!updatedCanonical?.id',
    firstTransferMarker: "admin\n      .from('requests')",
    finalDeleteMarker: "const { data: deletedPerson, error: deletePersonError }",
    finalConfirmationMarker: '!deletedPerson?.id',
    auditMarker: "action: 'person.merge_completed'",
    intermediateConfirmationMarker: '!deletedMembership?.id',
    replacementInsertMarker:
      'const { data: insertedMembership, error: insertMembershipError }',
    replacementConfirmationMarker: '!insertedMembership?.id',
    duplicateRelationshipDeleteMarker:
      'const { data: deletedMembership, error: deleteMembershipError }',
  },
  {
    route: ['app', 'api', 'households', 'duplicates', 'route.ts'],
    canonicalUpdateMarker: "const { data: updatedCanonical, error: updateCanonicalError }",
    canonicalConfirmationMarker: '!updatedCanonical?.id',
    firstTransferMarker: 'const { data: duplicateMembers',
    finalDeleteMarker: "const { data: deletedHousehold, error: deleteHouseholdError }",
    finalConfirmationMarker: '!deletedHousehold?.id',
    auditMarker: "action: 'household.merge_completed'",
    intermediateConfirmationMarker: '!deletedMember?.id',
    replacementInsertMarker: 'const { data: insertedMember, error: insertError }',
    replacementConfirmationMarker: '!insertedMember?.id',
    duplicateRelationshipDeleteMarker:
      'const { data: deletedMember, error: deleteMemberError }',
  },
]

describe('duplicate merge mutation persistence regression boundary', () => {
  for (const boundary of boundaries) {
    const label = boundary.route.join('/')

    it(`${label} confirms every destructive merge delete`, () => {
      const source = readFileSync(join(process.cwd(), ...boundary.route), 'utf8')

      expect(source).toContain(boundary.finalDeleteMarker)
      expect(source).toContain(boundary.finalConfirmationMarker)
      expect(source).toContain(boundary.intermediateConfirmationMarker)
      expect(source).toMatch(/\.delete\(\)[\s\S]*?\.select\('id'\)[\s\S]*?\.maybeSingle\(\)/)
    })

    it(`${label} confirms the canonical update before linked-row movement`, () => {
      const source = readFileSync(join(process.cwd(), ...boundary.route), 'utf8')
      const updateIndex = source.indexOf(boundary.canonicalUpdateMarker)
      const confirmationIndex = source.indexOf(
        boundary.canonicalConfirmationMarker,
        updateIndex
      )
      const transferIndex = source.indexOf(boundary.firstTransferMarker, confirmationIndex)

      expect(updateIndex).toBeGreaterThanOrEqual(0)
      expect(confirmationIndex).toBeGreaterThan(updateIndex)
      expect(transferIndex).toBeGreaterThan(confirmationIndex)
    })

    it(`${label} confirms replacement membership before deleting the duplicate relationship`, () => {
      const source = readFileSync(join(process.cwd(), ...boundary.route), 'utf8')
      const insertIndex = source.indexOf(boundary.replacementInsertMarker)
      const confirmationIndex = source.indexOf(
        boundary.replacementConfirmationMarker,
        insertIndex
      )
      const deleteIndex = source.indexOf(
        boundary.duplicateRelationshipDeleteMarker,
        confirmationIndex
      )

      expect(insertIndex).toBeGreaterThanOrEqual(0)
      expect(source.slice(insertIndex, confirmationIndex)).toMatch(
        /\.insert\([\s\S]*?\.select\('id'\)[\s\S]*?\.maybeSingle\(\)/
      )
      expect(confirmationIndex).toBeGreaterThan(insertIndex)
      expect(deleteIndex).toBeGreaterThan(confirmationIndex)
    })

    it(`${label} confirms final deletion before completion audit and success`, () => {
      const source = readFileSync(join(process.cwd(), ...boundary.route), 'utf8')
      const finalDeleteIndex = source.indexOf(boundary.finalDeleteMarker)
      const finalConfirmationIndex = source.indexOf(
        boundary.finalConfirmationMarker,
        finalDeleteIndex
      )
      const auditIndex = source.indexOf(boundary.auditMarker, finalConfirmationIndex)
      const successIndex = source.indexOf('return NextResponse.json({', auditIndex)

      expect(finalDeleteIndex).toBeGreaterThanOrEqual(0)
      expect(finalConfirmationIndex).toBeGreaterThan(finalDeleteIndex)
      expect(auditIndex).toBeGreaterThan(finalConfirmationIndex)
      expect(successIndex).toBeGreaterThan(auditIndex)
    })
  }
})
