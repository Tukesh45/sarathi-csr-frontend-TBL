import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';

const AdminContactUs: React.FC = () => {
  const { data: messages = [], loading } = useRealtimeTable('contact_us');

  return (
    <div className="card">
      <h2>Contact Us Submissions</h2>
      {loading ? (
        <div>Loading...</div>
      ) : messages.length === 0 ? (
        <div className="empty-state">
            <div className="empty-state-illustration">✉️</div>
            <div className="mb-2 font-bold">No Messages Yet</div>
        </div>
      ) : (
        // This wrapper div enables horizontal scrolling
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Job Title</th>
                <th>Country</th>
                <th>Inquiry Type</th>
                <th>Message</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg: any) => (
                <tr key={msg.id}>
                  <td>{msg.first_name || (msg.name?.split(' ')[0] || '')}</td>
                  <td>{msg.last_name || (msg.name?.split(' ').slice(1).join(' ') || '')}</td>
                  <td>{msg.email}</td>
                  <td>{msg.phone}</td>
                  <td>{msg.company}</td>
                  <td>{msg.job_title}</td>
                  <td>{msg.country}</td>
                  <td>{msg.inquiry_type}</td>
                  {/* Special class to allow the message to wrap */}
                  <td className="message-cell">{msg.message}</td>
                  <td>{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`
        /* --- Wrapper for scrolling --- */
        .table-container {
            overflow-x: auto;
            width: 100%;
        }

        /* --- Table Styles --- */
        .table { 
            width: 100%; 
            min-width: 1400px; /* Set a minimum width to ensure columns don't get squished */
            border-collapse: separate; 
            border-spacing: 0; 
        }
        .table th, .table td { 
            padding: 12px 16px; 
            vertical-align: top; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb;
            white-space: nowrap; /* Prevent text from wrapping by default */
            color: #1f2937; /* Standard, non-faint font color */
        }
        
        /* --- Special style for the message cell to allow wrapping --- */
        .table .message-cell {
            white-space: pre-wrap;
            word-break: break-word;
            min-width: 300px; /* Give the message column enough space */
        }
        
        .empty-state {
            text-align: center;
            padding: 48px;
        }
        .empty-state-illustration {
            font-size: 48px;
            margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default AdminContactUs;