# Vinea Roadmap

Latest safe Workflow Template reliability slice (2026-07-20): selected-parish step saves now use a 60-second confirmation boundary and require a validated acknowledgement plus authoritative selected-parish reload before reporting success. Explicit server rejections remain retryable; ambiguous transport, malformed success, or failed reload freezes the editor until refresh/review; stale parish results are ignored; and no save replays automatically. Commit `405c7b28f7a229602b036b9f9641ada6f5e71d44`, tracked aggregate `B165A167D3D5343F8C61E18B592ABB779965D0C99A3729AEA672AE7ED90E56FE`, focused `10` files / `36` tests, and the complete `15 / 15` release contract (`862` files / `3,698` tests plus credential-free `56`-page build) bind the result. Engineering remains estimated at `99.8%`; rollout readiness remains `87.5%` because live non-production confirmation evidence and production-sensitive human gates remain separate. No production or Workflow Template write occurred.

Latest safe selected-parish Settings reliability slice (2026-07-20): parish-details and Staff Access writes now use a 60-second confirmation boundary and require an authoritative selected-parish reload before reporting success. Explicit server rejections remain retryable; ambiguous transport, malformed success, or failed reload freezes related controls until refresh/review; stale parish results are ignored; and no write replays automatically. Commit `9c0912ebdf3d7299b9d7c8c126e23ff61a9d232d`, tracked aggregate `600289C1E5C6C64E09B77243D756A01CFCC9DE1064724A7B55BE20CB22F6EBDE`, focused `18` files / `73` tests, and the complete `15 / 15` release contract (`860` files / `3,692` tests plus credential-free `56`-page build) bind the result. Engineering remains estimated at `99.8%`; rollout readiness remains `87.5%` because live non-production confirmation evidence and production-sensitive human gates remain separate. No production, settings, Staff Access, or provider action occurred.

Latest safe AI reliability slice (2026-07-20): Request Detail summaries/replies and Daily Work Hub follow-up drafts now use a 40-second browser generation boundary over the existing 30-second provider deadline and a separate 60-second persistence boundary. Synchronous locks prevent duplicate dispatch, malformed or empty provider results cannot be saved, and ambiguous persistence freezes related request mutations until staff refresh and review; sequential batches stop at the first uncertain item and nothing replays automatically. Commit `eb6a622db9e74eb0bd72dc8f05f01220f791186e`, tracked aggregate `B6FA677F41018079FA23CE91DBD63025494B8D88DC46ED4722813A67F4312B7B`, focused `17` files / `129` tests, and the complete `15 / 15` local release contract (`858` files / `3,685` tests plus credential-free `56`-page build) bind the result. Engineering is estimated at `99.8%`; rollout readiness remains `87.5%` because live non-production AI confirmation evidence and every production-sensitive human gate remain separate. No AI provider or production action occurred.

Latest safe production-readiness slice (2026-07-20): Request Detail Google Calendar create/update/delete now use a 25-second browser confirmation boundary over the existing 15-second provider deadline. Any ambiguous transport result, post-provider server failure, partial link persistence, or failed confirmed-result refresh requires staff to refresh and inspect the request before another Calendar action; all visible mutation controls freeze, conflict/validation responses remain safely retryable, and no automatic replay was added. Commit `10888255f20611dabc051aae0f9cd15750dd22ad`, tracked aggregate `35E2C1DE34877B5186F7BD45CCED994C150AD93C87EFBD995A0B928F4D4B37B6`, focused `12` files / `81` tests, and the complete `15 / 15` local release contract (`856` files / `3,677` tests plus credential-free `56`-page build) bind the result. Live provider/browser rollout evidence remains pending; no production or Google action occurred.

Latest safe staff-email reliability slice: immutable implementation commit `f7de8a6eeb320737987f6aa0332a0176fa535215` gives Request Detail and Daily Work Hub finite browser deadlines for request-bound delivery and post-send logging. Exact-content uncertain delivery remains safely retryable through the existing provider idempotency key; once delivery is confirmed, uncertain logging requires refresh/review before another send. The complete `15`-check release contract passed in `351` seconds with zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `855` test files / `3,673` tests, and the credential-free `56`-page build. Aggregate `3253FED2D2F7113513EAC1E28D465D19E153FDCF1ABD8A63055BC071917D850E` binds `1,496` committed source files. Engineering is estimated at `99.8%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No email or production-sensitive action occurred. See `docs/STAFF_EMAIL_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Request Detail pastoral-detail reliability slice: primary implementation commit `d2b42ea76e726198e5296671e2e7cfc8d7da3a12` and source-bound head `45be97633a6d8f17cba2f08c0064a7cd0f086b38` give Funeral and Wedding detail saves the same finite confirmation boundary as the nine request-type schedule writes. Uncertain delivery or failed refresh freezes all reviewed request-type fields until staff refresh and review; entered details remain visible and no write is replayed. The corrected complete `15`-check release contract passed in `362` seconds with zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `854` test files / `3,668` tests, and the credential-free `56`-page build. Aggregate `9E70D7FB2CA8E5F8D9F1C907B0D045DD0A5EF1923A9F152F00ABCF136E55C1E7` binds `1,494` committed source files. Engineering is estimated at `99.7%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No production-sensitive action occurred. See `docs/REQUEST_DETAIL_PASTORAL_DETAILS_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Request Detail schedule reliability slice: primary implementation commit `995143bddf40d82b75f71e589858c35e4c1f0345` and source-bound head `883a41a956bf90450f0359d06460c72ffab43a99` give suggested-date and confirmed Baptism, Funeral, Wedding, and OCIA writes one shared 60-second confirmation boundary. An uncertain result or failed post-save refresh freezes all reviewed schedule fields until staff refresh and review; explicit rejections remain retryable, clear actions retain their visible value until confirmed, and no write is replayed. Focused coverage passed `11` files / `41` tests. After one fail-closed stale source-test correction, the complete `15`-check release contract passed in `361.7` seconds with zero secret findings across `2,879` text files, zero vulnerabilities, both TypeScript scopes, lint, `853` test files / `3,664` tests, and the credential-free `56`-page build. Aggregate `2842200303DAF7DBB29FB9320966831196714B9E2F748FBB919C8BBECB2DC5B7` binds `1,493` committed source files. Engineering is estimated at `99.6%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No production-sensitive action occurred. See `docs/REQUEST_DETAIL_SCHEDULE_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Request Detail notes/communication reliability slice: immutable implementation commit `b16b7b49eb1e7ac711df70362289dbbbcb31464e` bounds shared staff-notes and manual communication-log confirmation at 60 seconds. An uncertain result or failed post-save refresh freezes the reviewed controls until staff refresh and review; explicit rejections remain retryable, the known partial-success path cannot be casually duplicated, and no write is replayed. Focused coverage passed `6` files / `27` tests. After the integrity guard correctly rejected the preceding source identity and the current manifest was bound, the complete `15`-check release contract passed in `375.1` seconds with zero secret findings across `2,877` text files, zero vulnerabilities, both TypeScript scopes, lint, `852` test files / `3,658` tests, and the credential-free `56`-page build. Aggregate `F9C01CC3D009969FBFD29E35327A32EAE0776A2A6471A0D6DEB2F83E64CDDB8C` binds `1,492` committed source files. Engineering is estimated at `99.5%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No production-sensitive action occurred. See `docs/REQUEST_DETAIL_NOTES_COMMUNICATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Request Detail ownership/follow-up reliability slice: immutable implementation commit `e6f184b45104b2e23936bd37e07bb28c7b20b282` bounds assignment, waiting-on, follow-up date, and care-cadence shortcut confirmation at 60 seconds and makes request-refresh success explicit. An uncertain result freezes related controls until staff refresh and review; explicit rejections remain retryable and no write is replayed. Focused coverage passed `8` files / `44` tests, the source-bound suite passed `9` files / `50` tests, and the complete `15`-check release contract passed in `339.1` seconds with zero secret findings across `2,875` text files, zero vulnerabilities, both TypeScript scopes, lint, `851` test files / `3,653` tests, and the credential-free `56`-page build. Aggregate `2F18FF4EB0EAC4A4648A4728F89D3567E6325C878F2B332F161DEAA48EA1CE02` binds `1,491` committed source files. Engineering is estimated at `99.4%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No production-sensitive action occurred. See `docs/REQUEST_DETAIL_OWNERSHIP_FOLLOW_UP_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Request Detail reliability slice: immutable implementation commit `e87e6b863f0cbc7c1f5b19bacce442993fd5010b` bounds checklist, request-status, and workflow-step confirmation at 60 seconds. An uncertain result freezes those controls, including Mark complete, until staff refresh and review; explicit rejections remain retryable and no write is replayed. Focused coverage passed `7` files / `34` tests, the source-bound suite passed `8` files / `40` tests, and the complete `15`-check release contract passed in `393` seconds with zero secret findings across `2,870` text files, zero vulnerabilities, both TypeScript scopes, lint, `849` test files / `3,644` tests, and the credential-free `56`-page build. Aggregate `8F6585E9FC44F8601F22EABBFA2387F9CA6977DFD31A1981CF8CF39061569F84` binds `1,487` committed source files. Engineering is estimated at `99.3%`; rollout readiness remains `87.5%` because production-sensitive human gates and external evidence remain separate. No production-sensitive action occurred. See `docs/REQUEST_DETAIL_CORE_WORKFLOW_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Daily Work Hub reliability slice: immutable implementation commit `eba0ef498e77da53d4e4000b12323da76c7b47e8` bounds mark-as-contacted and care-touchpoint browser confirmation at 60 seconds. Any unconfirmed result freezes related staff-reviewed Work Hub mutations until refresh and request review; sequential batch marking stops at the first uncertain item and does not auto-retry. Focused coverage passed `6` files / `39` tests, the source-bound suite passed `7` files / `45` tests, and the isolated complete `15`-check release contract passed in `366` seconds with zero secret findings across `2,869` text files, zero vulnerabilities, both TypeScript scopes, lint, `848` test files / `3,638` tests, and the credential-free `56`-page build. Aggregate `4BF1F9F0A69FE8E3100D1EBB9546124EDD94FEDB3FAF5AB0B4426E438E6D68B5` binds `1,486` committed source files. Existing authentication, active-parish membership, same-parish ownership, persistence, partial-success guidance, audits, and provider behavior are unchanged. No mutation or production-sensitive action occurred. See `docs/DAILY_WORK_HUB_MUTATION_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe public-intake reliability slice: immutable implementation commit `602caf91024fe98af52ddd6769ab2da9a0a98d92` bounds primary request confirmation at 60 seconds and freezes all five public forms while unresolved. An uncertain result retains the same reviewed-payload attempt and gives duplicate-aware guidance instead of leaving a permanent spinner or silently changing recovery identity. Focused coverage passed `8` files / `39` tests, the source-bound suite passed `9` files / `45` tests, and the isolated complete `15`-check release contract passed in `327.1` seconds with zero secret findings across `2,867` text files, zero vulnerabilities, both TypeScript scopes, lint, `847` test files / `3,633` tests, and the credential-free `56`-page build. Aggregate `BED359B9A0E8F1489654E7CF428FA317D1041D6119B45B8B30C2D53C72D28E5C` binds `1,485` committed source files. Existing rate limiting, bounded parsing, routing gates, exact recovery checks, persistence, cleanup, privacy-safe messages, and post-success notification behavior are unchanged. No form submission or production-sensitive action occurred. See `docs/PUBLIC_INTAKE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe daily Intake reliability slice: immutable implementation commit `821c17db941bfdf7232ffeb6cd492876e58fe64c` bounds Request and Mass Intention quick-triage browser confirmation at 60 seconds. A lost response now freezes all Intake mutation controls until staff refresh and review instead of inviting a potentially duplicate write; unmount cancellation remains quiet and no auto-retry was added. Focused coverage passed `6` files / `28` tests, the source-bound suite passed `7` files / `34` tests, and the isolated complete `15`-check release contract passed in `379.9` seconds with zero secret findings across `2,866` text files, zero vulnerabilities, both TypeScript scopes, lint, `847` test files / `3,628` tests, and the credential-free `56`-page build. Aggregate `EC98887E46E0973173B69C3CEF8DFBB540CB330406E39582227A1E7E8AC9D7C4` binds `1,485` committed source files. Existing staff authentication, active-parish membership, same-parish ownership, checked persistence, partial-success guidance, audits, and API-only mutation paths remain unchanged. No Intake mutation or production-sensitive action occurred. See `docs/INTAKE_QUEUE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe public conversion reliability slice: immutable implementation commit `3f34153d99bcb90fe659fd08fadc4753aa034e18` bounds Schedule Demo browser confirmation at 20 seconds and freezes the reviewed form while unresolved. An uncertain result preserves the same-payload delivery attempt and gives duplicate-aware guidance instead of leaving an indefinite spinner or blindly assuming failure. Focused coverage passed `8` files / `32` tests, the source-bound suite passed `9` files / `38` tests, and the isolated complete `15`-check release contract passed in `350.8` seconds with zero secret findings across `2,864` text files, zero vulnerabilities, both TypeScript scopes, lint, `846` test files / `3,623` tests, and the credential-free `56`-page build. Aggregate `44988A2FE5E122391718249761BACAF6784FBEBF8F0CC22D0832E87553F19587` binds `1,484` committed source files. Existing origin, rate-limit, validation, provider-idempotency, provider-deadline, and success-acknowledgement boundaries are unchanged. No real send or production-sensitive action occurred. See `docs/DEMO_REQUEST_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe selected-parish admin reliability slice: immutable implementation commit `0f0af9cdd663b84e02d375e663ec70ae7f40223d` bounds the five current Settings reads at 15 seconds. Parish replacement and refresh still cancel obsolete generations quietly; current stalls now reach existing safe unavailable guidance across configuration, Staff Access, recent audit, public-intake metadata, and Workflow Templates. Focused coverage passed `8` files / `33` tests; the isolated complete release contract passed all `15` checks in `350.1` seconds with zero secret findings across `2,862` text files, zero vulnerabilities, both TypeScript scopes, lint, `845` test files / `3,617` tests, and the credential-free `56`-page build. Aggregate `096F00926A4F42AB5F3EF2DF757ED8EA22A7053465EB1D6EDC0044C99CBB8910` binds `1,483` committed source files. Existing authorization, response parsing, staff-reviewed mutations, and production gates are unchanged. No production-sensitive action occurred. See `docs/PARISH_SETTINGS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe Catholic office-workflow reliability slice: immutable implementation commit `be04005d922cb3d2a0876b366104ee85a1f3d447` restores configured priest suggestions on New and Edit Mass Intention forms by consuming the validated nested parish settings read model. Both optional reads now have 15-second deadlines; failure leaves free-text entry available, and Edit retains its assigned celebrant. Focused coverage passed `7` files / `34` tests; after one fail-closed environment-residue stop, the isolated complete release contract passed all `15` checks in `388.3` seconds with zero secret findings across `2,860` text files, zero vulnerabilities, both TypeScript scopes, lint, `844` test files / `3,612` tests, and the credential-free `56`-page build. Aggregate `C4B203E92F3A083BCC6D3E98719A0A5484C0A6AA86D1BB557CD3FDDB01882010` binds `1,482` committed source files. Existing staff authentication, active-parish membership scope, staff-reviewed saves, and production gates are unchanged. No production-sensitive action occurred. See `docs/MASS_INTENTION_PRIEST_DIRECTORY_CLIENT_READ_BOUNDARY_20260720.md`.

Latest safe Request Detail reliability slice: immutable implementation commit `6515b931bcc5ec1ee0bb0da6b3483b56788aff57` bounds both relationship-intelligence reads at 15 seconds without changing their API, active-parish/request scope, safe links, or staff-reviewed link/create actions. Obsolete request work remains quiet; a current stall reaches existing unavailable guidance and cannot leave mutation controls behind an indefinite unknown state. Focused coverage passed `6` files / `21` tests; the complete release contract passed all `15` checks in `358.8` seconds with zero secret findings across `2,858` text files, zero vulnerabilities, both TypeScript scopes, lint, `843` test files / `3,607` tests, and the credential-free `56`-page build. Aggregate `D7DE9F4F31FEE2C8393DDDACA5F073A86AD37C30A07AB38B000335BD2FB8121A` binds `1,481` committed source files. No production-sensitive action occurred. See `docs/REQUEST_RELATIONSHIP_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe analytics reliability slice: immutable implementation commit `1e7d0851965d33dff15a1615d0b59f94dc9e85c8` bounds the current selected-parish Reports summary read at 15 seconds without changing its API, active-parish header, safe response parser, arithmetic invariants, or partial-result guidance. Selected-parish replacement remains quiet; a current stall reaches the existing unavailable state. Focused coverage passed `5` files / `19` tests; the complete release contract passed all `15` checks in `321.9` seconds with zero secret findings across `2,856` text files, zero vulnerabilities, both TypeScript scopes, lint, `842` test files / `3,603` tests, and the credential-free `56`-page build. Aggregate `BF64664A9F75860CC2C25122E8B7137040DAED3BBA204E8D7A52549FE45E1B7B` binds `1,480` committed source files. No production-sensitive action occurred. See `docs/REPORTS_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe staff-search reliability slice: immutable implementation commit `95e3991c0f4b291af5dfb06370ceb3daed59ef6c` keeps compact Global Search debounce and adds a separate 15-second network deadline without changing its API, active-parish scope, safe read-model validation, or response/query agreement. A current stall reaches the existing unavailable state; replacement still cancels old work quietly. Focused coverage passed `5` files / `20` tests; the complete release contract passed all `15` checks in `339.2` seconds with zero secret findings across `2,854` text files, zero vulnerabilities, both TypeScript scopes, lint, `841` test files / `3,599` tests, and the credential-free `56`-page build. Aggregate `8DE4BB9673747C4FBD7836109A0B2787047B879201BB08FFA57D5F8E1B234B87` binds `1,479` committed source files. No production-sensitive action occurred. See `docs/GLOBAL_SEARCH_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe daily-operations reliability slice: immutable implementation commit `835e7004d982d6137ffa7f0c4ce82f4dc5924d67` bounds Notifications Center reads at 15 seconds without changing its API, active-parish scope, safe read-model validation, or latest-request ownership. A current stall reaches the existing retryable state; replacement and selected-parish remount still cancel old work. Focused coverage passed `5` files / `19` tests; the complete release contract passed all `15` checks in `384.2` seconds with zero secret findings across `2,852` text files, zero vulnerabilities, both TypeScript scopes, lint, `840` test files / `3,595` tests, and the credential-free `56`-page build. Aggregate `76390841AFD500F790D4A0246BF063D5705F0C951F016F51CF462735B84209B9` binds `1,478` committed source files. No production-sensitive action occurred. See `docs/NOTIFICATIONS_CENTER_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe governance-read reliability slice: immutable implementation commit `0c1b5341ed7df10772f564e79f53a1689cd20348` gives Audit Log reads a 15-second deadline plus immediate cancellation on replacement, filter change, and unmount. Existing last-request-wins guards remain, so stale rows and loading completion cannot settle beneath a newer filter. Focused coverage passed `5` files / `18` tests; the complete release contract passed all `15` checks in `382.1` seconds with zero secret findings across `2,850` text files, zero vulnerabilities, both TypeScript scopes, lint, `839` test files / `3,592` tests, and the credential-free `56`-page build. Aggregate `7FAF507FAAAA75BC8292643FB87A50092BB08B65BE28028DBBCDCD8AC5D7338F` binds `1,477` committed source files. The surface remains read-only and selected-parish scoped; no production-sensitive action occurred. See `docs/AUDIT_LOG_CLIENT_READ_DEADLINE_BOUNDARY_20260720.md`.

Latest safe staff-auth reliability slice: immutable implementation commit `d73c08f9ed9ed730696271824bd60aebf9e2c8f5` bounds password sign-in confirmation at 30 seconds and current-browser sign-out confirmation at 15 seconds. An uncertain timeout releases the UI lock but requires refresh before retry; it never replays or assumes success. Existing safe errors, hardened post-login destination, local-scope logout, staff authorization, session policy, and production gates remain authoritative. Focused coverage passed `5` files / `23` tests; after one fail-closed evidence-label correction, the complete release contract passed with zero secret findings across `2,848` text files, zero vulnerabilities, both TypeScript scopes, lint, `838` test files / `3,589` tests, and the credential-free `56`-page build. Aggregate `054AAF1150A12148E3BC886A87E574B9E88432CCAD585764A8FEACDC995FB19B` binds `1,476` committed source files. No real auth/provider or production action occurred; see `docs/STAFF_AUTH_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720.md`.

Latest safe release-integrity slice: immutable implementation commit `a30b47762eb4ad01ff2710004921227134a767a5` adds a tracked-head release manifest that binds the exact committed source tree directly, without copying the repository or including unrelated untracked workspace source. Fail-closed parsing covers unknown modes and malformed Git batch data; focused coverage passed `1` file / `6` tests and the complete `15`-check release contract passed with zero secret findings across `2,845` text files, zero vulnerabilities, both TypeScript scopes, lint, `837` test files / `3,582` tests, and the credential-free `56`-page build. Aggregate `B3BBE5B194CF01E4A1D1662F40B5508E4BACFEE2DDE60316241BE69810C5B71E` binds `1,474` committed release-source files; the ordinary dirty-worktree aggregate remains separate. No production-sensitive action occurred; see `docs/RELEASE_SOURCE_TRACKED_HEAD_MANIFEST_BOUNDARY_20260720.md`.

Latest safe document-security slice: implementation commit `39d239838bafbeca34ec90afc9a8ef82016327f8` makes staff and family request-document uploads enforce one server-owned PDF/JPEG/PNG allowlist using filename extension, declared MIME, and leading file signature before storage. Canonical MIME values replace browser claims, both pickers advertise the same formats, and staff signed access is attachment-only with a sanitized download name. Focused coverage passed `10` files / `59` tests; the complete `15`-check local release contract passed with zero secret findings across `2,844` text files, zero vulnerabilities, both TypeScript scopes, lint, `837` test files / `3,580` tests, and the credential-free `56`-page build. Clean-checkout aggregate `BE71462D763C8026548286A756616F9287F94BF2FA1CECA5EA981ADCD9EF437C` binds `1,474` tracked source files. This does not claim malware scanning or retroactive validation of existing objects. Production, storage, migrations, operational RLS, and sensitive gates were untouched; see `docs/REQUEST_DOCUMENT_CONTENT_SAFETY_BOUNDARY_20260720.md`.

Latest safe membership-primary request access hardening: implementation commit `ae00ccec89b24a30862dbb84c5b41c1fd6a4da8d` makes request detail and document access use authenticated primary parish membership when staff have no active-parish cookie, before considering the isolated legacy global-primary compatibility path. Membership-resolution errors fail closed, and existing request ownership checks remain authoritative. Focused coverage passed 5 files / 25 tests; the complete 15-check local release contract passed with zero secret findings across 2,842 text files, zero vulnerabilities, all evidence gates, both TypeScript scopes, lint, 836 test files / 3,566 tests, and the credential-free 56-page build. Source-guard commit `3d76cc7c26828294f844e903a8b04fcddddc6f90` reached a non-production `READY` deployment; authenticated Preview health remains pending behind Vercel Authentication, and PR checks await GitHub write access. No migration, operational RLS, production, provider, storage, or data action occurred. Evidence: `docs/REQUEST_ACCESS_MEMBERSHIP_PRIMARY_FALLBACK_HARDENING_20260720.md`.

Latest safe release-integrity slice: implementation commit `f3a7747f0dcddda8362e00f1e27a573694933d8b` makes repository verification distinguish local generated/private artifacts from release candidates without weakening secret detection. Root `.tmp/` is ignored by Git and ESLint, raw `docs/sales/VINEA_MAILBOX_SNAPSHOT_*.json` exports are local-only, and both the secret scanner and release-source manifest own a 64 MiB Git-output buffer. This corrected an observed pre-scan `ENOBUFS` failure and preserved fail-closed JWT detection. The complete 15-check local release contract then passed with zero secret findings across 2,840 text files, zero dependency vulnerabilities, all evidence gates, both TypeScript scopes, lint, 835 test files / 3,559 tests, and the credential-free Next.js 16 56-page build. Focused scanner/manifest coverage passed 2 files / 8 tests; AI/operator-context coverage passed 2 files / 4 tests; development aggregate `BDF5CD4F1326CBFA86B6FCDC32B7AE0E4FE7A1A6CD3C7B7267756F3B65BB31DC` binds 1,477 release-source files. Production rollout, production-sensitive gates, providers, data, and private mailbox content were not accessed or changed. Evidence: `docs/REPOSITORY_RELEASE_ARTIFACT_BOUNDARY_20260720.md`.

Latest controlled-rollout approval-readiness milestone: all `26` required non-secret intake fields and `7` availability/scope confirmations are now product-owner confirmed. The mechanical intake gate returns `READY_FOR_EXPLICIT_APPROVAL`, and `docs/CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md` binds the fixed release identity, owners, read-only fixtures, exact July 15 window, smoke scope, rollback target, monitoring, and every prohibited capability. Production approval is still `NO`; the next priority is a separate intentional product-owner instruction using that exact prompt, followed only then by unchanged-target preflight and the bounded rollout. No deployment, production access, migration, flag, smoke, or separately locked capability was authorized by this milestone.

Prior controlled-rollout intake milestone: the remaining human release inputs received one repository-owned worksheet and mechanical gate. `docs/CONTROLLED_PRODUCTION_ROLLOUT_HUMAN_INTAKE_20260714.md` captures label-only owners, channels, read-only production-safe fixtures, an exact low-traffic window, rollback observation, and scope confirmations; `scripts/check-controlled-production-rollout-intake.mjs` binds the merged SHA plus candidate/rollback deployments and rejects credential-like content without printing entered values. Its initial decision was intentionally `NO_GO_MISSING_HUMAN_INPUT`; the newer approval-readiness milestone above supersedes that initial result. Neither milestone authorizes promotion, production smoke, migrations, flags, or any separately locked production capability.

Latest controlled-rollout milestone: exact release head `f134b598308ddd78b5b6b81ee447bf5b1fb15937` is merged to `main`. Vercel's automatic production build completed before cancellation, so the approved control-plane correction restored production aliases to prior production-served deployment `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` at commit `c52d947b0f70ad01c8dc6920ad49979ca17d25d2`; no production application/data access or smoke occurred. `docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md` is now the next release gate. It requires named owners, production-safe fixtures, an exact window, production environment/schema readiness, separately approved health/staff smoke, monitoring/support coverage, and exact promotion/rollback authorization. The base rollout and every production-sensitive capability remain `NO-GO` until their explicit gates are satisfied.

Latest release-candidate rollout evidence and repair: immutable follow-up commit `19b601df046de06a6a52f214e24adcdeba05b577` aligned health with Vinea's established trusted Vercel-origin policy and preserved fail-closed exact-HTTPS parsing. The complete 15-check local gate passed with `832` files / `3,546` tests and a credential-free `56`-page build. GitHub Actions run `29207351611` passed against evidence head `d3daf3faa6ea3fc2f3d5de27dfb9e577cf3c6044`; exact-head Preview deployment `dpl_DCLZ9b1vthZmGfvKZUKQLnwLYZP2` is `READY`, runtime health returned `200`, and authenticated active-parish, Onboarding, Imports, duplicate-review, Communications, and console smoke passed without writes. Next priority is human PR review and an explicit merge decision. Production deployment, production RLS, monitoring, exports, public-intake routing, customer-facing AI, and public trust claims remain separately gated.

Latest safe Communications Center recovery slice: touchpoint and follow-up writes now stop waiting after 60 seconds. Any unconfirmed result freezes mutation controls until staff refresh Communications and review the request, and no automatic replay was added. The complete release gate passed with 832 files/3,544 tests and a credential-free 56-page build against aggregate `F9ED8FAC6AEAE72B94DD4F4CEDA513DED3A7C46D16EA353E7A020D33C73EA188`. Existing active-parish/request authorization, staff review, safe messages, audits, migrations, and RLS remain unchanged; live rollout evidence remains pending.

Latest safe duplicate-review recovery slice: People and Household candidate reads now stop waiting after 20 seconds, while merge confirmation stops after 120 seconds. Any unconfirmed merge forces staff to refresh duplicate review before trying again, and no automatic replay was added. The complete release gate passed with 831 files/3,540 tests and a credential-free 56-page build against aggregate `1DA7F37F606026BC8486F84484F9EC23B9B570B07E5677BBC30133B679EBDFD1`. Existing confirmation, single-flight locking, active-parish scope, checked persistence, compensation guidance, audits, migrations, and RLS remain unchanged; live rollout evidence remains pending.

