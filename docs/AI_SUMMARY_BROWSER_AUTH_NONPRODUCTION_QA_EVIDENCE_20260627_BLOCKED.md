# AI Summary Browser-Authenticated Non-Production QA Evidence - Blocked 2026-06-27

Status: Blocked before browser-authenticated execution. No app server was started, no browser session was run, no production flags were enabled, no migrations were applied, `/api/ai/reply` was not changed, no OpenAI provider request was made, no live audit rows were written, and operational RLS was not changed.

Related docs:

- `docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_PLAN_20260627.md`
- `docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md`
- `docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md`
- `docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md`
- `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`
- `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`
- `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`

## Requested Gate

Execute the browser-authenticated non-production `/api/ai/summary` safety-chain QA plan using:

- An explicitly approved non-production app.
- Safe staff credentials.
- Safe same-parish request records.
- Safe cross-parish denial records.
- A safe family portal fixture or token plan without recording raw token material.
- Approved non-production OpenAI provider settings.
- Audit-log inspection access.
- Monitoring and rollback evidence.
- Named sign-off evidence.

## Safety Confirmation

- Production app accessed: `No`
- Production flags enabled: `No`
- Production data used: `No`
- App server started by this gate: `No`
- Browser session run by this gate: `No`
- OpenAI provider called by this gate: `No`
- Live audit rows written by this gate: `No`
- Migrations applied: `No`
- `/api/ai/reply` changed: `No`
- Operational RLS changed: `No`
- Runtime public intake routing changed: `No`
- Secrets printed or committed: `No`
- Raw prompts, generated outputs, provider payloads, session cookies, signed URLs, token hashes, family portal raw tokens, internal note bodies, communication bodies, or private document contents recorded: `No`

## Environment Check Results

The Codex process, Windows user scope, and Windows machine scope were checked without printing secret values.

Required browser-authenticated QA inputs:

```text
NON_PRODUCTION_APP_URL: missing
QA_STAFF_EMAIL: missing
QA_STAFF_PASSWORD: missing
QA_REQUEST_ID: missing
QA_CROSS_PARISH_REQUEST_ID: missing
QA_FAMILY_PORTAL_URL: missing
OPENAI_API_KEY: missing from process/user/machine scope
```

The local `.env.local` file was inspected without printing secrets. It contains infrastructure values for:

```text
NEXT_PUBLIC_SUPABASE_URL host: gnfomgsuottcuueasfvi.supabase.co
NEXT_PUBLIC_APP_URL host: localhost
```

That is not enough to run the browser-authenticated QA plan because the plan requires a safe staff login, safe request records, family portal fixture, monitoring owner/channel, rollback owner, and explicit non-production run approval evidence.

## Second Attempt

A later prompt stated that the approved browser-QA inputs had been provided:

```text
NON_PRODUCTION_APP_URL
QA_STAFF_EMAIL
QA_STAFF_PASSWORD
QA_REQUEST_ID
QA_CROSS_PARISH_REQUEST_ID
QA_FAMILY_PORTAL_URL
approved non-production OpenAI/audit settings
monitoring owner/channel
rollback owner
named sign-offs
```

The Codex process, Windows user scope, Windows machine scope, `HKCU:\Environment`, `HKCU:\Volatile Environment`, and `HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment` were checked again without printing secret values.

Safe environment check result:

```text
NON_PRODUCTION_APP_URL: missing
QA_STAFF_EMAIL: missing
QA_STAFF_PASSWORD: missing
QA_REQUEST_ID: missing
QA_CROSS_PARISH_REQUEST_ID: missing
QA_FAMILY_PORTAL_URL: missing
OPENAI_API_KEY: missing from process/user/machine scope
VINEA_AI_SUMMARY_* runtime gate flags: missing from process/user/machine scope
HKCU:\Environment: no matching browser-QA input names
HKCU:\Volatile Environment: no matching browser-QA input names
HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment: no matching browser-QA input names
```

The browser-authenticated QA gate was not executed on the second attempt because the required safe app, staff, request, family portal, OpenAI/audit, monitoring, rollback, and sign-off inputs still were not visible to Codex.

## Second Attempt Automated Check Outputs

- Focused blocked-evidence validation: `Pass` (`npm.cmd test -- lib/server/aiSummaryBrowserAuthNonproductionQaBlockedEvidence.test.ts`, `1` test file, `4` tests).
- Full test suite: `Pass` (`npm.cmd test`, `173` test files, `728` tests).
- Lint: `Pass` (`npm.cmd run lint`, `0` errors, `56` pre-existing `no-explicit-any` warnings).
- Production build: `Pass` (`npm.cmd run build`, Next.js `16.2.2`).
- Browser-authenticated QA: `Not run`.
- `/api/health` against a live non-production browser-QA app: `Not run`.
- OpenAI provider request: `Not run`.
- Live audit row write: `Not run`.

