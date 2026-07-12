import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8')
}

function auditBlock(source: string, action: string): string {
  const actionIndex = source.indexOf(`action: '${action}'`)
  if (actionIndex < 0) throw new Error(`Missing audit action ${action}`)
  const metadataIndex = source.indexOf('metadata:', actionIndex)
  const end = source.indexOf('\n    })', metadataIndex)
  return source.slice(metadataIndex, end < 0 ? source.length : end)
}

describe('operational audit metadata privacy boundary', () => {
  it('keeps public intake and import audit metadata free of names and filenames', () => {
    const intake = auditBlock(read('app/api/intake/route.ts'), 'public_intake.created')
    const imported = auditBlock(read('app/api/imports/route.ts'), 'import.completed')

    expect(intake).toContain('requestType,')
    expect(intake).toContain('workflowStepsCreated,')
    expect(intake).not.toContain('fullName')
    expect(intake).not.toContain('email')
    expect(intake).not.toContain('phone')

    expect(imported).toContain("source: 'staff_import'")
    expect(imported).toContain('kind,')
    expect(imported).toContain('total_rows:')
    expect(imported).not.toContain('file_name')
    expect(imported).not.toContain('fileName')
    expect(imported).not.toContain('filename')
  })

  it('keeps request intake audit metadata free of parishioner contact values', () => {
    const source = read('app/dashboard/requests/actions.ts')
    const block = auditBlock(source, 'request.intake.updated')

    expect(block).toContain('requestType: effectiveRequestType')
    expect(block).toContain('contactUpdated: true')
    expect(block).toContain('requestDetailsUpdated: true')
    expect(block).not.toContain('contactFullName')
    expect(block).not.toContain('fullName')
    expect(block).not.toContain('email')
    expect(block).not.toContain('phone')
  })

  it('keeps duplicate merge audit metadata free of person and household names', () => {
    const people = auditBlock(
      read('app/api/people/duplicates/route.ts'),
      'person.merge_completed'
    )
    const households = auditBlock(
      read('app/api/households/duplicates/route.ts'),
      'household.merge_completed'
    )

    for (const block of [people, households]) {
      expect(block).not.toContain('canonical_name')
      expect(block).not.toContain('duplicate_name')
      expect(block).not.toContain('first_name')
      expect(block).not.toContain('last_name')
    }
  })

  it('keeps document audit metadata free of original filenames and storage material', () => {
    const upload = auditBlock(
      read('app/api/requests/[id]/documents/route.ts'),
      'request.document.uploaded'
    )
    const review = auditBlock(
      read('app/api/requests/[id]/documents/[documentId]/route.ts'),
      'request.document.reviewed'
    )
    const familyUpload = auditBlock(
      read('app/api/family/request-portal/[token]/documents/route.ts'),
      'request.document.family_uploaded'
    )

    for (const block of [upload, review, familyUpload]) {
      expect(block).not.toContain('filename')
      expect(block).not.toContain('original_filename')
      expect(block).not.toContain('storage_path')
      expect(block).not.toContain('signedUrl')
      expect(block).not.toContain('review_note')
    }

    expect(upload).toContain('documentType:')
    expect(upload).toContain('fileSizeBytes:')
    expect(review).toContain('status,')
    expect(review).toContain('summary: requestDocumentStatusLabel(status)')
    expect(familyUpload).toContain('documentType: step.title')
    expect(familyUpload).toContain('fileSizeBytes: file.size')
    expect(familyUpload).toContain("uploadSource: 'family_portal'")
    expect(familyUpload).toContain("summary: 'Family uploaded a requested document.'")
  })
})
