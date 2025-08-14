-- Fix NGO record and relationships for all NGO users
WITH ngo_profiles AS (
  SELECT id, email, full_name, organization_name 
  FROM public.profiles 
  WHERE role = 'ngo'
),
ngo_records AS (
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
    COALESCE(np.organization_name, 'NGO Organization'),
    'NGO_REG_' || gen_random_uuid()::text,
    'Focus Areas to be defined',
    'Geographic coverage to be defined',
    np.full_name,
    np.email,
    np.id
  FROM ngo_profiles np
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ngos n WHERE n.user_id = np.id
  )
  RETURNING ngo_records.id, ngo_records.user_id
),
existing_ngos AS (
  SELECT n.id, n.user_id FROM public.ngos n
  JOIN ngo_profiles np ON n.user_id = np.id
),
all_ngos AS (
  SELECT id, user_id FROM ngo_records
  UNION ALL
  SELECT id, user_id FROM existing_ngos
)
INSERT INTO public.ngo_users (user_id, ngo_id)
SELECT user_id, id FROM all_ngos
ON CONFLICT (user_id, ngo_id) DO NOTHING; 