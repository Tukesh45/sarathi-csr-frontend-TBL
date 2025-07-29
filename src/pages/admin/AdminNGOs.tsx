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
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data?.user?.email || 'Admin'));
  }, []);
  const { data: ngos = [], loading } = useRealtimeTable('ngos');
  const { data: clients = [] } = useRealtimeTable('clients');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    registration_number: '',
    focus_areas: '',
    geographic_coverage: '',
    contact_person: '',
    client_id: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackGlobal, setFeedbackGlobal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationNumberError, setRegistrationNumberError] = useState('');

  // Function to check registration number availability
  const checkRegistrationNumber = async (registrationNumber: string) => {
    if (!registrationNumber.trim() || editingId) {
      setRegistrationNumberError('');
      return;
    }

    try {
      const { data: existingNGOs, error } = await supabase
        .from('ngos')
        .select('registration_number')
        .eq('registration_number', registrationNumber.trim());
      
      if (error) {
        // Silently handle error - registration number check failed
        return;
      }
      
      if (existingNGOs && existingNGOs.length > 0) {
        setRegistrationNumberError('This registration number is already in use');
      } else {
        setRegistrationNumberError('');
      }
    } catch (err) {
      // Silently handle error - registration number check failed
    }
  };

  // Debounced registration number check
  const debouncedCheck = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => checkRegistrationNumber(value), 500);
      };
    }, []),
    []
  );

  const openModal = (ngo?: any) => {
    if (ngo) {
      setForm({
        name: ngo.name || '',
        registration_number: ngo.registration_number || '',
        focus_areas: Array.isArray(ngo.focus_areas) ? ngo.focus_areas.join(', ') : (ngo.focus_areas || ''),
        geographic_coverage: Array.isArray(ngo.geographic_coverage) ? ngo.geographic_coverage.join(', ') : (ngo.geographic_coverage || ''),
        contact_person: ngo.contact_person || '',
        client_id: ngo.client_id || '',
      });
      setEditingId(ngo.id);
    } else {
      setForm({
        name: '',
        registration_number: '',
        focus_areas: '',
        geographic_coverage: '',
        contact_person: '',
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
    setForm({
      name: '',
      registration_number: '',
      focus_areas: '',
      geographic_coverage: '',
      contact_person: '',
      client_id: initialClientId || '',
    });
    setEditingId(null);
    setFeedback('');
    setRegistrationNumberError('');
    if (cancelled) {
      setFeedbackGlobal('Cancelled.');
      setTimeout(() => setFeedbackGlobal(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Real-time validation for registration number
    if (name === 'registration_number') {
      debouncedCheck(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    
    // Check for validation errors
    if (!form.name || !form.registration_number || !form.client_id) {
      setFeedback('Name, Registration Number, and Client are required.');
      setSubmitting(false);
      return;
    }

    // Check for registration number error
    if (registrationNumberError) {
      setFeedback('Please fix the registration number error before submitting.');
      setSubmitting(false);
      return;
    }

    // Check if registration number already exists (only for new NGOs, not when editing)
    if (!editingId) {
      try {
        const { data: existingNGOs, error: checkError } = await supabase
          .from('ngos')
          .select('registration_number')
          .eq('registration_number', form.registration_number.trim());
        
        if (checkError) throw checkError;
        
        if (existingNGOs && existingNGOs.length > 0) {
          setFeedback('An NGO with this registration number already exists. Please use a different registration number.');
          setSubmitting(false);
          return;
        }
      } catch (checkErr: any) {
        // Silently handle error - registration number check failed
        // Continue with submission if check fails
      }
    }

    // Convert comma-separated strings to arrays for array fields
    const focus_areas = form.focus_areas
      ? form.focus_areas.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    const geographic_coverage = form.geographic_coverage
      ? form.geographic_coverage.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('ngos')
          .update({
            name: form.name,
            registration_number: form.registration_number.trim(),
            focus_areas,
            geographic_coverage,
            contact_person: form.contact_person,
            client_id: form.client_id,
          })
          .eq('id', editingId);
        if (error) throw error;
        setFeedback('NGO updated successfully!');
        setFeedbackGlobal('NGO updated successfully!');
        setTimeout(() => {
          closeModal();
          setFeedbackGlobal('');
        }, 1000);
      } else {
        const { data, error } = await supabase
          .from('ngos')
          .insert([{ 
            name: form.name,
            registration_number: form.registration_number.trim(),
            focus_areas,
            geographic_coverage,
            contact_person: form.contact_person,
            client_id: form.client_id,
          }])
          .select();
        if (error) {
          // Handle specific database errors
          if (error.message.includes('duplicate key value violates unique constraint "ngos_registration_number_key"')) {
            setFeedback('An NGO with this registration number already exists. Please use a different registration number.');
          } else {
            setFeedback(error.message || 'Error occurred while adding NGO.');
          }
          setSubmitting(false);
          return;
        }
        setFeedback('NGO added successfully!');
        setFeedbackGlobal('NGO added successfully!');
        if (onNGOAdded && data && data[0] && data[0].id) {
          setTimeout(() => {
            closeModal();
            setFeedbackGlobal('');
            onNGOAdded(data[0].id);
          }, 1000);
        } else {
          setTimeout(() => {
            closeModal();
            setFeedbackGlobal('');
          }, 1000);
        }
      }
    } catch (err: any) {
      // Handle any other errors
      if (err.message.includes('duplicate key value violates unique constraint "ngos_registration_number_key"')) {
        setFeedback('An NGO with this registration number already exists. Please use a different registration number.');
      } else {
        setFeedback(err.message || 'Error occurred.');
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this NGO?')) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('ngos').delete().eq('id', id);
      if (error) throw error;
      setFeedback('NGO deleted.');
      setFeedbackGlobal('NGO deleted.');
      setTimeout(() => setFeedbackGlobal(''), 2000);
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
        <div className="loading-spinner">Loading NGOs...</div>
      </div>
    );
  }

  // If isModal, render as modal
  if (isModal) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>{editingId ? 'Edit NGO' : 'Add NGO'}</h3>
          {initialClientId && <div style={{ marginBottom: 8, color: '#555' }}>For Client: {initialClientId}</div>}
          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Registration Number
              <input 
                name="registration_number" 
                value={form.registration_number} 
                onChange={handleChange} 
                required 
                style={{ borderColor: registrationNumberError ? '#d32f2f' : undefined }}
              />
              {registrationNumberError && (
                <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                  {registrationNumberError}
                </div>
              )}
            </label>
            <label>
              Focus Areas <span style={{ color: '#888', fontSize: 12 }}>(comma-separated)</span>
              <input name="focus_areas" value={form.focus_areas} onChange={handleChange} placeholder="e.g. trees, water, education" />
            </label>
            <label>
              Geographic Coverage <span style={{ color: '#888', fontSize: 12 }}>(comma-separated)</span>
              <input name="geographic_coverage" value={form.geographic_coverage} onChange={handleChange} placeholder="e.g. Maharashtra, Gujarat" />
            </label>
            <label>
              Contact Person
              <input name="contact_person" value={form.contact_person} onChange={handleChange} />
            </label>
            <label>
              Client*
              <select name="client_id" value={form.client_id || initialClientId || ''} onChange={handleChange} required disabled={!!initialClientId}>
                <option value="">Select Client</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-success" type="submit" disabled={submitting}>{editingId ? 'Update' : 'Add'}</button>
              <button className="btn btn-secondary" type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
            {feedback && <div className="form-feedback">{feedback}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <h2>NGOs</h2>
      </div>
      {ngos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-illustration">🏢</div>
          <div className="mb-2 font-bold">No NGOs Yet</div>
          <div>Start by adding your first NGO!</div>
        </div>
      ) : (
        <>
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
                <th>Registration #</th>
                <th>Focus Areas</th>
                <th>Contact Person</th>
                <th>Website</th>
                <th>Rating</th>
                <th>Client</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
              {ngos.map((ngo: any) => (
                <tr key={ngo.id}>
            <td>{ngo.name}</td>
                  <td>{ngo.registration_number}</td>
                  <td>{ngo.focus_areas}</td>
                  <td>{ngo.contact_person}</td>
                  <td>{ngo.website}</td>
                  <td>{ngo.rating}</td>
                  <td>{clients.find((c: any) => c.id === ngo.client_id)?.company_name || '-'}</td>
                  <td>
                    <button className="btn btn-xs btn-primary" style={{ marginRight: 8 }} onClick={() => openModal(ngo)}>Edit</button>
                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(ngo.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        </>
      )}
    <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => openModal()}>Add New NGO</button>
      </div>
      <div style={{ marginTop: 8, minHeight: 24 }}>
        {feedbackGlobal && <div className="form-feedback" style={{ color: '#388e3c' }}>{feedbackGlobal}</div>}
      </div>
      <div className="modal-container" style={{ position: 'relative' }}>
        {showModal && (
          <div className="modal-overlay" onClick={() => closeModal(true)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{editingId ? 'Edit NGO' : 'Add NGO'}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Name
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Registration Number
                  <input 
                    name="registration_number" 
                    value={form.registration_number} 
                    onChange={handleChange} 
                    required 
                    style={{ borderColor: registrationNumberError ? '#d32f2f' : undefined }}
                  />
                  {registrationNumberError && (
                    <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                      {registrationNumberError}
                    </div>
                  )}
                </label>
                <label>
                  Focus Areas <span style={{ color: '#888', fontSize: 12 }}>(comma-separated)</span>
                  <input name="focus_areas" value={form.focus_areas} onChange={handleChange} placeholder="e.g. trees, water, education" />
                </label>
                <label>
                  Geographic Coverage <span style={{ color: '#888', fontSize: 12 }}>(comma-separated)</span>
                  <input name="geographic_coverage" value={form.geographic_coverage} onChange={handleChange} placeholder="e.g. Maharashtra, Gujarat" />
                </label>
                <label>
                  Contact Person
                  <input name="contact_person" value={form.contact_person} onChange={handleChange} />
                </label>
                <label>
                  Client*
                  <select name="client_id" value={form.client_id || initialClientId || ''} onChange={handleChange} required disabled={!!initialClientId}>
                    <option value="">Select Client</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
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
  </div>
);
};

export default AdminNGOs; 