import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import NGODashboard from './pages/NGODashboard';
import Home from './pages/Home';
import ClientProjects from './pages/client/ClientProjects';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientMonitoring from './pages/client/ClientMonitoring';
import ClientNotes from './pages/client/ClientNotes';
import AdminProjects from './pages/admin/AdminProjects';
import AdminBudgets from './pages/admin/AdminBudgets';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminActivity from './pages/admin/AdminActivity';
import AdminNGOs from './pages/admin/AdminNGOs';
import AdminReports from './pages/admin/AdminReports';
import AdminClients from './pages/admin/AdminClients';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContactUs from './pages/admin/AdminContactUs';
import NGOQuestionnaires from './pages/ngo/NGOQuestionnaires';
import NGOFiles from './pages/ngo/NGOFiles';
import NGOBudget from './pages/ngo/NGOBudget';
import NGOProgress from './pages/ngo/NGOProgress';
import ContactUs from './pages/ContactUs';
import { UIProvider } from './context/UIContext';
import './index.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // 1. Try to get role from profiles table
        let { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile && profile.role) {
          setRole(profile.role);
        } else {
          // 2. Fallback to clients/ngos tables (may 406 if RLS not set)
          let { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('id', session.user.id)
            .single();
          if (client) {
            setRole('client');
          } else {
            let { data: ngo } = await supabase
              .from('ngos')
              .select('id')
              .eq('id', session.user.id)
              .single();
            if (ngo) {
              setRole('ngo');
            } else {
              setRole('admin');
            }
          }
        }
      } else {
        setUser(null);
        setRole(null);
    }
    setLoading(false);
    };
    getSessionAndRole();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // 1. Try to get role from profiles table
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile && profile.role) {
              setRole(profile.role);
            } else {
              supabase
                .from('clients')
                .select('id')
                .eq('id', session.user.id)
                .single()
                .then(({ data: client }) => {
                  if (client) {
                    setRole('client');
                  } else {
                    supabase
                      .from('ngos')
                      .select('id')
                      .eq('id', session.user.id)
                      .single()
                      .then(({ data: ngo }) => {
                        if (ngo) {
                          setRole('ngo');
                        } else {
                          setRole('admin');
                        }
                      });
                  }
                });
            }
          });
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'client':
        return 'Client';
      case 'ngo':
        return 'NGO';
      default:
        return '';
    }
  };

  const getSidebarItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: '📊', href: `/${role}-dashboard` },
    ];
    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Projects', icon: '📁', href: '/admin/projects' },
          { name: 'NGOs', icon: '🏢', href: '/admin/ngos' },
          { name: 'Clients', icon: '👤', href: '/admin/clients' },
          { name: 'Budgets', icon: '💰', href: '/admin/budgets' },
          { name: 'Documents', icon: '📄', href: '/admin/documents' },
          { name: 'Contact Us', icon: '✉️', href: '/admin/contact-us' },
          { name: 'Users', icon: '👥', href: '/admin/users' },
          { name: 'Activity Log', icon: '📝', href: '/admin/activity' },
        ];
      case 'ngo':
        return [
          ...baseItems,
          { name: 'Questionnaires', icon: '📋', href: '/ngo/questionnaires' },
          { name: 'File Uploads', icon: '📁', href: '/ngo/files' },
          { name: 'Budget', icon: '💰', href: '/ngo/budget' },
          { name: 'Progress', icon: '📈', href: '/ngo/progress' },
        ];
      case 'client':
        return [
          ...baseItems,
          { name: 'Projects', icon: '📁', href: '/client/projects' },
          { name: 'Documents', icon: '📄', href: '/client/documents' },
          { name: 'Monitoring', icon: '📊', href: '/client/monitoring' },
          { name: 'Notes', icon: '📝', href: '/client/notes' },
        ];
      default:
        return baseItems;
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !role) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <UIProvider>
      <Router>
        {/* Global Header for authenticated users */}
        {user && role && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5em 2em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <div style={{ fontWeight: 900, fontSize: 24, color: 'var(--primary-dark)', letterSpacing: '-1px' }}>Sarathi CSR</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{user.email || getRoleDisplayName()}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          </header>
        )}
        <div style={{ display: 'flex', minHeight: '100vh', marginTop: user && role ? '80px' : 0 }}>
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">Sarathi CSR</div>
            <nav>
              {getSidebarItems().map(item => (
                    <NavLink 
                  key={item.href}
                      to={item.href}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                  <span style={{ fontSize: 20 }}>{item.icon}</span> {item.name}
                    </NavLink>
                ))}
            </nav>
            {/* Remove Logout button from sidebar */}
          </aside>
          {/* Main Content */}
          <main className="main-content">
              <Routes>
                <Route
                  path="/admin-dashboard"
                element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} />
                <Route
                path="/admin/clients"
                element={role === 'admin' ? <AdminClients /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/projects"
                element={role === 'admin' ? <AdminProjects /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/budgets"
                element={role === 'admin' ? <AdminBudgets /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/ngos"
                element={role === 'admin' ? <AdminNGOs /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/reports"
                element={role === 'admin' ? <AdminReports /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/documents"
                element={role === 'admin' ? <AdminDocuments /> : <Navigate to="/login" replace />} />
                <Route
                  path="/admin/activity"
                element={role === 'admin' ? <AdminActivity /> : <Navigate to="/login" replace />} />
              <Route
                path="/admin/users"
                element={role === 'admin' ? <AdminUsers /> : <Navigate to="/login" replace />} />
              <Route
                path="/admin/contact-us"
                element={role === 'admin' ? <AdminContactUs /> : <Navigate to="/login" replace />} />
              <Route
                path="/client-dashboard"
                element={role === 'client' ? <ClientDashboard user={user} /> : <Navigate to="/login" replace />} />
                <Route
                  path="/client/projects"
                element={role === 'client' ? <ClientProjects /> : <Navigate to="/login" replace />} />
                <Route
                  path="/client/documents"
                element={role === 'client' ? <ClientDocuments /> : <Navigate to="/login" replace />} />
                <Route
                  path="/client/monitoring"
                element={role === 'client' ? <ClientMonitoring /> : <Navigate to="/login" replace />} />
                <Route
                  path="/client/notes"
                element={role === 'client' ? <ClientNotes /> : <Navigate to="/login" replace />} />
              <Route
                path="/ngo-dashboard"
                element={role === 'ngo' ? <NGODashboard user={user} /> : <Navigate to="/login" replace />} />
                <Route
                  path="/ngo/questionnaires"
                element={role === 'ngo' ? <NGOQuestionnaires /> : <Navigate to="/login" replace />} />
                <Route
                  path="/ngo/files"
                element={role === 'ngo' ? <NGOFiles /> : <Navigate to="/login" replace />} />
                <Route
                  path="/ngo/budget"
                element={role === 'ngo' ? <NGOBudget /> : <Navigate to="/login" replace />} />
                <Route
                  path="/ngo/progress"
                element={role === 'ngo' ? <NGOProgress /> : <Navigate to="/login" replace />} />
                <Route
                  path="*"
                element={<Navigate to={`/${role}-dashboard`} replace />} />
              </Routes>
          </main>
        </div>
      </Router>
    </UIProvider>
  );
}

export default App;
