# Production Release Readiness Handoff Index

Current decision state: `RELEASE READINESS HANDOFF INDEX PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date prepared: 2026-07-06

## Purpose

This index gives a reviewer one place to start before any production-sensitive review, release-readiness handoff, or approval prompt.

It is a map, not approval. It does not deploy, enable production flags, add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust-center claims.

## Required Entry Points

| Area | Artifact | Required reviewer action |
|---|---|---|
| Repository front door | `README.md` | Confirm the release-readiness section is visible from the repo root. |
| Local checklist | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md` | Run the checklist commands from a clean shell with production-sensitive QA/prototype flags, `_ACK` residue, and `_ENV` residue disabled. |
| Local evidence | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md` | Capture pass/fail results with sanitized labels only. |
| Local evidence validator | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md` and `lib/releaseReadinessLocalEvidence.ts` | Validate the filled local evidence record before using it in a handoff. |
| Local evidence validated example | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATED_EXAMPLE_20260706.md` | Reference the expected sanitized passing shape without treating it as real rollout evidence. |
| Current completed local evidence | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md` | Review the current 15-command local release contract, including repository secret scanning, dependency security, completed-evidence validation, full tests, and credential-free build; this is not production approval. |
| Fresh process-clean local rerun evidence | `docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md` | Review the latest process-clean local release-readiness rerun evidence; this is not production approval. |
| Release-env cleanup guide | `docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md`, `scripts/prepare-release-readiness-env-cleanup.mjs`, and `scripts/release-readiness-env-config.mjs` | If `check:release-env` refuses a QA shell, run `npm run check:release-env-cleanup-guide` to list variable names and safe labels only before intentional cleanup. |
| Human review packet | `docs/PRODUCTION_RELEASE_READINESS_HUMAN_REVIEW_PACKET_20260707.md` | Convert the completed local evidence into a human-review decision record without approving production-sensitive gates. |
| Repository secret scanning | `docs/REPOSITORY_SECRET_SCANNING_BASELINE_20260709.md`, `scripts/check-repository-secrets.mjs`, and `scripts/repository-secret-scan-rules.mjs` | Confirm CI scans tracked and pending non-ignored text files before install and reports file paths, rule IDs, and line numbers without matched values. |
| Supported Node runtime | `.nvmrc` and `docs/NODE_RUNTIME_BASELINE_20260709.md` | Confirm package engines, local version guidance, and CI use Node.js 24 LTS instead of the EOL Node.js 20 line. |
| Environment configuration contract | `.env.example` and `docs/ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md` | Confirm required and optional variable names are documented without credentials or production-sensitive runtime gates. |
| CI action provenance | `docs/CI_ACTION_PROVENANCE_BASELINE_20260709.md` and `.github/workflows/ci.yml` | Confirm every third-party action is pinned to a reviewed full commit SHA and CI permissions remain read-only. |
| Release candidate technical approval | `docs/RELEASE_CANDIDATE_TECHNICAL_APPROVAL_20260711.md` | Review the evidence-backed approval for remote CI and isolated non-production preview validation; production deployment and sensitive gates remain unapproved. |
| Release candidate source manifest | `docs/RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711.md`, `scripts/build-release-candidate-source-manifest.mjs`, and `lib/server/releaseCandidateSourceManifest.test.ts` | Confirm committed source aggregate `C8B08F87AE5ED34D6B097F33B2F67F7ABBEC80D8C8349918081E17DB8CA9A709` remains deterministic and secret-safe. |
| Release candidate commit scope | `docs/RELEASE_CANDIDATE_COMMIT_SCOPE_REVIEW_20260711.md`, `scripts/prepare-release-candidate-commit-scope.mjs`, and `lib/server/releaseCandidateCommitScope.test.ts` | Confirm the initial 1,801-path candidate was staged exactly, excluded artifacts remain outside Git, and post-commit scope verification is settled or contains only an intentional follow-up. |
| Dependency update maintenance | `.github/dependabot.yml` and `docs/DEPENDENCY_UPDATE_MAINTENANCE_BASELINE_20260709.md` | Confirm npm and GitHub Actions updates arrive as bounded review PRs, with no automatic merge, deployment, credentials, or production-gate approval. |
| Public health response safety | `docs/HEALTH_ENDPOINT_PUBLIC_RESPONSE_SAFETY_20260709.md`, `app/api/health/route.ts`, and `lib/server/healthCheck.ts` | Confirm healthy probes preserve `checks.schema`, production failures hide configuration/schema labels, and responses are dynamic and uncacheable. |
| Demo request abuse protection | `docs/DEMO_REQUEST_DURABLE_RATE_LIMIT_20260709.md` and `app/api/demo-request/route.ts` | Confirm durable rate limiting runs before body parsing/email delivery, limiter failure is fail-closed, and `429` responses include `Retry-After`. |
| Request notification abuse protection | `docs/REQUEST_NOTIFICATIONS_DURABLE_RATE_LIMIT_20260709.md` and `app/api/request-notifications/route.ts` | Confirm durable limiting precedes body parsing, identity verification, parish recipient lookup, and email delivery while preserving verified-request ownership checks. |
| Family document upload abuse protection | `docs/FAMILY_PORTAL_DOCUMENT_UPLOAD_DURABLE_RATE_LIMIT_20260709.md` and `app/api/family/request-portal/[token]/documents/route.ts` | Confirm token-free durable limiting precedes portal lookup, multipart parsing, storage, metadata, and audit writes, with no storage access after denial/failure. |
| Public JSON body-size boundary | `docs/PUBLIC_JSON_BODY_SIZE_BOUNDARY_20260709.md` and `lib/server/boundedJsonBody.ts` | Confirm public intake, demo-request, and request-notification JSON bodies are byte-bounded after durable limiting and before downstream database, verification, audit, or email work. |
| Staff email body-size boundary | `docs/STAFF_EMAIL_SEND_BODY_SIZE_BOUNDARY_20260709.md` and `app/api/email/send/route.ts` | Confirm authenticated staff authorization precedes bounded parsing and malformed/oversized bodies cannot construct the email provider or send a message. |
| Request-bound staff email authorization | `docs/EMAIL_SEND_REQUEST_PARISH_AUTHORIZATION_20260710.md`, `app/api/email/send/route.ts`, and `lib/server/requestEmailRecipient.ts` | Confirm delivery requires active-parish membership and same-parish request ownership, ignores browser-supplied recipients, derives the stored request contact, and keeps both staff callers on scoped communication logging. |
| Sacramental Record client safe messages | `docs/SACRAMENTAL_RECORD_CLIENT_SAFE_MESSAGES_20260710.md` and `lib/sacramentalRecordClientMessages.ts` | Confirm New/Edit Record screens preserve approved validation and selected-parish guidance while unexpected database, private-contact, identifier, token, object, and unreviewed action text uses action-specific fallbacks. |
| Core record client safe messages | `docs/CORE_RECORD_CLIENT_SAFE_MESSAGES_20260710.md` and `lib/coreRecordClientMessages.ts` | Confirm People, Households, household membership, and Mass Intentions screens preserve approved validation and selected-parish guidance while unexpected database, private-contact, identifier, credential, object, and unreviewed action text uses action-specific fallbacks. |
| Request Detail Server Action client safe messages | `docs/REQUEST_DETAIL_SERVER_ACTION_CLIENT_SAFE_MESSAGES_20260710.md` and `lib/requestDetailClientMessages.ts` | Confirm Request Detail operational controls preserve approved validation, prerequisite, and selected-parish guidance while dynamic workflow titles and unexpected database, private-contact, identifier, credential, object, and unreviewed action text use safe generic messages. |
| Dashboard queue client defense in depth | `docs/DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_20260710.md`, `lib/dashboardQueueClientMessages.ts`, and `lib/dashboardClientMessages.ts` | Confirm Communications, Intake, and Daily Work Hub queue results use client allowlists, batch failures omit raw request IDs, and failed items remain selected for staff review without changing write behavior. |
| Daily Work Hub active-parish request mutation APIs | `docs/DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md` and the mark-contacted/care-touchpoint request routes | Confirm both staff-reviewed actions require active-parish membership and same-parish request ownership before server-owned writes, keep audit metadata note-free, return structured partial results, and leave no corresponding direct browser Supabase mutation. |
| Request Detail typed response DTO boundary | `docs/REQUEST_DETAIL_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md`, `lib/requestDetailDtos.ts`, and focused DTO/source tests | Confirm core Request Detail reads are allowlisted and parsed before state, cross-parish response mismatches fail closed, unexpected fields are dropped, and the page/header/checklist contain no explicit `any`. |
| Staff authentication session exit boundary | `docs/STAFF_AUTH_SESSION_EXIT_BOUNDARY_20260710.md`, dashboard shell/login sources, and focused auth source tests | Confirm Logout uses current-session scope, redirects only after success, preserves retry-safe curated errors, and login accepts only hardened dashboard destinations. |
| Staff communication same-origin mutation boundary | `docs/STAFF_COMMUNICATION_SAME_ORIGIN_MUTATION_BOUNDARY_20260710.md`, `lib/server/sameOriginMutation.ts`, and focused route/source tests | Confirm email send, communication log/follow-up, mark-contacted, and care-touchpoint mutations reject untrusted browser origins before authentication, parsing, provider construction, or writes. |
| Request mutation same-origin boundary | `docs/REQUEST_MUTATION_SAME_ORIGIN_BOUNDARY_20260710.md`, all `/api/requests/[id]` mutation routes, and the request mutation source guard | Confirm all 18 browser-driven request mutations reject untrusted origins before authentication or privileged work while preserving active-parish and target-ownership authorization. |
| Staff mutation same-origin boundary | `docs/STAFF_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md`, the reviewed staff mutation cohort, and its source guard | Confirm all 18 reviewed staff-only mutation methods reject untrusted origins before authentication, manual Daily Brief delivery is guarded without changing cron authorization, certificate generation uses POST, and public/token-scoped methods remain outside the staff-auth cohort while covered by the all-API boundary. |
| All API mutation same-origin boundary | `docs/ALL_API_MUTATION_SAME_ORIGIN_BOUNDARY_20260711.md`, `allMutationSameOriginRegressionGuard.test.ts`, and `publicMutationSameOriginBoundary.test.ts` | Confirm every POST/PATCH/PUT/DELETE Route Handler rejects untrusted browser origins before privileged work, including public intake, demo requests, request notifications, and family-portal document uploads, without weakening durable rate limiting or introducing a cross-origin integration API. |
| Public intake partial cleanup observability | `docs/PUBLIC_INTAKE_PARTIAL_CLEANUP_OBSERVABILITY_BOUNDARY_20260711.md`, `lib/server/publicIntakePartialCleanup.ts`, the intake route, and focused persistence/recovery tests | Confirm every type-detail insert and complete checklist batch is positively confirmed before workflow/audit/success, later failures enter checked request/parishioner cleanup, returned/thrown/zero-row cleanup failures remain visible through privacy-safe outcomes, and no transactional rollback is claimed. |
| Funeral and Wedding pastoral-detail persistence | `docs/REQUEST_PASTORAL_DETAILS_PERSISTENCE_BOUNDARY_20260711.md`, both active-parish detail routes, and focused runtime/source tests | Confirm same-parish Funeral and Wedding detail upserts return a minimal persisted `request_id` before audit history or success, preserve confirmed schedule timestamps, and treat returned, thrown, or zero-row failures generically without false history. |
| Google OAuth selected-parish persistence | `docs/GOOGLE_OAUTH_SELECTED_PARISH_PERSISTENCE_BOUNDARY_20260711.md`, `app/api/google/oauth/callback/route.ts`, and focused synthetic callback tests | Confirm the callback requires the returned integration `parish_id` to match the signed and membership-revalidated selected parish before `gcal=connected`, while zero-row or mismatched results clear state and use the generic error redirect without exposing provider or tenant data. |
| Request note and playbook insert persistence | `docs/REQUEST_NOTE_PLAYBOOK_INSERT_PERSISTENCE_BOUNDARY_20260711.md`, `app/dashboard/requests/actions.ts`, and focused runtime/source tests | Confirm note creation requires one returned inserted id and playbook application requires the returned checklist-item count to equal the promised added count before route-owned request history or success. |
| Import commit persistence | `docs/IMPORT_COMMIT_PERSISTENCE_BOUNDARY_20260711.md`, `app/api/imports/route.ts`, and focused runtime/source tests | Confirm committed import counts derive from returned inserted ids, failed/completed batch rows are positively confirmed, and completed audit history/API success require a non-null batch id while partial recovery remains explicitly non-transactional. |
| Certificate explicit mutation boundary | `docs/RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_20260711.md`, `app/api/records/[id]/certificate/route.ts`, and both record-detail certificate controls | Confirm certificate generation uses guarded POST only, preserves selected-parish record ownership and baptism-only behavior, cannot write `certificate_generated` from GET navigation, and returns a PDF only after the append-only event returns a confirmed minimal id. |
| Side-effecting GET regression boundary | `docs/SIDE_EFFECTING_GET_REGRESSION_BOUNDARY_20260711.md` and the repository-wide source guard | Confirm OAuth callback and bearer-authorized Daily Brief cron are the only reviewed GET writers, with authentication/state/authorization before provider or database side effects. |
| Privileged client authentication-order boundary | `docs/PRIVILEGED_CLIENT_AUTH_ORDER_REGRESSION_BOUNDARY_20260711.md`, `lib/supabaseServiceServer.ts`, and the repository-wide source guard | Confirm direct staff auth precedes service-role construction, no Route Handler constructs it at module scope, and no Client Component imports it. |
| Request privileged operation-order boundary | `docs/REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md`, both approved request-access resolvers, and the request-route source guard | Confirm all 19 directly authenticated request mutation methods resolve active-parish membership and same-parish request ownership, return generic denial, and use the authorized request id before the first database, storage, or portal-token side effect. |
| Staff tenant operation-order boundary | `docs/STAFF_TENANT_OPERATION_ORDER_REGRESSION_BOUNDARY_20260711.md` and the non-request staff mutation source guard | Confirm all 13 non-request privileged staff mutation methods authenticate, resolve selected-parish tenant scope, reject failed scope, and complete required admin checks before provider or database side effects. |
| Generic audit mutation browser boundary | `docs/GENERIC_AUDIT_MUTATION_BROWSER_BOUNDARY_20260711.md`, `/api/audit-events`, and the Client Component source guard | Confirm no browser component POSTs to the generic audit endpoint, request-target events remain server-route-owned, non-request compatibility writes remain selected-parish-admin-only, and removal/narrowing remains an explicit owner decision. |
| Dashboard Server Action operation-order boundary | `docs/DASHBOARD_SERVER_ACTION_OPERATION_ORDER_BOUNDARY_20260711.md`, `docs/HOUSEHOLD_MEMBER_PRIMARY_CONTACT_OWNERSHIP_ORDER_20260711.md`, and the Server Action source/runtime tests | Confirm all 21 operational Server Actions authenticate and resolve active-parish/request ownership before writes, and forged Household member ids cannot clear an existing primary contact before selected-parish ownership is verified. |
| Client Supabase operational-access boundary | `docs/CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_20260711.md` and the Client Component source guard | Confirm Client Components perform no Supabase table, storage, Function, or RPC access; browser Supabase remains allowlisted to login and current-session logout only. |
| Duplicate merge confirmation dialog | `docs/DUPLICATE_MERGE_CONFIRMATION_DIALOG_20260711.md`, `VineaConfirmDialog`, and both duplicate-review source guards | Confirm People and Household merges use the accessible reviewed dialog, retain the existing scoped APIs, prevent repeat submission while busy, and contain no native browser confirmation prompt. |
| Request email-template confirmation dialog | `docs/REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_20260711.md`, `VineaConfirmDialog`, and the Request Detail source guard | Confirm replacing an existing email subject/body requires an accessible staff review step, prevents repeat application while saving, uses the existing scoped reply-draft API, and never sends email during template application. |
| Request Detail confirmation-dialog consistency | `docs/REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_20260711.md`, `VineaConfirmDialog`, and the Request Detail source guard | Confirm completion and template replacement share the accessible dialog, completion preserves the existing scoped status action/reopen guidance, and no duplicate ad hoc modal or native browser prompt remains. |
| Dashboard parish-switch thrown-failure recovery | `docs/DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_20260711.md`, `DashboardLayoutClient`, and the shell source guard | Confirm unexpected Server Action failures restore the prior visible parish, show curated guidance, refresh server state, and cannot leave an unsaved optimistic tenant context displayed. |
| Request document client safety and popup recovery | `docs/REQUEST_DOCUMENT_CLIENT_SAFE_MESSAGES_20260707.md`, `RequestDocumentsSection`, the signed-URL confirmation helper, and focused source/unit guards | Confirm document failures remain curated, a detached blank window is available before signed-URL creation, the provider must return an absolute credential-free HTTP(S) signed URL before success, signed URLs are never rendered or logged, failed authorization closes the window, and blocked popups produce actionable guidance. |
| Request document upload compensation boundary | `docs/REQUEST_DOCUMENT_UPLOAD_COMPENSATION_BOUNDARY_20260711.md`, the shared server cleanup helper, both staff/family upload routes, and focused helper/source tests | Confirm storage upload path and document-row id are positively confirmed, failed metadata persistence removes exactly one object or gives recovery guidance, cleanup logs exclude private identifiers, and no storage/database transaction is claimed. |
| Google Calendar request-link persistence boundary | `docs/GOOGLE_CALENDAR_REQUEST_LINK_PERSISTENCE_BOUNDARY_20260711.md`, all three event routes, and the cross-system source guard | Confirm provider create/update/delete remains behind selected-parish ownership, the later request update returns a minimal matched id before audit/success, zero-row updates retain honest partial-success guidance, and no automatic provider rollback is claimed. |
| Outbound email delivery persistence boundary | `docs/OUTBOUND_EMAIL_DELIVERY_PERSISTENCE_BOUNDARY_20260711.md`, public notification/demo request/staff email/Daily Brief routes, and focused runtime/source tests | Confirm every email requires a provider message id, Daily Brief parish state returns a matched id, missing acknowledgement/state never produces clean success, partial-success guidance prevents blind retry, and no automatic resend/rollback is claimed. |
| Audited request update persistence regression boundary | `docs/REQUEST_AUDITED_UPDATE_PERSISTENCE_REGRESSION_BOUNDARY_20260711.md` and `requestAuditedUpdatePersistenceRegressionGuard.test.ts` | Confirm all 11 single-row audited request updates positively confirm persistence before success or route-owned audit history, newly added routes fail the explicit inventory, and multi-stage communication/care routes retain dedicated partial-success coverage. |
| Parish admin audited update persistence boundary | `docs/PARISH_ADMIN_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md`, Parish Settings, and Public Intake Routing route guards | Confirm staff-reviewed parish settings and routing metadata updates return a persisted parish id before success/audit, zero-row races produce safe guidance without false history, and production public intake routing remains separately gated. |
| Duplicate merge mutation persistence boundary | `docs/DUPLICATE_MERGE_PERSISTENCE_BOUNDARY_20260711.md`, both duplicate merge routes, and focused runtime/source tests | Confirm People parishioner-link transfer unlink/restore is positively confirmed, canonical updates succeed before linked-row movement, each replacement membership insert returns a minimal id before the duplicate relationship is deleted, every expected membership/final duplicate-row delete is confirmed, uncertain compensation receives manual-recovery guidance, and success follows positive final deletion confirmation. |
| Dashboard request audited update persistence boundary | `docs/DASHBOARD_REQUEST_AUDITED_UPDATE_PERSISTENCE_BOUNDARY_20260711.md`, Request Detail Server Actions, and `dashboardRequestAuditedUpdatePersistenceRegressionGuard.test.ts` | Confirm status, workflow-step, assignment, follow-up, and waiting-on updates return a minimal id, require a matched row, and fail generically without audit before any success. |
| Request intake editor persistence boundary | `docs/REQUEST_INTAKE_EDITOR_PERSISTENCE_BOUNDARY_20260711.md`, `saveRequestIntakeDetails`, and `requestIntakeEditorPersistenceBoundary.test.ts` | Confirm Funeral/Wedding/OCIA required fields validate before writes, contact/request/detail stages positively confirm persistence before audit, and later-stage failures give explicit safe partial-save guidance. |
| Household primary-contact compensation boundary | `docs/HOUSEHOLD_PRIMARY_CONTACT_COMPENSATION_BOUNDARY_20260711.md`, Household member Server Actions, runtime tests, and `householdPrimaryContactCompensationBoundary.test.ts` | Confirm prior-primary clearing is checked and scoped, member inserts/updates return an id, failed replacement writes restore the exact prior primary when possible, and restoration failure gives explicit staff guidance. |
| Operational audit metadata privacy boundary | `docs/OPERATIONAL_AUDIT_METADATA_PRIVACY_BOUNDARY_20260711.md` and `operationalAuditMetadataPrivacyBoundary.test.ts` | Confirm public/staff intake excludes contact names, imports exclude filenames, duplicate merges exclude Person/Household names, staff/family document events exclude original filenames/storage/signed URLs/review notes, and safe traceability fields remain. |
| Central audit write persistence result | `docs/AUDIT_LOG_HELPER_SAFE_ERROR_LOGGING_20260706.md`, `lib/server/auditLog.ts`, and `auditLogSafeErrors.test.ts` | Confirm returned Supabase errors and thrown exceptions are both redacted and reported, the helper returns true only for an accepted insert, existing best-effort callers remain behavior-compatible, and future high-assurance callers can inspect the result. |
| Required export audit persistence boundary | `docs/EXPORT_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_20260711.md`, both gated export routes, and export runtime/preflight tests | Confirm successful request-list and document-manifest exports require an accepted safe audit event before privileged queries or CSV delivery, audit failure returns generic 503 guidance, and production exports remain disabled. |
| AI summary required audit persistence boundary | `docs/AI_SUMMARY_REQUIRED_AUDIT_PERSISTENCE_BOUNDARY_20260711.md`, `/api/ai/summary`, and generation/audit gate tests | Confirm the enabled safety chain assigns and checks the real audit persistence result before safe-response exposure or OpenAI, failed persistence returns generic 503 guidance, legacy flag-off behavior remains exact, and production AI flags remain off. |
| Daily Work Hub reply-draft persistence | `docs/DAILY_WORK_HUB_REPLY_DRAFT_ACTIVE_PARISH_ROUTE_20260710.md` and `PATCH /api/requests/[id]/reply-draft` | Confirm generated follow-up drafts persist through the existing scoped request route, preserve staff review and batch behavior, and no longer update `requests.reply_draft` directly from the browser. |
| Daily Work Hub operational detail projection | `docs/DAILY_WORK_HUB_OPERATIONAL_DETAIL_PROJECTION_20260710.md` and `app/dashboard/DashboardPageCore.tsx` | Confirm funeral, wedding, and OCIA enrichment uses explicit request-id-scoped fields with no wildcard detail projection or behavior expansion. |
| Daily Work Hub server aggregate signals | `docs/DAILY_WORK_HUB_SERVER_AGGREGATE_SIGNALS_20260710.md`, `GET /api/dashboard/daily-operating-signals`, and `lib/server/loadDailyOperatingSystemSignals.ts` | Confirm staff authentication and exact active-parish membership precede minimal read-client queries, raw signal source rows do not enter the browser, certificate-ready cues fail closed when event history is unavailable, and no service-role or mutation path exists. |
| Reports server aggregate summary | `docs/REPORTS_SERVER_AGGREGATE_SUMMARY_20260710.md`, `GET /api/dashboard/reports-summary`, and `lib/server/loadDashboardReportsSummary.ts` | Confirm staff authentication and exact selected-parish membership precede minimal request/schedule reads, the browser receives only finished report DTOs, no technical detail is rendered, and no service-role or mutation path exists. |
| Daily Work Hub server read model | `docs/DAILY_WORK_HUB_SERVER_READ_MODEL_20260710.md`, `GET /api/dashboard/work-hub`, and `lib/server/loadDashboardWorkHub.ts` | Confirm staff authentication and exact selected-parish membership precede queue reads, relationship-intelligence sources are explicitly parish scoped, operational details use explicit projections, the browser performs no operational table reads, and no service-role or mutation path exists. |
| Daily Work Hub single-response composition | `docs/DAILY_WORK_HUB_SINGLE_RESPONSE_COMPOSITION_20260710.md`, `GET /api/dashboard/work-hub`, and `lib/server/loadDashboardWorkHub.ts` | Confirm the browser receives queue, suggested actions, and operating signals in one authenticated response; independent queue and signal reads start concurrently after scope validation; the dedicated signal endpoint remains independently tested; and no mutation, provider, service-role, or production-sensitive path was added. |
| Dashboard shell server context and exact-parish admin boundary | `docs/DASHBOARD_SHELL_SERVER_CONTEXT_EXACT_PARISH_ADMIN_20260710.md`, `lib/server/loadDashboardShellContext.ts`, `lib/server/staffParishRole.ts`, and `/api/audit-events` | Confirm identity/admin capability is server-rendered, the shell no longer fetches the Staff Access roster during hydration, logout remains the only shell browser Supabase use, and full reads/parish-level writes require active admin status in the exact selected parish. |
| Export exact selected-parish role boundary | `docs/EXPORT_SELECTED_PARISH_ROLE_BOUNDARY_20260710.md`, `lib/server/staffParishRole.ts`, and both gated export pilot routes | Confirm export permission roles come from the authenticated membership in the exact selected parish, missing/failed roles deny before privileged reads, safe denial metadata reaches the forged-scope reviewer queue, and production exports remain disabled. |
| Communications Center active-parish mutation API | `docs/COMMUNICATIONS_CENTER_ACTIVE_PARISH_MUTATION_API_20260710.md`, `POST/PATCH /api/requests/[id]/communications`, and `DashboardCommunicationsPageClient.tsx` | Confirm staff authentication, active-parish membership, and same-parish request ownership precede communication/follow-up writes; audit metadata excludes notes; partial success remains explicit; and the browser has no obsolete mutation Server Action. |
| Intake Queue active-parish triage APIs | `docs/INTAKE_QUEUE_ACTIVE_PARISH_TRIAGE_APIS_20260710.md`, the request/Mass Intention intake-triage routes, and `DashboardIntakePageClient.tsx` | Confirm staff authentication, bounded parsing, selected-parish membership, and exact request/intention ownership precede writes; safe audits exclude staff text/dates; first-contact partial success is explicit; and the browser has no obsolete mutation Server Action. |
| Sacramental Record create relationship integrity | `docs/SACRAMENTAL_RECORD_CREATE_RELATIONSHIP_INTEGRITY_20260710.md`, `lib/server/sacramentalRecordCreateRelationships.ts`, and `createSacramentalRecord` | Confirm optional source requests and linked people belong to the already-authorized selected parish, duplicate request-to-record creation stops before insert, technical failures remain client-safe, and no automatic linking, certificate generation, or canonical decision logic was added. |
| Core record action active-parish fallback boundary | `docs/CORE_RECORD_ACTION_ACTIVE_PARISH_FALLBACK_BOUNDARY_20260710.md`, the People/Household/Mass Intention/Sacramental Record Server Actions, and `lib/server/coreRecordActionPrimaryFallbackBoundary.test.ts` | Confirm active-parish cookies disable legacy primary fallback across all four core action modules, cookie-less compatibility remains explicit, and selected-parish writes fail closed without migrations, RLS changes, or production access. |
| Request note audit metadata privacy | `docs/REQUEST_NOTE_AUDIT_METADATA_PRIVACY_BOUNDARY_20260710.md`, `addRequestNote`, and `lib/server/requestNoteAuditMetadataPrivacy.test.ts` | Confirm internal note text remains only in the protected note record, note audit metadata contains source/length only, Audit Log titles remain clear, and note previews or raw bodies cannot re-enter the audit block. |
| Request content audit event ownership | `docs/REQUEST_CONTENT_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md`, the scoped AI-summary/reply-draft save routes, `POST /api/email/send`, and `lib/server/requestContentAuditOwnership.test.ts` | Confirm the owning server route records each event only after successful work, browser-forged copies are blocked, request/parish/staff attribution is server-derived, and metadata excludes generated text, subjects, recipients, prompts, provider payloads, tokens, and secrets. |
| Request mutation audit event ownership | `docs/REQUEST_MUTATION_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md`, the checklist/staff-note/suggested-date/Funeral/Wedding request routes, and `lib/server/requestContentAuditOwnership.test.ts` | Confirm scoped routes own audit events after successful mutation, generic client copies are blocked, and metadata excludes note bodies, pastoral details, names, checklist labels, and date values. |
| Request schedule audit event ownership | `docs/REQUEST_SCHEDULE_AUDIT_EVENT_OWNERSHIP_BOUNDARY_20260710.md`, the four confirmed-date routes, three Google Calendar lifecycle routes, and `lib/server/requestContentAuditOwnership.test.ts` | Confirm schedule events are route-owned after successful operations, Request Detail performs no audit POST, request-target generic writes are rejected, and metadata excludes schedule/provider values. |
| Google Calendar data projection boundary | `docs/GOOGLE_CALENDAR_DATA_PROJECTION_BOUNDARY_20260710.md`, `lib/calendarEventFromRequest.ts`, the three Calendar event lifecycle routes, and `lib/server/googleCalendarDataProjectionBoundary.test.ts` | Confirm request, parishioner, Funeral, Wedding, and OCIA reads use explicit projections, browser operational Supabase access remains absent, provider behavior is unchanged, and no provider smoke claim is inferred from source tests. |
| Baptism certificate active-parish boundary | `docs/BAPTISM_CERTIFICATE_ACTIVE_PARISH_BOUNDARY_20260710.md`, `app/api/records/[id]/certificate/route.ts`, and the focused certificate route tests | Confirm staff authentication, exact selected-parish membership, same-parish record constraints, minimal projections, PDF-before-event ordering, generic denial, and the absence of automatic/canonical decision behavior. |
| Duplicate review explicit projection boundary | `docs/DUPLICATE_REVIEW_EXPLICIT_PROJECTION_BOUNDARY_20260710.md`, the People/Household duplicate routes, and their focused route tests | Confirm candidate and merge reads use explicit current-contract projections, active-parish scope and merge behavior remain intact, and future schema fields cannot enter privileged duplicate review through wildcard selection. |
| Sacramental Record read projection boundary | `docs/SACRAMENTAL_RECORD_READ_PROJECTION_BOUNDARY_20260710.md`, the list/detail loaders, and their focused tests | Confirm list and activity reads use minimal view-specific projections, detail reads use an explicit register contract, selected-parish scope remains intact, and raw event metadata cannot enter the activity view. |
| Sacramental Record prefill request projection boundary | `docs/SACRAMENTAL_RECORD_PREFILL_REQUEST_PROJECTION_BOUNDARY_20260710.md`, the record actions module, and its focused tests | Confirm request prefill uses an explicit eight-field request contract after scoped access verification and cannot acquire unrelated or future request fields through wildcard selection. |
| Core directory list projection boundary | `docs/CORE_DIRECTORY_LIST_PROJECTION_BOUNDARY_20260710.md`, the People/Households/Mass Intentions list loaders, and their focused tests | Confirm daily list surfaces use minimal view-specific DTOs, preserve selected-parish behavior, and cannot acquire notes, internal linkage fields, timestamps, or future columns through wildcard selection. |
| Core detail read projection boundary | `docs/CORE_DETAIL_READ_PROJECTION_BOUNDARY_20260710.md`, the Person/Household/Mass Intention detail loaders, the shared Sacramental Record projections, and focused tests | Confirm primary detail records use explicit complete contracts, embedded Catholic-record history uses a minimal summary, and selected-parish scope plus full staff-visible detail behavior remain intact. |
| Care Calendar and Intake intention projection boundary | `docs/CARE_CALENDAR_INTAKE_INTENTION_PROJECTION_BOUNDARY_20260710.md`, the two operating loaders/domain DTOs, and focused tests | Confirm Calendar and Intake receive separate minimal Mass Intention contracts, selected-parish scope remains intact, and unrelated notes, metadata, or operational fields cannot enter either workspace through wildcard selection. |
| Parish Daily Brief projection boundary | `docs/PARISH_DAILY_BRIEF_PROJECTION_BOUNDARY_20260710.md`, the Daily Brief loader, and focused tests | Confirm the morning brief uses compile-time explicit request/parishioner/type-detail contracts, preserves operational scoring and parish scope, and excludes notes, drafts, contact fields, and unrelated pastoral details. |
| OCIA detail presence projection boundary | `docs/OCIA_DETAIL_PRESENCE_PROJECTION_BOUNDARY_20260710.md`, `lib/ensureOciaRequestDetails.ts`, and focused tests | Confirm existence, insert-result, and race-recovery reads use only `request_id`, preserve placeholder/schedule behavior, and leave no application runtime wildcard reads. |
| Runtime Supabase wildcard projection guard | `docs/RUNTIME_SUPABASE_WILDCARD_PROJECTION_GUARD_20260710.md` and `lib/server/runtimeSupabaseWildcardProjectionGuard.test.ts` | Confirm runtime TypeScript is recursively scanned, test/spec files are excluded, new wildcard projections fail CI, and the guard does not claim to replace authorization, RLS, or DTO review. |
| Daily Work Hub typed response DTO boundary | `docs/DAILY_WORK_HUB_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md`, `lib/dashboardWorkHubDtos.ts`, the Work Hub loaders, and focused tests | Confirm server/browser requests share one allowlisted contract, malformed rows fail closed, unexpected fields are dropped, and authentication plus selected-parish authorization remain separate prerequisites. |
| Dashboard shell client safe messages | `docs/DASHBOARD_SHELL_CLIENT_SAFE_MESSAGES_20260710.md` and `lib/dashboardShellClientMessages.ts` | Confirm parish-switcher, Global Search, and Notifications Center errors/warnings use client allowlists or stable fallbacks while authentication, active-parish scope, queries, navigation, and refresh behavior remain unchanged. |
| Google Calendar external link safety | `docs/GOOGLE_CALENDAR_EXTERNAL_LINK_SAFETY_BOUNDARY_20260710.md` and `lib/googleCalendarLinks.ts` | Confirm saved and conflict event links render only after credential-free HTTPS Google-host validation, with no Google API call or event mutation behavior change. |
| App Router error recovery | `docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md`, `app/error.tsx`, and `app/global-error.tsx` | Confirm unexpected page/root-layout failures receive retryable generic UI without rendering exception messages, error digests, stack traces, object dumps, or client console logs. |
| App Router not-found boundary | `docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md` and `app/not-found.tsx` | Confirm stale or unmatched links receive fixed safe navigation without reflecting requested paths, query strings, cookies, headers, identifiers, or technical details. |
| Dashboard segment loading boundary | `docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md` and `app/dashboard/loading.tsx` | Confirm page/nested-route loading UI stays inside the authorized dashboard layout, remains server-only/static, and performs no data, route-state, external, or mutation work. |
| Dashboard segment error recovery | `docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md` and `app/dashboard/error.tsx` | Confirm child workspace failures preserve the authorized dashboard layout, use retry/fixed dashboard navigation, and never consume or expose exception, digest, route, staff, or parish details. |
| Google Calendar event body-size boundary | `docs/GOOGLE_CALENDAR_EVENT_BODY_SIZE_BOUNDARY_20260709.md` and the three `app/api/google/calendar-event/*/route.ts` mutation routes | Confirm staff authorization and selected-parish ownership precede external Google mutation and malformed/oversized bodies stop before parish/database/Google work. |
| AI route body-size boundary | `docs/AI_ROUTE_BODY_SIZE_BOUNDARY_20260709.md` and `app/api/ai/{summary,reply}/route.ts` | Confirm staff authentication precedes bounded parsing and all existing safety-chain gates remain before prompt, audit, response exposure, or OpenAI work. |
| Request communication body-size boundary | `docs/REQUEST_COMMUNICATION_BODY_SIZE_BOUNDARY_20260709.md` and `app/api/requests/[id]/communications/route.ts` | Confirm staff authentication and bounded parsing precede active-parish request ownership plus communication/request-summary writes. |
| Request text mutation body-size boundary | `docs/REQUEST_TEXT_MUTATION_BODY_SIZE_BOUNDARY_20260709.md` and the staff-notes, AI-summary-save, and reply-draft-save request routes | Confirm staff authentication and bounded parsing precede active-parish request ownership and request text updates. |
| Request schedule mutation body-size boundary | `docs/REQUEST_SCHEDULE_MUTATION_BODY_SIZE_BOUNDARY_20260709.md` and the five suggested/confirmed date request routes | Confirm staff authentication and bounded parsing precede active-parish ownership, request-type checks, and schedule writes. |
| Request pastoral detail body-size boundary | `docs/REQUEST_PASTORAL_DETAIL_BODY_SIZE_BOUNDARY_20260709.md` and the Funeral/Wedding detail routes | Confirm staff authentication and bounded parsing precede active-parish ownership, request-type checks, detail reads, and upserts while preserving confirmed dates. |
| Request workflow metadata body-size boundary | `docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md` and the checklist-item/document-review mutation routes | Confirm staff authentication and bounded parsing precede active-parish request ownership plus checklist/document reads, updates, audit writes, or storage access. |
| Parish administration body-size boundary | `docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md` and the parish settings, workflow-template, and staff-access mutation routes | Confirm staff authentication and route-appropriate bounded parsing precede active-parish write scope, admin authorization, operational reads/writes, and audit events. |
| Audit-event body-size boundary | `docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md` and `POST /api/audit-events` | Confirm staff authentication and bounded parsing precede request/parish scope resolution and audit writes while preserving target validation and non-request admin checks. |
| Public-intake routing admin body-size boundary | `docs/PUBLIC_INTAKE_ROUTING_ADMIN_BODY_SIZE_BOUNDARY_20260709.md` and the routing metadata POST/PATCH handlers | Confirm staff authentication and bounded parsing precede active-parish scope, token generation/hashing, DNS verification, row changes, or audit events while runtime routing remains disabled by default. |
| Duplicate merge body-size boundary | `docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md` and the People/Household duplicate POST handlers | Confirm staff authentication and bounded parsing precede active-parish scope, entity reads, merge/repoint/delete work, or audit events while valid merge semantics remain unchanged. |
| Import body-size boundary | `docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md` and `POST /api/imports` | Confirm the 4 MiB ceiling follows staff authentication and precedes row parsing, active-parish scope, previews, inserts, batch history, or audit events while the existing 1,000-row limit remains. |
| Duplicate/import client safe messages | `docs/DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_20260709.md` and the duplicate-review/import client message helpers | Confirm approved validation guidance remains visible while unexpected API/provider/database text falls back to action-specific safe staff messages. |
| Dependency security baseline | `docs/DEPENDENCY_SECURITY_REMEDIATION_20260709.md` | Confirm the reviewed dependency baseline, zero-audit evidence, and point-in-time limitation are visible before release review. |
| CI workflow | `.github/workflows/ci.yml` | Confirm CI runs the dependency security audit after install, then tests, typecheck, all-file typecheck, release-env guard, RLS evidence checks, production monitoring evidence checks, production-gate boundary checks, trust-center claims checks, handoff checks, completed-evidence checks, lint, and build. CI workflow must remain read-only and non-deploying. |
| Release-env guard | `scripts/check-release-readiness-env.mjs` | Confirm known production-sensitive runtime flags are not enabled, and confirm configured QA/prototype `_ACK` / `_ENV` residue is absent, including CSP, monitoring/observability, export, public intake, AI, workflow reminder, and Catholic records gate names. |
| Local release-readiness runner | `scripts/run-release-readiness-local.mjs` | Run the full local release-readiness command sequence or preview it with `--plan` before recording label-only evidence. |
| Handoff consistency checker | `scripts/check-release-readiness-handoff.mjs` | Confirm release-readiness docs, CI shape, command order, locked gates, and sanitized evidence rules have not drifted. |
| Completed local evidence checker | `scripts/check-release-local-evidence.mjs` | Confirm the current completed evidence file still validates as sanitized, label-only evidence after handoff consistency checks. |
| Membership-aware RLS production evidence checker | `scripts/check-rls-production-evidence.mjs` and `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md` | Confirm the RLS production evidence package is review-ready while production rollout remains blocked. |
| Production monitoring evidence checker | `scripts/check-production-monitoring-evidence.mjs` and `docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md` | Confirm the production monitoring evidence package is review-ready while runtime monitoring, production smoke, external sends, and public trust claims remain blocked. |
| Production gate boundary index | `docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md` | Confirm sensitive gates remain `NO-GO` unless separately approved. |
| Production gate checker | `scripts/check-production-gates.mjs` | Confirm `productionSensitiveFeaturesApproved` and `publicTrustClaimsApproved` remain `false`. |
| Next.js proxy staff auth gate | `docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md`, `docs/NEXT_PROXY_STAFF_AUTH_CURRENT_COMPATIBILITY_BOUNDARY_20260708.md`, `docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md`, `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md`, `docs/NEXT_PROXY_STAFF_AUTH_TECHNICAL_APPROVAL_20260711.md`, and `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_20260711.md` | Membership-aware proxy implementation and shared-QA-backed positive-path browser smoke are complete. Require named owners, immutable release-candidate binding, production-safe fixtures, and explicit product/security approval; production remains `NO-GO`. |
| CSP report-only evidence checker | `scripts/check-csp-report-only-evidence.mjs` and `docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md` | Confirm CSP report-only evidence is review-ready while runtime CSP, production CSP, enforcing CSP, and public trust claims remain blocked. |
| Trust-center claims checker | `scripts/check-trust-center-claims.mjs` and `docs/TRUST_CENTER_PUBLIC_CLAIMS_CONSISTENCY_CHECKER_20260707.md` | Confirm public trust-center publishing and public claims remain blocked. |
| Browser security headers and API cache baseline | `docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md` and `next.config.ts` | Confirm implemented browser headers are documented, every `/api/:path*` response is explicitly private/no-store, and CSP is intentionally excluded pending its separate approval path. |
| CSP report-only approval packet | `docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md` | Confirm runtime CSP remains unimplemented and report-only CSP requires separate approval, source preflight, smoke evidence, rollback, and owner sign-off. |

