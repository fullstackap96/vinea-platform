-- =============================================================================
-- Demo seed data for parish operations demos (baptism, funeral, wedding).
-- Run in Supabase SQL Editor as a privileged role (often service role / postgres).
--
-- Re-runnable: deletes prior rows with these fixed IDs, then inserts fresh data.
-- All names and emails are fictional (example.com).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Clean up any previous demo seed (order respects foreign keys)
-- -----------------------------------------------------------------------------
DELETE FROM public.request_communications
  WHERE request_id IN (
    '20202020-2020-4020-8020-202020202001'::uuid,
    '20202020-2020-4020-8020-202020202002'::uuid,
    '20202020-2020-4020-8020-202020202003'::uuid
  );

DELETE FROM public.checklist_items
  WHERE request_id IN (
    '20202020-2020-4020-8020-202020202001'::uuid,
    '20202020-2020-4020-8020-202020202002'::uuid,
    '20202020-2020-4020-8020-202020202003'::uuid
  );

DELETE FROM public.funeral_request_details
  WHERE request_id = '20202020-2020-4020-8020-202020202002'::uuid;

DELETE FROM public.wedding_request_details
  WHERE request_id = '20202020-2020-4020-8020-202020202003'::uuid;

DELETE FROM public.requests
  WHERE id IN (
    '20202020-2020-4020-8020-202020202001'::uuid,
    '20202020-2020-4020-8020-202020202002'::uuid,
    '20202020-2020-4020-8020-202020202003'::uuid
  );

DELETE FROM public.parishioners
  WHERE id IN (
    '10101010-1010-4010-8010-101010101001'::uuid,
    '10101010-1010-4010-8010-101010101002'::uuid,
    '10101010-1010-4010-8010-101010101003'::uuid
  );

-- -----------------------------------------------------------------------------
-- Parishioners (fixed UUIDs)
-- -----------------------------------------------------------------------------
INSERT INTO public.parishioners (id, full_name, email, phone)
VALUES
  (
    '10101010-1010-4010-8010-101010101001'::uuid,
    'Margaret O''Brien',
    'margaret.obrien@example.com',
    '555-010-2001'
  ),
  (
    '10101010-1010-4010-8010-101010101002'::uuid,
    'James Martinez',
    'james.martinez@example.com',
    '555-010-2002'
  ),
  (
    '10101010-1010-4010-8010-101010101003'::uuid,
    'Elena Kowalski',
    'elena.kowalski@example.com',
    '555-010-2003'
  );

-- -----------------------------------------------------------------------------
-- Requests (fixed UUIDs)
-- Timestamps use now() so "stale contact" / follow-up queue stay valid over time.
-- -----------------------------------------------------------------------------

-- Baptism: in progress, suggested dates set, NO confirmed baptism yet, stale contact,
--          partial checklist, sample reply draft — highlights scheduling + follow-up.
INSERT INTO public.requests (
  id,
  parishioner_id,
  request_type,
  status,
  child_name,
  preferred_dates,
  notes,
  staff_notes,
  suggested_date_1,
  suggested_date_2,
  suggested_date_3,
  confirmed_baptism_date,
  last_contacted_at,
  last_contact_method,
  communication_notes,
  reply_draft,
  ai_summary
)
VALUES (
  '20202020-2020-4020-8020-202020202001'::uuid,
  '10101010-1010-4010-8010-101010101001'::uuid,
  'baptism',
  'in_progress',
  'Lucia Marie O''Brien',
  'Spring 2026; Sunday preferred, after 11:00 Mass if possible',
  'First child. Godparents are local. Happy to attend prep sessions any evening except Tuesdays.',
  'Family very engaged. Send prep packet link in next reply.',
  (now() + interval '6 weeks')::timestamptz,
  (now() + interval '8 weeks')::timestamptz,
  (now() + interval '10 weeks')::timestamptz,
  NULL,
  now() - interval '10 days',
  'email',
  'Emailed suggested weekend options; awaiting family preference.',
  'Dear Margaret,

Thank you again for your patience as we coordinate Lucia''s baptism. We have a few Sunday dates that could work after the 11:00 Mass in the coming months. Please let us know which option fits your family best, and we''ll confirm preparation steps.

Warm regards,
Parish office'
,
  NULL
);

-- Funeral: new, rich intake, no confirmed service time, never contacted,
--          partial checklist — highlights pastoral sensitivity + urgent follow-up.
INSERT INTO public.requests (
  id,
  parishioner_id,
  request_type,
  status,
  child_name,
  preferred_dates,
  notes,
  staff_notes,
  confirmed_baptism_date,
  last_contacted_at,
  last_contact_method,
  communication_notes,
  reply_draft,
  ai_summary
)
VALUES (
  '20202020-2020-4020-8020-202020202002'::uuid,
  '10101010-1010-4010-8010-101010101002'::uuid,
  'funeral',
  'new',
  NULL,
  NULL,
  'Submitted via online form. Family is local; siblings arriving from out of town next week.',
  'Priority outreach. Offer to meet in person or by phone.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO public.funeral_request_details (
  request_id,
  deceased_name,
  date_of_death,
  funeral_home_or_location,
  preferred_service_notes,
  confirmed_service_at
)
VALUES (
  '20202020-2020-4020-8020-202020202002'::uuid,
  'Helen Rosa Martinez',
  (CURRENT_DATE - 3),
  'St. Gabriel Catholic Church',
  'Vigil Thursday evening if possible; Funeral Mass Friday morning. Family hopes for Ave Maria and Psalm 23.',
  NULL
);

