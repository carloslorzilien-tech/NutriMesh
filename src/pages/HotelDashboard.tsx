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

const FORBIDDEN_WORDS = ['formula', 'infant', 'baby', 'fórmula', 'buffet'];

function isForbidden(item: string) {
  const low = item.toLowerCase();
  return FORBIDDEN_WORDS.some(f => low.includes(f));
}

const WINDOWS = ['8:00–10:00', '9:00–11:00', '10:00–12:00'];

export default function HotelDashboard() {
  const { user } = useAuth();
  const { push } = useActivity();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BatchCategory>('SELLADO');
  const [estimatedKg, setEstimatedKg] = useState('');
  const [originTempC, setOriginTempC] = useState('');
  const [windowVal, setWindowVal] = useState(WINDOWS[0]);
  const [formErr, setFormErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [noSurplusLoading, setNoSurplusLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const prevBatchesRef = useRef<Record<string, string>>({});

  // Subscribe to hotel details (name, dock)
  useEffect(() => {
    if (!user?.hotelId) return;
    const unsub = subscribeHotel(user.hotelId, h => {
      if (h) setHotel(h);
      else setHotel({ id: user.hotelId!, name: user.displayName || 'Hotel', dock: '' });
    });
    return () => unsub();
  }, [user?.hotelId, user?.displayName]);

  // Subscribe to batches in real-time
  useEffect(() => {
    if (!user?.hotelId) return;
    const unsub = subscribeBatches(user.hotelId, list => {
      // track transitions for activity feed
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setSuccess(false);

    const t = parseFloat(originTempC);
    const k = parseFloat(estimatedKg);

    if (isForbidden(name)) {
      setFormErr('Buffet, plato de huésped y fórmula infantil no se pueden publicar.');
      return;
    }
    if (isNaN(t) || t > 4) {
      setFormErr(`Temperatura ${isNaN(t) ? originTempC : t} °C supera los 4 °C. No se puede publicar.`);
      return;
    }
    if (isNaN(k) || k <= 0) {
      setFormErr('Ingresa un peso válido.');
      return;
    }

    setLoading(true);
    try {
      const hotelId = user?.hotelId || 'hotel-europa';
      const hotelName = hotel?.name || user?.displayName || 'Hotel';
      const driverToken = `tok-${Date.now().toString(36)}`;

      await publishBatch({
        hotelId,
        hotelName,
        category,
        name: name.trim(),
        estimatedKg: k,
        originTempC: t,
        window: windowVal,
        status: 'PUBLICADO',
        driverToken,
      });

      setName('');
      setEstimatedKg('');
      setOriginTempC('');
      setWindowVal(WINDOWS[0]);
      setShowForm(false);
      setSuccess(true);
    } catch {
      setFormErr('Error al publicar el lote. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const markNoSurplus = async () => {
    setFormErr('');
    setSuccess(false);
    setNoSurplusLoading(true);
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
    } catch {
      setFormErr('No se pudo registrar.');
    } finally {
      setNoSurplusLoading(false);
    }
  };

  const pending = batches.filter(
    b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO'
  );
  const others = batches.filter(
    b => b.status !== 'PUBLICADO' && b.status !== 'CONFIRMADO'
  );

  const tempNum = parseFloat(originTempC);
  const tempOver = !isNaN(tempNum) && tempNum > 4;

  return (
    <div>
      {/* Línea de 3 px #1F6F78 arriba del todo y nada más de ese color */}
      <div style={{ height: 3, background: '#1F6F78', width: '100%' }} />

      <div className="page">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 6px' }}>
          {hotel?.name ?? user?.displayName ?? 'Hotel'}
        </h1>
        {hotel?.dock && (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 28 }}>
            Muelle: {hotel.dock}
          </p>
        )}

        {/* Botones de acción */}
        {!showForm && (
          <div className="stack stack-sm" style={{ marginBottom: 32, marginTop: hotel?.dock ? 0 : 20 }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => { setShowForm(true); setSuccess(false); }}
            >
              Publicar excedente
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%' }}
              disabled={noSurplusLoading}
              onClick={markNoSurplus}
            >
              {noSurplusLoading ? 'Guardando…' : 'Hoy no hay excedente'}
            </button>
          </div>
        )}

        {success && (
          <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500, marginBottom: 20 }}>
            Lote publicado. El banco confirmará la recogida de mañana.
          </p>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={submit} className="stack stack-md" style={{ marginBottom: 40 }}>
            <div className="field">
              <label>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value as BatchCategory)}>
                <option value="SELLADO">Insumo sellado del almacén, cerca de vencer</option>
                <option value="PRODUCCION_FRIA">Producción de cocina que no salió a la barra (guardada a 4 °C o menos)</option>
              </select>
            </div>

            <div className="field">
              <label>¿Qué es?</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Pechuga de pollo envasada, quesos"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Peso estimado (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={estimatedKg}
                  onChange={e => setEstimatedKg(e.target.value)}
                  placeholder="18"
                  required
                />
              </div>
              <div className="field">
                <label>Temperatura de origen (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={originTempC}
                  onChange={e => setOriginTempC(e.target.value)}
                  placeholder="3"
                  required
                  style={tempOver ? { borderColor: 'var(--terra)' } : undefined}
                />
              </div>
            </div>

            <div className="field">
              <label>Ventana de mañana</label>
              <select value={windowVal} onChange={e => setWindowVal(e.target.value)}>
                {WINDOWS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {tempOver && (
              <p className="notice">
                {originTempC} °C supera los 4 °C. No se puede publicar. Enfría primero.
              </p>
            )}
            {isForbidden(name) && (
              <p className="notice">Buffet, plato de huésped y fórmula infantil no se pueden publicar.</p>
            )}
            {formErr && <p className="notice">{formErr}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Publicando…' : 'Publicar'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowForm(false); setFormErr(''); }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Pendiente: lotes publicados aún sin chofer, y lotes confirmados para mañana */}
        <p className="section-title" style={{ marginBottom: 12 }}>Pendiente</p>
        {pending.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 24 }}>No hay lotes pendientes.</p>
        ) : (
          <div style={{ marginBottom: 28 }}>
            {pending.map(b => <BatchRow key={b.id} batch={b} />)}
          </div>
        )}

        {/* Historial (RECOGIDO, RECIBIDO, RECHAZADO, SIN_EXCEDENTE) */}
        {others.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 24, marginBottom: 12 }}>Historial</p>
            <div>
              {others.map(b => <BatchRow key={b.id} batch={b} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
