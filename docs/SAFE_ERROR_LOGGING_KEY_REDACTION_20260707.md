# Safe Error Logging Key Redaction - 2026-07-07

Status: Implemented as a central production-readiness logging hardening slice.

## Purpose

The shared server logging helper now redacts sensitive extra fields by key name before writing development or server logs. This complements value-pattern redaction for database URLs, JWTs, bearer tokens, API-token-like values, and email addresses.

The text redactor also masks sensitive key/value payloads that can appear inside thrown messages or provider callback strings, including access tokens, refresh tokens, family portal tokens, signed URLs, storage paths, original filenames, raw AI prompt/output markers, provider payload markers, and AWS signed URL signature parameters. Sensitive key names in those free-form payloads collapse to generic `[redacted key]` markers so server logs do not preserve field labels such as raw prompt, signed URL, storage path, original filename, or provider payload.

## What Changed

- `logServerError(...)` and `logServerWarning(...)` now redact the context string with `redactSensitiveLogText(...)`.
- String extra fields with sensitive key names are replaced with `[redacted by key]` when they have a value.
- Safe label fields such as route names, counts, booleans, and other non-sensitive operational labels can still appear.
- Boolean and numeric evidence flags such as `hasActorEmail: true` or `tokenCount: 0` remain visible, even when the key name mentions a sensitive concept, because they prove presence/count without exposing the sensitive value.
- Free-form text containing sensitive key/value pairs such as access-token parameters, encoded token parameters, signed URL markers, storage path markers, original filename markers, raw AI prompt/output markers, or provider payload markers is redacted before logging.
- Sensitive free-form key/value markers are replaced with generic `[redacted key]=[redacted]`, `[redacted key]%3D[redacted]`, or `"[redacted key]":"[redacted]"` placeholders instead of preserving sensitive field labels.

Sensitive key families include:

- token
- secret
- password
- key
- authorization
- cookie
- signed URL
- database URL
- service role
- anon key
- email
- original filename
- storage path
- document content
- raw payload
- portal

Sensitive free-text payload families include:

- access token
- refresh token
- family portal token
- signed URL
- AWS signed URL signature
- storage path
- original filename
- raw AI prompt
- raw AI output
- provider payload

## Safety Boundary

This change does not alter route behavior, staff authorization, active-parish scope, operational RLS, production flags, migrations, records, exports, AI calls, storage access, signed URLs, communications, certificates, Google Calendar data, or public trust claims.

## Verification

- `npm.cmd test -- lib\server\safeErrorLogging.test.ts`

The focused test proves:

- Secret-looking values are redacted by value pattern.
- Sensitive key/value payloads in free-form error text are redacted by value pattern and sensitive field labels collapse to generic redacted-key placeholders.
- Sensitive extra values are redacted by key even when the value is a harmless-looking label.
- Safe route labels, counts, and booleans remain visible for troubleshooting.
- Boolean and numeric evidence flags are not over-redacted by sensitive key names.
