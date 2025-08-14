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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);

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
    setForm({
      company_name: '',
      industry: '',
      contact_person: '',
      annual_csr_budget: '',
      cin_number: '',
      website: '',
    });
    setEditingId(null);
    setFeedback('');
    if (cancelled) {
      setFeedbackGlobal('Cancelled.');
      setTimeout(() => setFeedbackGlobal(''), 2000);
    }
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
      if (editingId) {
        const { error } = await supabase
          .from('clients')
          .update({
            ...form,
            annual_csr_budget: form.annual_csr_budget ? Number(form.annual_csr_budget) : null,
          })
          .eq('id', editingId);
        if (error) throw error;
        setFeedback('Client updated successfully!');
        setFeedbackGlobal('Client updated successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ 
            ...form,
            annual_csr_budget: form.annual_csr_budget ? Number(form.annual_csr_budget) : null,
          }])
          .select();
        if (error) throw error;
        setFeedback('Client added successfully!');
        setFeedbackGlobal('Client added successfully!');
        setNewClientId(data && data[0] && data[0].id ? data[0].id : null);
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
          // setShowNGOModal(true); // Remove this line so NGO modal only opens on button click
        }, 1000);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  // Handler for after NGO is added
  const handleNGOAdded = (ngoId: string) => {
    setNewNGOId(ngoId);
    setShowNGOModal(false);
    setShowProjectModal(true);
  };

  // Handler for after Project is added
  const handleProjectAdded = () => {
    setShowProjectModal(false);
    setNewClientId(null);
    setNewNGOId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setFeedback('Client deleted.');
      setFeedbackGlobal('Client deleted.');
      setTimeout(() => setFeedbackGlobal(''), 2000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Helper function to get NGOs assigned to a client
  const getClientNGOs = (clientId: string) => {
    return ngos.filter((ngo: any) => ngo.client_id === clientId);
  };

  // Helper function to get projects for a client
  const getClientProjects = (clientId: string) => {
    return projects.filter((project: any) => project.client_id === clientId);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading clients...</div>
      </div>
    );
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
        <>
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
                            <div key={ngo.id} style={{ 
                              background: '#f0f9ff', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              marginBottom: '4px',
                              fontSize: '12px',
                              border: '1px solid #0ea5e9'
                            }}>
                              {ngo.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>No NGOs assigned</span>
                      )}
                    </td>
                    <td>
                      {clientProjects.length > 0 ? (
                        <div>
                          {clientProjects.map((project: any) => (
                            <div key={project.id} style={{ 
                              background: '#f0fdf4', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              marginBottom: '4px',
                              fontSize: '12px',
                              border: '1px solid #22c55e'
                            }}>
                              {project.title}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>No projects</span>
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
        </>
      )}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => openModal()}>Add New Client</button>
        <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowNGOModal(true)}>Add New NGO</button>
      </div>
      <div style={{ marginTop: 8, minHeight: 24 }}>
        {feedbackGlobal && <div className="form-feedback" style={{ color: '#388e3c' }}>{feedbackGlobal}</div>}
      </div>
      <div className="modal-container" style={{ position: 'relative' }}>
        {showModal && (
          <div className="modal-overlay" onClick={() => closeModal(true)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{editingId ? 'Edit Client' : 'Add Client'}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Company Name
                  <input name="company_name" value={form.company_name} onChange={handleChange} required />
                </label>
                <label>
                  Industry
                  <input name="industry" value={form.industry} onChange={handleChange} />
                </label>
                <label>
                  Contact Person
                  <input name="contact_person" value={form.contact_person} onChange={handleChange} />
                </label>
                <label>
                  Annual CSR Budget
                  <input name="annual_csr_budget" type="number" value={form.annual_csr_budget} onChange={handleChange} />
                </label>
                <label>
                  CIN Number
                  <input name="cin_number" value={form.cin_number} onChange={handleChange} />
                </label>
                <label>
                  Website
                  <input name="website" value={form.website} onChange={handleChange} />
                </label>
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-success" type="submit" disabled={submitting}>{editingId ? 'Update' : 'Add'}</button>
                  <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
                {feedback && <div className="form-feedback">{feedback}</div>}
              </form>
            </div>
          </div>
        )}
        {/* Chained NGO Modal */}
        {showNGOModal && (
          <AdminNGOs
            initialClientId={newClientId}
            onNGOAdded={handleNGOAdded}
            onCancel={() => setShowNGOModal(false)}
            isModal
          />
        )}
        {/* Chained Project Modal */}
        {showProjectModal && (
          <AdminProjects
            initialClientId={newClientId}
            initialNGOId={newNGOId}
            onProjectAdded={handleProjectAdded}
            onCancel={() => setShowProjectModal(false)}
            isModal
          />
        )}
      </div>
      <style>{`
        .modal-container { position: relative; }
        .modal-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal {
          background: #fff; padding: 32px; border-radius: 8px; min-width: 320px; max-width: 480px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .modal label { display: block; margin-bottom: 12px; }
        .modal input, .modal select { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
    </div>
  );
};

export default AdminClients; 