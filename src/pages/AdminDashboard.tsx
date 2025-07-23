import React from 'react';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import ScoreCard from '../components/ScoreCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

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
  // Real-time data hooks
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: budgets = [] } = useRealtimeTable('budget_allocations');

  // KPI cards
  const totalProjects = projects.length;
  const totalNGOs = ngos.length;
  const totalClients = clients.length;
  const totalBudget = budgets.reduce((sum, b) => sum + (b.total_budget || 0), 0);
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const locationsCovered = 11; // Placeholder/mock
  const livesImpacted = 48920; // Placeholder/mock

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
      // If you have expenditures table, sum actual spent here; else use 0 as placeholder
      return sum + (p.actual_spent || 0);
    }, 0);
    return { name: ngo.name, budget, spent };
  });

  return (
    <div className="card" style={{ padding: 32, marginBottom: 32 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        <ScoreCard label="Total Clients" value={totalClients} target={1} />
        <ScoreCard label="Total NGOs" value={totalNGOs} target={1} />
        <ScoreCard label="Total Projects" value={totalProjects} target={1} />
        <ScoreCard label="Total Budget" value={totalBudget} target={1} unit="₹" />
        <ScoreCard label="Completed Projects" value={completedProjects} target={totalProjects || 1} />
        <ScoreCard label="Locations Covered" value={locationsCovered} target={1} />
        <ScoreCard label="Lives Impacted" value={livesImpacted} target={1} />
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