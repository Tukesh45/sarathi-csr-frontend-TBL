import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';

interface ClientDocumentsProps {
  user: any;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ user }) => {
  const { data: documents = [], loading } = useRealtimeTable('documents', { column: 'client_id', value: user.id });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>My Project Documents</h2>
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">📄</div>
          <div className="mb-2 font-bold">No Documents Yet</div>
          <div>Documents related to your projects will appear here.</div>
        </div>
      ) : (
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
            {documents.map((doc: any) => (
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
      )}
    </div>
  );
};

export default ClientDocuments; 