# Google Calendar HTTPS Non-Production Callback QA Packet - 2026-06-28

Status: `PREPARED - AWAITING APPROVED HTTPS CALLBACK`

This packet defines the approved HTTPS non-production callback path required before Vinea can safely rerun selected-parish Google Calendar OAuth reconnect QA. It does not authorize production access, migration application, operational RLS changes, Google credential submission, or Google Calendar event mutation.

## Safety Boundaries

| Boundary | Requirement |
| --- | --- |
| Production access | `NO` |
| Production Google OAuth client | `NO` unless explicitly approved later |
| Migrations | `NO` |
| Operational RLS changes | `NO` |
| Google credentials submitted | `NO` until callback URL is approved and registered |
| Google event create/update/delete | `NO` until OAuth reconnect passes and selected-parish guards are confirmed |
| Secrets in evidence | `NO` |

## Why This Is Needed

The last browser QA proved the same-parish request detail now loads after selecting Parish A. The remaining blocker is Google OAuth itself: Google rejected the private LAN callback URL. Vinea needs a public HTTPS non-production origin that is registered in the Google OAuth client before reconnect QA can continue.

Vinea builds the Google OAuth redirect URI from `NEXT_PUBLIC_APP_URL`:

```text
${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback
```

The redirect URI in Google Cloud Console must match that value exactly.

## Approved Non-Production URL Options

Use exactly one of these options.

| Option | Recommended Use | Requirements |
| --- | --- | --- |
| Staging subdomain | Best long-term QA path | HTTPS URL such as `https://staging.vinea.example`; deploys the same branch/build; points to shared-QA or explicitly approved non-production Supabase only |
| Temporary HTTPS tunnel | Short-term local browser QA | HTTPS URL from an approved tunnel provider; maps to local app port `3000`; tunnel URL remains active for the entire OAuth flow; used only with safe QA credentials |
| Vercel preview deployment | Good review path | HTTPS preview URL; env vars point only to shared-QA/non-production Supabase and safe Google OAuth client |

Do not use private IP, `http://`, `localhost`, `127.0.0.1`, or production domains for this QA gate.

## Required Environment Values

For the non-production app instance:

```text
NEXT_PUBLIC_APP_URL=https://<approved-non-production-origin>
GOOGLE_CLIENT_ID=<safe non-production Google OAuth client id>
GOOGLE_CLIENT_SECRET=<safe non-production Google OAuth client secret>
GOOGLE_OAUTH_STATE_SECRET=<non-production state signing secret>
NEXT_PUBLIC_SUPABASE_URL=<shared QA or approved non-production Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<matching non-production anon key>
SUPABASE_SERVICE_ROLE_KEY=<matching non-production service role key>
```

The app origin must not point at production, and the Supabase values must not point at production.

## Google Cloud Console Requirements

In the safe non-production Google OAuth client:

1. Open **Google Cloud Console**.
2. Select the safe non-production project/client used only for Vinea QA.
3. Go to **APIs & Services > Credentials**.
4. Open the OAuth 2.0 Client ID used by Vinea QA.
5. Add this exact authorized redirect URI:

```text
https://<approved-non-production-origin>/api/google/oauth/callback
```

6. Save the client.
7. Confirm the OAuth consent screen allows the safe QA Google Calendar account.
8. Confirm the OAuth scopes include:

```text
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/userinfo.email
```

## App Startup Requirements

For local/tunnel QA, start Vinea so the public origin and callback match the registered Google URI exactly:

```powershell
$env:NEXT_PUBLIC_APP_URL = "https://<approved-non-production-origin>"
npm.cmd run start -- -H 0.0.0.0 -p 3000
```

For Vercel preview or staging QA, configure `NEXT_PUBLIC_APP_URL` in that environment to the same HTTPS origin displayed in the Google redirect URI.

## Preflight Checks Before Google Login

All must pass before submitting any Google credentials:

- `/api/health` returns `ok: true`.
- `/api/health` returns `checks.schema: true`.
- App URL in the browser begins with the approved HTTPS non-production origin.
- Staff can sign in with safe QA credentials.
- Active parish selector can select Parish A.
- Same-parish request detail loads and does not show `Request not found`.
- Settings page shows the Google Calendar section for the selected parish context.
- `NEXT_PUBLIC_APP_URL` exactly matches the approved HTTPS origin.
- Google Cloud Console contains the exact redirect URI.

## OAuth Reconnect QA Steps After Preflight

Only after the preflight checks pass:

1. Navigate to Parish Settings.
2. Start Google Calendar reconnect.
3. Confirm Google redirects to the safe QA Google account flow.
4. Submit only the approved safe QA Google account credentials.
5. Confirm callback returns to `/dashboard/settings?gcal=connected`.
6. Confirm the selected parish's Google Calendar status shows connected.
7. Confirm no other parish integration row is changed.
8. Confirm audit/evidence records contain no tokens or secrets.

## Calendar Event Mutation Rules

Do not create, update, or delete Google Calendar events until:

- OAuth reconnect passes.
- Selected parish remains Parish A after callback.
- Same-parish request detail still loads.
- Cross-parish request remains denied.
- Mismatched-calendar fixture remains protected.

When event lifecycle QA is later approved, use only the safe QA calendar and synthetic fixture request.

## Rollback And Cleanup

If OAuth reconnect fails:

- Stop before calendar mutation.
- Capture the generic user-facing error and server-side non-secret status.
- Leave production untouched.
- If a safe non-production integration row was partially updated, deactivate or reset only the safe QA parish integration after explicit approval.
- Remove or shut down any temporary tunnel.

If OAuth reconnect succeeds:

- Record the safe QA parish connection status without exposing refresh tokens.
- Do not leave temporary tunnels running.
- Keep evidence in repo docs with secrets redacted.

## Pass/Fail Criteria

| Gate | Pass Criteria | Fail Criteria |
| --- | --- | --- |
| Callback approval | Exact HTTPS callback is registered in Google | Callback is private IP, HTTP, localhost, production, or unregistered |
| App origin | `NEXT_PUBLIC_APP_URL` equals approved origin | Origin mismatch or production origin |
| Health | `checks.schema: true` | Health false or schema false |
| Same-parish request detail | Loads after selecting Parish A | Shows `Request not found` |
| OAuth reconnect | Returns to settings with `gcal=connected` | Google rejects redirect, state fails, staff denied, or selected parish denied |
| Data isolation | Only selected parish integration changes | Any other parish integration changes |

## Final Approval Needed

Before the next browser run, product owner or QA owner must provide:

- The approved HTTPS non-production origin.
- Confirmation that the Google OAuth client has the exact redirect URI.
- Confirmation that safe QA Google credentials may be submitted.
- Confirmation that event lifecycle mutation is still blocked until reconnect passes.
