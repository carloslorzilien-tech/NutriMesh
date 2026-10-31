import { useState, useEffect } from 'react';
import { BATCHES, bankStats, updateBatch } from '../lib/demo';
import type { Batch } from '../lib/types';
import BatchRow from '../components/BatchRow';

type Filter = 'available' | 'in_transit' | 'closed';

function filterBatches(batches: Batch[], f: Filter) {
  if (f === 'available') return batches.filter(b => b.status === 'available' || b.status === 'confirmed');
  if (f === 'in_transit') return batches.filter(b => b.status === 'in_transit');
  return batches.filter(b => b.status === 'completed' || b.status === 'rejected');
}

export default function BancoDashboard() {
  const [tab, setTab] = useState<Filter>('available');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);
  const [driverName, setDriverName] = useState('');
  const [receivedKg, setReceivedKg] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const stats = bankStats();

  const refresh = () => setBatches([...BATCHES]);
  useEffect(() => { refresh(); }, []);

  const confirm = () => {
    if (!selected) return;
    updateBatch(selected.id, { status: 'confirmed', driverName: driverName || 'Pending assignment' });
    setSelected(null);
    setDriverName('');
    refresh();
  };

  const dispatch = () => {
    if (!selected) return;
    updateBatch(selected.id, { status: 'in_transit', driverName: driverName || selected.driverName });
    setSelected(null);
    refresh();
  };

  const accept = () => {
    if (!selected) return;
    const rkg = parseFloat(receivedKg);
    updateBatch(selected.id, { status: 'completed', receivedKg: isNaN(rkg) ? selected.kg : rkg });
    setSelected(null);
    setReceivedKg('');
    refresh();
  };

  const reject = () => {
    if (!selected) return;
    updateBatch(selected.id, { status: 'rejected', rejectionReason: rejectReason || 'Rejected on arrival' });
    setSelected(null);
    setRejectReason('');
    refresh();
  };

  const TABS: { key: Filter; label: string }[] = [
    { key: 'available', label: 'For tomorrow' },
    { key: 'in_transit', label: 'In transit' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <div>
      {/* Stats bar */}
      <div className="bank-bar">
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.toPickup}</span>
          <span className="bank-bar-label">to pick up</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.inTransit}</span>
          <span className="bank-bar-label">in transit</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.kgToday} kg</span>
          <span className="bank-bar-label">received today</span>
        </div>
      </div>

      <div className="page-wide">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 20px' }}>
          Food Bank — BARD
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 12px',
                fontSize: 14,
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? 'var(--ink)' : 'var(--ink-soft)',
                borderBottom: tab === t.key ? '2px solid var(--green)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filterBatches(batches, tab).length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Nothing here.</p>
        )}
        {filterBatches(batches, tab).map(b => (
          <BatchRow key={b.id} batch={b} onClick={() => setSelected(b)} />
        ))}

        {/* Action panel */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(20,33,28,0.4)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100
          }} onClick={() => setSelected(null)}>
            <div
              style={{ background: 'var(--surface)', width: '100%', maxWidth: 560, borderRadius: '16px 16px 0 0', padding: '28px 24px 40px', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Batch</p>
              <p style={{ fontSize: 20, fontWeight: 560, marginBottom: 4 }}>{selected.item}</p>
              <p className="batch-row-meta mono" style={{ marginBottom: 20 }}>{selected.kg} kg · {selected.tempC} °C · {selected.hotelName}</p>

              {selected.status === 'available' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label>Assign driver (optional)</label>
                    <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Driver name" />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirm}>Confirm pickup</button>
                </div>
              )}

              {selected.status === 'confirmed' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label>Driver name</label>
                    <input value={driverName || selected.driverName || ''} onChange={e => setDriverName(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={dispatch}>Mark as in transit</button>
                </div>
              )}

              {selected.status === 'in_transit' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label>Actual weight received (kg)</label>
                    <input type="number" step="0.1" value={receivedKg} onChange={e => setReceivedKg(e.target.value)} placeholder={String(selected.kg)} />
                  </div>
                  <div className="field">
                    <label>Rejection reason (if rejecting)</label>
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Temperature, smell, packaging…" />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={accept}>Accept</button>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={reject}>Reject</button>
                  </div>
                </div>
              )}

              {(selected.status === 'completed' || selected.status === 'rejected') && (
                <div>
                  {selected.status === 'completed' && (
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                      Received: <span className="mono">{selected.receivedKg ?? selected.kg} kg</span> · 
                      Meals (est.): <span className="mono">{Math.round((selected.receivedKg ?? selected.kg) / 0.4)}</span> · 
                      CO₂e avoided (est.): <span className="mono">{((selected.receivedKg ?? selected.kg) * 2.5).toFixed(1)} kg</span>
                      <br /><span style={{ fontSize: 12 }}>Meal and carbon figures are assumptions, not measurements.</span>
                    </p>
                  )}
                  {selected.status === 'rejected' && selected.rejectionReason && (
                    <p style={{ fontSize: 14, color: 'var(--terra)' }}>{selected.rejectionReason}</p>
                  )}
                </div>
              )}

              <button style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: 14, cursor: 'pointer' }} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