## Optional Consistency Shortcuts

Reviewers can check the current completed local evidence file itself without rerunning the heavy release checklist:

```bash
npm run check:release-local-evidence
```

Expected decision:

```json
{
  "decision": "LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW"
}
```

This optional shortcut validates `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md` through `scripts/check-release-local-evidence.mjs`. It confirms the completed evidence still includes the required command sequence, pass labels, local validator result, production-sensitive `NO-GO` boundaries, no-added-production-flags and no-Google-Calendar-data-touch confirmations, and no obvious secret-shaped values. It does not replace rerunning `npm run check:release-local` when fresh code changes need new release evidence.

The current completed local evidence includes the 2026-07-08 offline-safe build refresh. That refresh records that the full local release runner returned `LOCAL_RELEASE_READINESS_PASSED`, Full Vitest completed successfully: 571 test files, 2,275 tests., and `npm run build` passed after the app shell stopped depending on a build-time Google Fonts request. The build no longer required a Google Fonts network fetch. This is production-readiness evidence only, not production approval.

The freshest process-clean rerun receipt is `docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md`. It records that the current shell first failed closed with QA/prototype residue, then a child process with only known production-sensitive QA/prototype variable names cleared passed the full 12-command local release runner. It remains evidence only and does not approve production-sensitive gates.

