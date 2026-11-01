/**
 * BancoDashboard.tsx — Panel de operaciones del Banco de Alimentos
 *
 * Características:
 *  - Misma paleta crema (#F9F6F1) y tarjetas blancas (#FFFFFF).
 *  - Arriba: cifras en vivo de lotes por llegar, en tránsito y kg aceptados hoy.
 *  - Filtros por estado como chips clicables.
 *  - Tabla operativa con columnas: Hotel, Producto, Kg, °C, Ventana, Estado, Acción.
 *  - Filas de 56px con líneas finas, sin cebra.
 *  - Prioridad visual: lotes que requieren confirmación o recepción van primero con acción destacada.
 *  - Temperatura superior a 4 °C resaltada en #C6473F.
 *  - Expediente lateral a la derecha con trazabilidad vertical, WhatsApp, enlace al chofer y pesaje final.
 */

import { useState, useEffect, useRef } from 'react';
import { useActivity } from '../context/ActivityContext';
import { subscribeBatches, updateBatchFields } from '../lib/store';
import { MOTIVO_LABEL } from '../lib/demo';
import type { Batch, RejectionMotivo } from '../lib/types';
import StatusChip from '../components/StatusChip';

type FiltroTab = 'todos' | 'por_recoger' | 'en_camino' | 'cerrados';

const MOTIVOS_RECHAZO = Object.entries(MOTIVO_LABEL) as [RejectionMotivo, string][];

// Direcciones directas en Google Maps para logística
const HOTEL_MAP_URL: Record<string, string> = {
  'hotel-europa': 'https://maps.google.com/?q=Gran+Hotel+Europa+Santo+Domingo',
  'hotel-barcelo': 'https://maps.google.com/?q=Barcelo+Santo+Domingo',
};

