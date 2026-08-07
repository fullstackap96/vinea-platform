# Vinea Platform Single Source of Truth

Current verified status (2026-08-07): use
[`VINEA_CURRENT_STATUS_20260807.md`](VINEA_CURRENT_STATUS_20260807.md) for the
concise release identity, evidence-backed readiness estimate, P0 register, and
launch decision. It supersedes older completion percentages in this document.
The enduring product principles and production gates below remain authoritative.

Current engineering boundary (2026-07-20): commit `91d39c2080cddc145acae1b2ada822291c746cfe` closes the unbounded browser-read gap in the non-production Export Audit Reviewer dashboard. One 15-second abortable API read is current at a time; replacement, saved-filter change, and unmount invalidate unresolved work; response-body settlement observes cancellation; and existing latest-load ownership plus generic staff-safe errors remain authoritative. The dashboard remains staff-authenticated through its API, selected-parish scoped through the API, read-only, API-only, non-production gated, and absent from production navigation. Aggregate `713C54768F43D49AC3ADB0BF78F5AC15DD849F958014C2897078ACC83B383C3A` binds `1,521` committed release-source files. Focused coverage passed `5` files / `28` tests; the complete 15-check contract passed with zero secret findings, zero vulnerabilities, every safety/evidence gate, both TypeScript scopes, lint, `872` files / `3,735` tests, and the credential-free `56`-page build. Production dashboard exposure, exports, and monitoring remain `NO-GO`; no production-sensitive action occurred.

Current engineering boundary (2026-07-20): commit `ca03a7cbdbfa5042006d0d482b335f6c1a018412` closes a selected-parish reliability gap in Request Detail's optional staff/priest assignment directory read. The browser clears prior-parish choices, owns one 15-second request-parish load, validates the full settings projection and returned parish id through the shared strict parser, and aborts obsolete settlement. Existing staff authentication, active-parish membership, same-parish request access, assignment writes, migrations, RLS, and production gates remain authoritative. Aggregate `F9383B3D44A0ABD00DBBADCACAB1C2E4FDD3FDC6C04A4AC09274B8A3D8CB8FB6` binds `1,520` committed release-source files. Focused and existing regression coverage passed `19` files / `89` tests; the complete 15-check contract passed with zero secret findings, zero vulnerabilities, every safety/evidence gate, both TypeScript scopes, lint, `871` files / `3,731` tests, and the credential-free `56`-page build. No production-sensitive action occurred; safe two-parish browser evidence and remote exact-head verification remain pending.

Current engineering boundary (2026-07-20): commit `0392f5110a3cdc4ff0040ebcbcd50db9751eaa52` closes a selected-parish race in the Daily Work Hub's auxiliary workflow SLA settings read. The client resets to safe defaults on every parish change, owns one 15-second bounded load, accepts rules only from a positive response whose parish id matches the expected selected parish, and invalidates replacement or unmount settlement. Existing authentication, active-parish settings-route authorization, Work Hub request loading, workflow rules, migrations, and RLS remain authoritative. Aggregate `B06BC97423E5C68DC1E0949CF6750906EEBD27CE4274BFE99706180084A68886` binds `1,519` committed release-source files. The complete 15-check contract passed with zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `870` files / `3,727` tests, and the credential-free `56`-page build. No production-sensitive action occurred; safe two-parish browser evidence and remote exact-head verification remain pending.

Current engineering boundary (2026-07-20): exact-head GitHub Actions run `29791367802` failed one release source-manifest evidence assertion after `3,722` tests passed because local working-tree counts included four unrelated untracked scripts while clean checkout did not. Commit `9e15d6b2ba1788c39fc7bf8cf8bd82f0265cfccd` changes the assertion to validate the immutable tracked-head manifest. Aggregate `1AA7EC5167D88A91314CA3D2CF029C2CAB9111BD241FB599587A8F4B7AC7CEC7` binds `1,518` tracked release-source files. Focused coverage passed `1` file / `6` tests, and the complete `15`-check release contract passed with zero secret findings across `2,917` text files, zero vulnerabilities, all evidence/gate checks, both TypeScript scopes, lint, `869` files / `3,723` tests, and the credential-free `56`-page build. The application runtime is unchanged. Separate exact-head publication approval, clean-checkout CI, and non-production Preview verification remain pending, and the failed CI run is not represented as passing evidence.

Current engineering boundary (2026-07-20): commit `8544263fd91691e6234d4111e71a703180c7fbdb` closes the Request Documents acknowledgement-recovery gap. Upload, review, and family-link creation remain behind one synchronous lock; timeout, transport uncertainty, malformed `2xx` acknowledgement, or failed authoritative same-request reload freezes every document write until refresh and review. Explicit rejection remains retryable, confirmed link material survives clipboard failure, and no mutation replays automatically. Existing authentication, active-parish membership, request ownership, validation, private-storage rules, compensation cleanup, portal-token behavior, migrations, and RLS remain authoritative. Aggregate `F7C1111468121579492A38F46D317997755AF0F13B06802226F2303F0C934007` binds `1,518` committed release-source files. The complete 15-check contract passed with `869` files / `3,723` tests and the credential-free `56`-page build. No storage, token, document, or production-sensitive action occurred; live non-production and rollout evidence remain pending.

Current engineering boundary (2026-07-20): commit `b85ea09123fe4abc9d6cf45b999d455f38352bcb` closes the staff-reviewed Baptism certificate browser-confirmation gap. The POST settles after 60 seconds, synchronous single flight blocks duplicate dispatch, explicit server rejection remains retryable, and timeout, transport uncertainty, malformed PDF acknowledgement, or an empty PDF freezes another attempt until staff refresh and review certificate activity. No generation request replays automatically. Existing same-origin enforcement, authentication, active-parish membership, same-parish record ownership, Baptism-only scope, PDF rendering, and checked `certificate_generated` event insertion remain authoritative. Aggregate `BCE10A325BC6A9E48BBF8B324DFA691A5EA9C1F122189B2B630C48F6ADDDF60D` binds `1,518` committed release-source files. The complete 15-check contract passed with `869` files / `3,721` tests and the credential-free `56`-page build. No certificate or production-sensitive action occurred; live non-production and rollout evidence remain pending.

Current engineering boundary (2026-07-20): commit `1b916e4ede7252ecf322f9400fd794086fbd6f5c` closes the selected-parish Onboarding completion browser-confirmation gap. The completion PATCH settles after 60 seconds and reports success only after a valid acknowledgement plus an authoritative same-parish reload with `onboarding_completed_at`. Timeout, transport uncertainty, malformed acknowledgement, wrong-parish data, or failed confirmation freezes another attempt until staff refresh and review; no write replays automatically. Existing authentication, active-parish membership, readiness rules, persistence, audits, migrations, and RLS remain authoritative. Aggregate `7C585EA51C38C96591719C7D90C977C0C607D6C80104ADBE6583F469E00F76A3` binds `1,516` committed release-source files. The complete 15-check contract passed with `868` files / `3,717` tests and the credential-free `56`-page build. No production-sensitive action occurred; live non-production and rollout evidence remain pending.

Current engineering boundary (2026-07-20): commit `fe0c75fbe6cdb674153282babf74f6e7573407a3` closes the staff-initiated Daily Brief browser-confirmation gap. The selected-parish send settles after 30 seconds, requires a positive provider message identifier before reporting success, suppresses stale parish results, and gives inbox-first guidance after uncertainty. A deliberate same-parish retry reuses the existing opaque delivery attempt, and no retry happens automatically. Existing staff authentication, active-parish membership, recipient selection, provider idempotency, 12-second provider deadline, checked state recording, safe messages, migrations, and RLS remain authoritative. Aggregate `0AC717E566E754D32D5DC0C8779DA67661A00B1203179FEBCF390849EF396B72` binds `1,513` committed release-source files. The complete 15-check contract passed with `866` files / `3,710` tests and the credential-free `56`-page build. No email or production-sensitive action occurred; live rollout evidence remains pending.

Current engineering boundary (2026-07-20): commit `f0b7d6201657785cfe731527e09dd6a7ce698d79` closes the selected-parish Public Intake Routing Settings browser-confirmation gap. Metadata, domain, DNS verification, and token mutations settle after 60 seconds, capture active-parish generation, distinguish confirmed server rejection from ambiguous acknowledgement, validate operation-specific DTOs, and require an authoritative scoped reload before success. Ambiguity freezes the complete management surface until refresh; acknowledged one-time token material remains available long enough for staff to secure it; parish changes clear prior-parish material; and no mutation replays automatically. Existing runtime routing gates, staff authentication, active-parish administrator authorization, token hashing, safe messages, audits, migrations, and RLS remain authoritative. Aggregate `9610711F2CA49207F321D827B95719F6E859C7A318289DA9B1FE9430600DA92D` binds `1,510` committed release-source files. The complete 15-check contract passed with `864` files / `3,704` tests and the credential-free `56`-page build. No production-sensitive action occurred; live rollout evidence remains pending.

Current engineering boundary (2026-07-20): commit `405c7b28f7a229602b036b9f9641ada6f5e71d44` closes the selected-parish Workflow Template browser-confirmation gap. Saves settle after 60 seconds, capture active-parish generation, distinguish confirmed server rejection from ambiguous acknowledgement, validate the saved-step DTO, and require an authoritative scoped reload before success. Ambiguity freezes the editor until refresh, and no save replays automatically. Existing staff authentication, active-parish membership, administrator authorization, persistence, safe messages, audits, migrations, and RLS remain authoritative. Aggregate `B165A167D3D5343F8C61E18B592ABB779965D0C99A3729AEA672AE7ED90E56FE` binds `1,507` committed release-source files. The complete 15-check contract passed with `862` files / `3,698` tests and the credential-free `56`-page build. No production-sensitive action occurred; live rollout evidence remains pending.

Current engineering boundary (2026-07-20): commit `9c0912ebdf3d7299b9d7c8c126e23ff61a9d232d` closes the parish-details and Staff Access browser-confirmation gap. Writes settle after 60 seconds, capture selected-parish generation, distinguish confirmed server rejection from ambiguous acknowledgement, and require an authoritative scoped reload before success. Ambiguity freezes related controls until refresh, and no write replays automatically. Existing staff authentication, active-parish membership, administrator authorization, final-admin protection, safe messages, audits, public-intake routing behavior, Daily Brief provider behavior, migrations, and RLS remain authoritative. Aggregate `600289C1E5C6C64E09B77243D756A01CFCC9DE1064724A7B55BE20CB22F6EBDE` binds `1,504` committed release-source files. The complete 15-check contract passed with `860` files / `3,692` tests and the credential-free `56`-page build. No production-sensitive action occurred; live rollout evidence remains pending.

Current engineering boundary (2026-07-20): commit `eb6a622db9e74eb0bd72dc8f05f01220f791186e` closes the AI summary/reply browser-confirmation gap in Request Detail and Daily Work Hub. Generation settles after 40 seconds over the existing 30-second provider deadline; persistence settles after 60 seconds. Synchronous locks, strict non-empty structured responses, refresh-before-retry after ambiguity, and batch stop-on-unknown behavior prevent duplicate or placeholder saves without changing provider behavior. Existing authentication, active-parish membership, same-parish request ownership, AI safety gates, staff review, source/audit scaffolds, and production-disabled boundaries remain authoritative. Aggregate `B6FA677F41018079FA23CE91DBD63025494B8D88DC46ED4722813A67F4312B7B` binds `1,501` committed release-source files. The complete 15-check contract passed with `858` files / `3,685` tests and the credential-free `56`-page build. No AI provider or production-sensitive action occurred; live rollout evidence remains pending.

Current engineering boundary (2026-07-20): commit `10888255f20611dabc051aae0f9cd15750dd22ad` closes the Request Detail Google Calendar browser-confirmation gap. Create, update, delete, and conflict-override create settle after 25 seconds; ambiguity or a failure after provider mutation starts forces refresh-before-retry and disables all Calendar mutation controls. Existing authentication, active-parish membership, same-parish request ownership, selected-parish integration, deterministic create identity/recovery, 15-second provider deadlines, safe OAuth wording, request linkage, and audit rules are unchanged. Aggregate `35E2C1DE34877B5186F7BD45CCED994C150AD93C87EFBD995A0B928F4D4B37B6` binds `1,498` committed release-source files. The complete 15-check contract passed with `856` files / `3,677` tests and the credential-free `56`-page build. No Google provider or production-sensitive action occurred, and live rollout evidence remains pending.

