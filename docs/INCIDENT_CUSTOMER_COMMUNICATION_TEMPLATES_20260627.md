# Vinea Customer Communication Templates - Parish Data Access Incidents - 2026-06-27

Status: Templates prepared only. No customer communication was sent while preparing these templates. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed.

## Purpose

These templates help Vinea communicate clearly and carefully with parishes, parish clusters, and dioceses during suspected or confirmed parish data access incidents. They are designed for incidents involving family portal access, request documents, active parish context, membership-aware RLS, audit logs, staff authorization, public intake routing, AI outputs, or other sensitive parish data.

These templates are not legal advice, not approved breach notification language, and not evidence that Vinea has completed a production incident response drill.

## Approval Rules

Do not send customer-facing incident communications until the required approvers have reviewed the message for the incident severity and facts known at the time.

| Communication type | Required approval |
|---|---|
| Initial holding statement | Incident commander and customer communications owner |
| Confirmed incident notice | Incident commander, legal/data owner, and customer communications owner |
| No-impact notice | Incident commander and customer communications owner; legal/data owner if sensitive data was suspected |
| Follow-up/resolution notice | Incident commander, legal/data owner, customer communications owner, and product owner |
| Diocese-level coordination note | Incident commander, legal/data owner, customer communications owner, and product owner |

Do not include:

- Secrets, credentials, family portal plaintext tokens, signed URLs, or private document contents.
- Unverified root-cause claims.
- Legal conclusions unless legal/data owner has approved them.
- Blame language.
- Promises about certifications, production RLS readiness, backup/restore readiness, or incident-response maturity that Vinea has not proven.

## Required Message Fields

Every customer-facing incident message should answer:

- What happened, using confirmed facts only.
- What data may have been affected.
- Which parish, parish cluster, diocese, or user group may be affected.
- When the issue was first detected and, if known, when it was contained.
- What Vinea did immediately.
- Whether the parish needs to take action.
- When Vinea will follow up next.
- Who the parish should contact with questions.

## Template 1 - Initial Holding Statement

Use this when Vinea has credible concern but has not confirmed impact.

Subject: Vinea is investigating a possible data access issue

Hello [Parish/Diocese Contact Name],

We are investigating a possible data access issue involving [brief area, such as family portal documents / request access / parish context]. We are still confirming the facts and do not want to speculate before the review is complete.

What we know right now:

- Detected: [date/time/time zone]
- Area under review: [affected feature or workflow]
- Current status: [investigating / contained / monitoring]
- Parish action needed right now: [none / specific action]

We have started our incident response process, are preserving relevant audit evidence, and will share another update by [date/time/time zone] or sooner if we confirm important new information.

Please contact [support/contact] with urgent questions.

Thank you,

The Vinea Team

## Template 2 - Confirmed Incident Notice

Use this only after impact is confirmed and legal/data owner has approved the language.

Subject: Important update about a Vinea data access incident

Hello [Parish/Diocese Contact Name],

We confirmed a data access incident involving [brief confirmed description]. We are sorry this happened and are treating it seriously.

Summary:

- Detected: [date/time/time zone]
- Contained: [date/time/time zone]
- Affected area: [feature/workflow]
- Potentially affected data: [safe summary of data classes]
- Affected parish scope: [parish/cluster/diocese scope]
- Current status: [contained / resolved / monitoring]

What Vinea did:

- [containment action 1]
- [containment action 2]
- Preserved relevant audit evidence for review.
- Began a post-incident review to identify corrective actions.

What we recommend you do:

- [customer action, if any]
- [who to contact internally, if relevant]

We will provide a follow-up by [date/time/time zone] with what we learn from the review and any additional steps.

Please contact [support/contact] with questions.

The Vinea Team

## Template 3 - No-Impact Notice

Use this when Vinea investigated a credible concern and found no customer data exposure.

Subject: Vinea investigation completed - no data exposure found

Hello [Parish/Diocese Contact Name],