Latest safe onboarding recovery slice: the Daily Work Hub setup card and full Onboarding page now stop waiting after 15 seconds for selected-parish settings/staff readiness. Superseded loads remain quiet, but a genuine timeout reaches the existing retry state instead of rendering a false empty checklist. The complete release gate passed with 830 files/3,534 tests and a credential-free 56-page build against aggregate `C043395367C0CFD8D8C5146AC6F3F929D25BE9D5FE3FA2653C3BBF8C6C08F4B2`. Existing latest-response guards, active-parish authorization, readiness calculations, completion writes, migrations, and RLS remain unchanged; live rollout evidence remains pending.

Latest safe data-import recovery slice: Recent imports refresh, preview, and reviewed commit confirmation now have 15-second, 30-second, and 120-second browser deadlines. An unconfirmed commit remains blocked behind confirm-before-retry guidance and no automatic replay was added. The complete release gate passed with 829 files/3,528 tests and a credential-free 56-page build against aggregate `0CB1CAFF043A1D4D382B6AA9220D93824DB811F6864DBEA6D1536547F78514E8`. Existing single-flight locking, reviewed snapshots, active-parish API scope, authorization, partial-success handling, audits, migrations, and RLS remain unchanged; this is not durable import idempotency or live rollout evidence.

Latest safe family-document recovery slice: the family portal upload form now takes a synchronous single-flight lock, freezes reviewed inputs, rejects files over the existing 10 MB limit before multipart construction, and stops waiting after 60 seconds. An uncertain completion tells the family to contact the parish office before trying again so the same document is not duplicated. The complete release gate passed with 828 files/3,525 tests and a credential-free 56-page build against aggregate `D65A37DF88E420CF5516CD3C3F62585EC96739CF1B987FF529F97CAE1BDD3B18`. Existing origin checks, durable limiting, token/step authorization, server validation, private storage, cleanup, and audits remain unchanged; this is not durable server idempotency or live rollout evidence.

Latest safe staff-document recovery slice: Request Detail document reads are now latest-request-wins, abort superseded work, require response request-id agreement, and remount per route id. List/download preparation, review, portal-link creation, and upload now have operation-appropriate browser deadlines. Unconfirmed writes tell staff to refresh or inspect the Audit Log before retrying, while confirmed upload/review guidance remains visible through the scoped refresh. The complete release gate passed with 827 files/3,520 tests and a credential-free 56-page build against aggregate `5570BD979CC595BFFBE6837C021C29F69EC9E8EABA4F1A3942F0169535BD7695`. Server authentication, active-parish ownership, private storage, signed URLs, token hashing, audits, and cleanup are unchanged; this is not durable server idempotency and live preview timing remains unverified.

Latest safe integration-transport slice: commit `21fb3d4a0d26b4881a9ab936793a032ca64633fa` makes Google Calendar clients bound hidden refresh-token traffic, while the staff-authenticated OAuth callback bounds code exchange and optional profile lookup at 15 seconds. Signed state, selected-parish membership, redirect handling, refresh-token requirements, and integration persistence are unchanged. Calendar/OAuth regression passed 36 files/139 tests, then the complete release gate passed with 822 files/3,504 tests, both TypeScript scopes, lint, build, and zero security findings; aggregate `A8653C9DB5FCF3259B8F8A3E0031F59D41F8C2136D7BECAB13F547FBA0E65E5B` covers 1,457 release files. No Google or production action occurred; live transport behavior remains rollout-unverified.

Latest safe integration-reliability slice: immutable commit `74dc786b1489f37d83082d68aa12bfdf75fae37f` makes Google Calendar create use one opaque deterministic event id per authorized selected parish/request, ignore only that id during conflict scanning, and recover an ambiguous prior create only after exact id/title/time verification. All Calendar list/create/recovery/update/delete calls now have a 15-second provider deadline. The complete Calendar slice passed 34 files/128 tests, then the 15-check release gate passed with 822 files/3,503 tests, both TypeScript scopes, lint, a 56-page build, zero vulnerabilities, and zero secret findings. Source aggregate `EEE8DAD194D70650341FD4643019DBF530AFA856E1DDA897D78DC69FD61124B3` covers 1,457 files. Engineering is estimated at 99.2%; rollout readiness remains 87.5% because live synthetic provider recovery and protected-preview smoke remain pending. No production or provider action occurred.

Latest safe public-intake success-settlement slice: confirmed stored intake now settles success immediately on all five family forms while the unchanged staff-notification payload runs through one deferred 15-second client boundary. Notification failure remains silent to the family and label-only in non-production logs; no server recipient, provider, routing, RLS, schema, or audit behavior changed. Focused and full intake regressions passed, followed by the complete 15-check release gate with 826 files / 3,515 tests and the credential-free 56-page build against aggregate `A5402654EC53812A0737A940514BD9A287D7F510819852CA7854984C9311E1D7`. This prevents a secondary alert stall from making a completed pastoral request look unfinished, without claiming durable notification jobs or live browser evidence.

Latest safe public-intake retry slice: commit `ca7412d1d64b21841bac7018eae7054ea25311d4` makes one unchanged browser-reviewed payload reuse an in-memory UUID request identity after an uncertain response. Recovery remains behind durable rate limiting and resolved parish scope, requires exact request/parish/contact identity plus the completed-intake audit marker, and refuses partial or mismatched rows generically. Public-intake coverage passed 47 files/235 tests and the complete 15-check local gate passed against aggregate `B492D2C542EC7CBE53EA3A28A0BFCD1CE031AF505739579535BA99E763F95D32`. This closes the ordinary same-page response-loss duplicate path without claiming cross-tab concurrency, transactional writes, live rollout evidence, or changing routing flags, migrations, operational RLS, or providers.

Latest safe public-intake reliability slice: commit `10dd6087e473d7137014114daa37522bfd0ec598` bounds post-intake staff-notification provider confirmation at 12 seconds and derives an opaque duplicate-suppression key only after durable rate limiting and verified parish/request ownership. Saved intake success remains independent from notification delivery. Focused tests, the full 15-check local gate, GitHub Actions run `29183226227`, and matching non-production Vercel preview `dpl_G2crVJhDNzszskvU3mmN63JdrhfG` passed. Aggregate `BB1E62201692E4A2505A49C8C598A2097B40DDBCA11213EBCB25C0E1652F0333` binds 1,445 files. Engineering is estimated at 98.7% and rollout readiness at 87.5%; no production or provider action occurred.

Latest safe staff-UX resilience slice: commit `90ee398d2e141f56c033000adfc479bcdc35b15b` refines the existing shared App Router recovery surface with explicit uncertain-mutation guidance, shared Vinea controls, and Daily Work Hub language without replacing the established wrappers or loading skeleton. Focused recovery tests, the full 15-check local gate, GitHub Actions run `29182688833`, and matching non-production Vercel preview `dpl_B3SGHD8GMAF57ijBjUhzL3Ggtyq9` passed. Aggregate `FBCC65B8C4F462BB547CA7A196692D7D7817325D3C96FF80D7A050C30F8A6433` binds 1,442 files. Engineering is estimated at 98.6% and rollout readiness at 87.5%; production and human-review gates remain closed.

Latest safe runtime-readiness slice: commit `1226c2307a8b9c9c3e5b4bb5d96e4a63a5cc542f` bounds request-bound staff email provider confirmation at 12 seconds and gives exact-content retries an opaque Resend idempotency key. Request Detail and Daily Work Hub now distinguish unconfirmed delivery from definitive failure and retain the same attempt only while request, subject, and body remain unchanged. After one intentional fail-closed source-guard correction, the full 15-check local gate, GitHub Actions run `29182048877`, and matching non-production Vercel preview `dpl_9NzTgLYaRpdn4s3kek91pkb9t1CF` passed. Aggregate `81CA2DBABFC9BCF11B7AAAC7865DE911E8D07163D8555F4CD1E827B84B48F4CB` binds 1,442 files. Engineering is estimated at 98.5% and rollout readiness at 87.5%; no real email or production action occurred.

Latest safe runtime-readiness slice: commit `cc2f1f89366f2cd40d51d2b1304a643094a269f4` bounds the Daily Work Hub and Request Detail browser loads at 15 seconds. Initial stalls settle into calm retry guidance, silent Work Hub refresh failures preserve confirmed data, and stale Request Detail cancellation remains invisible. The full 15-check local gate, GitHub Actions run `29181224162`, and matching non-production Vercel preview `dpl_EU22dttRps6PdEHNVKSKVVLqEFYU` passed. Source aggregate `4B7FC56DA9280E8BB1D95F9C0A96E9662413C72971A1FD4A898DCF388480E42A` binds 1,439 files. Engineering is estimated at 98.4% and rollout readiness at 87.5%; merge and all production-sensitive gates remain unapproved.

Latest safe runtime-readiness slice: commit `1f8155f65885244bc511c0ac3692a340421c592c` bounds the public health probe's complete Supabase database/schema phase with one shared eight-second abort signal. Upstream stalls now fail health safely and promptly while production failure details remain redacted. Focused health/manifest coverage, the full 15-check local gate, GitHub Actions run `29180435998`, and matching non-production Vercel preview `dpl_H9awFsMtrSZRouoepkUeo4ucjgJY` all passed. Source aggregate `C8B08F87AE5ED34D6B097F33B2F67F7ABBEC80D8C8349918081E17DB8CA9A709` binds 1,439 files. Merge, production access, migrations, operational RLS, monitoring, exports, routing, AI, and public claims remain unapproved.

Latest safe release-integrity slice: commit `e6ec46541ea1eeb3a84a8530e97454147e2af28a` closes local/CI policy drift by adding repository secret scanning, dependency security, and completed-evidence validation to the one-command local runner. The shared contract now requires 15 local checks and 16 CI commands, with CI's clean `npm ci` as the only intentional difference. The complete local gate passed in 299.9 seconds after first failing closed on and correcting one stale test expectation; source aggregate `B9511A0D7CA4E38ADC0D46171382448B8A10FC45E53FF846020667C621E92FD0` binds 1,439 files. GitHub Actions run `29179833235` passed against the exact commit, and non-production Vercel preview `dpl_HEPmAhSzomhL6c7iiHjXokgHCd26` is `READY`. Merge and production-sensitive capabilities remain unapproved.

Latest safe release-integrity slice: commit `037c5c964cb233ed6305dd3393cb9907d050286b` strengthens the local release runner so its final Next.js build cannot consume Supabase, OpenAI, Resend, Google OAuth, cron, or staff-allowlist credentials from the parent process or `.env.local`. The full 12-command local gate passed in 301.5 seconds, including all evidence checks, both TypeScript scopes, full lint, the complete test suite, repository secret scanning, and a credential-free 56-page Next.js 16.2.10 build. The release-source aggregate is now `4865365E244756008022788AD375698900390857D1138899A6F3132A2AF24A95` across 1,439 files. GitHub Actions run `29178995424` passed all 22 steps against the exact commit, and matching non-production Vercel preview `dpl_DocXHSgUah5T87sC5KmoCUz2tidL` is `READY`; merge and production remain unapproved.

Latest completed release-integrity milestone: the mechanically reviewed release source is bound to `codex/release-candidate-20260711` commit `495cb1dda70a039116927f89b818ffe0a195ee2a` and aggregate `07E172B228A7E055038454DE785178C0FF42D218A1BF4F94D3A0B2F29E44083B`; 57 sales, CSV, generated, binary, temporary, and unrelated artifacts remain excluded. GitHub Actions run `29178125486` passed all 809 test files/3,441 tests, both TypeScript scopes, evidence gates, full lint, secret/dependency checks, and the credential-free Next.js 16.2.10 build. Matching Vercel preview `dpl_CmCcXTYqyz8D55w3KgA2ZkwB6wbu` is `READY` and non-production.

Next release-integrity step: obtain or use an approved authenticated preview-access path to verify `/api/health` and complete isolated staff/browser smoke, then open human review for the release-candidate branch. Vercel Deployment Protection currently returns an SSO redirect and must not be weakened merely to create evidence. Production cutover and every production-sensitive capability remain separately gated.

Latest completed release-evidence slice: a process-clean execution of the complete 12-command local release runner passed all evidence gates, both TypeScript scopes, lint, 806 test files/3,429 tests, and the Next.js 16.2.10 build. Secret scanning and the live dependency audit had zero findings. Production-sensitive gates remain locked and human approval boundaries remain authoritative.

Latest completed production RLS readiness slice: engineering approval now binds the membership-aware forward and rollback SQL hashes, while QA formally accepts the disposable and shared-QA evidence with production smoke still mandatory. The candidate may advance to final human go/no-go review, but product/security owners, production operators, safe fixtures, immutable commit/window, monitoring/support, and explicit approval remain hard NO-GO gates.

Latest completed form-safety slice: every App Router form with a client `onSubmit` handler now declares POST as its native fallback, preventing slow/pre-hydration submissions from placing entered fields in URLs. A repository-wide TypeScript-AST guard enforces the boundary for future forms; normal hydrated behavior and all production-sensitive gates remain unchanged.

Latest completed authentication hardening slice: `proxy.ts` now authorizes database-backed dashboard staff through the authenticated active-membership set rather than `primary_parish_id()`, remains service-role-free, preserves allowlist/development/redirect contracts, and fails closed on production lookup errors. Shared-QA-backed browser evidence confirms health, signed-out redirect, active staff admission, and selected Parish A/Parish B switching. Login submission is also hydration-gated and POST-fallback-safe. Production rollout remains gated pending named owners, immutable release-candidate binding, production-safe fixtures, and explicit approval.

Latest completed Workflow Template tenant-integrity slice: the editor is now explicitly active-parish reactive, validates server-resolved parish agreement and strict template/step read models, cancels obsolete reads, clears old-parish drafts, and ignores save responses after the staff member switches parish. Existing authenticated write semantics remain unchanged.

Latest completed Settings transport-integrity slice: all four Settings GET surfaces now require privacy-minimized validated projections before rendering, including selected-parish identifier agreement and explicit exclusion of staff timestamps, token hashes, raw token material, and unrelated response fields. Existing authenticated APIs and staff-reviewed mutations remain unchanged.

Latest completed Settings reliability slice: parish configuration, Staff Access, recent audit history, and public-intake routing now refresh in parallel under independent abortable generations, so an older parish or refresh cannot settle over current selected-parish state. Existing authenticated APIs and staff-reviewed mutations remain unchanged.

Latest completed reporting reliability slice: selected-parish Reports loads now abort outgoing work and require a fully validated operational summary, including consistent request arithmetic, parish insights, workload counts, warnings, and curated failure contracts. Reports remain read-only and server authorization is unchanged.

Latest completed staff-search reliability slice: compact Global Search now aborts superseded queries, validates every grouped result and dashboard-internal destination, and renders only responses matching the current query. Authentication, selected-parish server scope, and read-only behavior remain unchanged.

Latest completed onboarding reliability slice: the dashboard setup card and full Onboarding page now share validated, privacy-minimized readiness inputs and abortable latest-request-wins loads. Failed Staff Access evidence is shown as unavailable rather than inaccurately interpreted as zero staff; selected-parish APIs and completion behavior remain unchanged.

Latest completed staff-shell reliability slice: Notifications Center initial and open-panel refreshes now share an abortable latest-request-wins boundary, validate safe dashboard-only read-model fields before rendering, and prevent stale counts or rows from settling after newer selected-parish work. The panel remains read-only and production-sensitive boundaries are unchanged.

Latest completed data-onboarding integrity slice: Data Imports now commits the exact copied snapshot staff previewed, freezes reviewed inputs through file/preview/commit work, blocks blind retries after partial or unconfirmed persistence, and applies only the newest abortable selected-parish history response. Existing authorization, migrations, operational RLS, and production gates remain unchanged.

Latest completed core parish-record integrity slice: People, Household, and Sacramental Record shared forms keep the full reviewed snapshot stable through persistence, including household member roles and Catholic register references.

Latest completed Catholic-office workflow integrity slice: Mass Intention create/edit keep every reviewed field stable through persistence, preventing the visible form from drifting away from the snapshot sent to the selected-parish Server Action.

Latest completed duplicate-review reliability slice: People and Household candidate discovery can no longer compete with destructive merge, and uncertain or stale post-merge state blocks another merge until staff complete a successful fresh scan.

Latest completed relationship-intelligence reliability slice: Suggested connections now provides an explicit unavailable state and abortable selected-parish reads, preventing failed verification from masquerading as no suggestions or an endless loading state.

Latest completed request-to-People continuity slice: the Request Detail People-directory handoff now fails closed when relationship status cannot be verified, preventing an unavailable lookup from encouraging duplicate profile creation; staff actions are also mutually exclusive and retain honest post-persistence refresh guidance.

Latest completed Request Detail reliability slice: overlapping full workspace reads now cancel the older browser request and only the current load can settle visible state, preserving the authorization-first parallel read wave and existing partial-data behavior for genuine failures.

Latest completed production-readiness slice: revalidated Daily Work Hub mark-as-contacted and funeral care-touchpoint persistence behind authenticated active-parish request APIs, and added explicit missing-selected-parish fail-closed regression coverage. No runtime behavior, production access, migration, operational RLS, communication delivery, or sensitive flag changed.

Latest safe governance freshness slice: Audit Log and Export Audit Reviewer filter changes immediately invalidate older reads, and only the newest response can render evidence rows or settle loading.

Latest safe Daily Work Hub freshness slice: aggregate refreshes now apply only the newest response, preventing a slower stale same-parish refresh from replacing newer work or clearing its loading state.

Latest safe Request Detail loading UX slice: the high-frequency staff workspace now holds a stable header/tabs/content/sidebar skeleton while authorized data loads, preserving accessible busy semantics without adding controls or changing runtime data boundaries.

Latest safe Request Detail performance slice: authorization remains first, then five independent active-parish support reads fan out in one parallel wave with unchanged partial-data fallbacks. The load boundary now also exits safely after unexpected network/composition failure instead of leaving staff on an indefinite spinner.

Latest safe onboarding integrity slice: readiness-gated completion now has immediate duplicate exclusion and temporarily holds same-screen setup navigation through selected-parish persistence/refresh. Production go-live approval and durable idempotency remain separate reviewed work.

Latest safe Parish Settings integrity slice: configuration save and staff-confirmed manual Daily Brief delivery now mutually exclude each other and freeze the reviewed recipient/configuration snapshot through settlement. Durable idempotency and concurrent-version conflict handling remain separate reviewed work.

Latest safe Workflow Template Settings integrity slice: selected-parish step saves now use immediate cross-step exclusion and freeze the reviewed editor through persistence. Durable idempotency and concurrent-version conflict handling remain separate reviewed work.

Latest safe public-intake administration integrity slice: metadata, domain verification/lifecycle, and token lifecycle actions now share immediate exclusion before the selected-parish admin API, while one-time token display remains selectable. Runtime public routing remains disabled; durable idempotency stays separate reviewed work.

Latest safe outbound Daily Brief integrity slice: staff-confirmed manual delivery now has immediate duplicate exclusion and a modal sending state before the existing selected-parish route. Durable/provider idempotency remains separate reviewed work; scheduling and production-sensitive boundaries are unchanged.

Latest safe daily-queue integrity slice: Communication Center and Intake staff-reviewed mutations now have immediate per-surface exclusion before existing active-parish APIs, with frozen forms and `finally` recovery. Durable idempotency and transactional persistence remain separate reviewed work.

Latest safe Daily Work Hub request-write integrity slice: mark-as-contacted and funeral care-touchpoint persistence remain exclusively behind authenticated selected-parish request APIs, with exact membership/request ownership and structured partial results. Immediate individual/batch and care-touchpoint locks now prevent same-screen duplicate dispatch; durable idempotency and transactional multi-write persistence remain separate reviewed work.

Latest safe Google Calendar integrity slice: Request Detail create, conflict override, update, and delete now share one immediate mutation lock before selected-parish Calendar routes, preventing same-screen competing provider operations. Durable provider idempotency and cross-system transactionality remain separate reviewed work.

Latest safe outbound-email integrity slice: Request Detail and Daily Work Hub follow-up sends now prevent immediate duplicate provider dispatch while preserving request-bound authorization, staff-reviewed content, transport confirmation, communication logging, and partial-success semantics. Durable/provider idempotency remains separate reviewed work.

Latest safe request-workflow integrity slice: checklist and workflow-step actions now prevent same-page cross-row races, expose row-specific progress, and distinguish persistence from refresh outcomes. Durable idempotency and automation remain separate reviewed work.

Latest safe request-header integrity slice: status, Waiting On save/clear, and multi-type intake-detail edits now have immediate same-page exclusion and honest persistence-versus-refresh guidance. Database transactionality and durable replay protection remain separate reviewed work.

Latest safe workflow integrity slice: staff-applied Workflow Playbook checklist insertion now has immediate same-page exclusion and safe retry while preserving selected-parish action authority. A database-level uniqueness or transactional strategy remains separately reviewed future work.

Latest safe Request Detail operational integrity slice: notes, assignment, follow-up save/clear, and care-cadence acceptance now prevent same-page competing writes while preserving staff review and selected-parish Server Action authority. Durable idempotency and automation remain separate gated work.

Latest safe request-document integrity slice: staff document upload/review and family upload-link creation now share one immediate browser mutation lock and one visible busy boundary, preventing cross-control races while keeping signed document viewing independent. Durable idempotency and storage/database transactionality remain separate reviewed work.

Latest safe core-data edit integrity slice: core edit pages now prevent same-page competing writes, with one shared Household operation lock and guarded multi-step Sacramental Record updates. Existing partial-success guidance remains explicit; durable idempotency and cross-write transactions remain separate reviewed work.

Latest safe core-data integrity slice: the four core create workflows now prevent same-page duplicate dispatch before React renders their pending state, retain safe retry after failures, and remain pending through successful detail navigation. Durable server idempotency and edit-form hardening remain separate future work.

Latest safe staff-auth reliability slice: staff password sign-in now has an immediate browser single-flight boundary before the provider call, with retry release after failures and the existing hardened redirect after success. Authentication policy, authorization, production, migrations, operational RLS, and the approval-gated proxy remain unchanged.

Latest safe sales-conversion reliability slice: Schedule Demo now prevents same-page rapid duplicate submission with a synchronous browser in-flight lock while retaining visible busy feedback and retry release. Durable cross-tab/server idempotency remains a separately reviewed persistence decision; provider behavior and production-sensitive boundaries remain unchanged.

Last Updated: 2026-07-11

Strategic source: `deep-research-report.md`, current codebase, Supabase migrations, and existing Vinea docs.

Latest safe public-intake reliability slice: all five core forms now acquire a synchronous same-page submission lock before request creation, closing the rapid-tap window before React paints their existing disabled state. Validation, payloads, durable rate limits, cleanup, notification behavior, runtime parish routing, production gates, migrations, and operational RLS remain unchanged; the boundary is explicitly not represented as durable server idempotency.

Latest safe authenticated-shell coordination slice: logout and active-parish switching are now mutually exclusive at both the synchronous guard and responsive-control layers. Neither current-session exit nor the membership-checked parish Server Action can start while the other is active; operation-specific progress and recovery remain intact; and authentication policy, membership authorization, cookie behavior, production gates, migrations, and operational RLS remain unchanged.

Latest safe source-guard reliability slice: the Request Detail explicit-`any` regression guard now uses the TypeScript AST instead of rejecting the word `any` inside ordinary staff-facing prose. Real `AnyKeyword` annotations and assertions still fail, while natural-language Calendar guidance remains valid; runtime behavior, authorization, production gates, migrations, and operational RLS remain unchanged.

Latest safe selected-parish shell reliability slice: active-parish switching now acquires a synchronous single-flight guard before the existing membership-checked Server Action. Both responsive selectors expose pending busy semantics; old-parish sensitive tools remain hidden until confirmation; failure still restores the previously confirmed parish; and membership authorization, HTTP-only cookie behavior, production gates, migrations, and operational RLS remain unchanged.

Latest safe authenticated-shell reliability slice: dashboard logout now has a synchronous single-flight guard before the existing current-session-only Supabase Auth call. Both responsive controls expose `Signing out...`, disabled, and `aria-busy` states; failures retain curated retry guidance, while session scope, redirect behavior, authentication policy, production gates, migrations, and operational RLS remain unchanged.

Latest safe parish-administration reliability slice: new Staff Access additions plus role and activation changes now share one client-side single-flight guard before the existing selected-parish API call. Additions report `Adding...`, affected rows report `Updating...`, competing controls are disabled until `finally`, and authentication, admin authorization, self-deactivation protection, final-active-admin protection, persistence, production gates, migrations, and operational RLS remain server-owned and unchanged.

Latest safe shared-interaction polish slice: the accessible confirmation dialog now uses action-specific progress language instead of hard-coding duplicate-merge wording. People and Household merges retain `Merging...`, Request Detail template replacement uses `Replacing...`, and future callers receive a neutral `Working...` default. Focus containment, cancellation, authorization, persistence, production gates, migrations, operational RLS, providers, and sensitive behavior remain unchanged.

Latest safe Catholic-records UX and production-readiness slice: staff-triggered Baptism certificate generation now requires the shared accessible confirmation dialog. It states that the PDF uses current record values and logs certificate activity, requires register review, and explicitly excludes sacramental eligibility and canonical decision-making; confirmed dispatch still uses the existing active-parish Baptism-only route. Production, records, migrations, operational RLS, providers, and sensitive gates remain unchanged.

Latest safe outbound-communication UX and production-readiness slice: manual “Send today’s brief now” delivery requires the shared accessible confirmation dialog. It states that delivery to the configured parish recipient begins immediately, preserves no-op cancellation, and dispatches the existing selected-parish route only after approval; recipients, content, provider behavior, persistence, schedules, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe parish-administration privilege UX slice: Admin-to-Staff role changes now require the shared accessible confirmation dialog while the controlled selector retains the confirmed Admin value until approval. Cancellation is a no-op, promotion remains immediate, and the existing selected-parish admin API still enforces at least one active administrator. Production, credentials, migrations, operational RLS, records, and sensitive gates remain unchanged.

Latest safe parish-administration UX and production-readiness slice: Staff Access deactivation now requires the shared accessible confirmation dialog. It identifies the account, preserves no-op cancellation, and dispatches the existing selected-parish admin route only after confirmation; reactivation remains immediate and the API continues to block self-deactivation and removal of the final active admin. Production, credentials, migrations, operational RLS, records, and sensitive gates remain unchanged.

Latest safe selected-parish integration conflict UX slice: Google Calendar “Create anyway” now requires the shared accessible confirmation dialog after conflicts are detected. The dialog reports the conflict count, preserves no-op cancellation, and states that existing events are not resolved or changed; confirmed dispatch still uses the existing selected-parish force-create path and leaves the scheduling decision with staff. Production, credentials, providers, Calendar data, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe selected-parish integration UX and production-readiness slice: Request Detail Google Calendar deletion now requires the shared accessible confirmation dialog. It explicitly separates deleting the selected parish's external event and clearing its Vinea link from changing the confirmed request schedule; cancel is a no-op and confirm uses the existing active-parish delete route. Production, credentials, providers, Calendar data, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe request-schedule UX and production-readiness slice: confirmed Baptism, Funeral, Wedding, and OCIA schedule clears now require the shared accessible confirmation dialog. The dialog names the selected schedule, permits no-op cancellation, and explicitly says an existing Google Calendar event is not changed automatically; confirmed dispatch still uses the existing active-parish request API. Production, migrations, operational RLS, providers, Calendar behavior, and sensitive gates remain unchanged.

Latest safe request-schedule integrity and production-readiness slice: Request Detail no longer clears visible confirmed Baptism, Funeral, Wedding, or OCIA schedule state before the active-parish API confirms persistence. Failed clear attempts retain the last visible confirmed value and curated guidance; successful responses blank the field and refresh normally. Staff confirmation, request ownership, validation, audit metadata, Calendar separation, production, migrations, operational RLS, providers, and sensitive gates remain unchanged.

