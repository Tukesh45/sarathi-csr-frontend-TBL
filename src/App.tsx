import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- Page Imports ---
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import NGODashboard from './pages/NGODashboard';
import Home from './pages/Home';

// Client Pages
import ClientProjects from './pages/client/ClientProjects';
import ClientBudget from './pages/client/ClientBudget';
import ClientScorecard from './pages/client/ClientScorecard';

// Admin Pages
import AdminProjects from './pages/admin/AdminProjects';
import AdminBudgets from './pages/admin/AdminBudgets'; // Corrected Path
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminActivity from './pages/admin/AdminActivity';
import AdminNGOs from './pages/admin/AdminNGOs';
import AdminReports from './pages/admin/AdminReports';
import AdminClients from './pages/admin/AdminClients';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContactUs from './pages/admin/AdminContactUs';

// NGO Pages
import NGOQuestionnaires from './pages/ngo/NGOQuestionnaires';
import NGOFiles from './pages/ngo/NGOFiles';
import NGOBudget from './pages/ngo/NGOBudget';
import NGOProgress from './pages/ngo/NGOProgress';

// Common Pages
import ContactUs from './pages/ContactUs';
import ComplianceTrackerPage from './pages/ComplianceTrackerPage';

import { UIProvider } from './context/UIContext';
import './index.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [profileRef]);

  useEffect(() => {
    const fetchUserSession = async (currentUser: any) => {
        if (!currentUser) {
            setUser(null); setRole(null); setOrganizationId(null);
            return;
        }
        setUser(currentUser);
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', currentUser.id)
                .single();

            if (error || !profile) throw error || new Error("Profile not found");
            
            setRole(profile.role);

            if (profile.role === 'Client User') {
                const { data: link } = await supabase.from('client_users').select('client_id').eq('user_id', currentUser.id).maybeSingle();
                setOrganizationId(link?.client_id || null);
            } else if (profile.role === 'NGO User') {
                const { data: link } = await supabase.from('ngo_users').select('ngo_id').eq('user_id', currentUser.id).maybeSingle();
                setOrganizationId(link?.ngo_id || null);
            } else {
                setOrganizationId(null);
            }
        } catch (error) {
            console.error("Error fetching user session details:", error);
            setRole(null); setOrganizationId(null);
        }
    };
    
    const initializeSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserSession(session?.user || null);
      setLoading(false);
    };
    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await fetchUserSession(session?.user || null);
    });

    return () => { authListener?.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
  };

  const getSidebarItems = () => {
    let dashboardHref = '/';
    if (role === 'Platform Admin') {
      dashboardHref = '/admin-dashboard';
    } else if (role === 'NGO User' && organizationId) {
      dashboardHref = `/ngo/${organizationId}`;
    } else if (role === 'Client User' && organizationId) {
      dashboardHref = `/client/${organizationId}`;
    }

    const baseItems = [{ name: 'Dashboard', icon: '📊', href: dashboardHref }];

    switch (role) {
      case 'Platform Admin':
        return [ ...baseItems, { name: 'Projects', icon: '📁', href: '/admin/projects' }, { name: 'NGOs', icon: '🏢', href: '/admin/ngos' }, { name: 'Clients', icon: '👤', href: '/admin/clients' }, { name: 'Budgets', icon: '💰', href: '/admin/budgets' }, { name: 'Documents', icon: '📄', href: '/admin/documents' }, { name: 'Contact Us', icon: '✉️', href: '/admin/contact-us' }, { name: 'Users', icon: '👥', href: '/admin/users' }, { name: 'Activity Log', icon: '📝', href: '/admin/activity' }, ];
      case 'NGO User':
          if (!organizationId) return baseItems;
        return [ ...baseItems, { name: 'Questionnaires', icon: '📋', href: `/ngo/${organizationId}/questionnaires` }, { name: 'File Uploads', icon: '📁', href: `/ngo/${organizationId}/files` }, { name: 'Budget', icon: '💰', href: `/ngo/${organizationId}/budget` }, { name: 'Progress', icon: '📈', href: `/ngo/${organizationId}/progress` }, ];
      case 'Client User':
        if (!organizationId) return baseItems;
        return [ ...baseItems, { name: 'Projects', icon: '📁', href: `/client/${organizationId}/projects` }, { name: 'Budget Tracker', icon: '💰', href: `/client/${organizationId}/budget` }, { name: 'Scorecard', icon: '🎯', href: `/client/${organizationId}/scorecard` }, ];
      default: return baseItems;
    }
  };

  if (loading) { return <div className="loading-container"><div className="spinner"></div></div>; }

  return (
    <UIProvider>
      <Router>
        {!user || !role ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <>
            <header className="app-header">
              <div className="logo">Sarathi CSR</div>
              <div className="profile-container" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="profile-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="user-info">
                      <div className="greeting">Signed in as</div>
                      <div className="email">{user.email}</div>
                    </div>
                    <button onClick={handleLogout} className="logout-button"> Logout </button>
                  </div>
                )}
              </div>
            </header>
            <div className="app-layout">
              <aside className="sidebar">
                <div className="sidebar-header">Navigation</div>
                <nav>
                  {getSidebarItems().map(item => (
                    <NavLink key={item.href} to={item.href} className={({ isActive }) => isActive ? 'active' : ''}>
                      <span style={{ fontSize: '1.25rem' }}>{item.icon}</span> 
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </aside>
              <main className="main-content">
                <Routes>
                  {/* ADMIN ROUTES */}
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route path="/admin/budgets" element={<AdminBudgets />} />
                  <Route path="/admin/ngos" element={<AdminNGOs />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/documents" element={<AdminDocuments />} />
                  <Route path="/admin/activity" element={<AdminActivity />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/contact-us" element={<AdminContactUs />} />
                  {/* DYNAMIC CLIENT ROUTES */}
                  <Route path="/client/:clientId" element={<ClientDashboard user={user} />} />
                  <Route path="/client/:clientId/projects" element={<ClientProjects />} />
                  <Route path="/client/:clientId/budget" element={<ClientBudget />} />
                  <Route path="/client/:clientId/scorecard" element={<ClientScorecard />} />
                  {/* DYNAMIC NGO ROUTES */}
                  <Route path="/ngo/:ngoId" element={<NGODashboard user={user} />} />
                  <Route path="/ngo/:ngoId/questionnaires" element={<NGOQuestionnaires user={user} />} />
                  <Route path="/ngo/:ngoId/files" element={<NGOFiles user={user} />} />
                  <Route path="/ngo/:ngoId/budget" element={<NGOBudget user={user} />} />
                  <Route path="/ngo/:ngoId/progress" element={<NGOProgress user={user} />} />
                  {/* COMMON ROUTES */}
                  <Route path="/compliance" element={<ComplianceTrackerPage />} />
                  <Route path="*" element={<Navigate to={getSidebarItems()[0].href} replace />} />
                </Routes>
              </main>
            </div>
          </>
        )}
      </Router>
    </UIProvider>
  );
}

export default App;

