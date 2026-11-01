import { useState, useEffect, useRef } from 'react';
import { useActivity } from '../context/ActivityContext';
import { subscribeBatches, updateBatchFields } from '../lib/store';
import { MOTIVO_LABEL } from '../lib/demo';
import type { Batch, RejectionMotivo } from '../lib/types';
import BatchRow from '../components/BatchRow';

type Tab = 'manana' | 'camino' | 'cerrados';

const MOTIVOS = Object.entries(MOTIVO_LABEL) as [RejectionMotivo, string][];

// Map hotel IDs to Google Maps URLs
const HOTEL_MAP_URL: Record<string, string> = {
  'hotel-europa':  'https://maps.google.com/?q=Gran+Hotel+Europa+Santo+Domingo',
  'hotel-barcelo': 'https://maps.google.com/?q=Barcelo+Santo+Domingo',
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

function buildWhatsAppMsg(batch: Batch, driverLink: string, dock: string, mapUrl: string): string {
  const category = batch.category === 'SELLADO'
    ? 'insumo sellado del almacén'
    : 'producción de cocina fría';
  return encodeURIComponent(
    `NutriMesh — Recogida confirmada\n\n` +
    `Lote: ${batch.name} (${category})\n` +
    `Hotel: ${batch.hotelName}\n` +
    `Muelle: ${dock || '—'}\n` +
    `Mapa: ${mapUrl}\n` +
    `Peso estimado: ${batch.estimatedKg} kg\n` +
    `Temperatura de origen: ${batch.originTempC} °C\n` +
    `Ventana de recogida: ${batch.window}\n\n` +
    `Tu enlace (sin cuenta): ${driverLink}`
  );
}

function buildShareText(batch: Batch, driverLink: string, dock: string, mapUrl: string): string {
  const category = batch.category === 'SELLADO'
    ? 'insumo sellado del almacén'
    : 'producción de cocina fría';
  return (
    `NutriMesh — Recogida confirmada\n\n` +
    `Lote: ${batch.name} (${category})\n` +
    `Hotel: ${batch.hotelName}\n` +
    `Muelle: ${dock || '—'}\n` +
    `Mapa: ${mapUrl}\n` +
    `Peso estimado: ${batch.estimatedKg} kg\n` +
    `Temperatura de origen: ${batch.originTempC} °C\n` +
    `Ventana de recogida: ${batch.window}\n\n` +
    `Tu enlace (sin cuenta): ${driverLink}`
  );
}

// ─── Timeline component ───────────────────────────────────────────────────────

const STEPS: { key: string; label: string }[] = [
  { key: 'PUBLICADO',  label: 'Publicado' },
  { key: 'CONFIRMADO', label: 'Confirmado' },
  { key: 'RECOGIDO',   label: 'Recogido' },
  { key: 'RECIBIDO',   label: 'Recibido / Cerrado' },
];

const STATUS_ORDER: Record<string, number> = {
  PUBLICADO:    0,
  CONFIRMADO:   1,
  RECOGIDO:     2,
  RECIBIDO:     3,
  RECHAZADO:    3,
  SIN_EXCEDENTE: 4,
};

function Timeline({ batch }: { batch: Batch }) {
  const current = STATUS_ORDER[batch.status] ?? 0;
  return (
    <div className="timeline">
      {STEPS.map((step, i) => {
        const done = i <= current;
        // We only have createdAt and updatedAt; show time for first and last done step
        const showTime = done && (i === 0 || i === current);
        const ts = i === 0 ? batch.createdAt : (i === current ? batch.updatedAt : null);
        return (
          <div key={step.key} className="timeline-step">
            <div className={`timeline-dot ${done ? 'done' : ''}`} />
            <div className="timeline-body">
              <p className={`timeline-label ${done ? 'done' : ''}`}>{step.label}</p>
              {showTime && ts && (
                <p className="timeline-time">{formatTime(ts)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Expediente (right panel detail) ─────────────────────────────────────────

interface ExpedienteProps {
  batch: Batch | null;
  driverName: string;
  setDriverName: (v: string) => void;
  confirmWindow: string;
  setConfirmWindow: (v: string) => void;
  confirmLoading: boolean;
  handleConfirm: () => void;
  acceptedKg: string;
  setAcceptedKg: (v: string) => void;
  rejectedKg: string;
  setRejectedKg: (v: string) => void;
  motivo: RejectionMotivo;
  setMotivo: (v: RejectionMotivo) => void;
  destTempC: string;
  setDestTempC: (v: string) => void;
  acceptErr: string;
  acceptLoading: boolean;
  handleAcceptClose: () => void;
  driverPickedKg: string;
  setDriverPickedKg: (v: string) => void;
  pickupLoading: boolean;
  handleMarkPickedUp: () => void;
  copySuccess: boolean;
  handleCopy: () => void;
  activityLines: { id: string; text: string }[];
}

function Expediente(props: ExpedienteProps) {
  const {
    batch, driverName, setDriverName,
    confirmWindow, setConfirmWindow,
    confirmLoading, handleConfirm,
    acceptedKg, setAcceptedKg,
    rejectedKg, setRejectedKg,
    motivo, setMotivo,
    destTempC, setDestTempC,
    acceptErr, acceptLoading, handleAcceptClose,
    driverPickedKg, setDriverPickedKg,
    pickupLoading, handleMarkPickedUp,
    copySuccess, handleCopy,
    activityLines,
  } = props;

  const driverLink = batch?.driverToken
    ? `${window.location.origin}/c/${batch.driverToken}`
    : '';

  const mapUrl = batch ? (HOTEL_MAP_URL[batch.hotelId] ?? '') : '';
  // dock comes from hotel doc; we show what's stored in batch for now
  const dock = ''; // will be populated when we read hotel doc in parent
  const whatsappMsg = batch && driverLink ? buildWhatsAppMsg(batch, driverLink, dock, mapUrl) : '';
  const shareText   = batch && driverLink ? buildShareText(batch, driverLink, dock, mapUrl) : '';

  if (!batch) {
    return (
      <div className="col-detail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
        {/* SVG logo 64 px at 20 % opacity — not repainted, just sized */}
        <img
          src="/logo.svg"
          alt=""
          width={64}
          height={64}
          style={{ opacity: 0.2, marginBottom: 16 }}
        />
        <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>Elige un lote</p>

        {/* Activity below the empty state */}
        {activityLines.length > 0 && (
          <div style={{ width: '100%', marginTop: 40 }}>
            <p className="section-title" style={{ marginBottom: 10 }}>Actividad</p>
            <div className="stack stack-sm">
              {activityLines.map(l => (
                <p key={l.id} style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{l.text}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="col-detail">
      {/* Header */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Expediente
      </p>
      <p style={{ fontSize: 18, fontWeight: 560, marginBottom: 4 }}>{batch.name}</p>

      {/* Details */}
      <div className="stack stack-sm" style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
        <p>{batch.category === 'SELLADO' ? 'Insumo sellado' : 'Producción de cocina fría'}</p>
        <p className="mono">{batch.estimatedKg} kg · {batch.originTempC} °C · {batch.window}</p>
        <p>{batch.hotelName}</p>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline', fontSize: 13 }}>
            Ver en mapa
          </a>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 20 }} />

      {/* Timeline */}
      <p className="section-title" style={{ marginBottom: 12 }}>Estado</p>
      <Timeline batch={batch} />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

      {/* Actions by status */}

      {/* PUBLICADO → Confirmar recogida */}
      {batch.status === 'PUBLICADO' && (
        <div className="stack stack-md">
          <div className="field">
            <label>Nombre del chofer</label>
            <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Ej. Pedro Santos" />
          </div>
          <div className="field">
            <label>Ventana confirmada</label>
            <input value={confirmWindow} onChange={e => setConfirmWindow(e.target.value)} placeholder="8:00–10:00" />
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

      {/* CONFIRMADO → Copiar enlace + WhatsApp */}
      {batch.status === 'CONFIRMADO' && driverLink && (
        <div className="stack stack-md">
          <div style={{ background: 'var(--canvas)', padding: 10, borderRadius: 6 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Enlace para el chofer</p>
            <p className="mono" style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--green)' }}>{driverLink}</p>
          </div>

          {/* Copiar + WhatsApp side by side */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={handleCopy}
            >
              {copySuccess ? '¡Copiado!' : 'Copiar enlace'}
            </button>
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ flex: 1, textDecoration: 'none' }}
              onClick={e => { if (!shareText) e.preventDefault(); }}
            >
              WhatsApp
            </a>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <div className="field">
            <label>Kg recogidos (si el chofer ya fue)</label>
            <input
              type="number" step="0.1"
              value={driverPickedKg}
              onChange={e => setDriverPickedKg(e.target.value)}
            />
          </div>
          <button
            className="btn btn-ghost"
            disabled={pickupLoading}
            style={{ width: '100%' }}
            onClick={handleMarkPickedUp}
          >
            {pickupLoading ? 'Marcando…' : 'Marcar como recogido'}
          </button>
        </div>
      )}

      {/* RECOGIDO → Aceptación parcial */}
      {batch.status === 'RECOGIDO' && (
        <div className="stack stack-md">
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            Estimado: <span className="mono">{batch.estimatedKg} kg</span>
            {batch.pickedUpKg != null && <> · Chofer: <span className="mono">{batch.pickedUpKg} kg</span></>}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Kg aceptados</label>
              <input
                type="number" min="0" step="0.1"
                value={acceptedKg}
                onChange={e => setAcceptedKg(e.target.value)}
                placeholder="15"
              />
            </div>
            <div className="field">
              <label>Kg rechazados</label>
              <input
                type="number" min="0" step="0.1"
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
              type="number" step="0.1"
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

      {/* RECIBIDO / RECHAZADO */}
      {(batch.status === 'RECIBIDO' || batch.status === 'RECHAZADO') && (
        <div className="stack stack-sm" style={{ fontSize: 14 }}>
          <p>
            Aceptados: <span className="mono">{batch.acceptedKg ?? 0} kg</span>
          </p>
          {batch.rejectedKg != null && batch.rejectedKg > 0 && (
            <p style={{ color: 'var(--terra)' }}>
              Rechazados: <span className="mono">{batch.rejectedKg} kg</span>
              {batch.rejectReason ? ` — ${MOTIVO_LABEL[batch.rejectReason]}` : ''}
            </p>
          )}
          {batch.destTempC != null && (
            <p className="mono">Temperatura en destino: {batch.destTempC} °C</p>
          )}
        </div>
      )}

      {/* Activity below expediente */}
      {activityLines.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p className="section-title" style={{ marginBottom: 10 }}>Actividad</p>
          <div className="stack stack-sm">
            {activityLines.map(l => (
              <p key={l.id} style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{l.text}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function BancoDashboard() {
  const { lines: activityLines } = useActivity();
  const { push } = useActivity();

  const [tab, setTab] = useState<Tab>('manana');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);

  const [driverName, setDriverName] = useState('');
  const [confirmWindow, setConfirmWindow] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [acceptedKg, setAcceptedKg] = useState('');
  const [rejectedKg, setRejectedKg] = useState('');
  const [motivo, setMotivo] = useState<RejectionMotivo>('empaque');
  const [destTempC, setDestTempC] = useState('');
  const [acceptErr, setAcceptErr] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  const [driverPickedKg, setDriverPickedKg] = useState('');
  const [pickupLoading, setPickupLoading] = useState(false);

  const [copySuccess, setCopySuccess] = useState(false);

  const prevBatchesRef = useRef<Record<string, string>>({});

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

  // Keep selected fresh
  useEffect(() => {
    if (!selected) return;
    const fresh = batches.find(b => b.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [batches]);

  const openBatch = (b: Batch) => {
    setSelected(b);
    setDriverName(b.driverName || '');
    setConfirmWindow(b.window || '8:00–10:00');
    setDriverPickedKg(String(b.pickedUpKg ?? b.estimatedKg));
    setAcceptedKg(b.acceptedKg != null ? String(b.acceptedKg) : String(b.pickedUpKg ?? b.estimatedKg));
    setRejectedKg(b.rejectedKg != null ? String(b.rejectedKg) : '0');
    setMotivo(b.rejectReason || 'empaque');
    setDestTempC(b.destTempC != null ? String(b.destTempC) : '');
    setAcceptErr('');
    setCopySuccess(false);
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
    } catch { setAcceptErr('Error al confirmar.'); }
    finally { setConfirmLoading(false); }
  };

  const handleMarkPickedUp = async () => {
    if (!selected) return;
    setPickupLoading(true);
    try {
      const k = parseFloat(driverPickedKg) || selected.estimatedKg;
      await updateBatchFields(selected.id, { status: 'RECOGIDO', pickedUpKg: k });
    } catch { setAcceptErr('Error al marcar.'); }
    finally { setPickupLoading(false); }
  };

  const handleAcceptClose = async () => {
    if (!selected) return;
    setAcceptErr('');
    const akg = parseFloat(acceptedKg);
    const rkg = parseFloat(rejectedKg) || 0;
    if (isNaN(akg) || akg < 0) { setAcceptErr('Ingresa los kg aceptados.'); return; }
    if (akg + rkg > selected.estimatedKg + 1) {
      setAcceptErr(`La suma (${akg + rkg} kg) no puede pasar el estimado (${selected.estimatedKg} kg) en más de 1 kg.`);
      return;
    }
    if (rkg > 0 && !motivo) { setAcceptErr('Elige el motivo del rechazo.'); return; }
    setAcceptLoading(true);
    try {
      await updateBatchFields(selected.id, {
        status: akg === 0 ? 'RECHAZADO' : 'RECIBIDO',
        acceptedKg: akg, rejectedKg: rkg,
        rejectReason: rkg > 0 ? motivo : undefined,
        destTempC: destTempC ? parseFloat(destTempC) : undefined,
      });
    } catch { setAcceptErr('Error al guardar.'); }
    finally { setAcceptLoading(false); }
  };

  const handleCopy = () => {
    if (!selected?.driverToken) return;
    const mapUrl = HOTEL_MAP_URL[selected.hotelId] ?? '';
    const link = `${window.location.origin}/c/${selected.driverToken}`;
    const text = buildShareText(selected, link, '', mapUrl);
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Stats — live
  const toPickup = batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO').length;
  const inTransit = batches.filter(b => b.status === 'RECOGIDO').length;
  const kgAcceptedToday = batches
    .filter(b => b.status === 'RECIBIDO')
    .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);

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
      {/* Stats bar — 40 px, verde, tres cifras. "kg" solo una vez */}
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
          <span className="bank-bar-label">aceptados hoy</span>
        </div>
      </div>

      {/* Two-column: list left, expediente right */}
      <div className="two-col">
        {/* Left column — list */}
        <div className="col-list">
          <h1 style={{ fontSize: 26, fontWeight: 520, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Banco de Alimentos
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: 'none', border: 'none',
                  padding: '0 0 12px', fontSize: 14,
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
              onClick={() => openBatch(b)}
              selected={selected?.id === b.id}
            />
          ))}

          {/* Impact — cerrados tab only */}
          {tab === 'cerrados' && (
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>Impacto</p>
              <p style={{ fontSize: 22, fontWeight: 520 }}>
                <span className="mono">{kgAcceptedToday.toFixed(1)} kg</span> aceptados
              </p>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
                <span className="mono">{Math.round(kgAcceptedToday / 0.4)}</span> raciones (supuesto) ·{' '}
                <span className="mono">{(kgAcceptedToday * 2.5).toFixed(1)} kg CO₂e</span> (supuesto)
              </p>
            </div>
          )}
        </div>

        {/* Right column — expediente */}
        <Expediente
          batch={selected}
          driverName={driverName}
          setDriverName={setDriverName}
          confirmWindow={confirmWindow}
          setConfirmWindow={setConfirmWindow}
          confirmLoading={confirmLoading}
          handleConfirm={handleConfirm}
          acceptedKg={acceptedKg}
          setAcceptedKg={setAcceptedKg}
          rejectedKg={rejectedKg}
          setRejectedKg={setRejectedKg}
          motivo={motivo}
          setMotivo={setMotivo}
          destTempC={destTempC}
          setDestTempC={setDestTempC}
          acceptErr={acceptErr}
          acceptLoading={acceptLoading}
          handleAcceptClose={handleAcceptClose}
          driverPickedKg={driverPickedKg}
          setDriverPickedKg={setDriverPickedKg}
          pickupLoading={pickupLoading}
          handleMarkPickedUp={handleMarkPickedUp}
          copySuccess={copySuccess}
          handleCopy={handleCopy}
          activityLines={activityLines}
        />
      </div>
    </div>
  );
}