Latest safe staff-email reliability and production-readiness slice: Request Detail and Daily Work Hub now classify delivery and post-send communication logging as separate stages. Transport/rejected sends retain send-failure guidance, malformed successful confirmation warns that delivery may have occurred, and every failure after exact send confirmation explicitly says the email was sent before staff retry. Request-bound recipient authorization, staff-entered content, provider behavior, active-parish communications logging, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe staff-auth entry and production-readiness slice: the optional login existing-session probe now contains thrown network/auth-client failures and leaves the password form available. The form exposes stable names and busy semantics and blocks duplicate pending submissions, while curated sign-in errors, hardened dashboard destinations, provider/session behavior, authorization policy, the approval-gated proxy, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe selected-parish shell and production-readiness slice: the dashboard now separates a pending parish choice from confirmed active-parish context. Global Search and Notifications Center are unavailable behind an accessible workspace-updating state until the membership-checked Server Action confirms and persists the parish cookie, then both tools remount with empty client state under the confirmed parish id. Denials restore the prior context; authorization policy, the separately approval-gated proxy, production, migrations, operational RLS, providers, and sensitive gates remain unchanged.

Latest safe public-intake reliability and UX slice: all five core intake forms now use one typed fail-safe client submission helper, so network rejection, malformed responses, and missing request ids produce curated recovery guidance instead of leaving families stuck in a loading state. Forms expose busy state and distinguish assertive errors from polite success; payloads, request notification behavior, runtime parish routing, server protection, production gates, migrations, and operational RLS remain unchanged.

Latest safe sales-conversion UX and production-readiness slice: the Schedule Demo form now combines native required validation, precise name/parish/email/role autofill, an explicit form busy state, assertive curated error announcements, and polite success announcements. Its endpoint, payload, durable rate limit, same-origin guard, provider behavior, safe logging, production gates, migrations, and operational RLS remain unchanged.

Latest safe public-intake UX and production-readiness slice: Baptism, Wedding, Funeral, OCIA, and Join Parish data controls now have stable names, explicit accessible labels, and deliberate autofill semantics. Contact/email/telephone/address fields are faster on mobile and compatible with browser autofill, while pastoral free text opts out of unrelated autofill; payloads, validation, runtime parish routing, notifications, production gates, migrations, and operational RLS remain unchanged.

Latest safe sensitive-response privacy and production-readiness slice: scoped API, authenticated dashboard, and tokenized family portal responses now apply `X-Robots-Tag: noindex, nofollow, noarchive`, while tokenized `/family/request/:path*` pages additionally apply `Referrer-Policy: no-referrer`. Public pages retain existing search behavior; one-time family access URLs are kept out of Referer headers; and authentication, origin-based upload protection, portal behavior, storage authorization, production gates, migrations, and operational RLS remain unchanged.

Latest safe Daily Work Hub and production-readiness verification: mark-as-contacted and funeral care-touchpoint actions remain entirely behind authenticated request APIs. Exact selected-parish membership and same-parish request ownership precede communication, request-summary, and funeral-detail writes; the active-parish cookie defeats conflicting headers; forged/cross-parish targets fail generically; staff-reviewed inputs, safe audit metadata, structured partial success, and no-op denials remain intact; and repository guards continue to prohibit the corresponding browser Supabase mutations. No duplicate persistence path was added because the approved implementation was already present and passed 66 focused assertions.

Latest safe browser-cache privacy and production-readiness slice: the explicit `private, no-store, max-age=0` boundary now covers authenticated dashboard HTML and tokenized family portal pages as well as every API response. Staff parish data and family portal content no longer rely only on framework cache defaults, while public intake pages, immutable Next assets, authentication, authorization, runtime behavior, CSP, and production-sensitive gates remain unchanged.

Latest safe deployment-origin and production-readiness slice: health readiness, browser mutation authorization, root metadata, OAuth redirects, Daily Brief links, one-time family portal links, and active-parish cookie security now share one exact HTTP(S) app-origin parser. Credential-, path-, query-, fragment-, or unsafe-scheme-bearing `NEXT_PUBLIC_APP_URL` values can no longer be normalized into trust or outbound links; production redirect/link resolution fails closed without a trusted configured/platform origin, Vercel contexts require HTTPS, and request-derived fallback remains local-development-only.

Latest safe application-resilience and production-readiness slice: ordinary application pages and the authenticated dashboard segment now have layered privacy-safe recovery boundaries using Next.js 16's current `unstable_retry` API, while the dashboard also has a stable, accessible loading skeleton. The normal app or selected-parish shell remains mounted where possible, unexpected render failures show curated retry/return guidance without exception messages or digests, and no data, auth, production gate, provider, migration, or RLS behavior changes.

Latest safe browser-security and production-readiness slice: Next.js framework advertising is now disabled with `poweredByHeader: false`, removing the default `X-Powered-By` response fingerprint while preserving the existing conservative security headers, API no-store boundary, OAuth/document behavior, and separately gated CSP path.

Latest safe deployment-readiness slice: `/api/health` now folds exact `NEXT_PUBLIC_APP_URL` readiness into its existing non-secret environment check. Missing, malformed, credential-bearing, path/query/fragment-bearing values fail health, Vercel requires HTTPS, and local non-Vercel HTTP QA remains supported; non-production operators receive only the safe `app-origin` label while production retains the generic `checks.env: false` / `unhealthy` response without exposing URL values.

Latest safe mutation-security and production-readiness slice: the shared same-origin guard no longer trusts host-derived `request.url` origins in production or Vercel processes. Those environments require an explicit configured app or Vercel deployment origin, browser `Origin` values must be exact HTTP(S) origins without credentials/path/query/fragment material, and local non-Vercel development retains request-derived compatibility; all mutating API routes preserve their existing generic `403`, auth, body-size, rate-limit, ownership, and side-effect ordering.

Latest safe abuse-protection and production-readiness slice: public durable rate-limit identity now prefers Vercel's canonical `x-vercel-forwarded-for`, accepts only valid IPv4/IPv6 values, and collapses malformed input to a shared fail-closed bucket. Route-separated SHA-256 bucket derivation keeps validated raw address text out of the durable rate-limit table without claiming anonymization. A process marked as Vercel no longer trusts fallback forwarding headers when the canonical header is absent, while validated fallback remains available for local/self-hosted development; intake, demo, verified notifications, and family document uploads retain their existing limits, ordering, and fail-closed behavior.

Latest safe observability-privacy and production-readiness slice: the central server error logger, development-only dashboard query logger, and non-production evidence sanitizer now redact full HTTP(S) URLs and UUID-shaped row/object identifiers in addition to database URLs, credentials, tokens, signed material, storage fields, and email addresses. This prevents provider failures from placing private paths or raw tenant-object ids in diagnostics while retaining safe route/action labels; production, providers, runtime workflows, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe API privacy and production-readiness slice: the existing repository-wide safe-error regression guard was expanded to scan all 55 App Router API Route Handlers and fail if a route directly returns an exception object, exception `.message`, stringified exception, or raw exception response text. Self-tests prove each unsafe form is detected while generic user responses and redacted server logging remain allowed; runtime behavior, production, migrations, operational RLS, providers, and sensitive gates remain unchanged.

Latest safe evidence-privacy slice: the non-production export audit runners, restore app/auth smoke runner, and synthetic storage/document restore runner now sanitize fatal stderr through one bounded helper before printing JSON. Database/web URLs, JWTs, API tokens, bearer values, and email addresses are redacted while actionable guardrail labels remain readable; cleanup and success evidence remain intact, and no drill, restore, storage access, export, production flag, database mutation, or production access occurred.

Latest safe document-privacy and reliability slice: staff document download now requires Supabase Storage to return an absolute credential-free HTTP(S) signed URL before the scoped API reports success. Missing, blank, relative, unsafe-scheme, or credential-bearing URL material follows the existing generic failure path and logs only a safe missing-value boolean; selected-parish request ownership, 60-second expiry, popup recovery, storage policy, production, migrations, and operational RLS remain unchanged.

Latest safe family-portal observability slice: family portal token usage now records `last_used_at` through a checked best-effort helper that requires a matched token row. Returned, zero-row, and thrown telemetry failures produce privacy-safe warnings without token/request/parish identifiers and do not block family document access; production, storage, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe data-integrity and production-readiness slice: People duplicate merges now confirm the temporary duplicate `parishioner_id` unlink and compensate by restoring that exact relationship when the canonical Person update fails. Confirmed restoration returns ordinary retry guidance; uncertain restoration gives explicit administrator-review guidance, while selected-parish authorization, staff review, migrations, operational RLS, and production gates remain unchanged.

Latest safe communications and production-readiness slice: public request notification, public demo request, staff request email, and Daily Brief delivery now require a non-empty provider message id. Daily Brief additionally requires a matched parish state row, reports accepted-but-unrecorded manual sends explicitly, and excludes those cron outcomes from its clean sent list; recipients, content, rate limits, provider behavior, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe selected-parish integration and production-readiness slice: Google Calendar event create, update, and delete now require a returned request id after their post-provider Vinea update before schedule history or normal success. Returned errors and accepted zero-row updates preserve the existing partial-success recovery guidance; provider behavior, active-parish ownership, production, OAuth, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe family-portal and production-readiness slice: family portal token creation now requires a non-empty persisted token-row id and an expiry representing the exact requested instant before returning the one-time raw link. Zero-row, malformed, or changed-expiry responses fail generically without token disclosure or audit, while active-parish request ownership, hash-only storage, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe document-privacy and production-readiness slice: staff and family portal document uploads now confirm the returned storage path and persisted document-row id. Failed metadata writes use one checked server-only cleanup helper that requires exactly one removed object, emits only safe counts/source, and gives staff or families appropriate recovery guidance when cleanup is uncertain; production, storage access, signed URLs, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe public-intake and production-readiness slice: Funeral, Wedding, OCIA, and Join Parish detail inserts now return and match the created request id, while checklist creation must return the complete expected id count before workflow creation, history, or `201` success. Zero-row, mismatched, and partial results enter the existing checked compensating cleanup path; production, routing flags, migrations, operational RLS, providers, and public claims remain unchanged.

Latest safe Catholic-records and production-readiness slice: the existing staff-triggered Baptism certificate route now requires a returned `certificate_generated` event id before delivering its PDF. Returned errors and accepted zero-row event inserts fail with generic guidance, while same-origin POST, selected-parish record ownership, Baptism-only behavior, no-store delivery, canonical boundaries, production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe production-readiness slice: People and Household duplicate merges now require a returned replacement household membership id before deleting the duplicate relationship. People merges were reordered to insert and confirm first, so a zero-row replacement race preserves the original family relationship and fails generically without completion history or success; production, migrations, operational RLS, and sensitive gates remain unchanged.

Latest safe onboarding/migration and production-readiness slice: committed People, Household, and Sacramental Record imports now derive created/skipped counts from returned inserted ids and require a confirmed completed-batch id before audit history or API success. Count mismatches produce failed-batch history with confirmed counts, while preview behavior, active-parish write scope, import limits, migrations, RLS, and sensitive gates remain unchanged.

Latest safe request-workflow and production-readiness slice: Request Detail note creation now requires one returned inserted note id, and workflow playbook application requires the returned checklist-item count to exactly match the promised added count before audit history or success. Zero-row or partial insert results remain generic and create no false history or count; active-parish ownership, staff-entered content, migrations, RLS, and sensitive gates remain unchanged.

Latest safe selected-parish integration and production-readiness slice: the Google OAuth callback now requires the returned `parish_google_integrations.parish_id` to equal the signed and membership-revalidated selected parish before redirecting to `gcal=connected`. Zero-row, mismatched-parish, returned, or thrown persistence failures clear state and use the generic error redirect; authentication, provider behavior, Calendar event behavior, production, migrations, RLS, secrets, and sensitive gates remain unchanged.

Latest safe Catholic-workflow and production-readiness slice: the staff-authenticated Funeral and Wedding detail routes now require a returned persisted `request_id` before writing intake-update history or returning success. Returned, thrown, and accepted zero-row failures remain generic and create no false audit event, while selected-parish ownership, staff-entered pastoral content, confirmed schedule timestamps, Calendar separation, migrations, RLS, and production gates remain unchanged.

Latest safe public-intake and production-readiness slice: failed sequential public intake submissions now use a checked server-only cleanup helper that attempts request and parishioner compensation independently, positively confirms deleted rows, and reports returned, thrown, or zero-row cleanup failures through privacy-safe boolean context. The public response remains generic, the design is explicitly not claimed as transactional rollback, and production, migrations, RLS, routing flags, providers, and public claims remain unchanged.

Latest safe AI and production-readiness slice: the disabled-by-default `/api/ai/summary` safety chain now assigns and checks the real safe-audit persistence result before exposing source/review scaffolding or calling OpenAI. Failed audit persistence returns the existing generic `503`, source validation prevents future unchecked generation, legacy flag-off behavior remains exact, and production AI flags remain off and NO-GO.

Latest safe export-governance and production-readiness slice: the gated `request_list_basic` and `request_document_manifest` pilots now require their safe download audit event to persist before privileged queries or CSV delivery. Audit failure returns generic `503` guidance, and source preflight version 2 prevents future export routes from omitting the checked audit result; production exports, UI, flags, migrations, and RLS remain unchanged and NO-GO.

Latest safe reliability and production-readiness slice: the central `writeAuditEvent` helper now detects Supabase returned errors as well as thrown exceptions and returns a truthful success boolean while preserving redacted logging and existing best-effort caller behavior. This closes a silent observability gap and gives future reviewed high-assurance routes a real audit-persistence signal without changing production gates, schemas, RLS, or staff workflows.

Latest safe security and production-readiness slice: the 2026-07-11 All API Mutation Same-Origin Boundary brings public intake, demo requests, verified request notifications, and family-portal document uploads behind the same generic origin rejection already used by staff routes. A repository-wide discovery guard now requires every POST/PATCH/PUT/DELETE Route Handler to reject untrusted browser origins before privileged work while preserving durable rate limiting for accepted first-party requests; no production, migration, RLS, storage, provider, or sensitive-gate action occurred.

Latest safe privacy and production-readiness slice: the 2026-07-11 Operational Audit Metadata Privacy Boundary removes public/staff intake names, import filenames, duplicate Person/Household names, and original document filenames from staff and family-portal route-owned audit metadata while retaining scoped ids, action/status, request type, safe counts, document type, file size, and source labels. Runtime authorization and workflows remain unchanged; no production, migration, operational RLS, storage, or public-claims boundary changed.

Latest safe core-workflow and production-readiness slice: the 2026-07-11 Household Primary Contact Compensation Boundary checks selected-parish prior-primary clearing, requires returned member ids, restores the exact prior primary after failed replacement writes, and gives explicit manual-recovery guidance if restoration cannot be confirmed. No migration, production access, operational RLS change, or production-sensitive gate changed.

Latest safe daily-workflow and production-readiness slice: the 2026-07-11 Request Intake Editor Persistence Boundary validates Funeral, Wedding, and OCIA required fields before any write, positively confirms contact/request/type-detail persistence before audit, and gives explicit partial-save recovery guidance. Staff review and active-parish ownership remain intact; production, migrations, operational RLS, communications, AI, Calendar, storage, exports, and sensitive gates remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Dashboard Request Audited Update Persistence Boundary requires status, workflow-step, assignment, follow-up, and waiting-on Server Actions to return a minimal updated id and confirm a matched row before request history or success. Stale or policy-hidden rows now fail generically without false audit history, while active-parish authorization, staff UX, production gates, migrations, and operational RLS remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Duplicate Merge Mutation Persistence Boundary requires the canonical People/Household update before linked-row movement, then requires every replacement membership insert and expected membership/final duplicate-row delete to return a minimal persisted id. Replacement relationships are confirmed before destructive deletion, so zero-row insert races preserve original family membership and fail generically without `merge_completed` history or false success, while staff review, selected-parish authorization, production gates, migrations, and operational RLS remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Parish Admin Audited Update Persistence Boundary requires Parish Settings and Public Intake Routing metadata updates to positively confirm a persisted parish row before success or route-owned audit history. Zero-row races now fail generically without false settings events, while public intake runtime routing, provider integrations, migrations, operational RLS, and production gates remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Audited Request Update Persistence Regression Boundary inventories all 11 single-row audited request mutations and fails CI unless persistence is positively confirmed before success or route-owned audit history. It also closes the remaining checklist null-update race, while three multi-stage communication/care routes retain dedicated partial-success coverage.

Latest safe production-readiness slice: the 2026-07-11 Request Content Persistence Confirmation requires positive request-row persistence before reply draft, staff note, saved AI summary, or suggested-date routes return success or write audit history. A zero-row race now fails generically without false saved-content events, while staff review, AI no-call behavior, and Calendar separation remain unchanged.

Latest safe Catholic-records and production-readiness slice: the 2026-07-11 Catholic Request Schedule Persistence Confirmation requires positive persisted-row confirmation before confirmed Baptism, Funeral, Wedding, or OCIA routes return success or write schedule audit history. A zero-row race now fails generically without a false milestone event, while staff save/clear UX and Google Calendar behavior remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Request Communications Honest Completion Boundary strengthens the shared active-parish communication-history route used by Request Detail, Daily Work Hub post-send logging, and Communications Center. Its sequential request-summary update now requires a positively matched row, so a zero-row race returns the existing partial-success guidance and safe partial audit instead of a false completed result.

Latest safe production-readiness slice: the 2026-07-11 Daily Work Hub Active-Parish Write Completion Verification confirms mark-as-contacted and bereavement care touchpoints remain server-owned, authenticated, selected-parish membership scoped, and same-parish request scoped with no matching browser table writes. Later request and funeral-detail updates now positively confirm the updated row so a zero-row race returns honest partial-success guidance instead of a false completion.

Latest safe document UX and production-readiness slice: the 2026-07-11 Request Document Popup-Blocked Recovery requests a detached blank window inside the staff click before signed-URL creation, gives curated allow-popups-and-retry guidance when blocked, and closes the blank window if authorization fails. The signed URL remains unrendered and unlogged while storage authorization, expiration, and active-parish request ownership remain unchanged.

Latest safe security and production-readiness slice: the 2026-07-11 API No-Store Response Boundary applies an explicit `private, no-store, max-age=0` cache policy plus legacy compatibility headers to every `/api/:path*` response. Sensitive staff, parishioner, request, document, audit, settings, and workflow payloads can no longer rely only on framework defaults to avoid browser or intermediary retention; authentication, authorization, route behavior, and the separately gated CSP path remain unchanged.

Latest safe tenant UX and production-readiness slice: the 2026-07-11 Dashboard Parish Switch Thrown-Failure Recovery makes optimistic selected-parish changes recover cleanly from unexpected Server Action or network failures. The shell restores the prior parish, shows curated guidance, refreshes server state, and prevents overlapping transitions while the server remains authoritative for membership and cookie persistence.

Latest safe UX and production-readiness slice: the 2026-07-11 Request Detail Confirmation Dialog Consistency moves the existing Mark Complete review into the shared accessible Vinea surface. Completion retains the existing scoped status action and reopen behavior while gaining keyboard focus containment, Escape handling, focus restoration, and consistent staff guidance.

Latest safe UX and production-readiness slice: the 2026-07-11 Request Email Template Confirmation Dialog removes the final native browser prompt from application source. Replacing staff-entered subject/body now uses the accessible Vinea review surface with busy-state protection while preserving editable drafts, the existing active-parish request-scoped save route, and the no-send boundary.

Latest safe UX and production-readiness slice: the 2026-07-11 Duplicate Merge Confirmation Dialog replaces native People and Household merge prompts with a consistent accessible Vinea review surface. It names the surviving record, explains linked-data movement, contains keyboard focus, prevents repeat submission while busy, and preserves the existing server-owned selected-parish merge APIs unchanged.

Latest safe production-readiness slice: the 2026-07-11 Client Supabase Operational Access Boundary proves no Client Component performs table, storage, Function, or RPC access and allowlists browser Supabase usage to staff login and current-session logout. All operational data access remains behind reviewed Route Handlers or Server Actions.

Latest safe production-readiness slice: the 2026-07-11 Dashboard Server Action Operation-Order Boundary discovers all 21 operational Server Actions and requires authenticated user plus active-parish/request ownership scope before writes. It also fixes Household primary-contact updates so a forged, stale, or cross-parish member id cannot clear another member before target ownership is verified.

Latest safe production-readiness slice: the 2026-07-11 Generic Audit Mutation Browser Boundary proves no Client Component posts to the compatibility audit endpoint, keeps request-target activity route-owned, and locks accepted non-request writes behind selected-parish admin authorization. Removing or narrowing the unused first-party POST remains an explicit owner compatibility decision.

Latest safe production-readiness slice: the 2026-07-11 Staff Tenant Operation-Order Regression Boundary inventories all 13 non-request privileged staff mutation methods and requires authentication, selected-parish tenant resolution, failed-scope denial, and required parish-admin authorization before provider or database side effects. It complements the request-specific guard without changing runtime behavior or production gates.

Latest safe production-readiness slice: the 2026-07-11 Request Privileged Operation-Order Regression Boundary discovers all 19 directly authenticated request mutation methods and requires approved active-parish membership plus same-parish request ownership resolution, generic denial, and use of the authorized request id before the first database, storage, or portal-token side effect. Route-specific validation and production gates remain unchanged.

Latest safe production-readiness slice: the 2026-07-11 Privileged Client Authentication-Order Regression Boundary verifies all 52 directly authenticated Route Handler methods that construct the Supabase service-role client do so only after staff authentication. It also forbids module-scope construction and client-component imports while preserving route-specific active-parish/ownership tests. The companion guards separately constrain all 38 direct-auth mutations and the two reviewed side-effecting GET protocol routes.

Latest safe production-readiness slice: the 2026-07-10 Request Mutation Same-Origin Boundary applies the shared fail-closed browser-origin guard to all 18 request mutation Route Handlers before authentication or privileged work. Checklist, notes/drafts, communications, schedules, pastoral details, triage, documents, and portal-token actions retain their existing staff, active-parish, request ownership, validation, audit, partial-success, storage, and provider boundaries.

Latest safe production-readiness slice: the 2026-07-10 Staff Communication Same-Origin Mutation Boundary requires exact trusted browser origin metadata before staff email delivery, communication logging/follow-up, mark-as-contacted, or care-touchpoint authentication and writes. Forged, missing, malformed, opaque, or cross-site origins fail generically before privileged work while all active-parish, request ownership, staff-review, provider, audit, and partial-success behavior remains intact.

Latest safe production-readiness slice: the 2026-07-10 Staff Authentication Session Exit Boundary makes normal Logout current-session-only, redirects only after successful sign-out, gives staff retry-safe curated failure guidance, and constrains post-login destinations through the hardened dashboard-link validator. No provider configuration, production access, migration, RLS, or sensitive gate changed.

Immediately previous safe production-readiness slice: the 2026-07-10 Request Detail Typed Response DTO Boundary gives the server and browser a shared allowlisted contract for request identity, parishioner contact, checklist, communications, Catholic type-specific detail, and linked-record continuity data. Cross-parish response mismatches and malformed rows fail closed, unexpected fields are dropped, and repository lint is now zero-warning without changing staff workflows or sensitive gates.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Active-Parish Mutation Boundary Reverification confirms mark-as-contacted and care-touchpoint actions remain server-owned, staff-authenticated, exact-membership scoped, and same-parish request scoped. It also preserves the existing Sent card option and proves a conflicting parish header cannot override the active-parish cookie, without production access, migrations, RLS changes, or outbound communication.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Typed Response DTO Boundary replaces the Work Hub `unknown[]`/browser `any[]` gap with a shared allowlisted request contract. The server and browser both normalize current operational fields, drop unexpected future fields, and fail malformed request rows closed while preserving selected-parish behavior and staff workflows.

Immediately previous safe production-readiness slice: the 2026-07-10 Production Readiness Lint Signal Cleanup removes eight obsolete or unsafe lint findings from demo-response parsing, disabled AI reply scaffolding, and RLS approval input preparation. Runtime behavior and sensitive gates remain unchanged; remaining warnings are isolated to larger client DTO work.

Immediately previous safe production-readiness slice: the 2026-07-10 Runtime Supabase Wildcard Projection Guard scans application runtime TypeScript in the standard test/CI path and fails any future Supabase projection that begins with `*`. Explicit projection review remains required, while authorization, RLS, and response-boundary tests stay separate and unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 OCIA Detail Presence Projection Boundary replaces the final application runtime wildcard reads with a `request_id`-only presence contract for existing-row, insert-result, and race-recovery paths. Placeholder creation, safe errors, selected-parish request authorization, and confirmed-session behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Parish Daily Brief Projection Boundary removes request notes, reply drafts, preferred dates, person links, parishioner phone, and unrelated Funeral/Wedding/OCIA fields from the morning brief pipeline. Explicit compile-time query branches preserve schema inference, while parish scope, scoring, workload, headings, schedules, recipient fallback, and send behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Care Calendar And Intake Intention Projection Boundary gives the Parish Care Calendar and Intake Queue separate minimal Mass Intention source contracts. Calendar no longer receives stipend/history fields, Intake no longer receives intention text/requested-date fields, and selected-parish scope plus existing operating behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Core Detail Read Projection Boundary gives Person, Household, and Mass Intention detail loaders explicit complete current contracts while embedded Sacramental Record history uses a minimal five-field summary. Dedicated detail behavior remains complete, but register notes, relationship ids, staff ownership ids, and future columns cannot enter related-record cards through wildcard selection.

Immediately previous safe production-readiness slice: the 2026-07-10 Core Directory List Projection Boundary gives People, Households, and Mass Intentions minimal view-specific DTOs and explicit projections. Sensitive notes, birth dates, linkage fields, parish ids, and timestamps stay out of list surfaces that do not use them while selected-parish scope, search, filters, counts, and navigation remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Sacramental Record Prefill Request Projection Boundary replaces the service-role request wildcard read used after scoped access verification with an explicit eight-field prefill contract. Existing selected-parish authorization, supporting detail validation, duplicate checks, safe errors, and staff-reviewed prefill behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Sacramental Record Read Projection Boundary replaces selected-parish list, detail, and recent-activity wildcard reads with explicit view-specific contracts. List reads omit notes and ownership fields, activity reads omit raw metadata and actor ids, and existing selected-parish scope, continuity, certificate-activity detection, and staff UI behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Duplicate Review Explicit Projection Boundary replaces People and Household wildcard reads used by candidate detection and merge preparation with explicit current-contract projections. Existing active-parish authorization, scoring, review, merge, audit, and staff UI behavior remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Baptism Certificate Active-Parish Boundary requires authorized staff, exact selected-parish membership, and same-parish sacramental-record ownership before minimal record reads, PDF construction, or certificate-event logging. PDF construction now precedes event insertion so failed generation cannot produce a false completion event; Baptism-only, staff-reviewed behavior remains unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Google Calendar Data Projection Boundary replaces wildcard request, parishioner, Funeral, Wedding, and OCIA reads used by Calendar preparation with compile-time explicit projections. Selected-parish authorization and provider behavior remain unchanged, no provider call was made, and browser Supabase use remains limited to authentication surfaces.

Immediately previous safe production-readiness slice: the 2026-07-10 Request Schedule Audit Event Ownership Boundary moves confirmed Baptism/Funeral/Wedding/OCIA and Google Calendar lifecycle activity to authenticated selected-parish owning routes. Request Detail now has no browser request-history POST, generic request-target audit writes are rejected, and metadata excludes dates, provider ids, calendar ids, links, conflicts, and OAuth material.

Immediately previous safe production-readiness slice: the 2026-07-10 Request Mutation Audit Event Ownership Boundary makes checklist, staff-note, suggested-date, and Funeral/Wedding detail saves own their audit events on authenticated active-parish routes. Request Detail no longer submits duplicate browser events, forged copies are blocked, and metadata excludes staff notes, pastoral detail values, checklist labels, and proposed dates.

Earlier safe production-readiness slice: the 2026-07-10 Request Content Audit Event Ownership Boundary makes scoped AI-summary saves, reply-draft saves, and successful staff email delivery own their audit events on the server. The generic Audit Events API rejects forged browser copies, and safe metadata contains fixed labels/counts rather than generated text, subjects, recipients, prompts, or provider payloads.

Earlier safe production-readiness slice: the 2026-07-10 Request Note Audit Metadata Privacy Boundary keeps internal note text solely in the protected note record while `request.note.created` audit metadata records only a stable source label and character count. Audit Log clarity remains unchanged and source guards prevent note previews from returning.

Earlier safe production-readiness slice: the 2026-07-10 Core Record Action Active-Parish Fallback Boundary makes People, Households, Mass Intentions, and Sacramental Record Server Actions disable legacy primary-parish fallback whenever an active-parish cookie is present. Explicit selected-parish writes now fail closed while cookie-less legacy single-parish compatibility remains intentional and tested.

