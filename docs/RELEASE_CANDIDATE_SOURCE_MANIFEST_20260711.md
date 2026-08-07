# Release Candidate Source Manifest - 2026-07-11

Completion marker: `RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711`

Decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY_FOR_IMMUTABLE_COMMIT`

## Merged-Main Rollout Checkpoint Identity

The 2026-08-07 controlled-rollout checkpoint source is committed at
`8af0498407e9268a9b9e3a0e5c0dd6d8ce891a91`. It binds merged `main`, the green
approved-head CI and Preview evidence, the ready but unpromoted main artifact,
the unchanged public-domain rollback deployment, and the continued production
`NO-GO` boundary.

- Immutable checkpoint source commit: `8af0498407e9268a9b9e3a0e5c0dd6d8ce891a91`
- Tracked-head aggregate SHA-256: `EEB15BC5D949F34E35EB6BEEF9F8C5319FE74011712418C61CB1D4699362B710`
- Tracked source file count: `1531`
- Source mode: `tracked-head`
- Production approval granted: `NO`

The first exact-commit branch CI run `31217039980` failed closed only because
this human-review evidence file did not yet contain the new immutable aggregate.
Repository secret scanning and dependency audit passed, and the test run reached
`879` passing files / `3,779` passing tests before the single manifest-evidence
assertion stopped later checks. This docs-only binding correction is outside the
release-source allowlist, so it records rather than changes the aggregate. A new
exact-head CI run is required before publication can be considered green.

This tracked-source identity does not replace an immutable Git commit and does
not authorize deployment, alias promotion, production access, smoke testing,
migrations, RLS changes, feature flags, record mutation, provider calls, storage,
exports, certificate generation, or public claims.

## Post-Publication Exact-Head Preview Evidence Identity

The 2026-08-07 release-integrity evidence slice records the published exact head,
green clean-checkout CI, `READY` Preview identity, authenticated exact-deployment
health, and protected staff Request Detail allow/deny smoke. It also refreshes the
current roadmap, SSoT, build status, operations index, and approval-gated P0
register without changing runtime behavior.

- Immutable evidence implementation commit: `0d79d86f7d238900ec19d5b2c26f8be340d18d5e`
- Tracked-head aggregate SHA-256: `FE96537917C96E96A22C52714B468E67885EE0E1BF7819BA1F808989B5C36AAA`
- Tracked source file count: `1530`
- Source mode: `tracked-head`
- Production approval granted: `NO`

The complete local 15-command release contract passed against the evidence-update
working tree in an isolated flag-off process: zero secret findings, zero known
dependency vulnerabilities, every evidence/gate check, both TypeScript scopes,
lint, `879` test files / `3,775` tests, and the credential-free Next.js 16.3.0
`56`-page build. The published reviewed head remains `a92f6b82`; this local
evidence commit and its docs-only binding are not published, do not alter PR `#8`,
and do not authorize a merge or production action.

This tracked-source identity does not replace an immutable Git commit and does not
authorize deployment, production access, migration, RLS change, record mutation,
provider call, export, AI call, storage action, signed URL, communication,
certificate generation, production-sensitive flag, or public trust claim.

## Post-Release Export Audit Reviewer Dashboard Client Read Deadline Slice

The 2026-07-20 export-governance reliability slice bounds the non-production reviewer dashboard's protected API read at 15 seconds and aborts obsolete work on replacement, saved-filter change, or unmount. Existing latest-response ownership, generic staff-safe errors, API-only data access, read-only behavior, and production `NO-GO` boundaries remain unchanged.

- Immutable implementation commit: `91d39c2080cddc145acae1b2ada822291c746cfe`
- Tracked-head aggregate SHA-256: `713C54768F43D49AC3ADB0BF78F5AC15DD849F958014C2897078ACC83B383C3A`
- Tracked source file count: `1521`
- Source mode: `tracked-head`
- Production approval granted: `NO`

