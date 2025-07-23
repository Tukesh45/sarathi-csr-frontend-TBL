import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import AnalyticsChart from '../../components/AnalyticsChart';

const AdminReports: React.FC = () => {
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: budgets = [] } = useRealtimeTable('budget_allocations');
  const { data: progress = [] } = useRealtimeTable('quarterly_progress');

  // Generate analytics data
  const projectStatusData = projects.reduce((acc: any[], project: any) => {
    const status = project.status || 'Unknown';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: status, value: 1, target: 0 });
    }
    return acc;
  }, []);

  const budgetUtilizationData = budgets.map((budget: any) => ({
    name: budget.project_name || 'Unknown Project',
    value: budget.spent_amount || 0,
    target: budget.allocated_amount || 0
  }));

  const progressData = progress.map((prog: any) => ({
    name: prog.project_name || 'Unknown Project',
    value: prog.achievement_percentage || 0,
    target: 100
  }));

  return (
    <div className="card">
      <h2>Reports</h2>
      <div className="table-container">
        <h3>Project Status</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {projectStatusData.map((item: any) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td>{item.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Budget Utilization</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Spent Amount</th>
              <th>Allocated Amount</th>
            </tr>
          </thead>
          <tbody>
            {budgetUtilizationData.map((item: any) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td>{item.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Quarterly Progress</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Achievement Percentage</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((item: any) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.value}%</td>
                <td>{item.target}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports; 