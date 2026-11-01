/**
 * Login.tsx — Formulario de acceso al piloto NutriMesh
 *
 * Características:
 *  - Barra superior de 64px fija (#134E3A) con isotipo blanco y "NutriMesh".
 *  - Formulario a la izquierda sobre lienzo crema (ancho máximo 360px), título "Entrar".
 *  - Fotografía cocina-acero.webp a la derecha en tarjeta con radio 24px (oculta en móvil).
 *  - Cuentas del piloto al pie del formulario en 13px tinta suave: al hacer clic,
 *    se autocompleta el correo electrónico sin exponer contraseñas ni usar la palabra DEMO.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Cuentas del piloto operativo para acceso directo
const CUENTAS_PILOTO = [
  { nombre: 'Gran Hotel Europa', correo: 'hotel.europa@nutrimesh.dev' },
  { nombre: 'Barceló Santo Domingo', correo: 'barcelo@nutrimesh.dev' },
  { nombre: 'Coordinador del Banco', correo: 'coordinador@bard.org.do' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Procesamiento de autenticación con redirección según rol
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      // Redirige al panel correspondiente según el dominio o rol
      if (email.includes('bard')) {
        navigate('/banco');
      } else {
        navigate('/hotel');
      }
    } catch {
      setErrorMsg('Credenciales no válidas. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  // Clic en cuenta: autocompleta el correo seleccionado
  const seleccionarCuenta = (correo: string) => {
    setEmail(correo);
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      {/* ── Barra unificada de 64px ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <img
            src="/logo.svg"
            alt="NutriMesh"
            width={28}
            height={28}
            style={{ objectFit: 'contain', display: 'block' }}
          />
          <span className="nav-brand-name">NutriMesh</span>
        </Link>
      </nav>

      {/* ── Contenedor principal a dos columnas ── */}
      <div
        style={{
          paddingTop: 64,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
        }}
      >
        {/* Columna izquierda: formulario de 360px */}
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
            <h1
              className="t-head"
              style={{
                fontSize: 32,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              Entrar
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 36 }}>
              Accede al piloto con tu cuenta de cocina o logística.
            </p>

            <form onSubmit={handleSubmit} className="stack stack-md">
              <div className="field">
                <label htmlFor="input-email">Correo</label>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="input-password">Contraseña</label>
                <input
                  id="input-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {errorMsg && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--reject)',
                    background: 'rgba(198, 71, 63, 0.08)',
                    border: '1px solid rgba(198, 71, 63, 0.25)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: 8 }}
              >
                {loading ? 'Accediendo…' : 'Entrar'}
              </button>
            </form>

            {/* Listado de cuentas del piloto */}
            <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p className="section-title" style={{ marginBottom: 14 }}>
                Cuentas del piloto
              </p>
              <div className="stack stack-sm">
                {CUENTAS_PILOTO.map(cuenta => (
                  <button
                    key={cuenta.correo}
                    type="button"
                    onClick={() => seleccionarCuenta(cuenta.correo)}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '4px 0',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>{cuenta.nombre}</span>
                    {' — '}
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{cuenta.correo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: foto con radio 24px (oculta en dispositivos móviles) */}
        <div
          className="login-photo-col"
          style={{
            flex: 1,
            padding: 24,
            display: 'none',
          }}
        >
          <div
            style={{
              borderRadius: 'var(--radius-photo)',
              overflow: 'hidden',
              height: '100%',
              minHeight: 520,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <img
              src="/img/cocina-acero.webp"
              alt="Área de cocina profesional en acero"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
