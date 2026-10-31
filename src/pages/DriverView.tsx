import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBatchByToken, updateBatch } from '../lib/demo';

type Step = 'detail' | 'arrived' | 'pickup' | 'done' | 'notfound';

export default function DriverView() {
  const { token } = useParams<{ token: string }>();
  const batch = getBatchByToken(token ?? '');
  const [step, setStep] = useState<Step>(batch ? 'detail' : 'notfound');
  const [tempC, setTempC] = useState('');
  const [kg, setKg] = useState('');
  const [tempErr, setTempErr] = useState('');

  if (step === 'notfound') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.svg" alt="NutriMesh" width={48} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: 'var(--ink-soft)' }}>Pickup link not found.</p>
        </div>
      </div>
    );
  }

  if (!batch) return null;

  const confirmPickup = () => {
    const t = parseFloat(tempC);
    const k = parseFloat(kg);
    if (isNaN(t) || t > 4) {
      setTempErr('Temperature must be 4 °C or below before loading.');
      return;
    }
    setTempErr('');
    updateBatch(batch.id, { status: 'in_transit', receivedKg: isNaN(k) ? batch.kg : k });
    setStep('done');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', padding: '32px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <img src="/logo.svg" alt="NutriMesh" width={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--green)' }}>NutriMesh</span>
        </div>

        {step === 'detail' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pickup order</p>
            <h1 style={{ fontSize: 28, fontWeight: 560, letterSpacing: '-0.02em', marginBottom: 8 }}>{batch.item}</h1>
            <p className="mono" style={{ fontSize: 16, color: 'var(--ink-soft)', marginBottom: 8 }}>
              {batch.kg} kg · {batch.tempC} °C · tomorrow {batch.pickupWindow}
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 32 }}>{batch.hotelName}</p>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep('arrived')}>
              I have arrived
            </button>
          </>
        )}

        {step === 'arrived' && (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 560, marginBottom: 8 }}>{batch.item}</h1>
            <p className="mono" style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28 }}>{batch.hotelName}</p>

            <div className="stack stack-md" style={{ marginBottom: 24 }}>
              <div className="field">
                <label>Temperature at loading (°C)</label>
                <input type="number" step="0.5" value={tempC} onChange={e => setTempC(e.target.value)} placeholder="3" />
              </div>
              <div className="field">
                <label>Confirmed weight (kg)</label>
                <input type="number" step="0.5" value={kg} onChange={e => setKg(e.target.value)} placeholder={String(batch.kg)} />
              </div>
            </div>

            {parseFloat(tempC) > 4 && (
              <p className="notice" style={{ marginBottom: 16 }}>Temperature above 4 °C. Do not load. Contact the bank.</p>
            )}
            {tempErr && <p className="notice" style={{ marginBottom: 16 }}>{tempErr}</p>}

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={confirmPickup}>
              Mark as picked up
            </button>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 560, marginBottom: 8 }}>Pickup recorded</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
              Drive to the food bank. The coordinator is expecting you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
