# Request Relationship Active Parish Suggestion Scope

Status: Implemented as read-only request-detail suggestion hardening.

## What Changed

- The request person-link card now receives the selected request parish id from the already loaded request.
- Linked-person and existing-intake-contact lookups now filter People rows by the selected request parish.
- Request relationship suggestions now filter both People and Household Member reads by the selected request parish before building suggestions.
- If the request parish id is not available, the suggestion widgets fail closed by showing no suggestions instead of searching broadly.

## Safety Boundary

This slice is read-only suggestion scoping. It does not mutate records, apply migrations, and does not change operational RLS. It also does not access production, send communications, call AI, run exports, touch Google Calendar data, access storage, create signed URLs, generate certificates, make canonical/sacramental eligibility decisions, or make public trust claims.

## Why It Matters

When staff review a request, suggested People and Household matches should come from the parish that owns that request. This keeps the helper useful for front-desk staff while reducing cross-parish suggestion noise and accidental exposure.
