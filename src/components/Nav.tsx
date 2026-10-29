// src/components/Nav.tsx — Header transparente estilo Ashoka / Google
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { Menu, X } from 'lucide-react';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        width: '100%',
        background: 'transparent',
        padding: '24px 28px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Izquierda: Isotipo Oficial a 32px + palabra NutriMesh en Inter 18px peso 600 color #059669 */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
          aria-label="NutriMesh — Inicio"
        >
          <BrandLogo size={32} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-brand)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            NutriMesh
          </span>
        </Link>

        {/* Derecha Desktop: Hotel, Banco, Impacto en 14px tinta, y Entrar/Salir como link verde */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
          className="desktop-nav"
        >
          <Link
            to="/hotel"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 450,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Hotel
          </Link>

          <Link
            to="/banco"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 450,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Banco
          </Link>

          <Link
            to="/impacto"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 450,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Impacto
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: 'var(--color-brand)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none',
              }}
            >
              Salir ({user.name.split(' ')[0]})
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                background: 'transparent',
                color: 'var(--color-brand)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Entrar
            </Link>
          )}
        </nav>

        {/* Menú móvil trigger */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="mobile-nav-trigger"
          style={{
            background: 'none',
            border: 'none',
            color: '#1A1F1C',
            cursor: 'pointer',
            padding: 8,
            display: 'none',
          }}
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#F3EFE4',
            borderTop: '1px solid rgba(26, 31, 28, 0.1)',
            marginTop: 16,
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          className="mobile-menu-body"
        >
          <Link
            to="/hotel"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Hotel
          </Link>
          <Link
            to="/banco"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Banco
          </Link>
          <Link
            to="/impacto"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              color: '#1A1F1C',
              textDecoration: 'none',
            }}
          >
            Impacto
          </Link>
          {user ? (
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              style={{
                background: 'transparent',
                color: 'var(--color-brand)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
              }}
            >
              Salir
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'var(--color-brand)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Entrar
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-trigger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