Earlier safe production-readiness slice: the 2026-07-10 Sacramental Record Create Relationship Integrity boundary validates optional source-request ownership through the stored parishioner relationship, validates optional linked people in the selected parish, and rejects a second record for the same request before the existing insert. It preserves the staff-reviewed register workflow and adds no automatic linking, certificate generation, canonical decision logic, migration, or production gate.

Earlier safe production-readiness slice: the 2026-07-10 Intake Queue Active-Parish Triage APIs move request and Mass Intention quick-triage writes behind authenticated, body-bounded APIs. Selected active-parish membership and exact target ownership precede writes, forged/cross-parish targets deny generically, audit metadata excludes staff notes/names/dates, first-contact partial success remains explicit, and the obsolete Intake Queue mutation Server Action is removed.

Latest documentation navigation slice: the 2026-07-10 Documentation And Operations Index gives new operators one durable front door for product truth, roadmap priority, build history, repository inventory, VAOS instructions, QA evidence, production/security gates, and documentation maintenance. It makes source authority and evidence-status meanings explicit without changing runtime behavior or any production gate.

Latest documentation operating-system slice: the 2026-07-10 Single Source Operating Manual Consolidation reorganizes `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md` into a durable company manual for vision, product strategy, Vinea Principles, architecture, engineering standards, official AI/operating stack, AI operating model, security/trust, sales/customer success, documentation standards, Codex instructions, production gates, and open Alex-review questions. It also defines ChatGPT, Codex, Supabase, Vercel, and Microsoft 365 / Vinea Outlook as the official operating stack while keeping Hermes Agent and OpenClaw out of the active workflow.

Earlier safe production-readiness slice: the 2026-07-10 Communications Center Active-Parish Mutation API moves communication-log and follow-up writes through the existing authenticated request route. Selected active-parish membership and same-parish request ownership now precede writes, forged/cross-parish targets deny generically, safe audit metadata stays note-free, partial-success guidance is preserved, and the obsolete mutation Server Action is removed without sending communications or changing production gates.

Immediately previous safe production-readiness slice: the 2026-07-10 Export Exact Selected-Parish Role Boundary makes both gated export pilots derive permission roles from the authenticated active membership in the exact selected parish. Admin status elsewhere no longer elevates the active parish, missing/failed role lookups deny generically before privileged export reads, and safe denial metadata feeds the forged/cross-parish reviewer queue. Production exports remain disabled and separately approval-gated.

Immediately previous safe production-readiness slice: the 2026-07-10 Dashboard Shell Server Context And Exact-Parish Admin Boundary server-renders staff identity and selected-parish admin capability, removes the shell's browser identity and Staff Access roster requests, and requires exact selected-parish admin status for full Audit Events reads and parish-level Audit Events writes.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Single-Response Composition returns the selected-parish queue, relationship suggestions, and daily operating signals through one authenticated browser request. Independent queue and signal reads start concurrently on the server, the main dashboard no longer pays a second aggregate-signal round trip, and all existing authentication, membership, generic-denial, read-only, and production-gate boundaries remain unchanged.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Server Read Model moves the main request queue, parishioner/checklist enrichment, operational funeral/wedding/OCIA details, and relationship suggestions behind a staff-authenticated exact-membership endpoint. Browser operational table reads and technical details are removed; relationship-intelligence sources are explicitly selected-parish scoped; and shared detail queries use explicit projections.

Immediately previous safe production-readiness slice: the 2026-07-10 Reports Server Aggregate Summary moves request analytics, parish insights/trends, and staff workload calculation behind a staff-authenticated, exact-membership-scoped endpoint. Reports no longer loads enriched request/parishioner/checklist/pastoral-detail rows in the browser and receives only finished report DTOs.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Server Aggregate Signals boundary moves duplicate, continuity, certificate-readiness, reminder, and Parish Health supporting calculations behind a staff-authenticated, exact-membership-scoped read endpoint that returns only the existing aggregate DTO. Raw people, household, sacramental-record, and certificate-event source rows no longer enter the browser for these signals.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Operational Detail Projection replaces funeral, wedding, and OCIA wildcard detail reads with explicit request-id-scoped fields, reducing morning-screen payload and keeping future sensitive fields opt-in without changing behavior.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Reply Draft Active-Parish Route moves generated follow-up draft persistence behind the existing staff-authenticated request reply-draft API, preserving staff review, AI generation behavior, batch behavior, and safe messages while removing the direct browser `requests.reply_draft` update.

Immediately previous safe production-readiness slice: the 2026-07-10 Daily Work Hub Active-Parish Request Mutation APIs move mark-as-contacted and funeral care-touchpoint writes behind authenticated request routes that require selected-parish membership and same-parish request ownership, emit safe audit metadata, preserve structured partial-success guidance, and remove the corresponding direct browser Supabase mutations.

Immediately previous safe production-readiness slice: the 2026-07-10 Dashboard Segment Error Recovery boundary keeps the already-authorized dashboard layout mounted when child workspace content fails, while showing generic retry/return actions with no exception-detail exposure.

Immediately previous safe production-readiness slices: the 2026-07-10 Dashboard Segment Loading boundary adds a static Server Component fallback for dashboard page/nested-route streaming; the App Router Not-Found boundary adds a fixed-navigation root 404 without reflecting request state; the App Router Error Recovery boundary adds generic retryable page and root-layout fallbacks without rendering exception details; and the preceding Google Calendar External Link Safety boundary and Dashboard Shell Client Safe Messages boundary remain in force.

Earlier 2026-07-10 safe production-readiness slice: the Dashboard Queue Client Defense In Depth boundary adds action-specific client allowlists to Communications, Intake, and Daily Work Hub queue results, removes raw request IDs from batch failures, and keeps failed items selected for individual review without changing write behavior.

Immediately previous safe production-readiness slice: the 2026-07-10 Request Detail Server Action Client Safe Messages boundary adds action-specific allowlists and fallbacks to status, workflow-step, assignment, follow-up, waiting-on, playbook, note, intake-correction, and person-link/create staff controls while preserving approved validation, prerequisite, and selected-parish guidance.

Earlier 2026-07-10 safe production-readiness slices: the Core Record Client Safe Messages boundary covers People, Households, household membership, and Mass Intentions; the Sacramental Record Client Safe Messages boundary covers request-prefill, create, edit, and person-link staff screens; the Request-Bound Staff Email Authorization boundary requires authenticated active-parish membership and same-parish request ownership before provider delivery, derives the recipient from the stored request/parishioner relationship, and routes both Request Detail and Daily Work Hub post-send logging through the scoped communications API.

Recent safe production-readiness slices: the 2026-07-08 Next Proxy Staff Auth Current Compatibility Boundary documents and source-guards the current dashboard proxy authorization behavior as an explicit service-role-free compatibility path until the approved multi-parish hardening replaces it; the 2026-07-08 Next Proxy Staff Auth Runtime Preflight Plan adds source-level preflight scaffolding for the future approved dashboard proxy auth hardening, so any future implementation must keep Next.js 16 proxy convention, dashboard matcher, Supabase Auth, allowlist behavior, membership-aware staff scope, redirects, development fallback, and fail-closed behavior intact before dashboard access is allowed; the 2026-07-08 Next Proxy Staff Auth Non-Production QA Evidence Template prepares the label-only evidence capture file for the future approved proxy staff-auth hardening run, while keeping runtime auth behavior and production dashboard auth rollout unchanged; the 2026-07-08 Production Gate Boundary Proxy Auth Alignment adds the Next.js proxy staff-auth hardening packet to the master production-sensitive gate index, production-gates checker, and release handoff locked-gate path so dashboard auth behavior changes cannot be treated as ordinary cleanup; the 2026-07-08 Next Proxy Staff Auth Multi-Parish Approval Packet documents the current dashboard proxy `primary_parish_id()` compatibility lookup, preserves runtime auth behavior, and defines the exact product/security approval gates for a future non-production proxy auth hardening implementation; the 2026-07-08 Next.js Proxy Convention AI Context Refresh updates the AI context so future agents look at the Next.js 16 `proxy.ts` dashboard guard instead of the deprecated `middleware.ts` convention, with a source guard to keep the reference current; the 2026-07-08 Multi-Parish Inventory Public Intake Cleanup Refresh updates the remaining-paths inventory so it records the deleted public-intake helper and keeps future production RLS/public-intake decisions aligned with the live route boundary; the 2026-07-08 Public Intake Dead Helper Cleanup removes the unused `lib/intakeParishScope.ts` helper so public intake legacy scoping remains documented and guarded only in the live `/api/intake` compatibility loader and `lib/server/publicIntakeParishScope.ts` adapter path; the 2026-07-08 Dashboard Request Scope Legacy Fallback Boundary adds source-level guards around dashboard request loading so active parish scope remains first, membership-primary scope remains second, and the old `primary_parish_id()` helper stays isolated as an explicit compatibility fallback; the 2026-07-08 Staff Parish Context Legacy Fallback Boundary adds source-level guards around the shared staff parish context helpers so read context remains membership-first and write-context primary-parish fallback remains explicit/opt-in for approved legacy compatibility paths; the 2026-07-08 Request Access Legacy Fallback Boundary adds source-level guards around request detail and staff document authorization so the approved legacy primary-parish fallback stays isolated behind explicit compatibility options and staff-facing request routes cannot directly perform oldest-parish lookups; the 2026-07-08 Public Intake Legacy Fallback Boundary adds a source-level guard around `/api/intake` so the approved legacy first-parish fallback stays isolated in the compatibility loader while runtime public intake routing remains disabled by default; the 2026-07-08 Request Notifications Verified-Parish Email Fallback hardening makes `/api/request-notifications` use the verified request contact's linked parish when loading a database fallback notification inbox, instead of falling back to the first parish row; the 2026-07-08 Daily Brief Selected-Parish Loader Cleanup removes the unused `loadPrimaryParishDailyBrief(...)` helper so future manual daily brief work cannot accidentally fall back to the first parish row; manual sends remain selected-parish scoped and cron sends remain all-enabled-parish scoped; the 2026-07-08 Staff Authorization Multi-Parish Active Rows slice moves database-backed staff authorization away from first-parish lookup and verifies active `staff_users` rows by staff email across all active rows, while preserving env allowlist and explicit development fallback behavior; the 2026-07-08 Google Calendar Selected-Parish Integration Fail-Closed slice requires the shared Google Calendar integration loader to receive an explicit selected parish id and return `null` without querying when the parish id is missing, preventing any future fallback to the first parish row.

Additional recent safe production-readiness slices: the 2026-07-08 AI Reply Validated Audit Before Safe Response Preflight slice requires future `/api/ai/reply` audit-write and safe-response implementation code to record `safeAuditMetadataWritten = true` only after a validated safe audit metadata write completes, and to keep safe-response exposure behind that completed-write marker; the 2026-07-08 AI Summary Safe Audit Event Validation slice requires the disabled-by-default `/api/ai/summary` safety-chain path to validate prepared audit metadata with `validateAiSummaryAuditEventForSafeWrite(...)` before `writeAuditEvent(...)`, and to stop before safe-response exposure or OpenAI generation unless a validated audit write succeeds; the 2026-07-08 AI Safety Chain Active Parish Request Lookup slice scopes disabled-by-default AI summary/reply safety-chain request contact lookup to the selected active parish before safe DTO assembly, so cross-parish request ids fail closed earlier without enabling AI, calling OpenAI differently, or changing production gates; the 2026-07-08 Request Person Link Active Parish Server Actions slice verifies selected active-parish request ownership before staff-reviewed Request Detail person-link/create actions load request contact rows, link the request, or create request-derived `people` rows; the 2026-07-08 Request Detail Browser Mutation Boundary adds a source-level regression guard that keeps the Request Detail client page off direct browser Supabase table reads/writes and routes sensitive request work through active-parish-aware server routes or Server Actions; the 2026-07-08 Request Sent Email Communication Log Active Parish Mutation Route moves the post-send email communication-history write behind the staff-authenticated, active-parish-aware communication log route, preserving existing staff-reviewed email delivery while verifying request ownership before writing history or request summary fields; the 2026-07-08 Request Communication Log Active Parish Mutation Route moves Request Detail manual communication logging behind a staff-authenticated, active-parish-aware server route that verifies request ownership before inserting `request_communications` and updating request communication summary fields, without sending communications or opening production-sensitive gates; the 2026-07-08 Request AI Summary Active Parish Mutation Route moves Request Detail staff-reviewed AI summary persistence behind a staff-authenticated, active-parish-aware server route that verifies request ownership before updating `requests.ai_summary`, without changing AI generation or opening production-sensitive gates; the 2026-07-08 Request Funeral Details Active Parish Mutation Route moves Request Detail funeral detail saves behind a staff-authenticated, active-parish-aware server route that verifies request ownership and funeral request type before upserting `funeral_request_details` fields while preserving any confirmed service timestamp; the 2026-07-08 Request Confirmed Wedding Ceremony Active Parish Mutation Route moves Request Detail confirmed wedding ceremony save/clear actions behind a staff-authenticated, active-parish-aware server route that verifies request ownership, wedding request type, and wedding detail ownership before updating `wedding_request_details.confirmed_ceremony_at`; the 2026-07-08 Request Confirmed Funeral Service Active Parish Mutation Route moves Request Detail confirmed funeral service save/clear actions behind a staff-authenticated, active-parish-aware server route that verifies request ownership, funeral request type, and funeral detail ownership before updating `funeral_request_details.confirmed_service_at`; the 2026-07-08 Request Reply Draft Active Parish Mutation Route moves Request Detail reply-draft saves behind a staff-authenticated, active-parish-aware server route that verifies request ownership before updating `requests.reply_draft`, preserving staff review and not changing AI generation or email sending; the 2026-07-08 Request Confirmed Baptism Date Active Parish Mutation Route moves Request Detail confirmed baptism date save/clear actions behind a staff-authenticated, active-parish-aware server route that verifies request ownership and keeps the update limited to baptism requests; the 2026-07-08 Request Suggested Dates Active Parish Mutation Route moves Request Detail suggested-date saves behind a staff-authenticated, active-parish-aware server route that verifies request ownership before updating the suggested date fields; the 2026-07-08 Request Staff Notes Active Parish Mutation Route moves Request Detail staff-notes saves behind a staff-authenticated, active-parish-aware server route that verifies request ownership before updating `requests.staff_notes`; the 2026-07-08 Request Checklist Item Active Parish Mutation Route moves checklist-item toggles behind a staff-authenticated, active-parish-aware server route that verifies request ownership and checklist-item ownership before updating `is_complete`; and earlier 2026-07-08 active-parish, safe-link, release-readiness, monitoring, and error-safety slices remain documented below in this roadmap.

Historical source-guard keyword index: AI Routes Safe Error Logging; Audit Log Helper Safe Error Logging; Audit Log Target safe link boundary; browser QA evidence for the saved-view UI; Care Cadence safe link boundary; Care Timeline safe link boundary; Certificate Issuance Logging DTO Foundation; Certificate Issuance Logging Implementation Approval Packet; Certificate Issuance Logging Non-Production QA Evidence Template; Certificate Issuance Logging Runtime Source Preflight; Certificate Type Expansion And Request Continuity Plan; CI now runs `npm run check:release-local-evidence`; CI production-readiness workflow; CI release environment guard; Communication Commitments dashboard safe link boundary; Continue Catholic records depth; Daily Office Handoff Digest Browser QA; Daily Office Handoff Digest Browser QA Recheck Blocked; Daily Office Handoff Digest Browser QA Recheck Blocked - 2026-07-06; Daily Office Handoff Digest Dashboard Browser QA Readiness; Daily Office Handoff Digest DTO; Daily Office Handoff Digest safe link boundary; Daily Office Handoff saved-view dashboard browser QA checklist; Daily Office Handoff saved-view dashboard UI approval packet; Daily Office Handoff saved-view presets; Daily operating dashboard read-only boundary; Daily Operating Signal Inputs; Daily Operating Signal safe link boundary; Daily Ownership Follow-Up safe link boundary; Daily Work Hub Overview; Daily Work Hub safe link boundary; Dashboard Command Center safe link boundary; Dashboard Continuity Empty-State Cue; Dashboard Follow-Up Queue safe link boundary; Dashboard Request Navigation safe link boundary; Dashboard Request Scope Legacy Fallback Boundary; Dashboard Today View safe link boundary; Demo Request Safe Error Logging; disabled-by-default fail-closed reply safety-chain adapter; DTO-backed reply prompt assembly; Email Dashboard Link Safety Boundary; Email Send Safe Error Logging; Entity Directory safe link boundary; Entity Mutation Navigation safe link boundary; Global Search safe link boundary; Households Active Parish Detail Scope; incident tabletop evidence package index; incident tabletop owner/sign-off worksheet; Mass Intention Navigation safe link boundary; Mass Intentions Active Parish Detail Scope; Next.js Proxy Convention AI Context Refresh; no-added-production-flags confirmation; no-Google-Calendar-data-touch confirmation; non-production incident tabletop drill evidence template; non-production incident tabletop drill execution approval packet; Onboarding Readiness safe link boundary; Operational Intelligence Brief; Parish Health and Operational Intelligence safe link boundary; Parish Health Score V1; Parish Work Queue safe link boundary; People Active Parish Detail Scope; Production monitoring and support owner intake worksheet; Production monitoring approval packet; Production monitoring evidence package index; Production monitoring non-production redaction smoke QA packet; Production monitoring owner readiness completion worksheet; Production monitoring runtime implementation approval packet; Production Monitoring Safe Event Contract; Production monitoring smoke evidence template; Production observability readiness plan; Production support escalation matrix; Public Intake Dead Helper Cleanup; Public Intake Legacy Fallback Boundary; read-only people, household, sacramental record, and certificate-event metadata; Record Detail Linked-Person safe link boundary; Relationship Intelligence Record Prefill safe link boundary; release-readiness handoff consistency guard; Request Access Legacy Fallback Boundary; Request Actions Active Parish Server Actions; Request Backlink safe link boundary; Request Notifications Safe Error Logging; Request Person Link Active Parish Server Actions; Request Person Link safe link boundary; Request Relationship Active Parish Suggestion Scope; Request Relationship Suggestion safe link boundary; Request Workflow Detail Href safe link boundary; Role Work Hub safe link boundary; Runtime reminder engine remains future work; Sacramental Continuity safe link boundary; Sacramental Record Continuity Card; Sacramental Record Correction And Notation DTO Foundation; Sacramental Record Correction And Notation Runtime Scaffold Approval Packet; Sacramental Records Active Parish Detail Scope; Staff Parish Context Legacy Fallback Boundary; the 2026-07-02 Parish Health Score V1; Trust center claims owner review filled example; Trust center claims owner review worksheet; Trust center public claims boundary matrix; Vinea Autonomous Operating System Foundation; visible Daily Office Handoff Digest UI; visible Daily Office Handoff saved-view dashboard UI; Workflow Reminders V1 Dashboard Preview; Workflow Reminders V1 Disposition DTO Foundation; Workflow Reminders V1 DTO Foundation; Workflow Reminders V1 Runtime Approval Packet; Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet; zero-continuity empty-state browser QA passed; zero-continuity empty-state browser QA readiness worksheet.

## Product Strategy

Vinea should become the modern Catholic operating system for parish work: the trusted place where family intake, staff ownership, pastoral follow-up, sacramental records, certificates, communication, reporting, and safe AI meet.

The research report makes the strategic opening clear: no incumbent obviously wins the combined category of Catholic-specific workflows, modern UX, real automation, permission-aware AI, and diocesan-grade governance. Vinea should not chase generic feature parity. It should win by making parish work easier to complete, safer to audit, and clearer to hand off.

## Current Codebase Audit Against The Report

| Research recommendation | Status | Evidence |
|---|---|---|
| Unified intake inbox for parish requests | Partially implemented | Public forms exist for baptism, funeral, wedding, OCIA, and join parish through `/api/intake`; dashboard intake/request queues exist; the 2026-07-07 public intake client safe-message boundary keeps family-facing submission errors allowlisted. Prayer requests and volunteer intake are not first-class yet. |
| Family-first, person-exact data model | Partially implemented | `people`, `households`, `household_members`, duplicate review helpers, person/record/request links, and 2026-07-07 Person/Household detail partial-data warnings exist. Nontraditional relationship modeling and family-of-origin distinctions need deeper support. |
| Duplicate detection and guided merge | Partially implemented | People and household duplicate review/merge routes and tests exist. Pre-save duplicate prevention and richer merge history remain future work. |
| Sacramental records, certificates, notations | Partially implemented | Sacramental records, append-only events, baptism certificate generation, record detail pages, the 2026-07-02 Sacramental Record Continuity Card, the 2026-07-05 Records Dashboard Continuity Summary And Filter, the 2026-07-05 Records Continuity Handoff Links, the 2026-07-08 Sacramental Continuity safe link boundary, the 2026-07-02 Certificate Issuance Logging DTO Foundation, the 2026-07-02 Certificate Issuance Logging Implementation Approval Packet, the 2026-07-02 Certificate Issuance Logging Runtime Source Preflight, the 2026-07-02 Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet, the 2026-07-02 Certificate Issuance Logging Non-Production QA Evidence Template, the 2026-07-02 Certificate Type Expansion And Request Continuity Plan, the 2026-07-02 Sacramental Record Correction And Notation DTO Foundation, the 2026-07-02 Sacramental Record Correction And Notation Runtime Scaffold Approval Packet, the 2026-07-02 Sacramental Record Correction And Notation Non-Production QA Evidence Template, the 2026-07-02 Sacramental Record Correction And Notation Runtime Source Preflight, the 2026-07-02 Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet, the 2026-07-07 Record Certificate Route Safe Errors hardening, the 2026-07-07 Sacramental Record Action Safe Errors hardening, the 2026-07-07 Sacramental Records List Safe Errors hardening, the 2026-07-07 Sacramental Record detail partial-data warning/certificate-event metadata guard, and the 2026-07-07 server-scoped New Sacramental Record request-prefill supporting-data fail-closed boundary exist. Broader certificates, persisted issuance logging, runtime notation controls, and runtime correction workflows remain. |
| Work hub / role-aware dashboards | Partially implemented | Dashboard command center, today view, care briefs, ownership health, workload, the Daily Ownership Follow-Up safe link boundary, the Parish Work Queue safe link boundary, the Notifications Center safe link boundary, the 2026-06-26 role work hub, the 2026-07-02 Daily Work Hub overview, the Daily Work Hub safe link boundary, the 2026-07-02 Parish Health Score V1, the Safe Dashboard Href utility, the Daily Operating Signal safe link boundary, the Parish Health and Operational Intelligence safe link boundary, the Daily operating dashboard read-only boundary, the 2026-07-02 Workflow Reminders V1 Dashboard Preview, the 2026-07-02 Operational Intelligence Brief, the 2026-07-02 Daily Operating Signal Inputs, the 2026-07-05 Daily Work Hub ready-for-staff-review signals, the 2026-07-05 Daily Work Hub request-to-record continuity cue, the 2026-07-05 Daily Work Hub Records Handoff Drilldown Cue, the 2026-07-05 Operational Intelligence Continuity Bottleneck slice, the 2026-07-05 Operational Intelligence Continuity Browser QA Checklist, blocked preflight evidence, a passed localhost/shared-QA browser QA run, a read-only localhost/shared-QA recheck for the continuity cues, dashboard continuity empty-state polish, a zero-continuity empty-state browser QA readiness worksheet, zero-continuity empty-state browser QA passed in localhost/shared-QA, the Daily Office Handoff Digest DTO, the Daily Office Handoff Digest safe link boundary, visible Daily Office Handoff Digest UI, Daily Office Handoff Digest Browser QA, 2026-07-05 and 2026-07-06 Daily Office Handoff Digest browser QA recheck blocker notes, Daily Office Handoff saved-view presets, the Daily Office Handoff saved-view dashboard UI approval packet, the Daily Office Handoff saved-view dashboard UI source preflight, the visible Daily Office Handoff saved-view dashboard UI, the Daily Office Handoff saved-view handoff-rhythm polish, the Daily Office Handoff saved-view dashboard browser QA checklist, the Daily Office Handoff saved-view dashboard browser QA evidence template, and the Daily Office Handoff saved-view safe link boundary exist. Deeper role-specific pages, persisted saved views, browser QA evidence for the saved-view UI, historical trend comparison, richer source-specific drilldowns, and staging/owner-reviewed evidence for the newest continuity cues remain. |
| No-code workflow automation | Partially implemented | Workflow templates, request playbooks, checklist logic, SLA settings, next-step engines, the 2026-07-02 Workflow Reminders V1 DTO Foundation, a read-only dashboard reminder preview, read-only people, household, sacramental record, and certificate-event metadata inputs, the 2026-07-02 Workflow Reminders V1 Runtime Approval Packet, the 2026-07-02 Workflow Reminders V1 Disposition DTO Foundation, the 2026-07-02 Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet, and the 2026-07-08 Workflow Reminder Preview safe link boundary exist. Runtime trigger/action builder, implementation, retries, delivery rules, reminder persistence, scheduling/dismissals, and workflow analytics remain. |
| Permission-aware search and reporting | Partially implemented | Global search, reports, request analytics, active parish read-path work, selected-parish search context labels, the 2026-07-05 Global Search Request Scope Hardening, the 2026-07-05 Global Search Request Scope UX Cue, and the 2026-07-07 Global Search Partial Results Warning exist. Natural-language reporting and saved views remain. |
| AI summarize, draft, route, recommend | Partially implemented | AI summary and reply routes exist, plus relationship intelligence/suggested actions. The summary route has gated safety-chain runtime scaffolding and the reply route now has a disabled-by-default fail-closed safety gate scaffold, a non-runtime permission-scoped reply retrieval DTO, non-runtime DTO-backed reply prompt assembly/audit-preparation/source-review response scaffolding, a disabled-by-default fail-closed reply safety-chain adapter that validates staff, active parish, request ownership, DTO prompt assembly, safe audit metadata, and staff review before returning `ai_reply_unavailable` without OpenAI, a source preflight for future reply audit-write/safe-response gates, and a non-runtime safe audit event validator for future reply audit inserts. Reply audit writes, source-display exposure, staff disposition tracking, generation approval, confidence/source display in staff UI, and document intelligence remain. |
| Security as product | Partially implemented | Staff authorization, RLS hardening, audit events, route-level access helpers, disposable RLS validation evidence, active parish context work, the 2026-07-02 CI production-readiness workflow, the 2026-07-02 Production observability readiness plan, the 2026-07-05 Production support escalation matrix, the 2026-07-05 Production monitoring and support owner intake worksheet, the 2026-07-05 Production monitoring approval packet, the 2026-07-05 Production monitoring smoke evidence template, the 2026-07-05 Production monitoring runtime implementation approval packet, the 2026-07-05 Production monitoring runtime source preflight, the 2026-07-05 Production monitoring non-production redaction smoke QA packet, the 2026-07-05 Production monitoring owner readiness completion worksheet, the 2026-07-05 Production monitoring evidence package index, the 2026-07-05 Trust center public claims boundary matrix, the 2026-07-05 Trust center claims owner review worksheet, the 2026-07-05 Trust center claims owner review filled example, the 2026-07-07 trust center public claims consistency checker, the 2026-07-05 incident tabletop owner/sign-off worksheet, the 2026-07-05 non-production incident tabletop drill execution approval packet, the 2026-07-05 non-production incident tabletop drill evidence template, the 2026-07-05 incident tabletop evidence package index, and the 2026-07-06 demo-request, staff email send, request notification, audit-event, public intake, request detail access, request portal-token, request document, family portal document upload, staff access, workflow templates, imports, daily brief, Google OAuth, Google Calendar event, AI route, central audit helper safe error logging, server warning safe logging hardening, production monitoring safe event contract strengthening, production monitoring support routing map, production monitoring redaction smoke case matrix, production monitoring runtime approval readiness gate, production monitoring evidence package consistency checker with critical artifact-boundary validation, membership-aware RLS production approval readiness gate, membership-aware RLS production approval input builder, membership-aware RLS production approval dry run, membership-aware RLS production go/no-go dry-run evidence template, membership-aware RLS production go/no-go evidence validator, membership-aware RLS go/no-go validated example, membership-aware RLS production evidence package consistency checker with critical artifact-boundary validation, production-sensitive gate boundary index/checker with CSP coverage, local release-readiness verification command, release-readiness handoff consistency guard with RLS, production monitoring, and CSP locked-gate coverage, local release-readiness evidence validator, local release-readiness validated example, completed local release-readiness evidence, production release-readiness human review packet, production security headers baseline, production CSP report-only approval packet, production CSP report-only runtime source preflight, production CSP report-only evidence package consistency checker, release environment guard hardening for CSP report-only runtime, observability runtime, and export audit reviewer dashboard production flags, public-intake client notification safe logging, Google Calendar auth-error safe logging, dashboard Supabase error redaction, Audit Log client safe messages, Parish Settings API safe errors, Record Certificate route safe errors, API route safe-error regression guard, dashboard Server Action safe-error regression guard, core dashboard mutation safe errors for People, Households, Household Members, and Mass Intentions, Request dashboard action safe errors, `npm run check:rls-production-evidence`, `npm run check:production-monitoring-evidence`, and `npm run check:csp-report-only` wired into the local/CI release-readiness path exist. MFA/SSO, field-level permissions, export controls, runtime production observability, named production support coverage approval, actual incident tabletop execution evidence, owner-approved monitoring smoke, production RLS final approval, runtime CSP QA, and public trust-center publishing remain. |
| Diocesan/multi-parish governance | Planned but not fully built | Membership foundation, active parish context helpers, routing docs, and disposable operational RLS validation exist. Production operational RLS promotion and diocesan administration are not complete. |
| Integrations | Partially implemented | Google Calendar, Resend email, OpenAI, CSV imports, and Supabase exist. Giving/accounting, SMS, Microsoft 365, website/forms, background-check, API, and webhooks remain. |
| Mobile/PWA staff experience | Planned but not fully built | Existing UI is responsive in many areas, but there is no installable PWA, offline-safe drafting, push notifications, or mobile-first staff task surface yet. |
| Onboarding and migration | Partially implemented | Parish onboarding, imports, readiness cards, demo scripts, seed data, the 2026-07-02 Go-Live And Migration Readiness onboarding section, and the 2026-07-08 Onboarding Readiness safe link boundary exist. Competitor-specific migration utilities and field-mapping memory remain. |

