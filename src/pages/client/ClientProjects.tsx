import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

// TODO: Replace with actual client user ID from context or props
const CURRENT_CLIENT_ID = 'CURRENT_CLIENT_ID';

const ClientProjects: React.FC = () => {
  const { data: projects = [], loading } = useRealtimeTable('projects', { column: 'client_id', value: CURRENT_CLIENT_ID });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>My Projects</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Goal</th>
            <th>Geographic Scope</th>
            <th>Unit</th>
            <th>Beneficiaries</th>
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
              <td>{project.goal}</td>
              <td>{project.geographic_scope}</td>
              <td>{project.unit_of_measurement}</td>
              <td>{project.target_beneficiaries}</td>
              <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</td>
              <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientProjects; 