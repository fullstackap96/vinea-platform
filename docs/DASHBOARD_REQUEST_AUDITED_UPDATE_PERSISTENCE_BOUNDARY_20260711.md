# Dashboard Request Audited Update Persistence Boundary

Date: 2026-07-11

Status: Implemented and locally verified.

## Purpose

Request Detail Server Actions power high-frequency parish-office work. An update can match zero rows without a database error, especially during stale-record or authorization-policy races. Vinea must not show success or write request history unless the intended row was positively updated.

## Covered Actions

- Request status
- Workflow-step status
- Assignment
- Next follow-up date
- Waiting-on blocker

Each action already authenticates the staff user and resolves selected active-parish request ownership before updating. Each update now returns only `id`, uses `maybeSingle()`, and requires a matched row before `auditRequestAction(...)` or success.

## Failure Behavior

- Database errors keep the existing curated action-specific guidance.
- Zero-row request updates return generic `Request not found.` guidance.
- Zero-row workflow-step updates return generic `Workflow step not found.` guidance.
- No route-owned audit event is written after an unconfirmed update.

## Explicit Exclusions

Multi-stage intake editing, playbook/checklist insertion, note insertion, and request-to-person linking remain under their existing dedicated tests and partial-flow behavior. This slice does not change production, migrations, operational RLS, communications, Calendar, AI, storage, exports, certificates, or public claims.

## Regression Guard

`dashboardRequestAuditedUpdatePersistenceRegressionGuard.test.ts` maintains an explicit five-action inventory and requires update, minimal returned id, single-row completion, positive row confirmation, audit, and success in that order.

## Production Boundary

This local hardening does not approve production deployment. Existing production-sensitive gates remain locked.