Legend: Already implemented means production-shaped code exists. Partially implemented means a usable foundation exists but the research recommendation is broader. Planned but not fully built means guardrails or docs exist but the feature is not user-complete. Missing entirely means no meaningful code surface was found.

## Definitive Roadmap Epics

| Order | Epic | Priority | Customer impact | Competitive impact | Difficulty | Dependencies | Estimated effort | Business value |
|---:|---|---|---|---|---|---|---|---|
| 1 | Multi-parish and diocesan tenancy foundation | P0 | Very high | Very high | High | Membership context, active parish read/write helpers, operational RLS QA | 4-8 weeks | Unlocks clusters, pastorates, diocesan pilots, and trust claims |
| 2 | Role-based parish work hub | P0 | High | High | Medium | Existing command center, workload, care cadence, permissions | 2-4 weeks | Makes demos clearer and helps staff know what to do first |
| 3 | Follow-up engine and workflow automation | P0 | Very high | Very high | High | Workflow templates, SLA settings, request timeline, email/calendar | 6-10 weeks | Makes Vinea the system that prevents dropped parishioner care |
| 4 | Catholic records and certificate depth | P0 | Very high | Very high | Medium | Sacramental records, certificate route, document portal, audit events | 4-8 weeks | Creates Catholic-specific moat and switching reason |
| 5 | Family and duplicate intelligence | P1 | Very high | Very high | Medium | People/households, duplicate helpers, import history | 3-6 weeks | Reduces data cleanup pain and migration fear |
| 6 | Permission-aware search and reporting | P1 | High | High | High | Active parish scope, global search, reports, saved filters | 5-8 weeks | Reduces report-builder dependence and module hopping |
| 7 | AI assistant safety layer | P1 | High | High | High | Staff authorization, audit events, AI routes, search/retrieval DTOs | 5-9 weeks | Differentiates AI as useful, reviewable, and Catholic-workflow aware |
| 8 | Parish onboarding and migration studio | P1 | High | Medium | Medium | Imports, onboarding readiness, sample data, CSV templates | 3-6 weeks | Improves pilot conversion and lowers support burden |
| 9 | Communications operating layer | P1 | High | Medium | Medium | Resend, request communication history, templates, family portal | 4-8 weeks | Reduces inbox drift and keeps family contact history visible |
| 10 | Mobile staff workspace and PWA | P2 | High | Medium | Medium | Responsive dashboard, route handlers, notification strategy | 4-8 weeks | Supports priests and staff away from the office |
| 11 | Integrations and API layer | P2 | High | High | High | Permission model, audit logs, export/import, webhook schema | 8-16 weeks | Expands ACV and reduces duplicate entry |
| 12 | Religious education / OCIA / sacramental prep workspace | P2 | Very high | Very high | High | People, households, records, workflows, document portal | 8-14 weeks | Deepens Catholic differentiation beyond generic ChMS |
| 13 | Volunteer scheduling and readiness workflows | P3 | Medium | Medium | Medium | People/households, workflow automation, mobile workspace | 6-10 weeks | Broadens operational footprint after core office workflows mature |
| 14 | Trust center, governance, backup, and retention | P0 | High | High | Medium | Audit events, RLS evidence, production runbooks | 2-5 weeks | Supports enterprise trust and sales confidence |

## Current Highest-Priority Initiative

### Multi-Parish / Diocesan Tenancy Foundation

Status: In progress, with production promotion still gated by human approvals and production-safe fixtures.

Why this matters:

- Parish clusters and diocesan pilots require real user-to-parish membership.
- Vinea cannot credibly claim diocesan readiness while operational policy shape still depends on the V1 primary-parish fallback.
- The research report identifies diocesan-grade governance as part of the category opening, not an enterprise afterthought.

Safe phase order:

1. Complete manual authenticated cross-parish allow/deny QA after the successful disposable operational RLS rehearsal.
2. Promote membership-aware operational RLS only after the promotion checklist is complete.
3. Continue moving selected read paths and write paths to validated active parish context.
4. Add a simple, obvious parish switcher experience for authorized multi-parish staff.
5. Add diocesan reporting and parish-cluster administration after tenant safety is proven.

Current rule:

- Do not apply operational RLS to shared QA or production until promotion gates are complete.
- Preserve explicit compatibility fallback only where the code has not yet been deliberately moved to active parish context.

## Recently Completed Product Slice

### Production Release Readiness Local Rerun Evidence

Status: Captured on 2026-07-08 as a passed process-clean local release-readiness rerun.

What changed:

- Added `docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_EVIDENCE_20260708.md`.
- Added `lib/server/releaseReadinessLocalRerunEvidence.test.ts`.
- Recorded that the current shell first failed closed because non-production QA runtime residue was present, then the full release runner passed from a process-clean child process.
- Verified the full 12-command release sequence: release-env guard, RLS evidence, production monitoring evidence, production gates, CSP report-only evidence, trust-center claims, release handoff, typecheck, all-file typecheck, quiet lint, full Vitest, and production build.
- Preserved that production-sensitive features, public trust claims, production deployment, migrations, operational RLS changes, exports, AI calls, storage, signed URLs, communications, and certificate generation remain `NO-GO`.

Why it matters:

- Reviewers now have a fresh local health receipt after the latest safe-link hardening work.
- The release environment guard proved it still fails closed when QA/prototype runtime residue is present.
- The result improves confidence without bypassing any production approval gates.

### Local Release Readiness Verification Checklist

Status: Implemented on 2026-07-06 as a repository-only production-readiness checklist.

What changed:

- Added `npm run check:release-env` backed by `scripts/check-release-readiness-env.mjs`.
- Added the CI release environment guard so automated verification runs `npm run check:release-env` before production gate boundary checks.
- Added a local release-readiness evidence template so reviewers can record pass/fail results and sanitized output labels without granting production approval or capturing secrets.
- Added a README release-readiness entry point with the command sequence, checklist link, evidence-template link, and production-safety boundary.
- Added a production release-readiness handoff index that links the README entry point, local checklist, evidence template, CI workflow, release-env guard, production gate boundary index, and production gate checker in one reviewer starting point.
- Added `npm run check:trust-center-claims`, backed by `scripts/check-trust-center-claims.mjs`, so local and CI release-readiness checks verify public trust-center publishing and public claims remain blocked before handoff review.
- Added `npm run check:csp-report-only`, backed by `scripts/check-csp-report-only-evidence.mjs`, so local and CI release-readiness checks verify CSP report-only evidence remains ready for review while runtime CSP, production CSP, enforcing CSP, and public trust-center claims remain blocked.
- Strengthened the CSP report-only runtime preflight so future runtime code must satisfy every marker in each gate before report collection, including explicit health, staff sign-in, selected-parish switching, public intake, family portal, Google OAuth callback, document UI, and certificate view smoke labels.
- Added `npm run check:rls-production-evidence`, backed by `scripts/check-rls-production-evidence.mjs`, so local and CI release-readiness checks verify membership-aware RLS production evidence remains ready for final human review while production rollout, migrations, and operational RLS changes remain blocked.
- Added `npm run check:production-monitoring-evidence`, backed by `scripts/check-production-monitoring-evidence.mjs`, so local and CI release-readiness checks verify production monitoring evidence remains ready for runtime approval review while runtime monitoring, external sends, production smoke, and public trust claims remain blocked.
- Strengthened the production monitoring runtime preflight so future monitoring code must satisfy every marker in each gate before any external monitoring send, rather than passing on a partial marker match.
- Strengthened the older observability runtime preflight so future observability code must satisfy every marker in each gate before any external observability send, aligning it with the stricter production monitoring preflight boundary.
- Aligned the CSP report-only runtime preflight error output with its strict all-markers behavior, so incomplete future CSP gates no longer produce misleading "one marker is enough" language.
- Strengthened the AI route runtime wiring preflight so future summary and reply route code must satisfy complete route-specific marker sets before `openai.responses.create`, rather than passing on a partial marker from a mixed summary/reply list.
- Strengthened the AI reply audit-write/safe-response gate preflight so future reply audit/response code must satisfy complete marker sets before gate ordering can pass, rather than passing on partial environment/approval/audit/response markers.
- Strengthened the export route runtime wiring preflight so future export code must satisfy complete marker sets before any export query or delivery marker, rather than passing on partial runtime/scope/blocked-field/audit markers.
- Aligned the export route runtime wiring preflight with the implemented helper-backed export routes, so `request_list_basic` and `request_document_manifest` can delegate exact flag validation to `getExportRuntimeGate(process.env)` while still proving `gate.enabled`, generic disabled responses, blocked-field/family-surface denial, safe audit metadata, query, and delivery ordering.
- Strengthened the sacramental record correction/notation runtime preflight so future Catholic-records scaffold code must satisfy complete marker sets before any scaffold response or approved event write, rather than passing on partial runtime/scope/ownership/audit markers.
- Strengthened the certificate issuance logging runtime preflight so future certificate logging scaffold code must satisfy complete marker sets before any scaffold response or approved event write, rather than passing on partial runtime/scope/ownership/audit markers.
- Added `npm run check:release-local`, backed by `scripts/run-release-readiness-local.mjs`, so reviewers can run the approved local checklist in one command or preview the command order with `--plan`.
- Hardened the local release-readiness runner on Windows so it launches child npm commands through the proven `cmd.exe /d /c npm.cmd ...` adapter with `shell: false`, preserving the command order while avoiding the `npm_execpath` child-process drift that blocked runner-spawned Vitest from loading `vitest.config.ts`.
- Added a release-readiness handoff consistency guard, `npm run check:release-handoff`, backed by `scripts/check-release-readiness-handoff.mjs`, so CI and local review can verify the handoff index, checklist, evidence template, RLS production evidence checker, production monitoring evidence checker, CSP report-only evidence checker, trust-center claims checker, CI order, locked gates, sanitized evidence rules, and the read-only/non-deploying CI boundary have not drifted.
- Added a local release-readiness evidence validator so filled label-only release evidence can be checked for command order, passing statuses, sanitized guard outputs including the RLS production evidence check, production monitoring evidence check, CSP report-only evidence check, and trust-center public claims check, safety-boundary confirmations, required follow-up approvals, forbidden raw output, and `productionApprovalGranted: false` before it is used in a handoff.
- Added a sanitized local release-readiness validated example so reviewers can see the expected passing evidence shape without treating it as real rollout evidence or production approval.
- Added completed local release-readiness evidence from the 2026-07-07 Codex verification session, validated through the local evidence helper and kept explicit that production-sensitive features remain `NO-GO`.
- Refreshed the completed local evidence later in the 2026-07-07 session after safe logging/dashboard redaction hardening, then refreshed it again on 2026-07-08 after completed-evidence checker safety-boundary alignment; the full `npm run check:release-local` runner returned `LOCAL_RELEASE_READINESS_PASSED` with production-sensitive approvals and public trust claims still false.
- Added `npm run check:release-local-evidence`, backed by `scripts/check-release-local-evidence.mjs`, so reviewers can validate the completed evidence file itself for the required command sequence, pass labels, local validator decision, `NO-GO` production boundaries, no-added-production-flags confirmation, no-Google-Calendar-data-touch confirmation, and secret-shaped value exclusions without rerunning the heavy release checklist.
- Added a production release-readiness human review packet that turns the completed local evidence into a reviewer decision record while keeping every production-sensitive gate separate and locked.
- The checklist documents the stable top-level sequence for production gate boundary checks, production/source typecheck, all-file typecheck, quiet lint, full Vitest, and production build.
- The environment guard refuses to start when known production-sensitive runtime flags are enabled in the shell.
- The guard now includes AI reply safety runtime, AI reply audit-write, AI reply safe-response exposure, and AI reply runtime environment flags, treats `NON_PRODUCTION` as enabled-like, and refuses configured `_ACK` / `_ENV` residue for known production-sensitive QA/prototype gates so QA shells fail closed during release verification.
- The local release-readiness evidence template and validator now require `qaPrototypeRuntimeResidueConfigured: false`, so future release evidence records the same QA/prototype residue boundary in a label-only field.
- The release handoff index and human review packet now list AI reply audit-write/safe-response/generation/outbound-send rollout as the 14th locked gate, matching the production gate checker.
- The completed July 7 local release evidence now includes a 2026-07-08 focused gate-count recheck addendum and a superseding 2026-07-08 full local release runner refresh requiring production-gates artifact count `14`, release-handoff artifact count `28`, release-handoff locked gate count `14`, full Vitest `544` files / `2,172` tests, cleanup-guide evidence by name only, no production approval, and a fresh full local checklist before any later material release handoff.
- The local release-readiness evidence DTO, validator, template, validator guide, and validated example now require structured sanitized count fields for production-gates artifact count `14`, linked-artifact count `14`, existing-artifact count `14`, release-handoff artifact count `28`, release-handoff locked gate count `14`, and human-review boundary count `17`.
- CI now runs `npm run check:release-local-evidence` after `npm run check:release-handoff`, and the handoff checker enforces the completed-evidence checker as a required release-readiness artifact with CI command count `14`.
- The completed-evidence checker now requires the completed evidence record to state that no production flags were added and no Google Calendar data was touched, keeping the roadmap, SSoT, README, handoff index, and machine checker aligned.
- The handoff checker now verifies the CI workflow remains read-only and non-deploying: `permissions: contents: read`, no production environment target, no deploy/migration commands, and no shared-QA database, service-role, or OpenAI credential variable references.
- Added a source-level test and local verification doc that preserve the safety boundary and make clear this command does not deploy or approve production-sensitive features.
- Added `npm run check:release-env-cleanup-guide`, backed by `scripts/prepare-release-readiness-env-cleanup.mjs`, so reviewers can list configured production-sensitive QA/prototype runtime residue by variable name only and receive copy-paste PowerShell cleanup commands without printing secrets or mutating the environment automatically.
- Added the release environment cleanup guide, cleanup helper, and shared flag config to the release handoff package, increasing the current handoff artifact count to `28` while keeping historical completed local evidence label-only and requiring a fresh full local checklist before later material release handoff.
- Added optional `releaseEnvCleanupGuide` fields to the local release-readiness evidence DTO, template, validator guide, and validated example so future evidence can record cleanup-guide usage by variable name and safe label only, while rejecting mutation claims, secret printing, raw value capture, unsupported decisions, and unsupported cleanup scopes.
- Updated the completed local evidence checker so it now verifies the validator guide still documents the cleanup-guide safety boundary, making the new evidence field part of the release-readiness drift checks.
- Updated the production release-readiness human review packet so reviewers see the cleanup-guide evidence source and the latest label-only process-scope cleanup summary before considering any gate-specific human review.
- Updated the release handoff checker so it separately enforces the human review packet cleanup-guide boundary phrases and reports a cleanup-guide boundary count without changing production approval status.
- Captured `docs/PRODUCTION_RELEASE_READINESS_LOCAL_RERUN_BLOCKED_20260708.md` after a fresh post-dashboard release-env check correctly refused the current shell because non-production AI summary QA runtime variables were still present; the cleanup guide reported names and safe labels only, did not mutate the environment, and the full local release runner was not started.

Why this was chosen:

- Vinea now has many independent quality gates. This gives future release reviewers one conservative local command to run before asking for production-sensitive approval.
- The command improves discipline without enabling production flags, applying migrations, changing operational RLS, mutating records, running exports, calling AI, touching Google Calendar data, accessing storage, creating signed URLs, sending communications, generating certificates, or making public trust claims.

### Production-Sensitive Gate Boundary Index

Status: Implemented on 2026-07-06 as a repository-only production-readiness guardrail.

What changed:

- Added a single production-sensitive gate boundary index that links the current authoritative boundary artifacts for production RLS, production monitoring, public intake runtime routing, AI summary safety-chain rollout, request-list export, document-manifest export, export audit reviewer dashboard exposure, backup/restore public claims, public trust-center claims, Workflow Reminders V1 runtime, certificate issuance logging, and sacramental correction/notation workflows.
- Added a source-level consistency checker and focused test that verify each gate artifact exists, remains linked, preserves required `NO-GO` or approval-boundary language, and avoids secret-like values.
- Added `lib/server/productionGateBoundaryCheck.test.ts`, `scripts/check-production-gates.mjs`, `npm run check:production-gates`, and CI wiring so the RLS, monitoring, and master production-sensitive boundary checks run before lint/build.
- The checker keeps `productionSensitiveFeaturesApproved` and `publicTrustClaimsApproved` false, so the index cannot be mistaken for production approval.

Why this was chosen:

- Vinea now has many strong readiness packets, but production readiness depends on not confusing planning evidence with production approval.
- This gives reviewers one small map of the riskiest switches and one automated check before any production-sensitive approval prompt is prepared.

### Membership-Aware RLS Production Approval Readiness Gate

Update 2026-07-06: A label-only production approval input builder now converts non-secret owner and fixture labels into the readiness gate input and blocks missing or secret-looking labels before any final production approval prompt is requested.

Update 2026-07-06: A repository-only production approval dry run now evaluates the filled label-only packet through the input builder and readiness gate, producing sanitized pass/fail JSON before any final production approval prompt is requested.

Update 2026-07-06: A sanitized production go/no-go dry-run evidence template now defines how to record repository-only dry-run summary values, required owner/fixture/evidence status, remaining NO-GO boundaries, exact approval phrase boundary, and final human approval placeholders before any production RLS approval prompt is requested.

Update 2026-07-06: A repository-only go/no-go evidence validator now checks filled sanitized evidence records, rejects raw labels/secrets/approval-phrase capture, and keeps `readyForProductionRollout` false until separate human approval.

Update 2026-07-06: A repository-only validated example now shows the safe go/no-go evidence shape and validator result using the current filled label-only packet, without exposing raw labels or approving production rollout.

Update 2026-07-06: A repository-only evidence package consistency checker now verifies required production RLS approval artifacts are linked, exist, preserve review order/gates/exclusions/hard stops, and keep production rollout blocked before any final approval prompt is requested.

Status: Implemented on 2026-07-06 as a non-runtime production-readiness guardrail.

What changed:

- Added a source-level readiness evaluator for whether Vinea can request final product-owner approval for membership-aware operational RLS production rollout.
- The gate checks owner statuses, fixture statuses, evidence statuses, smoke verification coverage, safe production target labels, and out-of-scope confirmations.
- Updated the production RLS evidence package index so this gate sits before any final approval prompt is requested.

Why this was chosen:

- Production RLS is still one of the highest-impact blockers, but touching production still requires explicit approval.
- This makes the approval path more testable without applying migrations, accessing production, changing operational RLS, mutating records, running exports, calling AI, touching Google Calendar data, accessing storage, creating signed URLs, sending communications, generating certificates, or making public trust claims.

### Production Monitoring Runtime Approval Readiness Gate

Status: Implemented on 2026-07-06 as a non-runtime production-readiness guardrail.

Update 2026-07-06: A repository-only production monitoring evidence package consistency checker now verifies required monitoring approval artifacts are linked, exist, preserve dependency steps, human-input labels, review checks, and production `NO-GO` boundaries before any runtime approval request.

What changed:

- Added a source-level readiness evaluator for whether Vinea can request product-owner approval for future non-production monitoring runtime scaffolding.
- The gate composes non-secret owner intake validation, review statuses, executable redaction-smoke case coverage, and explicit production monitoring/smoke/public-claims `NO-GO` confirmations.
- Updated the production monitoring evidence package index so this readiness gate sits before any runtime-scaffold approval request.

Why this was chosen:

- The monitoring chain was ready for more discipline, but runtime monitoring itself remains unapproved.
- This makes the next approval step safer without enabling monitoring, adding flags, wiring a provider, sending events, paging staff, creating incidents, contacting customers, accessing production, applying migrations, changing operational RLS, running exports, calling AI, or making public trust claims.

### Production Monitoring Redaction Smoke Case Matrix

Status: Implemented on 2026-07-06 as non-runtime production-readiness DTO/testing coverage.

What changed:

- Added executable case coverage for authentication failure, active-parish/RLS denial, document portal denial, family portal denial, export denial, AI failure, Google Calendar failure, email failure, and `/api/health` failure.
- Strengthened observability context redaction so sensitive context keys are redacted by key, not only by value pattern.
- Fixed family portal category inference before the generic portal/document category.

Why this was chosen:

- Future production monitoring needs redaction smoke cases that can be tested before runtime monitoring is approved.
- This keeps monitoring fully off while making the next QA gate more concrete.

### Production Monitoring Support Routing Map

Status: Implemented on 2026-07-06 as non-runtime production-readiness hardening.

What changed:

- Added a label-only support-routing mapper for future production monitoring events.
- The mapper returns severity, monitoring owner label, support owner label, required role labels, customer-impact label, response target, customer-communication boundary, and rollback boundary.
- Focused tests verify high-risk privacy routing and low-risk health-check routing.

Why this was chosen:

- Future monitoring needs human owner routing before any external provider is wired.
- This keeps support escalation practical while preserving the no-runtime/no-customer-contact boundary.

### Production Monitoring Safe Event Contract

Status: Implemented on 2026-07-06 as non-runtime production-readiness hardening.

What changed:

- The observability DTO now has explicit safe-event flags for provider payloads, signed URLs, storage paths, document payloads, raw exports, original filenames, and family portal token material.
- Safe events now include monitoring safety metadata that keeps external delivery, automatic customer communication, forbidden-payload checks, and rollback boundaries explicit.
- Focused tests verify safe DTO output and rejection of forged unsafe monitoring payloads.

Why this was chosen:

- Future monitoring should not be wired until the safe payload contract is enforceable.
- This reduces leakage risk before any production monitoring vendor, flag, smoke, or public trust claim is approved.

### Shared Safe Error Logging Key Redaction

Status: Implemented on 2026-07-07 as central production-readiness logging hardening.

What changed:

- The shared server logging helper now redacts sensitive extra fields by key name, not only by secret-looking value pattern.
- Sensitive key families include tokens, secrets, passwords, authorization/cookies, signed URLs, database URLs, service-role/anon keys, emails, original filenames, storage paths, document contents, raw payloads, and portal material.
- Error and warning context strings now pass through the same sensitive text redaction path.
- Focused tests verify value-pattern redaction, key-name redaction, safe operational labels, and the documentation/source boundary.

Why this was chosen:

- Many routes already use the shared safe logging helper.
- Making the helper fail safe by key reduces future leak risk without changing route behavior, production flags, migrations, operational RLS, exports, AI, storage, signed URLs, communications, certificates, Google Calendar data, or public trust claims.

### Active Parish Context Safe Technical Details

Status: Implemented on 2026-07-07 as scoped multi-parish production-readiness privacy hardening.

What changed:

- The active-parish read context helper now redacts error-derived `technicalDetail` and `fallbackReason` values before returning them.
- The staff write parish context helper now redacts error-derived `technicalDetail` and `fallbackReason` values before returning them.
- Focused tests prove simulated membership/display lookup errors containing emails, token-like values, bearer tokens, and database URLs are redacted.

Why this was chosen:

- Active-parish context helpers sit near tenant authorization and fallback behavior.
- Sanitizing diagnostic details reduces cross-tenant/privacy leak risk without changing staff authentication, membership checks, selected-parish behavior, primary-parish fallback eligibility, operational RLS, migrations, records, exports, AI, storage, signed URLs, communications, certificates, Google Calendar data, or public trust claims.

### Server Warning Safe Logging

Status: Implemented on 2026-07-06 as scoped production-readiness warning-log hardening.

What changed:

- Added `logServerWarning` to the shared safe logging helper.
- Demo request, request notification, and workflow-template missing-RPC warnings now use the redacted warning helper instead of direct runtime `console.warn` calls.
- Existing public/staff behavior, email behavior, and workflow-template fallback behavior are unchanged.
- Focused tests now verify warning redaction and source-level direct warning removal from the hardened files.

Why this was chosen:

- Warning logs can become production monitoring events later.
- Routing them through the shared redaction helper reduces leakage risk before production monitoring is approved.

### Audit Log Helper Safe Error Logging

Status: Implemented on 2026-07-06 as central audit-write production-readiness hardening.

What changed:

- `writeAuditEvent` now logs audit insert failures through the shared safe error logging helper.
- Failure logs include safe action/target labels and presence booleans instead of raw actor emails, parish IDs, target IDs, or audit metadata.
- Existing audit insert behavior and swallowed failure behavior are unchanged.
- Focused tests now verify redaction and the source-level logging boundary.

Why this was chosen:

- Audit logging underpins sensitive staff, export, AI, document, public intake, and admin flows.
- A failed audit write should be visible to operators without leaking raw operational detail into logs.

### AI Routes Safe Error Logging

Status: Implemented on 2026-07-06 as scoped staff AI route production-readiness hardening.

What changed:

- AI summary and AI reply routes now log unexpected catch-path failures through the shared safe error logging helper.
- AI reply now has non-runtime validators for future safe audit-event writes and future safe-response exposure, keeping raw prompts, generated output, provider payloads, token material, storage details, signed URLs, autonomous send controls, and family-facing output blocked before future runtime wiring.
- AI reply now has a non-runtime non-production QA packet for future audit-write and safe-response gates, covering flag-off baseline, audit approval, safe-response exposure, denial cases, label-only evidence capture, rollback, and production `NO-GO` boundaries.
- Staff-facing AI route 500 responses now use generic temporary-unavailable text instead of raw exception messages.
- The legacy AI summary path now awaits the legacy helper so provider failures are caught by the route error boundary.
- Existing staff authentication, disabled-by-default AI summary safety-chain gates, OpenAI model/provider behavior, AI reply behavior, and production NO-GO boundaries are unchanged.
- Focused runtime/source tests now guard the safe logging boundary.

Why this was chosen:

- AI route failures can be close to prompts, staff context, request data, emails, or provider tokens.
- This improves production-readiness without enabling customer-facing AI changes, production flags, migrations, exports, storage, Google Calendar changes, or public claims.

### Google Calendar Event Safe Error Logging

Status: Implemented on 2026-07-06 as scoped Google Calendar event-route production-readiness hardening.

What changed:

- Google Calendar create, update, and delete event routes now log unexpected catch-path failures through the shared safe error logging helper.
- The routes no longer directly log raw Google Calendar exception objects or serialized provider payloads from the route source.
- Existing staff authentication, selected active parish scope, request ownership checks, selected-parish integration behavior, conflict handling, mismatched-calendar denials, delete not-found tolerance, OAuth reconnect handling, and event route semantics are unchanged.
- Focused source tests and docs validation now guard the safe logging boundary.

Why this was chosen:

- Google Calendar event routes are high-trust integration paths close to OAuth credentials, provider responses, parish calendar selection, and request scheduling.
- Hardening these routes improves production readiness without changing event create/update/delete behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, or public trust claims.

### Staff Login Safe Errors And Accessible Labels

