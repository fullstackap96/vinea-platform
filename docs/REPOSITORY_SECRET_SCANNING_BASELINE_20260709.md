# Repository Secret Scanning Baseline

Current decision state: `REPOSITORY SECRET SCANNING IMPLEMENTED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date: 2026-07-09

## Purpose

Vinea must fail review when a credential-shaped value is accidentally added to a tracked or pending non-ignored text file. The scanner is a repository safety control, not a substitute for provider-side secret rotation, GitHub secret scanning, environment-variable controls, or incident response.

## Safe Output Contract

`npm run check:repository-secrets` reports only:

- repository-relative file path;
- rule identifier;
- line number;
- aggregate scanned, skipped-binary, and finding counts.

It never prints the matched value. Its report must keep `secretValuesPrinted: false` and `valuePolicy: file-path-rule-id-and-line-only`.

## Covered Shapes

- three-segment JWTs, including Supabase key shapes;
- OpenAI secret keys;
- Google OAuth client secrets;
- Vercel access tokens;
- Resend API keys;
- AWS access key IDs;
- GitHub access tokens;
- PostgreSQL URLs containing a non-placeholder password;
- private-key headers.

Documented placeholders such as `[YOUR-PASSWORD]`, `<REDACTED>`, and short redaction examples remain allowed. Binary files are counted and skipped by this text scanner.

## Response To A Finding

1. Do not paste the matched value into issues, chat, evidence, or logs.
2. Treat a real credential as compromised and rotate or revoke it at the provider.
3. Remove it from the working tree and, when necessary, follow an approved history-remediation process.
4. Rerun the scanner and the normal release-readiness checks.
5. Record labels and outcomes only.

## Boundary

This scanner does not access production, rotate secrets, rewrite Git history, deploy code, enable production flags, apply migrations, change operational RLS, mutate records, call AI, run exports, access storage, create signed URLs, send communications, touch Google Calendar data, or approve public trust claims.
