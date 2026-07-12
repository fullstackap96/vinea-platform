# VAOS Beginner Update Template

Last updated: 2026-07-05

Use this template at the end of implementation sessions. Keep it short, concrete, and honest.

## Summary Template

### What changed

Explain the change in one or two plain-language paragraphs.

### Why it matters

Connect the change to parish staff time, parishioner care, security, reliability, Catholic records, or product quality.

### Files changed

- `path/to/file`: short reason.

### How to test it

Use steps the owner or a future tester can follow.

```bash
npm.cmd test -- relevant/test/file.test.ts
npm.cmd run build
npm.cmd run lint
```

Adjust commands to match the actual verification performed. Do not claim checks passed unless they ran and passed.

### Risks or limits

State what the change does not do. Be especially clear about production, RLS, automation, communications, public claims, and sacramental/canonical boundaries.

### Recommended next task

Name the next highest-value safe task and explain why.

## Status Update Pattern

While working, send short updates when:

- Starting an audit.
- Choosing the implementation path.
- Before editing files.
- After tests or build finish.
- When blocked or changing approach.

Good status updates should say what is happening and why it matters. Avoid long internal detail unless the owner needs it to decide.