-- Wedding: in progress, proposed date + notes, NO confirmed ceremony yet,
--          stale contact, partial checklist — same follow-up mechanics as other types.
INSERT INTO public.requests (
  id,
  parishioner_id,
  request_type,
  status,
  child_name,
  preferred_dates,
  notes,
  staff_notes,
  confirmed_baptism_date,
  last_contacted_at,
  last_contact_method,
  communication_notes,
  reply_draft,
  ai_summary
)
VALUES (
  '20202020-2020-4020-8020-202020202003'::uuid,
  '10101010-1010-4010-8010-101010101003'::uuid,
  'wedding',
  'in_progress',
  NULL,
  NULL,
  'Primary contact is Elena; fiancé travels for work—email is best for joint replies.',
  'Initial phone call went well. Waiting on couple''s availability for meeting with pastor.',
  NULL,
  now() - interval '9 days',
  'phone',
  'Phone intake: discussed general timeline and parish marriage process overview.',
  NULL,
  NULL
);

INSERT INTO public.wedding_request_details (
  request_id,
  partner_one_name,
  partner_two_name,
  proposed_wedding_date,
  ceremony_notes,
  confirmed_ceremony_at
)
VALUES (
  '20202020-2020-4020-8020-202020202003'::uuid,
  'Elena Kowalski',
  'Thomas Brennan',
  (CURRENT_DATE + 120),
  'Nuptial Mass preferred. Guest count roughly 120. Organist question TBD.',
  NULL
);

-- -----------------------------------------------------------------------------
-- Checklists (partial completion — showcases checklist on dashboard + detail)
-- -----------------------------------------------------------------------------
INSERT INTO public.checklist_items (id, request_id, item_name, is_complete)
VALUES
  -- Baptism (2 complete, 2 open)
  ('30303030-3030-4030-8030-303030303001'::uuid, '20202020-2020-4020-8020-202020202001'::uuid, 'Birth certificate', true),
  ('30303030-3030-4030-8030-303030303002'::uuid, '20202020-2020-4020-8020-202020202001'::uuid, 'Godparent information', true),
  ('30303030-3030-4030-8030-303030303003'::uuid, '20202020-2020-4020-8020-202020202001'::uuid, 'Prep class completion', false),
  ('30303030-3030-4030-8030-303030303004'::uuid, '20202020-2020-4020-8020-202020202001'::uuid, 'Baptism date confirmed', false),
  -- Funeral (1 complete, 3 open)
  ('30303030-3030-4030-8030-303030303005'::uuid, '20202020-2020-4020-8020-202020202002'::uuid, 'Death certificate / vital records', true),
  ('30303030-3030-4030-8030-303030303006'::uuid, '20202020-2020-4020-8020-202020202002'::uuid, 'Obituary or program preferences', false),
  ('30303030-3030-4030-8030-303030303007'::uuid, '20202020-2020-4020-8020-202020202002'::uuid, 'Music and readings (if known)', false),
  ('30303030-3030-4030-8030-303030303008'::uuid, '20202020-2020-4020-8020-202020202002'::uuid, 'Cemetery or cremation arrangements', false),
  -- Wedding (1 complete, 2 open)
  ('30303030-3030-4030-8030-303030303009'::uuid, '20202020-2020-4020-8020-202020202003'::uuid, 'Initial meeting with parish', true),
  ('30303030-3030-4030-8030-303030303010'::uuid, '20202020-2020-4020-8020-202020202003'::uuid, 'Wedding date confirmed', false),
  ('30303030-3030-4030-8030-303030303011'::uuid, '20202020-2020-4020-8020-202020202003'::uuid, 'Liturgy details finalized', false);

-- -----------------------------------------------------------------------------
-- Communication history (shows timeline on request detail)
-- -----------------------------------------------------------------------------
INSERT INTO public.request_communications (id, request_id, contacted_at, method, notes)
VALUES
  (
    '40404040-4040-4040-8040-404040404001'::uuid,
    '20202020-2020-4020-8020-202020202001'::uuid,
    now() - interval '24 days',
    'email',
    'Auto-reply: request received; parish will respond within two business days.'
  ),
  (
    '40404040-4040-4040-8040-404040404002'::uuid,
    '20202020-2020-4020-8020-202020202001'::uuid,
    now() - interval '18 days',
    'email',
    'Staff asked for godparents'' names and sponsor eligibility; family replied same day.'
  ),
  (
    '40404040-4040-4040-8040-404040404003'::uuid,
    '20202020-2020-4020-8020-202020202001'::uuid,
    now() - interval '10 days',
    'email',
    'Email sent: suggested weekend options after 11:00 Mass (see reply draft on file).'
  ),
  (
    '40404040-4040-4040-8040-404040404004'::uuid,
    '20202020-2020-4020-8020-202020202003'::uuid,
    now() - interval '16 days',
    'email',
    'Couple submitted online wedding inquiry; acknowledged receipt.'
  ),
  (
    '40404040-4040-4040-8040-404040404005'::uuid,
    '20202020-2020-4020-8020-202020202003'::uuid,
    now() - interval '9 days',
    'phone',
    'Pastoral associate: 20-minute intake call; outlined FOCCUS / preparation expectations.'
  );

COMMIT;

-- =============================================================================
-- After running: open /dashboard — all three should appear in Follow-Up Queue
-- (stale contact and/or missing confirmed schedule and/or incomplete checklist).
-- =============================================================================
