-- V1 request assignment: optional display names (no separate staff/priest tables).
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS assigned_staff_name text,
  ADD COLUMN IF NOT EXISTS assigned_priest_name text;
