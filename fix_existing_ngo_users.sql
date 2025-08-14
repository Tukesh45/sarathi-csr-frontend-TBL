-- Fix existing NGO users who don't have NGO records
-- This script creates NGO records for users who have role='ngo' but no corresponding NGO record

-- Step 1: Create NGO records for users who don't have them
INSERT INTO public.ngos (
  name,
  registration_number,
  focus_areas,
  geographic_coverage,
  contact_person,
  login_email,
  user_id
)
SELECT 
  COALESCE(p.organization_name, 'NGO Organization'),
  'NGO_REG_' || gen_random_uuid()::text,
  'Focus areas to be defined',
  'Geographic coverage to be defined',
  p.full_name,
  p.email,
  p.id
FROM public.profiles p
WHERE p.role = 'ngo' 
  AND NOT EXISTS (
    SELECT 1 FROM public.ngos n WHERE n.user_id = p.id
  );

-- Step 2: Link NGO users to their NGO records through ngo_users table
INSERT INTO public.ngo_users (user_id, ngo_id)
SELECT p.id, n.id
FROM public.profiles p
JOIN public.ngos n ON n.user_id = p.id
WHERE p.role = 'ngo'
  AND NOT EXISTS (
    SELECT 1 FROM public.ngo_users nu 
    WHERE nu.user_id = p.id AND nu.ngo_id = n.id
  );

-- Step 3: Show results
SELECT 
  'NGO Users Fixed' as status,
  COUNT(*) as count
FROM public.profiles p
JOIN public.ngos n ON n.user_id = p.id
JOIN public.ngo_users nu ON nu.user_id = p.id AND nu.ngo_id = n.id
WHERE p.role = 'ngo'; 