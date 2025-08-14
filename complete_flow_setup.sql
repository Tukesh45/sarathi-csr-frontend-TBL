-- Complete CSR SaaS Flow Setup (Dynamic Version)
-- This script sets up the proper relationships without hardcoded values

-- 1. Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM public.quarterly_progress;
-- DELETE FROM public.questionnaire;
-- DELETE FROM public.activity_logs;
-- DELETE FROM public.documents;
-- DELETE FROM public.budget_allocations;
-- DELETE FROM public.progress_updates;
-- DELETE FROM public.targets;
-- DELETE FROM public.projects;
-- DELETE FROM public.ngo_users;
-- DELETE FROM public.client_users;
-- DELETE FROM public.ngos;
-- DELETE FROM public.clients;
-- DELETE FROM public.profiles;

-- 2. Create Admin User (you should replace with your actual admin email)
-- INSERT INTO public.profiles (id, email, full_name, role, organization_name)
-- VALUES (
--   gen_random_uuid(),
--   'your-admin-email@example.com', -- Replace with actual admin email
--   'System Administrator',
--   'admin',
--   'CSR SaaS Platform'
-- ) ON CONFLICT (email) DO NOTHING;

-- 3. Create Sample Clients (replace with actual client data)
-- INSERT INTO public.clients (id, company_name, industry, contact_person, annual_csr_budget, cin_number, website)
-- VALUES 
--   (gen_random_uuid(), 'Your Company Name', 'Your Industry', 'Contact Person', 5000000, 'CIN_NUMBER', 'https://yourwebsite.com')
-- ON CONFLICT DO NOTHING;

-- 4. Create Sample NGOs (replace with actual NGO data)
-- INSERT INTO public.ngos (id, name, registration_number, focus_areas, geographic_coverage, contact_person, login_email, client_id)
-- SELECT 
--   gen_random_uuid(),
--   'Your NGO Name',
--   'NGO_REG_NUMBER',
--   'Focus Areas',
--   'Geographic Coverage',
--   'Contact Person',
--   'ngo-email@example.com', -- Replace with actual NGO email
--   c.id
-- FROM public.clients c WHERE c.company_name = 'Your Company Name'
-- ON CONFLICT (login_email) DO NOTHING;

-- 5. Create NGO User Profiles (replace with actual NGO user data)
-- INSERT INTO public.profiles (id, email, full_name, role, organization_name)
-- VALUES 
--   (gen_random_uuid(), 'ngo-email@example.com', 'NGO Contact Person', 'ngo', 'Your NGO Name')
-- ON CONFLICT (email) DO NOTHING;

-- 6. Create Client User Profiles (replace with actual client user data)
-- INSERT INTO public.profiles (id, email, full_name, role, organization_name)
-- VALUES 
--   (gen_random_uuid(), 'client-email@example.com', 'Client Contact Person', 'client', 'Your Company Name')
-- ON CONFLICT (email) DO NOTHING;

-- 7. Link NGO Users to NGOs
-- INSERT INTO public.ngo_users (user_id, ngo_id)
-- SELECT 
--   p.id as user_id,
--   n.id as ngo_id
-- FROM public.profiles p
-- JOIN public.ngos n ON n.login_email = p.email
-- WHERE p.role = 'ngo'
-- ON CONFLICT (user_id, ngo_id) DO NOTHING;

-- 8. Link Client Users to Clients
-- INSERT INTO public.client_users (user_id, client_id)
-- SELECT 
--   p.id as user_id,
--   c.id as client_id
-- FROM public.profiles p
-- JOIN public.clients c ON c.contact_person = p.full_name
-- WHERE p.role = 'client'
-- ON CONFLICT (user_id, client_id) DO NOTHING;

-- 9. Create Sample Projects (replace with actual project data)
-- INSERT INTO public.projects (id, title, description, goal, geographic_scope, unit_of_measurement, target_beneficiaries, client_id, ngo_id, status, priority, start_date, end_date)
-- SELECT 
--   gen_random_uuid(),
--   'Your Project Title',
--   'Your Project Description',
--   'Your Project Goal',
--   'Geographic Scope',
--   'Unit of Measurement',
--   1000,
--   c.id,
--   n.id,
--   'active',
--   'high',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '1 year'
-- FROM public.clients c
-- JOIN public.ngos n ON n.client_id = c.id
-- WHERE c.company_name = 'Your Company Name' AND n.name = 'Your NGO Name'
-- ON CONFLICT DO NOTHING;

-- 10. Create Sample Targets (replace with actual target data)
-- INSERT INTO public.targets (id, project_id, quarter, metric, value)
-- SELECT 
--   gen_random_uuid(),
--   p.id,
--   'Q1',
--   'Your Metric',
--   100
-- FROM public.projects p
-- WHERE p.title = 'Your Project Title'
-- ON CONFLICT DO NOTHING;

-- 11. Create Sample Budget Allocations (replace with actual budget data)
-- INSERT INTO public.budget_allocations (id, project_id, total_budget, q1_budget, q2_budget, q3_budget, q4_budget, allocated_by)
-- SELECT 
--   gen_random_uuid(),
--   p.id,
--   1000000,
--   250000,
--   250000,
--   250000,
--   250000,
--   admin.id
-- FROM public.projects p
-- CROSS JOIN public.profiles admin
-- WHERE admin.role = 'admin' AND p.title = 'Your Project Title'
-- ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! Please replace the commented sections with your actual data.' as status;

-- Display current data summary
SELECT 'Current Data Summary:' as info;
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'NGOs', COUNT(*) FROM public.ngos
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Targets', COUNT(*) FROM public.targets
UNION ALL
SELECT 'Budget Allocations', COUNT(*) FROM public.budget_allocations
UNION ALL
SELECT 'Progress Updates', COUNT(*) FROM public.progress_updates
UNION ALL
SELECT 'Documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM public.activity_logs; 