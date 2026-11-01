import { useState, useEffect } from 'react';
import { BATCHES, bankStats, updateBatch, newId, MOTIVO_LABEL } from '../lib/demo';
import type { Batch, RejectionMotivo } from '../lib/types';
import BatchRow from '../components/BatchRow';

type Tab = 'manana' | 'camino' | 'cerrados';

function filterBatches(batches: Batch[], t: Tab) {
  if (t === 'manana')   return batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO');
  if (t === 'camino')   return batches.filter(b => b.status === 'RECOGIDO');
  return batches.filter(b => b.status === 'RECIBIDO' || b.status === 'RECHAZADO' || b.status === 'SIN_EXCEDENTE');
}

const MOTIVOS = Object.entries(MOTIVO_LABEL) as [RejectionMotivo, string][];

export default function BancoDashboard() {
  const [tab, setTab] = useState<Tab>('manana');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);
  // Confirm fields
  const [driverName, setDriverName] = useState('');
  // Acceptance fields
  const [acceptedKg, setAcceptedKg] = useState('');
  const [rejectedKg, setRejectedKg] = useState('');
  const [motivo, setMotivo] = useState<RejectionMotivo>('empaque');
  const [destTempC, setDestTempC] = useState('');
  const [acceptErr, setAcceptErr] = useState('');

  const refresh = () => setBatches([...BATCHES]);
  useEffect(() => { refresh(); }, []);

  // Recompute stats every time batches changes
  const stats = bankStats();

  const confirm = () => {
    if (!selected) return;
    const token = `tok-${newId()}`;
    updateBatch(selected.id, {
      status: 'CONFIRMADO',
      driverName: driverName.trim() || 'Sin asignar',
      driverToken: selected.driverToken || token,
    });
    setSelected(null);
    setDriverName('');
    refresh();
  };

  const accept = () => {
    if (!selected) return;
    setAcceptErr('');
    const akg = parseFloat(acceptedKg);
    const rkg = parseFloat(rejectedKg) || 0;
    if (isNaN(akg) || akg < 0) { setAcceptErr('Ingresa kg aceptados.'); return; }
    if (akg + rkg > selected.kg + 1) {
      setAcceptErr(`La suma (${akg + rkg} kg) supera el estimado (${selected.kg} kg) en más de 1 kg.`);
      return;
    }
    if (rkg > 0 && !motivo) { setAcceptErr('Elige el motivo del rechazo.'); return; }

    const newStatus = akg === 0 ? 'RECHAZADO' : 'RECIBIDO';
    updateBatch(selected.id, {
      status: newStatus,
      acceptedKg: akg,
      rejectedKg: rkg,
      rejectionMotivo: rkg > 0 ? motivo : undefined,
      destTempC: destTempC ? parseFloat(destTempC) : undefined,
    });
    setSelected(null);
    setAcceptedKg('');
    setRejectedKg('');
    setDestTempC('');
    setAcceptErr('');
    refresh();
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'manana', label: 'Para mañana' },
    { key: 'camino', label: 'En camino' },
    { key: 'cerrados', label: 'Cerrados' },
  ];

  const visible = filterBatches(batches, tab);

  return (
    <div>
      {/* Stats bar */}
      <div className="bank-bar">
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.toPickup}</span>
          <span className="bank-bar-label">por recoger</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.inTransit}</span>
          <span className="bank-bar-label">en camino</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{stats.kgToday.toFixed(1)} kg</span>
          <span className="bank-bar-label">aceptados hoy</span>
        </div>
      </div>

      <div className="page-wide">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 20px' }}>
          Banco de Alimentos
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
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

        {visible.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Nada aquí.</p>
        )}
        {visible.map(b => (
          <BatchRow
            key={b.id}
            batch={b}
            onClick={
              b.status === 'PUBLICADO' || b.status === 'RECOGIDO'
                ? () => { setSelected(b); setAcceptErr(''); }
                : undefined
            }
          />
        ))}

        {/* Action sheet */}
        {selected && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(20,33,28,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
            onClick={() => setSelected(null)}
          >
            <div
              style={{ background: 'var(--surface)', width: '100%', maxWidth: 560, borderRadius: '16px 16px 0 0', padding: '28px 24px 40px' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Lote</p>
              <p style={{ fontSize: 20, fontWeight: 560, marginBottom: 4 }}>{selected.item}</p>
              <p className="batch-row-meta mono" style={{ marginBottom: 20 }}>
                {selected.kg} kg · {selected.tempC} °C · {selected.hotelName}
              </p>

              {/* PUBLICADO → Confirmar recogida */}
              {selected.status === 'PUBLICADO' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label>Nombre del chofer</label>
                    <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Ej. Pedro Santos" />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirm}>
                    Confirmar recogida
                  </button>
                </div>
              )}

              {/* RECOGIDO → Aceptación parcial */}
              {selected.status === 'RECOGIDO' && (
                <div className="stack stack-md">
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    El chofer declaró <span className="mono">{selected.driverKg ?? selected.kg} kg</span>. Ingresa lo que recibiste en el almacén.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>kg aceptados</label>
                      <input type="number" min="0" step="0.1" value={acceptedKg} onChange={e => setAcceptedKg(e.target.value)} placeholder="0" />
                    </div>
                    <div className="field">
                      <label>kg rechazados</label>
                      <input type="number" min="0" step="0.1" value={rejectedKg} onChange={e => setRejectedKg(e.target.value)} placeholder="0" />
                    </div>
                  </div>

                  {(parseFloat(rejectedKg) > 0) && (
                    <div className="field">
                      <label>Motivo del rechazo</label>
                      <select value={motivo} onChange={e => setMotivo(e.target.value as RejectionMotivo)}>
                        {MOTIVOS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="field">
                    <label>Temperatura en destino °C (opcional)</label>
                    <input type="number" step="0.1" value={destTempC} onChange={e => setDestTempC(e.target.value)} placeholder="—" />
                  </div>

                  {acceptErr && <p className="notice">{acceptErr}</p>}

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={accept}>
                    Registrar recepción
                  </button>
                </div>
              )}

              <button
                style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: 14, cursor: 'pointer' }}
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Impacto — sección Cerrados */}
        {tab === 'cerrados' && visible.length > 0 && (() => {
          const totalAceptado = visible
            .filter(b => b.status === 'RECIBIDO')
            .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);
          if (totalAceptado === 0) return null;
          return (
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>Impacto — supuesto</p>
              <p style={{ fontSize: 22, fontWeight: 520 }}>
                <span className="mono">{totalAceptado.toFixed(1)} kg</span> aceptados
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
                <span className="mono">{Math.round(totalAceptado / 0.4)}</span> raciones · <span className="mono">{(totalAceptado * 2.5).toFixed(1)} kg</span> CO₂e evitado
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>
                Raciones y CO₂e son supuestos, no mediciones. 0,4 kg por ración · 2,5 kg CO₂e por kg rescatado.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
