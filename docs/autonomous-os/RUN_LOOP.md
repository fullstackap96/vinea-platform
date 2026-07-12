# VAOS Run Loop

Last updated: 2026-07-05

This is the repeatable loop for every Codex implementation cycle.

## 1. Review

Read or inspect:

- `AGENTS.md`.
- `CODEX_AUTONOMOUS_INSTRUCTIONS.md`.
- `docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md`.
- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`.
- `docs/VINEA_ROADMAP.md`.
- `docs/VINEA_BUILD_STATUS.md`.
- `docs/VINEA_REPO_AUDIT.md`.
- Recent `git status` and `git log`.
- Relevant code, tests, migrations, and docs.

For Next.js code edits, read the relevant local guide in `node_modules/next/dist/docs/` first.

## 2. Understand The Worktree

If there are uncommitted changes:

- Treat them as user or prior-session work.
- Do not revert them.
- Avoid unrelated files.
- Read touched files carefully before editing the same area.
- Prefer a safe docs, tests, or narrow implementation slice if the tree is heavily in motion.

## 3. Generate Candidate Tasks

List practical candidates from:

- Roadmap priorities.
- SSoT known issues.
- Build status next task.
- Failing tests or known blockers.
- Docs drift.
- Security/RLS/authorization gaps.
- Accessibility, performance, or UX gaps.
- Competitive and product strategy gaps.

## 4. Score And Select

Use `TASK_SELECTION_SCORECARD.md`.

Select the highest-value task that is not blocked by approval, production access, destructive action, public claims, RLS risk, customer communication, or sensitive data mutation.

## 5. Plan

Write a short implementation plan:

- Goal.
- Files likely to change.
- Safety boundaries.
- Verification steps.
- Documentation updates.

## 6. Implement

Keep the work scoped. Prefer existing helpers and patterns. Do not invent new architecture unless it clearly removes real complexity or matches established local practice.

## 7. Verify

Minimum verification:

- Run the focused tests for the changed area.
- Run lint, build, TypeScript, and broader tests when code behavior changes or risk is non-trivial.
- For docs-only changes, run focused source-validation tests when available and review diffs manually.
- For UI changes, verify responsive layout and accessibility expectations.
- For security/RLS-sensitive changes, verify deny paths and update evidence docs.

## 8. Update Documentation

Update the smallest set of docs that must reflect reality:

- README for navigation/setup entry points.
- Roadmap for product priority or completion state.
- SSoT for current product truth and major decisions.
- Build status for what changed, testing, risks, and next task.
- Repo audit for structural or risk inventory changes.

## 9. Explain

End with beginner-friendly language:

- What changed.
- Why it matters.
- Files changed.
- How to test it.
- Risks or blockers.
- Recommended next task.

## 10. Repeat In Future Sessions

The loop is durable. Do not continue blindly from the last task if the roadmap, repo, tests, or owner direction changed.
