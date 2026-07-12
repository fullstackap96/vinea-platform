import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const intakeRoutePath = join(root, 'app', 'api', 'intake', 'route.ts')
const docPath = join(root, 'docs', 'PUBLIC_INTAKE_LEGACY_FALLBACK_BOUNDARY_20260708.md')
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')
const roadmapPath = join(root, 'docs', 'VINEA_ROADMAP.md')
const sourceOfTruthPath = join(root, 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md')

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

function functionBody(source: string, name: string): string {
  const start = source.indexOf(`async function ${name}`)
  expect(start, `Missing function ${name}`).toBeGreaterThanOrEqual(0)

  const nextFunction = source.indexOf('\nasync function ', start + 1)
  const nextExport = source.indexOf('\nexport async function ', start + 1)
  const endCandidates = [nextFunction, nextExport].filter((index) => index > start)
  const end = endCandidates.length ? Math.min(...endCandidates) : source.length
  return source.slice(start, end)
}

describe('public intake legacy fallback boundary', () => {
  it('keeps the first-parish legacy fallback isolated in the compatibility loader', () => {
    const source = read(intakeRoutePath)
    const legacyLoader = functionBody(source, 'primaryParishId')
    const postRoute = functionBody(source, 'POST')

    expect(legacyLoader).toContain('Deliberate legacy fallback only')
    expect(legacyLoader).toContain(".from('parishes')")
    expect(legacyLoader).toContain(".order('created_at', { ascending: true })")
    expect(legacyLoader).toContain('.limit(1)')

    expect(postRoute).toContain('loadLegacyPrimaryParishId: () => primaryParishId(admin)')
    expect(postRoute).toContain('const gate = getPublicIntakeRoutingRuntimeGate()')
    expect(postRoute).toContain('resolvePublicIntakeRequestParishScopeForFutureRuntime')
    expect(postRoute).not.toContain(".order('created_at', { ascending: true })")
    expect(postRoute).not.toContain('.limit(1)')
  })

  it('keeps the disabled runtime routing boundary and generic route metadata intact', () => {
    const source = read(intakeRoutePath)
    const postRoute = functionBody(source, 'POST')

    expect(postRoute).toContain('extractPublicIntakeRouteSignalsForDryRun')
    expect(postRoute).toContain('routingInput: routeSignals.routingInput')
    expect(postRoute).toContain('resolvePublicIntakeParishScope(')
    expect(postRoute).toContain('createSupabasePublicIntakeParishScopeDataSource(admin)')
    expect(postRoute).toContain('metadata: { requestType, workflowStepsCreated, ...scope.auditMetadata }')
    expect(postRoute).not.toContain('metadata: { requestType, fullName')
    expect(postRoute).not.toContain('parish_public_intake_tokens')
    expect(postRoute).not.toContain('parish_public_intake_domains')
    expect(postRoute).not.toContain('token_hash')
    expect(postRoute).not.toContain('verification_dns_value')
  })

  it('documents the fallback as intentional and production-gated', () => {
    const doc = read(docPath)
    const buildStatus = read(buildStatusPath)
    const roadmap = read(roadmapPath)
    const sourceOfTruth = read(sourceOfTruthPath)

    for (const expected of [
      'Public Intake Legacy Fallback Boundary - 2026-07-08',
      'legacy fallback only',
      'runtime public intake routing remains disabled by default',
      'does not enable production public intake routing',
      'does not change public intake behavior',
      'does not apply migrations',
      'does not change operational RLS',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Public Intake Legacy Fallback Boundary')
    expect(roadmap).toContain('Public Intake Legacy Fallback Boundary')
    expect(sourceOfTruth).toContain('Public Intake Legacy Fallback Boundary')
  })
})
