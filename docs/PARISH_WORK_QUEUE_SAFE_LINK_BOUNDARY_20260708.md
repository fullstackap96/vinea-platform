# Parish Work Queue Safe Link Boundary - 2026-07-08

Status: Implemented as read-only staff work-queue link hardening.

## Scope

This boundary keeps staff-facing links dashboard-internal for:

- Parish Care Calendar request and Mass intention items,
- Parish Communication Center request follow-up rows,
- Parish Intake Queue request and Mass intention rows.

Request and Mass intention identifiers are encoded before being placed into dashboard links, and each link flows through the shared dashboard href utility.

## Staff Experience

The work queues still point staff to the same request, communication-history, follow-up, and Mass intention screens. The difference is that the link builders now have the same explicit dashboard-only safety boundary used by the Daily Work Hub, Notifications Center, Catholic records continuity cues, and onboarding readiness.

## Production Safety

This slice does not mutate records and does not send communications. It also does not:

- enable automation,
- call AI,
- run exports,
- access storage,
- create signed URLs,
- generate certificates,
- apply migrations,
- change operational RLS,
- access production,
- touch Google Calendar data,
- make public trust claims.

## Verification

- `lib/parishCareCalendar.test.ts`
- `lib/parishCommunicationCenter.test.ts`
- `lib/parishIntakeQueue.test.ts`
- `lib/server/parishWorkQueueSafeLinkBoundary.test.ts`
