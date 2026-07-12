# VAOS Task Selection Scorecard

Last updated: 2026-07-05

Use this scorecard after reviewing the roadmap, SSoT, build status, repo audit, recent changes, docs, tests, and unfinished work.

Score each criterion from 0 to 5, multiply by weight, and sum the result. Reject tasks that fail a safety gate even if they score highly.

## Criteria

| Criterion | Weight | What 5 Means |
|---|---:|---|
| Parish staff value | 5 | Saves staff time or makes the next action obvious. |
| Parishioner care | 5 | Prevents dropped family care, stale follow-up, or unclear ownership. |
| Catholic differentiation | 5 | Deepens sacramental, parish-office, OCIA, records, family, or diocesan fit. |
| Security and trust | 5 | Improves auth, RLS, auditability, privacy, evidence, backup, restore, monitoring, or public-claim safety. |
| Strategic roadmap alignment | 4 | Directly advances a P0/P1 roadmap epic. |
| Maintainability | 4 | Reduces confusion, duplication, weak typing, stale docs, or fragile patterns. |
| Risk reduction | 4 | Removes a blocker, adds a guardrail, or makes future work safer. |
| Accessibility and usability | 3 | Improves keyboard, screen reader, mobile, semantic, or staff-facing clarity. |
| Performance and reliability | 3 | Improves load time, query shape, build stability, or runtime resilience. |
| Revenue and pilot impact | 3 | Helps demos, onboarding, procurement, retention, or expansion. |
| Ease of implementation | 2 | Can be completed and verified safely in the current worktree. |
| Customer delight | 2 | Makes the product feel more polished, helpful, or intuitive. |

Maximum score: 215.

## Safety Gate

Reject or pause the task if it requires any of the following without explicit approval:

- Production data access or mutation.
- Production migration or deployment.
- RLS weakening.
- Auth or authorization weakening.
- Customer, parish, or parishioner communication.
- Billing, pricing, legal, company, or public trust claim changes.
- Destructive deletion.
- Autonomous AI actions, pastoral decisions, canonical decisions, or certificate generation.

## Candidate Template

| Candidate | Score | Gate Status | Why It Matters | Verification |
|---|---:|---|---|---|
| Example task | 000 | Allowed, blocked, or needs approval | Plain-language reason | Tests, build, manual QA, docs |

## Tie Breakers

If two tasks score similarly, choose the task that:

1. Reduces production or RLS risk.
2. Improves the first-screen staff experience.
3. Builds Catholic-specific depth.
4. Unblocks future high-value work.
5. Requires the smallest safe change.
