import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeBatchByToken, updateBatchFields } from '../lib/store';
import { IS_FIREBASE } from '../lib/firebase';
import type { Batch } from '../lib/types';
import logoPng from '../assets/logo.png';

export default function DriverView() {
  const { token } = useParams<{ token: string }>();
  const [batch, setBatch] = useState<Batch | null | undefined>(undefined);
  const [packagingOk, setPackagingOk] = useState(false);
  const [driverKg, setDriverKg] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) {
      setBatch(null);
      return;
    }
    const unsub = subscribeBatchByToken(token, b => {
      setBatch(b);
      if (b && !driverKg) {
        setDriverKg(String(b.pickedUpKg ?? b.estimatedKg));
      }
    });
    return () => unsub();
  }, [token]);

  if (batch === undefined) {
    return null;
  }

  if (batch === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <img src={logoPng} alt="NutriMesh" width={32} height={32} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: 'var(--ink-soft)' }}>Enlace de recogida no encontrado.</p>
        </div>
      </div>
    );
  }

  const handleConfirmPickup = async () => {
    setErr('');
    const k = parseFloat(driverKg);
    if (!packagingOk) {
      setErr('Confirma que el empaque está cerrado.');
      return;
    }
    if (isNaN(k) || k <= 0) {
      setErr('Ingresa los kg que te llevas.');
      return;
    }

    setLoading(true);
    try {
      await updateBatchFields(batch.id, {
        status: 'RECOGIDO',
        pickedUpKg: k,
      });
    } catch {
      setErr('No se pudo actualizar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column', padding: '32px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>

        {/* Logo 32 px sin píldora */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <img src={logoPng} alt="NutriMesh" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 18, fontWeight: 520, color: 'var(--green)' }}>NutriMesh</span>
        </div>

        {/* Plato a 32 px */}
        <h1 style={{ fontSize: 32, fontWeight: 560, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.15 }}>
          {batch.name}
        </h1>

        {/* Línea mono con temperatura de origen */}
        <p className="mono" style={{ fontSize: 16, color: 'var(--ink-soft)', marginBottom: 8 }}>
          {batch.estimatedKg} kg · {batch.originTempC} °C · mañana {batch.window}
        </p>

        {/* Frase obligatoria */}
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 6 }}>
          Temperatura medida en el hotel. No la tomes tú.
        </p>

        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28 }}>
          {batch.hotelName}
        </p>

        {/* Estado actual si ya se recogió o cerró */}
        {batch.status === 'RECOGIDO' && (
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 15, fontWeight: 520, color: 'var(--green)', marginBottom: 4 }}>
              Lote marcado como recogido ({batch.pickedUpKg ?? batch.estimatedKg} kg).
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              Quien cierra el lote y registra la recepción es el banco de alimentos en su almacén.
            </p>
          </div>
        )}

        {(batch.status === 'RECIBIDO' || batch.status === 'RECHAZADO') && (
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 15, fontWeight: 520, color: batch.status === 'RECIBIDO' ? 'var(--green)' : 'var(--terra)', marginBottom: 4 }}>
              Lote {batch.status.toLowerCase()} en almacén.
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              Aceptados: <span className="mono">{batch.acceptedKg ?? 0} kg</span>.
            </p>
          </div>
        )}

        {/* Formulario en modo memoria si está pendiente o confirmado */}
        {!IS_FIREBASE && (batch.status === 'PUBLICADO' || batch.status === 'CONFIRMADO') && (
          <div className="stack stack-md" style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', fontSize: 15 }}>
              <input
                type="checkbox"
                checked={packagingOk}
                onChange={e => setPackagingOk(e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2, accentColor: 'var(--green)', flexShrink: 0 }}
              />
              Empaque cerrado, sin daño visible
            </label>

            <div className="field">
              <label>Kg que me llevo</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={driverKg}
                onChange={e => setDriverKg(e.target.value)}
                placeholder={String(batch.estimatedKg)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}
              />
            </div>

            {err && <p className="notice">{err}</p>}

            <button
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: 52, fontSize: 16 }}
              onClick={handleConfirmPickup}
            >
              {loading ? 'Guardando…' : 'Recogido'}
            </button>
          </div>
        )}

        {/* Nota en modo Firebase */}
        {IS_FIREBASE && (batch.status === 'PUBLICADO' || batch.status === 'CONFIRMADO') && (
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Quien cierra el lote y confirma la llegada es el banco de alimentos en su almacén.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
