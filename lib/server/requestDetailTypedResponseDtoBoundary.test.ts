import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), 'utf8')
}

function explicitAnyPositions(source: string): number[] {
  const sourceFile = ts.createSourceFile(
    'request-detail.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const positions: number[] = []

  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) positions.push(node.getStart(sourceFile))
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return positions
}

describe('Request Detail typed response DTO boundary', () => {
  it('parses each core read response before updating staff-facing state', () => {
    const source = read('app', 'dashboard', 'requests', '[id]', 'page.tsx')
    const route = read('app', 'api', 'requests', '[id]', 'detail-access', 'route.ts')

    for (const parser of [
      'parseRequestDetailAccess(accessPayload)',
      'parseRequestChecklistItems(workflowSupportData.checklistItems)',
      'parseRequestCommunications(communicationsData.communications)',
      'parseRequestTypeSupport(typeSupportData)',
    ]) {
      expect(source).toContain(parser)
    }

    expect(source).toContain('useState<RequestDetailRequestDto | null>')
    expect(source).toContain('useState<RequestDetailParishionerDto | null>')
    expect(source).toContain('useState<RequestChecklistItemDto[]>([])')
    expect(source).toContain('useState<RequestCommunicationDto[]>([])')
    expect(route).toContain('parseRequestDetailRequest({')
    expect(route).toContain('parseRequestDetailParishioner(parishionerRow)')
    expect(route).toContain('request: requestDto')
    expect(route).toContain('parishioner: parishionerDto')
  })

  it('keeps Request Detail and its formerly loose components free of explicit any', () => {
    for (const path of [
      ['app', 'dashboard', 'requests', '[id]', 'page.tsx'],
      ['app', 'dashboard', 'requests', '[id]', '_components', 'RequestHeader.tsx'],
      ['app', 'dashboard', 'requests', '[id]', '_components', 'ChecklistSection.tsx'],
    ]) {
      const source = read(...path)
      expect(explicitAnyPositions(source)).toEqual([])
    }
  })

  it('distinguishes TypeScript any from ordinary staff-facing language', () => {
    expect(explicitAnyPositions('const message = "Review any existing event."')).toEqual([])
    expect(explicitAnyPositions('const unsafe: any = null')).toHaveLength(1)
    expect(explicitAnyPositions('const unsafe = value as any')).toHaveLength(1)
  })

  it('documents the allowlist, fail-closed behavior, and preserved boundaries', () => {
    const evidence = read('docs', 'REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md')
    for (const phrase of [
      'REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_IMPLEMENTED_20260710',
      'allowlisted DTO',
      'active-parish request access',
      'fails closed',
      'Catholic type-specific details',
      'drops unexpected future fields',
      'No production access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
