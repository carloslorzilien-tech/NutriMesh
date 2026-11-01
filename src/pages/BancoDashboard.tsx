import { useState, useEffect, useRef } from 'react';
import { useActivity } from '../context/ActivityContext';
import { subscribeBatches, updateBatchFields } from '../lib/store';
import { MOTIVO_LABEL } from '../lib/demo';
import type { Batch, RejectionMotivo } from '../lib/types';
import BatchRow from '../components/BatchRow';

type Tab = 'manana' | 'camino' | 'cerrados';

const MOTIVOS = Object.entries(MOTIVO_LABEL) as [RejectionMotivo, string][];

export default function BancoDashboard() {
  const { push } = useActivity();

  const [tab, setTab] = useState<Tab>('manana');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);

  // Confirm form
  const [driverName, setDriverName] = useState('');
  const [confirmWindow, setConfirmWindow] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Reception / Closure form
  const [acceptedKg, setAcceptedKg] = useState('');
  const [rejectedKg, setRejectedKg] = useState('');
  const [motivo, setMotivo] = useState<RejectionMotivo>('empaque');
  const [destTempC, setDestTempC] = useState('');
  const [acceptErr, setAcceptErr] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Mark in transit / picked up
  const [pickupLoading, setPickupLoading] = useState(false);
  const [driverPickedKg, setDriverPickedKg] = useState('');

  const prevBatchesRef = useRef<Record<string, string>>({});

  // Real-time subscription to ALL batches (null hotelId)
  useEffect(() => {
    const unsub = subscribeBatches(null, list => {
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
  }, [push]);

  // Keep selected batch updated with real-time data if open
  useEffect(() => {
    if (!selected) return;
    const fresh = batches.find(b => b.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [batches, selected]);

  // Three real-time numbers
  const toPickup = batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO').length;
  const inTransit = batches.filter(b => b.status === 'RECOGIDO').length;
  const kgAcceptedToday = batches
    .filter(b => b.status === 'RECIBIDO')
    .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);

  const openBatchModal = (b: Batch) => {
    setSelected(b);
    setDriverName(b.driverName || '');
    setConfirmWindow(b.window || '8:00–10:00');
    setDriverPickedKg(String(b.pickedUpKg ?? b.estimatedKg));
    setAcceptedKg(b.acceptedKg != null ? String(b.acceptedKg) : String(b.pickedUpKg ?? b.estimatedKg));
    setRejectedKg(b.rejectedKg != null ? String(b.rejectedKg) : '0');
    setMotivo(b.rejectReason || 'empaque');
    setDestTempC(b.destTempC != null ? String(b.destTempC) : '');
    setAcceptErr('');
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirmLoading(true);
    try {
      const token = selected.driverToken || `tok-${Date.now().toString(36)}`;
      await updateBatchFields(selected.id, {
        status: 'CONFIRMADO',
        driverName: driverName.trim() || 'Sin asignar',
        driverToken: token,
        window: confirmWindow.trim() || selected.window,
      });
      setSelected(null);
    } catch {
      setAcceptErr('Error al confirmar.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!selected) return;
    setPickupLoading(true);
    try {
      const k = parseFloat(driverPickedKg) || selected.estimatedKg;
      await updateBatchFields(selected.id, {
        status: 'RECOGIDO',
        pickedUpKg: k,
      });
      setSelected(null);
    } catch {
      setAcceptErr('Error al marcar recogida.');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleAcceptClose = async () => {
    if (!selected) return;
    setAcceptErr('');
    const akg = parseFloat(acceptedKg);
    const rkg = parseFloat(rejectedKg) || 0;

    if (isNaN(akg) || akg < 0) {
      setAcceptErr('Ingresa los kg aceptados.');
      return;
    }
    if (akg + rkg > selected.estimatedKg + 1) {
      setAcceptErr(`La suma (${akg + rkg} kg) no puede pasar el estimado (${selected.estimatedKg} kg) en más de 1 kg.`);
      return;
    }
    if (rkg > 0 && !motivo) {
      setAcceptErr('Elige el motivo del rechazo.');
      return;
    }

    setAcceptLoading(true);
    try {
      const newStatus = akg === 0 ? 'RECHAZADO' : 'RECIBIDO';
      await updateBatchFields(selected.id, {
        status: newStatus,
        acceptedKg: akg,
        rejectedKg: rkg,
        rejectReason: rkg > 0 ? motivo : undefined,
        destTempC: destTempC ? parseFloat(destTempC) : undefined,
      });
      setSelected(null);
    } catch {
      setAcceptErr('Error al guardar la recepción.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const filterBatches = (t: Tab) => {
    if (t === 'manana') return batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO');
    if (t === 'camino') return batches.filter(b => b.status === 'RECOGIDO');
    return batches.filter(b => b.status === 'RECIBIDO' || b.status === 'RECHAZADO' || b.status === 'SIN_EXCEDENTE');
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'manana', label: 'Para mañana' },
    { key: 'camino', label: 'En camino' },
    { key: 'cerrados', label: 'Cerrados' },
  ];

  const visible = filterBatches(tab);

  return (
    <div>
      {/* Barra verde de 40 px, texto claro, tres cifras reales */}
      <div className="bank-bar">
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{toPickup}</span>
          <span className="bank-bar-label">por recoger</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{inTransit}</span>
          <span className="bank-bar-label">en camino</span>
        </div>
        <div className="bank-bar-stat">
          <span className="bank-bar-num mono">{kgAcceptedToday.toFixed(1)} kg</span>
          <span className="bank-bar-label">kg aceptados hoy</span>
        </div>
      </div>

      <div className="page-wide">
        <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', margin: '32px 0 20px' }}>
          Banco de Alimentos
        </h1>

        {/* Pestañas */}
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

        {/* Lista de lotes */}
        {visible.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Nada aquí.</p>
        )}
        {visible.map(b => (
          <BatchRow
            key={b.id}
            batch={b}
            onClick={() => openBatchModal(b)}
          />
        ))}

        {/* Impacto — suma solo acceptedKg de los RECIBIDO */}
        {tab === 'cerrados' && (
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>Impacto</p>
            <p style={{ fontSize: 22, fontWeight: 520 }}>
              <span className="mono">{kgAcceptedToday.toFixed(1)} kg</span> aceptados
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
              <span className="mono">{Math.round(kgAcceptedToday / 0.4)}</span> raciones (supuesto) · <span className="mono">{(kgAcceptedToday * 2.5).toFixed(1)} kg CO₂e</span> (supuesto)
            </p>
          </div>
        )}

        {/* Modal de acción */}
        {selected && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(20,33,28,0.4)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
            }}
            onClick={() => setSelected(null)}
          >
            <div
              style={{
                background: 'var(--surface)', width: '100%', maxWidth: 560,
                borderRadius: '16px 16px 0 0', padding: '28px 24px 40px',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Lote
              </p>
              <p style={{ fontSize: 20, fontWeight: 560, marginBottom: 4 }}>{selected.name}</p>
              <p className="batch-row-meta mono" style={{ marginBottom: 20 }}>
                {selected.estimatedKg} kg · {selected.originTempC} °C · {selected.hotelName}
              </p>

              {/* 1. PUBLICADO → Confirmar recogida */}
              {selected.status === 'PUBLICADO' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label>Nombre del chofer</label>
                    <input
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      placeholder="Ej. Pedro Santos"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Ventana de mañana</label>
                    <input
                      value={confirmWindow}
                      onChange={e => setConfirmWindow(e.target.value)}
                      placeholder="8:00–10:00"
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={confirmLoading}
                    style={{ width: '100%' }}
                    onClick={handleConfirm}
                  >
                    {confirmLoading ? 'Confirmando…' : 'Confirmar recogida'}
                  </button>
                </div>
              )}

              {/* 2. CONFIRMADO → Opciones: Chofer link o marcar recogida */}
              {selected.status === 'CONFIRMADO' && (
                <div className="stack stack-md">
                  {selected.driverToken && (
                    <div style={{ background: 'var(--canvas)', padding: 12, borderRadius: 6, fontSize: 13 }}>
                      <p style={{ color: 'var(--ink-soft)', marginBottom: 4 }}>Enlace para el chofer (sin cuenta):</p>
                      <p className="mono" style={{ wordBreak: 'break-all', color: 'var(--green)' }}>
                        {window.location.origin}/c/{selected.driverToken}
                      </p>
                    </div>
                  )}

                  <div className="field">
                    <label>Kg recogidos por el chofer</label>
                    <input
                      type="number"
                      step="0.1"
                      value={driverPickedKg}
                      onChange={e => setDriverPickedKg(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={pickupLoading}
                    style={{ width: '100%' }}
                    onClick={handleMarkPickedUp}
                  >
                    {pickupLoading ? 'Marcando…' : 'Marcar como recogido'}
                  </button>
                </div>
              )}

              {/* 3. RECOGIDO → Cierre / Aceptación parcial */}
              {selected.status === 'RECOGIDO' && (
                <div className="stack stack-md">
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    Estimado: <span className="mono">{selected.estimatedKg} kg</span> · Chofer: <span className="mono">{selected.pickedUpKg ?? selected.estimatedKg} kg</span>
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>Kg aceptados</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={acceptedKg}
                        onChange={e => setAcceptedKg(e.target.value)}
                        placeholder="15"
                      />
                    </div>
                    <div className="field">
                      <label>Kg rechazados</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rejectedKg}
                        onChange={e => setRejectedKg(e.target.value)}
                        placeholder="3"
                      />
                    </div>
                  </div>

                  {parseFloat(rejectedKg) > 0 && (
                    <div className="field">
                      <label>Motivo del rechazo</label>
                      <select value={motivo} onChange={e => setMotivo(e.target.value as RejectionMotivo)}>
                        {MOTIVOS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="field">
                    <label>Temperatura en destino °C (opcional)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={destTempC}
                      onChange={e => setDestTempC(e.target.value)}
                      placeholder="—"
                    />
                  </div>

                  {acceptErr && <p className="notice">{acceptErr}</p>}

                  <button
                    className="btn btn-primary"
                    disabled={acceptLoading}
                    style={{ width: '100%' }}
                    onClick={handleAcceptClose}
                  >
                    {acceptLoading ? 'Guardando…' : 'Registrar recepción'}
                  </button>
                </div>
              )}

              {/* 4. CERRADOS (RECIBIDO / RECHAZADO) */}
              {(selected.status === 'RECIBIDO' || selected.status === 'RECHAZADO') && (
                <div className="stack stack-sm" style={{ fontSize: 14 }}>
                  <p>Aceptados: <span className="mono">{selected.acceptedKg ?? 0} kg</span></p>
                  {selected.rejectedKg != null && selected.rejectedKg > 0 && (
                    <p style={{ color: 'var(--terra)' }}>
                      Rechazados: <span className="mono">{selected.rejectedKg} kg</span>
                      {selected.rejectReason ? ` — ${MOTIVO_LABEL[selected.rejectReason]}` : ''}
                    </p>
                  )}
                  {selected.destTempC != null && (
                    <p className="mono">Temperatura en destino: {selected.destTempC} °C</p>
                  )}
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
      </div>
    </div>
  );
}
