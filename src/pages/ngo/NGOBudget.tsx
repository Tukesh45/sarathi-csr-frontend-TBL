import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

// TODO: Replace with actual NGO user ID from context or props
const CURRENT_NGO_ID = 'CURRENT_NGO_ID';

const NGOBudget: React.FC = () => {
  const { data: budgets = [], loading } = useRealtimeTable('budget_allocations', { column: 'ngo_id', value: CURRENT_NGO_ID });

  if (loading) return <div>Loading...</div>;

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