Status: Implemented on 2026-07-07 as scoped authentication UX and production-readiness hardening.

What changed:

- The staff login form now maps Supabase Auth/provider failures through a curated safe-message helper instead of rendering raw provider text.
- Thrown sign-in exceptions and returned auth errors use the same safe message path.
- Email and password fields now have explicit visible labels connected to stable input IDs.
- Focused helper and source-level tests guard the safe-message and label boundary.

Why this was chosen:

- Staff login is one of the most sensitive product surfaces and one of the first experiences every parish office user has.
- This improves privacy and accessibility without changing authentication semantics, staff authorization, redirects, active parish scope, production flags, migrations, operational RLS, exports, AI, storage, signed URLs, communications, certificates, Google Calendar behavior, public intake routing, or public trust claims.

### Family Portal Document Client Safe Messages

Status: Implemented on 2026-07-07 as scoped family-facing document privacy hardening.

What changed:

- The family portal document upload UI now uses a safe allowlist for upload failure messages before showing text to families.
- Known validation/setup messages remain visible, including invalid/expired link, missing selected document, missing file, over-size file, generic upload failure, and missing document-storage setup.
- Unknown browser, storage, provider, network, token, database, or exception details fall back to generic family guidance.
- Focused helper and source-level tests guard the family-facing message boundary.

Why this was chosen:

- Family portal document upload is close to private documents and portal links.
- This reduces leak risk without changing family portal token validation, storage upload behavior, request-document inserts, audit writes, cleanup, staff review, production flags, migrations, operational RLS, exports, AI, communications, certificates, Google Calendar behavior, or public trust claims.

### Request Detail Client Safe Messages

Status: Implemented on 2026-07-07 as scoped staff-facing request-detail privacy hardening.

What changed:

- Repeated request-detail client-visible failures now use `lib/requestDetailClientMessages.ts`.
- Covered activity loading, AI summary/reply failures, reply draft save, staff notes, suggested dates, confirmed dates, funeral/wedding/OCIA save paths, communication logging, email partial failures, and Google Calendar generic create/update/delete failures.
- Existing Google OAuth reconnect guidance remains on the specialized safe helper path.
- Focused helper, source-level, docs, and README tests guard the boundary.

Why this was chosen:

- Request detail is the staff screen closest to notes, follow-up dates, communications, email, AI drafts, calendar events, and pastoral workflow details.
- This reduces leak risk without changing staff workflows, request authorization, selected active parish scope, AI gates, email delivery behavior, communication logging semantics, Google Calendar event behavior, OAuth reconnect detection, production flags, migrations, operational RLS, exports, certificates, automation, or public trust claims.

Update 2026-07-07:

- Extended `lib/requestDetailClientMessages.ts` with allowlisted API-response messages for request access verification and request activity loading.
- Updated `app/dashboard/requests/[id]/page.tsx` so the initial detail-access check and activity loader no longer reflect arbitrary API error text directly to staff.
- Expanded helper, source, and documentation tests to cover these load paths.
- This keeps request detail failure states safe without changing request authorization, selected parish scope, activity loading behavior, staff actions, production flags, migrations, operational RLS, exports, AI, certificates, automation, Google Calendar, or public trust claims.

Update 2026-07-07 refinement:

- Extended the same curated helper to request-detail subcomponents for intake-detail save failures and waiting-for save/clear failures.
- Updated `EditRequestDetailsSection` and `RequestHeader` so unexpected caught errors no longer surface raw exception `.message` text to staff.
- Expanded helper and source tests to guard the subcomponent paths.
- This keeps the request-detail staff experience safer without changing request mutations, authorization, active-parish scope, production flags, migrations, operational RLS, exports, AI, certificates, automation, Google Calendar, storage, signed URLs, communications, or public trust claims.

Update 2026-07-07 OCIA helper hardening:

- Updated `lib/ensureOciaRequestDetails.ts` so select/insert/race failures return stable OCIA staff guidance instead of raw Supabase/database message text.
- Added focused tests and an evidence doc for the OCIA request-detail placeholder boundary.
- This preserves successful OCIA placeholder creation and request-detail behavior without changing request authorization, selected parish scope, operational RLS, migrations, production flags, exports, AI, certificates, automation, Google Calendar, storage, signed URLs, communications, sacramental/canonical decision boundaries, or public trust claims.

Update 2026-07-07 Sacramental Records list hardening:

- Updated `lib/server/loadSacramentalRecordsList.ts` so main records-query failures map through the shared dashboard-safe Supabase error helper before the Records page renders an error.
- Added focused loader, source-level, documentation, and README tests to guard the boundary.
- This preserves selected active parish scope, continuity summaries, continuity filtering, and Records page behavior without changing records, operational RLS, migrations, production flags, exports, AI, certificates, automation, Google Calendar, storage, signed URLs, communications, sacramental/canonical decision boundaries, or public trust claims.

### Request Document Client Safe Messages

Status: Implemented on 2026-07-07 as scoped staff-facing request-document privacy hardening.

What changed:

- The staff request document panel now uses `lib/requestDocumentClientMessages.ts` for visible load, upload, review, open, and family-upload-link failures.
- Unknown backend, storage, signed URL, token, filename, provider, network, or exception details fall back to action-specific safe staff messages.
- Approved setup guidance remains visible when request document storage or family portal token infrastructure is not configured.
- Focused helper, source-level, docs, and README tests guard the boundary.

Why this was chosen:

- Request documents are close to private files, signed URLs, storage paths, original filenames, and family portal links.
- This reduces leak risk without changing document authorization, selected active parish scope, storage upload behavior, signed URL creation behavior, family upload link creation behavior, review semantics, audit behavior, production flags, migrations, operational RLS, exports, AI, communications, certificates, automation, or public trust claims.

### Dashboard Client Safe Messages

Status: Implemented on 2026-07-07 as scoped Daily Work Hub production-readiness hardening.

What changed:

- Dashboard follow-up and care-plan row failures now use `lib/dashboardClientMessages.ts`.
- Covered follow-up draft generation, draft save, email send, communication logging, request summary updates, mark-as-contacted, care touchpoint logging, funeral care date updates, and care request updates.
- Existing successful messages and staff validation prompts remain visible.
- Focused helper, source-level, docs, and README tests guard the boundary.

Why this was chosen:

- The dashboard is the morning operating screen for parish staff and is close to AI draft, email, communication, and follow-up update paths.
- This reduces leak risk without changing dashboard authorization, selected active parish scope, email delivery behavior, communication logging behavior, care-plan semantics, production flags, migrations, operational RLS, exports, storage, signed URLs, certificates, automation, or public trust claims.

### Dashboard Queue Safe Messages

Status: Implemented on 2026-07-07 as scoped Communications Center and Intake Queue production-readiness hardening.

What changed:

- Communications and Intake quick-save Server Actions now use `lib/dashboardQueueClientMessages.ts` for backend failure messages.
- Covered communication touchpoint logging, communication follow-up updates, intake first-contact logging, request quick triage, and Mass intention quick triage.
- The queue clients now render the curated action result directly instead of wrapping it with raw-error text.
- Expected validation messages remain visible for missing ids and invalid dates.

Why this was chosen:

- Communications and Intake are front-desk operating surfaces close to request updates, communication history, and Mass intention triage.
- This reduces leak risk without changing staff authentication, selected active parish scope, communication logging behavior, request update behavior, Mass intention update behavior, production flags, migrations, operational RLS, exports, AI, storage, signed URLs, Google Calendar behavior, certificates, automation, or public trust claims.

### Google Calendar User Error Redaction

Status: Implemented on 2026-07-07 as scoped Google Calendar production-readiness privacy hardening.

What changed:

- Unknown Google Calendar/provider failures now return generic staff-facing guidance instead of raw exception text.
- OAuth reconnect detection and curated safe not-connected/request messages remain.
- Google Calendar diagnostic serialization now recursively redacts sensitive values and sensitive provider keys before logs or integration status details receive them.
- Focused tests verify reconnect guidance, generic unknown failures, curated safe messages, and recursive provider payload redaction.

Why this was chosen:

- Calendar provider errors can be close to OAuth tokens, provider payloads, staff emails, signed URLs, or infrastructure URLs.
- Sanitizing the shared helper reduces leak risk without changing Google OAuth state, selected-parish integration behavior, event create/update/delete behavior, conflict handling, production flags, migrations, operational RLS, exports, AI, storage, signed URLs, communications, certificates, or public trust claims.

### Google OAuth Safe Error Logging

Status: Implemented on 2026-07-06 as scoped Google Calendar OAuth production-readiness hardening.

What changed:

- Google OAuth start now logs missing OAuth configuration and OAuth state-signing failures through the shared safe error logging helper and returns generic staff-facing setup text.
- Google OAuth callback now logs provider error params, state validation, parish authorization, configuration, token response, userinfo fetch, integration upsert, and callback exceptions through safe route/action labels.
- The callback keeps existing `/dashboard/settings?gcal=error` and `/dashboard/settings?gcal=connected` redirects, state-cookie cleanup, and membership-backed selected-parish authorization.
- Focused source tests and docs validation now guard the safe logging boundary.

Why this was chosen:

- Google OAuth handles provider errors, OAuth state, refresh tokens, and selected-parish integration writes.
- Hardening this route improves production readiness without changing Google Calendar event behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, or public trust claims.

### Daily Brief Safe Error Logging

Status: Implemented on 2026-07-06 as scoped daily-operations email production-readiness hardening.

What changed:

- Updated `app/api/parish/daily-brief/route.ts` to use `logServerError` for unexpected manual-send, cron-list, cron-send, and Resend provider failures.
- Preserved staff authentication, selected active parish context for manual sends, cron authorization, all-enabled-parish cron behavior, daily brief rendering, successful sent tracking, and settings validation.
- Changed per-parish cron send failures to store generic `Daily brief send failed.` text instead of raw provider/configuration messages.
- Expanded `lib/server/dailyBriefRoute.test.ts` so manual/cron failure paths cannot return or persist raw provider exception messages.
- Added `docs/DAILY_BRIEF_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Daily Brief is an operational email path and scheduled background route.
- Hardening this route improves production readiness without changing daily brief delivery semantics, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, Google Calendar, or public trust claims.

### Imports Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/imports/route.ts` to use `logServerError` for unexpected import history, preview, commit, row insert, failed-batch recording, and completed-batch recording failures.
- Preserved staff authentication, selected active parish read scope, staff write parish context for committed imports, invalid-input validation messages, preview behavior, import batch recording, and import audit writes.
- Expanded `lib/server/importsRoute.test.ts` so the route cannot return raw database/provider exception messages or write raw insert errors into failed-batch summaries for unexpected import failures.
- Added `docs/IMPORTS_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Imports are a sensitive data-ingest path for people, household, and sacramental record data.
- Hardening this route improves production readiness without changing import semantics, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Workflow Templates Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/parish/workflow-templates/route.ts` to use `logServerError` for unexpected workflow template load, current-step lookup, template ownership lookup, and workflow step update failures.
- Preserved staff authentication, selected active parish read scope, staff write parish context, workflow step patch validation, same-parish template ownership checks, not-found/validation messages, and workflow template audit writes.
- Expanded `lib/server/workflowTemplateSettingsRoute.test.ts` so the route cannot return raw database exception messages for unexpected workflow template failures.
- Added `docs/WORKFLOW_TEMPLATES_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Workflow Templates are a selected-parish admin surface.
- Hardening this route improves production readiness without changing workflow template editing semantics, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Workflow Template Client Safe Messages

Status: Implemented on 2026-07-07 as scoped Settings admin-surface production-readiness hardening.

What changed:

- Added `lib/workflowTemplateSettingsClientMessages.ts`.
- Added `lib/workflowTemplateSettingsClientMessages.test.ts`.
- Added `lib/server/workflowTemplateClientSafeMessagesSource.test.ts`.
- Added `lib/server/workflowTemplateClientSafeMessagesDoc.test.ts`.
- Added `docs/WORKFLOW_TEMPLATE_CLIENT_SAFE_MESSAGES_20260707.md`.
- Updated `app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx` so load/save failures and caught browser exceptions render only allowlisted staff messages or generic retry fallbacks.

Why this was chosen:

- The Workflow Templates route already returns generic server failures, but the client should still fail closed if a future API or browser error drifts into technical text.
- This improves selected-parish admin safety without changing workflow template editing semantics, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Onboarding Client Safe Messages

Status: Implemented on 2026-07-07 as scoped staff onboarding production-readiness hardening.

What changed:

- Added `lib/onboardingClientMessages.ts`.
- Added `lib/onboardingClientMessages.test.ts`.
- Added `lib/server/onboardingClientSafeMessagesSource.test.ts`.
- Added `lib/server/onboardingClientSafeMessagesDoc.test.ts`.
- Added `docs/ONBOARDING_CLIENT_SAFE_MESSAGES_20260707.md`.
- Updated `app/dashboard/onboarding/ParishOnboardingPage.tsx` so setup load/completion failures and caught browser exceptions render only allowlisted staff messages or generic retry fallbacks.

Why this was chosen:

- Parish Onboarding is a go-live readiness surface, so it should remain calm and safe even when setup APIs fail.
- This improves production-readiness and staff trust without changing onboarding completion semantics, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Staff Users Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff administration production-readiness hardening.

What changed:

- Updated `app/api/parish/staff-users/route.ts` to use `logServerError` for unexpected staff access list, create, current-record lookup, and update failures.
- Preserved staff authentication, selected active parish read scope, staff write parish context, parish admin checks, validation messages, last-admin/self-deactivation protections, and staff access audit writes.
- Expanded `lib/server/staffUsersRoute.test.ts` so the route cannot return raw database exception messages for unexpected staff access failures.
- Added `docs/STAFF_USERS_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Staff Access is a security-adjacent admin surface.
- Hardening this route improves production readiness without changing staff authorization, selected parish behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Parish Settings Client Safe Messages

Status: Implemented on 2026-07-07 as scoped Parish Settings production-readiness hardening.

What changed:

- Added `lib/parishSettingsClientMessages.ts`.
- Added `lib/parishSettingsClientMessages.test.ts`.
- Added `lib/server/parishSettingsClientSafeMessagesSource.test.ts`.
- Added `lib/server/parishSettingsClientSafeMessagesDoc.test.ts`.
- Added `docs/PARISH_SETTINGS_CLIENT_SAFE_MESSAGES_20260707.md`.
- Updated `app/dashboard/settings/ParishSettingsPage.tsx` so main Settings load/save, manual Daily Brief send, Staff Access, Recent Activity, and Public Intake Routing metadata/domain/token admin-control failures render only allowlisted staff messages or generic retry fallbacks.

Why this was chosen:

- Settings is a central admin surface, and Staff Access plus Public Intake Routing are security-adjacent, so they should fail safely even if an API, DNS, or browser error drifts into technical text.
- This improves production-readiness without changing parish settings save semantics, manual Daily Brief send behavior, staff access semantics, selected parish behavior, parish-admin checks, audit writes, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, public intake routing semantics, runtime public intake routing, one-time token visibility, or public trust claims.

### Public Intake Routing Route Safe Errors

Status: Implemented on 2026-07-07 as scoped staff-only public intake routing API hardening.

What changed:

- Updated `app/api/parish/public-intake-routing/route.ts` so unexpected metadata, domain, verification, and token failures use redacted server logging and stable safe API messages.
- 2026-07-07 refinement: duplicate domain, duplicate token-hash, and duplicate public-slug conflict detection now uses an internal Supabase unique-constraint helper, while non-conflict failures pass the original error object to safe logging instead of rebuilding raw database text from `insertError.message`.
- Updated `lib/server/publicIntakeRoutingRoute.test.ts`.
- Added `docs/PUBLIC_INTAKE_ROUTING_ROUTE_SAFE_ERRORS_20260707.md`.
- Added `lib/server/publicIntakeRoutingRouteSafeErrorsDoc.test.ts`.

Why this was chosen:

- Public Intake Routing is security-adjacent because it manages future parish domains and one-time visible token creation.
- This improves production-readiness without changing validation rules, authorization, selected parish behavior, token hash storage, one-time token visibility, domain verification semantics, runtime public intake routing, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Duplicate Merge Route Safe Errors

Status: Implemented on 2026-07-07 as scoped People and Household duplicate merge API hardening.

What changed:

- Updated `app/api/people/duplicates/route.ts` so unexpected duplicate load/merge database failures use redacted server logging and stable staff-safe API messages.
- Updated `app/api/households/duplicates/route.ts` with the same safe-error boundary.
- Updated `lib/server/peopleDuplicatesRoute.test.ts`.
- Updated `lib/server/householdDuplicatesRoute.test.ts`.
- Added `docs/DUPLICATE_MERGE_ROUTE_SAFE_ERRORS_20260707.md`.
- Added `lib/server/duplicateMergeRouteSafeErrorsDoc.test.ts`.

Why this was chosen:

- Duplicate merge is data-sensitive because it can move household links, requests, sacramental records, and membership rows.
- This improves production-readiness without changing active-parish/membership authorization, duplicate candidate detection, merge semantics, audit events, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Family Portal Document Upload Safe Error Logging

Status: Implemented on 2026-07-06 as scoped family-facing production-readiness hardening.

What changed:

- Updated `app/api/family/request-portal/[token]/documents/route.ts` to use `logServerError` for unexpected storage, insert, and upload failures.
- Preserved invalid/expired upload-link behavior, family validation messages, request-document storage setup guidance, portal token lookup, family step selection, safe filename normalization, storage upload behavior, insert cleanup behavior, and audit event writes.
- Added `lib/server/familyPortalDocumentUploadSafeErrors.test.ts` so the route cannot return raw storage/database exception messages or log raw portal tokens, token hashes, storage paths, original filenames, or document contents.
- Added `docs/FAMILY_PORTAL_DOCUMENT_UPLOAD_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Family portal document upload is public-facing and document-sensitive.
- Hardening this route improves production readiness without changing portal-token validation, upload validation, storage access, cleanup behavior, production flags, migrations, operational RLS, AI, exports, certificates, automation, Google Calendar, or public trust claims.

### Request Documents Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/requests/[id]/documents/route.ts` to use `logServerError` for unexpected request document list, storage upload, insert, and upload failures.
- Updated `app/api/requests/[id]/documents/[documentId]/route.ts` to use `logServerError` for unexpected signed URL, download, review update, and review failures.
- Preserved active-parish-aware document authorization, missing storage-setup guidance, upload cleanup behavior, signed URL creation behavior, document review semantics, and audit event behavior.
- Expanded `lib/server/requestDocumentRouteAuthorization.test.ts` so document routes cannot return raw exception messages for unexpected document failures.
- Added `docs/REQUEST_DOCUMENTS_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Request document routes are close to private family documents, signed URLs, and storage metadata.
- Hardening these routes improves production readiness without changing authorization, storage access, signed URL duration, review behavior, production flags, migrations, operational RLS, records, AI, exports, certificates, automation, Google Calendar, or public trust claims.

### Request Portal Token Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/requests/[id]/portal-token/route.ts` to use `logServerError` for unexpected family portal token creation failures.
- Preserved active-parish-aware document authorization, missing-migration guidance, one-time raw token return behavior, generated family portal URL shape, and audit write behavior.
- Expanded `lib/server/requestDocumentRouteAuthorization.test.ts` so the route cannot return raw exception messages for unexpected portal-token failures.
- Added `docs/REQUEST_PORTAL_TOKEN_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Portal-token creation is token-sensitive and should not reflect raw database, URL, cookie, token-adjacent, or internal exception text.
- Hardening this route improves production readiness without changing authorization, token creation behavior, production flags, migrations, operational RLS, records, AI, exports, storage, signed URLs, certificates, automation, Google Calendar, or public trust claims.

### Request Detail Access Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/requests/[id]/detail-access/route.ts` to use `logServerError` for unexpected request detail access verification failures.
- Preserved active-parish-aware request detail authorization, the existing denied/not-found 404 response, and primary parish fallback only when no active parish cookie exists.
- Expanded `lib/server/requestDetailAccessRouteWiring.test.ts` so the route cannot return raw exception messages for unexpected verification failures.
- Added `docs/REQUEST_DETAIL_ACCESS_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Request detail access is an authorization-sensitive staff path and should not reflect raw database, JWT, or internal exception text.
- Hardening this route improves production readiness without changing request ownership checks, selected parish behavior, production flags, migrations, operational RLS, records, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Public Intake Safe Error Logging

Status: Implemented on 2026-07-06 as scoped public-route production-readiness hardening.

What changed:

- Updated `app/api/intake/route.ts` to use `logServerError` for unexpected submission failures after partial cleanup.
- Preserved durable rate limiting, disabled-by-default routing gates, legacy fallback, public generic failure text, and cleanup behavior.
- Expanded `lib/server/publicIntakeRuntimeRouteWiring.test.ts` so the route cannot reintroduce the old raw public-intake `console.error` pattern.
- Added `docs/PUBLIC_INTAKE_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Public intake is a family-facing trust surface that can include personal, sacramental, and pastoral details.
- Hardening this route improves production readiness without changing validation, routing, durable rate limiting, cleanup behavior, production flags, migrations, operational RLS, AI, exports, storage, certificates, automation, Google Calendar, or public trust claims.

### Audit Events Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/audit-events/route.ts` to use `logServerError` for unexpected read/write failures.
- Kept missing-audit-table migration guidance intact while making other failure responses generic.
- Expanded `lib/server/auditEventsRoute.test.ts` with route-level redaction and docs validation coverage.
- Added `docs/AUDIT_EVENTS_SAFE_ERROR_LOGGING_20260706.md`.

Why this was chosen:

- Audit history is a trust and accountability surface, so failures should not leak internal database details.
- Hardening this route improves production readiness without changing audit authorization, active-parish scope, request ownership checks, migrations, operational RLS, production flags, exports, AI, storage, Google Calendar, certificate generation, automation, or public trust claims.

### Request Notifications Safe Error Logging

Status: Implemented on 2026-07-06 as scoped public notification-route production-readiness hardening.

What changed:

- Updated `app/api/request-notifications/route.ts` to use `logServerError` for Resend provider failures and unexpected exceptions.
- Added `lib/server/requestNotificationsRouteSafeErrors.test.ts`.
- Added `docs/REQUEST_NOTIFICATIONS_SAFE_ERROR_LOGGING_20260706.md`.
- Public notification failures now stay generic instead of reflecting provider error messages.

Why this was chosen:

- Request notifications are close to public intake and can involve family contact details.
- Hardening this route improves production readiness without changing verification, changing rate limiting, adding outbound communication behavior, enabling production monitoring, adding production flags, mutating records, applying migrations, changing operational RLS, calling AI, running exports, accessing storage, creating signed URLs, generating certificates, or making public trust claims.

### Email Send Safe Error Logging

Status: Implemented on 2026-07-06 as scoped authenticated staff-route production-readiness hardening.

What changed:

- Updated `app/api/email/send/route.ts` to use `logServerError` for Resend provider failures and unexpected exceptions.
- Added `lib/server/emailSendRouteSafeErrors.test.ts`.
- Added `docs/EMAIL_SEND_SAFE_ERROR_LOGGING_20260706.md`.
- Staff-facing send failures now stay generic instead of reflecting provider error messages.

Why this was chosen:

- Authenticated email sending is a high-trust staff workflow that can involve personal addresses, pastoral follow-up, and provider token context in failures.
- Hardening this route improves production readiness without sending new communication types, enabling automation, enabling production monitoring, adding production flags, mutating records beyond the already-approved authenticated email send operation, applying migrations, changing operational RLS, calling AI, running exports, accessing storage, creating signed URLs, generating certificates, or making public trust claims.

### Demo Request Safe Error Logging

Status: Implemented on 2026-07-06 as scoped public-route production-readiness hardening.

What changed:

- Added `lib/server/safeErrorLogging.ts`.
- Added `lib/server/safeErrorLogging.test.ts`.
- Added `lib/server/demoRequestRouteSafeErrors.test.ts`.
- Added `docs/DEMO_REQUEST_SAFE_ERROR_LOGGING_20260706.md`.
- Updated `app/api/demo-request/route.ts` so Resend provider failures and unexpected exceptions log through a small redacted error shape and return a generic public fallback.

Why this was chosen:

- The autonomous production-readiness scan found raw public-route error logging and provider error reflection in a low-risk demo-request path.
- Hardening this route improves public trust posture without enabling production monitoring, adding production flags, mutating records, applying migrations, changing operational RLS, calling AI, running exports, accessing storage, creating signed URLs, generating certificates, or making public trust claims.

### Daily Office Handoff Saved-View Dashboard UI

Status: Implemented on 2026-07-08 as read-only daily operating-system dashboard polish.

What changed:

- Added `app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx`.
- Wired the card into `app/dashboard/DashboardPageCore.tsx` after the Daily Office Handoff Digest and before Parish Health Score.
- Added `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_20260708.md`.
- Added `lib/server/dashboardDailyOfficeHandoffSavedViewsUi.test.ts`.
- Reused the prepared source preflight to validate complete marker coverage for the visible UI.
- Polished the card on 2026-07-08 with a plain-English `Handoff rhythm` for each preset so staff know when to use the lens, what to check first, and how to leave the next staff-reviewed step.

Why this was chosen:

- The Daily Office Handoff Digest already tells staff what needs attention. The saved-view card makes that handoff more practical for front desk opening, sacramental records handoff, and administrator closeout without storing preferences or adding risky controls.
- This improves the parish-office daily experience while keeping saved-view persistence, production-sensitive gates, data mutation, communications, automation, certificates, AI, exports, storage, signed URLs, operational RLS changes, production access, and public trust claims closed.

### Daily Office Handoff Saved-View Dashboard Browser QA Checklist

Status: Prepared on 2026-07-08 as safe non-production browser QA readiness.

What changed:

- Added `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md`.
- Added `lib/server/dailyOfficeHandoffSavedViewDashboardBrowserQaChecklist.test.ts`.
- Defined label-only browser QA gates for health, staff session, dashboard placement, active parish switching, safe links, empty states, Catholic records boundaries, forbidden controls, rollback/no-op behavior, and final outcome.

Why this was chosen:

- The read-only saved-view UI is visible now, but it should not be described as pilot-ready until a safe non-production browser run confirms placement, parish switching, links, and forbidden-control absence.
- This keeps evidence honest without accessing production, mutating records, persisting saved views, sending communications, enabling automation, generating certificates, calling AI, running exports, accessing storage, creating signed URLs, applying migrations, changing operational RLS, or making public trust claims.

### Demo Request Client Safe Messages

Status: Implemented on 2026-07-07 as scoped public landing-page production-readiness hardening.

What changed:

- Added `lib/demoRequestClientMessages.ts`.
- Added `lib/demoRequestClientMessages.test.ts`.
- Added `lib/server/demoRequestClientSafeMessagesSource.test.ts`.
- Added `lib/server/demoRequestClientSafeMessagesDoc.test.ts`.
- Added `docs/DEMO_REQUEST_CLIENT_SAFE_MESSAGES_20260707.md`.
- Updated `app/_components/landing/ScheduleDemoForm.tsx` so failed demo-request responses and caught browser exceptions render only allowlisted public messages or a generic direct-email fallback.

Why this was chosen:

- The route already returns safe public fallbacks, but the public landing form should also fail closed if a future backend drift returns technical text.
- Hardening the client improves sales-trust posture without changing demo request submission, email delivery behavior, production flags, migrations, operational RLS, exports, AI, storage, signed URLs, certificates, automation, or public trust claims.

### Daily Office Handoff Saved-View Dashboard UI Source Preflight

Status: Prepared on 2026-07-06 as source-level preflight scaffolding for a future read-only dashboard surface.

What changed:

- Added `lib/server/dailyOfficeHandoffSavedViewDashboardUiPreflight.ts`.
- Added `lib/server/dailyOfficeHandoffSavedViewDashboardUiPreflight.test.ts`.
- Added `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_20260706.md`.
- Validates that future UI source uses the saved-view DTO, derives from the existing Daily Office Handoff Digest, preserves selected active parish context, renders approved preset labels, shows handoff rhythm guidance, uses safe queue links, shows empty states, and remains placed near the current Daily Office Handoff card.
- Strengthened the preflight on 2026-07-08 with focused regression coverage and docs requiring each gate to satisfy its complete marker set; a partial marker mention is not enough to pass review.
- Rejects buttons, forms, click handlers, direct API/Supabase access, writes, storage/signed URL usage, email, AI, exports, Google routes, certificate generation, duplicate merges, client-side persistence, cookies, and router pushes.

Why this was chosen:

