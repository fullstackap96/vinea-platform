# Parish Settings Validated Read Models

Status: `PARISH_SETTINGS_VALIDATED_READ_MODELS_IMPLEMENTED_20260711`

## Boundary

Parish Settings now validates and projects all four selected-parish GET responses before they may settle browser state:

1. parish configuration and Google integration status;
2. Staff Access;
3. recent audit activity; and
4. public-intake routing metadata.

The validators require the documented field types, bounded SLA values, normalized directories, safe staff roles, valid audit display rows, and selected-parish identifier agreement. A routing response must agree across its expected parish, active parish, and parish metadata identifiers.

Projection is allowlist-based. Staff timestamps and unrelated account fields are discarded. Audit rows retain only established display fields. Routing tokens cannot expose token hashes, raw token material, or unapproved fields even if an upstream response accidentally includes them.

The same routing projection also validates every staff-reviewed routing mutation response before it can replace visible state. Token creation separately permits only the expected one-time visible token fields, and domain verification separately permits only its boolean result and safe error text.

## Failure behavior

- Malformed current-generation data fails closed using the existing generic Settings guidance.
- A failed Staff Access shape clears staff rows and management authority rather than retaining stale privilege UI.
- A failed audit shape clears recent activity.
- A failed routing shape clears routing state.
- The existing abortable latest-generation-wins boundary remains in force before parsing and settlement.

## Unchanged boundaries

- Server-side authentication, active-parish membership, and write authorization remain authoritative.
- Staff-reviewed mutation controls, confirmations, and audit behavior are unchanged.
- No write route or provider behavior changed.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No email, Google Calendar, export, AI, storage, or public-intake runtime-routing action occurred.
