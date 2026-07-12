# Vinea Platform

**Vinea Platform** is a Next.js application for parish **Parish Operations**: families submit baptism, funeral, and wedding requests through public intake forms; staff manage follow-up, scheduling, checklists, communications, AI-assisted drafts, and optional Google Calendar sync from a protected dashboard.

Product naming and default site metadata live in `lib/productBranding.ts`.

## Documentation

Start here:

- [docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md](docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md) is the operator front door: source authority, VAOS guides, QA evidence, security gates, and documentation maintenance.
- [docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md](docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md) is the definitive company operating manual: vision, strategy, architecture, AI model, standards, gates, and Codex instructions.
- [docs/VINEA_ROADMAP.md](docs/VINEA_ROADMAP.md) tracks current priorities, implemented slices, future order, and explicit non-goals.
- [docs/VINEA_BUILD_STATUS.md](docs/VINEA_BUILD_STATUS.md) records latest build status, verification, risks, and recommended next task.
- [docs/VINEA_ENGINEERING_PRODUCT_STATE_REPORT_20260702.md](docs/VINEA_ENGINEERING_PRODUCT_STATE_REPORT_20260702.md) and [docs/VINEA_PRODUCT_REPORT_20260702.md](docs/VINEA_PRODUCT_REPORT_20260702.md) are source reports for architecture and product context.

