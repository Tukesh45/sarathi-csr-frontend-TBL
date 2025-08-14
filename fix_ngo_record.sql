-- Fix NGO Record (Dynamic Version)
-- This script adds the missing NGO record for any NGO user

-- First, let's check if there are any NGO users without corresponding NGO records
SELECT 'Checking for NGO users without NGO records...' as status;

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.organization_name
FROM public.profiles p
LEFT JOIN public.ngos n ON n.login_email = p.email
WHERE p.role = 'ngo' AND n.id IS NULL;

-- Create NGO records for users who don't have them
-- Replace the placeholder values with actual data
INSERT INTO public.ngos (
  name,
  registration_number,
  focus_areas,
  geographic_coverage,
  contact_person,
  login_email
)
SELECT 
  COALESCE(p.organization_name, 'NGO Organization'), -- Use organization_name from profile or default
  'NGO_REG_' || gen_random_uuid()::text, -- Generate registration number
  'Focus Areas to be defined', -- Default focus areas
  'Geographic coverage to be defined', -- Default coverage
  p.full_name, -- Use full_name from profile
  p.email -- Use email from profile
FROM public.profiles p
LEFT JOIN public.ngos n ON n.login_email = p.email
WHERE p.role = 'ngo' AND n.id IS NULL
ON CONFLICT (login_email) DO NOTHING;

-- Verify the NGO records were created
SELECT 'NGO records created successfully!' as status;
SELECT 
  n.id,
  n.name,
  n.login_email,
  n.focus_areas
FROM public.ngos n
JOIN public.profiles p ON p.email = n.login_email
WHERE p.role = 'ngo';

-- Create NGO user relationships for newly created records
INSERT INTO public.ngo_users (user_id, ngo_id)
SELECT 
  p.id as user_id,
  n.id as ngo_id
FROM public.profiles p
JOIN public.ngos n ON n.login_email = p.email
WHERE p.role = 'ngo'
ON CONFLICT (user_id, ngo_id) DO NOTHING;

-- Verify the relationships were created
SELECT 'NGO user relationships created successfully!' as status;
SELECT 
  p.email,
  p.full_name,
  n.name as ngo_name,
  n.focus_areas
FROM public.profiles p
JOIN public.ngo_users nu ON nu.user_id = p.id
JOIN public.ngos n ON n.id = nu.ngo_id
WHERE p.role = 'ngo';

-- Success message
SELECT 'NGO record fix completed successfully! All NGO users should now have proper NGO records.' as final_status; 