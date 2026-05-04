-- Parish workspace settings (single-parish V1): notification default + name directories.
ALTER TABLE public.parishes
  ADD COLUMN IF NOT EXISTS default_notification_email text,
  ADD COLUMN IF NOT EXISTS staff_directory jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS priest_directory jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.parishes.default_notification_email IS
  'Optional inbox for new intake notifications when REQUEST_NOTIFICATION_TO_EMAIL env is not set.';

COMMENT ON COLUMN public.parishes.staff_directory IS
  'JSON array of staff display names for picklists and templates (e.g. ["Jane Smith"]).';

COMMENT ON COLUMN public.parishes.priest_directory IS
  'JSON array of priest display names for picklists and templates.';
