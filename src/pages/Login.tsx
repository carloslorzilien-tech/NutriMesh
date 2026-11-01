import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG logo — 96 px, centered, no white box
const LOGO_SRC = '/logo.svg';

const DEMOS = [
  { label: 'Gran Hotel Europa', email: 'hotel.europa@nutrimesh.dev' },
  { label: 'Barceló Santo Domingo', email: 'barcelo@nutrimesh.dev' },
  { label: 'Banco de Alimentos — BARD', email: 'coordinador@bard.org.do' },
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
      if (email.trim().includes('bard')) {
        navigate('/banco');
      } else {
        navigate('/hotel');
      }
    } catch {
      setErr('Credenciales incorrectas.');
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
      {/* Logo — 96 px, centered, plenty of air */}
      <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <img
          src={LOGO_SRC}
          alt="NutriMesh"
          width={96}
          height={96}
          style={{ objectFit: 'contain', display: 'block' }}
        />
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.02em' }}>
          NutriMesh
        </span>
      </div>

      <div className="login-box">
        <h1 style={{ fontSize: 24, fontWeight: 520, letterSpacing: '-0.02em', marginBottom: 24 }}>
          Entrar
        </h1>

        <form onSubmit={handleSubmit} className="stack stack-md">
          <div className="field">
            <label>Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {err && <p className="notice">{err}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <hr className="divider" />

        <div className="stack stack-sm">
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>
            Cuentas demo — contraseña <span className="mono">demo1234</span>
          </p>
          {DEMOS.map(d => (
            <button key={d.email} type="button" className="demo-link" onClick={() => fill(d.email)} style={{ textAlign: 'left' }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
