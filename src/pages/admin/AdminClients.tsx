import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import AdminNGOs from './AdminNGOs';
import AdminProjects from './AdminProjects';
import { useNavigate } from 'react-router-dom';

const AdminClients: React.FC = () => {
    const navigate = useNavigate();
    
    const { data: clients = [], loading } = useRealtimeTable('clients');
    const { data: ngos = [] } = useRealtimeTable('ngos');
    const { data: projects = [] } = useRealtimeTable('projects');
    const { data: partnerships = [] } = useRealtimeTable('client_ngo_partnerships');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        company_name: '',
        industry: '',
        contact_person: '',
        annual_csr_budget: '',
        cin_number: '',
        website: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackGlobal, setFeedbackGlobal] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showNGOModal, setShowNGOModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newClientId, setNewClientId] = useState<string | null>(null);
    const [newNGOId, setNewNGOId] = useState<string | null>(null);

    const openModal = (client?: any) => {
        if (client) {
            setForm({
                company_name: client.company_name || '',
                industry: client.industry || '',
                contact_person: client.contact_person || '',
                annual_csr_budget: client.annual_csr_budget || '',
                cin_number: client.cin_number || '',
                website: client.website || '',
            });
            setEditingId(client.id);
        } else {
            setForm({
                company_name: '',
                industry: '',
                contact_person: '',
                annual_csr_budget: '',
                cin_number: '',
                website: '',
            });
            setEditingId(null);
        }
        setShowModal(true);
        setFeedback('');
    };

    const closeModal = (cancelled = false) => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback('');
        if (!form.company_name) {
            setFeedback('Company Name is required.');
            setSubmitting(false);
            return;
        }
        try {
            const payload = {
                ...form,
                annual_csr_budget: form.annual_csr_budget ? Number(form.annual_csr_budget) : null,
            };
            if (editingId) {
                const { error } = await supabase.from('clients').update(payload).eq('id', editingId);
                if (error) throw error;
                setFeedbackGlobal('Client updated successfully!');
            } else {
                const { data, error } = await supabase.from('clients').insert([payload]).select();
                if (error) throw error;
                setFeedbackGlobal('Client added successfully!');
                const createdClientId = data?.[0]?.id || null;
                setNewClientId(createdClientId);
                if (createdClientId) {
                    setShowNGOModal(true); // Automatically open NGO modal after adding client
                }
            }
            setTimeout(() => closeModal(), 1000);
        } catch (err: any) {
            setFeedback(err.message || 'Error occurred.');
        }
        setSubmitting(false);
    };

    const handleNGOAdded = (ngoId: string) => {
        setNewNGOId(ngoId);
        setShowNGOModal(false);
        setShowProjectModal(true);
    };

    const handleProjectAdded = () => {
        setShowProjectModal(false);
        setNewClientId(null);
        setNewNGOId(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        await supabase.from('clients').delete().eq('id', id);
    };

    const getClientNGOs = (clientId: string) => {
        const clientPartnerships = partnerships.filter((p: any) => p.client_id === clientId);
        const ngoIds = clientPartnerships.map((p: any) => p.ngo_id);
        return ngos.filter((ngo: any) => ngoIds.includes(ngo.id));
    };

    const getClientProjects = (clientId: string) => {
        const clientNGOs = getClientNGOs(clientId);
        const ngoIds = clientNGOs.map((ngo: any) => ngo.id);
        return projects.filter((project: any) => ngoIds.includes(project.ngo_id));
    };

    if (loading) {
        return <div className="card" style={{ padding: 32 }}>...Loading</div>;
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Clients</h2>
            </div>
            {clients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-illustration">🏢</div>
                    <div className="mb-2 font-bold">No Clients Yet</div>
                    <div>Start by adding your first client!</div>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Industry</th>
                            <th>Contact Person</th>
                            <th>Annual CSR Budget</th>
                            <th>Assigned NGOs</th>
                            <th>Projects</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client: any) => {
                            const clientNGOs = getClientNGOs(client.id);
                            const clientProjects = getClientProjects(client.id);
                            return (
                                <tr key={client.id}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{client.company_name}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{client.website}</div>
                                    </td>
                                    <td>{client.industry}</td>
                                    <td>{client.contact_person}</td>
                                    <td>₹{client.annual_csr_budget?.toLocaleString() || '0'}</td>
                                    <td>
                                        {clientNGOs.length > 0 ? (
                                            <div>
                                                {clientNGOs.map((ngo: any) => (
                                                    <div key={ngo.id} className="item-badge-ngo">
                                                        {ngo.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-items-text">No NGOs assigned</span>
                                        )}
                                    </td>
                                    <td>
                                        {clientProjects.length > 0 ? (
                                            <div>
                                                {clientProjects.map((project: any) => (
                                                    <div key={project.id} className="item-badge-project">
                                                        {project.title}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-items-text">No projects</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(client)}>Edit</button>
                                        <button className="btn btn-xs btn-danger" onClick={() => handleDelete(client.id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: 24 }}>
                <button className="btn btn-primary" onClick={() => openModal()}>Add New Client</button>
            </div>
            
            {showModal && (
                <div className="modal-overlay" onClick={() => closeModal(true)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingId ? 'Edit Client' : 'Add Client'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Company Name*</label>
                                    <input name="company_name" value={form.company_name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Industry</label>
                                    <input name="industry" value={form.industry} onChange={handleChange} placeholder="e.g., Technology" />
                                </div>
                                <div className="form-group">
                                    <label>CIN Number</label>
                                    <input name="cin_number" value={form.cin_number} onChange={handleChange} />
                                </div>
                                 <div className="form-group full-width">
                                    <label>Website</label>
                                    <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input name="contact_person" value={form.contact_person} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Annual CSR Budget (₹)</label>
                                    <input type="number" name="annual_csr_budget" value={form.annual_csr_budget} onChange={handleChange} placeholder="e.g., 500000" />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)}>Cancel</button>
                                <button className="btn btn-success" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingId ? 'Update Client' : 'Add Client')}
                                </button>
                            </div>
                            {feedback && <div className="form-feedback">{feedback}</div>}
                        </form>
                    </div>
                </div>
            )}
            
            {showNGOModal && (
                <AdminNGOs
                    initialClientId={newClientId}
                    onNGOAdded={handleNGOAdded}
                    onCancel={() => {
                        setShowNGOModal(false);
                        setNewClientId(null);
                    }}
                    isModal
                />
            )}
            {showProjectModal && (
                <AdminProjects
                    initialClientId={newClientId}
                    initialNGOId={newNGOId}
                    onProjectAdded={handleProjectAdded}
                    onCancel={() => {
                        setShowProjectModal(false);
                        setNewClientId(null);
                        setNewNGOId(null);
                    }}
                    isModal
                />
            )}

            <style>{`
                /* --- Table Styles --- */
                .table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .table th, .table td { padding: 12px 16px; vertical-align: top; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .item-badge-ngo, .item-badge-project { padding: 4px 8px; border-radius: 999px; margin-bottom: 4px; font-size: 12px; display: inline-block; margin-right: 4px; }
                .item-badge-ngo { background: #eef2ff; border: 1px solid #a5b4fc; color: #4338ca; }
                .item-badge-project { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
                .no-items-text { color: #6b7280; font-size: 12px; }

                /* --- Modal & Form Styles --- */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { background: #fff; padding: 24px; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                .modal h3 { margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .form-group { display: flex; flex-direction: column; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
                .form-group input, .form-group select { padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
                .form-group input:focus, .form-group select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 8px; }
                .form-feedback { margin-top: 12px; color: #d32f2f; text-align: right; }
            `}</style>
        </div>
    );
};

export default AdminClients;