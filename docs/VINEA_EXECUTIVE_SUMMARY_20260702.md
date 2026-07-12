# Vinea Executive Summary

Generated: 2026-07-02

Vinea Platform is a Catholic parish operations SaaS product. It helps parish staff turn baptism, funeral, wedding, OCIA, join-parish, records, documents, follow-up, communication, and scheduling work into owned, auditable workflows.

The target customer is a Catholic parish office, parish cluster, pastorate, or diocesan pilot group currently coordinating pastoral and administrative work through email, spreadsheets, paper notes, disconnected calendars, and institutional memory.

## Position

Vinea should not compete as a generic church database. Its opening is the intersection of Catholic-specific workflows, modern daily-work UX, safe AI, staff accountability, and diocesan-grade governance.

Current strengths:

- Structured public intake for core Catholic request types.
- Staff dashboard and role work hub focused on what needs attention today.
- Request workflow depth: assignment, follow-up, communication, notes, checklists, workflow steps, documents, portal tokens, and calendar sync.
- People, households, duplicate review, sacramental records, baptism certificates, Mass intentions, imports, reports, settings, staff access, audit log, and daily brief.
- Strong safety posture in progress: staff authorization, RLS, active parish context, durable rate limiting, export gates, audit events, trust-center evidence, and AI safety contracts.

Current maturity: late prototype to early pilot-readiness. The project has substantial product surface but is not yet production-complete for diocesan or multi-parish scale.

Primary blockers:

- Membership-aware operational RLS still requires disposable forward/rollback evidence and promotion approval.
- Production exports remain no-go.
- Backup/restore public claims remain no-go pending owner review and stronger storage/document evidence.
- MFA/SSO and granular RBAC are not yet implemented.
- AI safety contracts are ahead of full runtime enforcement.
- Documentation volume needs consolidation into a maintainable operations index.

## Recommendation

Continue building Vinea as the Catholic parish operating system for closed-loop care:

1. Finish multi-parish safety and production trust gates.
2. Deepen Catholic records/certificates/notations.
3. Add workflow automation triggers and reminders.
4. Wire AI safety into runtime generation paths.
5. Simplify onboarding, migration, and role-specific daily work.
6. Use external architecture/product review every two weeks or after major milestones.