Focused dashboard, route, read-model, prior QA evidence, and new deadline coverage passed `5` files / `28` tests. The complete release contract passed all `15` checks with zero secret findings across `2,923` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `872` test files / `3,735` tests, and the credential-free `56`-page build. Complete evidence is recorded in `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

This tracked-source identity does not replace an immutable Git commit and does not authorize a merge, deployment, migration, RLS change, production access, dashboard exposure, export, raw metadata access, storage action, signed URL, provider call, AI call, communication, certificate generation, production-sensitive flag, or public trust claim.

## Post-Release Request Detail Parish Directory Scope Slice

The 2026-07-20 selected-parish reliability slice bounds Request Detail's optional staff/priest assignment directory read at 15 seconds, clears prior-parish choices before replacement, validates the complete settings response and returned parish id against the loaded request's authoritative parish, and ignores obsolete settlement. The path remains credentialed and read-only.

- Immutable implementation commit: `ca03a7cbdbfa5042006d0d482b335f6c1a018412`
- Tracked-head aggregate SHA-256: `F9383B3D44A0ABD00DBBADCACAB1C2E4FDD3FDC6C04A4AC09274B8A3D8CB8FB6`
- Tracked source file count: `1520`
- Source mode: `tracked-head`
- Production approval granted: `NO`

Focused parser and new boundary coverage passed `3` files / `15` tests; existing Request Detail and parish-settings regression coverage passed `16` files / `74` tests. The complete release contract passed all `15` checks with zero secret findings across `2,921` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `871` test files / `3,731` tests, and the credential-free `56`-page build. Complete evidence is recorded in `docs/REQUEST_DETAIL_PARISH_DIRECTORY_SCOPE_BOUNDARY_20260720.md`.

This tracked-source identity does not replace an immutable Git commit and does not authorize a merge, deployment, migration, RLS change, production access, record mutation, assignment write, provider call, storage action, export, AI call, communication, certificate generation, production-sensitive flag, or public trust claim.

## Post-Release Daily Work Hub Workflow Settings Scope Slice

The 2026-07-20 selected-parish reliability slice bounds the Daily Work Hub's auxiliary workflow SLA settings read at 15 seconds, resets care-cadence rules to safe defaults on every parish transition, validates the returned parish id, and ignores stale or invalidated settlement. The path remains credentialed and read-only.

- Immutable implementation commit: `0392f5110a3cdc4ff0040ebcbcd50db9751eaa52`
- Tracked-head aggregate SHA-256: `B06BC97423E5C68DC1E0949CF6750906EEBD27CE4274BFE99706180084A68886`
- Tracked source file count: `1519`
- Source mode: `tracked-head`
- Production approval granted: `NO`

Focused Daily Work Hub source-dependent coverage passed `10` files / `54` tests. The complete release contract passed all `15` checks with zero secret findings across `2,919` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `870` test files / `3,727` tests, and the credential-free `56`-page build. Complete evidence is recorded in `docs/DAILY_WORK_HUB_WORKFLOW_SETTINGS_SCOPE_BOUNDARY_20260720.md`.

This tracked-source identity does not replace an immutable Git commit and does not authorize a merge, deployment, migration, RLS change, production access, record mutation, provider call, storage action, export, AI call, communication, certificate generation, production-sensitive flag, or public trust claim.

## Post-Release Clean-Checkout Source Manifest Invariant

GitHub Actions run `29791367802` correctly stopped at the test stage after the ten-commit publication because the human-review evidence assertion used the mutable working-tree manifest. Four unrelated local untracked scripts had supplied a matching `Source file count: 1522` line locally, while the clean checkout contained only the approved 1,518 tracked release-source files.

- Immutable implementation commit: `9e15d6b2ba1788c39fc7bf8cf8bd82f0265cfccd`
- Tracked-head aggregate SHA-256: `1AA7EC5167D88A91314CA3D2CF029C2CAB9111BD241FB599587A8F4B7AC7CEC7`
- Tracked source file count: `1518`
- Source mode: `tracked-head`
- Production approval granted: `NO`

The evidence-binding test now invokes the existing `--tracked-head` mode and requires the documented tracked-head count. This makes clean-checkout CI and a dirty developer workspace evaluate the same immutable source surface. Focused coverage passed `1` file / `6` tests. Complete release-contract verification is recorded in `docs/RELEASE_SOURCE_MANIFEST_CLEAN_CHECKOUT_INVARIANT_20260720.md`.

This tracked-source identity does not replace an immutable Git commit and does not authorize a merge, deployment, migration, RLS change, production access, storage action, token creation, certificate generation, production-sensitive flag, or public trust claim.

## Post-Release Request Documents Confirmation Recovery Slice

The 2026-07-20 Request Documents reliability slice keeps upload, staff review, and family-link creation behind one synchronous write lock and freezes further document writes after timeout, transport uncertainty, malformed success, or failed authoritative list reload. Explicit server rejection remains retryable. A confirmed family link remains visible when clipboard copying fails, and no document or token mutation replays automatically.

- Immutable implementation commit: `8544263fd91691e6234d4111e71a703180c7fbdb`
- Tracked-head aggregate SHA-256: `F7C1111468121579492A38F46D317997755AF0F13B06802226F2303F0C934007`
- Tracked source file count: `1518`
- Working-tree aggregate SHA-256: `E344C2F24788246D32CD16B8407DD7F4EC753B2C50AAAD6527B16A4A8536A60E`
- Source file count: `1522`
- Tracked source files: `1518`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

Focused document-message, client-recovery, single-flight, safe-message, route-authorization, cleanup, and compensation coverage passed `7` files / `34` tests. TypeScript, lint, and diff hygiene passed. The complete release-readiness contract then passed all `15` checks with zero secret findings across `2,915` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `869` test files / `3,723` tests, and the credential-free `56`-page build.

The four untracked release-source files are unrelated user-owned scripts already present in the shared workspace. They remain outside this implementation commit. This section does not authorize storage access, document upload or review, token creation, a production action, deployment, migration, RLS change, production-sensitive feature, or public trust claim.

## Post-Release Record Certificate Client Confirmation Slice

The 2026-07-20 certificate reliability slice gives the staff-reviewed Baptism certificate POST a 60-second browser confirmation deadline. Explicit server rejection remains retryable. Timeout, transport uncertainty, malformed PDF acknowledgement, or an empty PDF result freezes another generation attempt until staff refresh and review certificate activity. Synchronous single flight prevents duplicate dispatch, and no generation request replays automatically.

- Immutable implementation commit: `b85ea09123fe4abc9d6cf45b999d455f38352bcb`
- Tracked-head aggregate SHA-256: `BCE10A325BC6A9E48BBF8B324DFA691A5EA9C1F122189B2B630C48F6ADDDF60D`
- Tracked source file count: `1518`
- Working-tree aggregate SHA-256: `76028F59A97E8DC68CC22A81A633C055E8BD224DFBCC98E63AC6BAAD9063F082`
- Source file count: `1522`
- Tracked source files: `1518`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

Focused certificate confirmation, selected-parish route, safe-error, explicit-method, and audit-order coverage passed `6` files / `22` tests. TypeScript, lint, and diff hygiene passed. The complete release-readiness contract then passed all `15` checks with zero secret findings across `2,914` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `869` test files / `3,721` tests, and the credential-free `56`-page build.

The four untracked release-source files are unrelated user-owned scripts already present in the shared workspace. They remain outside this implementation commit. This section does not authorize certificate generation, a production action, deployment, migration, RLS change, production-sensitive feature, canonical or sacramental decision, or public trust claim.

## Post-Release Onboarding Completion Confirmation Slice

The 2026-07-20 Onboarding reliability slice keys the client workspace to the server-selected active parish and gives the staff-reviewed completion PATCH a 60-second browser confirmation deadline. Explicit server rejection remains retryable. A timeout, malformed acknowledgement, wrong-parish read model, or failure to reload the same parish with a confirmed completion timestamp freezes another completion attempt until staff refresh and review. No write replays automatically.

- Immutable implementation commit: `1b916e4ede7252ecf322f9400fd794086fbd6f5c`
- Tracked-head aggregate SHA-256: `7C585EA51C38C96591719C7D90C977C0C607D6C80104ADBE6583F469E00F76A3`
- Tracked source file count: `1516`
- Working-tree aggregate SHA-256: `86AA8B4C648EEC4C9B6A2000551B82CD4E7A46131D1A2FCF9BD8DD230FBAE41E`
- Source file count: `1520`
- Tracked source files: `1516`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

Focused Onboarding confirmation, single-flight, latest-response, readiness, safe-message, selected-parish, and go-live coverage passed `10` files / `38` tests. TypeScript, lint, and diff hygiene passed. The complete release-readiness contract then passed all `15` checks with zero secret findings across `2,911` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `868` test files / `3,717` tests, and the credential-free `56`-page build.

The four untracked release-source files are unrelated user-owned scripts already present in the shared workspace. They remain outside this implementation commit. This section does not authorize an Onboarding write, production action, deployment, migration, RLS change, production-sensitive feature, or public trust claim.

## Post-Release Daily Brief Client Confirmation Slice

The 2026-07-20 Daily Brief reliability slice gives the staff-initiated send a 30-second browser confirmation deadline over the existing bounded provider path. The client now captures the selected parish for the complete attempt, ignores stale settlement after a parish switch, requires an explicit positive provider message identifier before reporting success, and gives inbox-first guidance when delivery cannot be confirmed. Uncertain outcomes never replay automatically; a deliberate retry for the same selected parish reuses the existing opaque delivery attempt.

- Immutable implementation commit: `fe0c75fbe6cdb674153282babf74f6e7573407a3`
- Tracked-head aggregate SHA-256: `0AC717E566E754D32D5DC0C8779DA67661A00B1203179FEBCF390849EF396B72`
- Tracked source file count: `1513`
- Working-tree aggregate SHA-256: `D3A216473D26C7E393219C81E5FA0362FD78CA5F1FCB40EEA9E36A4E5349DA3C`
- Source file count: `1517`
- Tracked source files: `1513`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

Focused Daily Brief confirmation, provider reliability, single-flight, route, selected-parish, safe-message, and parish-settings compatibility coverage passed `9` files / `41` tests. TypeScript, lint, and diff hygiene passed. The first complete release-contract attempt correctly failed at the source-manifest evidence-binding test because this section did not yet exist; its partial result was not counted. After this exact identity was bound, the complete contract restarted from check 1 and passed all `15` checks with zero secret findings across `2,907` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `866` test files / `3,710` tests, and the credential-free `56`-page build.

The four untracked release-source files are unrelated user-owned scripts already present in the shared workspace. They remain outside this implementation commit. This section does not authorize a Daily Brief delivery, production action, deployment, migration, RLS change, production-sensitive feature, or public trust claim.

## Post-Release Public Intake Routing Confirmation Slice

The 2026-07-20 Public Intake Routing Settings reliability slice gives metadata, domain, DNS verification, and one-time token mutations a 60-second browser confirmation deadline. Existing shared single-flight locking remains authoritative. Explicit server rejections remain safely retryable, while transport uncertainty, malformed-success acknowledgement, or failure to reload authoritative selected-parish routing state freezes the complete management surface until staff refresh and review. Active-parish changes discard stale results and clear any one-time token from the prior parish. An acknowledged newly created token remains visible if the follow-up reload fails so staff can secure it without creating a duplicate. No mutation replays automatically, and runtime public routing behavior is unchanged.

- Immutable implementation commit: `f0b7d6201657785cfe731527e09dd6a7ce698d79`
- Tracked-head aggregate SHA-256: `9610711F2CA49207F321D827B95719F6E859C7A318289DA9B1FE9430600DA92D`
- Source mode: `tracked-head`
- Source file count: `1510`
- Tracked source files: `1510`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused mutation-deadline, single-flight, routing-route, selected-parish, validated-read-model, safe-message, and browser-evidence coverage passed `15` files / `74` tests. After an initial process was interrupted by a tool-session transition during the final build and was not counted, the complete resumable release contract passed all `15` checks in `382` seconds with zero secret findings across `2,903` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `864` test files / `3,704` tests, and the credential-free `56`-page build. The post-documentation focused suite passed `15` files / `74` tests, and the post-documentation secret scan passed across `2,904` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `84B12A24F3353EB0735BA2C9B76BB3C83F9C8B2319E638610C0BA30232A93AC3`
- Source file count: `1514`
- Tracked source files: `1510`
- Untracked source files: `4`
- Worktree dirty: `YES`

This section records source identity only. It does not enable runtime public intake routing, authorize a routing mutation, expose a token hash, or authorize a production action, migration, RLS change, or production-sensitive capability.

See `docs/PUBLIC_INTAKE_ROUTING_MUTATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Workflow Template Save Confirmation Slice

