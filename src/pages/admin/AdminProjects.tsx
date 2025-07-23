import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AdminProjectsProps {
  initialClientId?: string | null;
  initialNGOId?: string | null;
  onProjectAdded?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const AdminProjects: React.FC<AdminProjectsProps> = ({ initialClientId, initialNGOId, onProjectAdded, onCancel, isModal }) => {
  const navigate = useNavigate();
  const { data: projects = [], loading } = useRealtimeTable('projects');
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: clientNGOs = [] } = useRealtimeTable('client_ngos');
  const [showModal, setShowModal] = useState(false);
  // Clean, minimal form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    geographic_scope: '',
    unit_of_measurement: '',
    target_beneficiaries: '',
    client_id: '',
    ngo_id: '',
    status: 'draft',
    priority: 'medium',
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);

  // Modal open/close logic
  const openModal = (project?: any) => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        goal: project.goal || '',
        geographic_scope: project.geographic_scope || '',
        unit_of_measurement: project.unit_of_measurement || '',
        target_beneficiaries: project.target_beneficiaries || '',
        client_id: project.client_id || '',
        ngo_id: project.ngo_id || '',
        status: project.status || 'draft',
        priority: project.priority || 'medium',
        start_date: project.start_date ? project.start_date.slice(0, 10) : '',
        end_date: project.end_date ? project.end_date.slice(0, 10) : '',
      });
      setEditingId(project.id);
    } else {
      setForm({
        title: '',
        description: '',
        goal: '',
        geographic_scope: '',
        unit_of_measurement: '',
        target_beneficiaries: '',
        client_id: '',
        ngo_id: '',
        status: 'draft',
        priority: 'medium',
        start_date: '',
        end_date: '',
      });
      setEditingId(null);
    }
    setShowModal(true);
    setFormError('');
    setFeedback('');
  };

  const closeModal = (cancelled = false) => {
    setShowModal(false);
    setEditingId(null);
    setFormError('');
    setFeedback('');
    if (cancelled) {
      setGlobalFeedback('Cancelled.');
      setTimeout(() => setGlobalFeedback(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.client_id || !form.ngo_id) {
      setFormError('Title, Client, and NGO are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('projects').update({
          ...form,
          ngo_id: form.ngo_id, // Ensure ngo_id is set
          target_beneficiaries: form.target_beneficiaries ? Number(form.target_beneficiaries) : null,
        }).eq('id', editingId);
        if (error) throw error;
        setGlobalFeedback('Project updated successfully!');
        setTimeout(() => {
          closeModal();
          setGlobalFeedback('');
        }, 1000);
      } else {
        const { error } = await supabase.from('projects').insert([{ 
          ...form,
          ngo_id: form.ngo_id, // Ensure ngo_id is set
          target_beneficiaries: form.target_beneficiaries ? Number(form.target_beneficiaries) : null,
        }]);
        if (error) throw error;
        setGlobalFeedback('Project added successfully!');
        setTimeout(() => {
          closeModal();
          setGlobalFeedback('');
        }, 1000);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setFeedback('Project deleted.');
      setGlobalFeedback('Project deleted.');
      setTimeout(() => setGlobalFeedback(''), 2000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  // Filter NGOs based on selected client
  const filteredNGOs = form.client_id
    ? ngos.filter((n: any) => n.client_id === form.client_id)
    : ngos;

  // Remove draggable modal logic and related state

  if (loading) {
    return (
  <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading projects...</div>
      </div>
    );
  }

  // If isModal, render as modal
  if (isModal) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Add Project</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label>
              Goal
              <input name="goal" value={form.goal} onChange={handleChange} />
            </label>
            <label>
              Geographic Scope
              <input name="geographic_scope" value={form.geographic_scope} onChange={handleChange} />
            </label>
            <label>
              Unit of Measurement
              <input name="unit_of_measurement" value={form.unit_of_measurement} onChange={handleChange} />
            </label>
            <label>
              Target Beneficiaries
              <input name="target_beneficiaries" type="number" value={form.target_beneficiaries} onChange={handleChange} />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label>
              NGO
              <select name="ngo_id" value={form.ngo_id} onChange={handleChange} required disabled={!!initialNGOId}>
                <option value="">Select NGO</option>
                {ngos.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </label>
            <label>
              Client
              <select name="client_id" value={form.client_id} onChange={handleChange} required disabled={!!initialClientId}>
                <option value="">Select Client</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>
            <label>
              Start Date
              <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            </label>
            <label>
              End Date
              <input name="end_date" type="date" value={form.end_date} onChange={handleChange} />
            </label>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-success" type="submit" disabled={submitting}>Add</button>
              <button className="btn btn-secondary" type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
            {feedback && <div className="form-feedback">{feedback}</div>}
          </form>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <h2>Projects</h2>
      </div>
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">📋</div>
          <div className="mb-2 font-bold">No Projects Yet</div>
          <div>Start by creating your first project!</div>
        </div>
      ) : (
        <>
    <table className="table">
      <thead>
        <tr>
                <th>Title</th>
          <th>Status</th>
                <th>Priority</th>
          <th>NGO</th>
          <th>Client</th>
          <th>Start</th>
          <th>End</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
              {projects.map((project: any) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.status}</td>
                  <td>{project.priority}</td>
                  <td>{ngos.find((n: any) => n.id === project.ngo_id)?.name || project.ngo_id}</td>
                  <td>{clients.find((c: any) => c.id === project.client_id)?.company_name || project.client_id}</td>
                  <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</td>
                  <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</td>
                  <td>
                    <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(project)}>Edit</button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(project.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        </>
      )}
    <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => openModal()}>Add New Project</button>
      </div>
      <div style={{ marginTop: 8, minHeight: 24 }}>
        {globalFeedback && <div className="form-feedback" style={{ color: '#388e3c' }}>{globalFeedback}</div>}
      </div>
      <div className="modal-container">
        {showModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(true); }}>
            <div
              className="modal responsive-centered-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Project' : 'Add Project'}</h3>
                <button className="btn btn-xs btn-danger" style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, lineHeight: 1 }} onClick={() => closeModal(true)} aria-label="Close">×</button>
              </div>
              <form onSubmit={handleSubmit} autoComplete="off">
                <label>
                  Title*
                  <input name="title" value={form.title} onChange={handleChange} required autoComplete="off" />
                </label>
                <label>
                  Description
                  <textarea name="description" value={form.description} onChange={handleChange} />
                </label>
                <label>
                  Goal
                  <input name="goal" value={form.goal} onChange={handleChange} />
                </label>
                <label>
                  Geographic Scope
                  <input name="geographic_scope" value={form.geographic_scope} onChange={handleChange} />
                </label>
                <label>
                  Unit of Measurement
                  <input name="unit_of_measurement" value={form.unit_of_measurement} onChange={handleChange} />
                </label>
                <label>
                  Target Beneficiaries
                  <input name="target_beneficiaries" type="number" value={form.target_beneficiaries} onChange={handleChange} />
                </label>
                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select name="priority" value={form.priority} onChange={handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label>
                  NGO*
                  <select
                    name="ngo_id"
                    value={form.ngo_id}
                    onChange={handleChange}
                    required
                    disabled={!!initialNGOId || filteredNGOs.length === 0}
                  >
                    <option value="">{filteredNGOs.length === 0 ? 'No NGOs for this client' : 'Select NGO'}</option>
                    {filteredNGOs.map((n: any) => (
                      <option key={n.id} value={n.user_id}>{n.name}</option> // Use n.user_id here
                    ))}
                  </select>
                </label>
                <label>
                  Client*
                  <select name="client_id" value={form.client_id} onChange={handleChange} required>
                    <option value="">Select Client</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </label>
                <label>
                  Start Date
                  <input name="start_date" type="date" value={form.start_date} onChange={handleChange} autoComplete="off" />
                </label>
                <label>
                  End Date
                  <input name="end_date" type="date" value={form.end_date} onChange={handleChange} autoComplete="off" />
                </label>
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-success" type="submit" disabled={submitting}>{editingId ? 'Update' : 'Add'}</button>
                  <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
                {formError && <div className="form-feedback">{formError}</div>}
                {feedback && <div className="form-feedback">{feedback}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .modal-container { /* no position needed */ }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 2000;
        }
        .modal, .responsive-centered-modal {
          background: #fff; padding: 32px; border-radius: 8px; min-width: 320px; width: 420px; max-width: 95vw; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          overflow-y: auto;
          max-height: 90vh;
          box-sizing: border-box;
        }
        .modal label { display: block; margin-bottom: 12px; }
        .modal input, .modal select, .modal textarea { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
  </div>
);
};

export default AdminProjects; 