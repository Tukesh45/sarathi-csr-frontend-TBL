import React, { useState } from 'react';
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
  
  // Filter all data by the logged-in client user's ID
  const { data: projects = [] } = useRealtimeTable('projects', { column: 'client_id', value: user.id });
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: targets = [] } = useRealtimeTable('targets');
  const { data: progressUpdates = [] } = useRealtimeTable('progress_updates');
  const { data: files = [] } = useRealtimeTable('documents', { column: 'client_id', value: user.id });
  const { data: budgets = [] } = useRealtimeTable('budget_allocations');

  // Filter state
  const [filters, setFilters] = useState({
    selectedNGO: '',
    selectedQuarter: '',
    selectedProject: '',
    selectedStatus: ''
  });

  // Filter data for this client's projects
  const myTargets = targets.filter((t: any) => projects.some((p: any) => p.id === t.project_id));
  const myProgressUpdates = progressUpdates.filter((pu: any) => 
    myTargets.some((t: any) => t.id === pu.target_id)
  );
  const myBudgets = budgets.filter((budget: any) => 
    projects.some((project: any) => project.id === budget.project_id)
  );

  // Get unique NGOs working with this client
  const myNGOs = ngos.filter((ngo: any) => 
    projects.some((project: any) => project.ngo_id === ngo.id)
  );

  // Apply filters to projects
  const filteredProjects = projects.filter((project: any) => {
    if (filters.selectedNGO && project.ngo_id !== filters.selectedNGO) return false;
    if (filters.selectedProject && project.id !== filters.selectedProject) return false;
    if (filters.selectedStatus && project.status !== filters.selectedStatus) return false;
    return true;
  });

  // Apply filters to targets and progress
  const filteredTargets = myTargets.filter((target: any) => {
    if (filters.selectedQuarter && target.quarter !== filters.selectedQuarter) return false;
    if (filters.selectedProject && target.project_id !== filters.selectedProject) return false;
    return true;
  });

  // Get unique quarters and statuses for filters
  const availableQuarters = Array.from(new Set(myTargets.map((t: any) => t.quarter)));
  const availableStatuses = Array.from(new Set(projects.map((p: any) => p.status)));

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      selectedNGO: '',
      selectedQuarter: '',
      selectedProject: '',
      selectedStatus: ''
    });
  };

  // Prepare chart data based on actual project progress
  const chartData = filteredProjects.map((p) => {
    const projectTargets = targets.filter((t: any) => t.project_id === p.id);
    const projectProgress = progressUpdates.filter((pu: any) => 
      projectTargets.some((t: any) => t.id === pu.target_id)
    );
    
    // Calculate actual progress percentage
    let progressPercentage = 0;
    if (projectTargets.length > 0 && projectProgress.length > 0) {
      const totalTarget = projectTargets.reduce((sum: number, t: any) => sum + (t.target_value || 0), 0);
      const totalAchieved = projectProgress.reduce((sum: number, pu: any) => sum + (pu.actual_value || 0), 0);
      progressPercentage = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
    }
    
    return {
    name: p.title,
      value: progressPercentage,
    target: 100,
    };
  });

  return (
    <div className="card" style={{ width: '100%', margin: 0, maxWidth: 'none' }}>
      <h2>Client Dashboard</h2>
      
      {/* Welcome message with client info */}
      <div style={{ 
        background: '#f0f9ff', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        border: '1px solid #0ea5e9',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>👤</span>
    <div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#0c4a6e' }}>
            Welcome, {user.email}!
          </div>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>
            You are logged in as a Client user. You can monitor your projects, track progress, and view documents from your NGO partners.
          </div>
        </div>
      </div>
      
      {/* Welcome message in NGO style */}
      {projects.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>📊</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Welcome to your Client Dashboard!</div>
            <div style={{ color: 'var(--muted)' }}>Once NGOs start reporting progress, you'll see analytics and project data here.</div>
          </div>
        </div>
      )}
      {/* KPI Cards Grid - same as NGO style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 32,
        margin: '2em 0 2.5em 0',
      }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{myNGOs.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Funded NGOs</div>
          </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{projects.filter((p: any) => p.status === 'active').length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Active Projects</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>₹{myBudgets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0).toLocaleString()}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Total Allocated</div>
          </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{files.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Documents</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{myTargets.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Targets</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em 1em', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{myProgressUpdates.length}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Progress Updates</div>
        </div>
      </div>
      {/* Analytics Chart */}
      <AnalyticsChart data={chartData} title="Project Progress Overview" />
      
      {/* Filter Section */}
      <div className="card" style={{ marginTop: 32 }}>
        <div className="card-body">
          <h3 className="mb-3">Filter Progress Data</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16, 
            marginBottom: 16 
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Filter by NGO</label>
              <select 
                value={filters.selectedNGO} 
                onChange={(e) => handleFilterChange('selectedNGO', e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">All NGOs</option>
                {myNGOs.map((ngo: any) => (
                  <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                ))}
              </select>
                    </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Filter by Quarter</label>
              <select 
                value={filters.selectedQuarter} 
                onChange={(e) => handleFilterChange('selectedQuarter', e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">All Quarters</option>
                {availableQuarters.map((quarter: string) => (
                  <option key={quarter} value={quarter}>{quarter}</option>
                ))}
              </select>
                  </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Filter by Project</label>
              <select 
                value={filters.selectedProject} 
                onChange={(e) => handleFilterChange('selectedProject', e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">All Projects</option>
                {filteredProjects.map((project: any) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Filter by Status</label>
              <select 
                value={filters.selectedStatus} 
                onChange={(e) => handleFilterChange('selectedStatus', e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">All Statuses</option>
                {availableStatuses.map((status: string) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
                  </div>
                  </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Clear All Filters
            </button>
            <span style={{ color: '#666', fontSize: '14px' }}>
              Showing {filteredTargets.length} targets from {filteredProjects.length} projects
            </span>
                  </div>
                </div>
              </div>
      
      {/* Projects, Targets, and Progress Table */}
      <div className="card" style={{ marginTop: 32 }}>
        <div className="card-body">
          <h3 className="mb-3">My Projects, Targets & Progress</h3>
          {filteredTargets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-illustration">📊</div>
              <div className="mb-2 font-bold">No Data Found</div>
              <div>Try adjusting your filters or check if there's data available.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>NGO</th>
                  <th>Quarter</th>
                  <th>Metric</th>
                  <th>Target Value</th>
                  <th>Actual Value</th>
                  <th>Progress %</th>
                  <th>Notes</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((target: any) => {
                  const project = projects.find((p: any) => p.id === target.project_id);
                  const ngo = ngos.find((n: any) => n.id === project?.ngo_id);
                  const progress = progressUpdates.find((pu: any) => pu.target_id === target.id);
                  const progressPercentage = target.value > 0 && progress?.actual_value 
                    ? Math.round((progress.actual_value / target.value) * 100) 
                    : 0;
                  
                  return (
                    <tr key={target.id}>
                      <td>{project?.title || 'Unknown Project'}</td>
                      <td>{ngo?.name || 'Unknown NGO'}</td>
                      <td>{target.quarter}</td>
                      <td>{target.metric}</td>
                      <td>{target.value}</td>
                      <td>{progress?.actual_value ?? '-'}</td>
                      <td>
                        <span style={{ 
                          color: progressPercentage >= 100 ? '#22c55e' : 
                                 progressPercentage >= 80 ? '#f59e0b' : '#ef4444',
                          fontWeight: 600
                        }}>
                          {progressPercentage}%
                        </span>
                      </td>
                      <td>{progress?.notes ?? '-'}</td>
                      <td>{progress?.evidence_upload ? <a href={progress.evidence_upload} target="_blank" rel="noopener noreferrer">View</a> : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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