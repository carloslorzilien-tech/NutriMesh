import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBatchesByHotel, getHotelById, addBatch, newId } from '../lib/demo';
import type { Batch, BatchCategory } from '../lib/types';
import BatchRow from '../components/BatchRow';

const FORBIDDEN_WORDS = ['formula', 'infant', 'baby', 'fórmula', 'buffet'];

function isForbidden(item: string) {
  const low = item.toLowerCase();
  return FORBIDDEN_WORDS.some(f => low.includes(f));
}

const WINDOWS = ['8:00–10:00', '9:00–11:00', '10:00–12:00'];

export default function HotelDashboard() {
  const { user } = useAuth();
  const hotel = getHotelById(user?.hotelId ?? '');

  const [batches, setBatches] = useState<Batch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<BatchCategory>('sellado');
  const [kg, setKg] = useState('');
  const [tempC, setTempC] = useState('');
  const [pickupWindow, setPickupWindow] = useState(WINDOWS[0]);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setBatches(getBatchesByHotel(user?.hotelId ?? ''));
  }, [user]);

  const refresh = () => setBatches(getBatchesByHotel(user?.hotelId ?? ''));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setSuccess(false);

    const t = parseFloat(tempC);
    const k = parseFloat(kg);

    if (isForbidden(item)) {
      setFormErr('Buffet, comida de huésped y fórmula infantil no se pueden publicar.');
      return;
    }
    if (isNaN(t) || t > 4) {
      setFormErr(`Temperatura ${t} °C supera los 4 °C. El lote no puede publicarse. Enfría primero.`);
      return;
    }
    if (isNaN(k) || k <= 0) {
      setFormErr('Ingresa un peso válido.');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const batch: Batch = {
      id: newId(),
      hotelId: user!.hotelId!,
      hotelName: hotel!.name,
      item: item.trim(),
      category,
      kg: k,
      tempC: t,
      status: 'PUBLICADO',
      pickupWindow,
      pickupDate: tomorrow.toISOString().slice(0, 10),
      driverToken: `tok-${newId()}`,
      createdAt: Date.now(),
    };

    addBatch(batch);
    refresh();
    setItem('');
    setKg('');
    setTempC('');
    setPickupWindow(WINDOWS[0]);
    setShowForm(false);
    setSuccess(true);
  };

  const markNoSurplus = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const batch: Batch = {
      id: newId(),
      hotelId: user!.hotelId!,
      hotelName: hotel!.name,
      item: 'Sin excedente hoy',
      category: 'sellado',
      kg: 0,
      tempC: 0,
      status: 'SIN_EXCEDENTE',
      pickupWindow: '—',
      pickupDate: tomorrow.toISOString().slice(0, 10),
      createdAt: Date.now(),
    };
    addBatch(batch);
    refresh();
    setSuccess(false);
  };

  // Solo "Pendiente": PUBLICADO sin chofer + CONFIRMADO
  const pending = batches.filter(
    b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO'
  );
  const rest = batches.filter(
    b => b.status !== 'PUBLICADO' && b.status !== 'CONFIRMADO'
  );

  const tempOver = !isNaN(parseFloat(tempC)) && parseFloat(tempC) > 4;

  return (
    <div>
      {/* 3px teal top line */}
      <div style={{ height: 3, background: '#1F6F78', width: '100%' }} />

      <div className="page">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 24px' }}>
          {hotel?.name ?? 'Hotel'}
        </h1>

        {/* Primary actions */}
        {!showForm && (
          <div className="stack stack-sm" style={{ marginBottom: 32 }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => { setShowForm(true); setSuccess(false); }}>
              Publicar excedente
            </button>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={markNoSurplus}>
              Hoy no hay excedente
            </button>
          </div>
        )}

        {success && (
          <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500, marginBottom: 20 }}>
            Lote publicado. El banco confirmará la recogida de mañana.
          </p>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={submit} className="stack stack-md" style={{ marginBottom: 40 }}>
            <div className="field">
              <label>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value as BatchCategory)}>
                <option value="sellado">Insumo sellado del almacén, cerca de vencer</option>
                <option value="produccion_fria">Producción de cocina fría — guardada a 4 °C o menos</option>
              </select>
            </div>

            <div className="field">
              <label>¿Qué es?</label>
              <input
                type="text"
                value={item}
                onChange={e => setItem(e.target.value)}
                placeholder="Ej. Pechuga de pollo envasada, queso fresco"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Peso estimado (kg)</label>
                <input type="number" min="0.1" step="0.1" value={kg} onChange={e => setKg(e.target.value)} placeholder="18" required />
              </div>
              <div className="field">
                <label>Temperatura sonda (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={e => setTempC(e.target.value)}
                  placeholder="3"
                  required
                  style={tempOver ? { borderColor: 'var(--terra)' } : undefined}
                />
              </div>
            </div>

            <div className="field">
              <label>Ventana de recogida mañana</label>
              <select value={pickupWindow} onChange={e => setPickupWindow(e.target.value)}>
                {WINDOWS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {tempOver && (
              <p className="notice">
                <span style={{ color: 'var(--terra)' }}>{parseFloat(tempC)} °C</span> supera los 4 °C — el lote no puede publicarse.
              </p>
            )}
            {isForbidden(item) && (
              <p className="notice">Buffet, comida de huésped y fórmula infantil no se pueden publicar.</p>
            )}
            {formErr && <p className="notice">{formErr}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publicar</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setFormErr(''); }}>Cancelar</button>
            </div>
          </form>
        )}

        {/* Pendiente */}
        {pending.length > 0 && (
          <>
            <p className="section-title" style={{ marginBottom: 12 }}>Pendiente</p>
            {pending.map(b => <BatchRow key={b.id} batch={b} />)}
          </>
        )}

        {/* Rest (RECOGIDO, RECIBIDO, RECHAZADO, SIN_EXCEDENTE) */}
        {rest.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 32, marginBottom: 12 }}>Historial</p>
            {rest.map(b => <BatchRow key={b.id} batch={b} />)}
          </>
        )}

        {batches.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Aún no hay lotes publicados hoy.</p>
        )}
      </div>
    </div>
  );
}