## Third Attempt

A later prompt stated that `scripts/set-ai-summary-browser-qa-env.ps1` had been run and the approved non-production QA values had been entered.

Codex rechecked variable visibility by name only using `scripts/check-ai-summary-browser-qa-env.ps1` and a separate safe app-host check. The required browser-QA variables were still not visible to this Codex session in process, Windows user, or Windows machine scope.

Safe environment check result:

```text
NON_PRODUCTION_APP_URL: missing
QA_STAFF_EMAIL: missing
QA_STAFF_PASSWORD: missing
QA_REQUEST_ID: missing
QA_CROSS_PARISH_REQUEST_ID: missing
QA_FAMILY_PORTAL_URL: missing
OPENAI_API_KEY: missing
VINEA_AI_SUMMARY_SAFETY_RUNTIME: missing
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK: missing
VINEA_AI_SUMMARY_AUDIT_WRITE: missing
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK: missing
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE: missing
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK: missing
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION: missing
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK: missing
```

The browser-authenticated QA gate was not executed on the third attempt because the approved app URL, safe staff credentials, safe request fixtures, family portal fixture, OpenAI/audit settings, monitoring, rollback, and sign-off inputs still were not visible to Codex.

## Blocker

The browser-authenticated QA plan cannot be executed safely from this Codex session because the required safe login and fixture inputs are not available:

- No safe staff email/password is available to sign in through the browser.
- No same-parish safe request ID is available for the staff AI summary test.
- No cross-parish denied request ID or forged active-parish test fixture is available.
- No safe family portal fixture or token plan is available.
- No named monitoring owner/channel or rollback owner is available.
- No explicit `NON_PRODUCTION_APP_URL` is available; `.env.local` points to a local app URL backed by shared QA infrastructure.

Running the browser QA anyway would require guessing credentials, creating or modifying QA data, or using an environment without the required approval evidence. This gate was therefore stopped before browser execution.

## What Was Not Run

- Browser sign-in with staff credentials: `Not run`
- `/api/health` against a live non-production app: `Not run`
- Gate 0 flag-off legacy browser regression: `Not run`
- Gate 1 base safety runtime fail-closed browser check: `Not run`
- Gate 2 audit-write approval browser check: `Not run`
- Gate 3 safe-response exposure browser check: `Not run`
- Gate 4 safety-chain generation browser check: `Not run`
- Cross-parish denial browser check: `Not run`
- Forged active-parish-cookie denial browser check: `Not run`
- Family portal page/API safety browser check: `Not run`
- Monitoring evidence capture: `Not run`
- Rollback verification in a live app: `Not run`
- Named sign-off capture: `Not run`

## Evidence Captured Instead

- Roadmap and build status were reviewed.
- The browser-authenticated QA plan was reviewed.
- Required environment variable presence was checked without printing secret values.
- `.env.local` infrastructure hostnames were checked without printing secret values.
- The gate was stopped before any browser session, OpenAI call, live audit write, migration, RLS change, or production runtime change.

## Required Input To Unblock

Provide the following through a secure local environment setup, without committing values to the repository:

```text
NON_PRODUCTION_APP_URL=<approved non-production app URL>
QA_STAFF_EMAIL=<safe staff account email>
QA_STAFF_PASSWORD=<safe staff account password>
QA_REQUEST_ID=<safe same-parish request id>
QA_CROSS_PARISH_REQUEST_ID=<safe denied request id or approved denial fixture>
QA_FAMILY_PORTAL_URL=<safe family portal fixture URL, no raw token recorded in evidence>
```

Also identify:

- Approved non-production OpenAI/audit settings.
- Monitoring owner/channel.
- Rollback owner.
- Technical owner.
- Security/data owner.
- Product-owner sign-off for this non-production browser run.

If using the repo helper, run it from `C:\Users\Owner\OneDrive\Desktop\priest-ops-assistant` and confirm it prints a success line like:

```text
Saved browser QA variables for approved non-production host: <host>
```

Then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-ai-summary-browser-qa-env.ps1
```

The checker should show `User` or `Process` as `True` for every required variable before Codex can proceed.

If Windows user-scope variables are not visible to Codex, rerun the setter with the repo-local ignored env-file option:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\set-ai-summary-browser-qa-env.ps1 -UseEnvLocalOpenAiKey -WriteLocalEnvFile
```

The script should print:

```text
Saved repo-local ignored QA env file: .env.ai-summary-browser-qa.local
```

The `.env.ai-summary-browser-qa.local` file is covered by the repo `.gitignore` rule `.env*` and must not be committed or pasted into chat.

## Final Decision

- `DO_NOT_APPROVE_BROWSER_AUTH_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN`
- `NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN`

Reason: local route/test-harness QA has passed, but the browser-authenticated non-production QA gate could not be executed without safe staff credentials, safe request fixtures, approved app identity, monitoring, rollback, and sign-off inputs.
