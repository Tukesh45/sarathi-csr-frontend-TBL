import React, { useState } from 'react';
import { useRealtimeTable } from '../hooks/useRealtimeTable';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface DocumentPreviewProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  documentId?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ fileUrl, fileType, fileName, documentId }) => {
  const [input, setInput] = useState('');
  
  // Get real-time comments for this document
  const { data: comments = [], loading } = useRealtimeTable(
    'document_comments', 
    documentId ? { column: 'document_id', value: documentId } : undefined
  );

  const handleAddComment = async () => {
    if (input.trim() && documentId) {
      // Here you would typically call a function to add the comment to Supabase
      // For now, we'll just clear the input
      setInput('');
    }
  };

  return (
    <div className="card p-4">
      <h3 className="mb-3">Document Preview: {fileName}</h3>
      <div className="mb-4">
        {fileType === 'pdf' ? (
          <iframe src={fileUrl} title={fileName} width="100%" height="320" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }} />
        ) : fileType.startsWith('image') ? (
          <img src={fileUrl} alt={fileName} style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        ) : (
          <div className="empty-state">No preview available for this file type.</div>
        )}
      </div>
      <div>
        <h4 className="mb-2">Live Comments & Notes</h4>
        {loading ? (
          <div className="loading-spinner">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-illustration">💬</div>
            <div className="mb-2 font-bold">No Comments Yet</div>
            <div>Be the first to add a comment!</div>
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="avatar-circle" title={comment.user_email}>
                  {comment.user_email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {comment.user_email} 
                    <span className="text-secondary text-xs ml-2">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">{comment.comment_text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {documentId && (
          <div className="flex gap-2 mt-2">
            <input
              className="form-control"
              placeholder="Add a comment... (use @ to mention)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
              aria-label="Add a comment"
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddComment}>Post</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview; 