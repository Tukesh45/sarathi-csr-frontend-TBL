-- 1. Drop all RLS policies that reference ngos.user_id
DROP POLICY IF EXISTS "NGOs can update their own NGO record" ON ngos;
DROP POLICY IF EXISTS "NGOs can view their own NGO record" ON ngos;
DROP POLICY IF EXISTS "NGOs can view projects for their NGOs" ON projects;
DROP POLICY IF EXISTS "View budget allocations for projects linked to NGOs" ON budget_allocations;
DROP POLICY IF EXISTS "View compliance requirements for NGO projects" ON compliance_requirements;
DROP POLICY IF EXISTS "View documents linked to NGO projects" ON documents;
DROP POLICY IF EXISTS "View project metrics linked to NGO's projects" ON project_metrics;
DROP POLICY IF EXISTS "View quarterly progress for projects linked to NGO" ON quarterly_progress;

-- 2. Drop the user_id column from ngos
ALTER TABLE public.ngos DROP COLUMN IF EXISTS user_id;

-- 3. (Optional) Template: Recreate RLS policies using ngo_users join table
-- Example: Allow users to select their own NGO record via ngo_users
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NGOs can view their own NGO record"
  ON public.ngos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ngo_users nu
      WHERE nu.ngo_id = ngos.id
        AND nu.user_id = auth.uid()
    )
  );

-- Example: Allow users to select projects for their NGOs
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NGOs can view projects for their NGOs"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ngo_users nu
      WHERE nu.ngo_id = projects.ngo_id
        AND nu.user_id = auth.uid()
    )
  );

-- Repeat similar logic for other tables (budget_allocations, compliance_requirements, etc.)
-- Always reference ngo_users instead of user_id columns 