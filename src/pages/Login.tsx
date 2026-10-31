import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOS = [
  { label: 'Gran Hotel Europa', email: 'hotel.europa@nutrimesh.dev' },
  { label: 'Barceló Santo Domingo', email: 'barcelo@nutrimesh.dev' },
  { label: 'Food bank — BARD', email: 'coordinador@bard.org.do' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(email.includes('bard') ? '/banco' : '/hotel');
    } catch {
      setErr('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (em: string) => {
    setEmail(em);
    setPassword('demo1234');
    setErr('');
  };

  return (
    <div className="login-wrap">

      {/* Logo — prominent, centered */}
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <img src="/logo.svg" alt="NutriMesh" width={56} height={56} style={{ objectFit: 'contain' }} />
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.02em' }}>NutriMesh</span>
      </div>

      <div className="login-box">
        <h1 style={{ fontSize: 24, fontWeight: 520, letterSpacing: '-0.02em', marginBottom: 24 }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="stack stack-md">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {err && <p className="field-error">{err}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <hr className="divider" />

        <div className="stack stack-sm">
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Demo accounts — password is <span className="mono">demo1234</span></p>
          {DEMOS.map(d => (
            <button key={d.email} className="demo-link" onClick={() => fill(d.email)} style={{ textAlign: 'left' }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
