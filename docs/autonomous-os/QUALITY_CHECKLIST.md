# VAOS Quality Checklist

Last updated: 2026-07-05

Use this checklist before considering work complete.

## Pre-Implementation

- Read current owner request.
- Read relevant repo instructions.
- Check `git status`.
- Review roadmap, SSoT, build status, and repo audit.
- Identify safety gates.
- Read relevant Next.js local docs before Next-specific code edits.
- Choose a focused task and plan verification.

## Code Quality

- Follow existing patterns.
- Keep edits scoped.
- Avoid unrelated refactors.
- Avoid duplicated logic.
- Preserve type safety or improve it.
- Add comments only where they reduce real confusion.
- Do not expose secrets.

## Product Quality

- The change helps parish staff or parishioner care.
- Staff-facing copy is clear and calm.
- Catholic record, pastoral, and canonical boundaries are respected.
- AI and automation remain staff-reviewed unless separately approved.

## Security And RLS

- Auth checks are preserved or improved.
- Active parish and staff membership scope are preserved where relevant.
- RLS posture is not weakened.
- Deny paths are considered.
- Audit metadata is safe and non-secret.
- Exports, storage, signed URLs, and document access remain scoped.

## Accessibility And UX

- Semantic structure is appropriate.
- Keyboard and focus behavior are considered.
- Text is readable and not crowded.
- Mobile layout is considered.
- Color contrast is considered.
- UI changes do not add confusing instructional clutter.

## Verification

Run the right checks for the risk level:

- Focused tests for the changed area.
- `npm.cmd test` for broader behavior when warranted.
- `npm.cmd run lint`.
- `npm.cmd run build`.
- Manual browser or route QA for UI changes.
- RLS/security smoke checks for permission-sensitive changes.

If a check cannot be run, state why.

## Documentation

- README updated if navigation/setup changed.
- Roadmap updated if product priority or completion changed.
- SSoT updated if current truth changed.
- Build status updated with what changed, tests, risks, and next task.
- Repo audit updated if structure or risks changed.

## Completion

Do not call the work complete until:

- The implementation is present.
- Focused verification has passed or a blocker is clearly recorded.
- Docs are updated.
- Risks and next task are explained plainly.
