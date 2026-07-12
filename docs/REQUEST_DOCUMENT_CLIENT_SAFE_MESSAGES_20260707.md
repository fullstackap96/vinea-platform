# Request Document Client Safe Messages - 2026-07-07

Status: Implemented for the authenticated staff request document panel on request detail pages.

## Scope

- Added `lib/requestDocumentClientMessages.ts`.
- Updated `app/dashboard/requests/[id]/_components/RequestDocumentsSection.tsx`.
- Added focused unit and source-level tests for staff-facing document panel failures.
- Updated release-readiness documentation references.

## Staff-Facing Behavior

The request document panel now uses curated messages for:

- Document list loading failures.
- Staff document upload failures.
- Staff approve/reject review failures.
- Secure document open failures.
- Browser-blocked document windows, with a clear allow-popups-and-retry instruction.
- Family upload link creation failures.

The client still preserves approved setup guidance when the API intentionally reports that request document storage or family portal token tables are not configured yet.

The panel now also routes API payload errors through `requestDocumentClientFailureMessage(...)` before constructing client exceptions, so raw `payload.error` text is not placed into the browser-side `Error.message` path.

Vinea now requests the blank document window directly inside the staff click, removes its opener relationship, and only navigates it after the scoped API returns an authorized signed URL. If the browser blocks the blank window, Vinea reports that state before requesting a signed URL. If authorization or signed URL creation fails, Vinea closes the blank window and shows the curated failure message. The signed URL is not rendered, logged, copied, or stored by this recovery path.

The server now also requires the storage provider response to contain a non-empty absolute HTTP(S) signed URL without embedded credentials before returning `ok: true`. A returned error, missing URL, blank URL, relative URL, unsafe scheme, or credential-bearing URL follows the same generic download failure path and logs only a safe missing-value boolean.

## Safety Boundary

This slice prevents raw backend, storage, signed URL, token, filename, or provider exception text from being rendered in the staff browser for common request-document failures.

It preserves:

- Active-parish-aware request document authorization.
- Primary-parish fallback behavior when no active parish cookie exists.
- Storage upload behavior.
- Signed URL creation behavior.
- The existing 60-second signed URL expiry.
- Family upload link creation behavior.
- Document review semantics.
- Existing audit event behavior.
- Existing server-side safe logging.

## No-Go Boundaries

This slice does not access production, apply migrations, change operational RLS, change document authorization, change storage buckets, change signed URL duration, create new signed URL behavior, expose storage paths, run exports, call AI, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

## Verification

- Focused tests cover the helper and source-level wiring.
- Existing request document route tests continue to cover server-side safe logging and active-parish authorization.
- Signed URL confirmation tests cover valid HTTPS and local HTTP values plus missing, null, non-object, blank, relative, unsafe-scheme, and credential-bearing provider responses.
