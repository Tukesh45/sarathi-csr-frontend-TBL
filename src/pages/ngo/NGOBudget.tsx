import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';

interface NGOBudgetProps {
  user: any;
}

const NGOBudget: React.FC<NGOBudgetProps> = ({ user }) => {
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

  const { data: budgets = [], loading: budgetsLoading } = useRealtimeTable('budget_allocations', { 
    column: 'ngo_id', 
    value: ngoRecord?.id || 'no-ngo-id' 
  });

  if (loading || budgetsLoading) return <div>Loading...</div>;

  if (!ngoRecord) {
    return (
      <div className="card p-4">
        <div className="empty-state">
          <div className="empty-state-illustration">⚠️</div>
          <div className="mb-2 font-bold">NGO Record Not Found</div>
          <div>Your NGO account is not properly configured.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2>My Budget Allocations</h2>
      {budgets.length === 0 ? (
        <div>No budget allocations found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Year</th>
              <th>Q1</th>
              <th>Q2</th>
              <th>Q3</th>
              <th>Q4</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id}>
                <td>{b.project_id}</td>
                <td>{b.year}</td>
                <td>₹{b.q1 || 0}</td>
                <td>₹{b.q2 || 0}</td>
                <td>₹{b.q3 || 0}</td>
                <td>₹{b.q4 || 0}</td>
                <td>₹{(b.q1 || 0) + (b.q2 || 0) + (b.q3 || 0) + (b.q4 || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NGOBudget; 