/**
 * LandingPage.tsx
 * Portada pública de NutriMesh — visible cuando no hay sesión activa.
 *
 * Reglas:
 *  - Fondo canvas #F9F8F3. Cero fondos oscuros, cero overlay sobre la foto.
 *  - Solo Inter. Sin Plus Jakarta Sans, sin fuentes mono en portada.
 *  - Verde #059669 exclusivamente en logo, botón primario y la palabra "Entrar".
 *  - Sin carrusel, sin frases de ONG, sin mencionar al Banco de Alimentos BARD.
 *  - Métricas en vivo desde Firestore (lotes RECIBIDO → acceptedKg). Sin animación.
 *  - No modifica lotes, WhatsApp, Firestore rules ni auth.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeBatches } from '../lib/store';
import type { Batch } from '../lib/types';

/* ─── Constantes visuales ─────────────────────────────────────── */

// Paleta — solo se usa aquí para no mezclar con el CSS de los dashboards.
const C = {
  canvas:   '#F9F8F3',   // fondo de toda la portada
  ink:      '#14211C',   // texto principal
  inkSoft:  '#5C675F',   // texto secundario
  green:    '#059669',   // único acento: logo, botón, "Entrar"
  border:   '#E7E3D8',   // líneas divisoras de 1 px
} as const;

/* ─── Navbar ──────────────────────────────────────────────────── */
// Fija en la parte superior. Fondo canvas sólido, sin blur ni transparencia.
// Izquierda: logo SVG + nombre en verde. Derecha: único botón píldora "Entrar".
function LandingNav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60, padding: '0 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: C.canvas,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {/* Logo: SVG a 28 px, sin filtros CSS — el fill #059669 ya está en el SVG */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img
          src="/logo.svg"
          alt="NutriMesh"
          width={28}
          height={28}
          style={{ objectFit: 'contain', display: 'block' }}
        />
        <span style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 17, fontWeight: 600, color: C.green,
          letterSpacing: '-0.02em',
        }}>
          NutriMesh
        </span>
      </Link>

      {/* Botón píldora "Entrar" — único elemento a la derecha */}
      <Link
        to="/login"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14, fontWeight: 600,
          background: C.green, color: '#fff',
          padding: '8px 22px', borderRadius: 9999,
          textDecoration: 'none',
        }}
      >
        Entrar
      </Link>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
