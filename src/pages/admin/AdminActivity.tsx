import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminActivity: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: logs = [], loading } = useRealtimeTable('activity_logs');

  if (loading) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading activity log...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Remove the header with Logout button and user email. */}
      <div className="card">
        <h2>Activity Log</h2>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record ID</th>
              <th>Old Values</th>
              <th>New Values</th>
              <th>IP Address</th>
              <th>User Agent</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td>{log.user_id}</td>
                <td>{log.action}</td>
                <td>{log.table_name}</td>
                <td>{log.record_id}</td>
                <td><pre style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.old_values, null, 2)}</pre></td>
                <td><pre style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.new_values, null, 2)}</pre></td>
                <td>{log.ip_address}</td>
                <td>{log.user_agent}</td>
                <td>{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminActivity; 