- The approval packet identified source-level preflight as the safest next step before any dashboard UI wiring.
- This keeps role-friendly staff handoff polish moving without persisting saved views, mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, accessing storage, creating signed URLs, applying migrations, changing operational RLS, accessing production, or making public trust claims.

### Daily Office Handoff Digest Browser QA Recheck Blocked - 2026-07-06

Status: Blocked on 2026-07-06 as a safe preflight-only rerun. Browser QA was not opened because the local app target did not respond at `/api/health`.

What changed:

- Added a label-only blocker note for the 2026-07-06 Daily Office Handoff Digest browser QA recheck.
- Recorded that the current app target was unavailable before browser access, staff-session use, dashboard access, active parish label checks, placement checks, safe-link checks, or forbidden-control browser checks.
- Preserved the 2026-07-05 passed browser QA evidence as the current completed QA record.
- Preserved the 2026-07-05 blocked recheck as historical blocker evidence.
- Added source-validation coverage to keep the blocker read-only, no-secrets, and tied to the prior passed evidence.

Why this was chosen:

- The owner asked to rerun browser QA only if a safe app target and staff session were available.
- The safe app target was unavailable on 2026-07-06, so recording the blocker only was the correct next step.
- This keeps QA evidence honest without mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, applying migrations, changing operational RLS, accessing production, accessing storage, creating signed URLs, or making public claims.

### Daily Office Handoff Saved-View Dashboard UI Approval Packet

Status: Prepared on 2026-07-06 as a non-runtime UI approval packet.

What changed:

- Added `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_APPROVAL_PACKET_20260706.md`.
- Added source/docs validation coverage.
- Defined the future smallest safe file boundary for a read-only dashboard UI slice.
- Defined browser QA acceptance criteria for health, safe staff session, placement, active parish switching, safe links, empty states, forbidden controls, Catholic records boundaries, and rollback.
- Added exact future product-owner approval language while keeping UI wiring `NO-GO` today.

Why this was chosen:

- The saved-view preset DTO was implemented; the next safe daily operating-system slice is approval criteria before any UI wiring.
- This keeps Vinea moving toward role-friendly staff handoff views without persisting saved views, mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, accessing storage, creating signed URLs, applying migrations, changing operational RLS, accessing production, or making public trust claims.

### Daily Office Handoff Saved-View Presets DTO

Status: Implemented on 2026-07-05 as a read-only non-runtime DTO foundation.

What changed:

- Added `lib/dailyOfficeHandoffSavedViews.ts`.
- Added focused DTO and source/docs validation tests.
- Added a planning doc for future staff handoff saved-view UI.
- Defined three planning-only presets:
  - Front desk opening view.
  - Sacramental records handoff view.
  - Administrator closeout view.
- Preserved active parish scope by consuming the existing Daily Office Handoff Digest.

Why this was chosen:

- Daily Office Handoff Browser QA passed, and the next safe daily operating-system slice was staff handoff saved-view planning.
- This makes future role-specific handoff UX more concrete without persisting preferences, wiring UI, querying Supabase, mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, accessing storage, creating signed URLs, applying migrations, changing operational RLS, accessing production, or making public trust claims.

### Daily Office Handoff Digest Browser QA Recheck Blocked

Status: Blocked on 2026-07-05 as a safe preflight-only rerun. Browser QA was not opened because the local app target did not respond at `/api/health`.

What changed:

- Added a label-only blocker note for the current Daily Office Handoff Digest browser QA recheck.
- Recorded that the current app target was unavailable before browser access, staff-session use, dashboard access, active parish label checks, parish switching checks, safe-link checks, or forbidden-control browser checks.
- Preserved the earlier passed browser QA evidence as the current completed QA record.
- Added source-validation coverage to keep the blocker read-only, no-secrets, and tied to the prior passed evidence.

Why this was chosen:

- The owner asked to rerun browser QA only if a safe app target and staff session were available.
- The safe app target was unavailable, so recording the blocker only was the correct next step.
- This keeps QA evidence honest without mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, applying migrations, changing operational RLS, accessing production, accessing storage, creating signed URLs, or making public claims.

### Daily Office Handoff Digest Browser QA

Status: Passed on 2026-07-05 as a safe read-only localhost/shared-QA browser QA run.

What changed:

- Ran the Daily Office Handoff Digest browser QA against a local app backed by the approved shared-QA target.
- Confirmed `/api/health` returned HTTP 200 with schema, Supabase, and parishes checks true.
- Confirmed the handoff card appears after the Daily Work Hub overview and before Parish Health Score, Workflow Reminders, and Operational Intelligence.
- Confirmed active parish switching from Vinea QA Google Calendar Parish A to Parish B and back relabeled the card and changed the visible handoff signals.
- Confirmed the card's Parish A handoff items matched visible Parish Health Score and Operational Intelligence cues.
- Confirmed one safe internal queue link opened `/dashboard/requests` with selected-parish scoping copy and no 404.
- Confirmed the card has no buttons, forms, inputs, downloads, or risky action controls.
- Added label-only browser QA evidence and validation.

Why this was chosen:

- The handoff card had just been wired into the dashboard, so browser verification was the next safest way to prove staff-facing behavior.
- The run strengthens daily operating-system confidence without mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, applying migrations, changing operational RLS, accessing production, accessing storage, creating signed URLs, or making public claims.

### Daily Office Handoff Digest Dashboard Browser QA Readiness

Status: Prepared on 2026-07-05 as a label-only, read-only browser QA readiness worksheet. Browser QA was not executed because the local app target did not respond at `/api/health`, and no safe staff session, active parish label, or optional alternate parish label was confirmed.

What changed:

- Added a worksheet for a future browser run that verifies the Daily Office Handoff Digest dashboard card.
- Defined expected evidence for card placement after Daily Work Hub overview, active parish label behavior, optional parish switching, three handoff slots, safe review-queue links, empty states, and forbidden-control absence.
- Added source-validation coverage so the worksheet remains clearly prepared, not passed.

Why this was chosen:

- The dashboard card is implemented, but safe browser prerequisites were unavailable in this run.
- A label-only readiness worksheet is the safe next step when browser QA cannot be completed.
- It keeps the future check read-only and avoids production access, record mutation, migrations, operational RLS changes, communications, AI, exports, storage, signed URLs, certificate generation, automation, and public trust claims.

### Daily Office Handoff Digest Dashboard UI

Status: Implemented on 2026-07-05 as a read-only staff-facing dashboard card.

What changed:

- Added `app/dashboard/DashboardDailyOfficeHandoffDigest.tsx`.
- Wired the existing Daily Office Handoff Digest DTO into the dashboard after the Daily Work Hub overview.
- Preserved active-parish scope by deriving the digest from already scoped `parishHealthScore` and `operationalIntelligenceBrief` dashboard DTOs.
- Rendered opening, midday, and before-close review slots with staff-reviewed language and only safe links to existing review queues.
- Added source-level tests proving the card avoids buttons, forms, click handlers, direct API calls, Supabase writes, storage, signed URLs, email, AI, and export endpoints.

Why this was chosen:

- The Daily Office Handoff Digest DTO was the next safe daily operating-system foundation.
- Making it visible turns dashboard signals into an office rhythm without mutating records, sending communications, enabling automation, generating certificates, calling AI, running exports, applying migrations, changing operational RLS, accessing production, accessing storage, creating signed URLs, or making public claims.

### Daily Office Handoff Digest DTO

Status: Implemented on 2026-07-05 as a read-only non-runtime DTO foundation.

What changed:

- Added a Daily Office Handoff Digest helper that groups existing Parish Health Score and Operational Intelligence signals into opening, midday, and before-close review slots.
- Kept every handoff item staff-reviewed and read-only.
- Added tests that verify urgent ownership gaps, records continuity, duplicate review, calm empty states, slot limiting, and forbidden automation/mutation boundaries.
- Documented the future UI acceptance criteria before any dashboard wiring.

Why this was chosen:

- The Daily Work Hub already surfaces signals; the next safe polish step is making those signals feel like an office rhythm rather than a feature list.
- The DTO improves future dashboard UX without mutating records, sending communications, enabling reminders, generating certificates, calling AI, running exports, applying migrations, changing operational RLS, accessing production, accessing storage, creating signed URLs, or making public claims.

### Dashboard Continuity Empty-State Browser QA Passed

Status: Passed on 2026-07-05 as a safe read-only localhost/shared-QA browser QA run.

What changed:

- Ran the prepared zero-continuity empty-state browser QA against a local Vinea app backed by shared QA.
- Confirmed `/api/health` returned HTTP 200 with `checks.schema: true`.
- Confirmed a safe staff session could switch to the zero-continuity active parish label `Vinea QA Google Calendar Parish A`.
- Confirmed Daily Work Hub, Parish Health Score, and Operational Intelligence all showed the quiet continuity state without record mutation.
- Added label-only evidence and validation so the earlier readiness worksheet is superseded by passed browser evidence.

Why this was chosen:

- The previous slice prepared the run because the safe browser prerequisites were missing.
- Those prerequisites were available in this session, so the highest-value next step was to prove the quiet state in the browser rather than add another plan.
- The run strengthens daily operating-system confidence without touching production, records, migrations, operational RLS, AI, exports, storage, certificates, communications, automation, or public claims.

### Dashboard Continuity Empty-State Browser QA Readiness Worksheet

Status: Prepared on 2026-07-05 as a label-only, read-only QA readiness slice. Browser QA was not executed because the local app target did not respond at `/api/health`, and no safe staff session, active parish label, or zero-continuity fixture label was confirmed.

What changed:

- Added a worksheet for a future browser run that verifies the zero-continuity dashboard state.
- Defined the labels needed before the run can proceed: safe non-production app target, safe staff browser session, active parish label, and a fixture label proving zero records need request-to-record continuity review.
- Defined expected future UI evidence: Parish Health Score shows `No records currently need request-link review`, and Operational Intelligence explains that no Records continuity review queue item is visible right now.
- Preserved no-go boundaries for production access, record mutation, automatic linking, certificate generation, communications, automation, migrations, operational RLS changes, AI calls, exports, storage access, signed URLs, canonical/sacramental eligibility decisions, and public trust claims.

Why this was chosen:

- The zero-continuity empty state was implemented, but the safe browser prerequisites were unavailable in this session.
- A readiness worksheet is the honest next step when a browser run cannot be completed safely.
- It gives the next run exact pass/fail criteria without exposing secrets or touching parish records.

### Dashboard Continuity Empty-State Cue

Status: Implemented on 2026-07-05 as a read-only Parish Health Score clarity slice.

What changed:

- Parish Health Score now has a visible continuity-clear cue when no selected-parish sacramental records currently need request-to-record continuity review.
- The cue uses the existing read-only `unlinkedSacramentalRecordCount` dashboard signal and stays hidden when continuity review items exist.
- The cue explicitly preserves the staff-reviewed boundary: Vinea does not link records, generate certificates, send reminders, or make sacramental/canonical decisions from this message.
- The slice remains dashboard-only and read-only: no record mutation, certificate generation, migrations, operational RLS changes, production access, communications, AI calls, exports, storage access, signed URLs, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- The previous continuity bottleneck and browser QA work made problems visible.
- Staff also need the quiet state to be explicit so they know "no warning" means no selected-parish continuity review item is visible in the dashboard signal.
- It improves Catholic records clarity without crossing any production-sensitive or sacramental decision boundary.

### Operational Intelligence Continuity Browser QA Recheck

Status: Passed on 2026-07-05 as a safe read-only localhost/shared-QA browser recheck.

What changed:

- Rechecked `/api/health`, Parish Health Score, Operational Intelligence, and the Records `Needs request review` queue in a safe staff browser session.
- Confirmed both dashboard surfaces still point to `/dashboard/records?continuity=needs_review`.
- Confirmed the Records continuity filter is selected as `Needs request review` for `needs_review`.
- Added a focused validation test to keep the recheck label-only, read-only, no-secrets, and tied to the earlier checklist/blocked evidence.

Why this was chosen:

- The requested browser QA inputs were available in this session.
- A recheck is more valuable than adding another fixture worksheet after the checklist had already passed.
- It strengthens Catholic records continuity confidence without mutating records, generating certificates, applying migrations, changing RLS, touching production, calling AI, running exports, accessing storage, creating signed URLs, sending communications, or making public claims.

### Operational Intelligence Continuity Browser QA Blocked Evidence

Status: Completed on 2026-07-05 as a safe blocked-evidence slice. This is historical evidence from before the successful localhost/shared-QA browser run below.

What changed:

- Added a sanitized blocked evidence record for the continuity browser QA preflight.
- Confirmed the local app URL is configured for `localhost:3000`, but no local Vinea server responded for `/api/health`.
- Recorded the shared QA Supabase project label only and did not print database URLs, raw keys, staff credentials, fixture IDs, tokens, or signed URLs.
- Preserved explicit no-go boundaries for production access, record mutation, automatic linking, certificate generation, communications, automation, migrations, RLS changes, AI calls, exports, storage access, signed URLs, secrets, and public claims.

Why this was chosen:

- The checklist was ready, but the safe execution inputs were not available at that time.
- Stopping before browser access kept the QA record honest and made the remaining blocker concrete.
- It kept Catholic records continuity verification label-only and staff-controlled until the later safe localhost/shared-QA browser run could proceed.

### Operational Intelligence Continuity Browser QA Checklist

Status: Passed on 2026-07-05 as a safe localhost/shared-QA browser QA slice.

What changed:

- Ran the label-only checklist for verifying Parish Health Score and Operational Intelligence request-to-record continuity cues in a safe localhost/shared-QA browser session.
- Verified `/api/health` returned HTTP 200 with `checks.schema: true`, safe staff dashboard access, active parish context, and non-secret continuity fixture labels.
- Passed the `Request-to-record continuity` health factor, the Operational Intelligence records/documents insight, and the `/dashboard/records?continuity=needs_review` handoff checks.
- Confirmed the Records page opened with the `Needs request review` continuity filter selected.
- Preserved explicit forbidden boundaries: no record mutation, automatic linking, certificate generation, communications, automation, migrations, RLS changes, AI calls, exports, storage access, signed URLs, production access, or public trust claims.

Why this was chosen:

- The continuity bottleneck slice was implemented, and responsible product readiness required a repeatable browser QA pass before treating it as verified.
- The QA run keeps Catholic records review staff-controlled and label-only while confirming the dashboard handoff works.

### Operational Intelligence Continuity Bottleneck

Status: Implemented on 2026-07-05 as a read-only daily operating-system / Catholic records intelligence slice.

What changed:

- Added request-to-record continuity review as a Parish Health Score factor.
- Added continuity review counts to the Operational Intelligence Brief records/documents bottleneck.
- Linked recommendations to `/dashboard/records?continuity=needs_review`.
- Kept the work staff-reviewed and non-decisional: no automatic linking, record mutation, certificate generation, migrations, operational RLS changes, production access, communications, AI calls, exports, storage access, signed URLs, or public trust claims.

Why this was chosen:

- The Daily Work Hub already made continuity review actionable for front-desk staff.
- This slice makes the same bottleneck visible in leadership-facing health and operational intelligence surfaces.
- It advances Vinea's Catholic-specific moat while preserving human judgment around sacramental records and certificates.

### Daily Work Hub Records Handoff Drilldown Cue

Status: Implemented on 2026-07-05 as a read-only Daily Work Hub / Catholic records polish slice.

What changed:

- Made the Daily Work Hub request-to-record continuity card point directly to `/dashboard/records?continuity=needs_review`.
- Added a plain-English staff handoff cue so the dashboard explains where to review records that need continuity follow-up.
- Kept all record decisions staff-reviewed: no automatic linking, certificate generation, record mutation, migrations, operational RLS changes, production access, communications, AI calls, exports, storage access, signed URLs, or public trust claims.

Why this was chosen:

- The previous Global Search UX cue improved selected-parish search clarity; the next safest daily operating-system improvement was making the first-screen records signal directly actionable.
- It helps sacramental coordinators and parish secretaries move from "this needs review" to the existing filtered Records continuity queue.
- It strengthens Catholic records continuity without crossing any production-sensitive gate.

### Global Search Partial Results Warning

Status: Implemented on 2026-07-07 as a read-only daily operating-system and production-readiness UX hardening slice.

What changed:

- Global Search now tracks whether any selected-parish category query failed while the rest of the search completed.
- Added a separate `warningMessage` so partial category failures do not block successful results.
- The dashboard search dropdown and full search results page now show stable staff-safe partial-results guidance.
- Added focused loader, formatter, source-level, docs, and README tests.
- Kept the work read-only: no data mutation, migrations, operational RLS changes, production access, communications, AI calls, exports, storage access, signed URLs, certificate generation, sacramental/canonical decisions, or public trust claims.

Why this was chosen:

- Search is a daily staff navigation surface. Silent partial failures can make staff believe a family, household, request, or record does not exist.
- The warning keeps search honest and safer without changing selected-parish scope or exposing raw database/provider details.

### Global Search Request Scope UX Cue

Status: Implemented on 2026-07-05 as a read-only permission-aware search UX polish slice.

What changed:

- Added a plain-English request-scope cue to global search results.
- Explained that request results follow the selected parish and linked parishioners.
- Added an empty-request-results hint for cases where staff expected a request but the request may not be linked to a parishioner in the selected parish.
- Added focused helper and source guard tests.
- Kept the work read-only: no record mutation, migrations, operational RLS changes, production access, communications, AI calls, exports, storage access, signed URLs, certificate generation, or public trust claims.

Why this was chosen:

- It was the recommended next VAOS-safe task from the previous run.
- Search is a high-frequency staff workflow and staff need clear feedback when active parish context changes the visible request set.
- It supports safer multi-parish behavior without changing the underlying security model.

### Global Search Request Scope Hardening

Status: Implemented on 2026-07-05 as a read-only permission-aware search safety slice.

What changed:

- Made the global search request branch use the validated active parish id.
- Added active-parish parishioner scoping before request queries run.
- Applied scoped parishioner IDs to request lookup and result fetch paths.
- Added focused tests for request scoping and fail-closed empty-parish behavior.
- Kept the work read-only: no data mutation, migrations, operational RLS changes, production access, communications, AI calls, storage access, signed URLs, certificate generation, or public trust claims.

Why this was chosen:

- It was the recommended next VAOS-safe task from the previous run.
- Search is a high-frequency staff workflow and a key multi-parish safety surface.
- It advances permission-aware search without crossing production or RLS promotion gates.

### Records Continuity Handoff Links

Status: Implemented on 2026-07-05 as a read-only Catholic records polish slice.

What changed:

- Added read-only handoff link construction for unlinked sacramental records.
- Added "Search related requests" links to Records dashboard rows needing request review.
- Added a record detail "Continuity handoff" section with search and review queue links.
- Added focused helper and source guard tests.
- Kept the work read-only: no record mutation, automatic request linking, certificate generation, migrations, operational RLS changes, production access, communications, AI calls, storage access, signed URLs, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- It was the recommended next VAOS-safe task from the previous run.
- It turns the continuity filter into a practical staff handoff without introducing a risky matching or mutation workflow.
- It advances Catholic records depth while preserving staff judgment.

### Records Dashboard Continuity Summary And Filter

Status: Implemented on 2026-07-05 as a read-only Catholic records polish slice.

What changed:

- Added a request-to-record continuity summary to `/dashboard/records`.
- Added a Continuity filter for all records, records needing request review, records linked to requests, and records with certificate activity.
- Added row-level labels for "Request linked" and "Needs request review."
- Added a pure continuity helper and focused tests for summary/filter rules.
- Kept the work read-only: no record mutation, certificate generation, migrations, operational RLS changes, production access, communications, AI calls, storage access, signed URLs, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- It was the recommended next VAOS-safe task from the prior run.
- It advances Catholic records depth and gives staff a practical way to find request-to-record continuity work.
- It builds on existing Records and Daily Work Hub continuity cues without crossing production-sensitive or sacramental decision boundaries.

### Vinea Autonomous Operating System Foundation

Status: Implemented on 2026-07-05 as a documentation, task-selection, and safety operating layer.

What changed:

- Added `CODEX_AUTONOMOUS_INSTRUCTIONS.md` as the master operating manual for future Codex sessions.
- Added `docs/autonomous-os/` with operating principles, task scorecard, run loop, safety guardrails, beginner update template, roadmap review protocol, quality checklist, and first-run report.
- Added `docs/VINEA_REPO_AUDIT.md` as a living repository audit for routes, APIs, docs, tests, database/RLS posture, and known risks.
- Added a focused source-validation test for the VAOS docs.
- Kept the work non-runtime: no production access, production flags, migrations, operational RLS changes, record mutations, communications sends, exports, AI calls, Google Calendar access, storage access, signed URLs, certificate generation, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- The owner asked Vinea to have an autonomous operating system for disciplined future work.
- The current worktree already had many pre-existing uncommitted changes, so a documentation and guardrail foundation was the safest high-value task.
- Future sessions now have a repeatable way to review the roadmap, SSoT, repo audit, unfinished work, recent changes, safety gates, tests, docs, and next highest-value task.

### Daily Work Hub Request-To-Record Continuity Cue

Status: Implemented on 2026-07-05 as a read-only daily operating-system polish slice.

What changed:

- Added linked-record, unlinked-record, and certificate-activity counts to `lib/dailyOperatingSystemSignals.ts`.
- Added `requestToRecordContinuity` to `lib/dailyWorkHubOverview.ts`.
- Displayed a "Request-to-record continuity" cue in `app/dashboard/DashboardDailyWorkHubOverview.tsx`.
- Added/updated focused tests in `lib/dailyOperatingSystemSignals.test.ts`, `lib/dailyWorkHubOverview.test.ts`, `lib/server/dailyOperatingSignalsSource.test.ts`, and `lib/server/dailyWorkHubOverviewSource.test.ts`.
- Kept the work read-only: no communications, automation, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, automatic certificate generation, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- Request-to-record continuity is a Catholic-specific differentiator and a daily staff confidence signal.
- The dashboard already loads sacramental record request links and certificate-generated events for read-only operating signals.
- Surfacing the continuity cue helps staff know what needs manual review before certificate work without changing the register or deciding eligibility.

### Daily Work Hub Ready-For-Staff-Review Signals

Status: Implemented on 2026-07-05 as a read-only daily operating-system polish slice.

What changed:

- Added `readyNextItems` to `lib/dailyWorkHubOverview.ts`.
- Added a "Ready for staff review" section to `app/dashboard/DashboardDailyWorkHubOverview.tsx`.
- Passed existing read-only daily operating-system health signals into the Daily Work Hub from `app/dashboard/DashboardPageCore.tsx`.
- Surfaced duplicate review backlog, incomplete sacramental records, and certificate-ready baptism review counts as staff-reviewed links.
- Added/updated focused tests in `lib/dailyWorkHubOverview.test.ts` and `lib/server/dailyOperatingSignalsSource.test.ts`.
- Kept the work read-only: no communications, automation, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, automatic certificate generation, canonical/sacramental eligibility decisions, or public trust claims.

Why this was chosen:

- The dashboard already computed daily operating-system signals for health scoring and reminder previews.
- Surfacing those signals in the first-screen Daily Work Hub makes Vinea feel more like a daily operating system for parish staff.
- It helps staff notice cleanup and records work without making automatic decisions or changing any data.

### Incident Tabletop Evidence Package Index

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/INCIDENT_TABLETOP_EVIDENCE_PACKAGE_INDEX_20260705.md`.
- Added validation tests in `lib/server/incidentTabletopEvidencePackageIndex.test.ts`.
- Linked the owner worksheet, execution approval packet, evidence template, incident response runbook, base evidence template, customer communication templates, tabletop plan, public claims boundary matrix, claims owner worksheet, and evidence gap register in one reviewable package.
- Added review order, approval dependency chain, remaining `NO-GO` items, evidence redaction boundaries, allowed internal wording, and blocked public claims.
- Kept the work non-runtime: no drill execution, production access, production flags, migrations, operational RLS changes, record mutations, communications sends, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The incident tabletop worksheet, approval packet, and evidence template were prepared but spread across multiple docs.
- A single index reduces review friction and makes it harder to confuse prepared documents with completed drill evidence.
- It keeps Vinea's trust-center readiness organized while preserving the public `NO-GO` boundary.

### Non-Production Incident Tabletop Drill Evidence Template

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md`.
- Added validation tests in `lib/server/nonproductionIncidentTabletopDrillEvidenceTemplate.test.ts`.
- Created a label-only future evidence copy for the approved synthetic target named by the execution approval packet.
- Added fields for approval confirmation, owner labels, evidence redaction, family portal/document scenario outcomes, cross-parish active-parish/RLS scenario outcomes, stop-condition review, final result, unresolved risks, and sign-off.
- Kept the work non-runtime: no drill execution, production access, production flags, migrations, operational RLS changes, record mutations, communications sends, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The execution approval packet named the exact evidence file future drill owners should use.
- Preparing the evidence form now reduces future risk by making safe redaction rules and stop conditions explicit before any drill is approved.
- It keeps Vinea moving toward incident-response trust-center readiness without pretending a drill has occurred.

### Non-Production Incident Tabletop Drill Execution Approval Packet

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md`.
- Added validation tests in `lib/server/nonproductionIncidentTabletopDrillExecutionApprovalPacket.test.ts`.
- Defined the exact future approval phrase, required non-secret target labels, owner labels, evidence filename, scenario set, pass/fail criteria, stop conditions, and evidence requirements before a non-production incident tabletop drill can run.
- Limited the future drill scope to synthetic family portal/document exposure and synthetic cross-parish active-parish/RLS scenarios.
- Kept the work non-runtime: no drill execution, production access, production flags, migrations, operational RLS changes, record mutations, communications sends, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The owner/sign-off worksheet clarified who and what must be ready before an incident tabletop drill.
- This packet turns that readiness into a precise future approval boundary without running the drill.
- It keeps Vinea moving toward trust-center readiness while avoiding production, customer communication, and public-claim risk.

### Incident Tabletop Owner Sign-Off Worksheet

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md`.
- Added validation tests in `lib/server/incidentTabletopOwnerSignoffWorksheet.test.ts`.
- Created role-label-only owner/sign-off tables for future non-production incident tabletop readiness.
- Covered incident commander, technical lead, evidence owner, customer communications owner, legal/data owner, product owner, security reviewer, and support owner labels.
- Added synthetic scenario labels for family portal/document exposure, cross-parish active-parish/RLS exposure, customer communication draft review, evidence redaction, and postmortem follow-up.
- Kept the work non-runtime: no tabletop drill execution, production access, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The trust-center gap register identifies incident owners and tabletop evidence as a blocker for stronger incident-response claims.
- A safe owner/sign-off worksheet makes the future drill easier to approve without using production or real parish data.
- It helps Vinea keep trust-center language honest while preparing the next incident-response readiness gate.

### Trust Center Claims Owner Review Filled Example

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md`.
- Added validation tests in `lib/server/trustCenterClaimsOwnerReviewFilledExample.test.ts`.
- Created a role-label-only filled example for the claims owner review worksheet.
- Recommended conservative statuses for each trust area while keeping public trust-center publishing `NO-GO`.
- Added missing-evidence and next-safe-action examples for formal compliance certification, production membership-aware RLS, production monitoring, backup/restore, export controls, public intake routing, AI safety, retention/deletion, incident response, document/family portal safety, and MFA/SSO/RBAC.
- Kept the work non-runtime: no production access, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The owner review worksheet is useful, but a safe filled example helps the product owner complete it without exposing secrets or accidentally approving public claims.
- It clarifies which areas are closest to review and which remain blocked.
- It supports future trust-center readiness without publishing anything.

### Trust Center Claims Owner Review Worksheet

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md`.
- Added validation tests in `lib/server/trustCenterClaimsOwnerReviewWorksheet.test.ts`.
- Created a label-only worksheet that maps each trust area to product owner, support owner, evidence owner, approval status, missing evidence, and next safe action.
- Covered formal compliance certification, production membership-aware RLS, production monitoring, backup/restore, export controls, public intake routing, AI safety, retention/deletion, incident response, document/family portal safety, and MFA/SSO/RBAC.
- Kept every row defaulted to public `NO-GO` until named owners and evidence are supplied.
- Kept the work non-runtime: no production access, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- The claims boundary matrix identified the next safe step: assign owner labels and evidence status before drafting public claims.
- This makes future trust-center review easier without pretending Vinea is ready to publish public security claims.
- It helps sales/support use careful language while product and security/data owners finish evidence review.

### Trust Center Public Claims Boundary Matrix

Status: Prepared on 2026-07-05 as a non-runtime trust-center readiness slice.

