import { describe, expect, it } from 'vitest'
import { mergeAssigneeDirectoryOptions } from './parishAssigneeOptions'

describe('mergeAssigneeDirectoryOptions', () => {
  it('includes directory names and preserves current assignee', () => {
    expect(
      mergeAssigneeDirectoryOptions(['Alice', 'Bob'], 'Former Staff')
    ).toEqual(['Alice', 'Bob', 'Former Staff'])
  })

  it('dedupes case-insensitively', () => {
    expect(mergeAssigneeDirectoryOptions(['Alice'], 'alice')).toEqual(['Alice'])
  })
})
