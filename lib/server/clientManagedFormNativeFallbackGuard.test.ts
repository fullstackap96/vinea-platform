import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const appRoot = join(process.cwd(), 'app')

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return collectTsxFiles(path)
    return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : []
  })
}

function jsxAttribute(
  node: ts.JsxOpeningLikeElement,
  name: string,
): ts.JsxAttribute | undefined {
  return node.attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  )
}

describe('client-managed form native fallback guard', () => {
  it('requires every form with an onSubmit handler to declare POST explicitly', () => {
    const violations: string[] = []

    for (const file of collectTsxFiles(appRoot)) {
      const source = readFileSync(file, 'utf8')
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )

      function visit(node: ts.Node) {
        if (
          (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          node.tagName.getText() === 'form' &&
          jsxAttribute(node, 'onSubmit')
        ) {
          const method = jsxAttribute(node, 'method')
          const value = method?.initializer

          if (!value || !ts.isStringLiteral(value) || value.text.toLowerCase() !== 'post') {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
            violations.push(`${file}:${line}`)
          }
        }

        ts.forEachChild(node, visit)
      }

      visit(sourceFile)
    }

    expect(violations).toEqual([])
  })
})
