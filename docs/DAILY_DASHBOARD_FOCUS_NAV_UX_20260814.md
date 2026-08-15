# DAILY_DASHBOARD_FOCUS_NAV_UX_20260814

Status: VERIFIED LOCALLY AND IN AUTHENTICATED NON-PRODUCTION PREVIEW

## Purpose

The staff Home dashboard had strong signals but presented too many equal-weight sections in one
long sequence. This slice makes the first screen feel like one parish-office workspace instead of
a collection of features.

## UX Changes

- The page heading now names the selected parish: `Today at <parish>`.
- A compact workspace navigator links to four plain-English destinations:
  - `Focus now`
  - `Office handoff`
  - `Parish health`
  - `Team queues`
- Each destination summarizes an existing read-only signal and handles loading or unavailable data
  without presenting a misleading number.
- Immediate work now appears before handoff planning and operational analysis.
- Roadmap-facing `future signals` copy is no longer shown to staff.
- Detailed safety and score-coverage notes remain available through native disclosure controls,
  keeping the primary screen calmer while preserving transparency.
- The Daily Work Hub hero now uses a restrained solid surface instead of a decorative gradient.

## Safety Boundary

No loaders, APIs, authorization rules, database writes, or production gates changed. The navigator
uses same-page anchors only. Existing active-parish scoping, staff review, read-only signal DTOs,
and all production-sensitive `NO-GO` boundaries remain unchanged.

## Verification

- Focused source and hierarchy coverage passed: `7` files / `22` tests.
- Complete repository coverage passed: `881` files / `3,784` tests.
- `npm run typecheck` and `npm run typecheck:all` passed.
- `npm run lint` passed.
- `npm run build` passed on Next.js `16.3.0`, including all `56` static pages.
- `npm run check:repository-secrets` passed across `2,960` scanned files with zero findings.
- `git diff --check` passed; Windows line-ending notices are informational only.
- The exact-head draft-PR deployment reached Vercel `READY`, and GitHub Actions run `31885173869`
  passed.
- Authenticated desktop and `390 x 844` mobile QA passed selected-parish switching, all four
  same-page focus anchors, responsive rendering, and original-parish restoration.
- The supported authenticated Vercel CLI path returned `/api/health` HTTP `200` with `ok: true` and
  all six reported checks `true`.
- Complete label-only evidence is recorded in
  `docs/DAILY_DASHBOARD_FOCUS_NAV_PREVIEW_QA_EVIDENCE_20260815.md`.
