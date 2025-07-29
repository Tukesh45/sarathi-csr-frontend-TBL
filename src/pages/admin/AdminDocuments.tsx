import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: documents = [], loading } = useRealtimeTable('documents');
  const { data: projects = [] } = useRealtimeTable('projects');
  const { data: ngos = [] } = useRealtimeTable('ngos');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    quarter: '',
    document_type: '',
    file_name: '',
    file_url: '',
    file_size: '',
    description: '',
    is_mandatory: false,
    uploaded_by: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackGlobal, setFeedbackGlobal] = useState('');

  const openModal = (doc?: any) => {
    if (doc) {
      setForm({
        project_id: doc.project_id || '',
        quarter: doc.quarter || '',
        document_type: doc.document_type || '',
        file_name: doc.file_name || '',
        file_url: doc.file_url || '',
        file_size: doc.file_size || '',
        description: doc.description || '',
        is_mandatory: !!doc.is_mandatory,
        uploaded_by: doc.uploaded_by || '',
      });
      setEditingId(doc.id);
    } else {
      setForm({
        project_id: '',
        quarter: '',
        document_type: '',
        file_name: '',
        file_url: '',
        file_size: '',
        description: '',
        is_mandatory: false,
        uploaded_by: '',
      });
      setEditingId(null);
    }
    setShowModal(true);
    setFeedback('');
  };

  const closeModal = (cancelled = false) => {
    setShowModal(false);
    setForm({
      project_id: '',
      quarter: '',
      document_type: '',
      file_name: '',
      file_url: '',
      file_size: '',
      description: '',
      is_mandatory: false,
      uploaded_by: '',
    });
    setEditingId(null);
    setFeedback('');
    if (cancelled) {
      setFeedbackGlobal('Cancelled.');
      setTimeout(() => setFeedbackGlobal(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && 'checked' in e.target) {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.project_id || !form.document_type || !form.file_name || !form.file_url) {
      setFeedback('Project, Document Type, File Name, and File URL are required.');
      setSubmitting(false);
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase
          .from('documents')
          .update({
            ...form,
            file_size: form.file_size ? Number(form.file_size) : null,
          })
          .eq('id', editingId);
        if (error) throw error;
        setFeedback('Document updated successfully!');
        setFeedbackGlobal('Document updated successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      } else {
        const { error } = await supabase
          .from('documents')
          .insert([{ 
            ...form,
            file_size: form.file_size ? Number(form.file_size) : null,
          }]);
        if (error) throw error;
        setFeedback('Document added successfully!');
        setFeedbackGlobal('Document added successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      setFeedback('Document deleted.');
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
  <div className="card" style={{ padding: 32 }}>
        <div className="loading-spinner">Loading documents...</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
    <h2>Documents</h2>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-illustration">📄</div>
            <div className="mb-2 font-bold">No Documents Yet</div>
            <div>Start by uploading your first document!</div>
          </div>
        ) : (
          <>
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
                {documents.map((doc: any) => (
                  <tr key={doc.id}>
                    <td>{projects.find((p: any) => p.id === doc.project_id)?.title || doc.project_id}</td>
                    <td>{doc.quarter}</td>
                    <td>{doc.document_type}</td>
                    <td>{doc.file_name}</td>
                    <td>{doc.file_url}</td>
                    <td>{doc.file_size}</td>
                    <td>{doc.description}</td>
                    <td>{doc.is_mandatory ? 'Yes' : 'No'}</td>
                    <td>{doc.uploaded_by}</td>
                    <td>
                      <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(doc)}>Edit</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(doc.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
          </>
        )}
    <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => openModal()}>Upload New Document</button>
        </div>
        <div style={{ marginTop: 8, minHeight: 24 }}>
          {feedbackGlobal && <div className="form-feedback" style={{ color: '#388e3c' }}>{feedbackGlobal}</div>}
        </div>
        <div className="modal-container" style={{ position: 'relative' }}>
          {showModal && (
            <div className="modal-overlay" onClick={() => closeModal(true)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{editingId ? 'Edit Document' : 'Add Document'}</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Project
                    <select name="project_id" value={form.project_id} onChange={handleChange} required>
                      <option value="">Select Project</option>
                      {projects.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </label>
                  <label>
                    Quarter
                    <input name="quarter" value={form.quarter} onChange={handleChange} />
                  </label>
                  <label>
                    Document Type
                    <input name="document_type" value={form.document_type} onChange={handleChange} required />
                  </label>
                  <label>
                    File Name
                    <input name="file_name" value={form.file_name} onChange={handleChange} required />
                  </label>
                  <label>
                    File URL
                    <input name="file_url" value={form.file_url} onChange={handleChange} required />
                  </label>
                  <label>
                    File Size
                    <input name="file_size" type="number" value={form.file_size} onChange={handleChange} />
                  </label>
                  <label>
                    Description
                    <input name="description" value={form.description} onChange={handleChange} />
                  </label>
                  <label>
                    Mandatory
                    <input name="is_mandatory" type="checkbox" checked={form.is_mandatory} onChange={handleChange} />
                  </label>
                  <label>
                    Uploaded By (Profile ID)
                    <input name="uploaded_by" value={form.uploaded_by} onChange={handleChange} />
                  </label>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-success" type="submit" disabled={submitting}>{editingId ? 'Update' : 'Add'}</button>
                    <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)} style={{ marginLeft: 8 }}>Cancel</button>
                  </div>
                  {feedback && <div className="form-feedback">{feedback}</div>}
                </form>
              </div>
            </div>
          )}
    </div>
  </div>
      <style>{`
        .modal-container { position: relative; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal {
          background: #fff; padding: 32px; border-radius: 8px; min-width: 320px; max-width: 480px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          margin: 0 auto;
        }
        .modal label { display: block; margin-bottom: 12px; }
        .modal input, .modal select { width: 100%; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
        .form-feedback { margin-top: 12px; color: #d32f2f; }
      `}</style>
    </>
  );
};

export default AdminDocuments; 