import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
    
    // Test manual data fetch
    const testDataFetch = async () => {
      try {
        const { data: testProfiles, error } = await supabase.from('profiles').select('*');
        console.log('Manual profiles fetch:', { data: testProfiles, error });
        
        const { data: testClients, error: clientError } = await supabase.from('clients').select('*');
        console.log('Manual clients fetch:', { data: testClients, error: clientError });
      } catch (err) {
        console.error('Manual fetch error:', err);
      }
    };
    
    testDataFetch();
  }, []);

  // Real-time data
  const { data: profiles = [], loading: loadingProfiles } = useRealtimeTable('profiles');
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: clientUsers = [] } = useRealtimeTable('client_users');
  const { data: ngoUsers = [] } = useRealtimeTable('ngo_users');

  // Debug logging
  useEffect(() => {
    console.log('AdminUsers Debug Info:');
    console.log('Profiles count:', profiles.length, 'Data:', profiles);
    console.log('Clients count:', clients.length, 'Data:', clients);
    console.log('NGOs count:', ngos.length, 'Data:', ngos);
    console.log('Client Users count:', clientUsers.length, 'Data:', clientUsers);
    console.log('NGO Users count:', ngoUsers.length, 'Data:', ngoUsers);
    
    // Check for any empty or error states
    if (profiles.length === 0) {
      console.warn('No profiles found - this might indicate a connection issue');
    }
    if (clients.length === 0) {
      console.warn('No clients found');
    }
    if (ngos.length === 0) {
      console.warn('No NGOs found');
    }
  }, [profiles, clients, ngos, clientUsers, ngoUsers]);

  // State management
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role: 'client',
    organization_name: '',
    selectedClients: [] as string[],
    selectedNGOs: [] as string[],
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filter users based on search and role
  const filteredUsers = profiles.filter((user: any) => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openModal = (user?: any) => {
    if (user) {
      // Edit existing user
      setForm({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role || 'client',
        organization_name: user.organization_name || '',
        selectedClients: clientUsers.filter((cu: any) => cu.user_id === user.id).map((cu: any) => cu.client_id),
        selectedNGOs: ngoUsers.filter((nu: any) => nu.user_id === user.id).map((nu: any) => nu.ngo_id),
      });
      setEditingId(user.id);
    } else {
      // Create new user
      setForm({
        email: '',
        full_name: '',
        role: 'client',
        organization_name: '',
        selectedClients: [],
        selectedNGOs: [],
      });
      setEditingId(null);
    }
    setShowModal(true);
    setFeedback('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      email: '',
      full_name: '',
      role: 'client',
      organization_name: '',
      selectedClients: [],
      selectedNGOs: [],
    });
    setFeedback('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');

    try {
      if (editingId) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            email: form.email,
            full_name: form.full_name,
            role: form.role,
            organization_name: form.organization_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (profileError) throw profileError;

        // If user role is changed to NGO, ensure they have an NGO record
        if (form.role === 'ngo') {
          const existingNgo = ngos.find((n: any) => n.user_id === editingId);
          if (!existingNgo) {
            // Create NGO record for this user
            const { data: newNgo, error: ngoError } = await supabase
              .from('ngos')
              .insert([{
                name: form.organization_name || 'NGO Organization',
                registration_number: 'NGO_REG_' + Math.random().toString(36).substr(2, 9),
                focus_areas: 'Focus areas to be defined',
                geographic_coverage: 'Geographic coverage to be defined',
                contact_person: form.full_name,
                login_email: form.email,
                user_id: editingId
              }])
              .select()
              .single();
            
            if (ngoError) {
              console.error('Error creating NGO record:', ngoError);
            } else if (newNgo) {
              console.log('Created NGO record for user:', newNgo);
            }
          }
        }

        // Update client access
        const currentClientIds = clientUsers.filter((cu: any) => cu.user_id === editingId).map((cu: any) => cu.client_id);
        
        // Add new client access
        for (const clientId of form.selectedClients) {
          if (!currentClientIds.includes(clientId)) {
            await supabase.from('client_users').insert([{ user_id: editingId, client_id: clientId }]);
          }
        }
        
        // Remove unselected client access
        for (const clientId of currentClientIds) {
          if (!form.selectedClients.includes(clientId)) {
            await supabase.from('client_users').delete().eq('user_id', editingId).eq('client_id', clientId);
          }
        }

        // Update NGO access
        const currentNGOIds = ngoUsers.filter((nu: any) => nu.user_id === editingId).map((nu: any) => nu.ngo_id);
        
        // Add new NGO access
        for (const ngoId of form.selectedNGOs) {
          if (!currentNGOIds.includes(ngoId)) {
            // First, ensure the NGO record exists and is properly linked
            const ngoRecord = ngos.find((n: any) => n.id === ngoId);
            if (ngoRecord) {
              // Update NGO record to link with this user if not already linked
              if (!ngoRecord.user_id) {
                await supabase
                  .from('ngos')
                  .update({ user_id: editingId })
                  .eq('id', ngoId);
              }
            }
            
            // Create the ngo_users relationship
            await supabase.from('ngo_users').insert([{ user_id: editingId, ngo_id: ngoId }]);
          }
        }
        
        // Remove unselected NGO access
        for (const ngoId of currentNGOIds) {
          if (!form.selectedNGOs.includes(ngoId)) {
            await supabase.from('ngo_users').delete().eq('user_id', editingId).eq('ngo_id', ngoId);
          }
        }

        setFeedback('User updated successfully!');
      } else {
        // Create new user (this would require auth signup in a real app)
        setFeedback('User creation requires authentication setup. Please contact the system administrator.');
      }

      setTimeout(() => {
        closeModal();
        setFeedback('');
      }, 2000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred while saving user.');
    }
    setSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: 'selectedClients' | 'selectedNGOs') => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setForm(prev => ({ ...prev, [field]: selectedOptions }));
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: '#dc2626',
      client: '#2563eb',
      ngo: '#059669'
    };
    return (
      <span style={{
        backgroundColor: colors[role as keyof typeof colors] || '#6b7280',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getAccessInfo = (user: any) => {
    const userClients = clientUsers.filter((cu: any) => cu.user_id === user.id);
    const userNGOs = ngoUsers.filter((nu: any) => nu.user_id === user.id);
    
    if (user.role === 'client' && userClients.length > 0) {
      return userClients.map((cu: any) => 
        clients.find((c: any) => c.id === cu.client_id)?.company_name
      ).filter(Boolean).join(', ');
    }
    
    if (user.role === 'ngo' && userNGOs.length > 0) {
      return userNGOs.map((nu: any) => 
        ngos.find((n: any) => n.id === nu.ngo_id)?.name
      ).filter(Boolean).join(', ');
    }
    
    return 'No access assigned';
  };

  if (loadingProfiles) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>User Management</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span style={{ marginRight: 8 }}>➕</span>
          Add New User
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search users by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="client">Client</option>
          <option value="ngo">NGO</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Access</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  {searchTerm || roleFilter !== 'all' ? 'No users found matching your criteria.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>
                      {user.full_name || 'Unnamed User'}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.organization_name || '-'}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {getAccessInfo(user)}
                    </div>
                  </td>
                  <td>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-xs btn-primary" 
                      onClick={() => openModal(user)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginTop: 24, 
        padding: '16px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px' 
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {profiles.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {profiles.filter((u: any) => u.role === 'client').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Clients</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
            {profiles.filter((u: any) => u.role === 'ngo').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>NGOs</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {profiles.filter((u: any) => u.role === 'admin').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Admins</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit User' : 'Add New User'}</h3>
            
            <form onSubmit={handleSubmit}>
              <label>
                Email *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!!editingId} // Don't allow email changes for existing users
                />
              </label>

              <label>
                Full Name *
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Organization
                <input
                  type="text"
                  name="organization_name"
                  value={form.organization_name}
                  onChange={handleChange}
                />
              </label>

              <label>
                Role *
                <select name="role" value={form.role} onChange={handleChange} required>
                  <option value="client">Client</option>
                  <option value="ngo">NGO</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              {form.role === 'client' && (
                <label>
                  Client Access
                  <select 
                    multiple 
                    value={form.selectedClients} 
                    onChange={(e) => handleMultiSelect(e, 'selectedClients')}
                    style={{ minHeight: '100px' }}
                  >
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Hold Ctrl/Cmd to select multiple clients
                  </div>
                </label>
              )}

              {form.role === 'ngo' && (
                <label>
                  NGO Access
                  <select 
                    multiple 
                    value={form.selectedNGOs} 
                    onChange={(e) => handleMultiSelect(e, 'selectedNGOs')}
                    style={{ minHeight: '100px' }}
                  >
                    {ngos.map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Hold Ctrl/Cmd to select multiple NGOs
                  </div>
                </label>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-success" 
                  type="submit" 
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  type="button" 
                  onClick={closeModal}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>

            {feedback && (
              <div className="form-feedback" style={{ 
                marginTop: 16, 
                padding: '12px', 
                borderRadius: '6px',
                backgroundColor: feedback.includes('successfully') ? '#dcfce7' : '#fef2f2',
                color: feedback.includes('successfully') ? '#166534' : '#dc2626',
                border: `1px solid ${feedback.includes('successfully') ? '#bbf7d0' : '#fecaca'}`
              }}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100vw; 
          height: 100vh;
          background: rgba(0,0,0,0.5); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 2000;
        }
        .modal {
          background: #fff; 
          padding: 32px; 
          border-radius: 12px; 
          min-width: 400px; 
          max-width: 600px; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow-y: auto;
          max-height: 90vh;
        }
        .modal h3 {
          margin-bottom: 24px;
          color: #1f2937;
        }
        .modal label { 
          display: block; 
          margin-bottom: 16px; 
          font-weight: 500;
          color: #374151;
        }
        .modal input, .modal select { 
          width: 100%; 
          padding: 10px 12px; 
          margin-top: 6px; 
          border: 1px solid #d1d5db; 
          border-radius: 6px;
          font-size: 14px;
        }
        .modal input:focus, .modal select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .modal input:disabled {
          background-color: #f9fafb;
          color: #6b7280;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .table tbody tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers; 