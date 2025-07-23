import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminTargets: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: targets = [], loading } = useRealtimeTable('project_metrics');
  const { data: projects = [] } = useRealtimeTable('projects');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    metric_name: '',
    target_value: '',
    unit: '',
    baseline_value: '',
    measurement_frequency: 'quarterly',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState('');

  const openModal = (target?: any) => {
    if (target) {
      setForm({
        project_id: target.project_id || '',
        metric_name: target.metric_name || '',
        target_value: target.target_value || '',
        unit: target.unit || '',
        baseline_value: target.baseline_value || '',
        measurement_frequency: target.measurement_frequency || 'quarterly',
      });
      setEditingId(target.id);
    } else {
      setForm({
        project_id: '',
        metric_name: '',
        target_value: '',
        unit: '',
        baseline_value: '',
        measurement_frequency: 'quarterly',
      });
      setEditingId(null);
    }
    setShowModal(true);
    setFeedback('');
  };

  const closeModal = (cancelled = false) => {
    setShowModal(false);
    setForm({
      project_id: '',
      metric_name: '',
      target_value: '',
      unit: '',
      baseline_value: '',
      measurement_frequency: 'quarterly',
    });
    setEditingId(null);
    setFeedback('');
    if (cancelled) {
      setGlobalFeedback('Cancelled');
      setTimeout(() => setGlobalFeedback(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.project_id || !form.metric_name || !form.target_value || !form.unit) {
      setFeedback('Project, Metric Name, Target Value, and Unit are required.');
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase.from('project_metrics').update({
          ...form,
          target_value: form.target_value ? Number(form.target_value) : null,
          baseline_value: form.baseline_value ? Number(form.baseline_value) : 0,
        }).eq('id', editingId);
        if (error) throw error;
        setFeedback('Metric updated successfully!');
        setGlobalFeedback('Metric updated successfully!');
        setTimeout(() => {
          closeModal();
          setGlobalFeedback('');
        }, 1000);
      } else {
        const { error } = await supabase.from('project_metrics').insert([{ 
          ...form,
          target_value: form.target_value ? Number(form.target_value) : null,
          baseline_value: form.baseline_value ? Number(form.baseline_value) : 0,
        }]);
        if (error) throw error;
        setFeedback('Metric added successfully!');
        setGlobalFeedback('Metric added successfully!');
        setTimeout(() => {
          closeModal();
          setGlobalFeedback('');
        }, 1000);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this metric?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('project_metrics').delete().eq('id', id);
      if (error) throw error;
      setFeedback('Metric deleted.');
      setGlobalFeedback('Metric deleted.');
      setTimeout(() => setGlobalFeedback(''), 2000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading metrics...</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Targets</h2>
        {targets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-illustration">🎯</div>
            <div className="mb-2 font-bold">No Targets Yet</div>
            <div>Start by creating your first target!</div>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Metric Name</th>
                  <th>Target Value</th>
                  <th>Unit</th>
                  <th>Baseline</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target: any) => (
                  <tr key={target.id}>
                    <td>{projects.find((p: any) => p.id === target.project_id)?.title || target.project_id}</td>
                    <td>{target.metric_name}</td>
                    <td>{target.target_value}</td>
                    <td>{target.unit}</td>
                    <td>{target.baseline_value}</td>
                    <td>{target.measurement_frequency}</td>
                    <td>
                      <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(target)}>Edit</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(target.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => openModal()}>Add New Target</button>
        </div>
        <div style={{ marginTop: 8, minHeight: 24 }}>
          {globalFeedback && <div className="form-feedback" style={{ color: '#388e3c' }}>{globalFeedback}</div>}
        </div>
        <div className="modal-container">
          {showModal && (
            <div className="modal-overlay" onClick={() => closeModal(true)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{editingId ? 'Edit Target' : 'Add Target'}</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Project
                    <select name="project_id" value={form.project_id} onChange={handleChange} required>
                      <option value="">Select Project</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </label>
                  <label>
                    Metric Name
                    <input name="metric_name" value={form.metric_name} onChange={handleChange} required />
                  </label>
                  <label>
                    Target Value
                    <input name="target_value" type="number" value={form.target_value} onChange={handleChange} required />
                  </label>
                  <label>
                    Unit
                    <input name="unit" value={form.unit} onChange={handleChange} required />
                  </label>
                  <label>
                    Baseline Value
                    <input name="baseline_value" type="number" value={form.baseline_value} onChange={handleChange} />
                  </label>
                  <label>
                    Measurement Frequency
                    <select name="measurement_frequency" value={form.measurement_frequency} onChange={handleChange}>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
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
        </div>
      </div>
      <style>{`
        .modal-container { /* no position needed */ }
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

export default AdminTargets; 