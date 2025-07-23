import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: messages = [], loading } = useRealtimeTable('contact_us');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Remove the header with Admin email and Logout button */}
      <div className="card">
        <h2>Contact Us Submissions</h2>
        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div>No messages yet.</div>
        ) : (
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
                  <td>{msg.message}</td>
                  <td>{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminContactUs; 