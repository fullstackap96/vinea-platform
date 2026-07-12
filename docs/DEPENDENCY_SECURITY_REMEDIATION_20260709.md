# Dependency Security Remediation

Current decision state: `DEPENDENCY SECURITY BASELINE VERIFIED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date: 2026-07-09

## Outcome

The Vinea dependency tree was audited after a fresh full local release-readiness pass. The initial audit found seven production dependency advisories and six additional development-tool advisories. Compatible package updates and one PostCSS patch override reduced both the complete-tree and production-only npm audit results to zero known vulnerabilities.

## Verified Package Baseline

| Package | Verified version | Reason |
|---|---:|---|
| `next` | `16.2.10` | Includes fixes for the reported Next.js 16 denial-of-service, SSRF, and proxy-bypass advisories. |
| `eslint-config-next` | `16.2.10` | Keeps the framework lint configuration aligned with Next.js. |
| `resend` | `6.17.2` | Removes the vulnerable Svix/UUID dependency path reported by the initial audit. |
| `vitest` | `3.2.6` | Fixes the critical Vitest UI server advisory without a major-version upgrade. |
| `postcss` | `8.5.10` | Overrides the older Next.js-internal PostCSS resolution with the patched release. |
| `ws` | `8.21.0` | Fixes the reported memory disclosure and fragmented-message exhaustion advisories. |
| `qs` | `6.15.3` | Fixes the reported remotely triggerable stringify denial-of-service advisory. |

## Verification

- `npm.cmd audit --json`: zero known vulnerabilities across the complete dependency tree.
- `npm.cmd audit --omit=dev --json`: zero known vulnerabilities in the production dependency tree.
- `npm.cmd run check:release-local`: `LOCAL_RELEASE_READINESS_PASSED` in a process-sanitized shell.
- Full Vitest: 632 files and 2,480 tests passed on Vitest 3.2.6.
- Next.js production build: passed on Next.js 16.2.10.
- `lib/server/dependencySecurityBaseline.test.ts` guards the approved package and lockfile baseline.

## Safety Boundary

This remediation changed package manifests, the lockfile, and installed dependencies only. It did not deploy code, access production, enable production flags, apply migrations, change operational RLS, mutate records, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, touch Google Calendar data, or approve public trust claims.

## Remaining Boundary

An npm audit is point-in-time evidence. Future dependency or advisory changes still require a fresh audit and the normal release-readiness checks. Production RLS, monitoring, CSP, exports, public intake routing, customer-facing AI, backup/restore claims, and public trust-center publishing remain separately approval-gated and `NO-GO`.