The 2026-07-20 Workflow Template reliability slice gives each reviewed step save a 60-second browser confirmation deadline. Existing synchronous single-flight locking remains authoritative. Explicit server rejections remain safely retryable, while transport uncertainty, malformed-success acknowledgement, or failure to reload the authoritative selected-parish template state freezes the editor until staff refresh and review. Active-parish changes discard stale results and establish a fresh scoped read. No save replays automatically.

- Immutable implementation commit: `405c7b28f7a229602b036b9f9641ada6f5e71d44`
- Tracked-head aggregate SHA-256: `B165A167D3D5343F8C61E18B592ABB779965D0C99A3729AEA672AE7ED90E56FE`
- Source mode: `tracked-head`
- Source file count: `1507`
- Tracked source files: `1507`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, single-flight, selected-parish, route, safe-message, and browser-evidence coverage passed `10` files / `36` tests. The complete release contract passed all `15` checks in `387.7` seconds with zero secret findings across `2,899` text files (`500` binaries skipped), zero vulnerabilities, both TypeScript scopes, lint, `862` test files / `3,698` tests, and the credential-free `56`-page build. The post-documentation focused suite passed `10` files / `36` tests, and the post-documentation secret scan passed across `2,900` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `DBD466C8F90A1BEBD76D5CB1233C83A95C3B8B4225ACF07BD6B998CD561B73EE`
- Source file count: `1511`
- Tracked source files: `1507`
- Untracked source files: `4`
- Worktree dirty: `YES`

This section records source identity only. It does not authorize a Workflow Template write, production action, migration, RLS change, or production-sensitive capability.

See `docs/WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Parish Settings Mutation Confirmation Slice

The 2026-07-20 Settings reliability slice gives parish-details and Staff Access writes a 60-second browser confirmation deadline. Existing synchronous locks still prevent duplicate dispatch. Explicit server rejections remain safely retryable, while transport uncertainty, malformed-success acknowledgement, or failure to reload the authoritative selected-parish state freezes the related controls until staff refresh and review. An active-parish change discards stale results and establishes a fresh scoped read. Daily Brief delivery and public-intake routing mutation behavior are unchanged, except that Daily Brief cannot begin while parish configuration is awaiting refresh. No operation replays automatically.

- Immutable implementation commit: `9c0912ebdf3d7299b9d7c8c126e23ff61a9d232d`
- Tracked-head aggregate SHA-256: `600289C1E5C6C64E09B77243D756A01CFCC9DE1064724A7B55BE20CB22F6EBDE`
- Source mode: `tracked-head`
- Source file count: `1504`
- Tracked source files: `1504`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, single-flight, selected-parish, authorization, confirmation-dialog, read-model, safe-message, and Daily Brief compatibility coverage passed `18` files / `73` tests. The complete release contract passed all `15` checks in `389.9` seconds with zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `860` test files / `3,692` tests, and the credential-free `56`-page build.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `DB53CA7C8CC2904F6C5C8AD0879D6286F4AD00DC635F73432512D0F36F602B97`
- Source file count: `1508`
- Tracked source files: `1504`
- Untracked source files: `4`
- Worktree dirty: `YES`

This section records source identity only. It does not authorize a settings write, Staff Access change, Daily Brief delivery, public-intake routing change, production action, or production-sensitive capability.

## Post-Release AI Client Confirmation Slice

The 2026-07-20 AI client reliability slice gives Request Detail summary/reply generation and Daily Work Hub follow-up drafting a 40-second browser confirmation deadline over the existing 30-second provider deadline. Summary and reply dispatches now acquire synchronous client locks before network work, accept only non-empty structured provider responses, and never replay automatically. Generated-content persistence has a separate 60-second confirmation deadline; ambiguous transport or malformed-success results freeze related mutation controls until staff refresh and review, while explicit rejected writes remain safely retryable. The existing authentication, active-parish/request ownership, AI safety gates, provider implementation, staff-review requirements, and production-disabled boundaries remain unchanged.

- Immutable implementation commit: `eb6a622db9e74eb0bd72dc8f05f01220f791186e`
- Tracked-head aggregate SHA-256: `B6FA677F41018079FA23CE91DBD63025494B8D88DC46ED4722813A67F4312B7B`
- Source mode: `tracked-head`
- Source file count: `1501`
- Tracked source files: `1501`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused AI confirmation, provider-deadline, safety-gate, active-parish persistence, same-origin, body-size, and Daily Work Hub coverage passed `17` files / `129` tests. After one stale source-contract assertion failed closed and was corrected to require the stronger refresh freeze, the complete release contract passed all `15` checks in `380.2` seconds with zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `858` test files / `3,685` tests, and the credential-free `56`-page build.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `2102EE1B06C0348B5AB1EB4CBA3647AD83FB766371BA74ABA08894EBF97C2CFE`
- Source file count: `1505`
- Tracked source files: `1501`
- Untracked source files: `4`
- Worktree dirty: `YES`

This section records source identity only. It does not enable AI runtime gates, authorize provider calls, approve production, or replace live non-production QA.

## Post-Release Google Calendar Client Confirmation Slice

The 2026-07-20 Google Calendar reliability slice gives Request Detail create, update, and delete calls a 25-second browser confirmation deadline, longer than the existing 15-second Google provider deadline. Once a provider mutation starts, a server failure reports only a safe refresh requirement; transport uncertainty, partial persistence, or failed post-success request refresh freezes every Calendar mutation control until staff refresh and review. Validation and conflict responses remain retryable, existing provider recovery remains authoritative, and no mutation is replayed automatically.

- Immutable implementation commit: `10888255f20611dabc051aae0f9cd15750dd22ad`
- Tracked-head aggregate SHA-256: `35E2C1DE34877B5186F7BD45CCED994C150AD93C87EFBD995A0B928F4D4B37B6`
- Source mode: `tracked-head`
- Source file count: `1498`
- Tracked source files: `1498`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused provider-reliability, route-authorization, same-origin, audit-ownership, conflict, confirmation-dialog, safe-message, and client-deadline coverage passed `12` files / `81` tests. Existing staff authentication, selected active-parish membership, same-parish request ownership, selected-parish integration checks, deterministic create identity, provider deadlines, safe OAuth guidance, and audited request linkage remain authoritative.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `9C37D7E2B7787ACD96D1769EA19F2392881B7F45D4E9DB23F06E9A0D5CDF5DCF`
- Source file count: `1502`
- Tracked source files: `1498`
- Untracked source files: `4`
- Worktree dirty: `YES`

The complete `15`-check release contract passed in `345` seconds with zero secret findings across `2,887` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `856` test files / `3,677` tests, and the credential-free Next.js 16.2.10 `56`-page build. The post-documentation source-bound suite passed `14` files / `89` tests, and the post-documentation secret scan passed across `2,888` text files with zero findings. This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a Google provider action.

See `docs/GOOGLE_CALENDAR_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Staff Email Client Confirmation Slice

