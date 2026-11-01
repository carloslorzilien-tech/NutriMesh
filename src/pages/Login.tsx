import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOS = [
  { label: 'Gran Hotel Europa', email: 'hotel.europa@nutrimesh.dev' },
  { label: 'Barceló Santo Domingo', email: 'barcelo@nutrimesh.dev' },
  { label: 'Banco de Alimentos BARD', email: 'coordinador@bard.org.do' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(email.includes('bard') ? '/banco' : '/hotel');
    } catch {
      setErr('Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (em: string) => { setEmail(em); setPassword('demo1234'); setErr(''); };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0A1A15', color: '#F4F1E8',
      fontFamily: "Inter, sans-serif",
    }}>
      {/* ── left column: form ─────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 420,
        display: 'flex', flexDirection: 'column',
        padding: '40px 48px',
        background: '#0A1A15',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {/* logo top-left (small) */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', marginBottom: 56,
          }}
        >
          <img src="/logo.svg" alt="NutriMesh" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span style={{
            fontFamily: "'Inter Tight', Inter, sans-serif",
            fontSize: 16, fontWeight: 600, color: '#10B981',
            letterSpacing: '-0.02em',
          }}>
            NutriMesh
          </span>
        </Link>

        {/* heading */}
        <h1 style={{
          fontFamily: "'Inter Tight', Inter, sans-serif",
          fontSize: 30, fontWeight: 560, letterSpacing: '-0.02em',
          color: '#F4F1E8', marginBottom: 8,
        }}>
          Bienvenido
        </h1>
        <p style={{ fontSize: 15, color: '#9DB0A6', marginBottom: 40, lineHeight: 1.6 }}>
          Ingresa con tu cuenta del piloto.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, fontWeight: 500,
              color: '#9DB0A6', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              Correo
            </label>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#12261F',
                border: '1px solid #1F3A31',
                borderRadius: 8, padding: '12px 16px',
                color: '#F4F1E8', fontSize: 15,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, fontWeight: 500,
              color: '#9DB0A6', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              Contraseña
            </label>
            <input
              type="password" required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#12261F',
                border: '1px solid #1F3A31',
                borderRadius: 8, padding: '12px 16px',
                color: '#F4F1E8', fontSize: 15,
                outline: 'none',
              }}
            />
          </div>

          {err && (
            <p style={{
              fontSize: 13, color: '#f87171',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 6, padding: '10px 14px',
            }}>
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#065f46' : '#10B981',
              color: '#04130E', fontWeight: 600, fontSize: 15,
              border: 'none', borderRadius: 8, cursor: loading ? 'wait' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* demo accounts */}
        <div style={{ marginTop: 40, borderTop: '1px solid #1F3A31', paddingTop: 28 }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, color: '#9DB0A6',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Cuentas del piloto · contraseña demo1234
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMOS.map(d => (
              <button
                key={d.email}
                type="button"
                onClick={() => fill(d.email)}
                style={{
                  background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer',
                  fontSize: 13, color: '#9DB0A6', padding: '4px 0',
                }}
              >
                {d.label} —{' '}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                  {d.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── right column: photo (hidden on mobile) ─────────── */}
      <div style={{
        flex: 1,
        backgroundImage: 'url(/img/hero-cocina.webp)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'saturate(0.85) contrast(1.05)',
        position: 'relative',
        display: 'none', // shown via media query below — we use inline check
      }}
        className="login-photo-col"
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #0A1A15 0%, transparent 40%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(16,185,129,0.06)',
        }} />
      </div>
    </div>
  );
}
