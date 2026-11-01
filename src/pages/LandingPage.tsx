import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeBatches } from '../lib/store';
import type { Batch } from '../lib/types';

/* ─── helpers ─────────────────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!active) return;
    if (reducedMotion || target === 0) { setVal(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(t * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration, reducedMotion]);
  return val;
}

/* ─── image treatment ─────────────────────────────────────────── */
const IMG_FILTER = 'saturate(0.85) contrast(1.05)';
const IMG_OVERLAY = 'linear-gradient(to top, rgba(10,26,21,0.92) 0%, rgba(10,26,21,0.55) 55%, transparent 100%)';
const GREEN_TINT   = 'rgba(16,185,129,0.08)';

/* ─── carousel data ───────────────────────────────────────────── */
const SLIDES = [
  {
    img: '/img/voluntarios-caja.webp',
    role: 'EMPAQUE',
    num: '01/05',
    headline: 'Cada caja cuenta.',
    sub: 'Voluntarios organizan el excedente antes del cierre.',
  },
  {
    img: '/img/chef-empacando.webp',
    role: 'HOTEL',
    num: '02/05',
    headline: 'Del hotel a la mesa, sin desperdicio.',
    sub: 'El chef registra temperatura, categoría y kg antes de publicar.',
  },
  {
    img: '/img/camiones-bard.webp',
    role: 'LOGÍSTICA',
    num: '03/05',
    headline: 'Cada lote, trazado de la cocina al banco.',
    sub: null, // glass card instead
    glass: true,
  },
  {
    img: '/img/comunidad-comida.webp',
    role: 'COMUNIDAD',
    num: '04/05',
    headline: 'Comida con propósito.',
    sub: 'Lo que sobra en un hotel alimenta a quien más lo necesita.',
  },
  {
    img: null, // data slide
    role: 'IMPACTO',
    num: '05/05',
    headline: 'Rescatar comida también es cuidar el planeta.',
    sub: null,
    dataSlide: true,
  },
];

/* ─── nav ─────────────────────────────────────────────────────── */
function LandingNav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: solid ? 'rgba(10,26,21,0.92)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        borderBottom: solid ? '1px solid rgba(31,58,49,0.8)' : 'none',
        transition: 'background 0.3s, backdrop-filter 0.3s',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="/logo.svg" alt="NutriMesh" width={28} height={28} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(57%) sepia(97%) saturate(400%) hue-rotate(115deg) brightness(92%) contrast(88%)' }} />
        <span style={{ fontFamily: "'Inter Tight', Inter, sans-serif", fontSize: 18, fontWeight: 600, color: '#10B981', letterSpacing: '-0.02em' }}>
          NutriMesh
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <a href="#como-funciona" style={{ fontSize: 14, color: '#9DB0A6', textDecoration: 'none' }}>Cómo funciona</a>
        <a href="#impacto" style={{ fontSize: 14, color: '#9DB0A6', textDecoration: 'none' }}>Impacto</a>
        <Link
          to="/login"
          style={{
            fontSize: 14, fontWeight: 600,
            background: '#10B981', color: '#04130E',
            padding: '8px 20px', borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
}

/* ─── hero ─────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 560, overflow: 'hidden' }}>
      {/* background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/img/hero-cocina.webp)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: IMG_FILTER,
      }} />
      {/* green tint */}
      <div style={{ position: 'absolute', inset: 0, background: GREEN_TINT }} />
      {/* gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: IMG_OVERLAY }} />

      {/* content */}
      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 32px 80px',
        maxWidth: 800,
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
          color: '#10B981', textTransform: 'uppercase', marginBottom: 20,
        }}>
          Piloto operativo · Santo Domingo, RD
        </p>
        <h1 style={{
          fontFamily: "'Inter Tight', Inter, sans-serif",
          fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 560,
          letterSpacing: '-0.03em', lineHeight: 1.05,
          color: '#F4F1E8', margin: '0 0 20px',
        }}>
          Convierte el excedente<br />en impacto.
        </h1>
        <p style={{
          fontSize: 18, color: '#9DB0A6', lineHeight: 1.6,
          maxWidth: 560, margin: '0 0 36px',
        }}>
          Hoteles, restaurantes, bancos de alimentos y choferes conectados en una sola red.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/login" style={{
            background: '#10B981', color: '#04130E',
            fontWeight: 600, fontSize: 16,
            padding: '14px 32px', borderRadius: 10,
            textDecoration: 'none',
          }}>
            Entrar
          </Link>
          <a href="#como-funciona" style={{
            border: '1px solid rgba(244,241,232,0.3)', color: '#F4F1E8',
            fontWeight: 500, fontSize: 16,
            padding: '14px 32px', borderRadius: 10,
            textDecoration: 'none',
          }}>
            Cómo funciona
          </a>
        </div>
      </div>

      {/* photo credit */}
      <p style={{
        position: 'absolute', bottom: 12, right: 16,
        fontSize: 11, color: 'rgba(157,176,166,0.6)',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        Foto: Unsplash
      </p>
    </section>
  );
}

