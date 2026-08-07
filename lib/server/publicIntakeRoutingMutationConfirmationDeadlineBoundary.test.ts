import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_TIMEOUT_MS,
  PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE,
} from '../publicIntakeRoutingClientConfirmation'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

function handler(startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

const handlers = [
  ['async function savePublicIntakeRouting', 'async function addPublicRoutingDomain'],
  ['async function addPublicRoutingDomain', 'async function addPublicRoutingToken'],
  ['async function addPublicRoutingToken', 'async function updatePublicRoutingToken'],
  ['async function updatePublicRoutingToken', 'async function updatePublicRoutingDomain'],
  ['async function updatePublicRoutingDomain', 'async function verifyPublicRoutingDomain'],
  ['async function verifyPublicRoutingDomain', 'async function resetPublicRoutingDomainVerification'],
  ['async function resetPublicRoutingDomainVerification', 'const publicRoutingMutationBusy'],
] as const

describe('Public Intake Routing mutation confirmation deadline boundary', () => {
  it('uses one finite deadline and duplicate-aware refresh guidance', () => {
    expect(PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
    expect(PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
    expect(PUBLIC_INTAKE_ROUTING_REFRESH_REQUIRED_MESSAGE).toContain('token list')
  })

  it('captures parish scope and bounds every routing mutation', () => {
    for (const [start, end] of handlers) {
      const block = handler(start, end)
      expect(block).toContain('const mutationParishId = activeParishIdRef.current')
      expect(block).toContain(
        'signal: AbortSignal.timeout(PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(block).toContain('if (activeParishIdRef.current !== mutationParishId) return')
      expect(block).toContain('if (!res.ok)')
      expect(block).toContain('if (!data?.ok)')
      expect(block).toContain('requirePublicRoutingRefresh(')
      expect(block).toContain('confirmPublicRoutingReload(mutationParishId,')
    }
  })

  it('reloads authoritative selected-parish state before any success message', () => {
    for (const [start, end] of handlers) {
      const block = handler(start, end)
      const reload = block.indexOf('confirmPublicRoutingReload(mutationParishId,')
      expect(reload).toBeGreaterThanOrEqual(0)
      const success = Math.max(
        block.indexOf("setPublicIntakeRoutingSaveMessage('Public intake routing metadata saved.')"),
        block.indexOf("setPublicRoutingDomainMessage('Domain added.')"),
        block.indexOf("setPublicRoutingTokenMessage('Token created."),
        block.indexOf('setPublicRoutingTokenMessage(active ?'),
        block.indexOf('setPublicRoutingDomainMessage(active ?'),
        block.indexOf('setPublicRoutingDomainMessage(\n        verification.verified'),
        block.indexOf("setPublicRoutingDomainMessage('Domain verification token reset.')"),
      )
      expect(success).toBeGreaterThan(reload)
    }
  })

  it('keeps the acknowledged one-time token visible while a failed reload freezes controls', () => {
    const create = handler(
      'async function addPublicRoutingToken',
      'async function updatePublicRoutingToken',
    )
    expect(create.indexOf('setCreatedPublicRoutingToken(createdToken)')).toBeLessThan(
      create.indexOf('confirmPublicRoutingReload(mutationParishId,'),
    )
    expect(source).toContain('setCreatedPublicRoutingToken(null)')
    expect(source).toContain(
      'publicRoutingTokenSaving ||\n    publicRoutingMutationRequiresRefresh',
    )
    expect(source).not.toContain('setTimeout(() => addPublicRoutingToken')
  })
})
