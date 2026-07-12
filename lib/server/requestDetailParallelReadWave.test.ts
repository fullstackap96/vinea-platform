import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const source = read('app/dashboard/requests/[id]/page.tsx')

function loadRequestBlock() {
  const start = source.indexOf('async function loadRequest()')
  const end = source.indexOf('async function toggleChecklistItem', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Request Detail parallel scoped read wave', () => {
  it('keeps detail access authorization before every support read', () => {
    const block = loadRequestBlock()
    const accessIndex = block.indexOf('/detail-access`')
    const parallelIndex = block.indexOf('await Promise.all([')

    expect(accessIndex).toBeGreaterThanOrEqual(0)
    expect(parallelIndex).toBeGreaterThan(accessIndex)
    for (const route of [
      '/workflow-support`',
      '/communications`',
      '/notes`',
      '/type-support`',
    ]) {
      expect(block.indexOf(route)).toBeGreaterThan(accessIndex)
    }
  })

  it('loads all independent scoped support reads in one parallel wave', () => {
    const block = loadRequestBlock()
    const parallelStart = block.indexOf('await Promise.all([')
    const parallelEnd = block.indexOf('])', parallelStart)
    const parallelWave = block.slice(parallelStart, parallelEnd)

    for (const loader of [
      'loadWorkflowSupport()',
      'loadCommunications()',
      'loadNotes()',
      'loadTypeSupport()',
      'loadActivityEvents(String(requestData.id), signal)',
    ]) {
      expect(parallelWave).toContain(loader)
    }
  })

  it('preserves parser and partial-data fallbacks for each support read', () => {
    const block = loadRequestBlock()

    expect(block).toContain('parseRequestChecklistItems(workflowSupportData.checklistItems)')
    expect(block).toContain('parseRequestCommunications(communicationsData.communications)')
    expect(block).toContain('parseRequestTypeSupport(typeSupportData)')
    expect(block).toContain('setChecklistItems([])')
    expect(block).toContain('setWorkflowSteps([])')
    expect(block).toContain('setCommunications([])')
    expect(block).toContain('setRequestNotes([])')
    expect(block).toContain('linkedSacramentalRecord: null')
  })

  it('settles the loading state after unexpected access or composition failures', () => {
    const block = loadRequestBlock()
    const coreIndex = block.indexOf('async function loadRequestCore(signal: AbortSignal)')
    const wrapper = block.slice(0, coreIndex)
    const catchIndex = wrapper.indexOf('} catch (error) {')
    const finallyIndex = wrapper.indexOf('} finally {')

    expect(coreIndex).toBeGreaterThan(0)
    expect(catchIndex).toBeGreaterThan(0)
    expect(finallyIndex).toBeGreaterThan(catchIndex)
    expect(wrapper.slice(catchIndex, finallyIndex)).toContain(
      "setErrorMessage(requestDetailClientFailureMessage('verifyAccess'))",
    )
    expect(wrapper.slice(finallyIndex)).toContain('setLoading(false)')
  })

  it('documents the performance and safety boundary', () => {
    const doc = read('docs/REQUEST_DETAIL_PARALLEL_SCOPED_READ_WAVE_20260711.md')

    for (const phrase of [
      'REQUEST_DETAIL_PARALLEL_SCOPED_READ_WAVE_IMPLEMENTED_20260711',
      'authorization first',
      'one parallel wave',
      'partial-data fallbacks',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
