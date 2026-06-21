import type { RequestDocument } from './requestDocuments'

export function redactFamilyPortalDocuments(
  documents: readonly RequestDocument[],
  familyStepIds: readonly string[]
): RequestDocument[] {
  const allowedStepIds = new Set(familyStepIds)
  return documents
    .filter((document) => document.workflow_step_id && allowedStepIds.has(document.workflow_step_id))
    .map((document) => ({
      ...document,
      uploaded_by_email: null,
      reviewed_by_email: null,
      review_note: null,
    }))
}