function formatHora(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

function buildWhatsAppMsg(batch: Batch, driverLink: string, mapUrl: string): string {
  const cat = batch.category === 'SELLADO' ? 'Insumo sellado' : 'Producción fría';
  return encodeURIComponent(
    `NutriMesh — Recogida confirmada\n\n` +
    `Lote: ${batch.name} (${cat})\n` +
    `Hotel: ${batch.hotelName}\n` +
    `Ubicación: ${mapUrl}\n` +
    `Estimado: ${batch.estimatedKg} kg\n` +
    `Temperatura origen: ${batch.originTempC} °C\n` +
    `Ventana: ${batch.window}\n\n` +
    `Enlace del chofer: ${driverLink}`
  );
}

// Pasos de la trazabilidad vertical en el expediente
const PASOS_TRAZA = [
  { key: 'PUBLICADO', label: 'Publicado por el hotel' },
  { key: 'CONFIRMADO', label: 'Recogida confirmada' },
  { key: 'RECOGIDO', label: 'Cargado por el chofer' },
  { key: 'RECIBIDO', label: 'Recepción en almacén' },
];

const ORDEN_PASOS: Record<string, number> = {
  PUBLICADO: 0,
  CONFIRMADO: 1,
  RECOGIDO: 2,
  RECIBIDO: 3,
  RECHAZADO: 3,
  SIN_EXCEDENTE: 4,
};

function TimelineExpediente({ batch }: { batch: Batch }) {
  const pasoActual = ORDEN_PASOS[batch.status] ?? 0;

  return (
    <div className="timeline">
      {PASOS_TRAZA.map((paso, idx) => {
        const completado = idx <= pasoActual;
        const mostrarHora = completado && (idx === 0 || idx === pasoActual);
        const timestamp = idx === 0 ? batch.createdAt : (idx === pasoActual ? batch.updatedAt : null);

        return (
          <div key={paso.key} className="timeline-step">
            <div className={`timeline-dot ${completado ? 'done' : ''}`} />
            <div className="timeline-body">
              <p className={`timeline-label ${completado ? 'done' : ''}`}>{paso.label}</p>
              {mostrarHora && timestamp && (
                <p className="timeline-time">{formatHora(timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BancoDashboard() {
  const { lines: activityLines, push } = useActivity();

  const [tab, setTab] = useState<FiltroTab>('todos');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);

  // Estados para confirmación de recogida
  const [driverName, setDriverName] = useState('');
  const [confirmWindow, setConfirmWindow] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Estados para recepción en almacén
  const [acceptedKg, setAcceptedKg] = useState('');
  const [rejectedKg, setRejectedKg] = useState('');
  const [motivo, setMotivo] = useState<RejectionMotivo>('empaque');
  const [destTempC, setDestTempC] = useState('');
  const [acceptErr, setAcceptErr] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Estados para chofer y copia de enlace
  const [driverPickedKg, setDriverPickedKg] = useState('');
  const [pickupLoading, setPickupLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const prevBatchesRef = useRef<Record<string, string>>({});

  // Suscripción a todos los lotes del sistema
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

  // Mantener actualizado el lote seleccionado
  useEffect(() => {
    if (!selected) return;
    const fresh = batches.find(b => b.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [batches]);

  // Selección de lote para ver expediente
  const seleccionarLote = (b: Batch) => {
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
    setStatusNotice('');
  };

  // Acción: Confirmar recogida por el banco
  const handleConfirmPickup = async () => {
    if (!selected) return;
    setConfirmLoading(true);
    setStatusNotice('');
    try {
      const token = selected.driverToken || `tok-${Date.now().toString(36)}`;
      await updateBatchFields(selected.id, {
        status: 'CONFIRMADO',
        driverName: driverName.trim() || 'Sin asignar',
        driverToken: token,
        window: confirmWindow.trim() || selected.window,
      });
      setStatusNotice('Recogida confirmada. Enlace del chofer generado.');
    } catch {
      setAcceptErr('Error al confirmar recogida.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Acción: Marcar como recogido desde el panel del banco
  const handleMarkPickedUp = async () => {
    if (!selected) return;
    setPickupLoading(true);
    setStatusNotice('');
    try {
      const k = parseFloat(driverPickedKg) || selected.estimatedKg;
      await updateBatchFields(selected.id, {
        status: 'RECOGIDO',
        pickedUpKg: k,
      });
      setStatusNotice('Lote marcado como recogido.');
    } catch {
      setAcceptErr('Error al actualizar transporte.');
    } finally {
      setPickupLoading(false);
    }
  };

  // Acción: Recepción y pesaje final en almacén del banco
  const handleCloseBatch = async () => {
    if (!selected) return;
    setAcceptErr('');
    setStatusNotice('');

    const akg = parseFloat(acceptedKg);
    const rkg = parseFloat(rejectedKg) || 0;

    if (isNaN(akg) || akg < 0) {
      setAcceptErr('Ingresa un peso aceptado válido.');
      return;
    }
    if (akg + rkg > selected.estimatedKg + 1) {
      setAcceptErr(`La suma (${akg + rkg} kg) no puede superar el estimado (${selected.estimatedKg} kg) en más de 1 kg.`);
      return;
    }
    if (rkg > 0 && !motivo) {
      setAcceptErr('Selecciona el motivo de rechazo.');
      return;
    }

    setAcceptLoading(true);
    try {
      await updateBatchFields(selected.id, {
        status: akg === 0 ? 'RECHAZADO' : 'RECIBIDO',
        acceptedKg: akg,
        rejectedKg: rkg,
        rejectReason: rkg > 0 ? motivo : undefined,
        destTempC: destTempC ? parseFloat(destTempC) : undefined,
      });
      setStatusNotice(`Lote cerrado: ${akg} kg aceptados.`);
    } catch {
      setAcceptErr('Error al registrar la recepción.');
    } finally {
      setAcceptLoading(false);
    }
  };

  // Copia de enlace del chofer
  const handleCopyLink = () => {
    if (!selected?.driverToken) return;
    const link = `${window.location.origin}/c/${selected.driverToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Cómputo de cifras operativas
  const porRecoger = batches.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO').length;
  const enCamino = batches.filter(b => b.status === 'RECOGIDO').length;
  const kgAceptadosHoy = batches
    .filter(b => b.status === 'RECIBIDO')
    .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);

  // Filtrado de lotes para la tabla
  const lotesFiltrados = batches.filter(b => {
    if (tab === 'por_recoger') return b.status === 'PUBLICADO' || b.status === 'CONFIRMADO';
    if (tab === 'en_camino') return b.status === 'RECOGIDO';
    if (tab === 'cerrados') return b.status === 'RECIBIDO' || b.status === 'RECHAZADO' || b.status === 'SIN_EXCEDENTE';
    return true;
  });

  // Orden: lotes que requieren acción van primero
  const lotesOrdenados = [...lotesFiltrados].sort((a, b) => {
    const ordenAccion: Record<string, number> = {
      PUBLICADO: 0,
      RECOGIDO: 1,
      CONFIRMADO: 2,
      RECIBIDO: 3,
      RECHAZADO: 4,
      SIN_EXCEDENTE: 5,
    };
    return (ordenAccion[a.status] ?? 9) - (ordenAccion[b.status] ?? 9);
  });

  const driverLink = selected?.driverToken
    ? `${window.location.origin}/c/${selected.driverToken}`
    : '';
  const mapUrl = selected ? (HOTEL_MAP_URL[selected.hotelId] ?? '') : '';
  const whatsappMsg = selected && driverLink ? buildWhatsAppMsg(selected, driverLink, mapUrl) : '';

  return (
    <div style={{ paddingTop: 64, minHeight: 'calc(100vh - 64px)', background: 'var(--canvas)' }}>
      {/* ── Barra de estadísticas del banco (44px, fondo #134E3A) ── */}
      <div className="bank-bar">
        <div className="bank-bar-item">
          <span className="bank-bar-val">{porRecoger}</span>
          <span className="bank-bar-text">por recoger</span>
        </div>
        <div className="bank-bar-item">
          <span className="bank-bar-val">{enCamino}</span>
          <span className="bank-bar-text">en camino</span>
        </div>
        <div className="bank-bar-item">
          <span className="bank-bar-val">{kgAceptadosHoy.toFixed(1)} kg</span>
          <span className="bank-bar-text">aceptados hoy</span>
        </div>
      </div>

      <div className="two-col">
        {/* ── Columna izquierda: Tabla y filtros ── */}
        <div className="col-list">
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-head" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 6 }}>
              Coordinación de rescate
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
              Monitoreo y cierre de lotes en Santo Domingo.
            </p>
          </div>

          {/* Filtros por estado como chips clicables */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setTab('todos')}
              className={`chip ${tab === 'todos' ? 'chip-RECIBIDO' : 'chip-PUBLICADO'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              Todos ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('por_recoger')}
              className={`chip ${tab === 'por_recoger' ? 'chip-RECIBIDO' : 'chip-PUBLICADO'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              Por recoger ({porRecoger})
            </button>
            <button
              type="button"
              onClick={() => setTab('en_camino')}
              className={`chip ${tab === 'en_camino' ? 'chip-RECIBIDO' : 'chip-PUBLICADO'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              En camino ({enCamino})
            </button>
            <button
              type="button"
              onClick={() => setTab('cerrados')}
              className={`chip ${tab === 'cerrados' ? 'chip-RECIBIDO' : 'chip-PUBLICADO'}`}
              style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              Cerrados
            </button>
          </div>

          {/* Tabla operativa con filas de 56px mínimas y líneas finas */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.2fr 0.8fr 0.8fr 1fr 1.1fr 1fr',
                padding: '12px 16px',
                background: 'rgba(26, 46, 38, 0.03)',
                borderBottom: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
              }}
            >
              <span>Hotel</span>
              <span>Producto</span>
              <span>Kg</span>
              <span>°C</span>
              <span>Ventana</span>
              <span>Estado</span>
              <span style={{ textAlign: 'right' }}>Acción</span>
            </div>

            {lotesOrdenados.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>
                No hay lotes en esta categoría.
              </div>
            ) : (
              lotesOrdenados.map(b => {
                const isSelected = selected?.id === b.id;
                const requiresAction = b.status === 'PUBLICADO' || b.status === 'RECOGIDO';
                const tempAlert = b.originTempC > 4;

                return (
                  <div
                    key={b.id}
                    onClick={() => seleccionarLote(b)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.2fr 0.8fr 0.8fr 1fr 1.1fr 1fr',
                      alignItems: 'center',
                      minHeight: 56,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'rgba(5, 150, 105, 0.08)'
                        : requiresAction
                        ? 'var(--surface)'
                        : 'rgba(255, 255, 255, 0.65)',
                      transition: 'background-color 0.12s',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                      {b.hotelName.replace('Gran Hotel ', '').replace(' Santo Domingo', '')}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                      {b.name}
                    </span>
                    <span className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>
                      {b.status === 'RECIBIDO' && b.acceptedKg != null ? b.acceptedKg : b.estimatedKg} kg
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 13,
                        color: tempAlert ? 'var(--reject)' : 'var(--ink-soft)',
                        fontWeight: tempAlert ? 600 : 400,
                      }}
                    >
                      {b.originTempC} °C
                    </span>
                    <span>
                      <span className="badge-window">{b.window}</span>
                    </span>
                    <span>
                      <StatusChip status={b.status} />
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      {b.status === 'PUBLICADO' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarLote(b);
                          }}
                        >
                          Confirmar
                        </button>
                      )}
                      {b.status === 'RECOGIDO' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarLote(b);
                          }}
                        >
                          Recibir
                        </button>
                      )}
                      {b.status === 'CONFIRMADO' && (
                        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>En espera</span>
                      )}
                      {(b.status === 'RECIBIDO' || b.status === 'RECHAZADO' || b.status === 'SIN_EXCEDENTE') && (
                        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Cerrado</span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Columna derecha: Expediente del lote ── */}
        <div className="col-detail">
          {!selected ? (
            <div style={{ textAlign: 'center', paddingTop: 64 }}>
              <img
                src="/logo.svg"
                alt=""
                width={48}
                height={48}
                style={{ opacity: 0.15, marginBottom: 16 }}
              />
              <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
                Elige un lote de la lista para ver su expediente.
              </p>
            </div>
          ) : (
            <div>
              <p className="section-title" style={{ marginBottom: 6 }}>
                Expediente operativo
              </p>
              <h2 className="t-head" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
                {selected.name}
              </h2>

              {statusNotice && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(5, 150, 105, 0.08)',
                    color: 'var(--btn)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {statusNotice}
                </div>
              )}

              {/* Ficha técnica del lote */}
              <div
                className="card"
                style={{
                  padding: 16,
                  marginBottom: 20,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <p><strong>Hotel:</strong> {selected.hotelName}</p>
                <p><strong>Categoría:</strong> {selected.category === 'SELLADO' ? 'Insumo sellado' : 'Producción fría'}</p>
                <p className="mono">
                  <strong>Estimado:</strong> {selected.estimatedKg} kg ·{' '}
                  <span style={selected.originTempC > 4 ? { color: 'var(--reject)', fontWeight: 600 } : undefined}>
                    {selected.originTempC} °C
                  </span>
                </p>
                <p><strong>Ventana:</strong> <span className="badge-window">{selected.window}</span></p>

                {mapUrl && (
                  <p style={{ marginTop: 6 }}>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--btn)', textDecoration: 'underline', fontSize: 13 }}
                    >
                      Abrir en Google Maps
                    </a>
                  </p>
                )}
              </div>

              {/* Trazabilidad vertical */}
              <p className="section-title" style={{ marginBottom: 12 }}>
                Trazabilidad del ciclo
              </p>
              <TimelineExpediente batch={selected} />

              <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

              {/* Acciones según el estado del lote */}

              {/* Paso 1: Confirmar recogida (PUBLICADO) */}
              {selected.status === 'PUBLICADO' && (
                <div className="stack stack-md">
                  <div className="field">
                    <label htmlFor="driver-input">Nombre del chofer</label>
                    <input
                      id="driver-input"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      placeholder="Ej. Pedro Santos"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="win-confirm">Ventana confirmada</label>
                    <input
                      id="win-confirm"
                      value={confirmWindow}
                      onChange={e => setConfirmWindow(e.target.value)}
                      placeholder="8:00–10:00"
                    />
                  </div>

                  {acceptErr && <p className="notice">{acceptErr}</p>}

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    disabled={confirmLoading}
                    onClick={handleConfirmPickup}
                  >
                    {confirmLoading ? 'Confirmando…' : 'Confirmar recogida'}
                  </button>
                </div>
              )}

              {/* Paso 2: Compartir enlace y WhatsApp (CONFIRMADO) */}
              {selected.status === 'CONFIRMADO' && driverLink && (
                <div className="stack stack-md">
                  <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>
                      Enlace para el chofer (sin cuenta)
                    </p>
                    <p className="mono" style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--brand)' }}>
                      {driverLink}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={handleCopyLink}
                    >
                      {copySuccess ? 'Copiado' : 'Copiar enlace'}
                    </button>
                    <a
                      href={`https://wa.me/?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                  {/* Registro de pesaje recogido */}
                  <div className="field">
                    <label htmlFor="input-driver-kg">Kg recogidos (reporte manual)</label>
                    <input
                      id="input-driver-kg"
                      type="number"
                      step="0.1"
                      value={driverPickedKg}
                      onChange={e => setDriverPickedKg(e.target.value)}
                      className="mono"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-full"
                    disabled={pickupLoading}
                    onClick={handleMarkPickedUp}
                  >
                    {pickupLoading ? 'Marcando…' : 'Marcar como recogido'}
                  </button>
                </div>
              )}

              {/* Paso 3: Recepción y pesaje final en almacén (RECOGIDO) */}
              {selected.status === 'RECOGIDO' && (
                <div className="stack stack-md">
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    Estimado: <span className="mono">{selected.estimatedKg} kg</span>
                    {selected.pickedUpKg != null && (
                      <> · Chofer anotó: <span className="mono">{selected.pickedUpKg} kg</span></>
                    )}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label htmlFor="kg-aceptados">Kg aceptados</label>
                      <input
                        id="kg-aceptados"
                        type="number"
                        min="0"
                        step="0.1"
                        value={acceptedKg}
                        onChange={e => setAcceptedKg(e.target.value)}
                        placeholder="15"
                        className="mono"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="kg-rechazados">Kg rechazados</label>
                      <input
                        id="kg-rechazados"
                        type="number"
                        min="0"
                        step="0.1"
                        value={rejectedKg}
                        onChange={e => setRejectedKg(e.target.value)}
                        placeholder="0"
                        className="mono"
                      />
                    </div>
                  </div>

                  {parseFloat(rejectedKg) > 0 && (
                    <div className="field">
                      <label htmlFor="motivo-rechazo">Motivo del rechazo</label>
                      <select
                        id="motivo-rechazo"
                        value={motivo}
                        onChange={e => setMotivo(e.target.value as RejectionMotivo)}
                      >
                        {MOTIVOS_RECHAZO.map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="temp-destino">Temperatura destino °C (opcional)</label>
                    <input
                      id="temp-destino"
                      type="number"
                      step="0.1"
                      value={destTempC}
                      onChange={e => setDestTempC(e.target.value)}
                      placeholder="—"
                      className="mono"
                    />
                  </div>

                  {acceptErr && <p className="notice">{acceptErr}</p>}

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    disabled={acceptLoading}
                    onClick={handleCloseBatch}
                  >
                    {acceptLoading ? 'Guardando…' : 'Registrar recepción'}
                  </button>
                </div>
              )}

              {/* Lote ya cerrado (RECIBIDO / RECHAZADO) */}
              {(selected.status === 'RECIBIDO' || selected.status === 'RECHAZADO') && (
                <div className="stack stack-sm" style={{ fontSize: 14 }}>
                  <p>
                    Aceptados: <span className="mono">{selected.acceptedKg ?? 0} kg</span>
                  </p>
                  {selected.rejectedKg != null && selected.rejectedKg > 0 && (
                    <p style={{ color: 'var(--reject)' }}>
                      Rechazados: <span className="mono">{selected.rejectedKg} kg</span>
                      {selected.rejectReason ? ` — ${MOTIVO_LABEL[selected.rejectReason]}` : ''}
                    </p>
                  )}
                  {selected.destTempC != null && (
                    <p className="mono">
                      Temperatura al recibir: {selected.destTempC} °C
                    </p>
                  )}
                </div>
              )}

              {/* Registro de actividad reciente debajo del expediente */}
              {activityLines.length > 0 && (
                <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <p className="section-title" style={{ marginBottom: 10 }}>
                    Última actividad
                  </p>
                  <div className="stack stack-sm">
                    {activityLines.slice(0, 5).map(l => (
                      <p key={l.id} style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                        {l.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
