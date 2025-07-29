import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';

interface NGOProgressProps {
  user: any;
}

const NGOProgress: React.FC<NGOProgressProps> = ({ user }) => {
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

  const { data: progress = [], loading: progressLoading } = useRealtimeTable('quarterly_progress', { 
    column: 'ngo_id', 
    value: ngoRecord?.id || 'no-ngo-id' 
  });

  if (loading || progressLoading) return <div>Loading...</div>;

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