The 2026-07-20 outbound-email reliability slice gives Request Detail and Daily Work Hub browser delivery confirmation a 20-second deadline, longer than the existing 12-second provider deadline, and gives post-send communication logging a 60-second deadline. Exact-content delivery retries retain the existing opaque provider-idempotent attempt. Once provider delivery is confirmed, any unconfirmed or rejected communication log freezes related mutation controls until staff refresh and review, preventing a second delivery from being used as a logging retry.

- Immutable implementation commit: `f7de8a6eeb320737987f6aa0332a0176fa535215`
- Tracked-head aggregate SHA-256: `3253FED2D2F7113513EAC1E28D465D19E153FDCF1ABD8A63055BC071917D850E`
- Source mode: `tracked-head`
- Source file count: `1496`
- Tracked source files: `1496`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused client-deadline, single-flight, provider-deadline, partial-success, safe-message, and route coverage passed `7` files / `43` tests. Existing staff authentication, selected active-parish membership, same-parish request ownership, stored-recipient authority, staff-reviewed subject/body, provider idempotency, communication API scope, and safe partial-success guidance remain authoritative.

The complete `15`-check release contract passed in `351` seconds with zero secret findings across `2,884` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `855` test files / `3,673` tests, and the credential-free Next.js 16.2.10 `56`-page build. The post-documentation source-bound suite passed `8` files / `49` tests, and the post-documentation secret scan passed across `2,885` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `A7692192F181492657C8B55D1495AD7DAF2002EC9DC80ABB0D798E7C88277F99`
- Source file count: `1500`
- Tracked source files: `1496`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit an external send.

See `docs/STAFF_EMAIL_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Request Detail Pastoral Details Confirmation Slice

The 2026-07-20 Request Detail reliability slice brings Funeral and Wedding pastoral-detail saves into the same finite 60-second request-type confirmation boundary as the nine schedule operations. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes every reviewed Funeral, Wedding, and schedule field until staff refresh and review. Explicit server rejections remain retryable, local values are retained until positive acknowledgement plus refresh, and no write is replayed automatically.

- Primary implementation commit: `d2b42ea76e726198e5296671e2e7cfc8d7da3a12`
- Immutable source-bound head: `45be97633a6d8f17cba2f08c0064a7cd0f086b38`
- Tracked-head aggregate SHA-256: `9E70D7FB2CA8E5F8D9F1C907B0D045DD0A5EF1923A9F152F00ABCF136E55C1E7`
- Source mode: `tracked-head`
- Source file count: `1494`
- Tracked source files: `1494`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused pastoral-detail, schedule-confirmation, persistence-order, safe-message, and active-parish route coverage passed `12` files / `46` tests before immutable source binding. Existing staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, safe audit behavior, and server-owned mutation routes remain authoritative.

The first complete release-contract attempt failed closed because this manifest still held the preceding aggregate and one source guard depended on an accidental leading space before the suggested-date handler. The source guard was corrected without changing runtime behavior and both current source identities were rebound before restarting the complete release contract.

The corrected complete `15`-check release contract passed in `362` seconds with zero secret findings across `2,881` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `854` test files / `3,668` tests, and the credential-free Next.js 16.2.10 `56`-page build. The final source-bound suite passed `13` files / `52` tests, and the post-documentation secret scan passed across `2,882` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `FDC0F4FB8FE90EC794C9C1B00EE2CE3C4D082B3B5DD14CB1E3A212594D50B830`
- Source file count: `1498`
- Tracked source files: `1494`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a sensitive runtime capability.

See `docs/REQUEST_DETAIL_PASTORAL_DETAILS_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Request Detail Schedule Confirmation Slice

The 2026-07-20 Request Detail reliability slice gives suggested-date and confirmed Baptism, Funeral, Wedding, and OCIA schedule writes one shared 60-second confirmation boundary. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes every reviewed schedule control until staff refresh and review. Explicit server rejections remain retryable, confirmed clear actions retain their displayed value until acknowledgement and refresh both succeed, and no write is replayed automatically.

- Immutable source-bound head: `883a41a956bf90450f0359d06460c72ffab43a99`
- Primary implementation commit: `995143bddf40d82b75f71e589858c35e4c1f0345`
- Tracked-head aggregate SHA-256: `2842200303DAF7DBB29FB9320966831196714B9E2F748FBB919C8BBECB2DC5B7`
- Source mode: `tracked-head`
- Source file count: `1493`
- Tracked source files: `1493`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused schedule-confirmation, persistence-order, safe-message, core-workflow, and active-parish route coverage passed `10` files / `36` tests before immutable source binding. Existing staff authentication, selected active-parish membership, same-parish request ownership, schedule validation, checked persistence, safe audit behavior, and server-owned mutation routes remain authoritative.

The first complete release-contract attempt failed closed because an older notes/communication source test included the newly inserted schedule helper in its handler slice. After the test boundary was corrected without changing runtime behavior and the final source identities were rebound, the complete `15`-check release contract passed in `361.7` seconds with zero secret findings across `2,879` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `853` test files / `3,664` tests, and the credential-free Next.js 16.2.10 `56`-page build. The final source-bound suite passed `12` files / `47` tests, and the post-documentation secret scan passed across `2,880` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `A424D9E552A6A8AC3905C1E3AC0996D15A125D36AF9C63CAE8A04CF4DE5FEFD3`
- Source file count: `1497`
- Tracked source files: `1493`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a sensitive runtime capability.

