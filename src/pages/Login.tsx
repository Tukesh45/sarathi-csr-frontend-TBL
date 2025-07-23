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

    // 1. Authenticate with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError(authError?.message || 'Login failed');
      setLoading(false);
      return;
    }

    // 2. Check profiles table for role (if exists)
    let { data: profile } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', data.user.id)
      .single();
    console.log('DEBUG: user.id', data.user.id, 'profile:', profile);
    if (profile && profile.role) {
      if (profile.role === 'client') {
        navigate('/client-dashboard');
        setLoading(false);
        return;
      } else if (profile.role === 'ngo') {
        navigate('/ngo-dashboard');
        setLoading(false);
        return;
      } else if (profile.role === 'admin') {
        navigate('/admin-dashboard');
        setLoading(false);
        return;
      }
    }

    // 3. Fallback to new schema logic
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', data.user.id)
      .single();
    if (client) {
      navigate('/client-dashboard');
      setLoading(false);
      return;
    }
    let { data: ngo } = await supabase
      .from('ngos')
      .select('id')
      .eq('id', data.user.id)
      .single();
    if (ngo) {
      navigate('/ngo-dashboard');
      setLoading(false);
      return;
    }
    // Default to admin if not found in clients or ngos
    navigate('/admin-dashboard');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(120deg, #e8f5e9 0%, #e3f2fd 100%)', padding: '2em', overflow: 'hidden' }}>
      {/* Decorative SVG background */}
      <svg
        width="700" height="700" viewBox="0 0 700 700"
        style={{ position: 'absolute', top: '-120px', left: '-120px', zIndex: 0, opacity: 0.18, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <ellipse cx="350" cy="350" rx="320" ry="180" fill="#219653" />
        <ellipse cx="500" cy="200" rx="120" ry="60" fill="#2d9cdb" />
        <ellipse cx="200" cy="500" rx="100" ry="40" fill="#f2c94c" />
        <ellipse cx="600" cy="600" rx="80" ry="30" fill="#17643a" />
      </svg>
      {/* Moving Motivational Quote */}
      <div style={{ width: '100%', overflow: 'hidden', marginBottom: 32, position: 'relative', height: 40, zIndex: 2 }}>
        <div style={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          fontSize: 20,
          color: 'var(--primary-dark)',
          fontWeight: 700,
          animation: 'moveQuote 12s linear infinite',
        }}>
          "Together, we create a brighter, more sustainable future."
        </div>
      </div>
      <style>{`
        @keyframes moveQuote {
          0% { left: -60%; }
          100% { left: 110%; }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 3 }}>
        {/* Login Card */}
        <div className="card" style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(33,150,83,0.08)', padding: '2em', position: 'relative', zIndex: 4 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back</button>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <label>Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>Login</button>
            {error && <div className="form-feedback" style={{ marginTop: 12 }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 