Reviewers can also inspect stale QA/prototype runtime residue without printing raw values:

```bash
npm run check:release-env-cleanup-guide
```

Expected cleanup-guide behavior:

- reports variable names and safe labels only;
- includes `mutatesEnvironment: false`;
- includes `secretValuesPrinted: false`;
- prints process-scope and optional Windows user-scope PowerShell cleanup commands;
- does not clear anything automatically.

## Local Command Sequence

Run these commands in order before a release-readiness handoff:

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

If any command fails, stop. Do not use the handoff as release evidence until the failure is fixed and the sequence is rerun.

## Required CI Shape

The CI workflow must keep this order:

1. `npm run check:repository-secrets`
2. `npm ci`
3. `npm run check:dependency-security`
4. `npm test`
5. `npm run typecheck`
6. `npm run typecheck:all`
7. `npm run check:release-env`
8. `npm run check:rls-production-evidence`
9. `npm run check:production-monitoring-evidence`
10. `npm run check:production-gates`
11. `npm run check:csp-report-only`
12. `npm run check:trust-center-claims`
13. `npm run check:release-handoff`
14. `npm run check:release-local-evidence`
15. `npm run lint`
16. `npm run build`

The repository secret scan must run before `npm ci` and print no matched values, so credential-shaped content is blocked before dependency installation or application checks begin.

