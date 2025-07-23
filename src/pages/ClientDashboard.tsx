import React from 'react';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';
import DocumentPreview from '../components/DocumentPreview';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { useNavigate } from 'react-router-dom';

interface ClientDashboardProps {
  user: any;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: targets = [] } = useRealtimeTable('targets');
  const { data: progressUpdates = [] } = useRealtimeTable('progress_updates');
  const { data: files = [] } = useRealtimeTable('documents');

  // Only show projects for this client
  const myProjects = projects.filter((p: any) => p.client_id === user.id);

  // Prepare chart data
  const chartData = myProjects.map((p) => ({
    name: p.title,
    value: Math.floor(Math.random() * 100), // Simulate progress %
    target: 100,
  }));

  return (
    <div className="card" style={{ width: '100%', margin: 0, maxWidth: 'none' }}>
      <h2>Client Dashboard</h2>
      {/* Welcome message in NGO style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>📊</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Welcome to your Client Dashboard!</div>
          <div style={{ color: 'var(--muted)' }}>Once NGOs start reporting progress, you’ll see analytics and project data here.</div>
        </div>
      </div>
      {/* KPI Cards Grid - same as NGO style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 32,
        margin: '2em 0 2.5em 0',
      }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{ngos.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Funded NGOs</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{myProjects.filter((p: any) => p.status === 'active').length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Active Projects</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>₹{myProjects.reduce((sum: number, p: any) => sum + (p.total_budget || 0), 0).toLocaleString()}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Total Allocated</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{files.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Documents</div>
        </div>
      </div>
      {/* Analytics Chart */}
      <AnalyticsChart data={chartData} title="Project Progress Overview" />
      {/* Projects, Targets, and Progress Table */}
      <div className="card" style={{ marginTop: 32 }}>
        <div className="card-body">
          <h3 className="mb-3">My Projects, Targets & Progress</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>NGO</th>
                <th>Quarter</th>
                <th>Metric</th>
                <th>Target Value</th>
                <th>Actual Value</th>
                <th>Notes</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {myProjects.map((project: any) => {
                const ngo = ngos.find((n: any) => n.id === project.ngo_id);
                const projectTargets = targets.filter((t: any) => t.project_id === project.id);
                return projectTargets.map((target: any) => {
                  const progress = progressUpdates.find((pu: any) => pu.target_id === target.id);
                  return (
                    <tr key={target.id}>
                      <td>{project.title}</td>
                      <td>{ngo?.name || project.ngo_id}</td>
                      <td>{target.quarter}</td>
                      <td>{target.metric}</td>
                      <td>{target.value}</td>
                      <td>{progress?.actual_value ?? '-'}</td>
                      <td>{progress?.notes ?? '-'}</td>
                      <td>{progress?.evidence_upload ? <a href={progress.evidence_upload} target="_blank" rel="noopener noreferrer">View</a> : '-'}</td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
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
    </div>
  );
};

export default ClientDashboard; 