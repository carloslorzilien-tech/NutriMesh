/**
 * Login.tsx
 * Formulario de acceso al piloto NutriMesh.
 *
 * Reglas:
 *  - Fondo canvas #F9F8F3 — sin fondos oscuros.
 *  - Formulario a la izquierda (max 360 px). Foto a la derecha oculta en móvil.
 *  - Logo SVG a 28 px en la esquina, sin filtros CSS.
 *  - Título "Entrar" (no "Bienvenido").
 *  - Las cuentas del piloto aparecen debajo del botón en 13 px tinta suave.
 *    Al hacer clic se rellena el correo. Sin mostrar la contraseña. Sin "DEMO".
 *  - La foto no lleva texto encima.
 *  - No modifica lógica de auth, Firestore ni WhatsApp.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Paleta local — igual que en LandingPage ─────────────────── */
const C = {
  canvas:   '#F9F8F3',
  ink:      '#14211C',
  inkSoft:  '#5C675F',
  green:    '#059669',
  border:   '#E7E3D8',
  error:    '#B91C1C',
} as const;

/* ─── Cuentas del piloto ──────────────────────────────────────── */
// Al hacer clic en una cuenta se rellena solo el correo — la contraseña
// la escribe el usuario. No se muestra la contraseña en pantalla.
const PILOT_ACCOUNTS = [
  { label: 'Gran Hotel Europa',      email: 'hotel.europa@nutrimesh.dev' },
  { label: 'Barceló Santo Domingo',  email: 'barcelo@nutrimesh.dev' },
  { label: 'Coordinador del banco',  email: 'coordinador@bard.org.do' },
];

/* ─── Componente principal ────────────────────────────────────── */
export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  // Estado del formulario
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);

  // Envío del formulario — delega en AuthContext (Firebase o demo)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Redirige según el dominio del correo (bard → banco, cualquier otro → hotel)
      navigate(email.includes('bard') ? '/banco' : '/hotel');
    } catch {
      setErr('Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  // Al hacer clic en una cuenta del piloto, se rellena solo el correo
  const fillEmail = (em: string) => {
    setEmail(em);
    setPassword('');  // no prellenamos contraseña — el usuario la escribe
    setErr('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: C.canvas,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: C.ink,
    }}>

      {/* ── Columna izquierda: formulario ─────────────────────────── */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 48px',
        justifyContent: 'center',
      }}>

        {/* Logo en la esquina superior izquierda */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', marginBottom: 56,
            alignSelf: 'flex-start',
          }}
        >
          {/* SVG sin filtros CSS — el fill verde ya está en el archivo */}
          <img
            src="/logo.svg"
            alt="NutriMesh"
            width={28}
            height={28}
            style={{ objectFit: 'contain', display: 'block' }}
          />
          <span style={{
            fontSize: 16, fontWeight: 600,
            color: C.green, letterSpacing: '-0.02em',
          }}>
            NutriMesh
          </span>
        </Link>

        {/* Título */}
        <h1 style={{
          fontSize: 30, fontWeight: 520,
          letterSpacing: '-0.02em',
          color: C.ink, marginBottom: 8,
        }}>
          Entrar
        </h1>

        {/* Subtítulo de contexto */}
        <p style={{
          fontSize: 15, color: C.inkSoft,
          lineHeight: 1.6, marginBottom: 40,
        }}>
          Accede con tu cuenta del piloto.
        </p>

        {/* Formulario de acceso */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Campo correo */}
          <div className="field">
            <label htmlFor="login-email" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>
              Correo
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              style={{
                height: 44,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '0 12px',
                fontSize: 15,
                color: C.ink,
                background: '#fff',
                outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'border-color 0.15s',
                width: '100%', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = C.green)}
              onBlur={e  => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* Campo contraseña */}
          <div className="field">
            <label htmlFor="login-pass" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>
              Contraseña
            </label>
            <input
              id="login-pass"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                height: 44,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '0 12px',
                fontSize: 15,
                color: C.ink,
                background: '#fff',
                outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'border-color 0.15s',
                width: '100%', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = C.green)}
              onBlur={e  => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* Error de credenciales */}
          {err && (
            <p style={{
              fontSize: 13, color: C.error,
              background: 'rgba(185,28,28,0.06)',
              border: '1px solid rgba(185,28,28,0.2)',
              borderRadius: 6, padding: '10px 14px',
            }}>
              {err}
            </p>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 48,
              background: loading ? '#047857' : C.green,
              color: '#fff',
              fontWeight: 600, fontSize: 15,
              border: 'none',
              borderRadius: 9999,   // píldora
              cursor: loading ? 'wait' : 'pointer',
              marginTop: 8,
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* ── Cuentas del piloto ──────────────────────────────────── */}
        {/* Sin contraseña visible, sin la palabra "DEMO". */}
        {/* Clic en una cuenta rellena solo el correo. */}
        <div style={{ marginTop: 40, borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
          <p style={{
            fontSize: 11, fontWeight: 600,
            color: C.inkSoft, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            Cuentas del piloto
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PILOT_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillEmail(acc.email)}
                style={{
                  background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer',
                  padding: '4px 0',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {/* Nombre de la cuenta */}
                <span style={{ fontSize: 13, color: C.ink }}>{acc.label}</span>
                {' '}
                {/* Correo en tinta suave */}
                <span style={{ fontSize: 12, color: C.inkSoft }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Columna derecha: foto (oculta en móvil) ─────────────── */}
      {/* Sin texto encima de la imagen. Sin overlay oscuro. */}
      <div
        className="login-photo-col"   // visibilidad controlada por media query en global.css
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          padding: 16,                // margen de respiro alrededor de la tarjeta
          display: 'none',            // display:block cuando min-width 768px (global.css)
        }}
      >
        {/* Foto en tarjeta con radio 24 px, sin overlay ni filtro */}
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          height: '100%',
          minHeight: 480,
        }}>
          <img
            src="/img/chef-empacando.webp"
            alt="Chef empacando alimentos en cocina"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