The dependency security audit must run after `npm ci` and before tests, so a newly disclosed dependency vulnerability fails the review path before application verification continues.

The release-env guard must run before production-gate boundary checks, so CI cannot accidentally validate production-sensitive gates while QA/prototype runtime flags, report-only CSP runtime flags, monitoring runtime flags, export audit reviewer dashboard production flags, or configured QA/prototype `_ACK` / `_ENV` residue are present.

The RLS production evidence checker must run before production-gate boundary checks, so the highest-risk production database gate is reviewed directly before the broader locked-gate boundary index.

The production monitoring evidence checker must run before production-gate boundary checks, so observability approval artifacts are reviewed directly while runtime monitoring, external sends, production smoke, and public trust claims remain blocked.

The CSP report-only evidence checker must run after production-gate boundary checks, so browser-security readiness is validated before public trust-center claims and handoff review.

The trust-center claims checker must run after production-gate boundary checks, so CI confirms public trust-center publishing remains blocked before handoff review.

The handoff consistency checker must run after trust-center claims checks, so CI confirms the human-facing handoff map still matches the enforced production-sensitive gate boundary and public-claims boundary.

The handoff consistency checker must run after production-gate boundary checks and trust-center claims checks, so release handoff review cannot outrun either locked-gate boundary.

The completed local evidence checker must run after handoff consistency checks, so CI verifies the current completed evidence file still contains the required sanitized command evidence, current gate-count addendum, and production `NO-GO` boundaries before lint/build.

