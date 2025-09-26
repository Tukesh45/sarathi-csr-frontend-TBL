import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    
    // Real-time data fetching
    const { data: profiles = [], loading: loadingProfiles } = useRealtimeTable('profiles');
    const { data: clients = [] } = useRealtimeTable('clients');
    const { data: ngos = [] } = useRealtimeTable('ngos');
    const { data: clientUsers = [] } = useRealtimeTable('client_users');
    const { data: ngoUsers = [] } = useRealtimeTable('ngo_users');

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

    const filteredUsers = profiles.filter((user: any) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = 
            user.full_name?.toLowerCase().includes(lowerSearchTerm) ||
            user.email?.toLowerCase().includes(lowerSearchTerm) ||
            getAccessInfo(user).toLowerCase().includes(lowerSearchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const openModal = (user?: any) => {
        if (user) {
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
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: 'selectedClients' | 'selectedNGOs') => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setForm(prev => ({ ...prev, [field]: selectedOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback('');

        try {
            if (editingId) {
                // Update Profile
                const { error: profileError } = await supabase.from('profiles').update({
                    full_name: form.full_name,
                    role: form.role,
                    organization_name: form.organization_name,
                    updated_at: new Date().toISOString(),
                }).eq('id', editingId);
                if (profileError) throw profileError;

                // --- Reconcile Client Access ---
                await supabase.from('client_users').delete().eq('user_id', editingId);
                if (form.selectedClients.length > 0) {
                    const clientLinks = form.selectedClients.map(clientId => ({ user_id: editingId, client_id: clientId }));
                    await supabase.from('client_users').insert(clientLinks);
                }

                // --- Reconcile NGO Access ---
                await supabase.from('ngo_users').delete().eq('user_id', editingId);
                 if (form.selectedNGOs.length > 0) {
                    const ngoLinks = form.selectedNGOs.map(ngoId => ({ user_id: editingId, ngo_id: ngoId }));
                    await supabase.from('ngo_users').insert(ngoLinks);
                }
                
                setFeedback('User updated successfully!');
            } else {
                setFeedback('User creation must be done through the signup process.');
            }
            
            setTimeout(() => closeModal(), 1500);
        } catch (err: any) {
            setFeedback(err.message || 'Error occurred while saving user.');
        }
        setSubmitting(false);
    };

    const getRoleBadge = (role: string) => {
        const colors: { [key: string]: string } = {
            admin: '#dc2626',
            client: '#2563eb',
            ngo: '#059669'
        };
        return (
            <span style={{
                backgroundColor: colors[role] || '#6b7280',
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
        const clientNames = clientUsers
            .filter((cu: any) => cu.user_id === user.id)
            .map((cu: any) => clients.find((c: any) => c.id === cu.client_id)?.company_name)
            .filter(Boolean);
        const ngoNames = ngoUsers
            .filter((nu: any) => nu.user_id === user.id)
            .map((nu: any) => ngos.find((n: any) => n.id === nu.ngo_id)?.name)
            .filter(Boolean);
        
        const allNames = [...clientNames, ...ngoNames];
        if (allNames.length === 0) return 'No access assigned';
        return allNames.join(', ');
    };

    if (loadingProfiles) {
        return <div className="card" style={{ padding: 32 }}>...Loading</div>;
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>User Management</h2>
                <button className="btn btn-primary" onClick={() => openModal()} disabled title="User creation is handled via the signup process">
                    Add New User
                </button>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <input
                    type="text"
                    placeholder="Search by name, email, or assigned access..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="ngo">NGO</option>
                </select>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Access</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user: any) => (
                        <tr key={user.id}>
                            <td>{user.full_name || 'Unnamed User'}</td>
                            <td>{user.email}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>{getAccessInfo(user)}</td>
                            <td>
                                <button className="btn btn-xs btn-primary" onClick={() => openModal(user)}>
                                    Edit Access
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Edit User Access</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={form.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input name="full_name" value={form.full_name} onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Role</label>
                                    <select name="role" value={form.role} onChange={handleChange} required>
                                        <option value="client">Client</option>
                                        <option value="ngo">NGO</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Client Access</label>
                                    <select multiple value={form.selectedClients} onChange={(e) => handleMultiSelect(e, 'selectedClients')}>
                                        {clients.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.company_name}</option>
                                        ))}
                                    </select>
                                    <small>Hold Ctrl/Cmd to select multiple</small>
                                </div>
                                <div className="form-group full-width">
                                    <label>NGO Access</label>
                                    <select multiple value={form.selectedNGOs} onChange={(e) => handleMultiSelect(e, 'selectedNGOs')}>
                                        {ngos.map((n: any) => (
                                            <option key={n.id} value={n.id}>{n.name}</option>
                                        ))}
                                    </select>
                                    <small>Hold Ctrl/Cmd to select multiple</small>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                                <button className="btn btn-success" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Update User'}
                                </button>
                            </div>
                            {feedback && <div className="form-feedback">{feedback}</div>}
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                /* --- Table and general styles --- */
                .table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .table th, .table td { padding: 12px 16px; vertical-align: top; text-align: left; border-bottom: 1px solid #e5e7eb; }

                /* --- Modal & Form Styles --- */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { background: #fff; padding: 24px; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                .modal h3 { margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .form-group { display: flex; flex-direction: column; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
                .form-group input, .form-group select { padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
                .form-group input:disabled { background-color: #f3f4f6; cursor: not-allowed; }
                .form-group input:focus, .form-group select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .form-group select[multiple] { min-height: 120px; }
                .form-group small { font-size: 12px; color: #6b7280; margin-top: 4px; }
                .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 8px; }
                .form-feedback { margin-top: 12px; color: #166534; text-align: right; }
            `}</style>
        </div>
    );
};

export default AdminUsers;