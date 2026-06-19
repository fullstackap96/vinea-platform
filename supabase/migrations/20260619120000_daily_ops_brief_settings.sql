-- Daily parish operations brief settings.

ALTER TABLE public.parishes
  ADD COLUMN IF NOT EXISTS daily_ops_brief_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_ops_brief_email text NULL,
  ADD COLUMN IF NOT EXISTS daily_ops_brief_last_sent_on date NULL,
  ADD COLUMN IF NOT EXISTS daily_ops_brief_last_error text NULL;

COMMENT ON COLUMN public.parishes.daily_ops_brief_enabled IS
  'When true, Vinea sends the daily parish operations brief to the configured parish inbox.';

COMMENT ON COLUMN public.parishes.daily_ops_brief_email IS
  'Optional recipient for the daily parish operations brief. Falls back to default_notification_email when blank.';

COMMENT ON COLUMN public.parishes.daily_ops_brief_last_sent_on IS
  'UTC date the daily parish operations brief was last sent, used to avoid duplicate cron sends.';

COMMENT ON COLUMN public.parishes.daily_ops_brief_last_error IS
  'Last daily brief delivery error, if any.';
