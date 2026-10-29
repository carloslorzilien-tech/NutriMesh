// src/pages/DriverView.tsx — Vista Móvil del Chofer (/c/:token)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Batch } from '../lib/types';
import { formatTimeLeft, isTempValid } from '../lib/utils';
import BrandLogo from '../components/BrandLogo';

type Step = 'detail' | 'arrived' | 'done' | 'error' | 'loading';

export default function DriverView() {
  const { token } = useParams<{ token: string }>();
  const { getBatchByToken, driverUpdate, batches, getHotelById } = useData();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [step, setStep] = useState<Step>('loading');

  const [driverName, setDriverName] = useState('Pedro Santos');
  const [temp, setTemp] = useState('68');
  const [kg, setKg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Resolver lote por token
  useEffect(() => {
    if (!token) {
      setStep('error');
      return;
    }
    const found = getBatchByToken(token);
    if (!found) {
      setStep('error');
      return;
    }
    setBatch(found);
    if (found.status === 'RECOGIDO' || found.status === 'RECIBIDO' || found.status === 'RECHAZADO') {
      setStep('done');
    } else if (found.status !== 'CONFIRMADO') {
      setStep('error');
    } else {
      setStep('detail');
    }
  }, [token, batches, getBatchByToken]);

  const handleDriverSubmit = async () => {
    if (!token || !batch) return;
    if (!driverName.trim()) {
      setErrorMsg('Ingresa tu nombre.');
      return;
    }
    if (!temp) {
      setErrorMsg('Ingresa la temperatura medida.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      await driverUpdate({
        token,
        driverName: driverName.trim(),
        tempOrigin: parseFloat(temp),
        originKg: kg ? parseFloat(kg) : batch.estimatedKg,
      });
      setStep('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>Cargando datos de recogida...</div>
      </div>
    );
  }

  if (step === 'error' || !batch) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 520, color: 'var(--color-ink)', marginBottom: 8 }}>
            Enlace no disponible
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
            Este enlace ya fue procesado o no existe en el sistema del banco.
          </p>
        </div>
      </div>
    );
  }

  const { label: timeLabel } = formatTimeLeft(batch.expiresAt);
  const diffH = (batch.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
  const isTimeNear = diffH > 0 && diffH < 3;
  const tempOutOfRule = batch.tempOrigin !== null && !isTempValid(batch.tempOrigin, batch.type);

  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <BrandLogo size={32} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-brand)' }}>NutriMesh</span>
          </div>

          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 32,
              fontWeight: 520,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            {batch.category}
          </h1>

          <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 24 }}>
            <span>{batch.hotelName ?? batch.hotelId}</span>
            <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.trays}</span> bandejas</span>
            <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.originKg ?? batch.estimatedKg} kg</span></span>
          </div>

          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              color: 'var(--color-brand)',
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Recogida registrada con éxito. El lote va en camino al Banco de Alimentos (BARD) para pesaje final.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-canvas)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
        {/* Cabecera mínima con logo.png oficial */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <BrandLogo size={32} />
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-brand)' }}>NutriMesh</span>
        </div>

        {/* El plato en 32 px */}
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 32,
            fontWeight: 520,
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          {batch.category}
        </h1>

        {/* Línea 2: Gran Hotel Europa · 7 bandejas · 28 kg · 68 °C · vence en 2 h 57 m */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'var(--color-ink-muted)',
            lineHeight: 1.5,
            marginBottom: 36,
          }}
        >
          <span>{batch.hotelName ?? batch.hotelId}</span>
          <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.trays}</span> bandejas</span>
          <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.estimatedKg} kg</span></span>

          {batch.tempOrigin !== null && (
            <span>
              {' · '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: tempOutOfRule ? 'var(--color-terracota, #C2410C)' : undefined,
                  fontWeight: tempOutOfRule ? 600 : 400,
                }}
              >
                {batch.tempOrigin} °C
              </span>
            </span>
          )}

          <span>
            {' · '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: isTimeNear ? 'var(--color-mostaza, #D97706)' : undefined,
                fontWeight: isTimeNear ? 600 : 400,
              }}
            >
              vence en {timeLabel}
            </span>
          </span>
        </div>

        {errorMsg && (
          <div style={{ fontSize: 13, color: 'var(--color-terracota, #C2410C)', marginBottom: 16, fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        {/* Paso 1: Dos botones verdes grandes */}
        {step === 'detail' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              type="button"
              className="btn btn--driver"
              onClick={() => setStep('arrived')}
            >
              Ya llegué al hotel
            </button>

            <button
              type="button"
              className="btn btn--driver"
              onClick={() => {
                const hotel = getHotelById(batch.hotelId);
                if (hotel?.dockNote) {
                  alert(`Muelle de carga: ${hotel.dockNote}`);
                } else {
                  alert('Indicar NutriMesh en la entrada de servicio del hotel.');
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-brand)',
                color: 'var(--color-brand)',
              }}
            >
              Ver acceso de muelle
            </button>
          </div>
        )}

        {/* Paso 2: Datos rápidos y confirmación */}
        {step === 'arrived' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label className="field__label" htmlFor="driver-name">Tu nombre</label>
              <input
                id="driver-name"
                type="text"
                className="field__input"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                style={{ height: 46 }}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="driver-temp">Temperatura medida (°C)</label>
              <input
                id="driver-temp"
                type="number"
                step="0.5"
                className="field__input"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                style={{ height: 46 }}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="driver-kg">Kilos verificados (opcional)</label>
              <input
                id="driver-kg"
                type="number"
                step="0.1"
                className="field__input"
                value={kg}
                onChange={e => setKg(e.target.value)}
                placeholder={`Estimado: ${batch.estimatedKg} kg`}
                style={{ height: 46 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn--driver"
                onClick={handleDriverSubmit}
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Confirmar recogida'}
              </button>

              <button
                type="button"
                className="btn btn--driver"
                onClick={() => setStep('detail')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-brand)',
                  color: 'var(--color-brand)',
                }}
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
