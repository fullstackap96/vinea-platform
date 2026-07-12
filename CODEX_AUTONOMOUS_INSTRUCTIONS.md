# Codex Autonomous Instructions For Vinea Platform

Last updated: 2026-07-05

This is the master operating manual for future Codex work on Vinea Platform. It does not replace the owner's direct instructions, repository-specific `AGENTS.md`, or safety rules from the runtime. It gives Codex a durable way to choose, implement, test, document, and explain work in a disciplined product-led manner.

## What Vinea Is

Vinea Platform is a Next.js, React, TypeScript, Supabase, and Tailwind CSS SaaS application for Catholic parish operations. It helps parish staff manage family-facing intake, request workflows, follow-up, staff ownership, communication history, people, households, sacramental records, certificates, Mass intentions, imports, reports, parish settings, staff access, daily operating signals, Google Calendar sync, and staff-reviewed AI summaries or reply drafts.

The product mission is Better Parish Operations and Better Parishioner Care. The strategic thesis is that Vinea should become the modern Catholic operating system for parish work: family intake, staff ownership, pastoral follow-up, sacramental record continuity, certificate readiness, communications, calendar coordination, reporting, and permission-aware AI in one calm parish-office surface.

## Business Goals

- Save parish staff time by making the next right action obvious.
- Improve parishioner care by reducing lost requests, stale follow-up, unclear ownership, and disconnected records.
- Build Catholic-specific depth around sacramental records, certificates, family/household reality, OCIA, Mass intentions, parish registration, and pastoral care workflows.
- Earn trust through secure access, RLS discipline, auditability, approval gates, backup/restore evidence, and careful public claims.
- Win competitively through Catholic specificity, modern UX, safe automation, permission-aware AI, and diocesan-grade governance rather than shallow feature parity.
- Make pilots easier to sell, onboard, support, and expand.

## Product Philosophy

Think product-first, not feature-first.

Every change should improve at least one of:

- Parish staff clarity.
- Parishioner care.
- Catholic record integrity.
- Security and trust.
- Accessibility and mobile usability.
- Performance and reliability.
- Maintainability and developer confidence.
- Revenue potential or pilot conversion.

Prefer small, safe, high-leverage improvements over broad rewrites. When production-sensitive areas are blocked by owner approval, fixtures, RLS gates, or missing evidence, choose a safe preparatory slice that moves the product closer without crossing the boundary.

## Technical Philosophy

- Follow existing App Router, server helper, Supabase, and test patterns.
- Read `node_modules/next/dist/docs/` before editing Next.js-specific code because this repo uses Next.js 16.2.2.
- Keep public intake mediated by server routes. Do not restore direct anonymous writes to parish data tables.
- Keep staff-only behavior behind staff authorization and active parish scope.
- Treat V1 primary parish fallback as transitional, not production-ready diocesan tenancy.
- Prefer read-only dashboard intelligence before mutation, automation, or outbound communication.
- Keep AI staff-reviewed and permission-aware. Do not let AI make pastoral, canonical, eligibility, or outbound communication decisions.
- Keep secrets out of code, docs, logs, tests, and evidence.
- Add tests in proportion to risk and follow the repo's established source-validation style for docs and safety gates.

## Source Priority

When choosing or implementing work, review sources in this order:

1. Owner instructions in the current thread.
2. `AGENTS.md` and runtime safety rules.
3. Current code and tests.
4. Supabase migrations and RLS policies.
5. `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
6. `docs/VINEA_ROADMAP.md`.
7. `docs/VINEA_BUILD_STATUS.md`.
8. `docs/VINEA_REPO_AUDIT.md`.
9. `deep-research-report.md`.
10. Current official competitor or platform sources when competitive claims or current platform behavior matter.

If sources disagree, prefer code for present behavior, migrations for database truth, roadmap/SSoT for intended direction, and direct owner instruction for product decision authority.

## Decision Framework

For each session:

1. Review roadmap, SSoT, build status, repo audit, recent git changes, and unfinished work.
2. Identify candidate tasks.
3. Score them with `docs/autonomous-os/TASK_SELECTION_SCORECARD.md`.
4. Reject any task blocked by safety gates, owner approval, production data, RLS risk, billing, legal claims, or destructive action.
5. Select the highest-value safe task.
6. Produce a short implementation plan.
7. Implement narrowly.
8. Test and fix issues.
9. Update docs, roadmap, SSoT, build status, and repo audit when relevant.
10. Explain the change in beginner-friendly language and recommend the next task.

## Standing Priorities

Current strategic priorities from the roadmap and SSoT:

- Multi-parish and diocesan tenancy foundation.
- Role-based parish work hub.
- Follow-up engine and workflow automation.
- Catholic records and certificate depth.
- Family and duplicate intelligence.
- Permission-aware search, reporting, and AI safety.
- Parish onboarding and migration readiness.
- Trust center, governance, backup, restore, monitoring, and support evidence.

Do not treat this list as permission to bypass gates. Production RLS, production monitoring, public trust claims, runtime reminders, certificate issuance logging, correction/notation behavior, and autonomous communication require the approvals and evidence described in the relevant docs.

## Documentation Expectations

Update documentation whenever implementation changes product behavior, safety state, roadmap priority, architecture, setup, or operational readiness.

Core docs:

- `docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md`.
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
- `docs/VINEA_ROADMAP.md`.
- `docs/VINEA_BUILD_STATUS.md`.
- `docs/VINEA_REPO_AUDIT.md`.
- `docs/autonomous-os/`.
- `README.md` when entry points or developer guidance change.

Documentation must distinguish implemented behavior from prepared, non-runtime, blocked, or future work.

## Safety Rules

Never automatically:

- Delete production data.
- Weaken authentication, authorization, or RLS.
- Apply production migrations.
- Deploy production changes.
- Change billing, legal, company, support, or pricing claims.
- Send customer or parish emails.
- Contact parishes.
- Publish public trust-center or marketing claims.
- Mutate sacramental records, generate certificates, or make canonical/pastoral eligibility decisions without explicit approved workflow.
- Enable AI or automation to act without staff review.

When in doubt, stop at a non-runtime plan, approval packet, test, or read-only UI improvement.

## Beginner-Friendly Communication

After each implementation, explain:

- What changed.
- Why it matters.
- Which files changed.
- How to test it.
- Risks or things still blocked.
- The next highest-value task.

Assume the owner is intelligent but not a software engineer. Use plain language, avoid jargon where possible, and clearly separate "built now" from "prepared for later."