See `docs/REQUEST_DETAIL_SCHEDULE_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Request Detail Notes And Communication Confirmation Slice

The 2026-07-20 Request Detail reliability slice gives shared staff-notes and manual communication-log writes the shared 60-second confirmation boundary. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes the reviewed controls until staff refresh and review. Explicit server rejections remain retryable, the known partial-success communication path is protected from duplicate retry, and neither write is replayed automatically.

- Immutable implementation commit: `b16b7b49eb1e7ac711df70362289dbbbcb31464e`
- Tracked-head aggregate SHA-256: `F9C01CC3D009969FBFD29E35327A32EAE0776A2A6471A0D6DEB2F83E64CDDB8C`
- Source mode: `tracked-head`
- Source file count: `1492`
- Tracked source files: `1492`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused notes, communication, safe-message, core-workflow, and ownership/follow-up coverage passed `6` files / `27` tests before immutable source binding. Existing staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, safe audit behavior, and partial-success guidance remain authoritative.

The first complete release-contract attempt failed closed because this manifest still held the preceding aggregate. After both current source identities were bound, the isolated complete `15`-check release contract passed in `375.1` seconds with zero secret findings across `2,877` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `852` test files / `3,658` tests, and the credential-free Next.js 16.2.10 `56`-page build. The final source-bound suite passed `7` files / `33` tests, and the post-documentation secret scan passed across `2,878` text files with zero findings.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `C71B00AA30751E758135D8EB3C0C926F05BD0EC279C555623712AC3849DB9B43`
- Source file count: `1496`
- Tracked source files: `1492`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a sensitive runtime capability.

## Post-Release Request Detail Ownership And Follow-Up Confirmation Slice

The 2026-07-20 Request Detail reliability slice gives assignment, waiting-on, follow-up date, and care-cadence shortcut writes the shared 60-second confirmation boundary. Transport uncertainty or failed post-save refresh freezes the related Request Detail workflow controls until staff refresh and review; explicit Server Action rejections remain retryable and no write is replayed automatically. The request loader now returns a positive refresh result so callers cannot mistake a displayed load failure for refreshed data.

- Immutable implementation commit: `e6f184b45104b2e23936bd37e07bb28c7b20b282`
- Tracked-head aggregate SHA-256: `2F18FF4EB0EAC4A4648A4728F89D3567E6325C878F2B332F161DEAA48EA1CE02`
- Source mode: `tracked-head`
- Source file count: `1491`
- Tracked source files: `1491`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused confirmation-helper, ownership/follow-up, single-flight, safe-message, and core-workflow coverage passed `8` files / `44` tests before immutable source binding. Existing staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, and safe audit behavior remain authoritative.

The source-bound suite passed `9` files / `50` tests. The isolated complete `15`-check release contract passed in `339.1` seconds with zero secret findings across `2,875` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `851` test files / `3,653` tests, and the credential-free Next.js 16.2.10 `56`-page build.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `71D7650EA8DE278383ADF48F89EE179EA0079B3D1B4D438C5A20C1A001C9906B`
- Source file count: `1495`
- Tracked source files: `1491`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a sensitive runtime capability.

## Post-Release Request Detail Core Workflow Confirmation Slice

The 2026-07-20 Request Detail reliability slice gives checklist, request-status, and workflow-step browser writes a 60-second confirmation deadline. An unconfirmed result freezes those workflow controls, including Mark complete, until staff refresh and review; explicit server rejections remain retryable and no write is replayed automatically.

- Immutable implementation commit: `e87e6b863f0cbc7c1f5b19bacce442993fd5010b`
- Tracked-head aggregate SHA-256: `8F6585E9FC44F8601F22EABBFA2387F9CA6977DFD31A1981CF8CF39061569F84`
- Source mode: `tracked-head`
- Source file count: `1487`
- Tracked source files: `1487`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused confirmation, single-flight, safe-message, active-parish route, and Server Action coverage passed `7` files / `34` tests before immutable source binding. Existing staff authentication, selected active-parish membership, same-parish request ownership, validation, checked persistence, and safe audit behavior remain authoritative.

The source-bound suite passed `8` files / `40` tests. The isolated complete `15`-check release contract passed in `393` seconds with zero secret findings across `2,870` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `849` test files / `3,644` tests, and the credential-free Next.js 16.2.10 `56`-page build.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `FE0F845CC72DE8C71CF8DFC6B3C811A48AC6323AB34725307ECB1C635FE22AC9`
- Source file count: `1491`
- Tracked source files: `1487`
- Untracked source files: `4`
- Worktree dirty: `YES`

This manifest records reviewed source identity and does not replace an immutable Git commit, authorize production, or permit a sensitive runtime capability.

## Post-Release Daily Work Hub Mutation Confirmation Slice

The 2026-07-20 Daily Work Hub reliability slice gives mark-as-contacted and care-touchpoint browser writes a 60-second confirmation deadline. An unconfirmed result freezes related mutation controls until staff refresh and review; a sequential batch stops at the first uncertain item and never replays automatically.

- Immutable implementation commit: `eba0ef498e77da53d4e4000b12323da76c7b47e8`
- Tracked-head aggregate SHA-256: `4BF1F9F0A69FE8E3100D1EBB9546124EDD94FEDB3FAF5AB0B4426E438E6D68B5`
- Source mode: `tracked-head`
- Source file count: `1486`
- Tracked source files: `1486`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused confirmation, single-flight, safe-message, request-route, and email-boundary coverage passed `6` files / `39` tests before immutable source binding. The source-bound suite then passed `7` files / `45` tests. The isolated complete `15`-check release contract passed in `366` seconds with zero secret findings across `2,869` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `848` test files / `3,638` tests, and the credential-free Next.js 16.2.10 `56`-page build. Existing staff authentication, active-parish membership, same-parish ownership, checked persistence, partial-success guidance, safe audit metadata, and provider behavior remain authoritative.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `6D84C96D1386AA0954C3E04B84D99F12E93D3825739E74038C91D8977EA0B719`
- Source file count: `1490`
- Tracked source files: `1486`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/DAILY_WORK_HUB_MUTATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Public Intake Client Confirmation Slice

The 2026-07-20 public-intake reliability slice gives Baptism, Wedding, Funeral, OCIA, and Join Parish submissions a 60-second browser confirmation deadline and freezes every reviewed field while unresolved. An uncertain result retains the unchanged-payload opaque attempt and gives duplicate-aware retry guidance instead of leaving an indefinite spinner.

- Immutable implementation commit: `602caf91024fe98af52ddd6769ab2da9a0a98d92`
- Tracked-head aggregate SHA-256: `BED359B9A0E8F1489654E7CF428FA317D1041D6119B45B8B30C2D53C72D28E5C`
- Source mode: `tracked-head`
- Source file count: `1485`
- Tracked source files: `1485`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused confirmation, frozen-form, retry-identity, safe-message, persistence, recovery, and native-form coverage passed `8` files / `39` tests before immutable source binding. The source-bound suite then passed `9` files / `45` tests. The isolated complete `15`-check release contract passed in `327.1` seconds with zero secret findings across `2,867` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `847` test files / `3,633` tests, and the credential-free Next.js 16.2.10 `56`-page build. Existing attempt identity, exact recovery agreement, durable rate limiting, bounded parsing, routing gates, checked persistence/cleanup, and post-success notification boundary remain authoritative.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `76C88EEA8E5BC582D495FB99805C44368B1E63AA467BADE707BF1549B30D1F3E`
- Source file count: `1489`
- Tracked source files: `1485`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/PUBLIC_INTAKE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Intake Queue Client Confirmation Slice

The 2026-07-20 Intake reliability slice gives staff-reviewed Request and Mass Intention quick-triage commands a 60-second browser confirmation deadline. Transport uncertainty freezes all Intake mutation controls until staff refresh and review the item; obsolete work is aborted on unmount and never auto-replayed.

- Immutable implementation commit: `821c17db941bfdf7232ffeb6cd492876e58fe64c`
- Tracked-head aggregate SHA-256: `EC98887E46E0973173B69C3CEF8DFBB540CB330406E39582227A1E7E8AC9D7C4`
- Source mode: `tracked-head`
- Source file count: `1485`
- Tracked source files: `1485`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused client confirmation, shared single-flight, safe-message, and active-parish route coverage passed `6` files / `28` tests before immutable source binding. The source-bound suite then passed `7` files / `34` tests. The isolated complete `15`-check release contract passed in `379.9` seconds with zero secret findings across `2,866` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `847` test files / `3,628` tests, and the credential-free Next.js 16.2.10 `56`-page build. Existing staff authentication, active-parish membership, same-parish ownership, validation, checked persistence, partial-success guidance, and safe audit metadata remain authoritative.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `0370B81A819CFA5E0386B7E6F905520FB0EF7BA77FD785E1265C1548ADEC44CD`
- Source file count: `1489`
- Tracked source files: `1485`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/INTAKE_QUEUE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Demo Request Client Confirmation Slice

The 2026-07-20 public conversion reliability slice gives Schedule Demo a 20-second browser confirmation deadline, freezes the reviewed payload while unresolved, and distinguishes an unconfirmed result from an ordinary failure. Same-payload retries retain the existing opaque provider-idempotent delivery attempt; unmount cancellation remains quiet.

- Immutable implementation commit: `3f34153d99bcb90fe659fd08fadc4753aa034e18`
- Tracked-head aggregate SHA-256: `44988A2FE5E122391718249761BACAF6784FBEBF8F0CC22D0832E87553F19587`
- Source mode: `tracked-head`
- Source file count: `1484`
- Tracked source files: `1484`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused client deadline, accessibility, native-form, safe-message, same-origin, route-error, and provider-delivery coverage passed `8` files / `32` tests before immutable source binding. The source-bound suite then passed `9` files / `38` tests. The isolated complete `15`-check release contract passed in `350.8` seconds with zero secret findings across `2,864` text files (`500` binaries skipped), zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `846` test files / `3,623` tests, and the credential-free Next.js 16.2.10 `56`-page build. The server's durable limit, bounded parsing, validation, 12-second provider deadline, idempotency key, and provider acknowledgement requirement remain unchanged.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `4D1042588E532392B6B97011D35F287D75E2DCD4CFEFD11E205134A9E7CD35E2`
- Source file count: `1488`
- Tracked source files: `1484`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/DEMO_REQUEST_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Parish Settings Read Deadline Slice

The 2026-07-20 Settings reliability slice gives parish configuration, Staff Access, recent audit activity, public-intake routing metadata, and Workflow Templates a 15-second browser deadline. Selected-parish replacement still invalidates and aborts obsolete generations quietly, while a current stall reaches existing safe error guidance.

- Immutable implementation commit: `0f0af9cdd663b84e02d375e663ec70ae7f40223d`
- Tracked-head aggregate SHA-256: `096F00926A4F42AB5F3EF2DF757ED8EA22A7053465EB1D6EDC0044C99CBB8910`
- Source mode: `tracked-head`
- Source file count: `1483`
- Tracked source files: `1483`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, latest-generation, response-parser, safe-message, selected-parish, and Workflow Template coverage passed `8` files / `33` tests. The complete `15`-check local release contract passed in an isolated flag-disabled verification process in `350.1` seconds with zero secret findings across `2,862` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `845` test files / `3,617` tests, and the credential-free Next.js 16.2.10 `56`-page build. The bounded surfaces remain credentialed reads against existing staff-authenticated, active-parish-scoped APIs.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `4130E30BC2CFBE4C2AB2B7586B09E17300C567C1FA6FBCFFF9D953BE63DF5C13`
- Source file count: `1487`
- Tracked source files: `1483`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/PARISH_SETTINGS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Mass Intention Priest Directory Read Slice

The 2026-07-20 Mass Intention reliability slice restores configured priest suggestions on New and Edit forms by consuming the validated nested `parish.priest_names` response instead of the nonexistent response-root field. Both optional directory reads now have a 15-second deadline, while free-text entry and existing persistence behavior remain available.

- Immutable implementation commit: `be04005d922cb3d2a0876b366104ee85a1f3d447`
- Tracked-head aggregate SHA-256: `C4B203E92F3A083BCC6D3E98719A0A5484C0A6AA86D1BB557CD3FDDB01882010`
- Source mode: `tracked-head`
- Source file count: `1482`
- Tracked source files: `1482`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused parser, option-merge, deadline, active-parish detail scope, form persistence, and single-flight coverage passed `7` files / `34` tests. The first complete release run correctly stopped at its environment gate because this process inherited enabled non-production AI-summary QA residue. An isolated child process removed those variable names without changing saved values, then the complete `15`-check local release contract passed in `388.3` seconds with zero secret findings across `2,860` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `844` test files / `3,612` tests, and the credential-free Next.js 16.2.10 `56`-page build. The clients remain read-only and use only the existing staff-authenticated, active-parish-scoped settings API.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `82A976BF1997E1875909B3FB1C63379067CB0DA061E399D8491D6776611DC27B`
- Source file count: `1486`
- Tracked source files: `1482`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/MASS_INTENTION_PRIEST_DIRECTORY_CLIENT_READ_BOUNDARY_20260720.md`.

