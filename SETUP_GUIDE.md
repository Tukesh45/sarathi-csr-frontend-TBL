# CSR SaaS Setup Guide (No Hardcoded Values)

## Overview
This guide will help you set up the CSR SaaS platform completely dynamically without any hardcoded values. The system will connect to your Supabase instance and work with your actual data.

## Prerequisites
- Supabase account and project
- Node.js and npm installed
- Git repository cloned

## Step 1: Environment Configuration

### 1.1 Create Environment File
Create a `.env` file in your project root:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 1.2 Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon Key** (the "anon public" key)

## Step 2: Database Setup

### 2.1 Run Database Schema
In your Supabase SQL editor, run the `setup_database.sql` script to create all tables and relationships.

### 2.2 Run Dynamic Setup (Optional)
If you want to create sample data, run `complete_flow_setup.sql` and replace the placeholder values with your actual data.

### 2.3 Fix NGO Records (If Needed)
If you have existing NGO users, run `fix_ngo_record.sql` to create missing NGO records.

## Step 3: User Management

### 3.1 Create Admin User
1. Sign up through the app with your admin email
2. In Supabase SQL editor, update the user's role:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 3.2 Create Client Users
1. Sign up users who will be clients
2. Update their roles:

```sql
UPDATE public.profiles 
SET role = 'client' 
WHERE email = 'client-email@example.com';
```

### 3.3 Create NGO Users
1. Sign up users who will be NGOs
2. Update their roles:

```sql
UPDATE public.profiles 
SET role = 'ngo' 
WHERE email = 'ngo-email@example.com';
```

## Step 4: Data Setup

### 4.1 Add Clients
Use the Admin interface to add clients, or insert directly:

```sql
INSERT INTO public.clients (
  company_name, 
  industry, 
  contact_person, 
  annual_csr_budget, 
  cin_number, 
  website
) VALUES (
  'Your Company Name',
  'Your Industry',
  'Contact Person',
  5000000,
  'CIN_NUMBER',
  'https://yourwebsite.com'
);
```

### 4.2 Add NGOs
Use the Admin interface to add NGOs, or insert directly:

```sql
INSERT INTO public.ngos (
  name,
  registration_number,
  focus_areas,
  geographic_coverage,
  contact_person,
  login_email,
  client_id
) VALUES (
  'Your NGO Name',
  'NGO_REG_NUMBER',
  'Focus Areas',
  'Geographic Coverage',
  'Contact Person',
  'ngo-email@example.com',
  (SELECT id FROM public.clients WHERE company_name = 'Your Company Name')
);
```

### 4.3 Link Users to Organizations

#### Link Client Users:
```sql
INSERT INTO public.client_users (user_id, client_id)
SELECT 
  p.id,
  c.id
FROM public.profiles p
JOIN public.clients c ON c.contact_person = p.full_name
WHERE p.email = 'client-email@example.com';
```

#### Link NGO Users:
```sql
INSERT INTO public.ngo_users (user_id, ngo_id)
SELECT 
  p.id,
  n.id
FROM public.profiles p
JOIN public.ngos n ON n.login_email = p.email
WHERE p.email = 'ngo-email@example.com';
```

## Step 5: Project Setup

### 5.1 Create Projects
Use the Admin interface to create projects, or insert directly:

```sql
INSERT INTO public.projects (
  title,
  description,
  goal,
  geographic_scope,
  unit_of_measurement,
  target_beneficiaries,
  client_id,
  ngo_id,
  status,
  priority,
  start_date,
  end_date
) VALUES (
  'Your Project Title',
  'Your Project Description',
  'Your Project Goal',
  'Geographic Scope',
  'Unit of Measurement',
  1000,
  (SELECT id FROM public.clients WHERE company_name = 'Your Company Name'),
  (SELECT id FROM public.ngos WHERE name = 'Your NGO Name'),
  'active',
  'high',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
);
```

### 5.2 Create Targets
```sql
INSERT INTO public.targets (project_id, quarter, metric, value)
SELECT 
  p.id,
  'Q1',
  'Your Metric',
  100
FROM public.projects p
WHERE p.title = 'Your Project Title';
```

### 5.3 Allocate Budgets
```sql
INSERT INTO public.budget_allocations (
  project_id, 
  total_budget, 
  q1_budget, 
  q2_budget, 
  q3_budget, 
  q4_budget, 
  allocated_by
)
SELECT 
  p.id,
  1000000,
  250000,
  250000,
  250000,
  250000,
  admin.id
FROM public.projects p
CROSS JOIN public.profiles admin
WHERE admin.role = 'admin' AND p.title = 'Your Project Title';
```

## Step 6: Testing the Flow

### 6.1 Admin Testing
1. Login as admin
2. Navigate to Clients → Add New Client
3. Add a client
4. Navigate to NGOs → Add New NGO
5. Assign NGO to client
6. Create projects and assign to NGOs

### 6.2 Client Testing
1. Login as client user
2. View assigned NGOs in dashboard
3. Monitor project progress
4. Access project documents

### 6.3 NGO Testing
1. Login as NGO user
2. View assigned projects
3. Update progress and targets
4. Upload documents and evidence

## Step 7: Real-time Features

### 7.1 Enable Real-time in Supabase
1. Go to Supabase Dashboard
2. Navigate to Database → Replication
3. Enable real-time for all tables

### 7.2 Test Real-time Updates
1. Make changes as admin
2. Verify changes appear immediately for clients and NGOs
3. Update progress as NGO
4. Verify updates appear immediately for clients and admin

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables" Error
**Solution**: Check your `.env` file and ensure variables are set correctly

#### 2. "NGO Record Not Found" Error
**Solution**: Run `fix_ngo_record.sql` script

#### 3. Data Not Showing
**Solution**: 
- Check browser console for errors
- Verify user roles are set correctly
- Check database relationships

#### 4. Real-time Updates Not Working
**Solution**: Enable real-time in Supabase dashboard

### Debug Steps
1. Check browser console (F12)
2. Verify environment variables
3. Check Supabase connection
4. Verify database relationships
5. Check user roles and permissions

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys regularly

### 2. Database Security
- Enable Row Level Security (RLS)
- Use proper RLS policies
- Limit database access

### 3. User Management
- Implement proper role-based access
- Use secure authentication
- Monitor user activities

## Production Deployment

### 1. Environment Variables
Set production environment variables in your hosting platform

### 2. Database
- Use production Supabase instance
- Enable proper backups
- Monitor performance

### 3. Security
- Enable HTTPS
- Set up proper CORS policies
- Monitor for security issues

## Support

For issues:
1. Check the troubleshooting section
2. Review console logs
3. Verify database setup
4. Test with minimal data first

The system is now completely dynamic and will work with your actual Supabase instance and data without any hardcoded values. 