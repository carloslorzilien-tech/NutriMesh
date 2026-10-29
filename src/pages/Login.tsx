// src/pages/Login.tsx — Acceso al Piloto NutriMesh
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import BrandLogo from '../components/BrandLogo';
import { AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Gran Hotel Europa', email: 'hotel.europa@nutrimesh.dev', password: 'demo1234' },
  { label: 'Barceló Santo Domingo', email: 'barcelo@nutrimesh.dev', password: 'demo1234' },
  { label: 'Banco de Alimentos (BARD)', email: 'coordinador@bard.org.do', password: 'demo1234' },
];

export default function Login() {
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      if (email.includes('bard')) navigate('/banco');
      else navigate('/hotel');
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (acc: typeof DEMO_ACCOUNTS[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setLocalError('');
  };

  const errorMsg = localError || authError;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-canvas)' }}>
      <Nav />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
        }}
      >
        <div style={{ maxWidth: 380, width: '100%' }}>
          {/* Isotipo Oficial logo.png */}
          <div style={{ marginBottom: 20 }}>
            <BrandLogo size={44} />
          </div>

          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 28,
              fontWeight: 520,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              marginBottom: 24,
            }}
          >
            Entrar
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label className="field__label" htmlFor="email-input">Correo</label>
              <input
                id="email-input"
                type="email"
                className="field__input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@bard.org.do"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className="field__input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || loading || !email || !password}
              style={{
                width: '100%',
                marginTop: 8,
                height: 44,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 9999,
              }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Tres links de texto para las cuentas demo */}
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 10 }}>
              Cuentas demo de prueba:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    color: 'var(--color-brand)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 450,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
