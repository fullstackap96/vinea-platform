# Workflow Reminder Preview Safe Link Boundary

Current decision state: `READ-ONLY REMINDER PREVIEW LINK BOUNDARY IMPLEMENTED; RUNTIME REMINDERS AND OUTBOUND DELIVERY REMAIN NO-GO`

Date: 2026-07-08

## Purpose

Workflow Reminders V1 remains dashboard-only and staff-reviewed. Reminder DTOs may receive explicit upstream links for certificate-ready review and duplicate-review work, and future disposition DTOs also carry the reminder href for staff context.

This slice makes the link boundary explicit: reminder and disposition hrefs are preserved only when they are dashboard-internal paths that start with `/dashboard`. External URLs, API paths, protocol URLs, and `javascript:`-style links fall back to safe dashboard queues.

## What Changed

- `lib/workflowReminderDtos.ts` now sanitizes explicit certificate-ready and duplicate-review hrefs.
- `lib/workflowReminderDispositionDtos.ts` now sanitizes disposition hrefs copied from reminder DTOs.
- Focused tests prove unsafe upstream links fall back to safe dashboard paths while valid dashboard links remain intact.

## Staff Experience

The reminder preview still points staff to ordinary dashboard queues. It still does not dismiss, suppress, snooze, send, schedule, export, generate, or mutate anything at runtime.

## Safety Boundary

This does not enable runtime reminders, send communications, persist reminders, persist dispositions, mutate records, apply migrations, change operational RLS, access production, call AI, run exports, access storage, create signed URLs, generate certificates, or make public trust claims.

Production runtime reminder delivery remains `NO-GO`.
