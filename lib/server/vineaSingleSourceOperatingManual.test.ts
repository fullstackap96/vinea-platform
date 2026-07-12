import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string): string {
  return readFileSync(join(root, path), 'utf8')
}

describe('Vinea single source operating manual', () => {
  const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

  it('uses the permanent operating-manual structure', () => {
    for (const heading of [
      '## Executive Vision',
      '## Product Strategy',
      '## Vinea Principles',
      '## Product Architecture',
      '## Engineering Standards',
      '## Official AI And Operating Stack',
      '## AI Operating Model',
      '## Security And Trust',
      '## Sales And Customer Success',
      '## Company Operating System',
      '## Documentation Standards',
      '## Codex Operating Instructions',
      '## Current Production Gates',
    ]) {
      expect(ssot).toContain(heading)
    }
  })

  it('defines the approved company operating stack', () => {
    for (const stackItem of [
      '### ChatGPT',
      '### Codex',
      '### Supabase',
      '### Vercel',
      '### Microsoft 365 / Vinea Outlook',
      'Product strategy',
      'Autonomous engineering work',
      'RLS',
      'Production runtime',
      'Parish communications',
    ]) {
      expect(ssot).toContain(stackItem)
    }
  })

  it('keeps production claims and sensitive actions gated', () => {
    for (const boundary of [
      'Production deployment approval',
      'Membership-aware operational RLS promotion',
      'Public trust-center claims',
      'AI safety-chain runtime parity',
      'Alex approval is required',
      'AI assists; staff decide',
    ]) {
      expect(ssot).toContain(boundary)
    }
  })

  it('does not describe Hermes Agent or OpenClaw as active Vinea tools', () => {
    expect(ssot).toContain(
      "Hermes Agent and OpenClaw are not part of Vinea's current operating workflow",
    )
    expect(ssot).not.toContain('Hermes Agent is part of Vinea')
    expect(ssot).not.toContain('OpenClaw is part of Vinea')
    expect(ssot).not.toContain('Use Hermes Agent')
    expect(ssot).not.toContain('Use OpenClaw')
  })

  it('preserves source guard markers depended on by focused docs tests', () => {
    for (const marker of [
      'Vinea Autonomous Operating System',
      'Daily Office Handoff Digest Browser QA recheck was blocked',
      'Request-Bound Staff Email Authorization boundary',
      'Parish Health Score continuity-clear empty-state cue',
      'Sacramental Record Continuity Card',
      'Workflow Reminders V1 Runtime Approval Packet',
    ]) {
      expect(ssot).toContain(marker)
    }
  })
})