// Dos columnas: izquierda texto (55 %), derecha foto en tarjeta (45 %).
// Sin overlay oscuro, sin filtro sobre la imagen.
function Hero() {
  return (
    <section style={{
      paddingTop: 60,                   // compensa la navbar fija de 60 px
      minHeight: '100vh',
      background: C.canvas,
      display: 'flex', alignItems: 'stretch',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1280, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '55fr 45fr',
        gap: 0,
      }}
        className="hero-grid"           // media query en global.css lo convierte a 1 col en móvil
      >
        {/* Columna izquierda: copia */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(48px, 8vw, 96px) 48px clamp(48px, 8vw, 96px) clamp(32px, 5vw, 80px)',
        }}>
          {/* Etiqueta pequeña de contexto */}
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
            color: C.green, textTransform: 'uppercase', marginBottom: 20,
          }}>
            Piloto · Santo Domingo, RD
          </p>

          {/* H1: máx. 2 líneas, tamaño fluido */}
          <h1 style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 520,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            color: C.ink,
            margin: '0 0 24px',
          }}>
            La cocina cierra.<br />El banco sale por la mañana.
          </h1>

          {/* Subtítulo 18 px en tinta suave */}
          <p style={{
            fontSize: 18, lineHeight: 1.6,
            color: C.inkSoft,
            maxWidth: 480, margin: '0 0 40px',
          }}>
            El hotel anota lo que nunca salió a la barra.
            El banco lo pesa al llegar.
          </p>

          {/* Único botón primario */}
          <div>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 16, fontWeight: 600,
                background: C.green, color: '#fff',
                padding: '14px 36px', borderRadius: 9999,
                textDecoration: 'none',
              }}
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Columna derecha: foto en tarjeta */}
        <div
          style={{
            padding: 'clamp(32px, 5vw, 64px) clamp(32px, 5vw, 64px) clamp(32px, 5vw, 64px) 0',
          }}
          className="hero-photo-col"   // media query lo oculta en móvil
        >
          {/* Tarjeta con radio 24 px, sin overlay ni filtro */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            height: '70vh',
            minHeight: 400,
            position: 'relative',
          }}>
            <img
              src="/img/cocina-dinamica.webp"
              alt="Cocina profesional de hotel"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                display: 'block',
              }}
              // priority equivalente: cargamos sin lazy en el hero
              loading="eager"
            />
          </div>

          {/* Crédito de foto en 12 px */}
          <p style={{
            marginTop: 8, fontSize: 12,
            color: C.inkSoft, textAlign: 'right',
            paddingRight: 4,
          }}>
            Foto: Unsplash
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Métricas en vivo ────────────────────────────────────────── */
// Franja sobre canvas con 3 cifras calculadas desde lotes RECIBIDO.
// Sin animación count-up — el número aparece directo.
// "supuesto" en 12 px junto a Raciones y CO₂e.
function LiveMetrics() {
  const [kgTotal, setKgTotal] = useState(0);

  // Suscripción en tiempo real a todos los lotes (hotelId = null = banco).
  // Solo sumamos los lotes con status RECIBIDO y su campo acceptedKg.
  useEffect(() => {
    const unsub = subscribeBatches(null, (list: Batch[]) => {
      const sum = list
        .filter(b => b.status === 'RECIBIDO')
        .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);
      setKgTotal(sum);
    });
    return () => unsub();
  }, []);

  // Cálculos derivados con supuestos honestos
  const raciones = Math.round(kgTotal / 0.4);         // 0.4 kg por ración (supuesto)
  const co2e     = Math.round(kgTotal * 2.5 * 10) / 10; // 2.5 kg CO₂e por kg (supuesto)

  const metrics = [
    { label: 'Kg rescatados',  value: kgTotal.toLocaleString('es-DO'),    note: null },
    { label: 'Raciones',       value: raciones.toLocaleString('es-DO'),   note: 'supuesto' },
    { label: 'Kg CO₂e evitado', value: co2e.toLocaleString('es-DO'),      note: 'supuesto' },
  ];

  return (
    <section style={{
      background: C.canvas,
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: '64px 40px',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
      }}
        className="metrics-grid"
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              textAlign: 'center',
              padding: '0 32px',
              // Separador vertical entre cifras (no en la última)
              borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
            }}
          >
            {/* Cifra principal — tabular-nums para alineación */}
            <p style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: C.green,
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {m.value}
            </p>

            {/* Etiqueta de la métrica */}
            <p style={{ fontSize: 14, fontWeight: 500, color: C.inkSoft, marginBottom: 4 }}>
              {m.label}
            </p>

            {/* "supuesto" en 12 px — solo aparece si aplica */}
            {m.note && (
              <p style={{ fontSize: 12, color: C.inkSoft, opacity: 0.6 }}>
                {m.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Cómo funciona ───────────────────────────────────────────── */
// Tres pasos en línea con número grande en verde, título y descripción corta.
// Conector visual entre pasos mediante borde superior.
function ComoFunciona() {
  const steps = [
    {
      num: '01',
      title: 'Publica',
      desc: 'El chef anota categoría, kg y temperatura de origen al cierre.',
    },
    {
      num: '02',
      title: 'Transporta',
      desc: 'El banco confirma la ventana y genera el enlace del chofer.',
    },
    {
      num: '03',
      title: 'Entrega',
      desc: 'El banco pesa en su almacén y cierra el lote con el kg aceptado.',
    },
  ];

  return (
    <section id="como-funciona" style={{
      background: C.canvas,
      padding: '80px 40px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Título de sección */}
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
          color: C.green, textTransform: 'uppercase', marginBottom: 16,
        }}>
          Cómo funciona
        </p>
        <h2 style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 520, letterSpacing: '-0.02em',
          color: C.ink, margin: '0 0 56px',
        }}>
          Una cadena de tres pasos.
        </h2>

        {/* Pasos en línea */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
        }}
          className="steps-grid"
        >
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: '32px 32px 32px 0',
                // Separador a la izquierda (excepto el primero)
                borderLeft: i > 0 ? `1px solid ${C.border}` : 'none',
                paddingLeft: i > 0 ? 32 : 0,
              }}
            >
              {/* Número grande en verde */}
              <p style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 48, fontWeight: 600,
                color: C.green, lineHeight: 1,
                marginBottom: 16,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.num}
              </p>
              <h3 style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 20, fontWeight: 600,
                color: C.ink, marginBottom: 10,
              }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
// Mínimo: logo + nombre + texto de contexto.
function Footer() {
  return (
    <footer style={{
      background: C.canvas,
      borderTop: `1px solid ${C.border}`,
      padding: '32px 40px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <img src="/logo.svg" alt="NutriMesh" width={20} height={20} style={{ objectFit: 'contain' }} />
      <span style={{ fontSize: 13, color: C.inkSoft }}>
        NutriMesh · Piloto operativo Santo Domingo, RD
      </span>
    </footer>
  );
}

/* ─── Página completa ─────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar fija */}
      <LandingNav />

      {/* Hero de dos columnas */}
      <Hero />

      {/* Tres cifras en vivo */}
      <LiveMetrics />

      {/* Sección "Cómo funciona" */}
      <ComoFunciona />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
