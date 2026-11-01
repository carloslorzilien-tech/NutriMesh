import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import { IS_FIREBASE } from '../lib/firebase';
import logoPng from '../assets/logo.png';

export default function Nav() {
  const { user, logout } = useAuth();
  const { lines } = useActivity();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <img src={logoPng} alt="NutriMesh" width={32} height={32} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span className="nav-brand-name">NutriMesh</span>
        </Link>

        <div className="nav-links">
          {!IS_FIREBASE && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>DEMO</span>
          )}

          {/* Activity button */}
          {user && (
            <button
              className="nav-link-action"
              onClick={() => setOpen(o => !o)}
              style={{ position: 'relative' }}
              aria-label="Actividad reciente"
            >
              Actividad
              {lines.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -8,
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--green)',
                }} />
              )}
            </button>
          )}

          {user ? (
            <button className="nav-link-action" onClick={handleLogout}>Salir</button>
          ) : (
            <Link to="/login" className="nav-link-action">Entrar</Link>
          )}
        </div>
      </nav>

      {/* Activity drawer */}
      {open && user && (
        <div
          style={{
            position: 'fixed', top: 60, right: 0, width: 320,
            background: 'var(--surface)', borderLeft: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)', zIndex: 200,
            padding: '16px 20px', boxShadow: '-4px 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '0.06em', marginBottom: 12 }}>
            ACTIVIDAD
          </p>
          {lines.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Sin actividad aún.</p>
          ) : (
            <div className="stack stack-sm">
              {lines.map(l => (
                <p key={l.id} style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{l.text}</p>
              ))}
            </div>
          )}
          <button
            onClick={() => setOpen(false)}
            style={{ marginTop: 16, background: 'none', border: 'none', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer', padding: 0 }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
