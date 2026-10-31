import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBatchesByHotel, getHotelById, addBatch, newId } from '../lib/demo';
import type { Batch, BatchCategory } from '../lib/types';
import BatchRow from '../components/BatchRow';

const FORBIDDEN = ['formula', 'infant', 'baby', 'fórmula', 'buffet', 'buffer'];

function isForbidden(item: string) {
  const low = item.toLowerCase();
  return FORBIDDEN.some(f => low.includes(f));
}

export default function HotelDashboard() {
  const { user } = useAuth();
  const hotel = getHotelById(user?.hotelId ?? '');

  const [batches, setBatches] = useState<Batch[]>([]);
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<BatchCategory>('sealed');
  const [kg, setKg] = useState('');
  const [tempC, setTempC] = useState('');
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
      setFormErr('Buffet food, guest-plate food, and infant formula cannot be logged.');
      return;
    }
    if (isNaN(t) || t > 4) {
      setFormErr('Temperature must be 4 °C or below. Batch cannot be logged.');
      return;
    }
    if (isNaN(k) || k <= 0) {
      setFormErr('Enter a valid weight.');
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
      status: 'available',
      pickupWindow: '8:00–10:00',
      pickupDate: tomorrow.toISOString().slice(0, 10),
      driverToken: `tok-${newId()}`,
      createdAt: Date.now(),
    };

    addBatch(batch);
    refresh();
    setItem('');
    setKg('');
    setTempC('');
    setSuccess(true);
  };

  return (
    <div>
      <div className="page">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 24px' }}>
          {hotel?.name ?? 'Hotel'}
        </h1>

        {/* Form */}
        <form onSubmit={submit} className="stack stack-md" style={{ marginBottom: 40 }}>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as BatchCategory)}>
              <option value="sealed">Sealed store-room goods nearing date</option>
              <option value="cold_production">Cold kitchen production — held at 4 °C or below</option>
            </select>
          </div>

          <div className="field">
            <label>What is it?</label>
            <input
              type="text"
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="e.g. Sealed chicken breast, aged cheese"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" min="0.1" step="0.1" value={kg} onChange={e => setKg(e.target.value)} placeholder="18" required />
            </div>
            <div className="field">
              <label>Temperature (°C)</label>
              <input type="number" step="0.5" value={tempC} onChange={e => setTempC(e.target.value)} placeholder="3" required />
            </div>
          </div>

          {parseFloat(tempC) > 4 && (
            <p className="notice">Temperature above 4 °C — batch cannot be logged. Cool it down first.</p>
          )}
          {isForbidden(item) && (
            <p className="notice">Buffet food, guest-plate food, and infant formula cannot be logged.</p>
          )}
          {formErr && <p className="notice">{formErr}</p>}
          {success && <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>Batch logged. The bank will confirm a morning pickup.</p>}

          <button type="submit" className="btn btn-primary">Log batch</button>
        </form>

        {/* Batch list */}
        <p className="section-title" style={{ marginBottom: 16 }}>Logged batches</p>
        {batches.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>No batches yet.</p>
        )}
        {batches.map(b => (
          <BatchRow key={b.id} batch={b} />
        ))}

        {hotel?.dockNote && (
          <p style={{ marginTop: 32, fontSize: 13, color: 'var(--ink-soft)' }}>
            Dock note: {hotel.dockNote}
          </p>
        )}
      </div>
    </div>
  );
}
