import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>

        {/* Logo — large, strategic placement, like Google/Stripe */}
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/logo.svg"
            alt="NutriMesh"
            width={72}
            height={72}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: 32, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.03em' }}>
            NutriMesh
          </span>
        </div>

        {/* Hero */}
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 520, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16, color: 'var(--ink)' }}>
          La cocina cierra.<br />El banco sale por la mañana.
        </h1>

        <p style={{ fontSize: 18, color: 'var(--ink-soft)', maxWidth: 480, lineHeight: 1.6, marginBottom: 40 }}>
          El hotel anota lo que nunca salió a la barra.
          El banco lo recoge en su ruta de la mañana.
        </p>

        <div>
          <Link to="/login" className="btn btn-primary" style={{ fontSize: 16, height: 52, paddingLeft: 32, paddingRight: 32, borderRadius: 8 }}>
            Abrir el piloto
          </Link>
        </div>

        {/* Assumptions — transparent, labeled */}
        <p style={{ marginTop: 48, fontSize: 13, color: 'var(--ink-soft)', maxWidth: 440, lineHeight: 1.7 }}>
          Working prototype for STEMergent Hacks 2026. Hotels and food bank are simulated.
          Meal counts use <span className="mono">0.4 kg</span> each.
          Carbon figures use <span className="mono">2.5 kg CO₂e</span> per kilo rescued.
          Both are labeled assumptions.
        </p>
      </main>
    </div>
  );
}
