import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Predefined dropdown options for consistency
const inquiryTypes = [
  'General Inquiry',
  'Platform Demo',
  'Partnership',
  'CSR Collaboration',
  'Support',
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
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError('');
        
        try {
            const fullName = `${form.first_name} ${form.last_name}`.trim();
            const { error } = await supabase.from('contact_us').insert([{ 
                ...form, 
                name: fullName 
            }]);
            if (error) throw error;

            setSuccess(true);
            setForm({ // Reset form on success
                first_name: '', last_name: '', email: '', phone: '', company: '',
                job_title: '', country: '', inquiry_type: '', message: ''
            });
        } catch (err: any) {
            console.error("Error submitting contact form:", err);
            setError("Sorry, there was an issue sending your message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .contact-page-container {
                    min-height: 100vh;
                    position: relative;
                    background: var(--secondary);
                    padding: 4em 2em;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }
                .contact-content-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 3rem;
                    align-items: flex-start;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .contact-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .contact-info-card, .why-card {
                    background: var(--surface);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    padding: 2em;
                }
                .contact-info-card h2, .why-card h2 {
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .contact-info-card p, .why-card p {
                    color: var(--muted);
                    margin-bottom: 1.5rem;
                }
                .contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .contact-item span:first-child {
                    font-size: 1.25rem;
                    color: var(--primary);
                    margin-top: 2px;
                }
                .form-card {
                    background: var(--surface);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    padding: 2.5em;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                .form-group label {
                    display: block; font-weight: 600; margin-bottom: 0.5rem;
                    color: var(--muted); font-size: 0.9rem;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border);
                    border-radius: var(--radius); background-color: #fff; font-size: 1rem;
                    color: var(--text); transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none; border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(33, 150, 83, 0.1);
                }
                .success-message {
                    padding: 1.5rem; text-align: center; background-color: #d1fae5;
                    border: 1px solid #6ee7b7; border-radius: var(--radius); color: #065f46;
                }
                .error-message {
                     padding: 1rem; text-align: center; background-color: #fee2e2;
                    border: 1px solid #fca5a5; border-radius: var(--radius); color: #991b1b;
                    margin-top: 1rem;
                }
                @media (max-width: 900px) {
                    .contact-content-wrapper { grid-template-columns: 1fr; }
                }
            `}</style>
            <div className="contact-page-container">
                <div className="contact-content-wrapper">
                    <div className="contact-info-section">
                         <div className="contact-info-card">
                           <h2>Get in Touch</h2>
                           <p>Our team is here to help you start your sustainability journey.</p>
                           <div className="contact-item">
                             <span>✉️</span>
                             <div>
                                <strong>Email</strong>
                                <div style={{ color: 'var(--muted)'}}>csr-support@sarathicsr.com</div>
                             </div>
                           </div>
                           <div className="contact-item">
                             <span>📞</span>
                             <div>
                                <strong>Phone</strong>
                                <div style={{ color: 'var(--muted)'}}>+91 98765 43210</div>
                             </div>
                           </div>
                           <div className="contact-item">
                             <span>📍</span>
                             <div>
                                <strong>Address</strong>
                                <div style={{ color: 'var(--muted)'}}>123 CSR Avenue<br/>Pune City, India</div>
                             </div>
                           </div>
                         </div>
                         <div className="why-card">
                            <h2>Why Sarathi CSR?</h2>
                            <p>The trusted platform for real-time, transparent, and impactful CSR management.</p>
                            <button className="btn" onClick={() => navigate('/')} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', boxShadow: 'none', border: '1px solid var(--border)' }}>← Go to Homepage</button>
                         </div>
                    </div>
                    <div className="form-card">
                        <h2>Send us a Message</h2>
                        <p>Fill out the form below and we'll get back to you as soon as possible.</p>
                        
                        {success ? (
                            <div className="success-message">
                                <h3>Thank You!</h3>
                                <p>Your message has been sent successfully. We will be in touch shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group"><label>First Name *</label><input type="text" name="first_name" value={form.first_name} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Last Name *</label><input type="text" name="last_name" value={form.last_name} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={form.phone} onChange={handleChange} /></div>
                                    <div className="form-group full-width"><label>Company *</label><input type="text" name="company" value={form.company} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Country</label>
                                        <select name="country" value={form.country} onChange={handleChange}>
                                            <option value="">Select country</option>
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Inquiry Type</label>
                                        <select name="inquiry_type" value={form.inquiry_type} onChange={handleChange}>
                                            <option value="">Select inquiry type</option>
                                            {inquiryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group full-width"><label>Message *</label><textarea name="message" value={form.message} onChange={handleChange} rows={4} required placeholder="Tell us about your CSR goals and how we can help..."></textarea></div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75em', fontSize: '1.1rem', marginTop: '1rem' }}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                                {error && <div className="error-message">{error}</div>}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactUs;

