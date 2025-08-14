# CSR SaaS Complete Flow Guide

## Overview
This CSR (Corporate Social Responsibility) SaaS platform implements a complete flow where:

1. **Admin** can add clients, NGOs, and assign NGOs to specific clients
2. **Admin** can see all data of NGOs and clients
3. **Client** can see all NGOs assigned to them
4. **NGO** can see all projects assigned to them by admin
5. **Admin** manages users, their roles, and everything
6. Everything is real-time synchronized with Supabase backend

## User Roles & Permissions

### 1. Admin Role
- **Dashboard**: Overview of all clients, NGOs, and projects
- **Clients Management**: Add, edit, delete clients
- **NGOs Management**: Add, edit, delete NGOs and assign them to clients
- **Projects Management**: Create projects and assign them to NGOs
- **Users Management**: Manage user accounts, roles, and access
- **Budgets**: Allocate budgets to projects
- **Documents**: View all uploaded documents
- **Activity Log**: Monitor all system activities
- **Reports**: Generate comprehensive reports

### 2. Client Role
- **Dashboard**: Overview of assigned NGOs and projects
- **Projects**: View projects assigned to their organization
- **Documents**: Access project-related documents
- **Monitoring**: Track progress of their projects
- **Notes**: Add notes and comments

### 3. NGO Role
- **Dashboard**: Overview of assigned projects and progress
- **Questionnaires**: Fill out project questionnaires
- **File Uploads**: Upload project documents and evidence
- **Budget**: View allocated budgets
- **Progress**: Update project progress and targets

## Database Schema & Relationships

### Core Tables
1. **profiles** - User authentication and roles
2. **clients** - Client organizations
3. **ngos** - NGO organizations (linked to clients)
4. **projects** - Projects (linked to clients and NGOs)
5. **targets** - Project targets and metrics
6. **progress_updates** - NGO progress reports
7. **budget_allocations** - Project budgets
8. **documents** - Uploaded files
9. **activity_logs** - System activity tracking

### Key Relationships
- **Client → NGO**: One client can have multiple NGOs assigned
- **NGO → Project**: One NGO can have multiple projects
- **Project → Client**: Each project belongs to one client
- **Project → NGO**: Each project is executed by one NGO

## Setup Instructions

### Step 1: Database Setup
Run the complete setup script in your Supabase SQL editor:

```sql
-- Run complete_flow_setup.sql
```

This script will:
- Create all necessary tables with proper relationships
- Set up Row Level Security (RLS) policies
- Create sample data for testing
- Establish proper indexes for performance

### Step 2: Fix NGO Record (if needed)
If you have existing NGO users without proper records, run:

```sql
-- Run fix_ngo_record.sql
```

### Step 3: Test the Flow

#### Admin Login
1. Login as admin@csrsaas.com
2. Navigate to Clients → Add New Client
3. Add a client (e.g., "TechCorp India")
4. Navigate to NGOs → Add New NGO
5. Assign the NGO to the client
6. Create projects and assign them to NGOs

#### Client Login
1. Login as a client user (e.g., rahul@techcorp.in)
2. View assigned NGOs in the dashboard
3. Monitor project progress
4. Access project documents

#### NGO Login
1. Login as an NGO user (e.g., tukeshmundepvt@gmail.com)
2. View assigned projects
3. Update progress and targets
4. Upload documents and evidence

## Real-time Features

### Live Data Synchronization
- All components use `useRealtimeTable` hook
- Changes are reflected immediately across all users
- No page refresh required

### Real-time Updates Include:
- New clients/NGOs added by admin
- Project progress updates by NGOs
- Document uploads
- Budget allocations
- Activity logs

## Key Components

### Admin Components
- `AdminDashboard.tsx` - Overview dashboard
- `AdminClients.tsx` - Client management with NGO assignments
- `AdminNGOs.tsx` - NGO management
- `AdminProjects.tsx` - Project creation and assignment
- `AdminUsers.tsx` - User management
- `AdminBudgets.tsx` - Budget allocation
- `AdminDocuments.tsx` - Document management
- `AdminActivity.tsx` - Activity monitoring

### Client Components
- `ClientDashboard.tsx` - Client overview with assigned NGOs
- `ClientProjects.tsx` - Project monitoring
- `ClientDocuments.tsx` - Document access
- `ClientMonitoring.tsx` - Progress tracking
- `ClientNotes.tsx` - Notes and comments

### NGO Components
- `NGODashboard.tsx` - NGO overview with assigned projects
- `NGOQuestionnaires.tsx` - Questionnaire management
- `NGOFiles.tsx` - File uploads
- `NGOBudget.tsx` - Budget tracking
- `NGOProgress.tsx` - Progress updates

## Data Flow Examples

### Example 1: Admin Assigns NGO to Client
1. Admin creates client "TechCorp India"
2. Admin creates NGO "Tree Plantation Foundation"
3. Admin assigns NGO to client (sets client_id in ngos table)
4. Client can now see the assigned NGO in their dashboard
5. NGO can see they're assigned to the client

### Example 2: Admin Creates Project
1. Admin creates project "Urban Tree Plantation"
2. Admin assigns project to specific client and NGO
3. NGO sees the project in their dashboard
4. Client sees the project in their monitoring section
5. Both can track progress in real-time

### Example 3: NGO Updates Progress
1. NGO updates progress for a target
2. Progress appears immediately in:
   - NGO dashboard
   - Client monitoring
   - Admin activity log
   - Analytics charts

## Troubleshooting

### Common Issues

#### 1. "NGO Record Not Found" Error
**Cause**: NGO user exists in profiles but not in ngos table
**Solution**: Run `fix_ngo_record.sql`

#### 2. Data Not Showing
**Cause**: Missing relationships or RLS policies
**Solution**: Check console logs and verify database relationships

#### 3. Real-time Updates Not Working
**Cause**: Supabase real-time not enabled
**Solution**: Enable real-time in Supabase dashboard

### Debug Steps
1. Check browser console for errors
2. Verify database relationships
3. Check Supabase real-time settings
4. Verify RLS policies are correct

## Security Features

### Row Level Security (RLS)
- Users can only see data they're authorized to access
- Admin sees all data
- Clients see only their data and assigned NGOs
- NGOs see only their assigned projects

### Authentication
- Supabase Auth integration
- Role-based access control
- Secure session management

## Performance Optimizations

### Database Indexes
- Optimized indexes on frequently queried columns
- Composite indexes for complex queries
- Real-time subscription optimization

### Frontend Optimizations
- Efficient data fetching with useRealtimeTable
- Optimistic updates for better UX
- Lazy loading for large datasets

## Future Enhancements

### Planned Features
- Advanced reporting and analytics
- Email notifications
- Mobile app support
- API for third-party integrations
- Advanced document management
- Multi-language support

### Scalability Considerations
- Database partitioning for large datasets
- CDN integration for file storage
- Caching strategies
- Load balancing for high traffic

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Verify database setup
4. Test with sample data first

## Sample Data

The setup script creates sample data including:
- 1 Admin user
- 3 Client organizations
- 3 NGO organizations
- 3 Sample projects
- Budget allocations
- Progress updates
- Sample documents

This provides a complete working example to test all features. 