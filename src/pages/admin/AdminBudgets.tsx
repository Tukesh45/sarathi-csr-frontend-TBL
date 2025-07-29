import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminBudgets: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data?.user?.email || 'Admin');
      // Set allocated_by to the user's id if available
      if (data?.user?.id) {
        setForm(f => ({ ...f, allocated_by: data.user.id }));
      }
    });
  }, []);
  const { data: budgets = [], loading } = useRealtimeTable('budget_allocations');
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    total_budget: '',
    q1_budget: '',
    q2_budget: '',
    q3_budget: '',
    q4_budget: '',
    contingency_budget: '',
    allocated_by: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackGlobal, setFeedbackGlobal] = useState('');

  const openModal = (budget?: any) => {
    if (budget) {
      setForm({
        project_id: budget.project_id || '',
        total_budget: budget.total_budget || '',
        q1_budget: budget.q1_budget || '',
        q2_budget: budget.q2_budget || '',
        q3_budget: budget.q3_budget || '',
        q4_budget: budget.q4_budget || '',
        contingency_budget: budget.contingency_budget || '',
        allocated_by: budget.allocated_by || '',
      });
      setEditingId(budget.id);
    } else {
      setForm({
        project_id: '',
        total_budget: '',
        q1_budget: '',
        q2_budget: '',
        q3_budget: '',
        q4_budget: '',
        contingency_budget: '',
        allocated_by: '',
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
      total_budget: '',
      q1_budget: '',
      q2_budget: '',
      q3_budget: '',
      q4_budget: '',
      contingency_budget: '',
      allocated_by: '',
    });
    setEditingId(null);
    setFeedback('');
    if (cancelled) {
      setFeedbackGlobal('Budget allocation cancelled.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.project_id || !form.total_budget) {
      setFeedback('Project and Total Budget are required.');
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase
          .from('budget_allocations')
          .update({
            ...form,
            total_budget: form.total_budget ? Number(form.total_budget) : null,
            q1_budget: form.q1_budget ? Number(form.q1_budget) : 0,
            q2_budget: form.q2_budget ? Number(form.q2_budget) : 0,
            q3_budget: form.q3_budget ? Number(form.q3_budget) : 0,
            q4_budget: form.q4_budget ? Number(form.q4_budget) : 0,
            contingency_budget: form.contingency_budget ? Number(form.contingency_budget) : 0,
          })
          .eq('id', editingId);
        if (error) throw error;
        setFeedback('Budget updated successfully!');
        setFeedbackGlobal('Budget updated successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      } else {
        const { error } = await supabase
          .from('budget_allocations')
          .insert([{ 
            ...form,
            total_budget: form.total_budget ? Number(form.total_budget) : null,
            q1_budget: form.q1_budget ? Number(form.q1_budget) : 0,
            q2_budget: form.q2_budget ? Number(form.q2_budget) : 0,
            q3_budget: form.q3_budget ? Number(form.q3_budget) : 0,
            q4_budget: form.q4_budget ? Number(form.q4_budget) : 0,
            contingency_budget: form.contingency_budget ? Number(form.contingency_budget) : 0,
          }]);
        if (error) throw error;
        setFeedback('Budget added successfully!');
        setFeedbackGlobal('Budget added successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('budget_allocations').delete().eq('id', id);
      if (error) throw error;
      setFeedback('Budget deleted.');
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
        <div className="loading-spinner">Loading budgets...</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
    <h2>Budgets</h2>
        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-illustration">💰</div>
            <div className="mb-2 font-bold">No Budgets Yet</div>
            <div>Start by allocating your first budget!</div>
          </div>
        ) : (
          <>
    <table className="table">
      <thead>
        <tr>
          <th>Project</th>
                  <th>Total Budget</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                  <th>Contingency</th>
                  <th>Allocated By</th>
                  <th>Actions</th>
        </tr>
      </thead>
      <tbody>
                {budgets.map((budget: any) => (
                  <tr key={budget.id}>
                    <td>{projects.find((p: any) => p.id === budget.project_id)?.title || budget.project_id}</td>
                    <td>{budget.total_budget}</td>
                    <td>{budget.q1_budget}</td>
                    <td>{budget.q2_budget}</td>
                    <td>{budget.q3_budget}</td>
                    <td>{budget.q4_budget}</td>
                    <td>{budget.contingency_budget}</td>
                    <td>{budget.allocated_by}</td>
                    <td>
                      <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(budget)}>Edit</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(budget.id)}>Delete</button>
              </td>
            </tr>
                ))}
      </tbody>
    </table>
          </>
        )}
    <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => openModal()}>Allocate New Budget</button>
        </div>
        <div style={{ marginTop: 8, minHeight: 24 }}>
          {feedbackGlobal && <div className="form-feedback" style={{ color: '#388e3c' }}>{feedbackGlobal}</div>}
        </div>
        <div className="modal-container" style={{ position: 'relative' }}>
          {showModal && (
            <div className="modal-overlay" onClick={() => closeModal(true)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{editingId ? 'Edit Budget' : 'Add Budget'}</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Project
                    <select name="project_id" value={form.project_id} onChange={handleChange} required>
                      <option value="">Select Project</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </label>
                  <label>
                    Total Budget
                    <input name="total_budget" type="number" value={form.total_budget} onChange={handleChange} required />
                  </label>
                  <label>
                    Q1 Budget
                    <input name="q1_budget" type="number" value={form.q1_budget} onChange={handleChange} />
                  </label>
                  <label>
                    Q2 Budget
                    <input name="q2_budget" type="number" value={form.q2_budget} onChange={handleChange} />
                  </label>
                  <label>
                    Q3 Budget
                    <input name="q3_budget" type="number" value={form.q3_budget} onChange={handleChange} />
                  </label>
                  <label>
                    Q4 Budget
                    <input name="q4_budget" type="number" value={form.q4_budget} onChange={handleChange} />
                  </label>
                  <label>
                    Contingency Budget
                    <input name="contingency_budget" type="number" value={form.contingency_budget} onChange={handleChange} />
                  </label>
                  <label>
                    Allocated By (Profile ID)
                    <input name="allocated_by" value={form.allocated_by} readOnly />
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
        .modal-container { position: relative; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal {
          background: #fff; padding: 32px; border-radius: 8px; min-width: 320px; max-width: 480px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          margin: 0 auto;
        }
        .modal label { display: block; margin-bottom: 12px; }
        .modal input, .modal select { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
    </>
  );
};

export default AdminBudgets; 