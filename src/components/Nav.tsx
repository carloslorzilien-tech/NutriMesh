/**
 * Nav.tsx — Barra de navegación unificada para rutas autenticadas
 *
 * Características:
 *  - 64px de altura con fondo #134E3A (--bar), fija en la parte superior.
 *  - Isotipo oficial SVG a 28px en blanco y "NutriMesh" en Outfit 18px.
 *  - Botón "Actividad" (con indicador si hay eventos recientes) y botón "Salir".
 *  - En rutas autenticadas NO se incluye el botón "Entrar".
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';

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
        {/* Identidad de marca a la izquierda */}
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

        {/* Acciones de sesión a la derecha */}
        <div className="nav-links">
          {user && (
            <button
              className="nav-link-action"
              onClick={() => setOpen(o => !o)}
              style={{ position: 'relative' }}
              aria-label="Ver actividad reciente"
            >
              Actividad
              {lines.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--brand)',
                  }}
                />
              )}
            </button>
          )}

          {user && (
            <button className="nav-link-action" onClick={handleLogout}>
              Salir
            </button>
          )}
        </div>
      </nav>

      {/* Panel desplegable de actividad reciente */}
      {open && user && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            right: 0,
            width: 320,
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            zIndex: 200,
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p className="section-title" style={{ marginBottom: 12 }}>
            Actividad del sistema
          </p>
          {lines.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Sin actividad aún.</p>
          ) : (
            <div className="stack stack-sm">
              {lines.map(l => (
                <p key={l.id} style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
                  {l.text}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: 14,
              background: 'none',
              border: 'none',
              fontSize: 12,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
