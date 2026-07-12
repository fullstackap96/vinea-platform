# Public Intake Form Accessibility And Autofill - 2026-07-11

Decision: `PUBLIC_INTAKE_ACCESSIBLE_AUTOFILL_IMPLEMENTED_20260711`

Status: Implemented for Baptism, Wedding, Funeral, OCIA, and Join Parish without changing intake payloads or runtime routing.

## Boundary

Every data-entry `input`, `select`, and `textarea` on the five core public intake forms now has:

- a stable form-control `name`;
- an explicit accessible name through `aria-label`; and
- deliberate browser autofill behavior.

Contact names use `name`, `given-name`, or `family-name` as appropriate. Email uses the email field type and `email` autocomplete token. Phone uses `type="tel"`, `inputMode="tel"`, and the `tel` autocomplete token so mobile browsers can present the appropriate keyboard. Join Parish address entry uses `street-address`.

Pastoral notes, ceremony preferences, household narratives, funeral details, and other context-specific fields explicitly use `autocomplete="off"` rather than inviting a browser to place unrelated saved personal data into them.

## Preserved Behavior

- Existing controlled React state and JSON request payloads are unchanged.
- Required/optional validation is unchanged.
- Public intake parish routing flags and legacy behavior are unchanged.
- Request notifications remain best-effort after successful intake creation.
- No communication, AI, Calendar, storage, export, certificate, or record mutation was performed during verification.

## Verification

`lib/server/publicIntakeFormAccessibilityAutofill.test.ts` scans every data control on all five forms and requires a stable name plus explicit accessible label. It also locks the contact autofill tokens, mobile telephone input behavior, address token, and the no-autofill boundary for pastoral free text.

A local rendered-page HTTP smoke started Next.js without submitting any form and confirmed Baptism, Wedding, Funeral, OCIA, and Join Parish each returned `200`, included the expected accessible/autofill attributes in rendered HTML, and contained no framework error marker. The server was stopped after verification. This is not represented as interactive cross-browser evidence because browser automation is not installed in the workspace.

Manual non-production browser QA should confirm that Safari, Chrome, and Edge offer expected contact autofill without filling pastoral notes, and that mobile devices show a telephone keyboard for phone entry.
