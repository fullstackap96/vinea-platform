export type ReadyToCompleteItemState = 'complete' | 'incomplete' | 'not_applicable'

export type ReadyToCompleteItem = {
  key: string
  label: string
  state: ReadyToCompleteItemState
  sectionId?: string
  detail?: string
}

export function buildReadyToCompleteItems(input: {
  hasCommunication: boolean
  followUpReady: boolean
  requiresConfirmedSchedule: boolean
  confirmedScheduleReady: boolean
  checklistReady: boolean
}): ReadyToCompleteItem[] {
  const items: ReadyToCompleteItem[] = [
    {
      key: 'communication',
      label: 'Communication logged',
      state: input.hasCommunication ? 'complete' : 'incomplete',
      sectionId: 'communication',
    },
    {
      key: 'follow_up',
      label: 'Follow-up resolved',
      state: input.followUpReady ? 'complete' : 'incomplete',
      sectionId: 'next-follow-up',
      detail: input.followUpReady ? undefined : 'Set a follow-up date or mark the request complete',
    },
  ]

  if (input.requiresConfirmedSchedule) {
    items.push({
      key: 'schedule',
      label: 'Date confirmed',
      state: input.confirmedScheduleReady ? 'complete' : 'incomplete',
      sectionId: 'confirmed-time',
    })
  } else {
    items.push({
      key: 'schedule',
      label: 'Date confirmed',
      state: 'not_applicable',
      detail: 'Not required for this request type',
    })
  }

  items.push({
    key: 'records',
    label: 'Notes and records updated',
    state: input.checklistReady ? 'complete' : 'incomplete',
    sectionId: 'checklist',
    detail: input.checklistReady ? undefined : 'Finish remaining parish checklist items',
  })

  return items
}