## Post-Release Request Relationship Read Deadline Slice

The 2026-07-20 Request Detail reliability slice gives both People-directory and suggested-connection reads a 15-second deadline. Obsolete request reads remain silently cancelled, while a timeout on the current request now reaches the existing unavailable guidance instead of being mistaken for navigation cancellation.

- Immutable implementation commit: `6515b931bcc5ec1ee0bb0da6b3483b56788aff57`
- Tracked-head aggregate SHA-256: `D7DE9F4F31FEE2C8393DDDACA5F073A86AD37C30A07AB38B000335BD2FB8121A`
- Source mode: `tracked-head`
- Source file count: `1481`
- Tracked source files: `1481`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, fail-closed, selected-parish, and safe-link coverage passed `6` files / `21` tests. The complete `15`-check local release contract passed in `358.8` seconds with zero secret findings across `2,858` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `843` test files / `3,607` tests, and the credential-free Next.js 16.2.10 `56`-page build. The clients remain read-only and use only the existing staff-authenticated, active-parish/request-scoped API.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `D100D98B7E69C7FB7DAEF48B12F0FC6534F90085A5C0405FB1228F7967A7CB57`
- Source file count: `1485`
- Tracked source files: `1481`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/REQUEST_RELATIONSHIP_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Reports Read Deadline Slice

The 2026-07-20 analytics reliability slice gives each current selected-parish Reports summary read a 15-second browser deadline. Selected-parish replacement still cancels old work quietly, and a stalled current read now reaches the existing unavailable-report state.

- Immutable implementation commit: `1e7d0851965d33dff15a1615d0b59f94dc9e85c8`
- Tracked-head aggregate SHA-256: `BF64664A9F75860CC2C25122E8B7137040DAED3BBA204E8D7A52549FE45E1B7B`
- Source mode: `tracked-head`
- Source file count: `1480`
- Tracked source files: `1480`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, cancellation, selected-parish, route, and loader coverage passed `5` files / `19` tests. The complete `15`-check local release contract passed in `321.9` seconds with zero secret findings across `2,856` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `842` test files / `3,603` tests, and the credential-free Next.js 16.2.10 `56`-page build. Reports remain read-only and use only the existing staff-authenticated, active-parish-scoped API.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `97015390255C602E06F63E491D983C97C4AC6B6629D98E41D6B95EE61CDE5DDA`
- Source file count: `1484`
- Tracked source files: `1480`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/REPORTS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Global Search Read Deadline Slice

The 2026-07-20 staff-search reliability slice keeps the existing 300-millisecond debounce and adds a separate 15-second deadline to each current compact Global Search read. Replaced queries remain silently cancelled; a stalled current query now reaches the existing safe unavailable state.

- Immutable implementation commit: `95e3991c0f4b291af5dfb06370ceb3daed59ef6c`
- Tracked-head aggregate SHA-256: `8DE4BB9673747C4FBD7836109A0B2787047B879201BB08FFA57D5F8E1B234B87`
- Source mode: `tracked-head`
- Source file count: `1479`
- Tracked source files: `1479`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, cancellation, safe-message, selected-parish, and safe-link coverage passed `5` files / `20` tests. The complete `15`-check local release contract passed in `339.2` seconds with zero secret findings across `2,854` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `841` test files / `3,599` tests, and the credential-free Next.js 16.2.10 `56`-page build. Search remains read-only and uses only the existing staff-authenticated, active-parish-scoped API.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `5EA05231B305C144013826153BF3DF859B75B555DD5CE40D0C16C0A65028859B`
- Source file count: `1483`
- Tracked source files: `1479`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/GLOBAL_SEARCH_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Notifications Center Read Deadline Slice

The 2026-07-20 daily-operations reliability slice gives each Notifications Center read a 15-second browser deadline. Replacement and selected-parish remount still cancel old work, latest-request ownership still controls settlement, and a stalled current read now reaches the existing safe retry state.

- Immutable implementation commit: `835e7004d982d6137ffa7f0c4ce82f4dc5924d67`
- Tracked-head aggregate SHA-256: `76390841AFD500F790D4A0246BF063D5705F0C951F016F51CF462735B84209B9`
- Source mode: `tracked-head`
- Source file count: `1478`
- Tracked source files: `1478`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused deadline, latest-response, safe-message, selected-parish, and safe-link coverage passed `5` files / `19` tests. The complete `15`-check local release contract passed in `384.2` seconds with zero secret findings across `2,852` text files (`500` binaries skipped), zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `840` test files / `3,595` tests, and the credential-free Next.js 16.2.10 `56`-page build. The client remains read-only and uses only the existing staff-authenticated, active-parish-scoped API.

The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `C448F63A0ED14BCB3E4A7ACF63E4611772B79EDADACCAB5247F50DEDB65A0C77`
- Source file count: `1482`
- Tracked source files: `1478`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/NOTIFICATIONS_CENTER_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Audit Log Read Deadline Slice

