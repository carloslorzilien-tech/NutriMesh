/**
 * DriverView.tsx — Vista operativa del Chofer (/c/:token)
 *
 * Características:
 *  - Sin autenticación ni registro requerido: acceso directo mediante token seguro.
 *  - Misma barra de 64px fija (#134E3A) con isotipo blanco a 28px y "NutriMesh".
 *  - Interfaz móvil optimizada con una tarjeta grande de alto contraste.
 *  - Hotel y dirección del muelle con enlace a Google Maps si está registrada.
 *  - Ventana en etiqueta ámbar, producto y kg en tipografía mono.
 *  - Temperatura de origen indicada con la advertencia: "Medida en el hotel. No la tomes tú."
 *  - Casilla de verificación de empaque cerrado y entrada numérica de kg retirados.
 *  - Botón verde de ancho completo con mínimo 56px de alto ("Recogido").
 *  - Sin menús ni pestañas innecesarias.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeBatchByToken, updateBatchFields } from '../lib/store';
import type { Batch } from '../lib/types';

// Enlaces de búsqueda directa en Google Maps por hotel
const HOTEL_MAP_URL: Record<string, string> = {
  'hotel-europa': 'https://maps.google.com/?q=Gran+Hotel+Europa+Santo+Domingo',
  'hotel-barcelo': 'https://maps.google.com/?q=Barcelo+Santo+Domingo',
};

export default function DriverView() {
  const { token } = useParams<{ token: string }>();
  const [batch, setBatch] = useState<Batch | null | undefined>(undefined);
  const [packagingOk, setPackagingOk] = useState(false);
  const [driverKg, setDriverKg] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Suscripción al lote mediante el token del chofer
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

  // Pantalla de carga inicial
  if (batch === undefined) {
    return null;
  }

  // Token no encontrado
  if (batch === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
        <nav className="nav">
          <Link to="/" className="nav-brand">
            <img src="/logo.svg" alt="NutriMesh" width={28} height={28} style={{ objectFit: 'contain' }} />
            <span className="nav-brand-name">NutriMesh</span>
          </Link>
        </nav>
        <div style={{ paddingTop: 120, textAlign: 'center', padding: '120px 24px 0' }}>
          <p style={{ fontSize: 16, color: 'var(--ink-soft)' }}>
            El enlace de recogida no existe o ha expirado.
          </p>
        </div>
      </div>
    );
  }

  const mapUrl = HOTEL_MAP_URL[batch.hotelId] ?? '';

  // Confirmación de recogida por el chofer
  const handleConfirmPickup = async () => {
    setErr('');
    const k = parseFloat(driverKg);

    if (!packagingOk) {
      setErr('Debes confirmar que el empaque está cerrado antes de continuar.');
      return;
    }
    if (isNaN(k) || k <= 0) {
      setErr('Ingresa los kilogramos que te estás llevando.');
      return;
    }

    setLoading(true);
    try {
      await updateBatchFields(batch.id, {
        status: 'RECOGIDO',
        pickedUpKg: k,
      });
    } catch {
      setErr('No se pudo guardar la recogida. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', color: 'var(--ink)' }}>
      {/* ── Barra unificada de 64px ── */}
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
      </nav>

      {/* ── Tarjeta grande de recogida (optimizada para uso móvil en calle) ── */}
      <main style={{ paddingTop: 88, paddingBottom: 48, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="card" style={{ padding: '28px 24px' }}>
            {/* Cabecera de la recogida: Hotel y ventana horaria */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>
                  Punto de recogida
                </p>
                <h1 className="t-head" style={{ fontSize: 24, color: 'var(--ink)', marginTop: 4 }}>
                  {batch.hotelName}
                </h1>
              </div>
              <span className="badge-window" style={{ fontSize: 13, padding: '4px 10px' }}>
                {batch.window}
              </span>
            </div>

            {/* Enlace directo a Google Maps si existe dirección */}
            {mapUrl && (
              <p style={{ marginBottom: 20 }}>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--btn)',
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'underline',
                  }}
                >
                  Abrir en Google Maps
                </a>
              </p>
            )}

            <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            {/* Ficha técnica del producto */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Alimento asignado
              </p>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>
                {batch.name}
              </p>
              <p className="mono" style={{ fontSize: 16, color: 'var(--ink)', marginTop: 6 }}>
                Peso estimado: <strong>{batch.estimatedKg} kg</strong>
              </p>
            </div>

            {/* Temperatura en origen con indicación clara */}
            <div
              style={{
                background: 'rgba(26, 46, 38, 0.04)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 24,
              }}
            >
              <p className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                {batch.originTempC} °C de origen
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                Temperatura medida en el hotel. No la tomes tú.
              </p>
            </div>

            {/* Estado: Pendiente de confirmación por el chofer */}
            {(batch.status === 'PUBLICADO' || batch.status === 'CONFIRMADO') && (
              <div className="stack stack-md">
                {/* Verificación obligatoria de empaque */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    fontSize: 15,
                    color: 'var(--ink)',
                    padding: '8px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={packagingOk}
                    onChange={e => setPackagingOk(e.target.checked)}
                    style={{
                      width: 22,
                      height: 22,
                      accentColor: 'var(--btn)',
                      flexShrink: 0,
                    }}
                  />
                  <span>Empaque cerrado, sin daño visible</span>
                </label>

                {/* Kilogramos que se lleva */}
                <div className="field">
                  <label htmlFor="driver-kg-input">Kilogramos que te llevas</label>
                  <input
                    id="driver-kg-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={driverKg}
                    onChange={e => setDriverKg(e.target.value)}
                    placeholder={String(batch.estimatedKg)}
                    className="mono"
                    style={{ fontSize: 18, height: 48 }}
                  />
                </div>

                {err && <p className="notice">{err}</p>}

                {/* Botón verde de un toque, mínimo 56px de alto */}
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  style={{ height: 56, fontSize: 17, marginTop: 8 }}
                  onClick={handleConfirmPickup}
                >
                  {loading ? 'Registrando…' : 'Marcar como recogido'}
                </button>
              </div>
            )}

            {/* Estado: Ya recogido por el chofer */}
            {batch.status === 'RECOGIDO' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--btn)', marginBottom: 6 }}>
                  Cargamento registrado ({batch.pickedUpKg ?? batch.estimatedKg} kg)
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  En trayecto hacia el almacén del banco de alimentos. Quien cierra el lote y confirma la llegada es el equipo en destino.
                </p>
              </div>
            )}

            {/* Estado: Cerrado en almacén */}
            {(batch.status === 'RECIBIDO' || batch.status === 'RECHAZADO') && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: batch.status === 'RECIBIDO' ? 'var(--btn)' : 'var(--reject)', marginBottom: 6 }}>
                  Lote {batch.status.toLowerCase()} en almacén
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  Aceptados: <span className="mono">{batch.acceptedKg ?? 0} kg</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
