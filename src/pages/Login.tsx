import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError || !authData.user) {
                throw authError || new Error('Login failed. Please check your credentials.');
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                throw new Error('Could not find user profile.');
            }

            if (profile.role === 'Platform Admin') {
                navigate('/admin-dashboard');
            } else if (profile.role === 'Client User') {
                const { data: clientLink, error: linkError } = await supabase
                    .from('client_users')
                    .select('client_id')
                    .eq('user_id', authData.user.id)
                    .single();
                if (linkError || !clientLink) throw new Error('Client user is not linked to a company.');
                navigate(`/client/${clientLink.client_id}`);
            } else if (profile.role === 'NGO User') {
                const { data: ngoLink, error: linkError } = await supabase
                    .from('ngo_users')
                    .select('ngo_id')
                    .eq('user_id', authData.user.id)
                    .single();
                if (linkError || !ngoLink) throw new Error('NGO user is not linked to an organization.');
                navigate(`/ngo/${ngoLink.ngo_id}`);
            } else {
                setError('You do not have a role assigned. Access denied.');
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                :root {
                    --radius: 1rem;
                    --primary: #219653;
                }
                .login-page-container {
                    min-height: 100vh; position: relative;
                    background: linear-gradient(120deg, #e8f5e9 0%, #e3f2fd 100%);
                    padding: 2em; overflow: hidden; display: flex;
                    align-items: center; justify-content: center; box-sizing: border-box;
                }
                .login-content-wrapper {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
                    align-items: center; width: 100%; max-width: 1000px; margin: 0 auto;
                    position: relative; z-index: 3; background: rgba(255, 255, 255, 0.6);
                    padding: 3rem; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .feature-highlight h1 { font-size: 2.5rem; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 1rem; }
                .feature-highlight p { font-size: 1.1rem; color: var(--muted); line-height: 1.6; }
                .login-card h2 { text-align: center; margin-bottom: 2rem; font-size: 1.8rem; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--muted); font-size: 0.9rem; }
                .form-group input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: var(--radius); background-color: #fff; font-size: 1rem; color: var(--text); transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
                .form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(33, 150, 83, 0.1); }
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius);
                    border: 1px solid transparent;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .btn:hover {
                    opacity: 0.9;
                    transform: scale(1.05);
                    transition: transform 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                .btn-primary {
                    background-color: var(--primary);
                    color: #fff;
                }
                .btn-primary:hover {
                    opacity: 0.9;
                    transform: scale(1.05);
                    transition: transform 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                @media (max-width: 900px) {
                    .login-content-wrapper { grid-template-columns: 1fr; padding: 2rem; }
                    .feature-highlight { display: none; }
                }
            `}</style>
            <div className="login-page-container">
                <div className="login-content-wrapper">
                    <div className="feature-highlight">
                        <h1>Welcome to Sarathi CSR</h1>
                        <p>Empowering corporations and NGOs to create a lasting social impact. Track your projects, manage budgets, and measure your success, all in one platform.</p>
                    </div>
                    <div className="login-card">
                        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Secure Login
                        </h2>
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.75em', fontSize: '1.1rem' }}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                            {error && <div className="form-feedback" style={{ marginTop: '1rem', color: 'var(--danger)', textAlign: 'center' }}>{error}</div>}
                        </form>
                        <button className="btn" onClick={() => navigate('/')} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', boxShadow: 'none', marginTop: '1rem' }}>← Go to Homepage</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;