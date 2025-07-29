import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

interface ClientNotesProps {
  user: any;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ user }) => {
  const { data: notes = [], loading } = useRealtimeTable('activity_logs', { column: 'user_id', value: user.id });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Project Notes</h2>
      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">📝</div>
          <div className="mb-2 font-bold">No Notes Yet</div>
          <div>Your project notes and activity logs will appear here.</div>
        </div>
      ) : (
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
      )}
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