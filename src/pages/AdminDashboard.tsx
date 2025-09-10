import React from 'react';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import ScoreCard from '../components/ScoreCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import { useLocation } from 'react-router-dom';

// Simple Pie Chart component for status breakdown
const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {data.map((d, i) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        const endAngle = ((cumulative + d.value) / total) * 2 * Math.PI;
        const x1 = 80 + 70 * Math.cos(startAngle - Math.PI / 2);
        const y1 = 80 + 70 * Math.sin(startAngle - Math.PI / 2);
        const x2 = 80 + 70 * Math.cos(endAngle - Math.PI / 2);
        const y2 = 80 + 70 * Math.sin(endAngle - Math.PI / 2);
        const largeArc = d.value / total > 0.5 ? 1 : 0;
        const pathData = `M80,80 L${x1},${y1} A70,70 0 ${largeArc} 1 ${x2},${y2} Z`;
        cumulative += d.value;
        return <path key={i} d={pathData} fill={d.color} stroke="#fff" strokeWidth={2} />;
      })}
    </svg>
  );
};

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  // Add loading state
  const [loading, setLoading] = React.useState(true);

  // Real-time data hooks (fetch only required columns)
  const { data: projects = [], loading: loadingProjects } = useRealtimeTable('projects', { select: 'id,title,status,priority,ngo_id,client_id,start_date,end_date,geographic_scope,target_beneficiaries' });
  const { data: ngos = [], loading: loadingNGOs } = useRealtimeTable('ngos', { select: 'id,name,registration_number,focus_areas,contact_person,client_id' });
  const { data: clients = [], loading: loadingClients } = useRealtimeTable('clients', { select: 'id,name' });
  const { data: budgets = [], loading: loadingBudgets } = useRealtimeTable('budget_allocations', { select: 'id,project_id,total_budget,spent_amount' });

  React.useEffect(() => {
    setLoading(true);
    // Wait for all loading flags to be false
    if (!loadingProjects && !loadingNGOs && !loadingClients && !loadingBudgets) {
      setLoading(false);
    }
  }, [loadingProjects, loadingNGOs, loadingClients, loadingBudgets, location]);

  // KPI cards
  const totalProjects = projects.length;
  const totalNGOs = ngos.length;
  const totalClients = clients.length;
  const totalBudget = budgets.reduce((sum, b) => sum + (b.total_budget || 0), 0);
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  
  // Calculate realistic targets and metrics
  const targetProjects = Math.max(totalProjects, 1); // At least 1 project target
  const targetNGOs = Math.max(totalNGOs, 1); // At least 1 NGO target
  const targetClients = Math.max(totalClients, 1); // At least 1 client target
  const targetBudget = Math.max(totalBudget, 1000); // At least ₹1000 budget target
  
  // Calculate locations covered from project data
  const locationsCovered = projects.reduce((locations, project) => {
    if (project.geographic_scope) {
      const projectLocations = project.geographic_scope.split(',').map((loc: string) => loc.trim());
      projectLocations.forEach((loc: string) => {
        if (!locations.includes(loc)) {
          locations.push(loc);
        }
      });
    }
    return locations;
  }, [] as string[]).length;
  
  // Calculate lives impacted from project data (target beneficiaries)
  const livesImpacted = projects.reduce((total, project) => {
    return total + (project.target_beneficiaries || 0);
  }, 0);
  
  const targetLocations = Math.max(locationsCovered, 1); // At least 1 location target
  const targetLives = Math.max(livesImpacted, 100); // At least 100 lives target

  // Project status breakdown
  const statusCounts = {
    completed: projects.filter((p: any) => p.status === 'completed').length,
    ongoing: projects.filter((p: any) => p.status === 'ongoing').length,
    delayed: projects.filter((p: any) => p.status === 'delayed').length,
  };
  const statusData = [
    { label: 'Completed', value: statusCounts.completed, color: '#22c55e' },
    { label: 'Ongoing', value: statusCounts.ongoing, color: '#2d9cdb' },
    { label: 'Delayed', value: statusCounts.delayed, color: '#f59e42' },
  ];

  // Aggregate NGO budget and spent
  const ngoBudgetData = ngos.map((ngo: any) => {
    const ngoProjects = projects.filter((p: any) => p.ngo_id === ngo.id);
    const budget = ngoProjects.reduce((sum, p) => {
      const b = budgets.find((bud: any) => bud.project_id === p.id);
      return sum + (b?.total_budget || 0);
    }, 0);
    const spent = ngoProjects.reduce((sum, p) => {
      // Calculate spent amount from budget allocations
      const projectBudgets = budgets.filter((bud: any) => bud.project_id === p.id);
      return sum + projectBudgets.reduce((budgetSum, bud) => budgetSum + (bud.spent_amount || 0), 0);
    }, 0);
    return { name: ngo.name, budget, spent };
  });

  if (loading) {
    // Simple skeleton loader
    return (
      <div style={{ padding: 32 }}>
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 24, background: '#eee', borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, width: 160, background: '#eee', borderRadius: 8 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 320, width: '100%', background: '#eee', borderRadius: 12, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 320, width: '100%', background: '#eee', borderRadius: 12, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 40, width: 300, background: '#eee', borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200, width: '100%', background: '#eee', borderRadius: 8, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 40, width: 300, background: '#eee', borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200, width: '100%', background: '#eee', borderRadius: 8 }} />
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32, marginBottom: 32 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        fontSize: '14px',
        color: '#666',
        border: '1px solid #e9ecef'
      }}>
        <strong>📊 Dashboard Metrics Explained:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li><strong>Lives Impacted:</strong> Total number of beneficiaries targeted across all projects</li>
          <li><strong>Locations Covered:</strong> Unique geographic areas where projects are implemented</li>
          <li><strong>Completed Projects:</strong> Projects with status "completed"</li>
          <li><strong>Budget Utilization:</strong> Shows allocated vs. spent budget per NGO</li>
        </ul>
                </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        <ScoreCard label="Total Clients" value={totalClients} target={targetClients} />
        <ScoreCard label="Total NGOs" value={totalNGOs} target={targetNGOs} />
        <ScoreCard label="Total Projects" value={totalProjects} target={targetProjects} />
        <ScoreCard label="Total Budget" value={totalBudget} target={targetBudget} unit="₹" />
        <ScoreCard label="Completed Projects" value={completedProjects} target={targetProjects || 1} />
        <ScoreCard label="Locations Covered" value={locationsCovered} target={targetLocations} />
        <ScoreCard label="Lives Impacted" value={livesImpacted} target={targetLives} />
                </div>
      {/* Charts Row: Aligned and Equal Height */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 320 }}>
          <h3 style={{ marginBottom: 16 }}>Project Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <PieChart data={statusData} />
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {statusData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, background: d.color, display: 'inline-block', borderRadius: 4 }}></span>
                  <span>{d.label}: {d.value}</span>
                </div>
                    ))}
                  </div>
                </div>
        </div>
        <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 320 }}>
          <h3 style={{ marginBottom: 16 }}>NGO-wise Budget vs. Spent</h3>
          <ResponsiveContainer width="100%" height={Math.max(ngoBudgetData.length * 50, 220)}>
            <BarChart
              layout="vertical"
              data={ngoBudgetData}
              margin={{ top: 16, right: 32, left: 0, bottom: 16 }}
              barCategoryGap={20}
            >
              <XAxis type="number" tickFormatter={v => `₹${v}`} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={v => `₹${v}`} />
              <Legend />
              <Bar dataKey="budget" fill="#b2f2bb" name="Budget">
                <LabelList dataKey="budget" position="right" formatter={v => `₹${v}`} />
              </Bar>
              <Bar dataKey="spent" fill="#219653" name="Spent">
                <LabelList dataKey="spent" position="right" formatter={v => `₹${v}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <h3 style={{ marginTop: 32 }}>All Projects</h3>
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
          </tr>
                    </thead>
                    <tbody>
          {projects.map((project: any) => (
            <tr key={project.id}>
              <td>{project.title}</td>
              <td>{project.status}</td>
              <td>{project.priority}</td>
              <td>{ngos.find((n: any) => n.id === project.ngo_id)?.name || project.ngo_id}</td>
              <td>{project.client_id}</td>
              <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</td>
              <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
      <h3 style={{ marginTop: 32 }}>All NGOs</h3>
                  <table className="table">
                    <thead>
          <tr>
            <th>Name</th>
            <th>Registration #</th>
            <th>Focus Areas</th>
            <th>Contact Person</th>
            <th>Client</th>
          </tr>
                    </thead>
                    <tbody>
          {ngos.map((ngo: any) => (
            <tr key={ngo.id}>
              <td>{ngo.name}</td>
              <td>{ngo.registration_number}</td>
              <td>{Array.isArray(ngo.focus_areas) ? ngo.focus_areas.join(', ') : ngo.focus_areas}</td>
              <td>{ngo.contact_person}</td>
              <td>{ngo.client_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
    </div>
  );
};

export default AdminDashboard; 