# Vinea Daily Operating System Implementation Plan

Status: Active implementation plan for safe incremental polish.

Date opened: 2026-07-02

## Goal

Make Vinea feel like the daily operating system for Catholic parish staff, not a collection of separate modules. The first screen should help a parish secretary, administrator, pastor, deacon, DRE, or OCIA coordinator quickly answer: what needs attention, who owns it, what is overdue, what is blocked, and what should be handled first.

## Safe Implementation Order

1. Daily Work Hub polish
   - Add a warm, plain-English daily overview to the home dashboard.
   - Reuse existing dashboard signals instead of adding new queries.
   - Surface attention items, overdue follow-ups, blockers, ownership gaps, checklist/document gaps, communication follow-ups, missing dates, and workload balance.
   - Be transparent where a signal is not fully automated yet, such as certificate-ready and calendar-conflict detection.

2. Parish Health Score V1
   - Build an explainable score from existing operational indicators.
   - Show the factors behind the score and recommended next actions.
   - Avoid black-box scoring or claims that are not supported by data.

3. Workflow automation and reminders V1
   - Start with staff-reviewed reminders for overdue follow-ups, missing documents, upcoming sacramental dates, stalled requests, unassigned requests, certificate-ready work, and duplicate review.
   - Keep outbound family communication staff-reviewed unless a setting explicitly allows otherwise.

4. Production readiness blockers
   - Keep closing evidence gaps for membership-aware RLS, export safety, backup/restore, observability, CI, retention/deletion, and trust-center documentation.
   - Do not enable production-sensitive gates without the existing approval process.

5. Catholic records and certificate depth
   - Add certificate issuance logging, broader certificate planning, notation/correction planning, and request-to-record continuity.
   - Do not allow AI to make canonical, sacramental, pastoral, or eligibility decisions.

6. AI embedded assistance
   - Continue permission-aware source display, audit metadata, staff-reviewed disposition, and safe next-step support.
   - Preserve staff review and permission boundaries.

7. Onboarding and migration polish
   - Improve setup, imports, go-live readiness, and competitor migration guidance.

## Production Safety Boundaries

- No production feature flags are enabled by this plan.
- No operational RLS changes are introduced by the Daily Work Hub polish slice.
- No outbound communication automation is enabled without staff review.
- No public trust-center, backup/restore, export, or multi-parish production claims are expanded unless the relevant evidence and approval packet are complete.

## First Slice

Implement the Daily Work Hub overview on the home dashboard as a read-only, client-side presentation layer over existing signals. Update tests and documentation so the feature is clearly marked as live, while certificate-ready and calendar-conflict signals remain future work until real data paths exist.
