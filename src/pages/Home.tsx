import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // CSR Calculator state
  const [calc, setCalc] = useState({
    company_name: '',
    contact_email: '',
    financial_year: '',
    net_worth_crore: '',
    turnover_crore: '',
    net_profit_y1_crore: '',
    net_profit_y2_crore: '',
    net_profit_y3_crore: '',
  });
  const [calcSubmitting, setCalcSubmitting] = useState(false);
  const [calcMsg, setCalcMsg] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Company info for footer (configure via environment)
  const COMPANY_NAME = process.env.REACT_APP_COMPANY_NAME || 'Sarathi CSR';
  const COMPANY_EMAIL = process.env.REACT_APP_COMPANY_EMAIL || 'csr-support@yourdomain.com';
  const COMPANY_PHONE = process.env.REACT_APP_COMPANY_PHONE || '+91 9876543210';
  const COMPANY_WEBSITE = process.env.REACT_APP_COMPANY_WEBSITE || '';
  const COMPANY_ADDRESS = process.env.REACT_APP_COMPANY_ADDRESS || '123 CSR Avenue, Pune City, India';

  // Softer input styling for elegant look
  const softInputStyle: React.CSSProperties = {
    padding: 12,
    border: '1px solid #eef2f7',
    borderRadius: 12,
    background: '#f9fafb'
  };

  // Report ref for PDF capture
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 32;
    const imgWidth = pageWidth - margin * 2;
    const ratio = imgWidth / canvas.width;
    const imgHeight = canvas.height * ratio;
    const renderHeight = Math.min(imgHeight, pageHeight - margin * 2);
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, renderHeight);
    pdf.save(`CSR_Applicability_${calc.company_name || 'Report'}.pdf`);
  };

  const handleCalcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalc({ ...calc, [e.target.name]: e.target.value });
  };

  const parseNum = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const netWorth = parseNum(calc.net_worth_crore);
  const turnover = parseNum(calc.turnover_crore);
  const lastYearProfit = parseNum(calc.net_profit_y1_crore);
  const cNetWorth = netWorth >= 500;  // ≥ ₹500 Cr
  const cTurnover = turnover >= 1000; // ≥ ₹1000 Cr
  const cProfit = lastYearProfit >= 5; // ≥ ₹5 Cr

  const isApplicable = cNetWorth || cTurnover || cProfit;

  const avgProfit = (() => {
    const y1 = parseNum(calc.net_profit_y1_crore);
    const y2 = parseNum(calc.net_profit_y2_crore);
    const y3 = parseNum(calc.net_profit_y3_crore);
    const values = [y1, y2, y3];
    const count = values.filter((x) => !isNaN(x)).length || 1;
    return (y1 + y2 + y3) / count;
  })();

  const obligation = isApplicable ? +(avgProfit * 0.02).toFixed(2) : 0;
  const criteriaMet = [
    cNetWorth ? 'Net Worth ≥ ₹500 Cr' : null,
    cTurnover ? 'Turnover ≥ ₹1000 Cr' : null,
    cProfit ? 'Net Profit (preceding year) ≥ ₹5 Cr' : null,
  ].filter(Boolean) as string[];

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcSubmitting(true);
    setCalcMsg('');
    setShowResult(false);
    try {
      // Require only last year's profit for CSR amount calculation (Y-2 and Y-3 optional now)
      if (calc.net_profit_y1_crore.trim() === '') {
        setCalcMsg('Please fill Net Profit Last Year (Cr).');
        setCalcSubmitting(false);
        return;
      }
      const payload = {
        company_name: calc.company_name || null,
        contact_email: calc.contact_email || null,
        financial_year: calc.financial_year || null,
        net_worth_crore: netWorth,
        turnover_crore: turnover,
        net_profit_y1_crore: parseNum(calc.net_profit_y1_crore),
        net_profit_y2_crore: parseNum(calc.net_profit_y2_crore),
        net_profit_y3_crore: parseNum(calc.net_profit_y3_crore),
        applicable: isApplicable,
        obligation_crore: obligation,
      };
      const { error } = await supabase.from('csr_calculator_entries').insert([payload]);
      if (error) throw error;
      setCalcMsg('Saved!');
      setShowResult(true);
    } catch (err: any) {
      setCalcMsg(err.message || 'Error saving.');
    }
    setCalcSubmitting(false);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-accent"
            onClick={() => {
              const el = document.getElementById('csr-calculator');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            CSR Applicability for Free
          </button>
          <button className="btn btn-success" onClick={() => navigate('/login')}>Login</button>
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

      {/* CSR Applicability Calculator */}
      <section id="csr-calculator" className="card" style={{ maxWidth: 980, margin: '0 auto 3em auto', padding: 0, borderRadius: 0, boxShadow: 'none', background: 'transparent' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: 8, fontWeight: 900, letterSpacing: '-0.5px' }}>CSR Applicability Calculator</h2>
        <div style={{ color: '#6b7280', marginBottom: 18, fontSize: 14 }}>Fields marked with <span style={{ color: '#dc2626' }}>*</span> are required.</div>
        <form onSubmit={handleCalcSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Company Name <span style={{ color: '#dc2626' }}>*</span></span>
            <input required name="company_name" placeholder="Company Name" value={calc.company_name} onChange={handleCalcChange} style={softInputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Contact Email <span style={{ color: '#dc2626' }}>*</span></span>
            <input required type="email" name="contact_email" placeholder="Contact Email" value={calc.contact_email} onChange={handleCalcChange} style={softInputStyle} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Financial Year <span style={{ color: '#dc2626' }}>*</span></span>
            <input required name="financial_year" placeholder="e.g., 2024-25" value={calc.financial_year} onChange={handleCalcChange} style={softInputStyle} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Net Worth (Cr) <span style={{ color: '#dc2626' }}>*</span></span>
            <input required type="number" step="0.01" name="net_worth_crore" placeholder="0.00" value={calc.net_worth_crore} onChange={handleCalcChange} style={softInputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Turnover (Cr) <span style={{ color: '#dc2626' }}>*</span></span>
            <input required type="number" step="0.01" name="turnover_crore" placeholder="0.00" value={calc.turnover_crore} onChange={handleCalcChange} style={softInputStyle} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Net Profit Last Year (Cr) <span style={{ color: '#dc2626' }}>*</span></span>
            <input required type="number" step="0.01" name="net_profit_y1_crore" placeholder="0.00" value={calc.net_profit_y1_crore} onChange={handleCalcChange} style={softInputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Net Profit Year -2 (Cr)</span>
            <input type="number" step="0.01" name="net_profit_y2_crore" placeholder="0.00" value={calc.net_profit_y2_crore} onChange={handleCalcChange} style={softInputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>Net Profit Year -3 (Cr)</span>
            <input type="number" step="0.01" name="net_profit_y3_crore" placeholder="0.00" value={calc.net_profit_y3_crore} onChange={handleCalcChange} style={softInputStyle} />
          </label>

          {/* Criteria badges & results only after Save */}
          {showResult && (
            <>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 12, border: '1px solid #e5e7eb', background: cNetWorth ? '#ecfdf5' : '#fff' }}>
                  <div style={{ fontWeight: 800, color: '#111827' }}>Net Worth ≥ ₹500 Cr</div>
                  <div style={{ color: cNetWorth ? '#16a34a' : '#6b7280' }}>{cNetWorth ? 'Meets' : 'Does not meet'}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, border: '1px solid #e5e7eb', background: cTurnover ? '#ecfdf5' : '#fff' }}>
                  <div style={{ fontWeight: 800, color: '#111827' }}>Turnover ≥ ₹1000 Cr</div>
                  <div style={{ color: cTurnover ? '#16a34a' : '#6b7280' }}>{cTurnover ? 'Meets' : 'Does not meet'}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, border: '1px solid #e5e7eb', background: cProfit ? '#ecfdf5' : '#fff' }}>
                  <div style={{ fontWeight: 800, color: '#111827' }}>Net Profit ≥ ₹5 Cr (preceding year)</div>
                  <div style={{ color: cProfit ? '#16a34a' : '#6b7280' }}>{cProfit ? 'Meets' : 'Does not meet'}</div>
                </div>
              </div>

              {/* Report container for PDF */}
              <div ref={reportRef} style={{ gridColumn: '1 / -1', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginTop: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, color: '#111827' }}>CSR Applicability Report</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f9fafb', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Organization</div>
                    <div>Company: {calc.company_name || '-'}</div>
                    <div>Email: {calc.contact_email || '-'}</div>
                    <div>Financial Year: {calc.financial_year || '-'}</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Inputs (in ₹ Cr)</div>
                    <div>Net Worth: {netWorth || 0}</div>
                    <div>Turnover: {turnover || 0}</div>
                    <div>Net Profit (Last Year): {parseNum(calc.net_profit_y1_crore) || 0}</div>
                    <div>Net Profit (Year -2): {parseNum(calc.net_profit_y2_crore) || 0}</div>
                    <div>Net Profit (Year -3): {parseNum(calc.net_profit_y3_crore) || 0}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12, background: 'linear-gradient(180deg,#ffffff,#f3f4f6)', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isApplicable ? '#16a34a' : '#dc2626' }}>
                    Applicability: {isApplicable ? 'Applicable' : 'Not Applicable'}
                  </div>
                  <div style={{ marginTop: 6, color: '#374151' }}>
                    {isApplicable ? (
                      <>
                        <div style={{ marginBottom: 6 }}>Criteria met: {criteriaMet.join(', ') || '-'}</div>
                        <div><strong>Estimated CSR Obligation (2% of Avg Profit):</strong> ₹ {obligation.toFixed(2)} Cr</div>
                      </>
                    ) : (
                      <div>Does not meet any applicability criteria.</div>
                    )}
                  </div>
                </div>

                {/* Company footer */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #e5e7eb', color: '#374151' }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>Get in Touch</div>
                  <div style={{ marginBottom: 8, color: '#6b7280' }}>Our team is here to help you start your sustainability journey</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{COMPANY_NAME}</div>
                      {COMPANY_WEBSITE && <div>🌐 Website: {COMPANY_WEBSITE}</div>}
                    </div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {COMPANY_EMAIL && <div>✉️ Email: {COMPANY_EMAIL}</div>}
                      {COMPANY_PHONE && <div>📞 Phone: {COMPANY_PHONE}</div>}
                      {COMPANY_ADDRESS && <div>📍 Address: {COMPANY_ADDRESS}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-success" type="submit" disabled={calcSubmitting}>Save</button>
            {showResult && (
              <button type="button" className="btn btn-secondary" onClick={handleDownloadPDF}>Download Report (PDF)</button>
            )}
            {calcMsg && <div className="form-feedback" style={{ color: calcMsg === 'Saved!' ? '#16a34a' : '#dc2626' }}>{calcMsg}</div>}
          </div>
        </form>
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