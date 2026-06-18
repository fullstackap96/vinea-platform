-- Funeral workflow V1: richer parish-office planning fields.
-- Optional columns preserve existing funeral request rows.

ALTER TABLE public.funeral_request_details
  ADD COLUMN IF NOT EXISTS family_relationship text NULL,
  ADD COLUMN IF NOT EXISTS funeral_director_contact text NULL,
  ADD COLUMN IF NOT EXISTS service_location text NULL,
  ADD COLUMN IF NOT EXISTS visitation_details text NULL,
  ADD COLUMN IF NOT EXISTS cemetery_or_committal text NULL,
  ADD COLUMN IF NOT EXISTS readings_music_notes text NULL,
  ADD COLUMN IF NOT EXISTS obituary_program_notes text NULL,
  ADD COLUMN IF NOT EXISTS post_funeral_follow_up_date date NULL;

COMMENT ON COLUMN public.funeral_request_details.family_relationship IS
  'Relationship of the intake contact to the deceased.';

COMMENT ON COLUMN public.funeral_request_details.funeral_director_contact IS
  'Funeral director name, phone, or email for coordination.';

COMMENT ON COLUMN public.funeral_request_details.service_location IS
  'Church, chapel, funeral home, or other confirmed/preferred service location.';

COMMENT ON COLUMN public.funeral_request_details.visitation_details IS
  'Wake, visitation, or viewing details.';

COMMENT ON COLUMN public.funeral_request_details.cemetery_or_committal IS
  'Cemetery, burial, cremation, or committal details.';

COMMENT ON COLUMN public.funeral_request_details.readings_music_notes IS
  'Readings, music, ministers, or liturgy planning notes.';

COMMENT ON COLUMN public.funeral_request_details.obituary_program_notes IS
  'Obituary, worship aid, livestream, or program coordination notes.';

COMMENT ON COLUMN public.funeral_request_details.post_funeral_follow_up_date IS
  'Date staff should check in with the family after the funeral.';