Latest verified staff-email client confirmation boundary: immutable implementation commit `f7de8a6eeb320737987f6aa0332a0176fa535215` bounds Request Detail and Daily Work Hub email-route confirmation at 20 seconds and post-send communication logging at 60 seconds. Uncertain delivery retains the exact staff-reviewed provider-idempotent attempt; after positive delivery confirmation, uncertain logging freezes related controls until refresh/review and cannot trigger another delivery. Focused coverage passed `7` files / `43` tests and the complete release contract passed all `15` checks in `351` seconds with zero secret findings across `2,884` text files, zero vulnerabilities, both TypeScript scopes, lint, `855` test files / `3,673` tests, and the credential-free `56`-page build. Tracked-head aggregate `3253FED2D2F7113513EAC1E28D465D19E153FDCF1ABD8A63055BC071917D850E` binds `1,496` committed release-source files. Authentication, active-parish request ownership, stored-recipient authority, staff-reviewed content, provider idempotency, and scoped communication logging remain authoritative. See `docs/STAFF_EMAIL_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Request Detail pastoral-detail confirmation boundary: primary implementation commit `d2b42ea76e726198e5296671e2e7cfc8d7da3a12` and source-bound head `45be97633a6d8f17cba2f08c0064a7cd0f086b38` give Funeral and Wedding detail saves the shared finite confirmation contract used by all request-type schedule writes. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes every reviewed Funeral, Wedding, and schedule field until staff refresh and review; explicit server rejections remain retryable, entered values remain visible, and no write is replayed. The final source-bound suite passed `13` files / `52` tests and the corrected complete release contract passed all `15` checks in `362` seconds with zero secret findings across `2,881` text files, zero vulnerabilities, both TypeScript scopes, lint, `854` test files / `3,668` tests, and the credential-free `56`-page build. Tracked-head aggregate `9E70D7FB2CA8E5F8D9F1C907B0D045DD0A5EF1923A9F152F00ABCF136E55C1E7` binds `1,494` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, safe audits, and server-owned request routes remain authoritative. See `docs/REQUEST_DETAIL_PASTORAL_DETAILS_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Request Detail schedule confirmation boundary: primary implementation commit `995143bddf40d82b75f71e589858c35e4c1f0345` and source-bound head `883a41a956bf90450f0359d06460c72ffab43a99` give suggested-date and confirmed Baptism, Funeral, Wedding, and OCIA writes the shared 60-second confirmation contract. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes every reviewed schedule control until staff refresh and review; explicit server rejections remain retryable, confirmed clear state changes wait for acknowledgement plus refresh, and no write is replayed. Focused coverage passed `11` files / `41` tests. After one fail-closed stale source-test correction, the complete release contract passed all `15` checks in `361.7` seconds with zero secret findings across `2,879` text files, zero vulnerabilities, both TypeScript scopes, lint, `853` test files / `3,664` tests, and the credential-free `56`-page build. Tracked-head aggregate `2842200303DAF7DBB29FB9320966831196714B9E2F748FBB919C8BBECB2DC5B7` binds `1,493` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, safe audits, and server-owned schedule routes remain authoritative. See `docs/REQUEST_DETAIL_SCHEDULE_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Request Detail notes/communication confirmation boundary: immutable implementation commit `b16b7b49eb1e7ac711df70362289dbbbcb31464e` gives shared staff-notes and manual communication-log writes the shared 60-second confirmation contract. Transport uncertainty, malformed success acknowledgement, or failed post-save refresh freezes the reviewed controls until staff refresh and review; explicit server rejections remain retryable, the known partial-success communication path is duplicate-protected, and neither write is replayed. Focused coverage passed `6` files / `27` tests. After the manifest guard correctly rejected its preceding aggregate and current identities were bound, the isolated complete release contract passed all `15` checks in `375.1` seconds with zero secret findings across `2,877` text files, zero vulnerabilities, both TypeScript scopes, lint, `852` test files / `3,658` tests, and the credential-free `56`-page build. Tracked-head aggregate `F9C01CC3D009969FBFD29E35327A32EAE0776A2A6471A0D6DEB2F83E64CDDB8C` binds `1,492` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, safe audits, and partial-success guidance remain authoritative. See `docs/REQUEST_DETAIL_NOTES_COMMUNICATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Request Detail ownership/follow-up confirmation boundary: immutable implementation commit `e6f184b45104b2e23936bd37e07bb28c7b20b282` gives assignment, waiting-on, follow-up date, and care-cadence shortcut writes the shared 60-second confirmation contract and gives post-save callers an explicit request-refresh result. Transport uncertainty or refresh failure freezes related workflow controls until staff refresh and review; explicit Server Action rejections remain retryable and no write is replayed. Focused coverage passed `8` files / `44` tests, the source-bound suite passed `9` files / `50` tests, and the isolated complete release contract passed all `15` checks in `339.1` seconds with zero secret findings across `2,875` text files, zero vulnerabilities, both TypeScript scopes, lint, `851` test files / `3,653` tests, and the credential-free `56`-page build. Tracked-head aggregate `2F18FF4EB0EAC4A4648A4728F89D3567E6325C878F2B332F161DEAA48EA1CE02` binds `1,491` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, safe audits, and existing Server Action behavior remain authoritative. See `docs/REQUEST_DETAIL_OWNERSHIP_FOLLOW_UP_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Request Detail core-workflow confirmation boundary: immutable implementation commit `e87e6b863f0cbc7c1f5b19bacce442993fd5010b` gives checklist, request-status, and workflow-step browser writes a 60-second confirmation deadline. Transport uncertainty, malformed checklist success, or failed post-save refresh freezes those controls, including Mark complete, until staff refresh and review; explicit server rejections remain retryable and no write is replayed. Focused coverage passed `7` files / `34` tests, the source-bound suite passed `8` files / `40` tests, and the isolated complete release contract passed all `15` checks in `393` seconds with zero secret findings across `2,870` text files, zero vulnerabilities, both TypeScript scopes, lint, `849` test files / `3,644` tests, and the credential-free `56`-page build. Tracked-head aggregate `8F6585E9FC44F8601F22EABBFA2387F9CA6977DFD31A1981CF8CF39061569F84` binds `1,487` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, safe audits, and existing API/Server Action behavior remain authoritative. See `docs/REQUEST_DETAIL_CORE_WORKFLOW_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Daily Work Hub write-confirmation boundary: immutable implementation commit `eba0ef498e77da53d4e4000b12323da76c7b47e8` gives mark-as-contacted and care-touchpoint browser writes a 60-second confirmation deadline. Transport uncertainty or malformed success acknowledgement freezes related Work Hub controls until staff refresh and review; batch marking stops at the first unknown result and never replays automatically. Focused coverage passed `6` files / `39` tests, the source-bound suite passed `7` files / `45` tests, and the isolated complete release contract passed all `15` checks in `366` seconds with zero secret findings across `2,869` text files, zero vulnerabilities, both TypeScript scopes, lint, `848` test files / `3,638` tests, and the credential-free `56`-page build. Tracked-head aggregate `4BF1F9F0A69FE8E3100D1EBB9546124EDD94FEDB3FAF5AB0B4426E438E6D68B5` binds `1,486` committed release-source files. Authentication, active-parish membership, request ownership, validation, checked persistence, partial-success guidance, safe audits, and existing provider behavior remain authoritative. See `docs/DAILY_WORK_HUB_MUTATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified public Intake confirmation boundary: immutable implementation commit `602caf91024fe98af52ddd6769ab2da9a0a98d92` gives all five family-facing submission forms a 60-second confirmation deadline, freezes the reviewed payload while unresolved, and preserves one opaque attempt for an unchanged retry. Focused coverage passed `8` files / `39` tests, the source-bound suite passed `9` files / `45` tests, and the isolated complete `15`-check release contract passed in `327.1` seconds with zero secret findings across `2,867` text files, zero vulnerabilities, both TypeScript scopes, lint, `847` test files / `3,633` tests, and the credential-free `56`-page build. Tracked-head aggregate `BED359B9A0E8F1489654E7CF428FA317D1041D6119B45B8B30C2D53C72D28E5C` binds `1,485` committed source files. Durable rate limiting, bounded input, runtime routing gates, exact completed-audit recovery, checked persistence/cleanup, privacy-safe messages, and notification-after-success remain authoritative. See `docs/PUBLIC_INTAKE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Parish Intake client boundary: immutable implementation commit `821c17db941bfdf7232ffeb6cd492876e58fe64c` gives Request and Mass Intention quick-triage commands a 60-second confirmation deadline, aborts obsolete work on unmount, and requires refresh/review after any uncertain result. Focused coverage passed `6` files / `28` tests, the source-bound suite passed `7` files / `34` tests, and the isolated complete `15`-check release contract passed in `379.9` seconds with zero secret findings across `2,866` text files, zero vulnerabilities, both TypeScript scopes, lint, `847` test files / `3,628` tests, and the credential-free `56`-page build. Tracked-head aggregate `EC98887E46E0973173B69C3CEF8DFBB540CB330406E39582227A1E7E8AC9D7C4` binds `1,485` committed source files. Authentication, selected active-parish membership, same-parish ownership, validation, checked persistence, partial-success guidance, safe audits, and API-only browser writes remain authoritative. See `docs/INTAKE_QUEUE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified public Demo Request client boundary: immutable implementation commit `3f34153d99bcb90fe659fd08fadc4753aa034e18` gives the browser confirmation path a 20-second deadline, freezes reviewed fields while unresolved, suppresses unmount settlement, and preserves one delivery attempt for an unchanged retry. Focused coverage passed `8` files / `32` tests, the source-bound suite passed `9` files / `38` tests, and the isolated complete `15`-check release contract passed in `350.8` seconds with zero secret findings across `2,864` text files, zero vulnerabilities, both TypeScript scopes, lint, `846` test files / `3,623` tests, and the credential-free `56`-page build. Tracked-head aggregate `44988A2FE5E122391718249761BACAF6784FBEBF8F0CC22D0832E87553F19587` binds `1,484` committed source files. Same-origin rejection, durable rate limiting, bounded input, safe errors, provider idempotency, provider timeout, and positive acknowledgement remain authoritative. See `docs/DEMO_REQUEST_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified selected-parish Settings read boundary: immutable implementation commit `0f0af9cdd663b84e02d375e663ec70ae7f40223d` gives the five current configuration/admin reads 15-second deadlines. Latest-generation ownership preserves quiet cancellation for parish replacement, refresh, and unmount; only a timeout on the still-current generation reaches existing curated error guidance. Focused coverage passed `8` files / `33` tests; the isolated complete release contract passed all `15` checks in `350.1` seconds with zero secret findings across `2,862` text files, zero vulnerabilities, both TypeScript scopes, lint, `845` test files / `3,617` tests, and the credential-free `56`-page build. Tracked-head aggregate `096F00926A4F42AB5F3EF2DF757ED8EA22A7053465EB1D6EDC0044C99CBB8910` binds `1,483` committed source files. Authentication, active-parish membership, response-parish agreement, validated read models, staff-reviewed mutations, and production gates remain authoritative. See `docs/PARISH_SETTINGS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Mass Intention priest-directory boundary: immutable implementation commit `be04005d922cb3d2a0876b366104ee85a1f3d447` corrects the New/Edit clients to validate the actual settings response and consume nested `parish.priest_names`. Both optional reads have 15-second deadlines, obsolete work is aborted, free-text entry remains available after failure, and Edit preserves the current assigned priest. Focused coverage passed `7` files / `34` tests; after one fail-closed environment-residue stop, the isolated complete release contract passed all `15` checks in `388.3` seconds with zero secret findings across `2,860` text files, zero vulnerabilities, both TypeScript scopes, lint, `844` test files / `3,612` tests, and the credential-free `56`-page build. Tracked-head aggregate `C4B203E92F3A083BCC6D3E98719A0A5484C0A6AA86D1BB557CD3FDDB01882010` binds `1,482` committed source files. Staff authentication, active-parish settings scope, validated read models, and staff-reviewed create/update behavior remain authoritative. See `docs/MASS_INTENTION_PRIEST_DIRECTORY_CLIENT_READ_BOUNDARY_20260720.md`.

Latest verified Request Detail relationship-read boundary: immutable implementation commit `6515b931bcc5ec1ee0bb0da6b3483b56788aff57` gives People-directory and suggested-connection reads a 15-second deadline. Request replacement remains quietly cancellable; a timeout on the current request reaches existing unavailable guidance rather than being suppressed as stale cancellation. Focused coverage passed `6` files / `21` tests; the complete release contract passed all `15` checks in `358.8` seconds with zero secret findings across `2,858` text files, zero vulnerabilities, both TypeScript scopes, lint, `843` test files / `3,607` tests, and the credential-free `56`-page build. Tracked-head aggregate `D7DE9F4F31FEE2C8393DDDACA5F073A86AD37C30A07AB38B000335BD2FB8121A` binds `1,481` committed source files. Authentication, active-parish membership, same-parish request ownership, GET-only lookup behavior, safe links, and staff-reviewed link/create actions remain authoritative. See `docs/REQUEST_RELATIONSHIP_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Reports client-read boundary: immutable implementation commit `1e7d0851965d33dff15a1615d0b59f94dc9e85c8` gives the current selected-parish summary read a 15-second deadline while retaining replacement cancellation, the explicit active-parish header, shared response parsing, arithmetic invariants, partial-results guidance, and curated unavailable state. Focused coverage passed `5` files / `19` tests; the complete release contract passed all `15` checks in `321.9` seconds with zero secret findings across `2,856` text files, zero vulnerabilities, both TypeScript scopes, lint, `842` test files / `3,603` tests, and the credential-free `56`-page build. Tracked-head aggregate `BF64664A9F75860CC2C25122E8B7137040DAED3BBA204E8D7A52549FE45E1B7B` binds `1,480` committed source files. Authentication, active-parish membership scope, GET-only behavior, and production gates remain authoritative. See `docs/REPORTS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified compact Global Search client-read boundary: immutable implementation commit `95e3991c0f4b291af5dfb06370ceb3daed59ef6c` retains the existing typing debounce and gives the current network read a separate 15-second deadline. Query replacement and unmount cancel old work; a current stall settles through the curated unavailable state. Focused coverage passed `5` files / `20` tests; the complete release contract passed all `15` checks in `339.2` seconds with zero secret findings across `2,854` text files, zero vulnerabilities, both TypeScript scopes, lint, `841` test files / `3,599` tests, and the credential-free `56`-page build. Tracked-head aggregate `8DE4BB9673747C4FBD7836109A0B2787047B879201BB08FFA57D5F8E1B234B87` binds `1,479` committed source files. Authentication, active-parish server scope, response/query agreement, GET-only behavior, and production gates remain authoritative. See `docs/GLOBAL_SEARCH_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Notifications Center client-read boundary: immutable implementation commit `835e7004d982d6137ffa7f0c4ce82f4dc5924d67` assigns the current read a 15-second deadline while retaining abortable replacement, selected-parish remount cancellation, sequence ownership, safe response parsing, safe links, and curated staff errors. Focused coverage passed `5` files / `19` tests; the complete release contract passed all `15` checks in `384.2` seconds with zero secret findings across `2,852` text files, zero vulnerabilities, both TypeScript scopes, lint, `840` test files / `3,595` tests, and the credential-free `56`-page build. Tracked-head aggregate `76390841AFD500F790D4A0246BF063D5705F0C951F016F51CF462735B84209B9` binds `1,478` committed source files. Authentication, active-parish membership scope, GET-only behavior, and production gates remain authoritative. See `docs/NOTIFICATIONS_CENTER_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified Audit Log client-read boundary: immutable implementation commit `0c1b5341ed7df10772f564e79f53a1689cd20348` assigns each governance read one sequence owner, abort controller, and 15-second deadline. Replacement, filter change, and unmount cancel old work; a current stall settles through the curated retryable error state. Focused coverage passed `5` files / `18` tests; the complete release contract passed all `15` checks in `382.1` seconds with zero secret findings across `2,850` text files, zero vulnerabilities, both TypeScript scopes, lint, `839` test files / `3,592` tests, and the credential-free `56`-page build. Tracked-head aggregate `7FAF507FAAAA75BC8292643FB87A50092BB08B65BE28028DBBCDCD8AC5D7338F` binds `1,477` committed source files. Staff authentication, parish-admin authorization, active-parish membership scope, safe projection, GET-only behavior, and production gates remain authoritative. See `docs/AUDIT_LOG_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest verified staff-auth client confirmation boundary: immutable implementation commit `d73c08f9ed9ed730696271824bd60aebf9e2c8f5` wraps password sign-in and local-scope sign-out in a shared finite browser confirmation deadline. Uncertain timeout does not redirect, replay, or claim success; it releases the same-page lock and uses curated refresh-before-retry guidance. Confirmed results preserve the existing sanitized dashboard destination and post-sign-out `/login` refresh. Focused coverage passed `5` files / `23` tests; after one fail-closed evidence-label correction, the complete release contract passed with zero secret findings across `2,848` text files, zero vulnerabilities, both TypeScript scopes, lint, `838` test files / `3,589` tests, and the credential-free `56`-page build. Tracked-head aggregate `054AAF1150A12148E3BC886A87E574B9E88432CCAD585764A8FEACDC995FB19B` binds `1,476` committed source files. Staff authorization, Supabase policy, MFA, migrations, RLS, providers, and production gates are unchanged. See `docs/STAFF_AUTH_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest verified release-source identity boundary: immutable implementation commit `a30b47762eb4ad01ff2710004921227134a767a5` adds `sourceMode: tracked-head`, reading exact committed blobs through bounded `git cat-file --batch` and excluding untracked workspace source. Unknown modes and malformed, missing, truncated, non-blob, or extra batch output fail closed. Aggregate `B3BBE5B194CF01E4A1D1662F40B5508E4BACFEE2DDE60316241BE69810C5B71E` binds `1,474` committed release-source files with zero untracked files and `productionApproved: false`; focused coverage passed `1` file / `6` tests and the complete `15`-check release contract passed with zero secret findings across `2,845` text files, zero vulnerabilities, both TypeScript scopes, lint, `837` test files / `3,582` tests, and the credential-free `56`-page build. This evidence tool authorizes no production or sensitive capability. See `docs/RELEASE_SOURCE_TRACKED_HEAD_MANIFEST_BOUNDARY_20260720.md`.

Latest verified request-document content boundary: implementation commit `39d239838bafbeca34ec90afc9a8ef82016327f8` makes new staff and family uploads accept only PDF, JPEG, and PNG after server-side extension, declared-MIME, and leading-signature agreement. The confirmed canonical MIME type is written to private storage, picker hints match the server policy, and staff signed access requests a sanitized attachment download. Existing authorization, family token/step checks, durable rate limiting, size limit, cleanup, and privacy-safe logging remain authoritative. Focused coverage passed `10` files / `59` tests; the complete `15`-check local release contract passed in `342.1` seconds with zero secret findings across `2,844` text files, zero vulnerabilities, both TypeScript scopes, lint, `837` test files / `3,580` tests, and the credential-free `56`-page build. Clean-checkout aggregate `BE71462D763C8026548286A756616F9287F94BF2FA1CECA5EA981ADCD9EF437C` binds `1,474` tracked source files. This is not antivirus scanning and does not retroactively validate existing objects. Production rollout and all production-sensitive gates remain separate and closed; see `docs/REQUEST_DOCUMENT_CONTENT_SAFETY_BOUNDARY_20260720.md`.

Latest verified membership-primary request access hardening: implementation commit `ae00ccec89b24a30862dbb84c5b41c1fd6a4da8d` makes cookie-free staff request detail and document access resolve the authenticated staff membership context first and use that staff member's authorized primary parish. Membership-resolution errors fail closed; the explicit global oldest-parish compatibility path remains only when no staff client is available. Request-to-parish ownership checks remain unchanged. Focused coverage passed 5 files / 25 tests; the complete 15-check local release contract passed with zero secret findings across 2,842 text files, zero vulnerabilities, every evidence gate, both TypeScript scopes, lint, 836 test files / 3,566 tests, and the credential-free 56-page build. Source-guard commit `3d76cc7c26828294f844e903a8b04fcddddc6f90` reached non-production Vercel `READY`; authenticated Preview health remains pending behind Vercel Authentication and GitHub PR checks remain unavailable. No migration, RLS, production, provider, storage, signed URL, or record action occurred. See `docs/REQUEST_ACCESS_MEMBERSHIP_PRIMARY_FALLBACK_HARDENING_20260720.md`.

Latest verified repository-artifact boundary: implementation commit `f3a7747f0dcddda8362e00f1e27a573694933d8b` keeps root `.tmp/` as local generated scratch space and raw `docs/sales/VINEA_MAILBOX_SNAPSHOT_*.json` files as private local-only exports outside release-source and lint scope. The repository secret scanner keeps its strict JWT and credential rules while both scanner and release-source manifest allow a bounded 64 MiB Git-output list, correcting a reproduced `ENOBUFS` failure without globally suppressing signed-token shapes. The complete 15-check local release contract passed with zero findings across 2,840 text files, 500 binaries skipped, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, 835 test files / 3,559 tests, and the credential-free Next.js 16 56-page build. Follow-up manifest/scanner coverage passed 2 files / 8 tests; AI/operator-context coverage passed 2 files / 4 tests; development aggregate `BDF5CD4F1326CBFA86B6FCDC32B7AE0E4FE7A1A6CD3C7B7267756F3B65BB31DC` binds 1,477 release-source files. Inherited non-production AI QA flags were removed only from the release child process, with persistent settings unchanged. No private export was changed or committed and no production-sensitive action occurred. See `docs/REPOSITORY_RELEASE_ARTIFACT_BOUNDARY_20260720.md`.

Current rollout-input boundary (2026-07-14): `docs/CONTROLLED_PRODUCTION_ROLLOUT_HUMAN_INTAKE_20260714.md` is the authoritative source for confirmed base-rollout owner, channel, production-safe fixture, exact-window, and scope-confirmation labels. Its checker returns `READY_FOR_EXPLICIT_APPROVAL` with zero missing or invalid fields and cannot grant production approval. `docs/CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md` is the exact prepared prompt for a separate future decision and explicitly records `Production approval granted: NO`. Promotion, production access/smoke, migrations, flags, and every separately locked capability remain prohibited until that exact approval is intentionally supplied in a new product-owner instruction and the fixed control-plane identity is reverified.

Current release boundary (2026-07-12): release head `f134b598308ddd78b5b6b81ee447bf5b1fb15937` is merged to `main`, while production routing has been explicitly rolled back to prior production-served deployment `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW`. `docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md` governs the next base-application rollout decision. A merged commit, green CI, a ready Preview, or an already-built Vercel candidate does not authorize production promotion, production smoke, migrations, operational RLS, monitoring, exports, public-intake routing, AI, CSP, certificate/correction runtime, or public trust claims. Those actions still require their named owners, safe fixtures, exact window, smoke/rollback evidence, and explicit gate-specific approval.

Latest verified protected-Preview boundary: immutable implementation commit `19b601df046de06a6a52f214e24adcdeba05b577` aligned health with Vinea's existing trusted Vercel-origin policy, required exact HTTPS origins, and rejected malformed fallbacks. The complete 15-check local gate passed with zero security findings, both typecheck scopes, lint, `832` test files / `3,546` tests, and the credential-free `56`-page build. GitHub Actions run `29207351611` passed every clean-checkout step against evidence head `d3daf3faa6ea3fc2f3d5de27dfb9e577cf3c6044`. Exact-head Preview deployment `dpl_DCLZ9b1vthZmGfvKZUKQLnwLYZP2` reached `READY`; runtime evidence recorded `GET /api/health 200`, and authenticated active-parish, Onboarding, Imports, People duplicate review, Communications Center, and console smoke passed without writes. Human PR review remains required. No merge, production access, environment mutation, migration, record mutation, provider send, or production-sensitive approval occurred.

Latest verified Communications Center client boundary: immutable implementation commit `ca3488436906f5836e96ddabe4fb9e0ee14d328c` and aggregate `F9ED8FAC6AEAE72B94DD4F4CEDA513DED3A7C46D16EA353E7A020D33C73EA188` bind the reviewed source. Staff-reviewed touchpoint/follow-up writes settle after 60 seconds. An unconfirmed result freezes all Communications Center mutation controls until page refresh and request review; no automatic replay is introduced. The complete 15-check release gate passed with 832 files/3,544 tests and a credential-free 56-page build. Existing active-parish/request authorization, staff-entered data, safe messages, audits, migrations, and RLS remain authoritative. Live rollout evidence remains pending.

Latest verified duplicate-review client boundary: immutable implementation commit `ddf5ebfa8d626f9910fa8b17479ba2f1c55ce1ba` and aggregate `1DA7F37F606026BC8486F84484F9EC23B9B570B07E5677BBC30133B679EBDFD1` bind the reviewed source. People and Household duplicate candidate reads settle after 20 seconds and merge confirmation after 120 seconds. Any unconfirmed merge requires queue refresh before another attempt; no automatic replay is introduced. The complete 15-check release gate passed with 831 files/3,540 tests and a credential-free 56-page build. Existing staff confirmation, synchronous locks, active-parish authorization, checked persistence, compensation guidance, audits, migrations, and RLS remain authoritative. Live rollout evidence remains pending.

Latest verified onboarding readiness client boundary: immutable implementation commit `762ee031577c09f72fa90cc5ead57f9570916af3` and aggregate `C043395367C0CFD8D8C5146AC6F3F929D25BE9D5FE3FA2653C3BBF8C6C08F4B2` bind the reviewed source. The Daily Work Hub setup card and Onboarding page now settle stalled selected-parish settings/staff readiness reads after 15 seconds. Superseded loads remain silent, while a real timeout enters the existing safe retry state. The complete 15-check release gate passed with 830 files/3,534 tests and a credential-free 56-page build. Latest-response sequencing, active-parish authorization, readiness calculations, completion writes, migrations, and RLS remain authoritative. Live rollout evidence remains pending.

Latest verified staff data-import client boundary: immutable implementation commit `68694e7cb5aa71884fd1c16b45d92d699fe1921a` and aggregate `0CB1CAFF043A1D4D382B6AA9220D93824DB811F6864DBEA6D1536547F78514E8` bind the reviewed source. Recent-history refresh, preview, and reviewed commit confirmation now settle after 15, 30, and 120 seconds. An unconfirmed commit stays blocked until staff inspect Recent imports and the record list; no automatic retry is introduced. The complete 15-check release gate passed with 829 files/3,528 tests and a credential-free 56-page build. Existing single-flight locking, immutable review snapshot, active-parish server authorization, partial-success behavior, audits, migrations, and RLS remain authoritative. Live rollout evidence remains pending.

Latest verified family-document upload client boundary: immutable implementation commit `a4f66fbf64328113a43586a662169970569f38f6` and aggregate `D65A37DF88E420CF5516CD3C3F62585EC96739CF1B987FF529F97CAE1BDD3B18` bind the reviewed source. The family portal now locks synchronously before dispatch, freezes its reviewed step/file controls, performs the existing 10 MB check before multipart construction, and bounds the browser wait at 60 seconds. Lost confirmation produces duplicate-aware pastoral guidance rather than an indefinite spinner or casual retry. The complete 15-check release gate passed with 828 files/3,525 tests and a credential-free 56-page build. Server same-origin, durable rate limiting, token/step authorization, file validation, storage, cleanup, and audit behavior are unchanged; no automatic retry, durable idempotency, or live rollout claim is introduced.

Latest verified Request Document client-recovery boundary: immutable implementation commit `10f50151d7b4e5908b3497ef73977c58f2d4a448` and aggregate `5570BD979CC595BFFBE6837C021C29F69EC9E8EABA4F1A3942F0169535BD7695` bind the reviewed source. Staff document list reads are latest-request-wins, abort superseded work, accept only rows matching the open request, and remount when Request Detail changes. Browser deadlines now settle stalled list, signed-download preparation, upload, review, and family-link creation work. Unconfirmed writes use explicit confirm-before-retry guidance, and successful upload/review messages survive the scoped refresh. The complete 15-check release gate passed with 827 files/3,520 tests and a credential-free 56-page build. This changes no server authorization, storage, signed URL, token, audit, cleanup, migration, or RLS behavior and does not claim durable server idempotency or live rollout evidence.

Latest verified public-intake success-settlement boundary: immutable implementation commit `b3a20a892e3abd88e36b5ba989f339acb1ece35b` and aggregate `A5402654EC53812A0737A940514BD9A287D7F510819852CA7854984C9311E1D7` bind the reviewed source. Once `/api/intake` confirms the stored request, every public form settles family-facing success without awaiting the secondary staff notification. The shared browser helper defers the unchanged notification payload, contains sync/async failure, and aborts after 15 seconds. Server-side request/parish/contact verification, provider behavior, retry identity, safe logging, and completed request authority remain unchanged. The complete 15-check release gate passed with 826 files / 3,515 tests and a credential-free 56-page build. Best-effort notification loss cannot invalidate the stored request; this is not a durable job queue or transactional delivery claim, and live browser timing remains rollout-unverified.

Latest verified public-intake retry boundary: commit `ca7412d1d64b21841bac7018eae7054ea25311d4` and aggregate `B492D2C542EC7CBE53EA3A28A0BFCD1CE031AF505739579535BA99E763F95D32` bind the release-source implementation. One unchanged browser-reviewed payload owns an in-memory random UUID v4 request identity. Server recovery occurs only after parish scope resolution and requires exact request, parish, contact, and `public_intake.created` completion-audit agreement. A new intake cannot report success without that completion marker; partial leftovers and mismatches fail generically. Durable rate limiting, bounded parsing, workflow/detail/checklist confirmation, checked cleanup, routing gates, and privacy-safe errors remain authoritative. The complete 15-check local gate passed. This is same-page recovery, not cross-tab/concurrent idempotency or a transaction, and live non-production response-loss replay remains rollout-unverified.

Latest verified Google OAuth transport boundary: commit `21fb3d4a0d26b4881a9ab936793a032ca64633fa` gives Calendar OAuth clients a fresh 15-second transporter signal before refresh-token use, and the staff-authenticated callback applies bounded transport to authorization-code exchange plus optional profile lookup. Signed state, active-parish membership, callback redirect, refresh-token requirement, selected-parish persistence, and privacy-safe failure behavior remain authoritative. The complete release gate passed against aggregate `A8653C9DB5FCF3259B8F8A3E0031F59D41F8C2136D7BECAB13F547FBA0E65E5B`; no Google or production action occurred. Live transport behavior remains rollout-unverified.

Latest verified Google Calendar reliability boundary: commit `74dc786b1489f37d83082d68aa12bfdf75fae37f` makes create own one opaque deterministic Google-compatible event id only after staff authentication, active-parish membership, same-parish request ownership, and selected-parish integration checks. Conflict scanning ignores only that id, and ambiguous-create recovery requires exact id, summary, and time-window agreement before request linkage. Every Calendar list/insert/get/patch/delete call has a 15-second provider deadline. The complete 15-check local gate passed against aggregate `EEE8DAD194D70650341FD4643019DBF530AFA856E1DDA897D78DC69FD61124B3`; no provider or production action occurred. Live synthetic-provider recovery remains rollout-unverified and no production-sensitive approval is implied.

Latest verified request-notification provider boundary: commit `10dd6087e473d7137014114daa37522bfd0ec598` and aggregate `BB1E62201692E4A2505A49C8C598A2097B40DDBCA11213EBCB25C0E1652F0333` bind 1,445 release-source files. Post-intake staff notification now receives an opaque verified parish/request idempotency key and 12-second provider deadline after durable rate limiting and stored request verification. Timeout stays generic, provider acknowledgement remains mandatory, and saved intake success is unchanged. Focused tests, the complete 15-check local gate, GitHub Actions run `29183226227`, and matching non-production Vercel preview `dpl_G2crVJhDNzszskvU3mmN63JdrhfG` passed. No intake/email or production-sensitive action occurred.

Latest verified staff error-recovery boundary: commit `90ee398d2e141f56c033000adfc479bcdc35b15b` and aggregate `FBCC65B8C4F462BB547CA7A196692D7D7817325D3C96FF80D7A050C30F8A6433` bind 1,442 release-source files. Vinea's existing app/dashboard error hierarchy remains intact; its shared privacy-safe fallback now warns staff to verify an uncertain recent save or send before repeating it, uses shared controls, and returns dashboard users to the Daily Work Hub. Raw exceptions and digests remain undisclosed. Focused tests, the complete 15-check local release gate, GitHub Actions run `29182688833`, and matching non-production Vercel preview `dpl_B3SGHD8GMAF57ijBjUhzL3Ggtyq9` passed. No production-sensitive approval is implied.

Latest verified staff-email provider boundary: commit `1226c2307a8b9c9c3e5b4bb5d96e4a63a5cc542f` and aggregate `81CA2DBABFC9BCF11B7AAAC7865DE911E8D07163D8555F4CD1E827B84B48F4CB` bind 1,442 release-source files. Request-bound staff email requires a delivery-attempt UUID, derives an opaque Resend idempotency key, and owns a 12-second provider deadline. Exact unchanged content reuses the attempt; unconfirmed delivery receives no sent-email audit and warns against blind retry. Staff authentication, active-parish request ownership, stored-recipient derivation, provider acknowledgement, and communication logging remain authoritative. Focused tests, the corrected complete local release gate, GitHub Actions run `29182048877`, and matching non-production Vercel preview `dpl_9NzTgLYaRpdn4s3kek91pkb9t1CF` passed. No real email was sent and no production-sensitive approval is implied.

Latest verified staff-workspace recovery boundary: commit `cc2f1f89366f2cd40d51d2b1304a643094a269f4` and aggregate `4B7FC56DA9280E8BB1D95F9C0A96E9662413C72971A1FD4A898DCF388480E42A` bind 1,439 release-source files. Daily Work Hub and Request Detail browser loads have 15-second deadlines; initial stalls settle into safe retry guidance, silent dashboard refresh failures retain confirmed office data, and stale Request Detail cancellation remains quiet. Focused tests, the complete 15-check local release gate, GitHub Actions run `29181224162`, and matching non-production Vercel preview `dpl_EU22dttRps6PdEHNVKSKVVLqEFYU` passed. Active-parish authorization, mutations, providers, and production gates are unchanged. This does not authorize merge or production-sensitive capabilities.

Latest verified health-probe boundary: commit `1f8155f65885244bc511c0ac3692a340421c592c` and aggregate `C8B08F87AE5ED34D6B097F33B2F67F7ABBEC80D8C8349918081E17DB8CA9A709` bind 1,439 release-source files. Parish connectivity and every schema readiness query share one eight-second Supabase abort deadline, so an upstream stall returns an unhealthy response instead of waiting for platform termination. Production response redaction remains authoritative, no probe retries or mutations were added, and authorization/RLS behavior is unchanged. Focused tests, the complete 15-check local release gate, GitHub Actions run `29180435998`, and matching non-production Vercel preview `dpl_H9awFsMtrSZRouoepkUeo4ucjgJY` passed. This does not authorize merge or production-sensitive capabilities.

Latest verified local/CI parity boundary: commit `e6ec46541ea1eeb3a84a8530e97454147e2af28a` and source aggregate `B9511A0D7CA4E38ADC0D46171382448B8A10FC45E53FF846020667C621E92FD0` bind 1,439 release-source files. The one-command local gate now includes repository secret scanning, dependency security, and completed-evidence validation, for 15 local checks versus CI's 16 commands; CI alone performs the clean `npm ci`. After one intentional fail-closed stop exposed a stale test expectation, the corrected 15-check run passed in 299.9 seconds with zero secret findings, zero dependency vulnerabilities, all evidence gates, both TypeScript scopes, full lint, complete tests, and a credential-free Next.js build. GitHub Actions run `29179833235` passed against the exact commit, and matching non-production Vercel preview `dpl_HEPmAhSzomhL6c7iiHjXokgHCd26` is `READY`. No production-sensitive approval is implied.

Latest verified release-runner boundary: commit `037c5c964cb233ed6305dd3393cb9907d050286b` and source aggregate `4865365E244756008022788AD375698900390857D1138899A6F3132A2AF24A95` bind 1,439 release-source files. The final local build receives explicit empty values for every credential-bearing Supabase, OpenAI, Resend, Google OAuth, cron, and staff-allowlist key, so `.env.local` cannot mask an unsafe import-time dependency. The complete 12-command local gate passed in 301.5 seconds, including a credential-free 56-page Next.js 16.2.10 build and a 2,097-file secret scan with zero findings. GitHub Actions run `29178995424` then passed all 22 clean-checkout steps against the exact commit, and matching non-production Vercel preview `dpl_DocXHSgUah5T87sC5KmoCUz2tidL` is `READY`. No production-sensitive approval is implied.

Latest verified release commit boundary: `codex/release-candidate-20260711` at commit `495cb1dda70a039116927f89b818ffe0a195ee2a` contains the mechanically reviewed release scope plus remote-CI portability fixes. The initial scope staged 1,801 unique paths with zero missing/unexpected entries; 57 sales, CSV, generated, binary, temporary, and unrelated artifacts remain excluded. Follow-up guarded staging also passed exactly.

Latest verified release identity boundary: source aggregate `07E172B228A7E055038454DE785178C0FF42D218A1BF4F94D3A0B2F29E44083B` identifies 1,439 release-source files without printing paths, contents, environment files, or secrets. GitHub Actions run `29178125486` passed at the immutable commit: 809 test files/3,441 tests, both TypeScript scopes, all evidence gates, full lint, repository secret/dependency checks, and the credential-free Next.js 16.2.10 build.

Latest verified remote release boundary: matching Vercel preview deployment `dpl_CmCcXTYqyz8D55w3KgA2ZkwB6wbu` is `READY` with no production target. Protected `/api/health` still returns a Vercel SSO redirect, so authenticated preview health/staff smoke remains pending. This does not authorize merge, production deployment, production RLS, monitoring, exports, public-intake routing, customer-facing AI, public trust claims, or final cutover.

Latest production RLS decision boundary: engineering approves the hash-bound membership-aware forward/rollback SQL candidate for final human go/no-go, and QA accepts the completed disposable/shared-QA evidence while requiring production smoke. This does not replace product-owner or security/data-owner approval and does not authorize production access; named operators, safe fixtures, exact commit/window, monitoring/support, and the explicit approval phrase remain required.

Latest verified native form boundary: every real App Router `<form>` using a client `onSubmit` handler declares `method="post"`, so a pre-hydration native submission cannot default to GET and place entered fields in a URL. The staff-login submit control additionally remains disabled until hydration. A TypeScript-AST regression guard covers the complete App Router TSX tree; normal hydrated handlers and server authorization remain authoritative.

Latest verified dashboard proxy auth boundary: after Supabase Auth user verification and allowlist evaluation, database-backed staff authorization uses authenticated `current_staff_parish_ids()` and requires at least one active membership. `proxy.ts` contains no `primary_parish_id()`, service-role client, parish-table ordering, or raw identity logging. Missing membership and production lookup failure deny generically. Shared-QA-backed browser evidence confirms health, signed-out redirect, active staff admission, and authorized parish switching; production rollout remains gated pending named owners, immutable release-candidate binding, production-safe fixtures, and explicit approval.

Latest verified Workflow Template tenant boundary: the selected parish ID is carried into the editor and returned by the authorized GET route; only an exact ID match and validated template/step projection may render. Parish changes abort and invalidate old reads, clear old editable drafts, and prevent old-parish save responses from settling into the current editor. Server-side write ownership remains authoritative.

Latest verified Parish Settings transport boundary: only shared allowlisted read models may settle parish configuration, Google status, Staff Access, recent audit, or public-intake routing state. Explicit selected-parish identifiers must agree; malformed payloads fail closed; and privacy projection excludes unneeded staff, audit, domain, and token fields. Server authorization and staff-reviewed write behavior remain authoritative.

Latest verified Parish Settings freshness boundary: the main parish configuration, Staff Access, recent audit, and public-intake routing reads begin together, each owns an abortable latest-generation-wins sequence, and active-parish change invalidates all prior work. A routing mutation also invalidates any older routing read before its confirmed response is applied; server authorization and staff-reviewed write behavior remain authoritative.

Latest verified Reports response boundary: selected-parish client loads abort on replacement; only the validated success/failure DTO may render; request totals/type rows satisfy arithmetic invariants; and insight/workload counts are finite and non-negative. Exact-membership server authorization remains authoritative and Reports remain read-only.

Latest verified compact Global Search boundary: query changes abort pending timers and in-flight work; only a validated response matching the current query may render; and every result destination must pass the shared dashboard-internal href policy. Staff authentication and active-parish server scoping remain authoritative.

Latest verified onboarding readiness boundary: dashboard and full-page readiness loads are abortable and newest-owned; both Settings and Staff Access must validate before checklist calculation; and the client retains only parish readiness fields plus staff role/activation. Missing staff evidence is unavailable, not an empty directory. Selected-parish APIs and staff-reviewed completion remain authoritative.

Latest verified Notifications Center freshness boundary: initial and open-panel reads share one abortable sequence; only the newest response may settle badge, rows, errors, or loading; and client validation permits only expected read-model fields with safe dashboard-internal links. Active-parish server authorization remains authoritative and the surface remains read-only.

Latest verified Data Imports integrity boundary: preview captures a copied kind, filename label, and mapped-row snapshot; commit sends only that reviewed snapshot; competing inputs freeze; partial or unknown outcomes require staff review; and only the newest abortable history response may update visible parish evidence. Server-selected parish authorization remains authoritative, and this is not durable cross-tab idempotency or a database transaction.

Latest verified core-record form boundary: People, Household, and Sacramental Record fields and navigation freeze during selected-parish persistence, including member/primary-contact choices and sacramental register references; server authorization and validation remain authoritative.

Latest verified Mass Intention form boundary: all reviewed create/edit fields and navigation freeze while selected-parish persistence is unresolved; existing validation, priest-directory fallback, stipend and fulfillment semantics remain authoritative.

Latest verified duplicate-review integrity boundary: People and Household screens mutually exclude discovery and merge, settle thrown failures, and require refreshed evidence after uncertain completion or a confirmed merge whose candidate refresh failed.

Latest verified relationship-suggestion boundary: successful empty results remain distinct from unavailable lookups, stale reads are cancelled, and current failures settle into read-only staff guidance without changing relationship data.

Latest verified request-to-People integrity boundary: an unavailable active-parish relationship lookup exposes no link/create controls, obsolete lookups are cancelled, and link/create actions share one browser lock with confirmed-persistence refresh guidance. Server-side ownership remains authoritative.

Latest verified Request Detail freshness boundary: each full workspace read owns an abort controller, propagates cancellation through every scoped read, and only the latest controller may settle loading or visible errors. Active-parish authorization remains first and standalone activity refreshes remain compatible.

Latest verified Daily Work Hub persistence boundary: mark-as-contacted and funeral care-touchpoint writes remain server-owned behind same-origin staff authentication, exact selected-parish membership, and same-parish request ownership. Missing, forged, stale, cross-parish, and wrong-type scope fails closed generically before writes; no corresponding browser Supabase mutation exists.

Latest verified governance freshness boundary: Audit Log and the gated Export Audit Reviewer use immediate filter invalidation plus last-request-wins reads so stale evidence rows cannot render beneath a newer selection.

Latest verified Daily Work Hub freshness boundary: overlapping same-parish aggregate reads are last-request-wins, so stale success, failure, warning, and loading-state results cannot replace a newer confirmed dashboard response.

Latest verified Request Detail loading UX boundary: the staff workspace uses a stable responsive skeleton with accessible loading semantics and no interactive controls while its authorized data loads.

Latest verified Request Detail performance boundary: selected-parish detail authorization remains the first request; workflow support, communications, notes, Catholic type support, and activity then load concurrently with independent safe fallbacks. Unexpected load failures settle the UI with curated guidance rather than an indefinite loading state.

Latest verified onboarding integrity boundary: readiness-gated completion acquires a synchronous browser lock before the selected-parish Settings PATCH and holds same-screen setup navigation through persistence/refresh settlement. This is not durable idempotency or production approval.

Latest verified Parish Settings integrity boundary: configuration save and manual Daily Brief delivery share one synchronous browser lock, freezing the complete reviewed settings snapshot so recipient/configuration persistence cannot race provider delivery. This is same-screen mutual exclusion, not provider or durable idempotency.

Latest verified Workflow Template Settings integrity boundary: step saves acquire a synchronous browser lock before the selected-parish PATCH route and freeze workflow switching, refresh, reviewed fields, and save controls through settlement. This is same-screen exclusion, not durable idempotency or version-conflict detection.

Latest verified public-intake administration integrity boundary: Parish Settings uses one synchronous browser lock across metadata, domain, DNS verification, and token management before the existing selected-parish admin API. Competing controls freeze while the one-time token remains selectable; runtime routing remains disabled and this is not durable idempotency.

Latest verified manual Daily Brief integrity boundary: Parish Settings acquires a synchronous browser lock after staff confirmation and before the authenticated selected-parish send route, keeps the confirmation non-interactive through settlement, and preserves existing delivery/result behavior. This is not provider or durable server idempotency.

Latest verified daily-queue integrity boundary: Communication Center touchpoint/follow-up actions and Intake request/Mass-intention triage actions each use one synchronous browser lock before their existing authenticated active-parish APIs. Staff-reviewed form values freeze until settlement; this is same-screen exclusion, not durable server idempotency.

Latest verified Daily Work Hub request-write boundary: mark-as-contacted and funeral care-touchpoint writes remain server-owned behind same-origin, staff-authenticated, selected-parish membership and same-parish request checks, with no equivalent browser Supabase mutations. New immediate caller locks prevent same-screen duplicate dispatch while preserving staff review and structured partial-success recovery; this is not durable idempotency or a database transaction.

Latest verified Google Calendar integrity boundary: Request Detail uses one synchronous browser lock across create, staff-reviewed conflict override, update, and delete before existing selected-parish routes. All Calendar controls share busy state; server authorization and provider behavior remain unchanged. This is not provider or durable server idempotency.

Latest verified outbound-email integrity boundary: Request Detail and Daily Work Hub acquire synchronous browser locks before request-bound email delivery, preserve staff-reviewed content and provider confirmation, then log through active-parish communications APIs. This prevents immediate same-page duplicates but is not provider or durable server idempotency.

Latest verified request-workflow integrity boundary: legacy checklist toggles and workflow-step status actions each use one parent-level synchronous lock before authenticated active-parish writes, disable all related controls, and report persistence separately from refresh failure. This remains staff-reviewed and is not durable idempotency or automation.

Latest verified request-header integrity boundary: status callers share a parent lock, Waiting On save/clear retain visible state until persistence succeeds, and multi-type intake-detail saves lock before selected-parish Server Actions. Confirmed persistence is reported separately from refresh failure; this is not durable idempotency or cross-table transactionality.

Latest verified workflow integrity boundary: staff-applied Workflow Playbook checklist insertion acquires a synchronous browser lock before its selected-parish Server Action, releases after safe outcomes, and reports confirmed added counts. It remains manual and does not claim durable concurrent idempotency.

Latest verified Request Detail operational integrity boundary: Internal Notes, Assignment, Next Follow-Up save/clear, and Care Cadence acceptance acquire synchronous browser locks before selected-parish Server Actions, release after safe outcomes, and remain explicitly staff-reviewed. This is not durable idempotency or automation.

Latest verified request-document integrity boundary: Request Detail uses one synchronous browser lock across staff upload, approve/reject review, and one-time family upload-link creation before authenticated active-parish APIs. Read-only signed document opening remains independent; this is same-page exclusion, not durable idempotency or storage/database transactionality.

Latest verified core-data edit integrity boundary: People, Household, Mass Intention, and Sacramental Record edits acquire synchronous browser locks before selected-parish Server Actions. Household mutations are mutually exclusive, multi-step partial outcomes remain visible, and successful saves stay pending through navigation; this is not a database transaction or durable server idempotency.

Latest verified core-data integrity boundary: People, Household, Mass Intention, and Sacramental Record create pages acquire synchronous browser locks before their selected-parish Server Actions, release after safe failures, and stay pending through successful navigation. This is same-page protection, not durable server idempotency.

Latest verified staff-auth reliability boundary: password sign-in acquires a synchronous browser single-flight lock before Supabase Auth dispatch, releases after safe failures, and stays visibly pending through the existing hardened dashboard redirect after success. Provider, policy, and proxy authorization boundaries remain unchanged.

Latest verified sales-conversion reliability boundary: Schedule Demo uses a synchronous browser in-flight lock before request creation, preventing rapid same-page duplicate dispatch before React renders its disabled state. This does not claim durable server idempotency; existing rate limiting and provider confirmation remain authoritative.

Last Updated: 2026-07-11

Repository Reviewed: `priest-ops-assistant`

Primary Source Priority: current code, Supabase migrations, focused tests, build status, roadmap, repo audit, product/engineering reports, then clearly labeled assumptions.

Latest verified public-intake reliability boundary: each core family form prevents a second same-page submission before React renders its disabled state. This is a browser single-flight control, not durable cross-tab/device idempotency.

Latest verified authenticated-shell coordination boundary: current-session logout and membership-checked active-parish switching are mutually exclusive before dispatch and across responsive controls, preventing cross-operation races without changing authorization.

Latest verified source-guard boundary: Request Detail explicit-`any` protection uses TypeScript AST nodes, rejecting real unsafe annotations/assertions without confusing ordinary pastoral or operational prose for code.

Latest verified selected-parish shell reliability boundary: active-parish switching is single-flight from the browser through the membership-checked Server Action, with visible pending semantics and rollback to the previously confirmed context on failure.

Latest verified authenticated-shell reliability boundary: dashboard logout is single-flight, visibly busy across responsive controls, and remains scoped to the current browser session with curated failure guidance.

Latest verified parish-administration reliability boundary: Settings permits only one Staff Access mutation at a time across additions, role changes, and activation changes; it exposes precise form/row busy states while the existing selected-parish API remains authoritative for authentication, permissions, and final-active-admin protection.

Latest verified shared-UX boundary: confirmation dialogs expose action-specific busy labels with a neutral default, so merge and email-template workflows report the operation actually in progress. This is presentation-only and does not change authorization, persistence, providers, production gates, migrations, or operational RLS.

This document is Vinea's authoritative operating manual. It is written for Alex, future engineers, future AI assistants, product reviewers, security reviewers, and anyone who needs to understand what Vinea is, what exists now, what remains gated, and how the company should make decisions.

## Table Of Contents

1. Executive Vision
2. Product Strategy
3. Vinea Principles
4. Product Architecture
5. Engineering Standards
6. Official AI And Operating Stack
7. AI Operating Model
8. Security And Trust
9. Sales And Customer Success
10. Company Operating System
11. Documentation Standards
12. Codex Operating Instructions
13. Current Production Gates
14. Decision Log
15. Open Questions For Alex
16. Glossary
17. Source-Guard And Evidence Index

## Executive Vision

### Mission

Vinea helps Catholic parishes care for families with clarity, continuity, and accountability from first request through final record.

### Vision

Vinea should become the Catholic parish operating system: the trusted layer where intake, staff work, documents, communications, sacramental records, calendars, reporting, AI assistance, and diocesan governance meet.

### Why Vinea Exists

Parish work is high-touch, time-sensitive, and relationship-heavy. Many offices still coordinate baptisms, funerals, weddings, OCIA, registration, records, documents, and pastoral follow-up through shared inboxes, spreadsheets, paper notes, disconnected calendars, and staff memory. Those tools do not reliably answer:

- Who owns this family request?
- What is the next faithful step?
- What is blocked?
- What has already been communicated?
- Which record or person does this work belong to?
- What needs attention today?

Vinea exists to make that work visible, owned, secure, and easier to complete.

### Long-Term Goals

- Become the best daily staff workspace for Catholic parish operations.
- Create durable request-to-record continuity for sacramental and pastoral workflows.
- Give pastors, deacons, coordinators, administrators, and front-desk staff role-aware views of the same operational truth.
- Build trust before automation through clear security, audit, approval, and evidence practices.
- Support parish clusters and diocesan pilots without weakening parish boundaries.
- Let AI reduce staff burden while preserving human judgment and Catholic pastoral responsibility.

### Core Philosophy

Vinea should not win by becoming a generic church database with a Catholic skin. It should win by understanding Catholic parish office work deeply and making the next right staff action obvious.

## Product Strategy

### Ideal Customer

The ideal customer is a Catholic parish, parish cluster, pastorate, or diocesan pilot group with recurring baptism, funeral, wedding, OCIA, registration, records, communication, document, calendar, and follow-up workflows.

Early best-fit parishes likely have:

- A busy parish office with multiple staff or volunteers.
- Recurring sacramental preparation and pastoral-care requests.
- Reliance on email, spreadsheets, paper, or memory for handoffs.
- Pain around missed follow-ups, unclear ownership, document collection, records, or scheduling.
- Leadership willing to pilot safer operational software before full diocesan rollout.

### Problems Solved

- Families submit important requests, but ownership is unclear.
- First contact, follow-up, documents, schedule confirmation, and completion readiness are easy to miss.
- People, households, requests, communications, and sacramental records are disconnected.
- Staff roles need different daily views.
- Parish offices need evidence, auditability, and security before trusting automation.
- AI can help, but only if it is permission-aware, staff-reviewed, and unable to make pastoral, canonical, or outbound decisions on its own.

### Competitive Positioning

Vinea is a Catholic parish operations layer. It may replace spreadsheets, shared inboxes, paper trackers, and standalone forms first. It may complement ParishSOFT, Pushpay/ParishStaq, Realm, Breeze, Planning Center, Rock RMS, or similar systems where those remain giving/member/community systems but do not solve Catholic office workflow.

Vinea's strongest wedge is closed-loop Catholic operations:

- public intake
- owned request workflows
- staff follow-up
- documents
- people and households
- sacramental records
- certificates
- communications
- calendars
- reports
- audit trails
- staff-reviewed AI

### Competitive Advantages

- Catholic-specific workflow language and defaults.
- Request-to-record continuity.
- Role-aware Daily Work Hub.
- Staff-reviewed AI with explicit safety boundaries.
- Strong evidence culture for RLS, exports, monitoring, restore, and trust claims.
- Modern UX focused on what needs attention today.
- Migration path from scattered parish-office tools into one operational system.

### North Star Metrics

These metrics should guide product decisions:

- Percent of requests with a clear owner.
- Median time to first staff contact.
- Percent of open requests with a next follow-up date.
- Number of overdue follow-ups by selected parish.
- Percent of sacramental records linked to the correct request and person where applicable.
- Number of records needing continuity review.
- Staff time saved in daily triage.
- Demo-to-pilot conversion rate.
- Pilot parish activation and weekly staff usage.
- Production readiness gates closed with evidence.

### Product Thesis

Vinea should become the daily operating system for Catholic parish staff before expanding into broad generic church-management breadth. The highest-value roadmap sequence is:

1. Strengthen tenancy, security, selected-parish scope, and production gates.
2. Deepen Daily Work Hub, ownership, follow-up, and request-to-record continuity.
3. Broaden Catholic records, certificates, corrections, notation, and document workflows safely.
4. Add staff-reviewed automation only after audit, suppression, approval, and rollback controls exist.
5. Add migration, onboarding, reporting, integrations, and diocesan governance.

## Vinea Principles

1. Parishioner care comes first.
2. Every request has a clear owner.
3. Never lose parish knowledge.
4. Security is a feature.
5. AI assists; people decide.
6. Catholic workflows beat generic software.
7. Simplicity beats feature count.
8. Build trust before automation.
9. Every click should save staff time.
10. Documentation is part of the product.
11. Build for decades, not demos.
12. Prefer operational excellence over feature quantity.

These principles guide engineering, product, sales, support, and AI-assisted work.

## Product Architecture

### Current Stack

- Frontend and backend: Next.js 16.2.10 App Router, React 19.2.4, TypeScript, Tailwind CSS 4.
- Database, auth, storage, backend services: Supabase.
- Hosting, deployments, runtime, observability path: Vercel.
- Runtime AI integration in the app: OpenAI SDK and Responses API, currently staff-reviewed and gated.
- Email: Resend in current runtime code; Microsoft 365 / Vinea Outlook is the official company communications operating layer for parish communications, demos, customer support, and sales outreach.
- Calendar: Google Calendar integration exists today; Microsoft 365 calendar/email remains future integration work.
- PDF generation: `pdf-lib`.
- Tests: Vitest.
- Release checks: local release runner, production-gate checkers, evidence checkers, typecheck, lint, tests, build, and repository secret scan.

### Current Modules

| Area | Current state | Maturity |
| --- | --- | --- |
| Marketing and demo request | Implemented landing page and demo request path | Pilot-ready, pricing/trust content incomplete |
| Public intake | Baptism, funeral, wedding, OCIA, and join parish through `/api/intake` | Strong V1, production routing gated |
| Requests | List/detail, status, assignment, notes, communications, checklists, workflow steps, documents, scheduling, AI tools | Strong V1, automation still gated |
| People | Directory, create/edit/detail, request and record links, duplicate review | V1 |
| Households | Directory, members, primary contact, duplicate review | V1 |
| Sacramental records | Records for baptism, marriage, funeral, confirmation, first communion, OCIA, RCIC; append-only events | V1, notation/correction depth gated |
| Certificates | Baptism certificate generation exists | Partial, issuance logging and broader certificates gated |
| Mass intentions | List/create/edit/detail, assigned Mass date, priest, stipend received boolean, fulfilled flag | V1, no accounting scope |
| Dashboard | Command center, Daily Work Hub, role lenses, Parish Health, Operational Intelligence, reminders preview, handoff digest | Strong V1, browser QA still needed for newer paths |
| Reports | Server aggregate summary for request analytics, insights, workload | V1 |
| Search and notifications | Global search and notifications center with selected-parish cues | V1 |
| Imports | People, households, sacramental records with import batches | V1, competitor adapters future |
| Communications | Communication history, email send route, daily brief, request notifications, reply drafts | V1, threading/templates/SMS future |
| Calendar | Google OAuth and event lifecycle | V1, Microsoft 365 future |
| Documents and family portal | Private request documents, portal tokens, family upload/list/review/download paths | V1, OCR/retention/restore claims gated |
| Audit and exports | Audit log, export gates, export reviewer prototype | Gated for production |
| Settings and onboarding | Parish settings, staff access, workflow templates, onboarding readiness | V1 |
| AI | Summary/reply draft routes and safety scaffolding | Useful but not fully safety-chain complete |

### Current Maturity

Vinea is late prototype to early pilot-readiness. It has substantial product surface and strong safety/process documentation. It is not yet fully production-complete for diocesan or multi-parish scale.

Current build status records the latest runtime production-readiness slice as the 2026-07-10 Export Exact Selected-Parish Role Boundary. The full Vitest regression run passed 689 files and 2,725 tests; all-file TypeScript, quiet lint, and the Next.js 16.2.10 production build with 56 static pages also passed. Both gated export pilots now derive permission roles from the authenticated membership in the exact selected parish, deny missing/failed role scope before privileged reads, and send safe denials to the forged/cross-parish reviewer queue. Production exports remain disabled and separately approval-gated. The latest documentation operating-system slice remains the 2026-07-10 SSoT consolidation. Production-sensitive claims still require their separate approval and smoke-evidence gates.

### Known Production Gates

Production claims or activation remain blocked until explicit approval and evidence exist for:

- Membership-aware operational RLS promotion.
- Production deployment approval and smoke evidence.
- Production public intake routing.
- Production exports and export reviewer flow.
- Production monitoring runtime.
- CSP report-only runtime.
- Backup/restore SLA and non-synthetic restore evidence.
- Public trust-center claims.
- AI safety-chain runtime parity and production AI gates.
- Workflow reminder runtime engine.
- Certificate issuance logging runtime.
- Sacramental correction and notation runtime.
- Retention/deletion policy.
- MFA/SSO/RBAC beyond admin/staff.

### Current Roadmap

Near-term roadmap priorities:

1. Keep reducing browser-owned sensitive reads and writes by moving staff surfaces behind selected-parish server routes.
2. Run safe non-production browser QA for the Daily Work Hub and Daily Office Handoff surfaces once safe app/session fixtures are available.
3. Continue production RLS approval readiness without applying production RLS until gates are complete.
4. Continue Catholic records depth through certificate issuance logging, broader certificate readiness, corrections, and notations behind approvals.
5. Bring AI summary/reply routes toward the same safety-chain, source display, audit metadata, and staff disposition model.
6. Improve onboarding and migration readiness for ParishSOFT, Pushpay/ParishStaq, PDS, eCatholic, Planning Center, and spreadsheets.
7. Publish only approved trust, backup, restore, and security wording.

### Future Roadmap

- Workflow automation triggers with staff control, suppression, audit, and rollback.
- Role saved views and personalized Daily Work Hub queues.
- Mobile/PWA staff workspace.
- Microsoft 365 email/calendar integration.
- Communications templates, threading, and consent/preferences.
- Natural-language reporting/search after permission-scoped retrieval is proven.
- Document OCR/extraction only after document privacy and approval gates.
- Diocesan governance, reporting, and multi-parish administration.
- Public API/webhooks after core security posture is production-ready.

### Deferred Ideas

- Giving, accounting, full payment processing, and stipend ledger integration.
- SMS until consent, opt-out, templates, and audit rules are designed.
- Volunteer scheduling and religious education workspace beyond current OCIA/request coverage.
- Broad public trust center until evidence and owner approval are complete.
- Full family accounts beyond token-based family portal.

### Explicitly Rejected Or Not Current

- Vinea must not claim production diocesan readiness while compatibility paths still rely on primary-parish fallback or production RLS gates remain open.
- Vinea must not let AI send communications, decide canonical eligibility, mutate sacramental registers, issue certificates, or make pastoral decisions autonomously.
- Vinea must not re-enable direct anonymous browser writes to parish data.
- Vinea must not make public backup/restore, security, or trust-center claims before evidence and Alex approval.
- Historical note: Hermes Agent and OpenClaw are not part of Vinea's current operating workflow. They should not be described as active Vinea tools. Any future consideration would need explicit approval and a separate operating-model update.

## Engineering Standards

### Coding Standards

- Follow existing Next.js App Router, route handler, Server Action, and helper patterns.
- Read `node_modules/next/dist/docs/` before editing Next.js-specific code in this repository.
- Prefer existing helpers in `lib/` over new abstractions.
- Keep browser code away from broad sensitive table reads and direct sensitive writes where server-owned routes already exist.
- Use explicit field projections for sensitive operational data.
- Preserve selected-parish context and fail closed when context is missing for parish-wide signals.
- Never expose secrets, raw provider payloads, raw database errors, session tokens, signed URLs, storage paths, or raw IDs in staff/user messages.

### Architecture Standards

- Staff dashboard surfaces should be authenticated and selected-parish scoped.
- Public intake should remain server-mediated through `/api/intake`.
- Service-role access belongs only in server-side routes/helpers with narrow scope.
- Shared request workflows should stay centralized in existing request/workflow helpers.
- New runtime features that mutate records, generate certificates, send communications, call AI, run exports, access storage, create signed URLs, change RLS, or touch production require explicit approval and evidence.

### Testing Philosophy

Tests are part of the safety system. Use focused tests for each slice and broader tests when shared behavior changes.

Expected test types:

- Product logic tests.
- DTO shape tests.
- Route and Server Action behavior tests.
- Source-validation tests for safety boundaries.
- Migration source-validation tests.
- Documentation/evidence tests for production-sensitive gates.
- Browser QA evidence only when safe app targets and staff sessions are available.

### Documentation Requirements

Every material change should update the right documents:

- SSoT for enduring truth and operating model.
- Roadmap for priority and status changes.
- Build Status for what changed, what was tested, risks, and next task.
- Repo Audit when routes, tests, docs, migrations, or known risks materially change.
- README when onboarding or documentation index changes.
- Evidence packets when production-sensitive gates are involved.

### Security Requirements

- Staff authentication and authorization are mandatory for protected surfaces.
- Active selected-parish membership must be verified before scoped reads/writes.
- RLS must not be weakened.
- Production access, migrations, exports, communications, storage, signed URLs, AI calls, certificate generation, and public trust claims are all gated.
- Safe error logging must redact credentials, tokens, emails, provider payloads, raw database details, and raw exception messages.
- Public claims must lag evidence.

### Production Readiness Requirements

A feature is not production-ready merely because tests pass. Production readiness requires:

- Product-owner approval.
- Security/data approval where sensitive data is involved.
- Non-production QA evidence with labels only.
- Rollback plan.
- Monitoring/support plan where appropriate.
- Production smoke plan where appropriate.
- Release-readiness checks.
- No unresolved production-sensitive gates.

### Definition Of Done

For ordinary safe slices:

- Code or docs are updated narrowly.
- Focused tests pass.
- Lint/build/full tests run when reasonable for the risk level.
- Build Status is updated.
- Roadmap/SSoT/Repo Audit are updated if the truth changed.
- The final explanation is beginner-friendly and includes the next recommended prompt.

For production-sensitive slices, Definition of Done also requires the approvals and evidence listed above.

## Official AI And Operating Stack

This is Vinea's official company operating stack.

### ChatGPT

Responsibilities:

- Product strategy.
- Deep research.
- Architecture.
- UX.
- Marketing.
- Sales.
- Competitive analysis.
- Roadmap guidance.
- Technical review.

### Codex

Responsibilities:

- Implementation.
- Refactoring.
- Testing.
- Documentation.
- Roadmap execution.
- Code review.
- QA support.
- Autonomous engineering work.
- Maintaining repository documentation.

### Supabase

Responsibilities:

- Database.
- Authentication.
- Storage.
- RLS.
- Backend services.

### Vercel

Responsibilities:

- Deployments.
- Hosting.
- Production runtime.
- Observability path.
- Preview/release workflow.

### Microsoft 365 / Vinea Outlook

Responsibilities:

- Parish communications.
- Demos.
- Customer support.
- Sales outreach.

This stack does not mean every runtime integration is complete. Google Calendar and Resend are implemented today; Microsoft 365 remains the official business communications operating layer and a future product integration path.

## AI Operating Model

### ChatGPT Responsibilities

ChatGPT should help Alex think: strategy, product direction, research, messaging, sales process, roadmap sequencing, architecture review, UX critique, and competitive positioning.

### Codex Responsibilities

Codex should help Alex build: implementation, tests, refactors, documentation, QA evidence, source validation, build verification, and safe autonomous execution of the roadmap.

### Human Approval Responsibilities

Alex approval is required before:

- Production deployment or production smoke against real customer data.
- Applying production migrations or changing operational RLS.
- Enabling production-sensitive flags.
- Sending communications to real users.
- Running exports or granting export access.
- Calling AI in a new production-sensitive way.
- Adding public trust, backup/restore, security, or compliance claims.
- Changing pricing, packaging, legal, support commitments, or sales promises.
- Mutating sacramental records in new runtime paths.
- Generating certificates in new runtime paths.
- Accessing storage or creating signed URLs in new flows.
- Enabling workflow automation that affects families or staff workload automatically.

### AI Safety Rules

- AI assists; staff decide.
- AI output must remain staff-reviewed.
- AI must not make canonical, sacramental, pastoral, legal, eligibility, or outbound communication decisions.
- Family-facing AI output remains disallowed unless a future approval explicitly changes that boundary.
- Permission-scoped retrieval, source display, safe audit metadata, and staff disposition are the direction for runtime AI safety.

## Security And Trust

### Security Posture

Vinea's security posture is evidence-led and conservative. Current protections include Supabase Auth, staff authorization, active parish context, selected-parish route hardening, server-mediated public intake, durable public-intake rate limiting, safe error logging, audit events, private document storage, token-based family portal access, release-readiness checks, and many production-gate evidence packets.

### AI Safety

Runtime AI summary and reply draft routes exist, but production-sensitive AI safety work remains gated. The current direction is permission-scoped retrieval, safe source references, safe audit metadata, staff review labels, fail-closed gates, and no autonomous send.

### Privacy

Private notes, documents, family portal tokens, raw provider payloads, internal audit details, storage paths, signed URLs, and cross-parish context must not leak to unauthorized users or public docs. Label-only evidence is required for QA records.

### Audit Philosophy

Audit records should support trust, debugging, and accountability without exposing pastoral details or secrets. Sensitive operations should write safe metadata only after authorization and validation.

### Disaster Recovery

Backup/restore work is documented through runbooks and non-production/synthetic evidence. Public restore SLA claims remain gated until owner approval and stronger evidence exist.

### Trust Center Roadmap

Trust center content should be built only from approved evidence. The trust center public claims boundary matrix, owner review worksheet, filled example, evidence gap register, and release handoff docs are working inputs, not public claims by themselves.

## Sales And Customer Success

### Ideal Customer Profile

- Catholic parish with a busy front office.
- Recurring sacramental and pastoral-care requests.
- Staff handoff pain.
- Existing reliance on email, spreadsheets, paper, or generic tools.
- Leadership interest in safer workflow improvement.

### Pilot Strategy

Start with one or a small group of parishes using safe non-production or approved pilot data. Lead with daily staff clarity, ownership, follow-up, request-to-record continuity, records hygiene, documents, and calendar/communication support.

### Demo Process

Use `docs/DEMO_SCRIPT.md` and `docs/DEMO_PILOT_RUNBOOK.md`. Avoid live email/calendar actions unless configured in a safe approved environment. Do not imply production claims that are still gated.

### Pricing Philosophy

Pricing is not final. Explore parish-size tiers, annual plans, diocesan pilot packages, and onboarding/import services. Alex approval is required before external pricing promises.

### Migration Strategy

Migration should start with CSV/spreadsheet imports and move toward guided adapters for ParishSOFT, PDS, eCatholic, Pushpay/ParishStaq, Planning Center, and similar systems. Migration tooling should include previews, dry-run diffs, duplicate review, rollback notes, and field mapping memory.

### Customer Success Philosophy

Vinea should help parish staff feel calmer and more capable. Support should be practical, plain-English, and oriented around real office workflows: what is owned, what is blocked, what is due, and what can safely wait.

## Company Operating System

### Weekly Cadence

- Review Build Status and Roadmap.
- Select one or two highest-value safe tasks.
- Verify production gates before any sensitive work.
- Run focused tests and broader checks based on risk.
- Update docs immediately.
- Record blockers instead of forcing unsafe progress.

### Documentation Cadence

- Update Build Status after every meaningful slice.
- Update SSoT only when enduring truth changes.
- Update Roadmap when priority, maturity, or gates change.
- Update Repo Audit after material inventory changes.
- Consolidate duplicate evidence docs periodically.

### Release Cadence

Vinea does not currently operate on a formal release train. Practical release flow is:

1. Implement a narrow slice.
2. Add tests and docs.
3. Run focused verification.
4. Run broader verification for shared or production-sensitive changes.
5. Update Build Status.
6. Gather approvals and evidence for gated work.
7. Deploy only through approved Vercel/Supabase release paths.

### Decision Log

Major decisions belong in this SSoT and, when implementation-specific, in roadmap/build status/evidence docs. ADRs should be added for architecture changes that affect multiple modules, production gates, data model, RLS, AI safety, export policy, or integrations.

### Key Performance Indicators

Product KPIs:

- Request ownership coverage.
- First-contact time.
- Follow-up overdue count.
- Completion readiness.
- Record continuity review count.
- Duplicate backlog.
- Staff weekly active usage.
- Pilot activation.

Engineering KPIs:

- Production gates closed with evidence.
- Full test/build/lint health.
- Browser QA coverage for critical workflows.
- Count of browser-owned sensitive reads/writes removed.
- Documentation drift found and resolved.
- Secret-scan and release-readiness results.

## Documentation Standards

### Source Roles

- `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`: enduring operating manual and authoritative product/company truth.
- `docs/VINEA_ROADMAP.md`: current priorities, implemented slices, future order, and non-goals.
- `docs/VINEA_BUILD_STATUS.md`: latest work, test evidence, risks, and next task.
- `docs/VINEA_ENGINEERING_PRODUCT_STATE_REPORT_20260702.md`: detailed engineering and product snapshot from 2026-07-02.
- `docs/VINEA_PRODUCT_REPORT_20260702.md`: concise product thesis, strengths, gaps, and roadmap focus.
- `docs/VINEA_REPO_AUDIT.md`: repository inventory, routes, APIs, docs, tests, and known risks.
- `docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md`: operator front door for source authority, VAOS guides, QA evidence, security gates, and documentation maintenance.
- `README.md`: repository entry point and local/release commands.

### Synchronization Rules

- If a feature ships, update Build Status and Roadmap.
- If a feature changes Vinea's enduring identity, architecture, AI model, production gate, or operating model, update SSoT.
- If a route/API/schema/test/doc inventory changes materially, update Repo Audit.
- If onboarding commands or core docs change, update README.
- If a production-sensitive gate changes state, update all relevant evidence/checker docs.

### Documentation Quality Bar

Good Vinea documentation is concise, factual, dated, source-linked, label-only for sensitive evidence, and clear about what is implemented versus planned. It must never invent production readiness.

## Codex Operating Instructions

### How Codex Chooses The Next Task

Codex should review:

- Direct user request.
- `CODEX_AUTONOMOUS_INSTRUCTIONS.md`.
- `docs/autonomous-os/RUN_LOOP.md`.
- `docs/autonomous-os/TASK_SELECTION_SCORECARD.md`.
- SSoT, Roadmap, Build Status, Repo Audit.
- Current git status and recent changes.
- Relevant code/tests/docs.

Then choose the highest-value safe task using parish staff value, safety, roadmap alignment, testability, reversibility, and documentation value.

### How Codex Prioritizes Work

Prefer:

- Staff-visible clarity and time savings.
- Security and selected-parish hardening.
- Catholic records and continuity depth.
- Production-gate closure through evidence.
- Small, reversible slices.
- Tests that prevent regression.

Avoid:

- Broad refactors without need.
- New abstractions without clear payoff.
- Production-sensitive actions without approval.
- Public claims without evidence.
- Features that create generic ChMS breadth at the expense of Catholic workflow depth.

### How Codex Updates Documentation

- Build Status gets the work summary and verification.
- Roadmap gets status or priority changes.
- SSoT gets enduring truth changes.
- Repo Audit gets inventory changes.
- README gets index/command changes.
- Evidence docs get label-only QA records.

### When Codex Must Stop For Alex Approval

Codex must stop before production access, migrations, operational RLS changes, production flags, outbound communications, exports, public trust claims, sensitive record mutation, storage/signed URL access, new AI production behavior, pricing/legal/support commitments, or autonomous workflow automation.

### How Codex Avoids Documentation Drift

- Do not append a new status paragraph when an existing section should be updated.
- Prefer tables and compact status sections over chronological sprawl.
- Move one-off evidence into evidence docs, not the SSoT body.
- Keep exact source-guard phrases in the appendix when tests depend on them.
- Record inconsistencies instead of resolving them by guesswork.

### Catholic Workflow Philosophy

Codex must preserve Vinea's Catholic workflow depth: sacramental preparation, pastoral care, OCIA, funerals, weddings, records, certificates, parish households, and staff responsibility. Generic CRM patterns are allowed only when they serve those workflows.

### Complexity Rule

Build the smallest thing that materially improves parish operations or trust. Prefer clarity, safety, and boring architecture over cleverness.

## Current Production Gates

Status as of 2026-07-10:

| Gate | Current state |
| --- | --- |
| Production deployment approval | Not granted in this document |
| Membership-aware operational RLS promotion | Gated |
| Public intake production routing | Gated |
| Production exports | Gated |
| Production monitoring runtime | Gated |
| CSP report-only runtime | Approval packet only |
| Trust center public claims | Gated |
| Backup/restore public SLA | Gated |
| Workflow reminders runtime | Gated |
| AI safety-chain production parity | In progress/gated |
| Certificate issuance logging runtime | Approval/preflight docs only |
| Sacramental correction/notation runtime | Approval/preflight docs only |
| Microsoft 365 product integration | Future |
| Pricing and packaging | Needs Alex approval |

## Decision Log

- 2026-04-10: Funeral and wedding detail tables added so type-specific request fields do not live only in the core request table.
- 2026-04-15: OCIA request details became first-class.
- 2026-04-22: Parish and Google integration tables added for calendar binding.
- 2026-04-26: Join-parish request support added.
- 2026-06-10: Sacramental records, people, households, Mass intentions, core RLS, and parish scope foundations added.
- 2026-06-20: Staff authorization, removal of direct anonymous intake writes, parish admin readiness, audit events, and import history added.
- 2026-06-26: Deep research became a strategic roadmap source; the Role Work Hub direction was adopted.
- 2026-07-02: Daily operating system, Parish Health Score, Workflow Reminder DTOs/previews, certificate issuance DTOs, and sacramental correction/notation DTOs advanced as safe/non-runtime or read-only slices.
- 2026-07-05: Vinea Autonomous Operating System foundation created for disciplined Codex run loops.
- 2026-07-05 to 2026-07-06: Daily Office Handoff Digest browser QA evidence and blocker records captured. 2026-07-06: The Daily Office Handoff Digest Browser QA recheck was blocked before browser access because `/api/health` was unavailable in that Codex session.
- 2026-07-07 to 2026-07-08: Safe error messages, active-parish boundaries, safe link boundaries, AI safety preflights, release-readiness evidence, monitoring/trust packet work, and proxy compatibility boundaries advanced.
- 2026-07-09: Environment, body-size, dependency, durable rate-limit, and repository secret-scanning baselines advanced.
- 2026-07-10: Daily Work Hub and Reports read/write paths continued moving behind selected-parish server boundaries; App Router loading/error/not-found boundaries and dashboard safe-message boundaries were added; the Daily Work Hub Single-Response Composition became the latest verified build-status slice.
- 2026-07-10: Dashboard shell identity and selected-parish admin capability moved to a server-owned context, eliminating the shell's client Staff Access roster fetch; full Audit Events reads and parish-level Audit Events writes now require admin status in the exact selected parish.
- 2026-07-10: This SSoT was reorganized into an operating manual and the official ChatGPT/Codex/Supabase/Vercel/Microsoft 365 operating stack was defined.

## Open Questions For Alex

- What is the official production domain?
- What are official support, sales, billing, and incident contacts?
- What is the first pilot parish profile?
- What pricing and packaging should be tested?
- Should Vinea sell first as a replacement, companion, or workflow layer?
- What production restore SLA can be promised?
- What retention/deletion policy applies to requests, communications, documents, audit logs, AI outputs, and OAuth tokens?
- Which certificate types come after baptism?
- What sacramental correction/notation policy needs canonical review?
- What MFA/SSO/RBAC baseline is required before pilots?
- Which Microsoft 365 integration should come first: Outlook email, calendar, or both?
- Which competitor migration path should be prioritized?

## Glossary

Request: A structured parish workflow item created from public intake or staff action.

Parishioner: Legacy/contact record created through intake and linked to requests.

Person: Staff-managed directory profile.

Household: A family or household record with members and contact context.

Sacramental Record: Catholic register entry for baptism, marriage, funeral, confirmation, first communion, OCIA, or RCIC.

Certificate: Generated document based on a sacramental record. Current runtime support is mostly baptism-focused.

Mass Intention: Staff-tracked Mass intention request; current scope does not include full accounting.

Daily Work Hub: Main staff workspace for what needs attention today.

Operational Intelligence: Explainable dashboard cues that surface bottlenecks, risk, continuity gaps, and next actions.

Active Parish: The selected parish context used for staff dashboard reads/writes.

Primary Parish: Legacy V1 compatibility fallback, historically the oldest parish row. It is not the desired long-term multi-parish model.

Authorized Staff: Supabase Auth user authorized by allowlist or active staff records/membership.

Service Role: Privileged Supabase key for server-side code only.

RLS: Row Level Security in Supabase/PostgreSQL.

OCIA: Order of Christian Initiation of Adults.

## Source-Guard And Evidence Index

This appendix preserves exact marker phrases used by source-validation tests and evidence packets. It is intentionally compact; the detailed facts live in the linked docs and current code.

### Current Snapshot Markers

- Latest safe production-readiness slice: Request Schedule Audit Event Ownership Boundary.
- Immediately previous safe production-readiness slice: Request Mutation Audit Event Ownership Boundary.
- Confirmed sacramental/OCIA schedule and selected-parish Google Calendar lifecycle routes own `request.schedule.updated`; Request Detail has no browser request-history POST and generic request-target audit writes are invalid.
- Checklist, staff-note, suggested-date, and Funeral/Wedding detail saves own their request audit events on authenticated active-parish routes; browser-forged copies are rejected and metadata excludes protected content values.
- AI-summary saves, reply-draft saves, and successful staff email delivery own their request audit events on authenticated scoped server routes; browser-forged copies are rejected and metadata excludes generated/contact content.
- Internal request note text remains in the protected note record and is not copied into `request.note.created` audit metadata.
- People, Households, Mass Intentions, and Sacramental Record Server Actions permit legacy primary-parish fallback only when no active-parish cookie exists; explicit selected-parish writes fail closed.
- Sacramental Record creation validates optional source-request and linked-person ownership in the authorized selected parish, rejects duplicate request-to-record continuity, and adds no automatic linking, certificate generation, or canonical decision logic.
- Intake Queue request and Mass Intention triage writes require authenticated selected-parish ownership, use safe route audit metadata, preserve partial-success guidance, and no longer use the obsolete mutation Server Action.
- Communications Center writes require authenticated selected-parish request ownership, use note-free route audit metadata, preserve partial-success guidance, and no longer use the obsolete mutation Server Action.
- Both gated export pilots use exact selected-parish membership roles; account-wide admin status cannot elevate another parish, and production exports remain disabled.
- Dashboard shell identity and selected-parish admin capability are server-owned; full Audit Events reads and parish-level writes require exact selected-parish admin status.
- Vinea Autonomous Operating System.
- Production membership-aware operational RLS is not approved.
- `npm run check:release-local-evidence` now requires the completed evidence record to state that the check did not add production flags and did not touch Google Calendar data.

### AI And Safe Error Markers

- AI summary/reply routes with safe error logging.
- AI Safety Chain Active Parish Request Lookup.
- AI Safety Chain Active Parish Request Lookup keeps future AI request contact reads scoped to the selected active parish before any provider call; production AI gates remain closed.
- DTO-backed AI reply prompt assembly.
- disabled-gate, fail-closed AI reply safety-chain adapter.
- central `writeAuditEvent` helper with safe error logging.
- demo-request route with safe error logging.
- staff email send route with safe error logging.
- request notification route with safe error logging.
- Request-Bound Staff Email Authorization boundary.
- Sent Email Client Partial-Success Boundary prevents Request Detail and Daily Work Hub post-send logging failures from being misreported as delivery failures.

### Dashboard And Daily Operating Markers

- Daily Brief Manual Send Confirmation Boundary requires staff review immediately before outbound parish brief delivery.
- Staff Access Role Downgrade Confirmation Boundary requires deliberate approval before removing parish administrator permissions.
- Staff Access Deactivation Confirmation Boundary requires explicit admin approval while preserving API self-lockout and final-admin protections.
- Google Calendar Conflict Override Confirmation Boundary keeps detected conflicts visible and requires explicit staff approval before force-create.
- Google Calendar Delete Confirmation Boundary requires explicit staff confirmation and keeps external event deletion separate from Vinea confirmed schedule changes.
- Staff Login Session Probe Recovery keeps the sign-in form available when the optional existing-session check throws and preserves curated sign-in guidance.
- Daily Work Hub safe link boundary.
- Dashboard Command Center safe link boundary.
- Dashboard Follow-Up Queue safe link boundary.
- Dashboard Request Navigation safe link boundary.
- Dashboard Today View safe link boundary.
- Dashboard Queue Client Defense In Depth boundary.
- Dashboard Shell Client Safe Messages boundary.
- Dashboard Parish Switch Sensitive Tool Reset keeps Global Search and Notifications Center hidden and clears their client state until the selected parish is server-confirmed.
- Dashboard Request Scope Legacy Fallback Boundary.
- Daily Ownership Follow-Up safe link boundary.
- Daily operating dashboard read-only boundary.
- Daily Operating Signal Inputs.
- Daily Operating Signal safe link boundary.
- read-only duplicate backlog, incomplete record, and certificate-ready.
- request-to-record continuity.
- visible Daily Office Handoff Digest UI.
- Daily Office Handoff Digest DTO.
- Daily Office Handoff Digest Browser QA.
- Daily Office Handoff Digest Browser QA recheck was blocked.
- Daily Office Handoff Digest dashboard browser QA readiness worksheet.
- Daily Office Handoff Digest safe link boundary.
- Daily Office Handoff saved-view presets.
- visible Daily Office Handoff saved-view dashboard UI.
- Daily Office Handoff saved-view dashboard UI approval packet.
- Daily Office Handoff saved-view dashboard UI source preflight.
- Daily Office Handoff saved-view dashboard browser QA checklist.
- Daily Office Handoff saved-view dashboard browser QA evidence template.
- browser QA evidence for the saved-view UI.
- Operational Intelligence Brief.
- Parish Health Score continuity-clear empty-state cue.
- does not link records, generate certificates, send reminders.
- Parish Health and Operational Intelligence safe link boundary.
- passed zero-continuity continuity empty-state browser QA run.
- zero-continuity empty-state browser QA readiness worksheet.
- Parish Work Queue safe link boundary.
- Notifications Center safe link boundary.
- Communication Commitments dashboard safe link boundary.
- Care Cadence safe link boundary.
- Care Timeline safe link boundary.

### Records, Requests, And Entity Markers

- Record Certificate Generation Confirmation Boundary requires staff register review and displays sacramental-eligibility/canonical-decision exclusions before Baptism PDF generation.
- Request Confirmed Schedule Clear Confirmation uses the shared accessible dialog and preserves explicit Google Calendar separation before staff remove a confirmed time.
- Request Confirmed Schedule Clear Persistence UI Boundary keeps Baptism, Funeral, Wedding, and OCIA dates visible until scoped persistence confirms removal.
- Core Record Client Safe Messages boundary.
- Sacramental Record Client Safe Messages boundary.
- Sacramental Records Active Parish Detail Scope.
- Sacramental Record Continuity Card.
- live as a read-only staff UX aid.
- Sacramental Continuity safe link boundary.
- Sacramental Record Correction And Notation DTO Foundation.
- Sacramental Record Correction And Notation Non-Production QA Evidence Template.
- Sacramental Record Correction And Notation Runtime Scaffold Approval Packet.
- Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet.
- Certificate Type Expansion And Request Continuity Plan.
- Certificate Issuance Logging DTO Foundation.
- Certificate Issuance Logging Implementation Approval Packet.
- Certificate Issuance Logging Non-Production QA Evidence Template.
- Certificate Issuance Logging Runtime Source Preflight.
- Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet.
- Record Detail Linked-Person safe link boundary.
- Relationship Intelligence Record Prefill safe link boundary.
- People Active Parish Detail Scope.
- Households Active Parish Detail Scope.
- Mass Intentions Active Parish Detail Scope.
- Mass Intention Navigation safe link boundary.
- Request Actions Active Parish Server Actions.
- Request Person Link Active Parish Server Actions.
- Request Person Link safe link boundary.
- Request Detail Server Action Client Safe Messages boundary.
- Request Access Legacy Fallback Boundary.
- Request Backlink safe link boundary.
- Request Relationship Active Parish Suggestion Scope.
- Request Relationship Suggestion safe link boundary.
- Request Workflow Detail Href safe link boundary.
- Entity Directory safe link boundary.
- Entity Mutation Navigation safe link boundary.
- Safe Dashboard Href utility.
- Global Search safe link boundary.

### Production, Trust, Release, And Integration Markers

- CI production-readiness workflow.
- CI release environment guard.
- release-readiness handoff consistency guard.
- the completed local release evidence checker.
- Production observability readiness plan.
- production monitoring safe event contract.
- Production monitoring approval packet.
- Production monitoring runtime approval readiness gate.
- Production monitoring runtime implementation approval packet.
- Production monitoring runtime approval readiness gate.
- Production monitoring evidence package index.
- Production monitoring non-production redaction smoke QA packet.
- Production monitoring owner readiness completion worksheet.
- Production monitoring smoke evidence template.
- Production monitoring and support owner intake worksheet.
- Production support escalation matrix.
- Trust center public claims boundary matrix.
- Trust center claims owner review worksheet.
- Trust center claims owner review filled example.
- incident tabletop evidence package index.
- incident tabletop owner/sign-off worksheet.
- non-production incident tabletop drill evidence template.
- non-production incident tabletop drill execution approval packet.
- Audit Log Target safe link boundary.
- Email Dashboard Link Safety Boundary.
- Google Calendar External Link Safety boundary.
- Onboarding Readiness safe link boundary.
- Public Intake Legacy Fallback Boundary.
- Staff Parish Context Legacy Fallback Boundary.
- Role Work Hub safe link boundary.
- Workflow Reminders V1 DTO Foundation.
- Workflow Reminders V1 Dashboard Preview.
- Workflow Reminders V1 Disposition DTO Foundation.
- Workflow Reminders V1 Runtime Approval Packet.
- Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet.
- dashboard-only.
