import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const inquiryTypes = [
  'General',
  'Partnership',
  'Support',
  'CSR Collaboration',
  'Feedback',
  'Other',
];

const countries = [
  'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia', 'Canada', 'Other',
];

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    country: '',
    inquiry_type: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.first_name || !form.last_name || !form.email || !form.company || !form.message) {
      setFeedback('Please fill all required fields.');
      setSubmitting(false);
      return;
    }
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const { error } = await supabase.from('contact_us').insert([{ ...form, name: fullName }]);
      if (error) throw error;
      setFeedback('Thank you for contacting us!');
      setForm({
        first_name: '', last_name: '', email: '', phone: '', company: '', job_title: '', country: '', inquiry_type: '', message: '',
      });
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary)', padding: '0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', padding: '3em 0 2em 0', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ textAlign: 'center', fontWeight: 900, color: 'var(--primary-dark)', fontSize: '2.7em', marginBottom: 8 }}>SarathiCSR - Contact Us</h1>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '1.2em', marginBottom: 0 }}>
          Get in touch with our CSR experts to learn how SarathiCSR can help your organization.
        </p>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 48,
        maxWidth: 1400,
        margin: '0 auto',
        padding: '3em 2em 2em 2em',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        {/* Left: Get in Touch + Why Sarathi CSR */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 320, maxWidth: 420, gap: 32 }}>
          {/* Get in Touch */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: 8 }}>Get in Touch</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Our team is here to help you start your sustainability journey</p>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: 'var(--primary)' }}>✉️</span>
                <span>Email</span>
              </div>
              <div style={{ color: 'var(--muted)', marginLeft: 30 }}>csr-support@yourdomain.com</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: 'var(--primary)' }}>📞</span>
                <span>Phone</span>
              </div>
              <div style={{ color: 'var(--muted)', marginLeft: 30 }}>+91 9876543210</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: 'var(--primary)' }}>📍</span>
                <span>Address</span>
              </div>
              <div style={{ color: 'var(--muted)', marginLeft: 30 }}>
                123 CSR Avenue<br />Pune City, India
              </div>
            </div>
          </div>
          {/* Why Sarathi CSR? */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: 18 }}>Why Sarathi CSR?</h2>
            <p style={{ fontSize: 16, color: 'var(--primary-dark)', marginBottom: 16 }}>
              The trusted platform for real-time, transparent, and impactful CSR management.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, color: 'var(--muted)', textAlign: 'left', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              <li style={{ marginBottom: 10 }}>• Real-time project tracking</li>
              <li style={{ marginBottom: 10 }}>• Easy collaboration</li>
              <li>• Automated compliance</li>
            </ul>
          </div>
        </div>
        {/* Right: Send us a Message */}
        <div style={{ flex: 2, minWidth: 340, maxWidth: 700, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: 8 }}>Send us a Message</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Fill out the form below and we'll get back to you as soon as possible</p>
          <form className="form" onSubmit={handleSubmit} autoComplete="off">
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>First Name *</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Last Name *</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Company *</label>
                <input name="company" value={form.company} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Job Title</label>
                <input name="job_title" value={form.job_title} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Country</label>
                <select name="country" value={form.country} onChange={handleChange}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Inquiry Type</label>
                <select name="inquiry_type" value={form.inquiry_type} onChange={handleChange}>
                  <option value="">Select inquiry type</option>
                  {inquiryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell us about your CSR goals and how we can help..." />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', fontWeight: 600, fontSize: '1.1em' }}>Send Message</button>
            {feedback && <div className="form-feedback" style={{ marginTop: 12 }}>{feedback}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 