CI workflow must remain read-only and non-deploying: the workflow must keep `permissions: contents: read`, must not request write/id-token deployment permissions, must not target the production environment, must not apply migrations, and must not reference service-role, OpenAI, or shared-QA database credential variables.

## Handoff Evidence Rules

Completed evidence must be label-only and sanitized.

Do not paste:

- database URLs
- service-role keys
- anon keys
- API keys
- bearer tokens
- JWTs
- OAuth tokens or refresh tokens
- plaintext family portal tokens
- signed URL values
- storage paths
- original filenames
- private document contents
- raw export contents
- raw audit metadata
- raw provider payloads
- raw production record IDs
- staff passwords
- parishioner private contact details

## Production-Sensitive Gates Still Locked

Before any production-sensitive action, confirm the specific gate has its own approval packet, smoke evidence, rollback plan, monitoring/support owners where relevant, and exact product-owner approval language.

Current locked gates include:

- Membership-aware operational RLS production rollout
- Production monitoring runtime and production smoke
- Public intake runtime routing production rollout
- AI summary safety-chain production rollout
- AI reply audit-write, safe-response exposure, generation, and outbound-send rollout
- Request-list basic production export
- Request-document manifest production export
- Export audit reviewer dashboard production exposure
- Backup/restore public claims
- Public trust-center publication
- Content Security Policy runtime and enforcing CSP
- Workflow Reminders V1 runtime delivery
- Certificate issuance logging runtime
- Sacramental correction and notation runtime workflows
- Next.js proxy staff authorization hardening

