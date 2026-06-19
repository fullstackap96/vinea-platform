import { describe, expect, it } from 'vitest'
import {
  buildWorkflowPlaybookSuggestion,
  getWorkflowPlaybook,
} from '@/lib/workflowPlaybooks'

describe('workflow playbooks', () => {
  it('returns Catholic parish-office playbooks for sacramental request types', () => {
    expect(getWorkflowPlaybook('funeral')?.title).toContain('Funeral')
    expect(getWorkflowPlaybook('wedding')?.items.length).toBeGreaterThan(5)
    expect(getWorkflowPlaybook('baptism')?.items.some((item) => item.itemName.includes('godparent'))).toBe(true)
    expect(getWorkflowPlaybook('ocia')?.items.some((item) => item.itemName.includes('OCIA'))).toBe(true)
  })

  it('ignores unsupported request types', () => {
    expect(getWorkflowPlaybook('join_parish')).toBeNull()
    expect(
      buildWorkflowPlaybookSuggestion({
        requestType: 'join_parish',
        checklistItems: [],
      })
    ).toBeNull()
  })

  it('suggests only missing checklist items', () => {
    const suggestion = buildWorkflowPlaybookSuggestion({
      requestType: 'funeral',
      checklistItems: [
        { item_name: 'Initial family contact / pastoral care' },
        { item_name: 'Coordinate with funeral home' },
        { item_name: 'Post-funeral family follow-up' },
      ],
    })

    expect(suggestion?.playbook.requestType).toBe('funeral')
    expect(suggestion?.existingCount).toBeGreaterThanOrEqual(2)
    expect(suggestion?.missingItems.some((item) => item.itemName.includes('funeral home'))).toBe(false)
    expect(suggestion?.missingItems.some((item) => item.itemName.includes('readings'))).toBe(true)
  })
})