The 2026-07-20 governance reliability slice makes Audit Log reads abortable, latest-owned, and finite. Replacement, filter change, and unmount cancel old reads; a stalled current read reaches the existing curated retry state after 15 seconds. The surface remains authenticated, parish-admin-only, selected-parish scoped, and read-only.

- Immutable implementation commit: `0c1b5341ed7df10772f564e79f53a1689cd20348`
- Tracked-head aggregate SHA-256: `7FAF507FAAAA75BC8292643FB87A50092BB08B65BE28028DBBCDCD8AC5D7338F`
- Source mode: `tracked-head`
- Source file count: `1477`
- Tracked source files: `1477`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused coverage passed `5` files / `18` tests. The complete `15`-check local release contract passed in `382.1` seconds with zero secret findings across `2,850` text files, zero dependency vulnerabilities, all governance/evidence gates, both TypeScript scopes, lint, `839` test files / `3,592` tests, and the credential-free `56`-page Next.js build. The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `512EA46B01BB94D60BF639DC7D3E68E2FB40D36ADE7EF4178F4954A020AC65B4`
- Source file count: `1481`
- Tracked source files: `1477`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/AUDIT_LOG_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

## Post-Release Staff Auth Confirmation Deadline Slice

The 2026-07-20 staff-auth reliability slice bounds browser confirmation waits for password sign-in and current-browser sign-out without changing provider, session, authorization, or navigation policy. Timeout is treated as uncertain: there is no automatic replay or assumed success, and staff receive refresh-before-retry guidance.

- Immutable implementation commit: `d73c08f9ed9ed730696271824bd60aebf9e2c8f5`
- Tracked-head aggregate SHA-256: `054AAF1150A12148E3BC886A87E574B9E88432CCAD585764A8FEACDC995FB19B`
- Source mode: `tracked-head`
- Source file count: `1476`
- Tracked source files: `1476`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused coverage passed `5` files / `23` tests. The first complete release run failed closed on a missing canonical count label in this evidence section; after restoring that standard label, the complete local `15`-check release contract passed in `387.4` seconds with zero secret findings across `2,848` text files, zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `838` test files / `3,589` tests, and the credential-free Next.js 16 `56`-page build. The shared workspace normal mode remains separate because it includes four unrelated user-owned untracked scripts:

- Working-tree aggregate SHA-256: `EE1EFAC641BAD65E35186173CD695EE11B52D8EC6B38EA9D944518FAE42F5057`
- Source file count: `1480`
- Tracked source files: `1476`
- Untracked source files: `4`
- Worktree dirty: `YES`

