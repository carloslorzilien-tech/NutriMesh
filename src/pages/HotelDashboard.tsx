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

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BatchCategory>('SELLADO');
  const [estimatedKg, setEstimatedKg] = useState('');
  const [originTempC, setOriginTempC] = useState('');
  const [windowVal, setWindowVal] = useState(WINDOWS[0]);
  const [formErr, setFormErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [noSurplusLoading, setNoSurplusLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const prevBatchesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user?.hotelId) return;
    const unsub = subscribeHotel(user.hotelId, h => {
      setHotel(h ?? { id: user.hotelId!, name: user.displayName || 'Hotel', dock: '' });
    });
    return () => unsub();
  }, [user?.hotelId, user?.displayName]);

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

  const tempNum = parseFloat(originTempC);
  const tempOver = !isNaN(tempNum) && tempNum > 4;
  const forbidden = isForbidden(name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setSuccess(false);

    const t = parseFloat(originTempC);
    const k = parseFloat(estimatedKg);

    if (forbidden) { setFormErr('Buffet, plato de huésped y fórmula infantil no se pueden publicar.'); return; }
    if (isNaN(t) || t > 4) { setFormErr(`${originTempC} °C supera los 4 °C. No se puede publicar.`); return; }
    if (isNaN(k) || k <= 0) { setFormErr('Ingresa un peso válido.'); return; }

    setLoading(true);
    try {
      const hotelId = user?.hotelId || 'hotel-europa';
      const hotelName = hotel?.name || user?.displayName || 'Hotel';
      await publishBatch({
        hotelId, hotelName, category,
        name: name.trim(),
        estimatedKg: k, originTempC: t,
        window: windowVal, status: 'PUBLICADO',
        driverToken: `tok-${Date.now().toString(36)}`,
      });
      setName(''); setEstimatedKg(''); setOriginTempC('');
      setWindowVal(WINDOWS[0]);
      setShowForm(false);
      setSuccess(true);
    } catch {
      setFormErr('Error al publicar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const markNoSurplus = async () => {
    setNoSurplusLoading(true);
    try {
      const hotelId = user?.hotelId || 'hotel-europa';
      const hotelName = hotel?.name || user?.displayName || 'Hotel';
      await publishBatch({
        hotelId, hotelName, category: 'SELLADO',
        name: 'Sin excedente hoy',
        estimatedKg: 0, originTempC: 0,
        window: '—', status: 'SIN_EXCEDENTE',
      });
    } catch { /* silent */ }
    finally { setNoSurplusLoading(false); }
  };

  const pending = batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO');
  const others  = batches.filter(b => b.status !== 'PUBLICADO' && b.status !== 'CONFIRMADO');

  // Right-column form
  const rightPanel = (
    <div className="col-detail">
      <p className="section-title" style={{ marginBottom: 20 }}>
        {showForm ? 'Nuevo lote' : 'Publicar'}
      </p>

      {success && !showForm && (
        <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 20 }}>
          Lote publicado. El banco confirmará la recogida de mañana.
        </p>
      )}

      {!showForm && (
        <div className="stack stack-sm">
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

      {showForm && (
        <form onSubmit={submit} className="stack stack-md">
          <div className="field">
            <label>Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value as BatchCategory)}>
              <option value="SELLADO">Insumo sellado del almacén, cerca de vencer</option>
              <option value="PRODUCCION_FRIA">Producción de cocina — no salió a la barra, a 4 °C o menos</option>
            </select>
          </div>

          <div className="field">
            <label>¿Qué es?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Pechuga de pollo envasada"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Peso estimado (kg)</label>
              <input
                type="number" min="0.1" step="0.1"
                value={estimatedKg}
                onChange={e => setEstimatedKg(e.target.value)}
                placeholder="18"
                required
              />
            </div>
            <div className="field">
              <label>Temperatura sonda (°C)</label>
              <input
                type="number" step="0.1"
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

          {/* Temp over 4 → button disabled + terracota reason */}
          {tempOver && (
            <p className="notice">{originTempC} °C supera los 4 °C. No se puede publicar. Enfría primero.</p>
          )}
          {forbidden && (
            <p className="notice">Buffet, plato de huésped y fórmula infantil no se pueden publicar.</p>
          )}
          {formErr && <p className="notice">{formErr}</p>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || tempOver || forbidden}
              style={{ flex: 1 }}
            >
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
    </div>
  );

  return (
    <div>
      {/* Línea de 3 px #1F6F78 arriba del todo */}
      <div style={{ height: 3, background: '#1F6F78', width: '100%' }} />

      <div className="two-col">
        {/* Left: list */}
        <div className="col-list">
          <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {hotel?.name ?? user?.displayName ?? 'Hotel'}
          </h1>
          {hotel?.dock && (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 24 }}>
              Muelle: {hotel.dock}
            </p>
          )}

          <p className="section-title" style={{ marginBottom: 12, marginTop: hotel?.dock ? 0 : 20 }}>
            Pendiente
          </p>
          {pending.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 24 }}>No hay lotes pendientes.</p>
          ) : (
            <div style={{ marginBottom: 28 }}>
              {pending.map(b => <BatchRow key={b.id} batch={b} />)}
            </div>
          )}

          {others.length > 0 && (
            <>
              <p className="section-title" style={{ marginTop: 24, marginBottom: 12 }}>Historial</p>
              <div>{others.map(b => <BatchRow key={b.id} batch={b} />)}</div>
            </>
          )}
        </div>

        {/* Right: form panel */}
        {rightPanel}
      </div>
    </div>
  );
}
