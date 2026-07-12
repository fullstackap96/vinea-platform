# Public Intake Routing Settings Manual QA Checklist

Status: checklist only. Do not apply migrations, do not touch production data, do not enable runtime public intake routing in production, and do not change operational RLS while using this checklist.

## Scope

Use this checklist to manually verify the staff-only public intake routing settings UI in `/dashboard/settings`.

This checklist covers:

- Public routing metadata edits.
- Domain add, activate, and deactivate behavior.
- Domain ownership verification token, DNS TXT metadata, verify, and reset behavior.
- Public token creation, one-time visibility, and activate/deactivate behavior.
- Audit-log verification.
- No token hash or raw-token exposure after creation.
- Confirmation that runtime public intake routing remains disabled unless the exact safe QA runtime flags are set.

## Environment Rules

- Use only safe QA or local test credentials.
- Do not use production or shared customer data.
- Do not create real family-facing public routing links.
- Do not change Supabase migrations.
- Do not change operational RLS.
- Do not enable runtime routing in production.
- Record the app URL, Supabase project ref, test staff account, browser, date, and tester.

## Preflight Checks

- `/api/health` returns `checks.schema: true`.
- Staff can sign in and open `/dashboard/settings`.
- The `Public intake routing` section is visible.
- The page says routing is prepared but not live.
- Existing public intake forms still submit through the legacy public intake flow.
- Source check: `/api/intake` calls `getPublicIntakeRoutingRuntimeGate()` and preserves legacy behavior when the gate is disabled.

## Metadata Edit Cases

| Case | Steps | Expected Result |
| --- | --- | --- |
| Public display name edit | Enter a safe test display name and save routing metadata. | Save succeeds and the value remains visible after refresh. |
| Public slug edit | Enter a lowercase slug such as `qa-test-parish` and save. | Save succeeds and the slug remains visible after refresh. |
| Public slug validation | Enter an invalid slug such as `-bad slug` and save. | Save is rejected with a clear error. |
| Enable readiness flag | Check the readiness flag and save. | Save succeeds, but public forms still use legacy routing. |
| Disable readiness flag | Uncheck the readiness flag and save. | Save succeeds, and runtime public intake remains unchanged. |

## Domain Management Cases

| Case | Steps | Expected Result |
| --- | --- | --- |
| Add domain | Add a safe test hostname such as `forms-qa.example.org`. | Domain appears in the list as active and not verified. |
| Duplicate domain | Add the same hostname again. | Save is rejected with a duplicate-domain message. |
| Invalid domain | Add invalid text such as `not a domain`. | Save is rejected with a clear validation error. |
| Deactivate domain | Click `Deactivate` for the test domain. | Domain remains visible and becomes inactive. |
| Activate domain | Click `Activate` for the test domain. | Domain remains visible and becomes active. |
| DNS TXT metadata | Review the domain row. | Staff sees a DNS TXT record name and value for domain ownership verification. |
| Verify before DNS is configured | Click `Verify DNS` before adding the TXT record. | Verification fails with a clear DNS-pending message and records the last check. |
| Reset verification token | Click `Reset verification token`. | The DNS TXT value changes, the domain becomes unverified, and the new value remains visible to staff. |
| Verify after DNS is configured | Add the expected TXT record in a safe DNS test domain and click `Verify DNS`. | Verification succeeds and `verified_at` is set. |

## Token Management Cases

| Case | Steps | Expected Result |
| --- | --- | --- |
| Create token for any form | Enter a label, leave form type as `Any public form`, optionally set expiration, and create token. | Save succeeds and the full token is shown once. |
| Create token for Baptism | Create a token with form type `Baptism`. | Save succeeds and the list shows the token label and Baptism form type. |
| One-time visibility | Refresh the page after token creation. | The raw token is no longer visible. |
| No token hash exposure | Inspect the settings page and network response for normal metadata loading. | No `token_hash` field is present. |
| Deactivate token | Click `Deactivate` for the test token. | Token remains visible and becomes inactive. |
| Activate token | Click `Activate` for the test token. | Token remains visible and becomes active. |
| Invalid form type via API | Attempt an unsupported `request_type` against the staff API in a safe test client. | Request is rejected. |

## Audit Log Verification

Open `/dashboard/admin/audit-log` after each action and confirm the relevant event exists:

- `public_intake_routing.updated`
- `public_intake_domain.created`
- `public_intake_domain.updated`
- `public_intake_domain.verification_reset`
- `public_intake_domain.verified`
- `public_intake_domain.verification_failed`
- `public_intake_token.created`
- `public_intake_token.updated`

Expected audit behavior:

- Audit entries show the staff actor.
- Audit entries are scoped to the active parish.
- Audit metadata does not include raw public tokens.
- Audit metadata does not include token hashes.

## Runtime Routing Non-Regression

Confirm all of the following after settings changes:

- With runtime flags off, existing public Baptism request form still submits through the legacy public intake path.
- With runtime flags off, existing public Wedding request form still submits through the legacy public intake path.
- With runtime flags off, existing public Funeral request form still submits through the legacy public intake path.
- With runtime flags off, existing public OCIA request form still submits through the legacy public intake path.
- With runtime flags off, existing Join Parish form still submits through the legacy public intake path.
- No public page exposes staff-only routing metadata.
- No public page exposes internal notes, AI notes, audit logs, token hashes, raw tokens, membership data, or private parish data.

## Cleanup

- Deactivate test domains and test tokens after QA.
- Remove or reset test-only public display names and slugs if they should not remain in QA.
- Record any created safe test records.
- Do not delete production data.

## Pass Criteria

The QA run passes only if:

- Metadata edits work and invalid slugs are rejected.
- Domain add, duplicate rejection, activate, and deactivate work.
- Token create, one-time visibility, activate, and deactivate work.
- No token hash is exposed in normal metadata responses.
- Raw token is visible only in the create response.
- Audit events exist for all setting changes.
- Runtime public intake routing remains disabled unless the exact safe QA runtime flags are set.
- Existing public intake forms still work through the legacy flow.

## Fail Criteria

Stop and investigate if:

- A raw token appears after refresh.
- `token_hash` appears in settings UI or normal metadata responses.
- Staff can mark a domain verified.
- Public forms start using slug, domain, or token routing while the runtime flags are off.
- Any public route exposes staff-only data.
- A staff user can manage another parish's routing metadata without valid membership.
