import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminBudgets: React.FC = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    
    // Data fetching
    const { data: budgets = [], loading } = useRealtimeTable('budget_allocations');
    const { data: projects = [] } = useRealtimeTable('projects');
    const { data: users = [] } = useRealtimeTable('profiles'); // Assuming you have a 'profiles' table for user info

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

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserEmail(user?.email || 'Admin');
            // Set allocated_by to the user's id if available
            if (user?.id) {
                setForm(f => ({ ...f, allocated_by: user.id }));
            }
        };
        fetchUser();
    }, []);

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
                allocated_by: budget.allocated_by || form.allocated_by, // Keep current user if not set
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
                allocated_by: form.allocated_by, // Keep the logged-in user's ID
            });
            setEditingId(null);
        }
        setShowModal(true);
        setFeedback('');
    };

    const closeModal = (cancelled = false) => {
        setShowModal(false);
        setEditingId(null);
        setFeedback('');
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
            const payload = {
                ...form,
                total_budget: form.total_budget ? Number(form.total_budget) : null,
                q1_budget: form.q1_budget ? Number(form.q1_budget) : 0,
                q2_budget: form.q2_budget ? Number(form.q2_budget) : 0,
                q3_budget: form.q3_budget ? Number(form.q3_budget) : 0,
                q4_budget: form.q4_budget ? Number(form.q4_budget) : 0,
                contingency_budget: form.contingency_budget ? Number(form.contingency_budget) : 0,
            };

            if (editingId) {
                const { error } = await supabase.from('budget_allocations').update(payload).eq('id', editingId);
                if (error) throw error;
                setFeedbackGlobal('Budget updated successfully!');
            } else {
                const { error } = await supabase.from('budget_allocations').insert([payload]);
                if (error) throw error;
                setFeedbackGlobal('Budget allocated successfully!');
            }
            setTimeout(() => {
                closeModal();
                setFeedbackGlobal('');
            }, 1000);
        } catch (err: any) {
            setFeedback(err.message || 'Error occurred.');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this budget allocation?')) return;
        await supabase.from('budget_allocations').delete().eq('id', id);
    };

    const getUserName = (userId: string) => {
        const user = users.find((u: any) => u.id === userId);
        return user?.full_name || user?.email || 'Admin'; // Fallback to email or 'Admin'
    };

    if (loading) {
        return <div className="card" style={{ padding: 32 }}>...Loading</div>;
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Budget Allocations</h2>
            </div>
            {budgets.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-illustration">💰</div>
                    <div className="mb-2 font-bold">No Budgets Yet</div>
                    <div>Start by allocating your first budget!</div>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Total Budget</th>
                            <th>Quarterly Split (Q1-Q4)</th>
                            <th>Contingency</th>
                            <th>Allocated By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map((budget: any) => (
                            <tr key={budget.id}>
                                <td>{projects.find((p: any) => p.id === budget.project_id)?.title || 'Unknown Project'}</td>
                                <td>₹{Number(budget.total_budget).toLocaleString()}</td>
                                <td>
                                    <div className="quarter-split">
                                        <span>₹{Number(budget.q1_budget).toLocaleString()}</span>
                                        <span>₹{Number(budget.q2_budget).toLocaleString()}</span>
                                        <span>₹{Number(budget.q3_budget).toLocaleString()}</span>
                                        <span>₹{Number(budget.q4_budget).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td>₹{Number(budget.contingency_budget).toLocaleString()}</td>
                                <td>{getUserName(budget.allocated_by)}</td>
                                <td>
                                    <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(budget)}>Edit</button>
                                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(budget.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: 24 }}>
                <button className="btn btn-primary" onClick={() => openModal()}>Allocate New Budget</button>
            </div>
            
            {showModal && (
                <div className="modal-overlay" onClick={() => closeModal(true)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingId ? 'Edit Budget Allocation' : 'Allocate New Budget'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Project*</label>
                                    <select name="project_id" value={form.project_id} onChange={handleChange} required>
                                        <option value="" disabled>Select a Project</option>
                                        {projects.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Total Budget (₹)*</label>
                                    <input name="total_budget" type="number" value={form.total_budget} onChange={handleChange} required placeholder="e.g., 500000" />
                                </div>
                                <div className="form-group">
                                    <label>Q1 Budget (₹)</label>
                                    <input name="q1_budget" type="number" value={form.q1_budget} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Q2 Budget (₹)</label>
                                    <input name="q2_budget" type="number" value={form.q2_budget} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Q3 Budget (₹)</label>
                                    <input name="q3_budget" type="number" value={form.q3_budget} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Q4 Budget (₹)</label>
                                    <input name="q4_budget" type="number" value={form.q4_budget} onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Contingency Budget (₹)</label>
                                    <input name="contingency_budget" type="number" value={form.contingency_budget} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)}>Cancel</button>
                                <button className="btn btn-success" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingId ? 'Update Budget' : 'Allocate Budget')}
                                </button>
                            </div>
                            {feedback && <div className="form-feedback">{feedback}</div>}
                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                /* --- Table Styles --- */
                .table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .table th, .table td { padding: 12px 16px; vertical-align: top; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .quarter-split { display: flex; gap: 16px; font-size: 12px; color: #6b7280; }

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

export default AdminBudgets;