# Duplicate And Import Client Safe Messages - 2026-07-09

Decision: `DUPLICATE_IMPORT_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260709`

People duplicate review, Household duplicate review, and Data Imports no longer place arbitrary API `error` text directly into staff-visible status messages.

- Each action now has a plain-English fallback.
- Unexpected API or exception text is replaced before rendering.
- Approved validation and parish-scope guidance remains visible.
- Oversized import split-batch guidance remains visible.
- Source guards keep the three clients off raw `data.error` rendering paths.

This does not change merge or import behavior, active-parish authorization, supported import rows or fields, operational RLS, production gates, or database writes. It does not expose raw database, provider, row, or credential details.
