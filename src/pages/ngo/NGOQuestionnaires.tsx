import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

// TODO: Replace with actual NGO user ID from context or props
const CURRENT_NGO_ID = 'CURRENT_NGO_ID';

const NGOQuestionnaires: React.FC = () => {
  const { data: questionnaires = [], loading } = useRealtimeTable('questionnaire', { column: 'ngo_id', value: CURRENT_NGO_ID });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>NGO Questionnaires</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.map((questionnaire) => (
              <tr key={questionnaire.id}>
                <td>{questionnaire.id}</td>
                <td>{questionnaire.title}</td>
                <td>{new Date(questionnaire.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-primary">View</button>
                  <button className="btn btn-secondary">Edit</button>
                  <button className="btn btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-container">
        <button className="btn btn-primary">Create New Questionnaire</button>
      </div>
    </div>
  );
};

export default NGOQuestionnaires; 