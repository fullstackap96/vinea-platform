-- Phase 4: request document support for workflow-driven parish requests.
-- Storage remains private; staff access goes through server-side route handlers.

INSERT INTO storage.buckets (id, name, public)
VALUES ('request-documents', 'request-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.request_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  workflow_step_id uuid NULL REFERENCES public.request_workflow_steps (id) ON DELETE SET NULL,
  storage_bucket text NOT NULL DEFAULT 'request-documents',
  storage_path text NOT NULL,
  document_type text NULL,
  original_filename text NOT NULL,
  content_type text NULL,
  file_size_bytes bigint NULL,
  status text NOT NULL DEFAULT 'pending_review',
  uploaded_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  uploaded_by_email text NULL,
  reviewed_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_by_email text NULL,
  reviewed_at timestamptz NULL,
  review_note text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT request_documents_status_valid CHECK (
    status IN ('pending_review', 'approved', 'rejected')
  ),
  CONSTRAINT request_documents_storage_bucket_not_blank CHECK (
    char_length(btrim(storage_bucket)) > 0
  ),
  CONSTRAINT request_documents_storage_path_not_blank CHECK (
    char_length(btrim(storage_path)) > 0
  ),
  CONSTRAINT request_documents_original_filename_not_blank CHECK (
    char_length(btrim(original_filename)) > 0
  ),
  CONSTRAINT request_documents_file_size_nonnegative CHECK (
    file_size_bytes IS NULL OR file_size_bytes >= 0
  ),
  CONSTRAINT request_documents_review_consistent CHECK (
    (
      status = 'pending_review'
      AND reviewed_at IS NULL
      AND reviewed_by IS NULL
      AND reviewed_by_email IS NULL
    )
    OR status IN ('approved', 'rejected')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS request_documents_storage_object_unique_idx
  ON public.request_documents (storage_bucket, storage_path);

CREATE INDEX IF NOT EXISTS request_documents_parish_request_created_idx
  ON public.request_documents (parish_id, request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS request_documents_request_step_idx
  ON public.request_documents (request_id, workflow_step_id);

CREATE INDEX IF NOT EXISTS request_documents_request_status_idx
  ON public.request_documents (request_id, status);

COMMENT ON TABLE public.request_documents IS
  'Staff-reviewed documents uploaded for a parish request, optionally tied to a request workflow step.';

COMMENT ON COLUMN public.request_documents.workflow_step_id IS
  'Optional request_workflow_steps row this document satisfies or supports.';

DROP TRIGGER IF EXISTS request_documents_touch_updated_at_trg ON public.request_documents;
CREATE TRIGGER request_documents_touch_updated_at_trg
  BEFORE UPDATE ON public.request_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.workflow_templates_touch_updated_at();

ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "request_documents_select_staff" ON public.request_documents;
CREATE POLICY "request_documents_select_staff"
  ON public.request_documents
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );

DROP POLICY IF EXISTS "request_documents_insert_staff" ON public.request_documents;
CREATE POLICY "request_documents_insert_staff"
  ON public.request_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
    AND (
      workflow_step_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.request_workflow_steps rws
        WHERE rws.id = workflow_step_id
          AND rws.request_id = request_documents.request_id
          AND rws.parish_id = request_documents.parish_id
      )
    )
  );

DROP POLICY IF EXISTS "request_documents_update_staff" ON public.request_documents;
CREATE POLICY "request_documents_update_staff"
  ON public.request_documents
  FOR UPDATE
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
    AND (
      workflow_step_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.request_workflow_steps rws
        WHERE rws.id = workflow_step_id
          AND rws.request_id = request_documents.request_id
          AND rws.parish_id = request_documents.parish_id
      )
    )
  );
