import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

// TODO: Replace with actual NGO user ID from context or props
const CURRENT_NGO_ID = 'CURRENT_NGO_ID';

const NGOProgress: React.FC = () => {
  const { data: progress = [], loading } = useRealtimeTable('quarterly_progress', { column: 'ngo_id', value: CURRENT_NGO_ID });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Quarterly Progress</h2>
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
          {progress.map((row: any) => (
            <tr key={row.id}>
              <td>{row.project_id}</td>
              <td>{row.metric_id}</td>
              <td>{row.quarter}</td>
              <td>{row.year}</td>
              <td>{row.achieved_value}</td>
              <td>{row.percentage_complete}</td>
              <td>{row.notes}</td>
              <td>{row.challenges}</td>
              <td>{row.reported_by}</td>
              <td>{row.verified_by}</td>
              <td>{row.verification_date ? new Date(row.verification_date).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NGOProgress; 