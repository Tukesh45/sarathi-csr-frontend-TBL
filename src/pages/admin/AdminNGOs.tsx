import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AdminNGOsProps {
  initialClientId?: string | null;
  onNGOAdded?: (ngoId: string) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const AdminNGOs: React.FC<AdminNGOsProps> = ({ initialClientId, onNGOAdded, onCancel, isModal }) => {
  const navigate = useNavigate();
  
  const { data: ngos = [], loading } = useRealtimeTable('ngos');
  const { data: clients = [] } = useRealtimeTable('clients');
  const { data: partnerships = [] } = useRealtimeTable('client_ngo_partnerships');

  const [form, setForm] = useState({
    name: '',
    registration_number: '',
    focus_areas: '',
    geographic_coverage: '',
    contact_person: '',
    website: '',
    established_year: '',
    login_email: '',
    client_id: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackGlobal, setFeedbackGlobal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationNumberError, setRegistrationNumberError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // --- (Functions like openModal, closeModal, handleChange, etc., remain the same) ---
  const openModal = (ngo?: any) => {
    if (ngo) {
      const partnership = partnerships.find((p: any) => p.ngo_id === ngo.id);
      setForm({
        name: ngo.name || '',
        registration_number: ngo.registration_number || '',
        focus_areas: Array.isArray(ngo.focus_areas) ? ngo.focus_areas.join(', ') : (ngo.focus_areas || ''),
        geographic_coverage: Array.isArray(ngo.geographic_coverage) ? ngo.geographic_coverage.join(', ') : (ngo.geographic_coverage || ''),
        contact_person: ngo.contact_person || '',
        website: ngo.website || '',
        established_year: ngo.established_year || '',
        login_email: ngo.login_email || '',
        client_id: partnership ? partnership.client_id : '',
      });
      setEditingId(ngo.id);
    } else {
      setForm({
        name: '',
        registration_number: '',
        focus_areas: '',
        geographic_coverage: '',
        contact_person: '',
        website: '',
        established_year: '',
        login_email: '',
        client_id: initialClientId || '',
      });
      setEditingId(null);
    }
    setShowModal(true);
    setFeedback('');
    setRegistrationNumberError('');
  };

  const closeModal = (cancelled = false) => {
    setShowModal(false);
    setEditingId(null);
    if (cancelled && onCancel) {
        onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    
    const ngoPayload = {
      name: form.name,
      registration_number: form.registration_number.trim(),
      focus_areas: form.focus_areas ? form.focus_areas.split(',').map(s => s.trim()).filter(Boolean) : [],
      geographic_coverage: form.geographic_coverage ? form.geographic_coverage.split(',').map(s => s.trim()).filter(Boolean) : [],
      contact_person: form.contact_person,
      website: form.website,
      established_year: form.established_year ? Number(form.established_year) : null,
      login_email: form.login_email,
    };

    try {
      let ngoId = editingId;
      if (editingId) {
        const { error } = await supabase.from('ngos').update(ngoPayload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('ngos').insert(ngoPayload).select('id').single();
        
        // **FIX IS HERE**
        if (error) throw error;
        if (!data) throw new Error("NGO creation failed: Did not receive ID from server.");
        
        ngoId = data.id; // This is now safe
      }

      if (ngoId) {
        await supabase.from('client_ngo_partnerships').delete().eq('ngo_id', ngoId);
        if (form.client_id) {
          const { error: partnershipError } = await supabase.from('client_ngo_partnerships').insert({ ngo_id: ngoId, client_id: form.client_id });
          if (partnershipError) throw partnershipError;
        }
      }
      
      setFeedbackGlobal(editingId ? 'NGO updated!' : 'NGO added!');
      if (!editingId && onNGOAdded && ngoId) onNGOAdded(ngoId);

      setTimeout(() => {
        closeModal();
        setFeedbackGlobal('');
      }, 1000);
      
    } catch (err: any) {
      setFeedback(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm('Are you sure?')) return;
      await supabase.from('ngos').delete().eq('id', id);
  };
  
  const getClientPartnersForNGO = (ngoId: string) => {
    return partnerships
      .filter((p: any) => p.ngo_id === ngoId)
      .map((p: any) => clients.find((c: any) => c.id === p.client_id))
      .filter(Boolean);
  };

  if (loading) return <div className="card" style={{ padding: 32 }}>...Loading</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>NGOs</h2>
      </div>
      {ngos.length === 0 ? (
        <div className="empty-state">...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name & Contact</th>
              <th>Registration #</th>
              <th>Website</th>
              <th>Established</th>
              <th>Client Partner(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ngos.map((ngo: any) => {
              const clientPartners = getClientPartnersForNGO(ngo.id);
              return (
              <tr key={ngo.id}>
                <td>
                    <div style={{ fontWeight: '600' }}>{ngo.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{ngo.contact_person}</div>
                </td>
                <td>{ngo.registration_number}</td>
                <td>
                    <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="website-link">
                        {ngo.website}
                    </a>
                </td>
                <td>{ngo.established_year}</td>
                <td>
                  {clientPartners && clientPartners.length > 0 ? (
                    <div>
                      {clientPartners.map((client: any) => (
                        <div key={client.id} className="item-badge-client">
                          {client.company_name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="no-items-text">No clients</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(ngo)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={() => handleDelete(ngo.id)}>Delete</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => openModal()}>Add New NGO</button>
      </div>
      
      {showModal && (
         <div className="modal-overlay" onClick={() => closeModal(true)}>
           <div className="modal" onClick={e => e.stopPropagation()}>
             <h3>{editingId ? 'Edit NGO' : 'Add New NGO'}</h3>
             <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>NGO Name*</label>
                        <input name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Registration Number*</label>
                        <input name="registration_number" value={form.registration_number} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Established Year</label>
                        <input type="number" name="established_year" value={form.established_year} onChange={handleChange} placeholder="e.g., 2010" />
                    </div>
                    <div className="form-group full-width">
                        <label>Website</label>
                        <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
                    </div>
                    <div className="form-group full-width">
                        <label>Focus Areas (comma-separated)</label>
                        <input name="focus_areas" value={form.focus_areas} onChange={handleChange} />
                    </div>
                     <div className="form-group full-width">
                        <label>Geographic Coverage (comma-separated)</label>
                        <input name="geographic_coverage" value={form.geographic_coverage} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Contact Person</label>
                        <input name="contact_person" value={form.contact_person} onChange={handleChange} />
                    </div>
                     <div className="form-group">
                        <label>Login Email</label>
                        <input type="email" name="login_email" value={form.login_email} onChange={handleChange} />
                    </div>
                     <div className="form-group full-width">
                        <label>Client Partner</label>
                        <select name="client_id" value={form.client_id || ''} onChange={handleChange} disabled={!!initialClientId}>
                           <option value="">No Client Partner</option>
                           {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                 <button className="btn btn-secondary" type="button" onClick={() => closeModal(true)}>Cancel</button>
                 <button className="btn btn-success" type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingId ? 'Update NGO' : 'Add NGO')}
                 </button>
               </div>
               {feedback && <div className="form-feedback">{feedback}</div>}
             </form>
           </div>
         </div>
      )}

      <style>{`
        /* --- Table Styles --- */
        .table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .table th, .table td { padding: 12px 16px; vertical-align: top; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .website-link { color: #0ea5e9; text-decoration: none; }
        .website-link:hover { text-decoration: underline; }
        .item-badge-client { padding: 4px 8px; border-radius: 999px; font-size: 12px; display: inline-block; background: #eef2ff; border: 1px solid #a5b4fc; color: #4338ca; }
        .no-items-text { color: #6b7280; font-size: 12px; }

        /* --- Modal & Form Styles --- */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; padding: 24px; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        .modal h3 { margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
        .form-group input, .form-group select { 
            padding: 10px; 
            border-radius: 6px; 
            border: 1px solid #d1d5db; 
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-actions {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        .form-feedback { margin-top: 12px; color: #d32f2f; text-align: right; }
      `}</style>
    </div>
  );
};

export default AdminNGOs;