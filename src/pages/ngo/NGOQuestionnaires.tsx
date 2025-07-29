import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';

interface NGOQuestionnairesProps {
  user: any;
}

const NGOQuestionnaires: React.FC<NGOQuestionnairesProps> = ({ user }) => {
  const [ngoRecord, setNgoRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getNgoRecord = async () => {
      try {
        const { data: ngo, error } = await supabase
          .from('ngos')
          .select('*')
          .eq('login_email', user.email)
          .single();
        
        if (error) {
          console.error('Error fetching NGO record:', error);
        } else {
          setNgoRecord(ngo);
        }
      } catch (err) {
        console.error('Error fetching NGO record:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getNgoRecord();
  }, [user.email]);

  const { data: questionnaires = [], loading: questionnairesLoading } = useRealtimeTable('questionnaire', { 
    column: 'ngo_id', 
    value: ngoRecord?.id || 'no-ngo-id' 
  });

  if (loading || questionnairesLoading) return <div>Loading...</div>;

  if (!ngoRecord) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-illustration">⚠️</div>
          <div className="mb-2 font-bold">NGO Record Not Found</div>
          <div>Your NGO account is not properly configured.</div>
        </div>
      </div>
    );
  }

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