What changed:

- Added `docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md`.
- Added validation tests in `lib/server/trustCenterPublicClaimsBoundaryMatrix.test.ts`.
- Created a public-claims boundary matrix that separates safe internal/sales-support wording from public `NO-GO` claims across production RLS, monitoring, backup/restore, exports, public intake routing, AI safety, retention/deletion, incident response, document/family portal safety, MFA/SSO/RBAC, and formal compliance certification.
- Linked the matrix to existing readiness/evidence packets so future sales, support, procurement, or trust-center language can be checked against real evidence.
- Kept the work non-runtime: no production access, production flags, migrations, operational RLS changes, record mutations, exports, AI calls, Google Calendar access, storage access, signed URLs, raw metadata exposure, or public trust claims.

Why this was chosen:

- Production monitoring readiness is indexed, but public trust-center publishing remains no-go.
- Vinea needs a clear line between internal readiness language and public claims so the product can sell with confidence without overstating production evidence.
- This protects trust, supports future security questionnaires, and keeps production-sensitive claims gated until owner approvals and smoke evidence exist.

### CI Production-Readiness Workflow

Status: Implemented on 2026-07-02 as a repository-level production-readiness guard.

What changed:

- Added `.github/workflows/ci.yml`.
- Runs `npm ci`, `npm test`, `npm run typecheck`, `npm run typecheck:all`, `npm run lint`, and `npm run build` on pull requests to `main` and pushes to `main` or `codex/**`.
- Update 2026-07-06: Added an explicit `npm run typecheck` production-source gate backed by `tsconfig.typecheck.json`, so CI typechecks app/source code while existing test-fixture typing debt remains covered by Vitest and can be cleaned separately.
- Update 2026-07-06: Completed the raw test-fixture typing cleanup for the known clusters by making selected request timeline, communication commitment, request first-review, export permission, active-parish cookie, export audit reviewer, export route, public-intake runtime planning/gate, AI summary runtime scaffold, and AI summary route/safety-chain tests friendlier to TypeScript without changing runtime behavior. The raw all-file TypeScript probe now passes with `npx.cmd tsc --noEmit --pretty false`; promoting it into CI remains a separate future decision.
- Update 2026-07-06: Promoted the clean all-file TypeScript probe into an explicit `npm run typecheck:all` script and CI step after the production/source typecheck, so test fixtures and docs validation sources stay type-clean before lint/build.
- Added source validation for the CI workflow.
- Keeps the workflow non-deployment: no production access, no production flags, no migrations, no operational RLS changes, no secrets, no exports, no Google Calendar data, and no public trust claims.

Why this was chosen:

- Stability and review discipline are production-readiness blockers.
- Automated checks reduce the chance that a broken build or failing test slips into a pilot or customer demo branch.

### Production Observability Readiness Plan

Status: Prepared on 2026-07-02 as a non-runtime production-readiness slice.

What changed:

- Added a safe observability event DTO and redaction helper.
- Added a production observability readiness plan covering allowed event shape, required redactions, forbidden payloads, owner workflow, approval gates, manual QA, rollback, and production claim boundaries.
- Added a non-runtime source-level preflight scaffold for future observability wiring.
- Added tests proving the helper redacts sensitive values, remains vendor-neutral/non-runtime, and future runtime wiring must keep redaction and approval gates before external reporting.

Why this was chosen:

- Production monitoring is a trust blocker, but it should not be wired before redaction and owner approval rules are clear.
- This gives Vinea a safer path to future error reporting without exposing emails, tokens, database URLs, storage paths, AI prompts, document contents, raw exports, or private parish data.

### Production Support Escalation Matrix

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a support escalation model that maps safe observability events to `SEV-1` through `SEV-4`.
- Added owner routing, response targets, evidence rules, customer communication boundaries, and first actions.
- Added a support escalation matrix document and source validation tests.
- Kept the work non-runtime: no production monitoring, paging, incident creation, customer notification, external service, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- Detecting production issues is not enough; Vinea also needs a calm, clear response path.
- This prepares future monitoring and support work without enabling sensitive production behavior or overstating readiness.

### Production Monitoring And Support Owner Intake Worksheet

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a human-fillable worksheet for support, monitoring, rollback, security/data, incident, technical, communications, legal/data, and evidence owner labels.
- Added operational labels for support coverage, escalation channels, monitoring tool, rollback method, evidence storage, production smoke fixture, and approval status.
- Added a validation helper that checks required labels and rejects obvious secret-like values.
- Kept the work non-runtime: no production monitoring, paging, incident creation, customer notification, external service, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- The next production monitoring blocker is not code execution; it is owner readiness.
- This gives the product owner a safe way to prepare non-secret owner labels before any production monitoring approval packet or runtime implementation.

### Production Monitoring Approval Packet

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a single approval packet tying together observability readiness, support escalation, and owner intake.
- Defined required owner approvals, non-production redaction smoke tests, production-safe smoke fixture requirements, rollback behavior, monitoring coverage expectations, customer communication boundaries, exact future approval language, and post-approval NO-GO boundaries.
- Added validation tests to prevent the packet from losing required approval gates or overstating production readiness.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- Vinea should not wire production monitoring until the approval path is explicit.
- The packet gives the product owner a copy-ready approval boundary for future non-production implementation, production smoke, and production enablement decisions.

### Production Monitoring Smoke Evidence Template

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a future smoke-run evidence template for non-production redaction smoke and production-safe smoke.
- Captures environment identity, owner labels, flag states, safe fixture labels, redaction checks, external event evidence, rollback verification, customer communication boundaries, unresolved risks, and final sign-off.
- Keeps production monitoring `NO-GO` until a future approved smoke run fills the template and owner approvals are complete.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- The next monitoring readiness step is evidence discipline, not runtime wiring.
- This helps future smoke runs prove that monitoring is useful without exposing parish data or overstating production readiness.

### Production Monitoring Runtime Implementation Approval Packet

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a future implementation approval packet for disabled-by-default production monitoring runtime scaffolding.
- Defines exact candidate files, disabled-by-default gates, non-production redaction smoke requirements, production-safe smoke boundaries, runtime safety rules, rollback/no-op behavior, customer communication boundaries, production NO-GO criteria, and exact future approval language.
- Keeps production monitoring `NO-GO` and does not create the runtime gate, provider adapter, external event sender, alert routing, production smoke, or production enablement.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- Vinea is close enough to monitoring implementation planning that the runtime boundary should be explicit before code is added.
- This lets the next engineering slice be small and testable without accidentally turning on production behavior.

### Production Monitoring Runtime Source Preflight

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added source-level preflight scaffolding for future production monitoring runtime code.
- Validates that disabled-by-default gates, environment scope checks, redaction DTO usage, forbidden payload blocking, owner/support labels, rollback/no-op behavior, and customer communication boundaries appear before any external monitoring send.
- Rejects forbidden outbound markers such as raw provider capture calls, raw prompts/outputs, signed URL creation, storage paths, raw exports, document contents, service-role keys, OpenAI keys, Google secrets, and Resend secrets.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- The next safest monitoring step is enforceable source discipline before runtime code exists.
- This lets future implementation tests fail early if monitoring code tries to send external events before redaction and approval gates.

### Production Monitoring Non-Production Redaction Smoke QA Packet

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a future QA packet for the first non-production production-monitoring redaction smoke run.
- Defines preconditions, non-secret environment labels, owner labels, safe fixture labels, flag-off baseline, non-production smoke scope, redaction cases, owner routing, rollback checks, stop conditions, evidence requirements, production boundaries, and exact future approval language.
- Covers authentication, active-parish/RLS, document portal, family portal, export, AI, Google Calendar, email, and `/api/health` redaction cases.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- The first monitoring smoke run should be scripted before runtime exists, not improvised after implementation.
- This creates a safer bridge from source preflight to future non-production smoke evidence.

### Production Monitoring Owner Readiness Completion Worksheet

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a human-fillable completion worksheet that maps owner labels, smoke fixture labels, rollback owner, evidence storage, and support escalation labels into the monitoring approval chain.
- Connects the owner intake worksheet to the monitoring approval packet, runtime implementation approval packet, non-production redaction-smoke QA packet, smoke evidence template, support escalation matrix, readiness helper, and source preflight.
- Includes label-only sections for owner mapping, smoke fixture mapping, support escalation mapping, rollback/evidence mapping, readiness decision, validation checklist, and production NO-GO boundaries.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- Monitoring readiness now needs owner and fixture labels tied together before runtime approval is requested.
- This makes future approval review less guessy and keeps secrets out of planning.

### Production Monitoring Evidence Package Index

Status: Prepared on 2026-07-05 as a non-runtime production-readiness slice.

What changed:

- Added a final package index that links every current production monitoring readiness artifact in one place.
- Summarizes each artifact's purpose, current state, required next evidence, approval dependency chain, missing human inputs, review checklist, and production NO-GO boundaries.
- Keeps production monitoring `NO-GO` until owner worksheets are filled, runtime implementation is separately approved, non-production redaction smoke passes, production-safe smoke is separately approved, and production enablement is separately approved.
- Kept the work non-runtime: no production monitoring, production flags, external vendor, paging, incident creation, customer notification, migration, operational RLS change, export, AI call, or public trust claim.

Why this was chosen:

- The monitoring readiness chain is now large enough that a single review index reduces approval confusion.
- It gives future owner review one calm place to start.

### Operational Intelligence Brief

Status: Implemented on 2026-07-02 as a read-only Daily Operating System dashboard slice.

What changed:

- Added a "Where work is slowing down" brief to the home dashboard.
- Uses existing request, follow-up, communication, workload, duplicate/record, and certificate-ready metadata.
- Shows the most visible operational bottleneck, plain-English reasons, and staff-reviewed next moves.
- Keeps the feature read-only: no communications are sent, no automation is enabled, no production flags are added, no migrations are applied, no operational RLS is changed, no records are mutated, no storage or signed URLs are accessed, no AI is called, no exports are run, no Google Calendar data is touched, no sacramental/canonical decisions are made, and no public trust claims are made.

Why this was chosen:

- Parish staff need the dashboard to answer where attention should go next, not just display separate modules.
- It strengthens the "daily operating system" feeling without crossing production, privacy, export, AI, calendar, or sacramental decision boundaries.

### Onboarding Go-Live And Migration Readiness

Status: Implemented on 2026-07-02 as a read-only onboarding UX slice.

What changed:

- Added a Go-live readiness section to `/dashboard/onboarding`.
- Uses the existing parish setup checklist to show whether the parish should finish setup first or is ready for a supervised pilot.
- Adds migration-source preparation guidance for ParishSOFT, ParishStaq/Pushpay, PDS, eCatholic, Planning Center, Breeze, Servant Keeper, spreadsheets, and paper trackers.
- Keeps the feature guidance-only: no import execution, migrations, operational RLS changes, record mutation, production flags, external integrations, public trust claims, or canonical-data claims.

Why this was chosen:

- Parish adoption depends on staff understanding what must happen before go-live.
- It helps Vinea sell and onboard more calmly without pretending migration or production readiness is complete.

### Sacramental Record Continuity Card

Status: Implemented on 2026-07-02 as a read-only record detail UX slice.

What changed:

- Added a staff-facing Record Continuity card to sacramental record detail pages.
- Shows whether an originating Vinea request link is present.
- Shows whether certificate activity has already been recorded.
- Provides plain-English staff guidance before certificate-related action.
- Keeps the feature read-only and non-decisional: no migrations, no operational RLS changes, no record mutation, no production flags, no automatic certificate generation, no automatic certificate PDF creation, no correction/notation workflow, no canonical or sacramental eligibility decisions, no pastoral decisions, no family-facing certificate state, and no public trust claims.

Why this was chosen:

- It turns request-to-record continuity from roadmap language into a visible staff workflow aid.
- It improves Catholic records depth without crossing into sensitive sacramental, canonical, or production-gated behavior.

### Certificate Type Expansion And Request Continuity Plan

Status: Prepared on 2026-07-02 as non-runtime Catholic records planning only.

What changed:

- Added a certificate type expansion matrix for Baptism, Confirmation, First Communion, Marriage, OCIA initiation/reception, and sacramental record extract/status-letter planning.
- Defined request-to-record continuity states for linked requests, missing request links, request-without-record blockers, cross-parish mismatches, and legacy record manual review.
- Planned future staff-facing language that says "Ready for staff review" instead of implying eligibility, canonical approval, or pastoral approval.
- Kept certificate generation, certificate issuance logging, correction/notation workflows, canonical/sacramental eligibility, and family-facing certificate state separate.
- Kept the slice non-runtime: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no certificate PDFs were created automatically, no canonical or sacramental eligibility decisions were made, no pastoral decisions were made, and no public trust claims were made.

Why this was chosen:

- Broader certificate support is a Catholic-specific moat, but it must be staff-reviewed and request-to-record aware.
- This gives future certificate type work and continuity-card UX a safe planning foundation before any runtime behavior exists.

### Certificate Issuance Logging Non-Production QA Evidence Template

Status: Prepared on 2026-07-02 as a non-runtime QA evidence template only.

What changed:

- Added a label-only evidence template for a future non-production certificate issuance logging runtime scaffold QA run.
- Covered flag-off baseline, flag-on scaffold checks, active-parish/membership scope, request-to-record continuity, issuance status review, cross-parish denial, family/unauthenticated denial, safe audit metadata, rollback verification, forbidden mutation/generation checks, production NO-GO criteria, unresolved risks, and sign-off fields.
- Kept runtime scaffolding unimplemented: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no certificate PDFs were created automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives a future certificate issuance logging scaffold QA run a clean evidence path before any runtime behavior exists.
- It protects Catholic record integrity by requiring testers to prove no record mutation, automatic certificate generation, automatic PDF creation, correction/notation behavior, pastoral decision, or private-data exposure occurs.

### Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime implementation approval packet only.

What changed:

- Added the product-owner approval packet for a future non-production certificate issuance logging runtime scaffold implementation.
- Connected the DTO foundation, implementation approval boundary, and source-level preflight validator into one future approval path.
- Defined exact future implementation files, non-production runtime flags, source preflight requirements, active-parish/membership scope, request-to-record ownership, safe audit metadata, manual smoke checks, rollback behavior, production NO-GO boundaries, and exact future approval language.
- Kept runtime scaffolding unimplemented: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no certificate PDFs were created automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the next possible runtime implementation step a narrow, copy/paste approval boundary.
- It protects Catholic record integrity by making staff-reviewed issuance metadata, source preflight, QA evidence, and no-go boundaries explicit before any route exists.

### Certificate Issuance Logging Runtime Source Preflight

Status: Prepared on 2026-07-02 as a non-runtime source-level preflight slice only.

What changed:

- Added a source validator and tests for future certificate issuance logging runtime scaffold code.
- Proved approved future source sketches keep non-production gates, authentication, active-parish/membership scope, record ownership, request-to-record ownership, safe audit metadata before writes, forbidden certificate automation blocking, generic denial states, and rollback/no-op behavior before scaffold response or event write.
- Rejected unsafe source sketches that write too early, omit request-to-record checks, expose specific denial details, mutate sacramental records, generate certificates or PDFs, call AI, or create signed URLs.
- Kept runtime scaffolding unimplemented: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the future certificate issuance logging route an enforceable source-level checklist before runtime code exists.
- It protects Catholic record integrity by making unsafe ordering and forbidden behaviors fail tests before a route can be merged.

### Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime implementation approval packet only.

What changed:

- Added the product-owner approval packet for a future non-production correction/notation runtime scaffold implementation.
- Connected the DTO foundation, scaffold boundary packet, QA evidence template, and source-level preflight validator into one future approval path.
- Defined exact future implementation files, non-production runtime flags, source preflight requirements, active-parish/membership scope, request-to-record ownership, safe audit metadata, manual smoke checks, rollback behavior, production NO-GO boundaries, and exact future approval language.
- Kept runtime scaffolding unimplemented: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the next possible runtime implementation step a narrow, copy/paste approval boundary.
- It protects Catholic record integrity by making staff-reviewed metadata, source preflight, QA evidence, and no-go boundaries explicit before any route exists.

### Sacramental Record Correction And Notation Runtime Source Preflight

Status: Prepared on 2026-07-02 as a non-runtime source-level preflight slice only.

What changed:

- Added a source validator and tests for future correction/notation runtime scaffold code.
- Proved approved future source sketches keep non-production gates, authentication, active-parish/membership scope, record ownership, request-to-record ownership, safe audit metadata before writes, forbidden mutation blocking, generic denial states, and rollback/no-op behavior before scaffold response or event write.
- Rejected unsafe source sketches that write too early, omit request-to-record checks, expose specific denial details, mutate sacramental records, generate certificates, call AI, or create signed URLs.
- Kept runtime scaffolding unimplemented: no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the future correction/notation route an enforceable source-level checklist before runtime code exists.
- It protects Catholic record integrity by making unsafe ordering and forbidden behaviors fail tests before a route can be merged.

### Sacramental Record Correction And Notation Non-Production QA Evidence Template

Status: Prepared on 2026-07-02 as a non-runtime QA evidence template only.

What changed:

- Added a label-only evidence template for a future non-production correction/notation runtime scaffold QA run.
- Covered flag-off baseline, flag-on scaffold checks, active-parish/membership scope, request-to-record continuity, correction review, notation review, cross-parish denial, family/unauthenticated denial, safe audit metadata, rollback verification, forbidden mutation checks, production NO-GO criteria, unresolved risks, and sign-off fields.
- Kept runtime scaffolding unimplemented: no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives a future correction/notation scaffold QA run a clean evidence path before any runtime behavior exists.
- It protects Catholic record integrity by requiring testers to prove no register mutation, canonical notation entry, pastoral decision, certificate generation, or private-data exposure occurs.

### Sacramental Record Correction And Notation Runtime Scaffold Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime approval packet only.

What changed:

- Added the product-owner approval packet for a future non-production correction/notation runtime scaffold.
- Defined exact future implementation files, non-production gates, event/action naming, active-parish/membership scope, request-to-record QA fixtures, safe audit metadata, rollback/no-op behavior, production NO-GO criteria, and explicit exclusions for automatic register mutation, canonical notation entry, pastoral decisions, certificate generation, and public trust claims.
- Kept runtime scaffolding unimplemented: no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the future correction/notation scaffold implementation a narrow, reviewable boundary before any runtime behavior exists.
- It protects Catholic record integrity by separating review metadata from actual register mutation, canonical notation entry, and pastoral/canonical decisions.

### Sacramental Record Correction And Notation DTO Foundation

Status: Implemented on 2026-07-02 as non-runtime DTO foundation only.

What changed:

- Added safe DTOs for future sacramental record correction and notation review metadata.
- Modeled future event actions, staff-reviewed statuses, active-parish/membership expectations, safe audit metadata, request-to-record continuity, rollback/no-op expectations, and production NO-GO boundaries.
- Kept the slice non-runtime: no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no certificates were generated automatically, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- Correction and notation workflows are a Catholic-specific trust feature and require extra caution before runtime behavior exists.
- This gives future register-integrity workflows a safer data shape without editing sacramental records or making canonical decisions.

### Certificate Issuance Logging Implementation Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime approval packet only.

What changed:

- Added the product-owner approval packet for a future non-production certificate issuance logging scaffold.
- Defined exact future implementation files, non-production gates, event/action naming, active-parish/membership scope, safe audit metadata, request-to-record continuity QA fixtures, rollback/no-op behavior, correction/notation exclusions, and production NO-GO criteria.
- Kept runtime logging unimplemented: no certificates were generated automatically, no PDFs were created, no routes were wired, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- It gives the future certificate issuance logging implementation a narrow, reviewable boundary before any event persistence exists.
- It protects Catholic record integrity by separating certificate issuance history from correction, notation, eligibility, and pastoral decision workflows.

### Certificate Issuance Logging DTO Foundation

Status: Implemented on 2026-07-02 as non-runtime DTO foundation only.

What changed:

- Added safe DTOs for future certificate issuance logging across sacramental records.
- Modeled staff-reviewed issuance statuses, certificate type, delivery method, safe audit metadata, correction/notation boundaries, and request-to-record continuity.
- Kept the slice non-runtime: no certificates were generated automatically, no PDFs were created, no routes were added, no migrations were applied, no operational RLS was changed, no sacramental records were mutated, no production flags were enabled, no canonical or sacramental eligibility decisions were made, and no public trust claims were made.

Why this was chosen:

- Certificate issuance history is a Catholic-specific switching reason and trust feature.
- This gives future certificate workflows a safer audit model without touching live records or making canonical decisions.

### Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime approval packet only.

What changed:

- Added the product-owner approval packet for a future non-production Workflow Reminders V1 runtime scaffold implementation.
- Defined exact future implementation files, required non-production feature gates, staff-reviewed dashboard-only behavior, active-parish/membership scope checks, safe audit metadata, suppression/dismissal persistence boundaries, QA fixtures, rollback behavior, and production NO-GO criteria.
- Kept runtime reminders unimplemented: no communications, no automation, no production flags, no migrations, no operational RLS changes, no record mutations, no storage access, no signed URLs, and no public trust claims.

Why this was chosen:

- It gives the future reminder scaffold implementation a narrow, reviewable boundary before any runtime behavior exists.
- It keeps Vinea moving toward "never forget the next step" workflow automation without crossing into unsafe autonomous operations.

### Workflow Reminders V1 Disposition DTO Foundation

Status: Implemented on 2026-07-02 as non-runtime DTO foundation only.

What changed:

- Added safe DTOs for future Workflow Reminders V1 dismiss, snooze, and suppress staff actions.
- Preserved staff-review requirements, outbound communication blocking, operational mutation blocking, safe audit metadata, and family portal exclusion.
- Required snooze dispositions to use a future timestamp.
- Kept the slice non-runtime: no API routes, no dashboard controls, no reminder persistence, no automation, no production flags, no migrations, no operational RLS changes, no record mutation, and no public trust claims.

Why this was chosen:

- It gives future reminder runtime work a safer staff-control model before persistence or delivery exists.
- It addresses the practical parish-office need to control reminder noise without enabling risky automation.

### Workflow Reminders V1 Runtime Approval Packet

Status: Prepared on 2026-07-02 as a non-runtime approval packet only.

What changed:

- Added the product-owner approval packet required before future Workflow Reminders V1 runtime implementation.
- Defined required product, security/data, parish operations, support, QA, and rollback approvals.
- Documented staff-review rules, safe audit metadata requirements, suppression/dismissal design, active-parish QA, manual smoke-test checklist, rollback behavior, and production NO-GO boundaries.
- Kept dashboard reminders read-only: no communications, no automation, no production flags, no migrations, no operational RLS changes, no record mutations, no storage access, no signed URLs, and no public trust claims.

Why this was chosen:

- It moves Vinea toward practical workflow automation without enabling risky runtime behavior prematurely.
- It gives the next implementation step a clear safety gate before reminders can become live operational metadata.

### Daily Operating Signal Inputs

Status: Implemented on 2026-07-02 as a read-only dashboard slice.

What changed:

- Added read-only duplicate backlog, incomplete sacramental record, and certificate-ready review inputs.
- Reused existing people and household duplicate scoring helpers instead of inventing a new duplicate detector.
- Used sacramental record metadata and certificate-generated event metadata to feed the Parish Health Score and Workflow Reminders V1 Dashboard Preview.
- Kept all signals staff-reviewed and metadata-only: no communication sending, no automation scheduling, no record mutation, no production flags, no migrations, no storage access, no signed URLs, and no operational RLS changes.

Why this was chosen:

- It deepens the daily operating-system dashboard with Catholic parish record-quality work.
- It makes duplicate cleanup, incomplete records, and certificate review visible without enabling risky automation or canonical decisions.

### Workflow Reminders V1 Dashboard Preview

Status: Implemented on 2026-07-02 as a read-only dashboard slice.

What changed:

- Added a home dashboard preview for staff-reviewed reminder candidates.
- Reused the non-runtime reminder DTOs for overdue follow-ups, missing documents/checklist items, upcoming sacramental dates, stalled requests, unassigned requests, and future explicit certificate-ready/duplicate-review signals.
- Kept the preview dashboard-only: no outbound communication, no automation scheduling, no record mutation, no production flags, no migrations, and no operational RLS changes.
- Runtime reminder engine remains future work behind separate approval, audit, suppression, staff-review, active-parish QA, and rollback gates.

Why this was chosen:

- It makes the Daily Work Hub more actionable without creating a risky reminder engine.
- It lets staff see what Vinea can safely flag before any future runtime delivery is approved.

### Workflow Reminders V1 DTO Foundation

Status: Implemented on 2026-07-02 as non-runtime foundation only.

What changed:

- Added a safe plan for V1 staff-reviewed reminders.
- Added typed reminder candidates for overdue follow-ups, missing documents/checklist items, upcoming sacramental dates, stalled requests, unassigned requests, certificate-ready work, and duplicate review.
- Marked all reminder DTOs as staff-review-required and not allowed to send outbound communication automatically.
- Kept certificate-ready and duplicate-review reminders dependent on explicit upstream signals rather than guessing from incomplete data.

Why this was chosen:

- It prepares the highest-value workflow automation path without enabling risky automation.
- It keeps Vinea pointed toward preventing dropped parishioner care while preserving staff review and production safety.

### Parish Health Score V1

Status: Implemented on 2026-07-02.

What changed:

- Added an explainable Parish Health Score to the home dashboard.
- Scored only existing dashboard signals: overdue follow-ups, unassigned work, blockers, stalled workflows, document/checklist gaps, pending communications, missing dates, first-contact gaps, care cadence, average first response, and workload balance.
- Showed point impacts, plain-English reasons, and recommended next actions instead of a black-box number.
- Marked duplicate backlog, incomplete sacramental records, and certificate-ready work as not scored in V1 until their counts are safely loaded into the dashboard.

Why this was chosen:

- It gives parish leaders a quick operational health readout without adding risky automation or new permission surface.
- It supports the strategic goal that Vinea should tell staff what needs attention and why.

### Daily Work Hub Overview

Status: Implemented on 2026-07-02.

What changed:

- Added a short implementation plan for turning Vinea into a daily parish operating system.
- Added a tested Daily Work Hub overview to the top of the home dashboard.
- Reused existing dashboard signals for urgent work, overdue follow-ups, blockers, ownership gaps, care cadence, document/checklist gaps, communication follow-ups, missing dates, first-contact gaps, and workload balance.
- Kept certificate-ready and calendar-conflict signals transparent as future safe slices instead of pretending they are fully automated today.

Why this was chosen:

- It directly supports the strategic goal that Vinea should answer “what should I do first today?” for parish staff.
- It improves daily usability and demo clarity without adding new database, RLS, export, calendar, AI, or production-gated behavior.

### Role Work Hub

Status: Implemented on 2026-06-26.

What changed:

- Added a tested role-lens helper that turns command-center rows into Administrator, Front desk, Pastor, OCIA, and Sacramental Coordinator views.
- Added a dashboard section that lets staff switch lenses, see open/act-now/blocked counts, and open the top role-specific work items.
- Reused the existing command-center data and did not add database or permission surface area.

Why this was chosen:

- It directly implements the report recommendation that Vinea should be a work hub, not a module hub.
- It improves demo quality and daily staff clarity without disturbing the still-sensitive tenancy/RLS work.

## Near-Term Recommended Order

1. Request approval to implement the non-production certificate issuance logging scaffold, or prepare a non-production correction/notation runtime scaffold QA evidence template before runtime code.
2. Request explicit product-owner approval before implementing the non-production Workflow Reminders V1 runtime scaffold.
3. Continue production RLS approval readiness without applying production RLS until the approval packet, fixture labels, owners, and smoke-test gates are complete.
4. Continue Catholic records depth by building certificate issuance logging and broadening certificates beyond baptism where safe.
5. Continue AI safety-chain production readiness and reply-route alignment without autonomous pastoral/canonical decisions.
6. Improve onboarding/migration readiness for ParishSOFT, Pushpay/ParishStaq, PDS, eCatholic, Planning Center, and spreadsheets.
7. Publish only approved trust-center and backup/restore wording; public trust-center claims remain gated.

## Explicit Non-Goals For Now

- Do not build giving, accounting, or full payment processing before core parish operations and trust foundations are stronger.
- Do not claim production diocesan readiness until RLS, writes, reporting, and UI context all support multi-parish membership.
- Do not add autonomous AI actions for canonical, pastoral, or outbound communication changes.
- Do not replace competitor breadth with shallow generic modules. Vinea should win through Catholic operational depth.
