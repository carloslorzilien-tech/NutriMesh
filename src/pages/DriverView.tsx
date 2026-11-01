import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBatchByToken, updateBatch } from '../lib/demo';

type Step = 'detail' | 'done' | 'notfound';

export default function DriverView() {
  const { token } = useParams<{ token: string }>();
  const batch = getBatchByToken(token ?? '');
  const [step, setStep] = useState<Step>(batch ? 'detail' : 'notfound');
  const [packagingOk, setPackagingOk] = useState(false);
  const [driverKg, setDriverKg] = useState('');
  const [err, setErr] = useState('');

  if (step === 'notfound') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.svg" alt="NutriMesh" width={48} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: 'var(--ink-soft)' }}>Enlace de recogida no encontrado.</p>
        </div>
      </div>
    );
  }

  if (!batch) return null;

  const confirm = () => {
    setErr('');
    const k = parseFloat(driverKg);
    if (!packagingOk) { setErr('Confirma que el empaque está cerrado.'); return; }
    if (isNaN(k) || k <= 0) { setErr('Ingresa los kg que te llevas.'); return; }
    updateBatch(batch.id, {
      status: 'RECOGIDO',
      driverKg: k,
      packagingOk: true,
    });
    setStep('done');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', padding: '32px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <img src="/logo.svg" alt="NutriMesh" width={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 18, fontWeight: 520, color: 'var(--green)' }}>NutriMesh</span>
        </div>

        {step === 'detail' && (
          <>
            {/* Item name — big */}
            <h1 style={{ fontSize: 32, fontWeight: 560, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.15 }}>
              {batch.item}
            </h1>

            {/* Mono data line */}
            <p className="mono" style={{ fontSize: 16, color: 'var(--ink-soft)', marginBottom: 8 }}>
              {batch.kg} kg · {batch.tempC} °C · {batch.pickupWindow}
            </p>

            {/* Temp note */}
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8 }}>
              Temperatura medida en el hotel. No la tomes tú.
            </p>

            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 32 }}>
              {batch.hotelName}
            </p>

            <div className="stack stack-md">
              {/* Packaging checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', fontSize: 15 }}>
                <input
                  type="checkbox"
                  checked={packagingOk}
                  onChange={e => setPackagingOk(e.target.checked)}
                  style={{ width: 20, height: 20, marginTop: 2, accentColor: 'var(--green)', flexShrink: 0 }}
                />
                Empaque cerrado, sin daño visible
              </label>

              {/* Kg field */}
              <div className="field">
                <label>Kg que me llevo</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={driverKg}
                  onChange={e => setDriverKg(e.target.value)}
                  placeholder={String(batch.kg)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}
                />
              </div>

              {err && <p className="notice">{err}</p>}

              {/* 52px button */}
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', height: 52 }}
                onClick={confirm}
              >
                Recogido
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 560, marginBottom: 8 }}>Recogida registrada</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
              Ve al banco de alimentos. El coordinador te espera.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
