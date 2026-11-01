/**
 * HotelDashboard.tsx — Panel operativo del Hotel
 *
 * Características:
 *  - Misma paleta crema (#F9F6F1) y tarjetas blancas (#FFFFFF) con radio 20px.
 *  - Arriba: botón verde de acción principal "Publicar excedente" y opción "Hoy no hay excedente".
 *  - Fila de 3 tarjetas de resumen: Publicados hoy, En camino, Recibidos (cifras en mono).
 *  - Listado de lotes ordenados del más reciente al más antiguo con producto, kg, ventana y chip de estado.
 *  - Estado vacío descriptivo con botón de publicación.
 *  - Validación estricta de temperatura: si supera 4 °C, el botón verde se deshabilita y se indica la razón en #C6473F.
 *  - Prohibición de buffet, plato usado y fórmula infantil.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import {
  subscribeBatches,
  subscribeHotel,
  publishBatch,
} from '../lib/store';
import type { Batch, BatchCategory, Hotel } from '../lib/types';
import BatchRow from '../components/BatchRow';

// Palabras no permitidas según protocolo bromatológico
const PALABRAS_PROHIBIDAS = ['formula', 'infant', 'baby', 'fórmula', 'buffet'];
function contieneProhibidas(texto: string) {
  const normalizado = texto.toLowerCase();
  return PALABRAS_PROHIBIDAS.some(p => normalizado.includes(p));
}

// Ventanas horarias matutinas
const VENTANAS = ['8:00–10:00', '9:00–11:00', '10:00–12:00'];

export default function HotelDashboard() {
  const { user } = useAuth();
  const { push } = useActivity();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Estado del formulario de publicación
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BatchCategory>('SELLADO');
  const [estimatedKg, setEstimatedKg] = useState('');
  const [originTempC, setOriginTempC] = useState('');
  const [windowVal, setWindowVal] = useState(VENTANAS[0]);
  const [formErr, setFormErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [noSurplusLoading, setNoSurplusLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');

  const prevBatchesRef = useRef<Record<string, string>>({});

  // Carga de metadatos del hotel (nombre y muelle)
  useEffect(() => {
    if (!user?.hotelId) return;
    const unsub = subscribeHotel(user.hotelId, h => {
      setHotel(h ?? { id: user.hotelId!, name: user.displayName || 'Hotel', dock: '' });
    });
    return () => unsub();
  }, [user?.hotelId, user?.displayName]);

  // Suscripción en tiempo real a los lotes propios del hotel
  useEffect(() => {
    if (!user?.hotelId) return;
    const unsub = subscribeBatches(user.hotelId, list => {
      list.forEach(b => {
        const prev = prevBatchesRef.current[b.id];
        if (!prev || prev !== b.status) {
          push(b, prev);
          prevBatchesRef.current[b.id] = b.status;
        }
      });
      setBatches(list);
    });
    return () => unsub();
  }, [user?.hotelId, push]);

  // Validación de temperatura en origen
  const tempNum = parseFloat(originTempC);
  const tempExcedida = !isNaN(tempNum) && tempNum > 4;
  const esInvalido = contieneProhibidas(name);

  // Registro de nuevo lote
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setConfirmMsg('');

    const t = parseFloat(originTempC);
    const k = parseFloat(estimatedKg);

    if (esInvalido) {
      setFormErr('Buffet, plato de huésped y fórmula infantil no se pueden publicar.');
      return;
    }
    if (isNaN(t) || t > 4) {
      setFormErr(`${originTempC} °C supera el límite de 4 °C. Enfría primero antes de publicar.`);
      return;
    }
    if (isNaN(k) || k <= 0) {
      setFormErr('Ingresa un peso estimado válido.');
      return;
    }

    setLoading(true);
    try {
      const hotelId = user?.hotelId || 'hotel-europa';
      const hotelName = hotel?.name || user?.displayName || 'Hotel';
      await publishBatch({
        hotelId,
        hotelName,
        category,
        name: name.trim(),
        estimatedKg: k,
        originTempC: t,
        window: windowVal,
        status: 'PUBLICADO',
        driverToken: `tok-${Date.now().toString(36)}`,
      });

      // Limpieza de formulario y confirmación de una sola línea
      setName('');
      setEstimatedKg('');
      setOriginTempC('');
      setWindowVal(VENTANAS[0]);
      setShowForm(false);
      setConfirmMsg('Lote publicado. El banco confirmará la recogida de mañana.');
    } catch {
      setFormErr('Error de conexión al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Reportar cierre sin excedente
  const handleNoSurplus = async () => {
    setNoSurplusLoading(true);
    setConfirmMsg('');
    try {
      const hotelId = user?.hotelId || 'hotel-europa';
      const hotelName = hotel?.name || user?.displayName || 'Hotel';
      await publishBatch({
        hotelId,
        hotelName,
        category: 'SELLADO',
        name: 'Sin excedente hoy',
        estimatedKg: 0,
        originTempC: 0,
        window: '—',
        status: 'SIN_EXCEDENTE',
      });
      setShowForm(false);
      setConfirmMsg('Cierre registrado: hoy no hubo excedente.');
    } catch {
      setFormErr('No se pudo guardar el reporte.');
    } finally {
      setNoSurplusLoading(false);
    }
  };

  // Cómputo de tarjetas de resumen
  const publicadosHoy = batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO').length;
  const enCamino = batches.filter(b => b.status === 'RECOGIDO').length;
  const recibidos = batches.filter(b => b.status === 'RECIBIDO').length;

  return (
    <div style={{ paddingTop: 64, minHeight: 'calc(100vh - 64px)', background: 'var(--canvas)' }}>
      <div className="two-col">
        {/* ── Columna izquierda: Listado principal ── */}
        <div className="col-list">
          {/* Cabecera del hotel */}
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-head" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 4 }}>
              {hotel?.name ?? user?.displayName ?? 'Hotel'}
            </h1>
            {hotel?.dock && (
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Muelle de carga: {hotel.dock}
              </p>
            )}
          </div>

          {/* Mensaje de confirmación de una línea tras acción */}
          {confirmMsg && (
            <div
              style={{
                marginBottom: 20,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                fontSize: 13,
                color: 'var(--btn)',
                fontWeight: 500,
              }}
            >
              {confirmMsg}
            </div>
          )}

          {/* Fila de 3 tarjetas de resumen */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-num">{publicadosHoy}</div>
              <div className="summary-card-label">Publicados hoy</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-num">{enCamino}</div>
              <div className="summary-card-label">En camino</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-num">{recibidos}</div>
              <div className="summary-card-label">Recibidos</div>
            </div>
          </div>

          {/* Listado de lotes (del más reciente al más antiguo) */}
          <div style={{ marginTop: 32 }}>
            <p className="section-title" style={{ marginBottom: 14 }}>
              Lotes registrados
            </p>

            {batches.length === 0 ? (
              /* Estado vacío con texto guía y acción */
              <div
                className="card"
                style={{
                  padding: '48px 32px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 520, color: 'var(--ink)', marginBottom: 8 }}>
                  No hay lotes registrados hoy
                </p>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 400, margin: '0 auto 24px' }}>
                  Anota el excedente que se quedó en cocina enfriado a 4 °C o menos, o insumos sellados próximos a vencer.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowForm(true);
                    setConfirmMsg('');
                  }}
                >
                  Publicar excedente
                </button>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {batches.map(b => (
                  <BatchRow key={b.id} batch={b} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha: Formulario de publicación (Expediente) ── */}
        <div className="col-detail">
          <p className="section-title" style={{ marginBottom: 16 }}>
            {showForm ? 'Nuevo lote de excedente' : 'Acciones de cocina'}
          </p>

          {!showForm ? (
            <div className="stack stack-sm">
              <button
                type="button"
                className="btn btn-primary btn-lg btn-full"
                onClick={() => {
                  setShowForm(true);
                  setConfirmMsg('');
                }}
              >
                Publicar excedente
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-full"
                disabled={noSurplusLoading}
                onClick={handleNoSurplus}
              >
                {noSurplusLoading ? 'Registrando…' : 'Hoy no hay excedente'}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="stack stack-md">
              <div className="field">
                <label htmlFor="cat-select">Categoría de alimento</label>
                <select
                  id="cat-select"
                  value={category}
                  onChange={e => setCategory(e.target.value as BatchCategory)}
                >
                  <option value="SELLADO">Insumo sellado del almacén, cerca de vencer</option>
                  <option value="PRODUCCION_FRIA">Producción de cocina enfriada (≤ 4 °C)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="nombre-input">¿Qué producto es?</label>
                <input
                  id="nombre-input"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Pechuga de pollo envasada"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label htmlFor="kg-input">Peso estimado (kg)</label>
                  <input
                    id="kg-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={estimatedKg}
                    onChange={e => setEstimatedKg(e.target.value)}
                    placeholder="18"
                    className="mono"
                  />
                </div>

                <div className="field">
                  <label htmlFor="temp-input">Temperatura sonda (°C)</label>
                  <input
                    id="temp-input"
                    type="number"
                    step="0.1"
                    required
                    value={originTempC}
                    onChange={e => setOriginTempC(e.target.value)}
                    placeholder="3"
                    className="mono"
                    style={tempExcedida ? { borderColor: 'var(--reject)' } : undefined}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="ventana-select">Ventana de recogida para mañana</label>
                <select
                  id="ventana-select"
                  value={windowVal}
                  onChange={e => setWindowVal(e.target.value)}
                >
                  {VENTANAS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Alerta de temperatura mayor a 4 °C en #C6473F */}
              {tempExcedida && (
                <p className="notice">
                  {originTempC} °C supera los 4 °C reglamentarios. No se puede publicar hasta enfriar a 4 °C o menos.
                </p>
              )}

              {/* Advertencia de alimentos no permitidos */}
              {esInvalido && (
                <p className="notice">
                  Buffet, plato de huésped y fórmula infantil no se pueden publicar bajo ninguna circunstancia.
                </p>
              )}

              {formErr && <p className="notice">{formErr}</p>}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || tempExcedida || esInvalido}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Publicando…' : 'Publicar'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setFormErr('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