| Doc | Purpose |
|-----|---------|
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 10–15 minute scripted walkthrough (seeded demo requests) |
| [docs/DEMO_PILOT_RUNBOOK.md](docs/DEMO_PILOT_RUNBOOK.md) | Environment prep, seed data, optional integrations |
| [docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md](docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md) | Non-secret environment variable contract and deployment safety boundary |
| [docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md](docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md) | Release-readiness handoff index for reviewers |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md) | Local release-readiness checklist and safety boundary |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md) | Non-secret evidence template for release-readiness checks |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md) | Validator guide for filled release-readiness evidence |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md) | Sanitized example of passing local release-readiness evidence |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md) | Current completed local release-readiness evidence, including the 2026-07-08 offline-safe build refresh |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md) | Fresh process-clean local release-readiness rerun evidence; not production approval |
| [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_CHECKER_20260707.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_CHECKER_20260707.md) | Runnable checker for the completed local release-readiness evidence |
| [docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md](docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md) | Human review packet for completed local evidence; not production approval |
| [docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md](docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md) | Implemented browser security headers baseline; CSP remains separate |
| [docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md](docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md) | Approval packet for future report-only CSP runtime; not runtime approval |
| [docs/SAFE_ERROR_LOGGING_KEY_REDACTION_20260707.md](docs/SAFE_ERROR_LOGGING_KEY_REDACTION_20260707.md) | Shared server logging key-redaction boundary |
| [docs/API_ROUTE_SAFE_ERROR_REGRESSION_GUARD_20260707.md](docs/API_ROUTE_SAFE_ERROR_REGRESSION_GUARD_20260707.md) | Source-level guard against raw 5xx API route error messages |
| [docs/DASHBOARD_ACTION_SAFE_ERROR_REGRESSION_GUARD_20260707.md](docs/DASHBOARD_ACTION_SAFE_ERROR_REGRESSION_GUARD_20260707.md) | Source-level guard against raw dashboard Server Action error messages |
| [docs/CORE_DASHBOARD_MUTATION_SAFE_ERRORS_20260707.md](docs/CORE_DASHBOARD_MUTATION_SAFE_ERRORS_20260707.md) | People, Household, and Mass Intention dashboard mutation safe-error boundary |
| [docs/ACTIVE_PARISH_CONTEXT_SAFE_DETAILS_20260707.md](docs/ACTIVE_PARISH_CONTEXT_SAFE_DETAILS_20260707.md) | Active-parish context technical-detail redaction boundary |
| [docs/GOOGLE_CALENDAR_USER_ERROR_REDACTION_20260707.md](docs/GOOGLE_CALENDAR_USER_ERROR_REDACTION_20260707.md) | Google Calendar staff-message and provider-log redaction boundary |
| [docs/STAFF_LOGIN_SAFE_ERROR_AND_ACCESSIBLE_LABELS_20260707.md](docs/STAFF_LOGIN_SAFE_ERROR_AND_ACCESSIBLE_LABELS_20260707.md) | Staff login safe-error and accessible-label boundary |
| [docs/FAMILY_PORTAL_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md](docs/FAMILY_PORTAL_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md) | Family portal document upload client-message boundary |
| [docs/REQUEST_DETAIL_CLIENT_SAFE_MESSAGES_20260707.md](docs/REQUEST_DETAIL_CLIENT_SAFE_MESSAGES_20260707.md) | Request detail staff-facing client-message boundary |
| [docs/OCIA_REQUEST_DETAILS_SAFE_ERRORS_20260707.md](docs/OCIA_REQUEST_DETAILS_SAFE_ERRORS_20260707.md) | OCIA request detail placeholder safe-error boundary |
| [docs/SACRAMENTAL_RECORDS_LIST_SAFE_ERRORS_20260707.md](docs/SACRAMENTAL_RECORDS_LIST_SAFE_ERRORS_20260707.md) | Sacramental Records list safe-error boundary |
| [docs/GLOBAL_SEARCH_PARTIAL_RESULTS_WARNING_20260707.md](docs/GLOBAL_SEARCH_PARTIAL_RESULTS_WARNING_20260707.md) | Global Search partial-results warning boundary |
| [docs/DASHBOARD_DETAIL_PARTIAL_DATA_WARNINGS_20260707.md](docs/DASHBOARD_DETAIL_PARTIAL_DATA_WARNINGS_20260707.md) | Dashboard detail partial-data warning boundary |
| [docs/RECORD_PREFILL_SAFE_SUPPORTING_DATA_20260707.md](docs/RECORD_PREFILL_SAFE_SUPPORTING_DATA_20260707.md) | Record prefill supporting-data safety boundary |
| [docs/AI_REPLY_RUNTIME_GATE_SCAFFOLD_20260707.md](docs/AI_REPLY_RUNTIME_GATE_SCAFFOLD_20260707.md) | Disabled-by-default AI reply safety gate scaffold |
| [docs/AI_REPLY_PERMISSION_SCOPED_RETRIEVAL_DTO_20260707.md](docs/AI_REPLY_PERMISSION_SCOPED_RETRIEVAL_DTO_20260707.md) | Non-runtime permission-scoped AI reply retrieval DTO |
| [docs/AI_REPLY_DTO_BACKED_PROMPT_AND_RESPONSE_SCAFFOLD_20260707.md](docs/AI_REPLY_DTO_BACKED_PROMPT_AND_RESPONSE_SCAFFOLD_20260707.md) | Non-runtime AI reply DTO-backed prompt/audit/response scaffold |
| [docs/AI_REPLY_SAFETY_CHAIN_ADAPTER_20260707.md](docs/AI_REPLY_SAFETY_CHAIN_ADAPTER_20260707.md) | Disabled-gate fail-closed AI reply safety-chain adapter |
| [docs/AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_20260707.md](docs/AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_20260707.md) | Source preflight for future AI reply audit-write and safe-response gates |
| [docs/AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md](docs/AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md) | Approval packet for future non-production AI reply audit-write and safe-response implementation |
| [docs/AI_SUMMARY_SAFE_AUDIT_EVENT_VALIDATION_20260708.md](docs/AI_SUMMARY_SAFE_AUDIT_EVENT_VALIDATION_20260708.md) | Safe audit-event validation boundary for gated AI summary audit writes |
| [docs/AI_REPLY_SAFE_AUDIT_EVENT_VALIDATOR_20260708.md](docs/AI_REPLY_SAFE_AUDIT_EVENT_VALIDATOR_20260708.md) | Non-runtime validator for future AI reply audit-event writes |
| [docs/AI_REPLY_SAFE_RESPONSE_EXPOSURE_VALIDATOR_20260708.md](docs/AI_REPLY_SAFE_RESPONSE_EXPOSURE_VALIDATOR_20260708.md) | Non-runtime validator for future AI reply safe-response exposure |
| [docs/AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md](docs/AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md) | QA packet for future non-production AI reply audit-write and safe-response gates |
| [docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md](docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md) | Staff request document panel client-message boundary |
| [docs/DASHBOARD_CLIENT_SAFE_MESSAGES_20260707.md](docs/DASHBOARD_CLIENT_SAFE_MESSAGES_20260707.md) | Daily Work Hub follow-up and care-plan client-message boundary |
| [docs/DASHBOARD_QUEUE_SAFE_MESSAGES_20260707.md](docs/DASHBOARD_QUEUE_SAFE_MESSAGES_20260707.md) | Communications and Intake quick-save client-message boundary |
| [docs/PUBLIC_INTAKE_CLIENT_SAFE_MESSAGES_20260707.md](docs/PUBLIC_INTAKE_CLIENT_SAFE_MESSAGES_20260707.md) | Public intake form client-message boundary |
| [docs/DEMO_REQUEST_CLIENT_SAFE_MESSAGES_20260707.md](docs/DEMO_REQUEST_CLIENT_SAFE_MESSAGES_20260707.md) | Public demo request form client-message boundary |
| [docs/AUDIT_LOG_CLIENT_SAFE_MESSAGES_20260707.md](docs/AUDIT_LOG_CLIENT_SAFE_MESSAGES_20260707.md) | Audit Log admin client-message boundary |
| [docs/WORKFLOW_TEMPLATE_CLIENT_SAFE_MESSAGES_20260707.md](docs/WORKFLOW_TEMPLATE_CLIENT_SAFE_MESSAGES_20260707.md) | Workflow Template Settings client-message boundary |
| [docs/ONBOARDING_CLIENT_SAFE_MESSAGES_20260707.md](docs/ONBOARDING_CLIENT_SAFE_MESSAGES_20260707.md) | Parish Onboarding client-message boundary |
| [docs/PARISH_SETTINGS_CLIENT_SAFE_MESSAGES_20260707.md](docs/PARISH_SETTINGS_CLIENT_SAFE_MESSAGES_20260707.md) | Parish Settings admin client-message boundary |
| [docs/PARISH_SETTINGS_ROUTE_SAFE_ERRORS_20260707.md](docs/PARISH_SETTINGS_ROUTE_SAFE_ERRORS_20260707.md) | Staff-only Parish Settings API safe-error boundary |
| [docs/PUBLIC_INTAKE_ROUTING_ROUTE_SAFE_ERRORS_20260707.md](docs/PUBLIC_INTAKE_ROUTING_ROUTE_SAFE_ERRORS_20260707.md) | Staff-only public intake routing API safe-error boundary |
| [docs/DUPLICATE_MERGE_ROUTE_SAFE_ERRORS_20260707.md](docs/DUPLICATE_MERGE_ROUTE_SAFE_ERRORS_20260707.md) | People and Household duplicate merge API safe-error boundary |
| [docs/REQUEST_ACTION_SAFE_ERRORS_20260707.md](docs/REQUEST_ACTION_SAFE_ERRORS_20260707.md) | Request dashboard action safe-error boundary |
| [docs/RECORD_CERTIFICATE_ROUTE_SAFE_ERRORS_20260707.md](docs/RECORD_CERTIFICATE_ROUTE_SAFE_ERRORS_20260707.md) | Baptism certificate route safe-error boundary |
| [docs/SACRAMENTAL_RECORD_ACTION_SAFE_ERRORS_20260707.md](docs/SACRAMENTAL_RECORD_ACTION_SAFE_ERRORS_20260707.md) | Sacramental record dashboard action safe-error boundary |
| [project-status.md](project-status.md) | Routes, data model overview, env var names, known limitations |
| [CODEX_AUTONOMOUS_INSTRUCTIONS.md](CODEX_AUTONOMOUS_INSTRUCTIONS.md) | Master Codex operating manual for product-led Vinea work |
| [docs/autonomous-os/FIRST_RUN_REPORT.md](docs/autonomous-os/FIRST_RUN_REPORT.md) | First VAOS audit, task scoring, selected task, risks, and next task |
| [docs/VINEA_REPO_AUDIT.md](docs/VINEA_REPO_AUDIT.md) | Current repository structure, routes, APIs, docs, tests, and known risks |

