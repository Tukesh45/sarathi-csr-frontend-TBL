import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

interface ClientMonitoringProps {
  user: any;
}

const ClientMonitoring: React.FC<ClientMonitoringProps> = ({ user }) => {
  const { data: projects = [], loading } = useRealtimeTable('projects', { column: 'client_id', value: user.id });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Project Monitoring</h2>
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">📊</div>
          <div className="mb-2 font-bold">No Projects to Monitor</div>
          <div>Projects assigned to your organization will appear here for monitoring.</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
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
                <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : ''}</td>
                <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientMonitoring; 