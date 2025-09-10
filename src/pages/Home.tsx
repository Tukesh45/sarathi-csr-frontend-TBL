import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

// --- Reusable Components for a Beautiful UI ---
const FeatureCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div className="feature-card">
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

const TestimonialCard = ({ quote, author, title }: { quote: string, author: string, title: string }) => (
    <div className="testimonial-card">
        <div className="icon">🌟</div>
        <blockquote>“{quote}”</blockquote>
        <div className="author-info">
            <strong>{author}</strong>
            <span>({title})</span>
        </div>
    </div>
);

const Home: React.FC = () => {
    const navigate = useNavigate();
    const reportRef = useRef<HTMLDivElement>(null);

    // --- All original state and logic is preserved ---
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
    const cNetWorth = netWorth >= 500;
    const cTurnover = turnover >= 1000;
    const cProfit = lastYearProfit >= 5;

    const isApplicable = cNetWorth || cTurnover || cProfit;

    const avgProfit = (() => {
        const y1 = parseNum(calc.net_profit_y1_crore);
        const y2 = parseNum(calc.net_profit_y2_crore);
        const y3 = parseNum(calc.net_profit_y3_crore);
        return (y1 + y2 + y3) / 3;
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
            if (calc.net_profit_y1_crore.trim() === '') {
                setCalcMsg('Please fill Net Profit Last Year (Cr).');
                setCalcSubmitting(false);
                return;
            }
            const payload = { ...calc, net_worth_crore: netWorth, turnover_crore: turnover, net_profit_y1_crore: lastYearProfit, net_profit_y2_crore: parseNum(calc.net_profit_y2_crore), net_profit_y3_crore: parseNum(calc.net_profit_y3_crore), applicable: isApplicable, obligation_crore: obligation };
            const { error } = await supabase.from('csr_calculator_entries').insert([payload]);
            if (error) throw error;
            setCalcMsg('Calculation saved!');
            setShowResult(true);
        } catch (err: any) {
            setCalcMsg(err.message || 'Error saving.');
        }
        setCalcSubmitting(false);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageCenter = pageWidth / 2;
        const margin = 20;
        let y = 30;

        const primaryColor = '#17643a';
        const textColor = '#1b3a2b';
        const mutedColor = '#6b9080';
        
        // --- Header ---
        doc.setFont('Philosopher', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(primaryColor);
        doc.text('Sarathi CSR', pageCenter, y, { align: 'center' });
        y += 8;
        
        doc.setFont('Philosopher', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text('Your Partner in Impactful CSR', pageCenter, y, { align: 'center' });
        y += 15;
        
        // --- Main Title ---
        doc.setFont('Philosopher', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(textColor);
        doc.text('CSR Applicability & Obligation Report', pageCenter, y, { align: 'center' });
        y += 5;
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.5);
        doc.line(pageCenter - 60, y, pageCenter + 60, y);
        y += 20;

        const drawSectionTitle = (title: string) => {
            doc.setFont('Philosopher', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(primaryColor);
            doc.text(title, margin, y);
            y += 8;
        };

        const drawDataItem = (label: string, value: string) => {
            doc.setFont('Philosopher', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(textColor);
            doc.text(`${label}:`, margin, y);
            doc.setFont('Philosopher', 'normal');
            doc.text(value, margin + 55, y);
            y += 7;
        };

        drawSectionTitle('Company Details');
        drawDataItem('Company Name', calc.company_name || 'N/A');
        drawDataItem('Financial Year', calc.financial_year || 'N/A');
        y += 10;

        drawSectionTitle('Financial Inputs (in ₹ Cr)');
        drawDataItem('Net Worth', netWorth.toFixed(2));
        drawDataItem('Turnover', turnover.toFixed(2));
        drawDataItem('Avg. Net Profit (3 Yrs)', avgProfit.toFixed(2));
        y += 10;

        drawSectionTitle('Assessment Result');
        if (isApplicable) {
            doc.setFont('Philosopher', 'bold');
            doc.setFontSize(16);
            doc.setTextColor('#16a34a');
            doc.text('CSR IS APPLICABLE', margin, y);
            y += 8;

            doc.setFont('Philosopher', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(mutedColor);
            doc.text(`Based on: ${criteriaMet.join(', ')}`, margin, y);
            y += 10;
            
            doc.setFont('Philosopher', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text('Estimated CSR Obligation:', margin, y);
            y += 8;

            doc.setFontSize(18);
            doc.setTextColor(primaryColor);
            doc.text(`₹ ${obligation.toFixed(2)} Cr`, margin, y);

        } else {
            doc.setFont('Philosopher', 'bold');
            doc.setFontSize(16);
            doc.setTextColor('#ef4444');
            doc.text('CSR IS NOT APPLICABLE', margin, y);
        }
        y = 230;

        drawSectionTitle('Start Your CSR Journey');
        doc.setFont('Philosopher', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.text("Let's connect to see how Sarathi CSR can help you manage and amplify your social impact.", margin, y);
        y += 7;
        doc.text("Email us at csr-support@sarathicsr.com or call +91 98765 43210.", margin, y);

        // --- Footer ---
        doc.line(margin, 280, pageWidth - margin, 280);
        doc.setFontSize(8);
        doc.setTextColor(mutedColor);
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, pageCenter, 285, { align: 'center' });

        doc.save(`CSR_Report_${calc.company_name || 'Analysis'}.pdf`);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                :root {
                  --font-philosopher: 'Philosopher', sans-serif;
                  --font-inter: 'Inter', sans-serif;
                }

                /* --- General Page Styles --- */
                .home-page { display: flex; flex-direction: column; min-height: 100vh; background: var(--surface); font-family: var(--font-inter); }
                h1,h2,h3,h4,h5,h6, .logo { font-family: var(--font-philosopher); }
                .header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2.5rem; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
                .logo { font-weight: 700; font-size: 1.75rem; color: var(--primary-dark); letter-spacing: -1px; }
                .nav-buttons { display: flex; align-items: center; gap: 1rem; }
                .section { padding: 5rem 2.5rem; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
                .section-title { text-align: center; font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 3rem; }

                /* --- Hero Section --- */
                .hero-section { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; padding: 6rem 2rem; background: linear-gradient(135deg, #f5fdf7 0%, #e0f7fa 100%);}
                .hero-content h1 { font-size: 3.5rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 1rem; letter-spacing: -1px; line-height: 1.1; }
                .hero-content p { font-size: 1.25rem; color: var(--muted); max-width: 700px; margin-bottom: 2.5rem; }
                .hero-image img { width: 100%; border-radius: 20px; box-shadow: var(--shadow); }

                /* --- Features & Testimonials --- */
                .features-grid, .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
                .feature-card, .testimonial-card { background: #fff; border-radius: var(--radius); padding: 2rem; text-align: center; box-shadow: var(--shadow); }
                .feature-card .icon, .testimonial-card .icon { font-size: 3rem; margin-bottom: 1rem; }
                .feature-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
                .feature-card p, .testimonial-card blockquote { color: var(--muted); line-height: 1.6; }
                .testimonial-card blockquote { font-style: italic; border: none; margin: 0; }
                .testimonial-card .author-info { margin-top: 1rem; font-weight: 600; }
                .testimonial-card .author-info span { color: var(--muted); font-weight: 400; }
                .impact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center;}
                .impact-item .value { font-size: 2.5rem; font-weight: 900; color: var(--primary); }
                .impact-item .label { color: var(--muted); font-weight: 600; }

                /* --- Calculator Section --- */
                .calculator-section { background: linear-gradient(120deg, #f0f7ff 0%, #e3f2fd 100%); }
                .calculator-wrapper { display: grid; grid-template-columns: 1fr 1.5fr; gap: 4rem; align-items: flex-start; }
                .calculator-info h2 { font-size: 2.5rem; text-align: left; }
                .calculator-info p { font-size: 1.1rem; color: var(--muted); line-height: 1.6; }
                .calculator-form { background: rgba(255,255,255,0.7); padding: 2.5rem; border-radius: 16px; box-shadow: var(--shadow); backdrop-filter: blur(10px); }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group { margin-bottom: 0.5rem; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--muted); font-size: 0.9rem; }
                .form-group input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: var(--radius); background-color: #fff; font-size: 1rem; color: var(--text); transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
                .form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(33, 150, 83, 0.1); }
                .required-mark { color: var(--danger); }
                .result-card { margin-top: 2rem; padding: 1.5rem; border-radius: var(--radius); text-align: center; animation: fadeIn 0.5s; }
                .result-card.applicable { background-color: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; }
                .result-card.not-applicable { background-color: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; }
                .result-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; font-weight: 700; }
                .result-card .obligation-amount { font-size: 2rem; font-weight: 800; }

                /* --- Footer --- */
                .footer { background: var(--surface); color: var(--muted); text-align: center; border-top: 1px solid var(--border); padding: 3rem 2.5rem; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 900px) { .hero-section, .calculator-wrapper { grid-template-columns: 1fr; text-align: center; } .hero-image { display: none; } .calculator-info h2 { text-align: center; } }
            `}</style>
            
            <div className="home-page">
                <header className="header">
                    <div className="logo">Sarathi CSR</div>
                    <nav className="nav-buttons">
                        <button className="btn btn-accent" onClick={() => document.getElementById('csr-calculator')?.scrollIntoView({ behavior: 'smooth' })}>
                            CSR Calculator
                        </button>
                        <button className="btn btn-success" onClick={() => navigate('/login')}>Login</button>
                    </nav>
                </header>

                <main>
                    <section className="section hero-section">
                        <div className="hero-content">
                            <h1>Transform Your CSR Management</h1>
                            <p>The all-in-one platform for transparent, real-time, and impactful Corporate Social Responsibility. Empower your team, NGOs, and clients with seamless project management, analytics, and compliance.</p>
                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                <button className="btn btn-success" style={{ fontSize: '1.1em', padding: '0.75em 2.5em', fontWeight: 700 }} onClick={() => navigate('/login')}>Get Started</button>
                                <button className="btn btn-accent" style={{ fontSize: '1.1em', padding: '0.75em 2.5em', fontWeight: 700 }} onClick={() => navigate('/contact-us')}>Contact Us</button>
                            </div>
                        </div>
                        <div className="hero-image">
                             <img src="https://static.wixstatic.com/media/17f534_7b0f6271f4504c5696d534f2c7e339e5~mv2.jpg/v1/fill/w_925,h_486,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/17f534_7b0f6271f4504c5696d534f2c7e339e5~mv2.jpg" alt="Sarathi CSR Trust Illustration" />
                        </div>
                    </section>

                    <section className="section features-section">
                        <h2 className="section-title">Why Sarathi CSR?</h2>
                        <div className="features-grid">
                            <FeatureCard icon="✅" title="Trusted & Transparent">Used by NGOs, corporates, and partners across India for clear and accountable CSR management.</FeatureCard>
                            <FeatureCard icon="🌏" title="Sustainability at the Core">Designed to maximize positive impact and track sustainability goals in real time.</FeatureCard>
                            <FeatureCard icon="🔒" title="Secure & Role-Based">Admins, clients, and NGOs each have their own secure, real-time dashboard.</FeatureCard>
                            <FeatureCard icon="⚡" title="Instant Insights">Get analytics, compliance, and progress updates instantly—no waiting, no confusion.</FeatureCard>
                        </div>
                    </section>

                    <section id="csr-calculator" className="section calculator-section">
                        <div className="calculator-wrapper">
                            <div className="calculator-info">
                                <h2 className="section-title">CSR Applicability Calculator</h2>
                                <p>Determine your company's Corporate Social Responsibility obligation under Section 135 of the Indian Companies Act, 2013. Enter your financial data in Crores (₹).</p>
                            </div>
                            <div className="calculator-form">
                                <form onSubmit={handleCalcSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group"><label>Company Name <span className="required-mark">*</span></label><input type="text" name="company_name" value={calc.company_name} onChange={handleCalcChange} required /></div>
                                        <div className="form-group"><label>Contact Email <span className="required-mark">*</span></label><input type="email" name="contact_email" value={calc.contact_email} onChange={handleCalcChange} required /></div>
                                        <div className="form-group full-width"><label>Financial Year <span className="required-mark">*</span></label><input type="text" name="financial_year" value={calc.financial_year} onChange={handleCalcChange} required /></div>
                                        <div className="form-group"><label>Net Worth (Cr) <span className="required-mark">*</span></label><input type="text" name="net_worth_crore" value={calc.net_worth_crore} onChange={handleCalcChange} required /></div>
                                        <div className="form-group"><label>Turnover (Cr) <span className="required-mark">*</span></label><input type="text" name="turnover_crore" value={calc.turnover_crore} onChange={handleCalcChange} required /></div>
                                        <div className="form-group"><label>Net Profit Last Year (Cr) <span className="required-mark">*</span></label><input type="text" name="net_profit_y1_crore" value={calc.net_profit_y1_crore} onChange={handleCalcChange} required /></div>
                                        <div className="form-group"><label>Net Profit Year -2 (Cr)</label><input type="text" name="net_profit_y2_crore" value={calc.net_profit_y2_crore} onChange={handleCalcChange} /></div>
                                        <div className="form-group full-width"><label>Net Profit Year -3 (Cr)</label><input type="text" name="net_profit_y3_crore" value={calc.net_profit_y3_crore} onChange={handleCalcChange} /></div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={calcSubmitting} style={{ width: '100%', padding: '0.75em', fontSize: '1.1rem', marginTop: '1rem' }}>
                                        {calcSubmitting ? 'Calculating...' : 'Calculate & Save'}
                                    </button>
                                </form>
                                {showResult && (
                                    <div className={`result-card ${isApplicable ? 'applicable' : 'not-applicable'}`}>
                                         <h3>{isApplicable ? "CSR is Applicable" : "CSR is Not Applicable"}</h3>
                                        {isApplicable && (
                                            <>
                                                <p style={{ margin: '0.5rem 0' }}>Based on: {criteriaMet.join(', ')}</p>
                                                <p>Your estimated CSR obligation is:</p>
                                                <p className="obligation-amount">₹ {obligation.toFixed(2)} Cr</p>
                                                <button onClick={handleDownloadPDF} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Download Professional Report</button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="section impact-section">
                        <h2 className="section-title">Our Impact</h2>
                        <div className="impact-grid">
                           <div className="impact-item"><div className="value">100K+</div><div className="label">Beneficiaries Impacted</div></div>
                           <div className="impact-item"><div className="value">500+</div><div className="label">Projects Managed</div></div>
                           <div className="impact-item"><div className="value">200+</div><div className="label">NGOs & Partners</div></div>
                           <div className="impact-item"><div className="value">50+</div><div className="label">Cities Reached</div></div>
                        </div>
                    </section>
                    
                    <section className="section testimonials-section">
                        <h2 className="section-title">What Our Users Say</h2>
                        <div className="testimonials-grid">
                            <TestimonialCard quote="This platform made our CSR reporting effortless and transparent!" author="Amit S." title="NGO Lead" />
                            <TestimonialCard quote="I love the real-time analytics and easy document uploads." author="Priya K." title="Corporate Client" />
                            <TestimonialCard quote="Finally, a CSR tool that everyone actually enjoys using." author="Ravi M." title="Admin" />
                        </div>
                    </section>

                    <footer className="footer">
                        <p>&copy; {new Date().getFullYear()} Sarathi CSR. All rights reserved.</p>
                    </footer>
                </main>
            </div>
        </>
    );
};

export default Home;

