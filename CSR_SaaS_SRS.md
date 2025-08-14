# System Requirements Specification (SRS)
**Product:** CSR SaaS Platform  
**Version:** 1.0  
**Date:** 2024-05-30  
**Prepared by:** [Your Name/Team]

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a Corporate Social Responsibility (CSR) SaaS platform that enables organizations (clients), NGOs, and administrators to manage, monitor, and report on CSR projects in real time.

### 1.2 Scope
The system provides:
- User authentication and role-based dashboards (Admin, Client, NGO)
- Project, client, and NGO management
- Real-time progress tracking and reporting
- Document management
- Budget allocation and tracking
- Activity logging and notifications

### 1.3 Definitions, Acronyms, and Abbreviations
- **CSR:** Corporate Social Responsibility
- **NGO:** Non-Governmental Organization
- **Admin:** System administrator
- **Client:** Corporate entity funding CSR projects
- **SaaS:** Software as a Service
- **Supabase:** Backend-as-a-Service platform used for authentication, database, and real-time features

---

## 2. Overall Description

### 2.1 Product Perspective
- Web-based SaaS application
- Backend: Supabase (PostgreSQL, Auth, Realtime)
- Frontend: React (TypeScript), Tailwind CSS
- Real-time data sync via Supabase subscriptions

### 2.2 Product Functions
- User authentication and role management
- CRUD operations for clients, NGOs, projects, users, budgets, documents
- Assignment of users to clients/NGOs and NGOs to clients
- Real-time dashboards for each role
- Progress tracking and reporting
- Document upload/download
- Notifications and activity logs

### 2.3 User Classes and Characteristics
- **Admin:** Full access, can manage all data and users
- **Client:** Can view assigned NGOs and projects, monitor progress, view documents
- **NGO:** Can view assigned projects, update progress, upload documents, fill questionnaires

### 2.4 Operating Environment
- Web browser (latest Chrome, Firefox, Edge, Safari)
- Internet connection
- Supabase backend (cloud-hosted)

### 2.5 Design and Implementation Constraints
- Must use Supabase for backend
- Must use React for frontend
- Must support real-time updates
- Must be responsive (desktop, tablet, mobile)

### 2.6 User Documentation
- Online help/manual
- Setup and onboarding guides
- FAQ and troubleshooting

---

## 3. System Features and Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Authentication & Authorization
- Users can register and log in via email/password (Supabase Auth)
- User roles are stored in the `profiles` table
- Role-based redirection after login

#### 3.1.2 User Management (Admin)
- Admin can view, add, edit, and delete users
- Admin can assign users to clients/NGOs
- Admin can change user roles

#### 3.1.3 Client Management (Admin)
- Admin can view, add, edit, and delete clients
- Admin can assign NGOs to clients

#### 3.1.4 NGO Management (Admin)
- Admin can view, add, edit, and delete NGOs
- Admin can assign users to NGOs

#### 3.1.5 Project Management
- Admin can create, edit, and delete projects
- Projects are assigned to both a client and an NGO
- Projects have metrics/targets, budgets, documents, and progress updates

#### 3.1.6 Progress Tracking (NGO)
- NGO users can update progress for assigned projects
- Progress is tracked per metric/target and per quarter

#### 3.1.7 Document Management
- Users can upload/download documents related to projects
- Documents are linked to projects, clients, NGOs, and quarters

#### 3.1.8 Budget Management
- Admin can allocate budgets to projects
- Budgets are tracked per quarter and overall

#### 3.1.9 Notifications & Activity Logs
- System logs all major actions (create, update, delete)
- Users receive notifications for relevant events

#### 3.1.10 Real-Time Updates
- All dashboards update in real time when data changes

#### 3.1.11 Error Handling & Loading States
- All pages show loading spinners and error messages as appropriate

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
- Page loads in <2 seconds on broadband
- Real-time updates propagate within 1 second

#### 3.2.2 Scalability
- Must support at least 100 concurrent users
- Database must handle thousands of projects/records

#### 3.2.3 Security
- All data in transit is encrypted (HTTPS)
- User passwords are never stored in plaintext
- Only authenticated users can access dashboards
- Role-based access enforced in frontend (and optionally via RLS in production)

#### 3.2.4 Usability
- Responsive design for desktop, tablet, mobile
- Intuitive navigation and clear feedback for all actions

#### 3.2.5 Availability
- 99.9% uptime (Supabase SLA)
- Automatic failover and backups (Supabase managed)

#### 3.2.6 Maintainability
- Codebase is modular and well-documented
- Database schema is version-controlled

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Web-based UI (React)
- Role-based dashboards and navigation
- Forms for CRUD operations
- Tables and charts for data display

### 4.2 Hardware Interfaces
- None (cloud-based, browser only)

### 4.3 Software Interfaces
- Supabase API (Auth, Database, Realtime)
- Email service for notifications (optional)

### 4.4 Communications Interfaces
- HTTPS for all client-server communication

---

## 5. System Architecture
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Data Flow:** Real-time subscriptions for all main tables
- **State Management:** React state/hooks, context for user/session

---

## 6. Data Requirements
- **User Data:** Profiles, roles, authentication info
- **Organization Data:** Clients, NGOs, assignments
- **Project Data:** Projects, metrics, budgets, progress, documents
- **Logs:** Activity logs, notifications

---

## 7. Security Requirements
- All endpoints require authentication
- Role-based access control in frontend (and optionally in DB)
- Sensitive data (passwords, tokens) never exposed
- Audit logs for all critical actions

---

## 8. Quality Attributes
- **Reliability:** Real-time updates, robust error handling
- **Availability:** Cloud-hosted, managed by Supabase
- **Security:** Auth, HTTPS, access control
- **Maintainability:** Modular code, clear documentation
- **Usability:** Responsive, intuitive UI

---

## 9. Appendices

### 9.1 Database Schema (Summary)
- See your schema above for full details.

### 9.2 User Roles & Permissions Matrix

| Role   | View | Add | Edit | Delete | Assign | Special |
|--------|------|-----|------|--------|--------|---------|
| Admin  | All  | All | All  | All    | All    | Change roles, manage all |
| Client | Own  | -   | -    | -      | -      | View assigned NGOs/projects |
| NGO    | Own  | Progress, Docs | Own | Own (maybe) | - | Update progress, upload docs |

---

## 10. Future Enhancements
- Mobile app
- Advanced reporting/analytics
- API for third-party integrations
- Multi-language support
- RLS policies for production

---

**This SRS provides a complete, detailed blueprint for your CSR SaaS product.** 