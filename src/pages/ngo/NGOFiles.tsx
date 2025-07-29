import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';

interface NGOFilesProps {
  user: any;
}

const NGOFiles: React.FC<NGOFilesProps> = ({ user }) => {
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

  const { data: files = [], loading: filesLoading } = useRealtimeTable('documents', { 
    column: 'ngo_id', 
    value: ngoRecord?.id || 'no-ngo-id' 
  });

  if (loading || filesLoading) return <div>Loading...</div>;

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
      <h2>My Uploaded Files</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Quarter</th>
            <th>Type</th>
            <th>File Name</th>
            <th>File URL</th>
            <th>File Size</th>
            <th>Description</th>
            <th>Mandatory</th>
            <th>Uploaded By</th>
          </tr>
        </thead>
        <tbody>
          {files.map((doc: any) => (
            <tr key={doc.id}>
              <td>{doc.project_id}</td>
              <td>{doc.quarter}</td>
              <td>{doc.document_type}</td>
              <td>{doc.file_name}</td>
              <td><a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a></td>
              <td>{doc.file_size}</td>
              <td>{doc.description}</td>
              <td>{doc.is_mandatory ? 'Yes' : 'No'}</td>
              <td>{doc.uploaded_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NGOFiles; 