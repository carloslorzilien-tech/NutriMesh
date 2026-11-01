/**
 * LandingPage.tsx — Portada pública de NutriMesh
 *
 * Estructura de la página:
 *  1. Barra fija de 64px (#134E3A) con isotipo blanco a 28px y botón píldora blanco "Entrar".
 *  2. Hero asimétrico sobre fondo crema (#F9F6F1) con copia a la izquierda y cocina-acero.webp
 *     a la derecha (radio 24px, sin overlay ni texto superpuesto).
 *  3. Banda oscura (#134E3A) con tres cifras vivas en tipografía Outfit derivadas de Firestore
 *     (únicamente lotes con estado RECIBIDO, mostrando supuestos honestos).
 *  4. Dos fotografías documentales con radio 24px y pie descriptivo de una línea:
 *     - estufa.webp: "La temperatura se anota en la cocina, no en la calle."
 *     - cajas.webp: "El banco pesa lo que entra. Lo que no sirve se anota."
 *  5. Pie de página minimalista.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeBatches } from '../lib/store';
import type { Batch } from '../lib/types';

export default function LandingPage() {
  const [kgRescatados, setKgRescatados] = useState(0);

  // Suscripción reactiva a Firestore en tiempo real (null consulta todos los lotes del sistema)
  useEffect(() => {
    const unsubscribe = subscribeBatches(null, (batches: Batch[]) => {
      // Sumatoria estricta de kilogramos aceptados en almacén
      const totalAceptado = batches
        .filter(b => b.status === 'RECIBIDO')
        .reduce((acumulado, b) => acumulado + (b.acceptedKg ?? 0), 0);
      setKgRescatados(totalAceptado);
    });
    return () => unsubscribe();
  }, []);

  // Estimaciones calculadas según supuestos operativos transparentes
  const raciones = Math.round(kgRescatados / 0.4);
  const co2e = Math.round(kgRescatados * 2.5 * 10) / 10;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', color: 'var(--ink)' }}>
      {/* ── 1. Barra superior fija (64px, fondo #134E3A) ── */}
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
        <Link to="/login" className="nav-btn-enter">
          Entrar
        </Link>
      </nav>

      {/* ── 2. Hero de dos columnas ── */}
      <section
        style={{
          paddingTop: 64,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="hero-grid"
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '55fr 45fr',
            gap: 40,
            padding: '48px 32px',
            alignItems: 'center',
          }}
        >
          {/* Columna de texto */}
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brand)',
                marginBottom: 20,
              }}
            >
              Piloto · Santo Domingo
            </p>

            <h1
              className="t-head"
              style={{
                fontSize: 'clamp(38px, 5.5vw, 68px)',
                lineHeight: 1.08,
                color: 'var(--ink)',
                marginBottom: 20,
              }}
            >
              La cocina cierra.<br />El banco sale por la mañana.
            </h1>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: 'var(--ink-soft)',
                maxWidth: 480,
                marginBottom: 36,
              }}
            >
              El hotel anota lo que nunca salió a la barra. El banco lo pesa al llegar.
            </p>

            <Link to="/login" className="btn btn-primary btn-lg">
              Entrar
            </Link>
          </div>

          {/* Columna de fotografía hero (cocina-acero.webp) */}
          <div className="hero-photo-col">
            <div
              style={{
                borderRadius: 'var(--radius-photo)',
                overflow: 'hidden',
                height: '70vh',
                minHeight: 440,
                maxHeight: 640,
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <img
                src="/img/cocina-acero.webp"
                alt="Cocina profesional de acero inoxidable en hotel"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="eager"
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: 'var(--ink-soft)',
                marginTop: 8,
                textAlign: 'right',
                paddingRight: 4,
              }}
            >
              Foto: Ceba Solutions, Unsplash.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Banda de cifras en vivo (#134E3A, cifras en Outfit blancas) ── */}
      <section style={{ background: 'var(--bar)', padding: '56px 32px' }}>
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            textAlign: 'center',
          }}
        >
          {/* Kilogramos rescatados */}
          <div>
            <p
              className="t-head mono"
              style={{
                fontSize: 'clamp(42px, 5vw, 60px)',
                color: '#FFFFFF',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {kgRescatados.toLocaleString('es-DO')}
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}>
              Kg rescatados
            </p>
          </div>

          {/* Raciones estimadas */}
          <div>
            <p
              className="t-head mono"
              style={{
                fontSize: 'clamp(42px, 5vw, 60px)',
                color: '#FFFFFF',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {raciones.toLocaleString('es-DO')}
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
              Raciones
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
              supuesto
            </p>
          </div>

          {/* Huella de CO₂e evitada */}
          <div>
            <p
              className="t-head mono"
              style={{
                fontSize: 'clamp(42px, 5vw, 60px)',
                color: '#FFFFFF',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {co2e.toLocaleString('es-DO')}
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
              Kg CO₂e evitado
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
              supuesto
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Dos fotografías de trazabilidad documental sobre crema ── */}
      <section style={{ padding: '80px 32px', background: 'var(--canvas)' }}>
        <div
          className="photos-grid"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
          }}
        >
          {/* Fotografía 1: Estufa (medición en origen) */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-photo)',
                overflow: 'hidden',
                height: 380,
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <img
                src="/img/estufa.webp"
                alt="Estufa industrial de cocina profesional"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 14, lineHeight: 1.5 }}>
              La temperatura se anota en la cocina, no en la calle.
            </p>
          </div>

          {/* Fotografía 2: Cajas (pesaje y recepción) */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-photo)',
                overflow: 'hidden',
                height: 380,
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <img
                src="/img/cajas.webp"
                alt="Cajas de alimentos clasificadas y verificadas"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 14, lineHeight: 1.5 }}>
              El banco pesa lo que entra. Lo que no sirve se anota.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Pie de página ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 32px',
          background: 'var(--canvas)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          NutriMesh · Piloto operativo · Santo Domingo, RD
        </span>
      </footer>
    </div>
  );
}
