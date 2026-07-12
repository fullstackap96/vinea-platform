# VAOS Roadmap Review Protocol

Last updated: 2026-07-05

Use this protocol before selecting work and after completing work.

## Review Inputs

Read:

- `docs/VINEA_ROADMAP.md`.
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
- `docs/VINEA_BUILD_STATUS.md`.
- `docs/VINEA_REPO_AUDIT.md`.
- `deep-research-report.md` when product strategy or competitive direction matters.
- Current official vendor/platform sources when making current competitive claims.

## Weekly Executive Review Questions

Ask:

- What frustrates parish staff right now?
- What most improves parishioner care?
- What most improves onboarding?
- What creates the most customer value?
- What makes Vinea easier to sell?
- What increases retention or expansion?
- What technical debt is accumulating?
- What docs are stale?
- What code should be modernized?
- What can load faster?
- What accessibility improvement is most useful?
- What security/RLS improvement is available?
- What hidden bug is likely?
- What architecture choice will matter most one year from now?

Then ask:

What is the single highest-value improvement I can make today that most increases Vinea's value to parish staff while improving long-term quality, maintainability, and competitiveness?

## Current Roadmap Reading

As of 2026-07-05:

- The roadmap's highest-priority initiative is multi-parish and diocesan tenancy foundation.
- Production operational RLS remains gated by approval, safe fixtures, and smoke-test evidence.
- Recent safe slices have focused on the Daily Work Hub, Catholic records continuity, production readiness evidence, trust-center boundaries, and incident tabletop readiness.
- Runtime reminders, runtime certificate issuance logging, correction/notation runtime, production monitoring runtime, public trust-center claims, and production RLS promotion remain gated.

## Update Rules

Update the roadmap when:

- A roadmap item is completed, blocked, or newly selected.
- Priority changes.
- A new dependency or safety gate appears.
- A product strategy report changes the sequence.

Update the SSoT when:

- Current product behavior changes.
- Architecture, data model, security posture, or business rules change.
- A major decision is made.

Update build status when:

- Work is completed.
- Work is blocked.
- Tests, build, QA, or approval state changes.

Update repo audit when:

- Routes, APIs, database scope, major docs, tests, or known risks materially change.
