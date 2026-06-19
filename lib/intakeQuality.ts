import { parseFollowUpCalendarDate, todayCalendarDateString } from '@/lib/nextFollowUpDate'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type IntakeQualitySeverity = 'confirm' | 'watch'

export type IntakeQualityIssue = {
  key: string
  label: string
  severity: IntakeQualitySeverity
  sectionId: string
}

export type IntakeQualityResult = {
  status: 'complete' | 'needs_confirmation'
  headline: string
  summary: string
  issues: IntakeQualityIssue[]
  actionHref: string
  actionLabel: string
}

export type IntakeQualityRequest = {
  request_type?: unknown
  child_name?: unknown
  preferred_dates?: unknown
  notes?: unknown
  parishioner?: { full_name?: unknown; email?: unknown; phone?: unknown } | null
  funeral_detail?: {
    deceased_name?: unknown
    family_relationship?: unknown
    date_of_death?: unknown
    funeral_home_or_location?: unknown
    funeral_director_contact?: unknown
    service_location?: unknown
    preferred_service_notes?: unknown
  } | null
  wedding_detail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
    proposed_wedding_date?: unknown
    ceremony_notes?: unknown
  } | null
  ocia_detail?: {
    date_of_birth?: unknown
    age_or_dob_note?: unknown
    sacramental_background?: unknown
    seeking?: unknown
    parishioner_status?: unknown
    preferred_contact_method?: unknown
    availability?: unknown
  } | null
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function isBlank(value: unknown): boolean {
  return text(value).length === 0
}

function addIssue(
  issues: IntakeQualityIssue[],
  issue: IntakeQualityIssue
) {
  if (!issues.some((existing) => existing.key === issue.key)) {
    issues.push(issue)
  }
}

function looksVague(value: unknown): boolean {
  const note = text(value).toLowerCase()
  if (!note) return false
  if (note.length <= 12) return true
  return ['call me', 'please call', 'call us', 'need info', 'more info', 'n/a'].includes(note)
}

function dateInPast(value: unknown, now: Date): boolean {
  const parsed = parseFollowUpCalendarDate(value)
  if (!parsed) return false
  return parsed < todayCalendarDateString(now)
}

export function evaluateIntakeQuality(
  request: IntakeQualityRequest,
  options?: { now?: Date }
): IntakeQualityResult {
  const now = options?.now ?? new Date()
  const requestType = requestTypeFromRow(request)
  const issues: IntakeQualityIssue[] = []

  if (isBlank(request.parishioner?.email) && isBlank(request.parishioner?.phone)) {
    addIssue(issues, {
      key: 'contact-method',
      label: 'Add at least one reliable way to contact the family.',
      severity: 'confirm',
      sectionId: 'contact-information',
    })
  } else if (isBlank(request.parishioner?.phone)) {
    addIssue(issues, {
      key: 'phone',
      label: 'Confirm whether a phone number should be added.',
      severity: 'watch',
      sectionId: 'contact-information',
    })
  }

  if (looksVague(request.notes)) {
    addIssue(issues, {
      key: 'vague-notes',
      label: 'Clarify the intake notes; they may be too vague for staff follow-up.',
      severity: 'watch',
      sectionId: 'edit-intake',
    })
  }

  if (requestType === 'baptism') {
    if (isBlank(request.child_name)) {
      addIssue(issues, {
        key: 'child-name',
        label: 'Confirm the child name for the baptism record.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(request.preferred_dates)) {
      addIssue(issues, {
        key: 'baptism-preferred-dates',
        label: 'Ask whether the family has preferred baptism dates.',
        severity: 'watch',
        sectionId: 'edit-intake',
      })
    }
  } else if (requestType === 'funeral') {
    const detail = request.funeral_detail
    if (isBlank(detail?.deceased_name)) {
      addIssue(issues, {
        key: 'deceased-name',
        label: 'Confirm the deceased person\'s name.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.funeral_home_or_location) && isBlank(detail?.funeral_director_contact)) {
      addIssue(issues, {
        key: 'funeral-home',
        label: 'Confirm funeral home or funeral director contact.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.preferred_service_notes) && isBlank(detail?.service_location)) {
      addIssue(issues, {
        key: 'service-preferences',
        label: 'Add preferred service date, time, or location if the family has one.',
        severity: 'watch',
        sectionId: 'edit-intake',
      })
    }
    if (dateInPast(detail?.date_of_death, now)) {
      // Date of death normally is in the past; this rule intentionally does not flag it.
    }
  } else if (requestType === 'wedding') {
    const detail = request.wedding_detail
    if (isBlank(detail?.partner_one_name)) {
      addIssue(issues, {
        key: 'partner-one',
        label: 'Confirm the first partner name.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.partner_two_name)) {
      addIssue(issues, {
        key: 'partner-two',
        label: 'Confirm the second partner name or note why it is not available yet.',
        severity: 'watch',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.proposed_wedding_date)) {
      addIssue(issues, {
        key: 'proposed-wedding-date',
        label: 'Ask whether the couple has a proposed wedding date.',
        severity: 'watch',
        sectionId: 'edit-intake',
      })
    } else if (dateInPast(detail?.proposed_wedding_date, now)) {
      addIssue(issues, {
        key: 'past-wedding-date',
        label: 'Check the proposed wedding date; it appears to be in the past.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
  } else if (requestType === 'ocia') {
    const detail = request.ocia_detail
    if (isBlank(detail?.date_of_birth) && isBlank(detail?.age_or_dob_note)) {
      addIssue(issues, {
        key: 'ocia-age',
        label: 'Confirm date of birth or age note.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.sacramental_background)) {
      addIssue(issues, {
        key: 'ocia-sacramental-background',
        label: 'Confirm sacramental background.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.seeking)) {
      addIssue(issues, {
        key: 'ocia-seeking',
        label: 'Confirm what the person is seeking through OCIA.',
        severity: 'confirm',
        sectionId: 'edit-intake',
      })
    }
    if (isBlank(detail?.availability)) {
      addIssue(issues, {
        key: 'ocia-availability',
        label: 'Ask for availability for the first OCIA conversation.',
        severity: 'watch',
        sectionId: 'edit-intake',
      })
    }
  }

  const confirmCount = issues.filter((issue) => issue.severity === 'confirm').length
  const issueCount = issues.length
  const status = issueCount > 0 ? 'needs_confirmation' : 'complete'
  const firstSection = issues[0]?.sectionId ?? 'edit-intake'

  return {
    status,
    headline:
      issueCount === 0
        ? 'Intake looks complete enough to proceed.'
        : `${issueCount} ${issueCount === 1 ? 'detail' : 'details'} to confirm before moving forward.`,
    summary:
      issueCount === 0
        ? 'No obvious intake gaps are showing right now.'
        : confirmCount > 0
          ? 'A few details may block staff from serving this family smoothly.'
          : 'These are helpful details to clarify when staff next contacts the family.',
    issues: issues.slice(0, 4),
    actionHref: `#${firstSection}`,
    actionLabel: issueCount === 0 ? 'Review intake details' : 'Review intake details',
  }
}