See `docs/STAFF_AUTH_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

## Tracked-Head Manifest Tooling

The 2026-07-20 release-integrity slice adds `npm run check:release-source-manifest:head`, which hashes release-source blobs directly from exact committed `HEAD` through a bounded Git batch operation. It rejects unknown modes and malformed, incomplete, non-blob, or extra batch output. It excludes untracked workspace source without copying the repository or creating a temporary worktree, and it continues to print no paths, source contents, environment values, or secrets.

- Immutable implementation commit: `a30b47762eb4ad01ff2710004921227134a767a5`
- Tracked-head aggregate SHA-256: `B3BBE5B194CF01E4A1D1662F40B5508E4BACFEE2DDE60316241BE69810C5B71E`
- Source mode: `tracked-head`
- Source file count: `1474`
- Tracked source files: `1474`
- Untracked source files: `0`
- Production approval granted: `NO`

Focused coverage passed `1` file / `6` tests. The complete local `15`-check release contract passed in `357.2` seconds with zero secret findings across `2,845` text files, zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `837` test files / `3,582` tests, and the credential-free Next.js 16 `56`-page build. In the same shared workspace, normal working-tree mode reports aggregate `06D2801786330310DA5CF247F31BD3FD25D79D4DDC867436ADB7AA217D7F3104` across `1478` source files, including four unrelated user-owned untracked scripts. The two identities intentionally differ. See `docs/RELEASE_SOURCE_TRACKED_HEAD_MANIFEST_BOUNDARY_20260720.md`.

## Post-Release Request Document Content Safety Slice

The 2026-07-20 request-document safety slice restricts new staff and family uploads to signature-matched PDF/JPEG/PNG content and requests attachment-only staff signed access. Its immutable commit and clean-checkout release-source aggregate are recorded after the complete local release gate. This additive branch work does not rewrite the merged release identity below and does not authorize production, storage access, migrations, operational RLS changes, or sensitive feature gates.

- Parent/base commit: `3033d6588d0a1f724555e84757c51d25d46d114c`
- Immutable implementation commit: `39d239838bafbeca34ec90afc9a8ef82016327f8`
- Release-source aggregate SHA-256: `BE71462D763C8026548286A756616F9287F94BF2FA1CECA5EA981ADCD9EF437C`
- Source file count: `1474`
- Tracked source files: `1474`
- Untracked source files: `0`
- Worktree dirty in clean verification checkout: `NO`
- Production approval granted: `NO`

Focused coverage passed `10` files / `59` tests. The complete local `15`-check release contract passed in `342.1` seconds with zero secret findings across `2,844` text files, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, `837` test files / `3,580` tests, and the credential-free Next.js 16 `56`-page build. The clean aggregate does not replace the immutable Git commit; together they identify this additive branch slice without authorizing production or any separately locked capability.

Before the tracked-head tooling was committed, the same dirty shared workspace produced transient development aggregate `F3A062610108A48B1F1ED0B68A5BBB6D504AD857CE60C8F872AD9C37A8191F92` because four unrelated user-owned, untracked scripts remained inside the broad release-source allowlist.

- Source file count: `1478`
- Tracked source files: `1474`
- Untracked source files: `4`
- Worktree dirty: `YES`

That dirty-worktree identity is retained for deterministic local validation only and does not replace the immutable Git commit or the clean-checkout aggregate above.

## Manifest Identity

- Parent/base commit before this Preview health origin-alignment slice: `9899f8e7fc6fed898e13a73f0beb522dcacd848b`
- Immutable implementation commit: `19b601df046de06a6a52f214e24adcdeba05b577`
- Release-source aggregate SHA-256: `965D52668D4803437C25F22980FD1D741C612607D370AFF7896AD565D5EEADCA`
- Source file count: `1468`
- Tracked or staged source files: `1468`
- Untracked source files: `0`
- Worktree dirty: `YES`
- Production approval granted: `NO`

## Post-Merge Checkpoint Identity

The merged release identity above remains the authoritative record for `f134b598308ddd78b5b6b81ee447bf5b1fb15937`. The later documentation-only controlled-rollout checkpoint adds one source-allowlisted validation test, so it has a separate aggregate rather than rewriting the merged release record:

- Checkpoint commit: `19a7ee598a1bc5201dcb71a49827da87e1110c1b`
- Release-source aggregate SHA-256: `C42FE6E07B427E55D26B4B6F735CF63112F0C8234DD3409B83AFAD343BF82CDD`
- Source file count: `1469`
- Tracked source files: `1469`
- Untracked source files: `0`
- Production approval granted: `NO`

This checkpoint aggregate identifies the post-merge documentation guard branch only. It does not authorize promotion of the merged release or alter the rollback state recorded in `docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md`.

## Post-Rollback Human Intake Gate Identity

The controlled-rollout human intake gate adds one source-allowlisted checker and one focused source-allowlisted test. A clean temporary checkout of its immutable implementation commit produced this separate aggregate:

- Intake implementation commit: `aa502b5760ce0666ba9ce527e9259c2240fa7c7a`
- Release-source aggregate SHA-256: `35437CD5A8B1E8AA9428C77FF126A63D3C72E288AFAF423FCCC762EC07F8E402`
- Source file count: `1471`
- Tracked source files: `1471`
- Untracked source files: `0`
- Worktree dirty in clean verification checkout: `NO`
- Production approval granted: `NO`

The intake checker's initial result was `NO_GO_MISSING_HUMAN_INPUT`. This aggregate identifies the committed intake validation source only; it does not treat unrelated user-owned workspace files as release source and does not authorize production promotion or smoke.

The final physical-dependency, LF-preserving clean-checkout verification at docs-binding commit `d60c3a8e` passed all 15 local release checks: zero secret findings, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, 834 test files / 3,554 tests, and the credential-free 56-page build. The final decision was `LOCAL_RELEASE_READINESS_PASSED`; production approval remained `NO`.

## Confirmed Intake And Prepared Approval Prompt Identity

After the product owner confirmed all non-secret intake labels and scope confirmations, a clean LF-preserving checkout of the immutable approval-readiness commit produced this release-source identity:

- Approval-readiness implementation commit: `bdc3fdd157d413a44b26026b3bbcc376e6f53753`
- Release-source aggregate SHA-256: `BAD7E2F3E348BF6835FBC8CF9C51F94D5E70B58789621253B3C53F55861499C0`
- Source file count: `1472`
- Tracked source files: `1472`
- Untracked source files: `0`
- Worktree dirty in clean verification checkout: `NO`
- Intake decision: `READY_FOR_EXPLICIT_APPROVAL`
- Production approval granted: `NO`

This aggregate adds the focused final-approval-prompt validation source and binds the confirmed intake state. The approval prompt remains a prepared document only; it does not authorize deployment, production access, smoke, migrations, flags, or any separately locked capability.

The first complete release-gate attempt failed closed at the test stage because two checkpoint assertions still expected the pre-intake wording. After the assertions were updated to require `READY_FOR_EXPLICIT_APPROVAL` while preserving explicit production `NO-GO`, focused coverage passed `3` files / `12` tests. The corrected docs-binding commit `af3aef78` then passed all `15` local release checks in an LF-preserving clean checkout: zero secret findings across `2,101` files, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, `835` test files / `3,558` tests, and the credential-free `56`-page build. Final decision: `LOCAL_RELEASE_READINESS_PASSED`; production approval remained `NO`.

## Repository Artifact Boundary Development Identity

The 2026-07-20 repository-artifact hardening slice has a separate dirty-worktree development identity. It does not replace any immutable release record above:

- Parent/base commit: `c70487a0030ad0924fc1602370090e39065fd6d3`
- Implementation commit: `f3a7747f0dcddda8362e00f1e27a573694933d8b`
- Release-source aggregate SHA-256: `BDF5CD4F1326CBFA86B6FCDC32B7AE0E4FE7A1A6CD3C7B7267756F3B65BB31DC`
- Source file count: `1477`
- Tracked source files: `1473`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

This identity binds the current release-source allowlist while unrelated local generated/private artifacts remain excluded by the repository boundary. Both the secret scanner and source manifest now use an explicit 64 MiB Git-output buffer so large dirty worktrees fail only at a meaningful integrity boundary, not Node's default output limit. The current identity also includes the focused AI/operator-context consistency guard. The complete local 15-check release contract passed before these adjacent safeguards; focused manifest, secret-scan, and context checks passed afterward. Implementation commit `f3a7747f0dcddda8362e00f1e27a573694933d8b` makes the code/test boundary immutable; this follow-up record still does not substitute for clean-checkout remote CI, Preview, or separate production approval.

## Membership-Primary Request Access Development Identity

The 2026-07-20 membership-primary request and document access hardening has this development identity:

- Parent/base commit: `41607f5cae6bc8fe4b1476c7b1f849649bf0cc98`
- Implementation commit: `ae00ccec89b24a30862dbb84c5b41c1fd6a4da8d`
- Source-guard commit: `3d76cc7c26828294f844e903a8b04fcddddc6f90`
- Release-source aggregate SHA-256: `E0EB5EDADC41F36767557B9BDEDD3C88EDB6B0A1D2D12D8AB6731836637291DE`
- Source file count: `1477`
- Tracked source files: `1473`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

This identity binds the membership-first cookie-free fallback behavior and focused source/unit guards. It changes no migration or RLS policy and performs no external action. The complete 15-check local release contract passed against the runtime implementation in 329.1 seconds with 836 test files / 3,566 tests and the credential-free 56-page build. The current aggregate adds only the route call-site source guard, which passed 1 file / 5 tests after that release run. Implementation commit `ae00ccec89b24a30862dbb84c5b41c1fd6a4da8d` makes the runtime behavior immutable; source-guard commit `3d76cc7c26828294f844e903a8b04fcddddc6f90` reached non-production Vercel `READY`. Authenticated Preview health, GitHub PR checks, and production approval remain separate gates.

## Dependency And Database Security P0 Identity

The 2026-08-07 dependency and database-security P0 implementation has this
immutable local identity:

- Implementation commit: `eea043f68d29858761d29895313d88b8c417c281`
- Release-source aggregate SHA-256: `B85D37B53E29CA26CD2E780AEDD0750486A44084AFB0236128336F41204F5151`
- Tracked source file count: `1529`
- Untracked source files: `0`
- Production approval granted: `NO`

This identity binds Next.js `16.3.0`, the clean dependency baseline, the guarded
disposable function-privilege validator, and the still-unapproved hash-pinned
shared-QA promotion runner. The corrected disposable validation passed with exact
anonymous, authenticated, and service-role privilege surfaces plus transaction
rollback. Shared-QA history repair and privilege application were not run. The
first complete release-contract attempt failed closed on stale enabled local AI
QA flags; the clean-child-process retry reached the test stage and correctly
rejected this evidence file until the new aggregate was recorded. After the
docs-only binding commit `6a4d0da3`, the complete clean-child-process contract
passed all `15` checks: zero secret findings across `2,939` text files, zero
dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint,
`878` test files / `3,768` tests, and the credential-free `56`-page build.
Exact-head
publication, CI, Preview, shared-QA writes, and every production-sensitive gate
remain separate.

## Scope

The aggregate covers the current Git-tracked and non-ignored untracked release source under:

- `.github/workflows/`
- `app/`
- `lib/`
- `public/`
- `scripts/`
- `supabase/`
- reviewed root configuration and lock files, including `package.json`, `package-lock.json`, `proxy.ts`, Next.js, TypeScript, ESLint, PostCSS, and Vitest configuration.

Environment files, ignored secrets, documentation, command output, file paths, and file contents are not printed by the manifest result. Each included file contributes its normalized repository path, byte length, and content SHA-256 to the aggregate without exposing those details in output.

## Verification

- Command: `npm run check:release-source-manifest`
- Expected decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY`
- Determinism test: two consecutive runs must return the same JSON.
- Privacy test: no file paths, contents, environment files, or secret values may be printed.
- Production boundary: the manifest never approves production.

## Limitation

This gives reviewers a tamper-evident identity for the exact release source surface, but the aggregate alone does not replace an immutable Git commit. Commit `19b601df046de06a6a52f214e24adcdeba05b577` on `codex/release-candidate-20260711` is the immutable Preview health origin-alignment implementation binding for this aggregate. The focused health/origin/security slice passed `5` files / `61` tests plus typecheck. The complete 15-check local release gate then passed in `304.9` seconds with zero secret findings across `2,142` files, zero vulnerabilities, both TypeScript scopes, lint, `832` test files / `3,546` tests, and the credential-free `56`-page build. GitHub Actions run `29207351611` passed clean-checkout CI against evidence head `d3daf3faa6ea3fc2f3d5de27dfb9e577cf3c6044`. Exact-head Preview deployment `dpl_DCLZ9b1vthZmGfvKZUKQLnwLYZP2` reached `READY`; runtime evidence recorded `GET /api/health 200`, and the authenticated read-only staff smoke passed. Human PR review remains pending. Before any production deployment, the manifest and release-readiness runner must pass again against the exact approved deployment commit. Excluded non-release artifacts may remain outside the commit and do not authorize production.

No production access, deployment, migration, operational RLS change, record mutation, provider call, export, AI call, storage action, signed URL, communication, certificate generation, or public claim was performed.
