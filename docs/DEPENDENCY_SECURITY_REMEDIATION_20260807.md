# Dependency Security Remediation

Current decision state: `DEPENDENCY SECURITY BASELINE VERIFIED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date: 2026-08-07

## Outcome

A fresh complete-tree audit found seven advisories, including high-severity Next.js findings. Vinea upgraded the framework-aligned packages and refreshed the reviewed transitive overrides without changing application behavior. The post-remediation complete-tree audit reports zero known vulnerabilities.

## Verified Package Baseline

| Package | Verified version | Reason |
|---|---:|---|
| `next` | `16.3.0` | Applies the current Next.js security fixes while remaining on the repository's Next.js 16 line. |
| `eslint-config-next` | `16.3.0` | Keeps framework lint rules aligned with Next.js. |
| `resend` | `6.17.2` | Preserves the previously reviewed email-provider baseline. |
| `vitest` | `3.2.6` | Preserves the previously reviewed test-runner baseline. |
| `postcss` | `8.5.23` | Overrides vulnerable transitive PostCSS resolutions with the patched release. |
| `sharp` | `0.35.0` | Pins the patched image-processing resolution required by the Next.js dependency tree. |
| `ws` | `8.21.0` | Preserves the previously reviewed WebSocket baseline. |
| `qs` | `6.15.3` | Preserves the previously reviewed query-string baseline. |

## Verification

- `npm.cmd audit --audit-level=high`: zero known vulnerabilities across the complete dependency tree.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run typecheck:all`: passed.
- `npm.cmd run lint`: passed.
- Focused dependency and current-context tests bind the manifest, lockfile, and current operator docs to this baseline.
- Complete Vitest suite: passed.
- Next.js `16.3.0` production build: passed with all `56` pages generated.

## Safety Boundary

This remediation changes dependency manifests, the lockfile, current operator context, and tests only. It does not deploy code, access production, enable production flags, apply migrations, change operational RLS, mutate records, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, touch Google Calendar data, or approve public trust claims.

## Remaining Boundary

An npm audit is point-in-time evidence. Production RLS, monitoring, CSP, exports, public intake routing, customer-facing AI, backup/restore claims, and public trust-center publishing remain separately approval-gated and `NO-GO`.
