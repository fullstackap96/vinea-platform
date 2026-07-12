# DAILY_WORK_HUB_SAFE_LINK_BOUNDARY_20260708

Status: `READ-ONLY DAILY WORK HUB LINK HARDENING`

Date: 2026-07-08

## Purpose

The Daily Work Hub is the first staff-facing dashboard card and should only point parish staff to normal Vinea dashboard queues. It uses upstream command-center and parish-ops cue data, so it needs the same dashboard-only link boundary as the Daily Office Handoff, Parish Health Score, Operational Intelligence Brief, and Workflow Reminder Preview.

## What Is Guarded

- Daily Work Hub top action links from parish ops focus items.
- Daily Work Hub fallback command-center action links.
- Ready-for-staff-review links for duplicate review, incomplete records, and certificate-ready review.
- Request-to-record continuity handoff link.

## Allowed Link Scope

Links may only resolve to staff dashboard paths that start with `/dashboard`.

If an upstream cue supplies an unsafe destination, the Daily Work Hub falls back to a safe dashboard queue such as `/dashboard/requests`, `/dashboard/people`, or `/dashboard/records`.

## Forbidden Link Scope

The Daily Work Hub must not expose:

- external URLs;
- protocol-relative URLs;
- JavaScript URLs;
- API routes;
- export routes;
- email/send routes;
- AI routes;
- storage paths;
- signed URLs;
- token material;
- raw metadata or raw export locations.

## Runtime Boundary

This slice only sanitizes read-only staff-facing dashboard links. It does not mutate records, does not send communications, does not enable automation, does not call AI, does not run exports, does not access storage, does not create signed URLs, does not generate certificates, does not apply migrations, does not change operational RLS, does not access production, and does not make public trust claims.