/* ─── live metrics ─────────────────────────────────────────────── */
function LiveMetrics() {
  const { ref, visible } = useInView(0.3);
  const [kgTotal, setKgTotal] = useState(0);

  useEffect(() => {
    const unsub = subscribeBatches(null, (list: Batch[]) => {
      const sum = list
        .filter(b => b.status === 'RECIBIDO')
        .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);
      setKgTotal(sum);
    });
    return () => unsub();
  }, []);

  const kg       = useCountUp(kgTotal, visible);
  const raciones = useCountUp(Math.round(kgTotal / 0.4), visible);
  const co2      = useCountUp(Math.round(kgTotal * 2.5 * 10) / 10, visible);

  const metrics = [
    { label: 'KG RESCATADOS', value: kg.toLocaleString('es-DO'), note: null },
    { label: 'RACIONES', value: raciones.toLocaleString('es-DO'), note: 'supuesto' },
    { label: 'KG CO₂E EVITADO', value: co2.toLocaleString('es-DO'), note: 'supuesto' },
  ];

  return (
    <section id="impacto" ref={ref} style={{
      background: '#12261F',
      borderTop: '1px solid #1F3A31', borderBottom: '1px solid #1F3A31',
      padding: '56px 32px',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 40,
      }}>
        {metrics.map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, fontWeight: 500,
            color: '#9DB0A6', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            {m.label}
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 500,
            color: '#C6F36B', lineHeight: 1,
            marginBottom: 8,
          }}>
            {m.value}
          </p>
          {m.note && (
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, color: '#9DB0A6',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {m.note}
            </p>
          )}
        </div>
        ))}
      </div>
    </section>
  );
}

