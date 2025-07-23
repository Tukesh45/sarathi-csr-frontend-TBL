import React, { useState } from 'react';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';
import DocumentPreview from '../components/DocumentPreview';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface NGODashboardProps {
  user: any;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { data: projects = [] } = useRealtimeTable('projects', { column: 'ngo_id', value: user.id });
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: targets = [] } = useRealtimeTable('targets');
  const { data: progressUpdates = [] } = useRealtimeTable('progress_updates', { column: 'ngo_id', value: user.id });
  const { data: files = [] } = useRealtimeTable('documents', { column: 'ngo_id', value: user.id });

  const [showModal, setShowModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<any>(null);
  const [form, setForm] = useState({
    actual_value: '',
    notes: '',
    evidence_upload: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState('');

  // Prepare chart data
  const chartData = projects.map((p) => ({
    name: p.title,
    value: Math.floor(Math.random() * 100), // Simulate progress %
    target: 100,
  }));

  // Helper: Get all targets for this NGO's projects
  const myTargets = targets.filter(t => projects.some(p => p.id === t.project_id));

  // Helper: Get progress update for a target
  const getProgressUpdate = (targetId: string) => progressUpdates.find(pu => pu.target_id === targetId);

  const openModal = (target: any) => {
    const progress = getProgressUpdate(target.id);
    setModalTarget(target);
    setForm({
      actual_value: progress?.actual_value || '',
      notes: progress?.notes || '',
      evidence_upload: progress?.evidence_upload || '',
    });
    setEditingId(progress?.id || null);
    setShowModal(true);
    setFeedback('');
  };

  const closeModal = (cancelled = false) => {
    setShowModal(false);
    setModalTarget(null);
    setForm({ actual_value: '', notes: '', evidence_upload: '' });
    setEditingId(null);
    setFeedback('');
    if (cancelled) {
      setGlobalFeedback('Cancelled');
      setTimeout(() => setGlobalFeedback(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.actual_value) {
      setFeedback('Actual value is required.');
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase.from('progress_updates').update({
          actual_value: Number(form.actual_value),
          notes: form.notes,
          evidence_upload: form.evidence_upload,
        }).eq('id', editingId);
        if (error) throw error;
        setFeedback('Progress updated successfully!');
        setGlobalFeedback('Progress updated successfully!');
      } else {
        const { error } = await supabase.from('progress_updates').insert([{
          target_id: modalTarget.id,
          ngo_id: user.id,
          quarter: modalTarget.quarter,
          actual_value: Number(form.actual_value),
          notes: form.notes,
          evidence_upload: form.evidence_upload,
        }]);
        if (error) throw error;
        setFeedback('Progress added successfully!');
        setGlobalFeedback('Progress added successfully!');
      }
      setTimeout(() => {
        closeModal();
        setGlobalFeedback('');
      }, 1000);
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  // Projects Table grouped by client
  const renderProjectsByClient = () => {
    // Get all client IDs for this NGO's projects
    const clientIds = Array.from(new Set(projects.map((p: any) => p.client_id)));
    if (clientIds.length === 0) return <div>No projects found for your NGO.</div>;
    return (
      <div>
        {clientIds.map((clientId: string) => {
          const client = clients.find((c: any) => c.id === clientId);
          const clientProjects = projects.filter((p: any) => p.client_id === clientId);
          if (clientProjects.length === 0) return null;
          return (
            <div key={clientId} style={{ marginBottom: 32 }}>
              <h3 style={{ marginBottom: 12 }}>{client?.company_name || clientId}</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Goal</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {clientProjects.map((project: any) => (
                    <tr key={project.id}>
                      <td>{project.title}</td>
                      <td>{project.status}</td>
                      <td>{project.goal}</td>
                      <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</td>
                      <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // Metrics Table
  const renderMetrics = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Metric Name</th>
          <th>Target Value</th>
          <th>Unit</th>
          <th>Baseline</th>
          <th>Frequency</th>
        </tr>
      </thead>
      <tbody>
        {targets.map((metric: any) => (
          <tr key={metric.id}>
            <td>{projects.find((p: any) => p.id === metric.project_id)?.title || metric.project_id}</td>
            <td>{metric.metric_name}</td>
            <td>{metric.target_value}</td>
            <td>{metric.unit}</td>
            <td>{metric.baseline_value}</td>
            <td>{metric.measurement_frequency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Progress Table
  const renderProgress = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Metric</th>
          <th>Quarter</th>
          <th>Year</th>
          <th>Achieved</th>
          <th>% Complete</th>
          <th>Notes</th>
          <th>Challenges</th>
          <th>Reported By</th>
          <th>Verified By</th>
          <th>Verification Date</th>
        </tr>
      </thead>
      <tbody>
        {progressUpdates.map((progress: any) => (
          <tr key={progress.id}>
            <td>{projects.find((p: any) => p.id === progress.project_id)?.title || progress.project_id}</td>
            <td>{targets.find((m: any) => m.id === progress.metric_id)?.metric_name || progress.metric_id}</td>
            <td>{progress.quarter}</td>
            <td>{progress.year}</td>
            <td>{progress.achieved_value}</td>
            <td>{progress.percentage_complete}</td>
            <td>{progress.notes}</td>
            <td>{progress.challenges}</td>
            <td>{progress.reported_by}</td>
            <td>{progress.verified_by}</td>
            <td>{progress.verification_date ? new Date(progress.verification_date).toLocaleDateString() : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="card">
      <h2>NGO Dashboard</h2>
      {/* Onboarding tip */}
      {projects.length === 0 && (
        <div className="empty-state mb-4">
          <div className="empty-state-illustration">📝</div>
          <div className="mb-2 font-bold">Welcome to your NGO Dashboard!</div>
          <div>Start by filling out your first project. Your progress and analytics will appear here.</div>
        </div>
      )}
      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 32,
        margin: '2em 0 2.5em 0',
      }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{projects.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>My Projects</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{projects.filter(p => p.status === 'active').length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Active Projects</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>₹{projects.reduce((sum, p) => sum + (p.total_budget || 0), 0).toLocaleString()}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Total Budget</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{files.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Documents</div>
        </div>
      </div>
      {/* Analytics Chart */}
      <AnalyticsChart data={chartData} title="Project Progress Overview" />
      {/* Targets and Progress Updates Table */}
      <div className="card" style={{ marginTop: 32 }}>
        <div className="card-body">
          <h3 className="mb-3">My Quarterly Targets & Progress</h3>
          {renderProgress()}
        </div>
      </div>
      {/* Add Activity Feed and Document Preview as new cards at the end */}
      <div className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
        <h2>Activity Feed</h2>
        <ActivityFeed />
      </div>
      <div className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
        <h2>Document Uploads & Preview</h2>
        {files.length > 0 ? (
          files.map((doc) => (
            <DocumentPreview key={doc.id} fileUrl={doc.file_url} fileType={doc.file_type} fileName={doc.file_name} />
          ))
        ) : (
          <div>No documents uploaded yet.</div>
        )}
      </div>
      {/* Progress Update Modal */}
      <div className="modal-container" style={{ position: 'relative' }}>
        {showModal && (
          <div className="modal-overlay" onClick={() => closeModal(true)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{editingId ? 'Update Progress' : 'Add Progress'}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Actual Value
                  <input name="actual_value" type="number" value={form.actual_value} onChange={handleChange} required />
                </label>
                <label>
                  Notes
                  <textarea name="notes" value={form.notes} onChange={handleChange} />
                </label>
                <label>
                  Evidence Upload (URL)
                  <input name="evidence_upload" value={form.evidence_upload} onChange={handleChange} />
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
        .modal input, .modal select, .modal textarea { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
    </div>
  );
};

export default NGODashboard; 