We completed our investigation into the possible data access issue involving [brief area]. Based on the evidence reviewed, we did not find customer data exposure.

What we reviewed:

- Relevant route/API behavior.
- Audit events.
- Access controls and parish scope.
- Family portal/document behavior, if applicable.
- Active parish or RLS behavior, if applicable.

Outcome:

- Data exposure found: No.
- Customer action needed: [none / specific action].
- Follow-up work: [none / improvement being tracked].

We are documenting the investigation internally and will continue monitoring for related issues.

Thank you,

The Vinea Team

## Template 4 - Follow-Up / Resolution Notice

Use this after containment and recovery checks are complete.

Subject: Follow-up on Vinea data access incident

Hello [Parish/Diocese Contact Name],

We are following up on the data access incident reported on [date]. The issue is now [contained/resolved], and we completed the initial recovery checks.

Resolution summary:

- Incident window: [start/end date/time/time zone]
- Affected area: [feature/workflow]
- Containment completed: [date/time/time zone]
- Recovery checks completed: [date/time/time zone]
- Customer action needed: [none / specific action]

What changed:

- [fix or mitigation summary]
- [monitoring or review summary]
- [process improvement summary]

What we are doing next:

- [follow-up action 1]
- [follow-up action 2]
- [postmortem/corrective action summary]

Please contact [support/contact] with questions or if you notice anything unusual.

The Vinea Team

## Template 5 - Parish / Diocese Coordination Note

Use this when a diocese, parish cluster, pastorate, or multi-parish administrator may need to coordinate communication.

Subject: Coordination request for Vinea data access incident communication

Hello [Diocese/Cluster Contact Name],

We are coordinating communication for a Vinea data access incident or investigation involving [parish/cluster scope]. Before sending broader parish-level communication, we want to confirm the appropriate communication path with you.

Coordination details:

- Incident or investigation status: [investigating / confirmed / contained / resolved]
- Parish or cluster scope: [scope]
- Data classes under review: [safe summary]
- Proposed recipient group: [pastor / parish administrator / diocesan contact / affected staff / affected families]
- Proposed send time: [date/time/time zone]
- Customer action requested: [none / specific action]

Please confirm:

- Who should receive the next update.
- Whether communication should come from Vinea, the parish, the diocese, or jointly.
- Whether any local parish/diocesan process must be followed.

We will not send broader communication until this path is confirmed, unless urgent containment or legal/data-owner guidance requires otherwise.

Thank you,

The Vinea Team

## Internal Review Checklist Before Sending

- [ ] Incident severity is assigned.
- [ ] Message type is selected.
- [ ] Facts are confirmed and current.
- [ ] Legal/data owner approval is recorded where required.
- [ ] Incident commander approval is recorded.
- [ ] Customer communications owner approval is recorded.
- [ ] Product owner approval is recorded where required.
- [ ] Message does not include secrets, tokens, signed URLs, credentials, or private document contents.
- [ ] Message does not speculate about root cause.
- [ ] Message does not overclaim compliance, certification, backup/restore readiness, or production diocesan readiness.
- [ ] Message includes next update timing or clear closure.
- [ ] Sent message location is recorded in the incident evidence template.

## Public Trust-Center Claim Boundaries

Safe internal statement:

> Vinea has prepared customer communication templates for parish data access incident response, including holding, confirmed incident, no-impact, follow-up, and parish/diocese coordination messages.

Do not claim:

- Vinea has legally approved breach notification templates.
- Vinea has sent or tested these templates in a production incident.
- Vinea has completed customer communication drills.
- Vinea has a public incident status page.
- Vinea has certified incident communication processes under SOC 2, ISO 27001, HIPAA, or another formal framework.

## Final Outcome

- Current outcome: `Customer communication templates prepared; legal approval and drill evidence pending`
- Current recommendation: `Review these templates with legal/data and customer communications owners, then use them in a non-production tabletop drill`
