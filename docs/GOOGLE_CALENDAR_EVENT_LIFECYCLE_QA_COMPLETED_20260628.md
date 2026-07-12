# Google Calendar Event Lifecycle QA Completed - 2026-06-28

Status: Completed against the approved non-production Vercel preview and safe Google Calendar QA fixtures.

## Environment

| Item | Value |
|---|---|
| App URL | `https://vinea-platform-8jm7cy6ju-vinea.vercel.app` |
| Environment type | Non-production Vercel preview backed by shared QA |
| Staff account | Safe QA staff account only |
| Calendar account | Safe non-production Google Calendar account only |
| Production accessed | `NO` |
| Migrations applied | `NO` |
| Operational RLS changed | `NO` |
| Real parish calendar data touched | `NO` |

## Vercel Bypass Revocation

The temporary QA-only Vercel Protection Bypass for Automation entry named `Vinea QA preview health and Google OAuth reconnect 2026-06-28` was revoked before event lifecycle QA continued.

Evidence observed:

- Vercel displayed the confirmation dialog for that exact bypass name.
- The final `Remove Bypass` action completed.
- Vercel showed the success toast `Automation Bypass removed`.
- The bypass list returned to the empty-state prompt to add a secret.
- The repo-local ignored `.env.vercel-preview-qa.local` file was cleaned so `VERCEL_AUTOMATION_BYPASS_SECRET` is no longer present.

## Same-Parish Event Lifecycle

Active parish was switched to the parish A fixture by its saved fixture id.

Same-parish request fixture:

- Request detail loaded successfully.
- Active parish selector value matched parish A.
- `Request not found` was not shown.
- Scheduling tab loaded.
- Google Calendar section was visible.
- Confirmed baptism date was present and future dated.
- `Create Google Calendar Event` was enabled.

Lifecycle evidence:

| Step | Result |
|---|---|
| Create event | Passed |
| Create confirmation | Request showed `Google Calendar Synced`, an `Open Google Calendar event` link, `Update Calendar Event`, and `Delete Calendar Event` |
| Create message | `Calendar event saved. No conflicts found.` |
| Update event | Passed |
| Update confirmation | Request stayed synced and showed `Calendar event saved. No conflicts found.` |
| Delete event | Passed |
| Cleanup confirmation | Request returned to `No calendar event` and showed `Google Calendar event removed and link cleared.` |

The safe QA event was cleaned up through the Vinea delete flow.

## Cross-Parish Denial

With parish A still active, the cross-parish denied request fixture was opened.

Evidence observed:

- Active parish selector value still matched parish A.
- The cross-parish request showed `Request not found`.
- No Google Calendar section was shown.
- No Google Calendar create, update, or delete controls were available.
- No Google Calendar mutation was attempted from the denied request.

## Mismatched-Calendar Denial

With parish A still active, the mismatched-calendar request fixture was opened.

Evidence observed:

- Request detail loaded.
- Scheduling tab showed `Google Calendar Synced`.
- `Update Calendar Event` and `Delete Calendar Event` were visible.
- Update attempt returned: `This request is linked to a different parish calendar. Recreate the Google Calendar event for the selected parish.`
- Delete attempt returned: `This request is linked to a different parish calendar. Switch to the linked parish or contact an administrator before removing the event.`
- The request stayed synced after both denial attempts.
- `No calendar event` and `Google Calendar event removed` were not shown for the mismatched fixture.

These denial results confirm the route stopped before mutating the selected parish calendar when the request was linked to a different calendar.

## Remaining Notes

- The preview remained accessible through the authenticated Chrome/Vercel session after bypass revocation.
- The parish selector currently displays duplicated `Unnamed parish` labels for the QA fixtures even though the underlying option ids are distinct. This is a fixture naming/display issue, not a calendar routing failure.
- Direct shell health checks without a bypass remain expected to be blocked by Vercel preview protection; browser QA used the authenticated non-production preview session.

## What Changed Plain English

I removed the temporary Vercel access shortcut that had been created for QA, then tested the Google Calendar buttons using only the safe test calendar. Vinea successfully created one test calendar event, updated it, and deleted it. I also checked that a request from another parish was blocked and that a request linked to the wrong calendar could not update or delete anything.

This matters because it proves the Google Calendar integration follows the selected parish instead of accidentally changing another parish's calendar.
