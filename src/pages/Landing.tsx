// src/pages/Landing.tsx — Home editorial Ashoka / Google
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-canvas)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Nav />

      {/* Bloque Principal */}
      <main
        style={{
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          padding: '32px 28px 56px',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 380px)',
            gap: 56,
            alignItems: 'center',
          }}
          className="home-main-grid"
        >
          {/* Lado izquierdo */}
          <div>
            <h1
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(38px, 4.8vw, 58px)',
                fontWeight: 520,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                lineHeight: 1.08,
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              La cocina cierra.
              <br />
              El banco sale.
            </h1>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
                color: 'var(--color-ink-muted)',
                lineHeight: 1.5,
                maxWidth: '44ch',
                marginBottom: 36,
                textAlign: 'left',
              }}
            >
              Dos hoteles avisan lo que sobró. Un chofer lo recoge con un link. El banco pesa lo que de verdad llegó.
            </p>

            <div>
              {/* Botón Home: Lima #C6F54E con texto #14211C */}
              <Link
                to="/login"
                className="btn"
                style={{
                  display: 'inline-block',
                  background: 'var(--color-lima, #C6F54E)',
                  color: '#14211C',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '12px 32px',
                  borderRadius: 9999,
                  border: 'none',
                  textDecoration: 'none',
                }}
              >
                Abrir el piloto
              </Link>
            </div>
          </div>

          {/* Lado derecho: bloque sólido #14372C, texto #F9F8F3, sin borde */}
          <div
            style={{
              background: '#14372C',
              color: '#F9F8F3',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 280,
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  color: '#F9F8F3',
                  opacity: 0.85,
                  marginBottom: 16,
                }}
              >
                HOY · GRAN HOTEL EUROPA
              </div>

              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 28,
                  fontWeight: 520,
                  letterSpacing: '-0.03em',
                  color: '#F9F8F3',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Proteínas, <span style={{ fontFamily: 'var(--font-mono)' }}>70 °C</span>
              </div>

              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#B7D8C6',
                }}
              >
                vence en <span style={{ fontFamily: 'var(--font-mono)' }}>2 h</span>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#F9F8F3',
                opacity: 0.7,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid rgba(249, 248, 243, 0.15)',
              }}
            >
              el banco todavía no lo ha pesado
            </div>
          </div>
        </div>
      </main>

      {/* Tres bandas a ancho completo, en tres verdes, sin rojo ni amarillo */}
      <section style={{ width: '100%', marginTop: 'auto' }}>
        {/* Banda 1: #14372C, texto crema */}
        <div
          style={{
            width: '100%',
            background: '#14372C',
            color: '#F9F8F3',
            padding: '24px 28px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 40,
                fontWeight: 520,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>33.9 kg</span>
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 400,
                opacity: 0.9,
              }}
            >
              lo que el banco ya pesó
            </span>
          </div>
        </div>

        {/* Banda 2: #059669, texto crema */}
        <div
          style={{
            width: '100%',
            background: 'var(--color-brand, #059669)',
            color: '#F9F8F3',
            padding: '24px 28px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 40,
                fontWeight: 520,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>84</span> raciones
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 400,
                opacity: 0.9,
              }}
            >
              supuesto, <span style={{ fontFamily: 'var(--font-mono)' }}>0.4 kg</span> cada una
            </span>
          </div>
        </div>

        {/* Banda 3: #E5F2EB, texto #14372C */}
        <div
          style={{
            width: '100%',
            background: '#E5F2EB',
            color: '#14372C',
            padding: '24px 28px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 40,
                fontWeight: 520,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>1</span> lote rechazado
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 400,
                opacity: 0.9,
              }}
            >
              salió frío
            </span>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 820px) {
          .home-main-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </div>
  );
}