## Reviewer Pass/Fail Checklist

| Check | Required outcome |
|---|---|
| README entry point visible | `PASS` |
| Local checklist commands run in order | `PASS` |
| Local evidence template filled with sanitized labels only | `PASS` |
| Local evidence validator returned `READY_FOR_HUMAN_RELEASE_REVIEW` | `PASS` |
| Human review packet confirms production-sensitive gates remain separate | `PASS` |
| CI includes release-env guard before production-gate checks | `PASS` |
| `check:release-env` refuses QA/prototype `_ACK` and `_ENV` residue | `PASS` |
| `check:release-env-cleanup-guide` reports variable names and safe labels only | `PASS` |
| CI includes handoff consistency checker after trust-center claims checks | `PASS` |
| CI includes completed local evidence checker after handoff checks | `PASS` |
| CI workflow remains read-only and non-deploying | `PASS` |
| `check:release-env` accepted clean shell | `PASS` |
| `check:rls-production-evidence` returned `RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW` | `PASS` |
| `productionRlsApproved` remains `false` | `PASS` |
| `check:production-monitoring-evidence` returned `PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW` | `PASS` |
| `productionMonitoringEnabled` remains `false` | `PASS` |
| `check:production-gates` returned `BOUNDARIES_READY_FOR_REVIEW` | `PASS` |
| Next.js proxy staff auth artifact bundle linked | `PASS` |
| `check:csp-report-only` returned `CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW` | `PASS` |
| `check:trust-center-claims` returned `PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW` | `PASS` |
| `check:release-handoff` returned `RELEASE_HANDOFF_READY_FOR_REVIEW` | `PASS` |
| `check:release-local-evidence` returned `LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW` | `PASS` |
| Current completed local evidence includes the 2026-07-08 offline-safe build refresh | `PASS` |
| Full Vitest completed successfully: 571 test files, 2,275 tests. | `PASS` |
| Build no longer required a Google Fonts network fetch | `PASS` |
| `productionSensitiveFeaturesApproved` remains `false` | `PASS` |
| `publicTrustClaimsApproved` remains `false` | `PASS` |
| Specific production-sensitive gate artifact reviewed | `PASS` or `NOT APPLICABLE` |
| Exact owner approval language exists for requested production action | `PASS` or `NOT APPLICABLE` |
| Production approval granted by this handoff index | `NO` |

## Final Handoff Decision

- Local release-readiness handoff complete: `YES` / `NO`
- Ready for human review: `YES` / `NO`
- Production approval granted by this index: `NO`
- Remaining blockers:
- Next safe action:
