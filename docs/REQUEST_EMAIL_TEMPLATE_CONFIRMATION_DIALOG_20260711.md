# Request Email Template Confirmation Dialog - 2026-07-11

Decision: `REQUEST_EMAIL_TEMPLATE_CONFIRMATION_DIALOG_IMPLEMENTED_20260711`

Status: Implemented and verified on Request Detail.

## Staff Experience

- Replaced the final native browser confirmation prompt with the shared Vinea confirmation dialog.
- The dialog appears only when applying a parish template would replace an existing subject or message.
- Staff can keep reviewing, or deliberately replace the draft and continue editing before send.
- Applying state prevents repeat confirmation while the existing draft save completes.
- Keyboard focus, Escape handling, focus restoration, and accessible labeling come from the shared dialog.

## Safety Boundary

Applying a template does not send email. It renders the existing reviewed template into the staff editor and persists the body through the existing active-parish request-scoped reply-draft API. Recipient derivation, staff email authorization, selected-parish ownership, provider behavior, and communication logging are unchanged and remain server-owned.

## Verification Boundary

- No production access.
- No communication was sent.
- No database migration, operational RLS change, provider call, or record mutation during verification.
- No Calendar, AI generation, export, storage, signed URL, certificate, or production-sensitive flag action.

Rollback is a client-only interaction reversal and requires no API or database rollback.
