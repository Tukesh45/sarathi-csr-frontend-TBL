import React, { useMemo } from 'react';
import ScoreCard from '../components/ScoreCard';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';
import DocumentPreview from '../components/DocumentPreview';
import { useRealtimeTable } from '../hooks/useRealtimeTable';

const sections = [
  { key: 'landing', label: 'Landing Page (Navigation/Welcome)' },
  { key: 'csr-applicability', label: 'CSR Applicability Details' },
  { key: 'project-details', label: 'Project Details' },
  { key: 'macro-dashboard', label: 'Macro CSR Dashboard' },
  { key: 'csr-spent', label: 'CSR Spent per Company' },
  { key: 'project-money', label: 'Project wise money spent' },
  { key: 'projects', label: 'Projects' },
  { key: 'scorecard', label: 'CSR Scorecard' },
  { key: 'end', label: 'End/Logout' },
];

const AdminDashboard: React.FC = () => {
  // Real-time data hooks
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: budgets = [] } = useRealtimeTable('budget_allocations');
  const { data: progress = [] } = useRealtimeTable('quarterly_progress');
  const { data: expenditures = [] } = useRealtimeTable('expenditures');
  const { data: documents = [] } = useRealtimeTable('documents');
  const { data: activityLogs = [] } = useRealtimeTable('activity_logs');

  // Create refs for each section at the top level using useMemo and createRef
  const sectionRefs = useMemo(
    () => sections.map(() => React.createRef<HTMLDivElement>()),
    []
  );

  // Example: Scorecard metrics from progress table
  const scorecardMetrics = progress.slice(0, 8).map((p) => ({
    label: p.kpi_name,
    value: p.current_value,
    target: p.target_value,
  }));

  // Example: Companies from projects table (group by admin_id or similar)
  const companies = projects.map((p) => ({
    name: p.title,
    spent: expenditures.filter(e => e.project_id === p.id).reduce((sum, e) => sum + (e.amount || 0), 0),
  }));

  // Example: Project money spent
  const projectMoney = projects.map((p) => ({
    name: p.title,
    spent: expenditures.filter(e => e.project_id === p.id).reduce((sum, e) => sum + (e.amount || 0), 0),
    budget: budgets.filter(b => b.project_id === p.id).reduce((sum, b) => sum + (b.q1 || 0) + (b.q2 || 0) + (b.q3 || 0) + (b.q4 || 0), 0),
  }));

  // Scroll to section
  const scrollToSection = (index: number) => {
    const ref = sectionRefs[index];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="dashboard-unified" style={{ display: 'flex' }}>
      {/* Sidebar Navigation */}
      <nav style={{ minWidth: 220, marginRight: 32 }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sections.map((s, idx) => (
            <li key={s.key} style={{ marginBottom: 8 }}>
              <button
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => scrollToSection(idx)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Render each section with its ref */}
        {sections.map((s, idx) => {
          switch (s.key) {
            case 'landing':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>Welcome to the CSR Admin Dashboard</h2>
                  <p>Use the navigation to jump to any section. All your CSR management tools are here in one place.</p>
                </div>
              );
            case 'csr-applicability':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>CSR Applicability Calculator</h2>
                  <p>Enter your company details to check CSR applicability (demo):</p>
                  <form style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <input type="number" placeholder="Net Profit (INR)" style={{ padding: 8 }} />
                    <input type="number" placeholder="Turnover (INR)" style={{ padding: 8 }} />
                    <input type="number" placeholder="Net Worth (INR)" style={{ padding: 8 }} />
                    <button type="button" className="btn btn-primary">Check</button>
                  </form>
                  <div style={{ marginTop: 16, color: '#22c55e' }}>CSR is applicable if any value exceeds the threshold.</div>
                </div>
              );
            case 'project-details':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>Project Details</h2>
                  <table className="table">
                    <thead>
                      <tr><th>Project</th><th>Status</th><th>Budget</th></tr>
                    </thead>
                    <tbody>
                      {projectMoney.map(p => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>{p.spent >= p.budget ? 'Completed' : 'Active'}</td>
                          <td>₹{p.budget.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case 'macro-dashboard':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>Macro CSR Dashboard</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                    {scorecardMetrics.map((m, i) => (
                      <ScoreCard key={i} label={m.label} value={m.value} target={m.target} />
                    ))}
                  </div>
                </div>
              );
            case 'csr-spent':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>CSR Spent per Company</h2>
                  <table className="table">
                    <thead>
                      <tr><th>Company</th><th>CSR Spent (INR)</th></tr>
                    </thead>
                    <tbody>
                      {companies.map(c => (
                        <tr key={c.name}>
                          <td>{c.name}</td>
                          <td>₹{c.spent.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case 'project-money':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>Project Wise Money Spent</h2>
                  <table className="table">
                    <thead>
                      <tr><th>Project</th><th>Spent</th><th>Budget</th></tr>
                    </thead>
                    <tbody>
                      {projectMoney.map(p => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>₹{p.spent.toLocaleString()}</td>
                          <td>₹{p.budget.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case 'projects':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>Projects</h2>
                  <ul>
                    {projects.map(p => (
                      <li key={p.id}>{p.title} - Budget: ₹{projectMoney.find(pm => pm.name === p.title)?.budget?.toLocaleString() || 0}</li>
                    ))}
                  </ul>
                </div>
              );
            case 'scorecard':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
                  <h2>CSR Scorecard</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                    {scorecardMetrics.map((m, i) => (
                      <ScoreCard key={i} label={m.label} value={m.value} target={m.target} editable={true} />
                    ))}
                  </div>
                </div>
              );
            case 'end':
              return (
                <div ref={sectionRefs[idx]} key={s.key} className="card mb-5" style={{ padding: 32, marginBottom: 32, textAlign: 'center' }}>
                  <h2>Thank you for using the CSR Platform!</h2>
                  <button className="btn btn-danger" onClick={() => window.location.href = '/login'}>Logout</button>
                </div>
              );
            default:
              return null;
          }
        })}
        {/* Add onboarding tip at the top if no projects or companies */}
        {projects.length === 0 && (
          <div className="empty-state mb-4">
            <div className="empty-state-illustration">🚀</div>
            <div className="mb-2 font-bold">Welcome to your Admin Dashboard!</div>
            <div>Start by adding a new project or company to see analytics and activity here.</div>
          </div>
        )}
        {/* Add Activity Feed and Document Preview as new cards at the end */}
        <div className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
          <h2>Activity Feed</h2>
          <ActivityFeed />
        </div>
        <div className="card mb-5" style={{ padding: 32, marginBottom: 32 }}>
          <h2>Document Uploads & Preview</h2>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentPreview key={doc.id} fileUrl={doc.file_url} fileType={doc.file_type} fileName={doc.file_name} />
            ))
          ) : (
            <div>No documents uploaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 