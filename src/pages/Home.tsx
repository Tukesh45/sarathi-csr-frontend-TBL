import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    if (!form.name || !form.email || !form.message) {
      setFeedback('All fields are required.');
      setSubmitting(false);
      return;
    }
    try {
      const { error } = await supabase.from('contact_us').insert([{ ...form }]);
      if (error) throw error;
      setFeedback('Thank you for contacting us!');
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setFeedback(err.message || 'Error occurred.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5em 2em', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 900, fontSize: 24, color: 'var(--primary-dark)', letterSpacing: '-1px' }}>Sarathi CSR</div>
        <div>
          <button className="btn btn-success" style={{ marginRight: 16 }} onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-secondary" onClick={() => navigate('/contact-us')}>Contact Us</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        width: '100%',
        background: 'linear-gradient(135deg, #f5fdf7 0%, #e0f7fa 100%)',
        padding: '3.5em 0 2.5em 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 1200,
          width: '100%',
          padding: '0 2em',
          gap: 48,
          flexWrap: 'wrap',
        }}>
          {/* Left: Text */}
          <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
            <div style={{ fontSize: 72, marginBottom: 18 }}>🌱</div>
            <h1 style={{ fontSize: '3.2em', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: 10, letterSpacing: '-1px', lineHeight: 1.1, position: 'relative', display: 'inline-block' }}>
              Transform CSR Management
              <span style={{
                display: 'block',
                width: 80,
                height: 6,
                background: 'var(--accent-yellow)',
                borderRadius: 4,
                margin: '10px auto 0 auto',
              }}></span>
            </h1>
            <p style={{ fontSize: '1.35em', color: 'var(--muted)', maxWidth: 700, margin: '0 0 2.5em 0', lineHeight: 1.5 }}>
              The all-in-one platform for transparent, real-time, and impactful Corporate Social Responsibility.<br />
              Empower your team, NGOs, and clients with seamless project management, analytics, and compliance.
            </p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'flex-start', marginBottom: 36 }}>
              <button className="btn btn-success" style={{ fontSize: '1.1em', padding: '0.75em 2.5em', fontWeight: 700 }} onClick={() => navigate('/login')}>Get Started</button>
              <button className="btn btn-accent" style={{ fontSize: '1.1em', padding: '0.75em 2.5em', fontWeight: 700 }} onClick={() => navigate('/contact-us')}>Contact Us</button>
            </div>
          </div>
          {/* Right: Illustration */}
          <div style={{ flex: 1, minWidth: 280, maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="https://static.wixstatic.com/media/17f534_7b0f6271f4504c5696d534f2c7e339e5~mv2.jpg/v1/fill/w_925,h_486,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/17f534_7b0f6271f4504c5696d534f2c7e339e5~mv2.jpg"
              alt="Sarathi CSR Trust Illustration"
              style={{ width: '100%', maxWidth: 420, borderRadius: 20, boxShadow: '0 4px 32px rgba(33,150,83,0.07)' }}
            />
          </div>
        </div>
      </section>

      {/* Why Sarathi CSR Section */}
      <section style={{ width: '100%', background: 'linear-gradient(90deg, #f5fdf7 0%, #e0f7fa 100%)', padding: '3em 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2em' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: 32, fontWeight: 800, fontSize: '2em', textAlign: 'center' }}>Why Sarathi CSR?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Trusted by Leading Organizations</div>
              <div style={{ color: 'var(--muted)' }}>Used by NGOs, corporates, and partners across India for transparent CSR management.</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌏</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Sustainability at the Core</div>
              <div style={{ color: 'var(--muted)' }}>Designed to maximize positive impact and track sustainability goals in real time.</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Secure & Role-Based</div>
              <div style={{ color: 'var(--muted)' }}>Admins, clients, and NGOs each have their own secure, real-time dashboard.</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Instant Insights</div>
              <div style={{ color: 'var(--muted)' }}>Get analytics, compliance, and progress updates instantly—no waiting, no confusion.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section style={{ width: '100%', background: '#fff', padding: '3em 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2em' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: 32, fontWeight: 800, fontSize: '2em', textAlign: 'center' }}>Our Impact</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>100K+</div>
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>Beneficiaries Impacted</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>500+</div>
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>Projects Managed</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>200+</div>
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>NGOs & Partners</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>50+</div>
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>Cities Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* About CSR Section */}
      <section className="card" style={{ maxWidth: 900, margin: '0 auto 2em auto', padding: '2em' }}>
        <h2 style={{ color: 'var(--primary)' }}>What is CSR?</h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.1em' }}>
          Corporate Social Responsibility (CSR) is a self-regulating business model that helps a company be socially accountable—to itself, its stakeholders, and the public. Our platform makes CSR management easy, transparent, and measurable for all stakeholders.
        </p>
      </section>

      {/* Platform Features Section */}
      <section className="card" style={{ maxWidth: 900, margin: '0 auto 2em auto', padding: '2em' }}>
        <h2 style={{ color: 'var(--primary)' }}>Platform Features</h2>
        <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, listStyle: 'none', padding: 0, margin: 0 }}>
          <li><span style={{ fontSize: 24 }}>📊</span> Real-time analytics and dashboards</li>
          <li><span style={{ fontSize: 24 }}>📁</span> Document and compliance management</li>
          <li><span style={{ fontSize: 24 }}>💰</span> Budget allocation and expenditure tracking</li>
          <li><span style={{ fontSize: 24 }}>🔒</span> Role-based access for Admin, Client, NGO</li>
          <li><span style={{ fontSize: 24 }}>📝</span> Dynamic forms and progress tracking</li>
          <li><span style={{ fontSize: 24 }}>⚡</span> Instant notifications and activity logs</li>
        </ul>
      </section>

      {/* How It Works Section */}
      <section className="card" style={{ maxWidth: 900, margin: '0 auto 2em auto', padding: '2em' }}>
        <h2 style={{ color: 'var(--primary)' }}>How It Works</h2>
        <ol style={{ color: 'var(--muted)', fontSize: '1.1em', paddingLeft: 24 }}>
          <li>Admins create and manage clients, NGOs, and projects.</li>
          <li>Clients allocate budgets and monitor funded projects in real time.</li>
          <li>NGOs report progress, upload documents, and track their own impact.</li>
        </ol>
      </section>

      {/* Testimonials Section */}
      <section className="card" style={{ maxWidth: 900, margin: '0 auto 2em auto', padding: '2em' }}>
        <h2 style={{ color: 'var(--primary)' }}>What Our Users Say</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          <div style={{ flex: '1 1 250px', background: 'var(--secondary)', borderRadius: 8, padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌟</div>
            <blockquote style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
              “This platform made our CSR reporting effortless and transparent!”
            </blockquote>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Amit S. <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(NGO Lead)</span></div>
          </div>
          <div style={{ flex: '1 1 250px', background: 'var(--secondary)', borderRadius: 8, padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌟</div>
            <blockquote style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
              “I love the real-time analytics and easy document uploads.”
            </blockquote>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Priya K. <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Corporate Client)</span></div>
          </div>
          <div style={{ flex: '1 1 250px', background: 'var(--secondary)', borderRadius: 8, padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌟</div>
            <blockquote style={{ fontStyle: 'italic', color: 'var(--primary)' }}>
              “Finally, a CSR tool that everyone actually enjoys using.”
            </blockquote>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Ravi M. <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Admin)</span></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', color: 'var(--muted)', padding: '2em 0', marginTop: 40, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-dark)' }}>CSR Platform</div>
        <div style={{ margin: '0.5em 0' }}>&copy; {new Date().getFullYear()} All rights reserved.</div>
        <div style={{ fontSize: 18 }}>
          <a href="#" style={{ color: 'var(--primary)', margin: '0 0.5rem' }} aria-label="Twitter">🐦</a>
          <a href="#" style={{ color: 'var(--primary)', margin: '0 0.5rem' }} aria-label="LinkedIn">💼</a>
          <a href="#" style={{ color: 'var(--primary)', margin: '0 0.5rem' }} aria-label="Mail">✉️</a>
        </div>
      </footer>
    </div>
  );
};

export default Home; 