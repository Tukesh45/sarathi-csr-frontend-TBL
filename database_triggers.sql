-- Database Triggers for Automatic Profile Creation
-- This script creates triggers to automatically create profiles when users sign up

-- Enable the pg_net extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
-- The following triggers are deprecated as we are moving to separate clients and ngos tables
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
    organization_name = COALESCE(NEW.raw_user_meta_data->>'organization_name', organization_name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', role),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when user data changes
-- The following triggers are deprecated as we are moving to separate clients and ngos tables
-- DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- CREATE TRIGGER on_auth_user_updated
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to delete profile when user is deleted
-- The following triggers are deprecated as we are moving to separate clients and ngos tables
-- DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
-- CREATE TRIGGER on_auth_user_deleted
--   AFTER DELETE ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles_id_seq TO anon, authenticated;

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 

-- New CSR SaaS Data Model

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  csr_budget numeric,
  sector text,
  state text
);

-- 2. NGOs Table
CREATE TABLE IF NOT EXISTS public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  login_email text UNIQUE NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  project_title text NOT NULL,
  location text,
  duration text,
  total_budget numeric
);

-- 4. Targets Table
CREATE TABLE IF NOT EXISTS public.targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL
);

-- 5. Progress Updates Table
CREATE TABLE IF NOT EXISTS public.progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid REFERENCES public.targets(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  actual_value numeric,
  notes text,
  evidence_upload text
); 

-- 6. Client-NGOs Join Table
CREATE TABLE IF NOT EXISTS public.client_ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ngo_id uuid NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_ngos_unique UNIQUE (client_id, ngo_id)
);

-- RLS Policies for client_ngos table
ALTER TABLE public.client_ngos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all client_ngos" ON public.client_ngos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert client_ngos" ON public.client_ngos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update client_ngos" ON public.client_ngos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete client_ngos" ON public.client_ngos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contact Us Table
CREATE TABLE IF NOT EXISTS public.contact_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);