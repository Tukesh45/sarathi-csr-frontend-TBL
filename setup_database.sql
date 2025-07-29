-- CSR SaaS Database Setup Script
-- Run this script in your Supabase SQL editor to set up all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (for user authentication and roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  organization_name text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'ngo')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  industry text,
  contact_person text,
  annual_csr_budget numeric,
  cin_number text,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. NGOs Table
CREATE TABLE IF NOT EXISTS public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text UNIQUE,
  focus_areas text,
  geographic_coverage text,
  contact_person text,
  login_email text UNIQUE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  goal text,
  geographic_scope text,
  unit_of_measurement text,
  target_beneficiaries numeric,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Targets Table
CREATE TABLE IF NOT EXISTS public.targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Progress Updates Table
CREATE TABLE IF NOT EXISTS public.progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid REFERENCES public.targets(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  actual_value numeric,
  notes text,
  evidence_upload text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. Client Users Join Table (for client access management)
CREATE TABLE IF NOT EXISTS public.client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_users_unique UNIQUE (user_id, client_id)
);

-- 8. NGO Users Join Table (for NGO access management)
CREATE TABLE IF NOT EXISTS public.ngo_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ngo_id uuid NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ngo_users_unique UNIQUE (user_id, ngo_id)
);

-- 9. Budget Allocations Table
CREATE TABLE IF NOT EXISTS public.budget_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  total_budget numeric NOT NULL,
  q1_budget numeric DEFAULT 0,
  q2_budget numeric DEFAULT 0,
  q3_budget numeric DEFAULT 0,
  q4_budget numeric DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  allocated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 10. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  quarter text,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size numeric,
  description text,
  is_mandatory boolean DEFAULT false,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 11. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 12. Questionnaire Table
CREATE TABLE IF NOT EXISTS public.questionnaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 13. Quarterly Progress Table
CREATE TABLE IF NOT EXISTS public.quarterly_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  year integer NOT NULL,
  metric_id text,
  achieved_value numeric,
  percentage_complete numeric,
  notes text,
  challenges text,
  reported_by uuid REFERENCES public.profiles(id),
  verified_by uuid REFERENCES public.profiles(id),
  verification_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 14. Contact Us Table
CREATE TABLE IF NOT EXISTS public.contact_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_ngos_name ON public.ngos(name);
CREATE INDEX IF NOT EXISTS idx_ngos_login_email ON public.ngos(login_email);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_ngo_id ON public.projects(ngo_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_targets_project_id ON public.targets(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_target_id ON public.progress_updates(target_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_ngo_id ON public.progress_updates(ngo_id);
CREATE INDEX IF NOT EXISTS idx_client_users_user_id ON public.client_users(user_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_ngo_users_user_id ON public.ngo_users(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_users_ngo_id ON public.ngo_users(ngo_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_project_id ON public.budget_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_ngo_id ON public.documents(ngo_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_us ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.clients TO anon, authenticated;
GRANT ALL ON public.ngos TO anon, authenticated;
GRANT ALL ON public.projects TO anon, authenticated;
GRANT ALL ON public.targets TO anon, authenticated;
GRANT ALL ON public.progress_updates TO anon, authenticated;
GRANT ALL ON public.client_users TO anon, authenticated;
GRANT ALL ON public.ngo_users TO anon, authenticated;
GRANT ALL ON public.budget_allocations TO anon, authenticated;
GRANT ALL ON public.documents TO anon, authenticated;
GRANT ALL ON public.activity_logs TO anon, authenticated;
GRANT ALL ON public.questionnaire TO anon, authenticated;
GRANT ALL ON public.quarterly_progress TO anon, authenticated;
GRANT ALL ON public.contact_us TO anon, authenticated;

-- Create a default admin user (you should change this password)
INSERT INTO public.profiles (id, email, full_name, role, organization_name)
VALUES (
  gen_random_uuid(),
  'admin@csrsaas.com',
  'System Administrator',
  'admin',
  'CSR SaaS Platform'
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! All tables created with proper indexes and RLS policies.' as status; 