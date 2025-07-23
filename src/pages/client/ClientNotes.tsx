import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

// TODO: Replace with actual client user ID from context or props
const CURRENT_CLIENT_ID = 'CURRENT_CLIENT_ID';

const ClientNotes: React.FC = () => {
  const { data: notes = [], loading } = useRealtimeTable('activity_logs', { column: 'user_id', value: CURRENT_CLIENT_ID });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Project Notes</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.timestamp}</td>
                <td>{note.activity}</td>
                <td>{note.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-container">
        <h3>Add New Note</h3>
        <form className="form">
          <div className="form-group">
            <label htmlFor="activity">Activity:</label>
            <input type="text" id="activity" name="activity" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="details">Details:</label>
            <textarea id="details" name="details" className="form-control" rows={4}></textarea>
          </div>
          <button type="submit" className="btn">Add Note</button>
        </form>
      </div>
    </div>
  );
};

export default ClientNotes; 