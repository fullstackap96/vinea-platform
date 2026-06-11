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

DELETE FROM public.mass_intentions
  WHERE id IN (
    '70707070-7070-4070-8070-707070707001'::uuid,
    '70707070-7070-4070-8070-707070707002'::uuid,
    '70707070-7070-4070-8070-707070707003'::uuid
  );

DELETE FROM public.household_members
  WHERE id IN (
    '60606060-6060-4060-8060-606060606001'::uuid,
    '60606060-6060-4060-8060-606060606002'::uuid,
    '60606060-6060-4060-8060-606060606003'::uuid
  );

DELETE FROM public.households
  WHERE id IN (
    '60606060-6060-4060-8060-606060606101'::uuid,
    '60606060-6060-4060-8060-606060606102'::uuid
  );

DELETE FROM public.people
  WHERE id IN (
    '50505050-5050-4050-8050-505050505001'::uuid,
    '50505050-5050-4050-8050-505050505002'::uuid,
    '50505050-5050-4050-8050-505050505003'::uuid
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
INSERT INTO public.parishioners (id, parish_id, full_name, email, phone)
SELECT
  v.id,
  p.id,
  v.full_name,
  v.email,
  v.phone
FROM (
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
    )
) AS v(id, full_name, email, phone)
CROSS JOIN LATERAL (
  SELECT id FROM public.parishes ORDER BY created_at ASC LIMIT 1
) AS p;

-- -----------------------------------------------------------------------------
-- People profiles (linked to demo parishioners + primary parish)
-- -----------------------------------------------------------------------------
INSERT INTO public.people (
  id,
  parish_id,
  parishioner_id,
  first_name,
  last_name,
  email,
  phone
)
SELECT
  v.id,
  p.id,
  v.parishioner_id,
  v.first_name,
  v.last_name,
  v.email,
  v.phone
FROM (
  SELECT *
  FROM (
    VALUES
      (
        '50505050-5050-4050-8050-505050505001'::uuid,
        '10101010-1010-4010-8010-101010101001'::uuid,
        'Margaret',
        'O''Brien',
        'margaret.obrien@example.com',
        '555-010-2001'
      ),
      (
        '50505050-5050-4050-8050-505050505002'::uuid,
        '10101010-1010-4010-8010-101010101002'::uuid,
        'James',
        'Martinez',
        'james.martinez@example.com',
        '555-010-2002'
      ),
      (
        '50505050-5050-4050-8050-505050505003'::uuid,
        '10101010-1010-4010-8010-101010101003'::uuid,
        'Elena',
        'Kowalski',
        'elena.kowalski@example.com',
        '555-010-2003'
      )
  ) AS rows(id, parishioner_id, first_name, last_name, email, phone)
) AS v
CROSS JOIN LATERAL (
  SELECT id FROM public.parishes ORDER BY created_at ASC LIMIT 1
) AS p;

-- -----------------------------------------------------------------------------
-- Households + members
-- -----------------------------------------------------------------------------
INSERT INTO public.households (
  id,
  parish_id,
  name,
  address,
  city,
  state,
  postal_code
)
SELECT
  v.id,
  p.id,
  v.name,
  v.address,
  v.city,
  v.state,
  v.postal_code
FROM (
  VALUES
    (
      '60606060-6060-4060-8060-606060606101'::uuid,
      'O''Brien Family',
      '412 Maple Street',
      'Springfield',
      'IL',
      '62704'
    ),
    (
      '60606060-6060-4060-8060-606060606102'::uuid,
      'Martinez Family',
      '88 River Road',
      'Springfield',
      'IL',
      '62704'
    )
) AS v(id, name, address, city, state, postal_code)
CROSS JOIN LATERAL (
  SELECT id FROM public.parishes ORDER BY created_at ASC LIMIT 1
) AS p;

INSERT INTO public.household_members (
  id,
  parish_id,
  household_id,
  person_id,
  relationship,
  is_primary_contact
)
SELECT
  v.id,
  h.parish_id,
  v.household_id,
  v.person_id,
  v.relationship,
  v.is_primary_contact
FROM (
  VALUES
    (
      '60606060-6060-4060-8060-606060606001'::uuid,
      '60606060-6060-4060-8060-606060606101'::uuid,
      '50505050-5050-4050-8050-505050505001'::uuid,
      'head',
      true
    ),
    (
      '60606060-6060-4060-8060-606060606002'::uuid,
      '60606060-6060-4060-8060-606060606102'::uuid,
      '50505050-5050-4050-8050-505050505002'::uuid,
      'head',
      true
    ),
    (
      '60606060-6060-4060-8060-606060606003'::uuid,
      '60606060-6060-4060-8060-606060606102'::uuid,
      '50505050-5050-4050-8050-505050505003'::uuid,
      'spouse',
      false
    )
) AS v(id, household_id, person_id, relationship, is_primary_contact)
JOIN public.households h ON h.id = v.household_id;

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

-- -----------------------------------------------------------------------------
-- Mass intentions (demo: 2 unfulfilled, 1 fulfilled)
-- -----------------------------------------------------------------------------
INSERT INTO public.mass_intentions (
  id,
  parish_id,
  requester_name,
  intention_text,
  requested_date,
  assigned_mass_date,
  assigned_priest_name,
  stipend_received,
  is_fulfilled,
  notes
)
SELECT
  v.id,
  p.id,
  v.requester_name,
  v.intention_text,
  v.requested_date,
  v.assigned_mass_date,
  v.assigned_priest_name,
  v.stipend_received,
  v.is_fulfilled,
  v.notes
FROM (
  VALUES
    (
      '70707070-7070-4070-8070-707070707001'::uuid,
      'Margaret O''Brien',
      'Repose of the soul of Thomas O''Brien',
      (CURRENT_DATE + 7),
      (CURRENT_DATE + 14),
      'Fr. Michael Nguyen',
      true,
      false,
      'Envelope left at rectory; stipend received in person.'
    ),
    (
      '70707070-7070-4070-8070-707070707002'::uuid,
      'James Martinez',
      'Thanksgiving for recovery of Helen Martinez',
      (CURRENT_DATE + 3),
      (CURRENT_DATE + 10),
      NULL,
      false,
      false,
      'Called office; awaiting stipend and priest assignment.'
    ),
    (
      '70707070-7070-4070-8070-707070707003'::uuid,
      'Elena Kowalski',
      'Special intention for Thomas Brennan',
      (CURRENT_DATE - 21),
      (CURRENT_DATE - 14),
      'Fr. Michael Nguyen',
      true,
      true,
      'Offered at Sunday 11:00 Mass.'
    )
) AS v(
  id,
  requester_name,
  intention_text,
  requested_date,
  assigned_mass_date,
  assigned_priest_name,
  stipend_received,
  is_fulfilled,
  notes
)
CROSS JOIN LATERAL (
  SELECT id FROM public.parishes ORDER BY created_at ASC LIMIT 1
) AS p;

COMMIT;

-- =============================================================================
-- After running: open /dashboard — all three should appear in Follow-Up Queue
-- (stale contact and/or missing confirmed schedule and/or incomplete checklist).
-- =============================================================================
