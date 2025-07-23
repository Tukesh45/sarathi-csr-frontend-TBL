import React, { useState } from 'react';
import { useRealtimeTable } from '../hooks/useRealtimeTable';

const ActivityFeed: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const { data: activities = [], loading } = useRealtimeTable('activity_logs');

  if (loading) {
    return (
      <div className="card p-4">
        <div className="loading-spinner">Loading activity feed...</div>
      </div>
    );
  }

  const filtered = filter === 'all' 
    ? activities 
    : activities.filter((activity: any) => {
        const userRole = activity.user_role || 'Unknown';
        return userRole.toLowerCase() === filter.toLowerCase();
      });

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="mb-0">Live Activity Feed</h3>
        <select className="form-control" style={{ width: 120 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="ngo">NGO</option>
          <option value="client">Client</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">📝</div>
          <div className="mb-2 font-bold">No Activity Yet</div>
          <div>Activity will appear here as users interact with the system!</div>
        </div>
      ) : (
        <ul className="activity-feed">
          {filtered.slice(0, 10).map((activity: any) => (
            <li key={activity.id} className="activity-feed-item">
              <div className="activity-feed-avatar" title={activity.user_email}>
                {activity.user_email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="activity-feed-content">
                <span className="font-medium">{activity.user_email}</span> {activity.action} <span className="font-bold">{activity.target_entity}</span>
                <div className="activity-feed-meta">{new Date(activity.timestamp).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed; 