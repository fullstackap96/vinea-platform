# Request Sent Email Communication Log Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

After a staff-reviewed email is successfully sent through the existing email route, the follow-up
communication-history entry now uses `app/api/requests/[id]/communications/route.ts` instead of
browser-side Supabase writes.

## What Changed

- The Request Detail `sendEmail` flow still sends through `/api/email/send`.
- After a successful send, the page calls `POST /api/requests/[id]/communications` with:
  - `contactedAt`
  - `method: email`
  - a staff-readable summary note
- The shared communication `POST` route verifies staff authentication, active parish context, and
  request ownership before inserting `request_communications` or updating request summary fields.
- Staff-facing failure copy still preserves the existing meaning:
  - the email may have been sent,
  - but communication-history logging or summary update needs staff attention.

## What Changed In Plain English

When staff send an email from a request, Vinea still sends the email the same way. The difference is
what happens afterward: the record that says "this email was sent" is now saved through the server,
where Vinea can confirm the selected parish is allowed to work on the request.

## Safety Boundary

This slice does not change email delivery, send new automated communications, enable automation,
call AI, run exports, touch Google Calendar, access storage, create signed URLs, generate
certificates, apply migrations, change operational RLS, access production, or make public trust
claims.

This only moves the post-send communication-history write behind the existing active-parish-aware
communication log route.

## Manual QA Checklist

- Sign in as a safe staff user in a non-production environment.
- Select an authorized active parish.
- Open a same-parish request detail page with a safe recipient email.
- Send a safe test email only in an approved non-production email environment.
- Confirm the email-success message still appears.
- Confirm the communication history shows the sent-email entry.
- Confirm request communication summary fields reflect the sent-email summary.
- Switch active parish and confirm the same request cannot be logged through the wrong selected
  parish.

## Verification

- Source-level tests cover the post-send route call, active-parish route reuse, removal of direct
  browser Supabase writes for this flow, safe staff messages, and this doc.