/* ─── carousel ──────────────────────────────────────────────────── */
function Carousel({ kgTotal }: { kgTotal: number }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => {
      setIdx(i => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [paused, reducedMotion]);

  const slide = SLIDES[idx];

  return (
    <section
      style={{ position: 'relative', background: '#0A1A15' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p style={{
        textAlign: 'center', padding: '48px 0 24px',
        fontFamily: "'Inter Tight', Inter, sans-serif",
        fontSize: 28, fontWeight: 560, color: '#F4F1E8',
        letterSpacing: '-0.02em',
      }}>
        El recorrido
      </p>

      <div style={{ position: 'relative', height: 'clamp(420px, 60vh, 640px)', overflow: 'hidden' }}>
        {/* image or data slide */}
        {slide.img ? (
          <>
            <img
              src={slide.img}
              alt={slide.role}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                filter: IMG_FILTER,
                transition: 'opacity 0.5s',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: GREEN_TINT }} />
            <div style={{ position: 'absolute', inset: 0, background: IMG_OVERLAY }} />
          </>
        ) : (
          /* slide 5 — data background */
          <div style={{
            position: 'absolute', inset: 0,
            background: '#12261F',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(31,58,49,0.8) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        )}

        {/* slide content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'clamp(24px,4vw,56px)',
        }}>
          {/* role label */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
            color: '#10B981', textTransform: 'uppercase', marginBottom: 16,
          }}>
            {slide.role}
          </p>

          {/* counter */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: 'rgba(157,176,166,0.7)',
            letterSpacing: '0.08em', marginBottom: 12,
          }}>
            {slide.num}
          </p>

          <h2 style={{
            fontFamily: "'Inter Tight', Inter, sans-serif",
            fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 560,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            color: '#F4F1E8', margin: '0 0 16px',
            maxWidth: 600,
          }}>
            {slide.headline}
          </h2>

          {slide.sub && !slide.glass && (
            <p style={{ fontSize: 16, color: '#9DB0A6', maxWidth: 480, lineHeight: 1.6 }}>
              {slide.sub}
            </p>
          )}

          {/* glass card for logistics slide */}
          {slide.glass && (
            <div style={{
              display: 'inline-flex', flexDirection: 'column', gap: 6,
              background: 'rgba(18,38,31,0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(31,58,49,0.8)',
              borderRadius: 12, padding: '16px 20px',
              alignSelf: 'flex-start',
            }}>
              {[
                'Ruta #0482',
                '14 km estimados',
                'ETA 08:42',
                'Temperatura OK · 3.1 °C',
              ].map(line => (
                <p key={line} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, color: '#C6F36B', margin: 0,
                  letterSpacing: '0.02em',
                }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* data slide content */}
          {slide.dataSlide && (
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 8 }}>
              <div>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500,
                  color: '#C6F36B', lineHeight: 1, margin: '0 0 6px',
                }}>
                  {(kgTotal * 2.5).toFixed(1)}
                </p>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: '#9DB0A6',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  kg CO₂e evitado · supuesto
                </p>
              </div>
              <div>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 'clamp(32px,5vw,56px)', fontWeight: 500,
                  color: '#C6F36B', lineHeight: 1, margin: '0 0 6px',
                }}>
                  {Math.round(kgTotal / 0.4)}
                </p>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: '#9DB0A6',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  raciones generadas · supuesto
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 32, padding: '24px 32px',
      }}>
        <button
          onClick={() => setIdx(i => (i - 1 + SLIDES.length) % SLIDES.length)}
          style={{
            background: 'none', border: '1px solid #1F3A31',
            color: '#9DB0A6', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 18,
          }}
          aria-label="Anterior"
        >
          ←
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Diapositiva ${i + 1}`}
              style={{
                width: i === idx ? 24 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === idx ? '#10B981' : '#1F3A31',
                transition: 'width 0.3s, background 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setIdx(i => (i + 1) % SLIDES.length)}
          style={{
            background: 'none', border: '1px solid #1F3A31',
            color: '#9DB0A6', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 18,
          }}
          aria-label="Siguiente"
        >
          →
        </button>
      </div>
    </section>
  );
}

/* ─── how it works ─────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Publica',
      text: 'El hotel registra al cierre: categoría, kg estimados y temperatura. Si supera 4 °C, no se publica.',
    },
    {
      num: '02',
      title: 'Transporta',
      text: 'El banco confirma ventana y chofer. El chofer recibe un enlace sin cuenta — ve el lote, confirma el empaque y anota los kg.',
    },
    {
      num: '03',
      title: 'Entrega',
      text: 'En el almacén, el banco pesa, acepta o rechaza con motivo. El impacto suma solo los kg aceptados.',
    },
  ];
  return (
    <section id="como-funciona" style={{ padding: '80px 32px', background: '#0A1A15' }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, color: '#10B981', letterSpacing: '0.1em',
        textTransform: 'uppercase', textAlign: 'center', marginBottom: 16,
      }}>
        El flujo
      </p>
      <h2 style={{
        fontFamily: "'Inter Tight', Inter, sans-serif",
        fontSize: 36, fontWeight: 560, letterSpacing: '-0.02em',
        color: '#F4F1E8', textAlign: 'center', marginBottom: 64,
      }}>
        Cómo funciona
      </h2>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 40, position: 'relative',
      }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ position: 'relative' }}>
            {/* connector line (desktop only) */}
            {i < steps.length - 1 && (
              <div style={{
                position: 'absolute', top: 20, left: '100%',
                width: 40, height: 1,
                background: 'linear-gradient(to right, #1F3A31, transparent)',
                display: 'none', // shown via CSS below
              }} />
            )}
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13, fontWeight: 500, color: '#10B981',
              letterSpacing: '0.06em', marginBottom: 16,
            }}>
              {s.num}
            </p>
            <h3 style={{
              fontFamily: "'Inter Tight', Inter, sans-serif",
              fontSize: 22, fontWeight: 560,
              color: '#F4F1E8', marginBottom: 12,
            }}>
              {s.title}
            </h3>
            <p style={{ fontSize: 15, color: '#9DB0A6', lineHeight: 1.7 }}>
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── cta ──────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section style={{
      background: '#12261F',
      borderTop: '1px solid #1F3A31',
      padding: '96px 32px',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: "'Inter Tight', Inter, sans-serif",
        fontSize: 36, fontWeight: 560, letterSpacing: '-0.02em',
        color: '#F4F1E8', marginBottom: 24,
      }}>
        Únete a la red.
      </h2>
      <p style={{ fontSize: 16, color: '#9DB0A6', marginBottom: 40, lineHeight: 1.6 }}>
        Tres actores. Un flujo. Cero desperdicio innecesario.
      </p>
      <Link to="/login" style={{
        display: 'inline-block',
        background: '#10B981', color: '#04130E',
        fontWeight: 600, fontSize: 16,
        padding: '16px 40px', borderRadius: 10,
        textDecoration: 'none',
      }}>
        Entrar al piloto
      </Link>
    </section>
  );
}

/* ─── page ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [kgTotal, setKgTotal] = useState(0);

  useEffect(() => {
    const unsub = subscribeBatches(null, (list: Batch[]) => {
      const sum = list
        .filter(b => b.status === 'RECIBIDO')
        .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);
      setKgTotal(sum);
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ background: '#0A1A15', minHeight: '100vh' }}>
      {/* fonts loaded via index.html or @import */}
      <LandingNav />
      <Hero />
      <LiveMetrics />
      <Carousel kgTotal={kgTotal} />
      <HowItWorks />
      <CTA />
      <footer style={{
        background: '#0A1A15',
        borderTop: '1px solid #1F3A31',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="" width={20} height={20} style={{ opacity: 0.5 }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12, color: '#9DB0A6', letterSpacing: '0.04em',
          }}>
            NutriMesh · Piloto 2026 · Santo Domingo, RD
          </span>
        </div>
        <Link to="/login" style={{ fontSize: 13, color: '#9DB0A6', textDecoration: 'none' }}>
          Entrar
        </Link>
      </footer>
    </div>
  );
}
