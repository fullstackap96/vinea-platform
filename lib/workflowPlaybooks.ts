import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type WorkflowPlaybookRequestType = 'baptism' | 'funeral' | 'wedding' | 'ocia'

export type WorkflowPlaybookItem = {
  key: string
  itemName: string
  phase: string
  customerValue: string
}

export type WorkflowPlaybook = {
  requestType: WorkflowPlaybookRequestType
  title: string
  description: string
  items: WorkflowPlaybookItem[]
}

export type ChecklistLikeItem = {
  item_name?: unknown
}

export type WorkflowPlaybookSuggestion = {
  playbook: WorkflowPlaybook
  missingItems: WorkflowPlaybookItem[]
  existingCount: number
  completionPercent: number
}

const PLAYBOOKS: Record<WorkflowPlaybookRequestType, WorkflowPlaybook> = {
  funeral: {
    requestType: 'funeral',
    title: 'Funeral pastoral care playbook',
    description:
      'A parish-office workflow for first care, clergy coordination, funeral home details, liturgy planning, and post-funeral follow-up.',
    items: [
      {
        key: 'first-family-contact',
        itemName: 'Call family and log first pastoral contact',
        phase: 'Immediate care',
        customerValue: 'Prevents a grieving family from waiting without a clear parish contact.',
      },
      {
        key: 'assign-clergy',
        itemName: 'Confirm priest or deacon assignment',
        phase: 'Internal coordination',
        customerValue: 'Clarifies who will shepherd the liturgy and family communication.',
      },
      {
        key: 'funeral-home',
        itemName: 'Coordinate date, time, and logistics with funeral home',
        phase: 'Scheduling',
        customerValue: 'Keeps parish, family, and funeral home aligned.',
      },
      {
        key: 'confirm-service',
        itemName: 'Record confirmed funeral service date and location',
        phase: 'Scheduling',
        customerValue: 'Gives staff one reliable source of truth for the service.',
      },
      {
        key: 'readings-music',
        itemName: 'Collect readings, music, and worship aid details',
        phase: 'Liturgy planning',
        customerValue: 'Reduces last-minute liturgy planning gaps.',
      },
      {
        key: 'committal',
        itemName: 'Confirm cemetery, cremation, or committal arrangements',
        phase: 'Liturgy planning',
        customerValue: 'Ensures clergy and staff understand the full funeral day plan.',
      },
      {
        key: 'post-care',
        itemName: 'Schedule post-funeral family follow-up',
        phase: 'Pastoral follow-up',
        customerValue: 'Turns funeral ministry into ongoing pastoral care.',
      },
    ],
  },
  wedding: {
    requestType: 'wedding',
    title: 'Wedding preparation playbook',
    description:
      'A parish-office workflow for inquiry response, clergy/date coordination, marriage prep documents, ceremony planning, and final confirmation.',
    items: [
      {
        key: 'initial-couple-contact',
        itemName: 'Contact couple and log initial wedding inquiry follow-up',
        phase: 'Inquiry',
        customerValue: 'Makes the couple feel guided from the first response.',
      },
      {
        key: 'date-availability',
        itemName: 'Review requested date for parish and clergy availability',
        phase: 'Scheduling',
        customerValue: 'Avoids promising a date before staff confirms constraints.',
      },
      {
        key: 'assign-clergy',
        itemName: 'Confirm priest or deacon for marriage preparation',
        phase: 'Internal coordination',
        customerValue: 'Creates a clear owner for pastoral preparation.',
      },
      {
        key: 'prep-documents',
        itemName: 'Collect marriage preparation documents and certificates',
        phase: 'Documentation',
        customerValue: 'Keeps canonical/document requirements visible.',
      },
      {
        key: 'prep-sessions',
        itemName: 'Track required marriage preparation sessions',
        phase: 'Preparation',
        customerValue: 'Helps staff see whether the couple is progressing.',
      },
      {
        key: 'ceremony-planning',
        itemName: 'Finalize liturgy, readings, music, and rehearsal details',
        phase: 'Ceremony planning',
        customerValue: 'Reduces last-week wedding coordination stress.',
      },
      {
        key: 'final-confirmation',
        itemName: 'Send final confirmation to couple and internal staff',
        phase: 'Final confirmation',
        customerValue: 'Ensures everyone has the same final plan.',
      },
    ],
  },
  baptism: {
    requestType: 'baptism',
    title: 'Baptism preparation playbook',
    description:
      'A parish-office workflow for family intake, paperwork, godparents, prep class, scheduling, and sacramental record completion.',
    items: [
      {
        key: 'family-contact',
        itemName: 'Contact family and confirm baptism preparation steps',
        phase: 'Family intake',
        customerValue: 'Gives parents a clear path instead of scattered instructions.',
      },
      {
        key: 'birth-certificate',
        itemName: 'Collect child birth certificate',
        phase: 'Documentation',
        customerValue: 'Protects sacramental record accuracy.',
      },
      {
        key: 'godparent-info',
        itemName: 'Collect godparent information and eligibility paperwork',
        phase: 'Documentation',
        customerValue: 'Keeps sponsor requirements visible before the baptism date.',
      },
      {
        key: 'prep-class',
        itemName: 'Confirm parent baptism preparation class completion',
        phase: 'Preparation',
        customerValue: 'Helps staff know whether the family is ready.',
      },
      {
        key: 'date-confirmed',
        itemName: 'Record confirmed baptism date and time',
        phase: 'Scheduling',
        customerValue: 'Creates one source of truth for the baptism schedule.',
      },
      {
        key: 'certificate-record',
        itemName: 'Prepare sacramental record and certificate details',
        phase: 'Records',
        customerValue: 'Connects preparation work to accurate parish records.',
      },
    ],
  },
  ocia: {
    requestType: 'ocia',
    title: 'OCIA inquiry and accompaniment playbook',
    description:
      'A parish-office workflow for inquiry follow-up, first meeting, sacramental background, sponsor/team coordination, and next session planning.',
    items: [
      {
        key: 'first-inquiry-contact',
        itemName: 'Contact inquirer and log first OCIA conversation',
        phase: 'Inquiry',
        customerValue: 'Responds personally while interest is fresh.',
      },
      {
        key: 'first-meeting',
        itemName: 'Schedule first meeting with OCIA coordinator',
        phase: 'Accompaniment',
        customerValue: 'Turns an inquiry into a real pastoral relationship.',
      },
      {
        key: 'background-review',
        itemName: 'Review sacramental background and current parish status',
        phase: 'Discernment',
        customerValue: 'Helps the team understand the right path for the person.',
      },
      {
        key: 'materials-shared',
        itemName: 'Share inquiry or evangelization materials',
        phase: 'Accompaniment',
        customerValue: 'Gives the inquirer something clear to read or pray with.',
      },
      {
        key: 'team-sponsor',
        itemName: 'Identify sponsor, mentor, or team member for follow-up',
        phase: 'Team coordination',
        customerValue: 'Keeps accompaniment from depending on one busy coordinator.',
      },
      {
        key: 'next-session',
        itemName: 'Set next OCIA session or follow-up meeting',
        phase: 'Next step',
        customerValue: 'Keeps momentum visible after the first conversation.',
      },
    ],
  },
}