## Prerequisites

- Node.js compatible with the version pinned for this repo (see `package.json` engines if present)
- A [Supabase](https://supabase.com) project with schema matching the app (tables for parishioners, requests, checklists, communications, funeral/wedding detail tables as used in code)
- Environment variables configured (names only — see **project-status.md** or **docs/DEMO_PILOT_RUNBOOK.md**)

## Local development

Install dependencies and start the dev server:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with values from the approved environment secret store. Keep real credentials out of `.env.example` and source control.

Open [http://localhost:3000](http://localhost:3000) for the landing page. Staff routes require sign-in at `/login`.

## Local release-readiness checks

Before using a branch for production-sensitive review, run the local release-readiness checklist from a shell with production-sensitive QA/prototype flags disabled. The release environment guard also treats protected `NON_PRODUCTION` runtime values and configured QA `_ACK` / `_ENV` residue as unsafe, so QA shells should be cleared before using this checklist:

```bash
npm run check:release-local
```

If the release environment guard refuses because a QA shell still has runtime or approval-residue variables configured, inspect a label-only cleanup guide first:

```bash
npm run check:release-env-cleanup-guide
```

The cleanup guide reports variable names and safe labels only. It does not print raw values and does not clear anything automatically.

To inspect the release-readiness command order without running the heavy checklist:

```bash
npm run check:release-local -- --plan
```

The wrapper runs:

```bash
npm run check:repository-secrets
npm run check:dependency-security
npm run check:release-env
npm run check:rls-production-evidence
npm run check:production-monitoring-evidence
npm run check:production-gates
npm run check:csp-report-only
npm run check:trust-center-claims
npm run check:release-handoff
npm run check:release-local-evidence
npm run typecheck
npm run typecheck:all
npm run lint
npm test
npm run build
```

Record pass/fail results with [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md), then validate the filled label-only record using [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md). Use [docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md) as the sanitized shape reference. Use [docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md](docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md) if a local shell needs QA/prototype residue cleanup before release checks. The current completed evidence file includes the 2026-07-08 offline-safe build refresh, where the full local release runner passed and `next build` no longer required a Google Fonts network fetch. The freshest process-clean rerun evidence is [docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md](docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md).

The current completed local release-readiness evidence can also be checked with:

```bash
npm run check:release-local-evidence
```

Passing these checks does not deploy, approve or add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust-center claims.

## Demo data

Re-runnable SQL seed with three fixed requests (baptism, funeral, wedding): **`supabase/seed_demo.sql`**. Run it in the Supabase SQL Editor (or equivalent) against the same database the app uses. Deep links and a presenter script are in **docs/DEMO_SCRIPT.md**.

## License / contribution

Add your organization’s license and contribution guidelines here if this repository is published or shared externally.
