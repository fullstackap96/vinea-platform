# Parish Settings Latest-Response Boundary

Status: `PARISH_SETTINGS_LATEST_RESPONSE_IMPLEMENTED_20260711`

## What changed

Parish Settings now treats its parish configuration, Staff Access, recent audit activity, and public-intake routing reads as one coordinated refresh wave. Each read owns an abort controller and monotonically increasing generation under a latest-generation-wins rule; only the latest generation may settle visible data, errors, or loading state.

Supporting reads start in parallel with the main parish Settings read. Changing the active parish or unmounting the page invalidates and aborts every outstanding generation. The visible parish scope label is cleared while the next selected-parish snapshot is unresolved.

Starting a public-intake routing mutation also invalidates an older routing GET, preventing delayed read data from replacing the server-confirmed mutation response.

## Staff outcome

- A slower response from a previously selected parish cannot replace newer Settings data.
- Staff Access, recent activity, and public-intake routing refresh together instead of beginning only after the main settings response.
- Expected cancellation is quiet; genuine current-generation failures retain the existing safe guidance.
- Existing staff-reviewed writes, validation, confirmations, and audit behavior are unchanged.

## Safety boundary

- Server-side staff authentication, active parish membership, and route authorization remain authoritative.
- This is a browser read-coordination change, not a new authorization mechanism.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No communication or Google Calendar call occurred.
- No provider behavior, public-intake runtime routing, or production-sensitive flag changed.
