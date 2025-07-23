import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: users = [], loading: loadingUsers } = useRealtimeTable('profiles');
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: clientUsers = [] } = useRealtimeTable('client_users');
  const { data: ngoUsers = [] } = useRealtimeTable('ngo_users');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedNGOs, setSelectedNGOs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openEdit = (user: any) => {
    setEditingId(user.id);
    setRole(user.role || '');
    setSelectedClients(clientUsers.filter((cu: any) => cu.user_id === user.id).map((cu: any) => cu.client_id));
    setSelectedNGOs(ngoUsers.filter((nu: any) => nu.user_id === user.id).map((nu: any) => nu.ngo_id));
    setFeedback('');
  };

  const closeEdit = () => {
    setEditingId(null);
    setRole('');
    setSelectedClients([]);
    setSelectedNGOs([]);
    setFeedback('');
  };

  const handleSave = async () => {
    setSubmitting(true);
    setFeedback('');
    try {
      // Update role
      await supabase.from('profiles').update({ role }).eq('id', editingId);
      // Update client access
      const currentClientIds = clientUsers.filter((cu: any) => cu.user_id === editingId).map((cu: any) => cu.client_id);
      // Add new
      for (const clientId of selectedClients) {
        if (!currentClientIds.includes(clientId)) {
          await supabase.from('client_users').insert([{ user_id: editingId, client_id: clientId }]);
        }
      }
      // Remove unselected
      for (const clientId of currentClientIds) {
        if (!selectedClients.includes(clientId)) {
          await supabase.from('client_users').delete().eq('user_id', editingId).eq('client_id', clientId);
        }
      }
      // Update NGO access
      const currentNGOIds = ngoUsers.filter((nu: any) => nu.user_id === editingId).map((nu: any) => nu.ngo_id);
      for (const ngoId of selectedNGOs) {
        if (!currentNGOIds.includes(ngoId)) {
          await supabase.from('ngo_users').insert([{ user_id: editingId, ngo_id: ngoId }]);
        }
      }
      for (const ngoId of currentNGOIds) {
        if (!selectedNGOs.includes(ngoId)) {
          await supabase.from('ngo_users').delete().eq('user_id', editingId).eq('ngo_id', ngoId);
        }
      }
      setFeedback('User updated successfully!');
      setTimeout(closeEdit, 1000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loadingUsers) {
    return <div className="card" style={{ padding: 32 }}><div className="loading-spinner">Loading users...</div></div>;
  }

  return (
    <>
      {/* Remove the header with Logout button and user email. */}
      <div className="card">
        <h2>User Management</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Clients Access</th>
              <th>NGOs Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.full_name || user.username || '-'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{clientUsers.filter((cu: any) => cu.user_id === user.id).map((cu: any) => clients.find((c: any) => c.id === cu.client_id)?.company_name).filter(Boolean).join(', ')}</td>
                <td>{ngoUsers.filter((nu: any) => nu.user_id === user.id).map((nu: any) => ngos.find((n: any) => n.id === nu.ngo_id)?.name).filter(Boolean).join(', ')}</td>
                <td>
                  <button className="btn btn-xs btn-primary" onClick={() => openEdit(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editingId && (
          <div className="modal-overlay" onClick={closeEdit}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Edit User</h3>
              <label>
                Role
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                  <option value="ngo">NGO</option>
                </select>
              </label>
              {role === 'client' && (
                <label>
                  Clients Access
                  <select multiple value={selectedClients} onChange={e => setSelectedClients(Array.from(e.target.selectedOptions, option => option.value))}>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </label>
              )}
              {role === 'ngo' && (
                <label>
                  NGOs Access
                  <select multiple value={selectedNGOs} onChange={e => setSelectedNGOs(Array.from(e.target.selectedOptions, option => option.value))}>
                    {ngos.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </label>
              )}
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-success" onClick={handleSave} disabled={submitting}>Save</button>
                <button className="btn btn-secondary" onClick={closeEdit} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
              {feedback && <div className="form-feedback">{feedback}</div>}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 2000;
        }
        .modal {
          background: #fff; padding: 32px; border-radius: 8px; min-width: 320px; max-width: 480px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          overflow-y: auto;
          max-height: 90vh;
        }
        .modal label { display: block; margin-bottom: 12px; }
        .modal input, .modal select { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
    </>
  );
};

export default AdminUsers; 