function normalizeChecklistName(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isSameChecklistIntent(a: string, b: string): boolean {
  const left = normalizeChecklistName(a)
  const right = normalizeChecklistName(b)
  if (!left || !right) return false
  if (left === right || left.includes(right) || right.includes(left)) return true

  const leftTokens = new Set(left.split(' ').filter((token) => token.length >= 4))
  const rightTokens = right.split(' ').filter((token) => token.length >= 4)
  const shared = rightTokens.filter((token) => leftTokens.has(token))
  return shared.length >= 2
}

export function getWorkflowPlaybook(requestType: unknown): WorkflowPlaybook | null {
  const type = requestTypeFromRow({ request_type: requestType })
  if (type === 'baptism' || type === 'funeral' || type === 'wedding' || type === 'ocia') {
    return PLAYBOOKS[type]
  }
  return null
}

export function buildWorkflowPlaybookSuggestion(input: {
  requestType: unknown
  checklistItems: readonly ChecklistLikeItem[]
}): WorkflowPlaybookSuggestion | null {
  const playbook = getWorkflowPlaybook(input.requestType)
  if (!playbook) return null

  const existingNames = input.checklistItems.map((item) => String(item.item_name ?? ''))
  const missingItems = playbook.items.filter(
    (playbookItem) =>
      !existingNames.some((existingName) =>
        isSameChecklistIntent(existingName, playbookItem.itemName)
      )
  )
  const existingCount = playbook.items.length - missingItems.length
  const completionPercent =
    playbook.items.length > 0 ? Math.round((existingCount / playbook.items.length) * 100) : 0

  return {
    playbook,
    missingItems,
    existingCount,
    completionPercent,
  }
}
