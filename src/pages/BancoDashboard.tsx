// src/pages/BancoDashboard.tsx — Radar de BARD (PWA Operativa Clara)
import { useState } from 'react';
import Nav from '../components/Nav';
import BankHeaderBar from '../components/BankHeaderBar';
import DemoBanner from '../components/DemoBanner';
import BatchCard from '../components/BatchCard';
import { useData } from '../context/DataContext';
import type { RejectReason } from '../lib/types';
import { buildDriverUrl, buildWhatsAppUrl } from '../lib/utils';
import { Copy, ExternalLink, X } from 'lucide-react';

const REJECT_REASONS: RejectReason[] = ['temperatura', 'olor/aspecto', 'empaque', 'no llegó'];

export default function BancoDashboard() {
  const { batches, confirmBatch, inspectBatch } = useData();

  // Estados de confirmación
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState('Pedro Santos');
  const [confirming, setConfirming] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{ token: string; batchId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Estados de inspección / auditoría
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [destKg, setDestKg] = useState<string>('');
  const [acceptBatch, setAcceptBatch] = useState(true);
  const [rejectReason, setRejectReason] = useState<RejectReason>('temperatura');
  const [inspecting, setInspecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Agrupación por secciones: “Por recoger”, “En camino”, “Cerrados”
  const porRecoger = batches
    .filter(b => b.status === 'PUBLICADO')
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  const enCamino = batches
    .filter(b => b.status === 'CONFIRMADO' || b.status === 'RECOGIDO')
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

  const cerrados = batches
    .filter(b => b.status === 'RECIBIDO' || b.status === 'RECHAZADO' || b.status === 'SIN_EXCEDENTE')
    .sort((a, b) => (b.receivedAt?.getTime() ?? b.createdAt.getTime()) - (a.receivedAt?.getTime() ?? a.createdAt.getTime()));

  // Confirmar recogida
  const handleConfirmSubmit = async (batchId: string) => {
    if (!driverName.trim()) return;
    setConfirming(true);
    setErrorMsg('');
    try {
      const token = await confirmBatch({
        batchId,
        driverName: driverName.trim(),
        confirmedByName: 'BARD Santo Domingo',
      });
      setGeneratedToken({ token, batchId });
      setConfirmingId(null);
      setSuccessMsg(`Recogida confirmada. Chofer ${driverName} asignado.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al confirmar recogida');
    } finally {
      setConfirming(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedToken) return;
    const url = buildDriverUrl(generatedToken.token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWaLink = () => {
    if (!generatedToken) return '#';
    const b = batches.find(x => x.id === generatedToken.batchId);
    if (!b) return '#';
    return buildWhatsAppUrl(b, buildDriverUrl(generatedToken.token));
  };

  const openInspectModal = (batchId: string) => {
    const b = batches.find(x => x.id === batchId);
    setInspectingId(batchId);
    setDestKg(b ? String(b.originKg ?? b.estimatedKg) : '');
    setAcceptBatch(true);
    setRejectReason('temperatura');
  };

  const handleInspectSubmit = async () => {
    if (!inspectingId) return;
    const kgNum = parseFloat(destKg);
    if (isNaN(kgNum) || kgNum <= 0) {
      setErrorMsg('Ingresa un peso válido en báscula.');
      return;
    }
    setInspecting(true);
    setErrorMsg('');
    try {
      await inspectBatch({
        batchId: inspectingId,
        accepted: acceptBatch,
        destKg: kgNum,
        rejectReason: acceptBatch ? undefined : rejectReason,
        inspectedByName: 'Coordinación BARD',
      });
      setSuccessMsg(acceptBatch ? 'Recepción completada y peso auditado.' : 'Lote registrado como rechazado.');
      setInspectingId(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar inspección');
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-canvas)' }}>
      <DemoBanner />
      <Nav />
      <BankHeaderBar />

      <main className="app-container" style={{ paddingBottom: 60, flex: 1, marginTop: 24 }}>
        {/* Mensajes */}
        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              color: 'var(--color-brand)',
              fontSize: 13,
              marginBottom: 20,
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{successMsg}</span>
            <button
              onClick={() => setSuccessMsg('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand)' }}
            >
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface)',
              border: '1px solid rgba(194, 65, 12, 0.3)',
              color: 'var(--color-terracota)',
              fontSize: 13,
              marginBottom: 20,
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-terracota)' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Modal / Caja de Link de Chofer */}
        {generatedToken && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-brand)',
              borderRadius: 8,
              padding: 20,
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 520, color: 'var(--color-brand)' }}>
                Enlace para el chofer (sin contraseña)
              </span>
              <button
                onClick={() => setGeneratedToken(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--color-ink)',
                padding: '8px 12px',
                background: 'var(--color-canvas)',
                borderRadius: 4,
                wordBreak: 'break-all',
                marginBottom: 12,
              }}
            >
              {buildDriverUrl(generatedToken.token)}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn--secondary"
                onClick={handleCopyLink}
                style={{ fontSize: 13, padding: '6px 16px' }}
              >
                <Copy size={13} />
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>

              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
                style={{ fontSize: 13, padding: '6px 18px', textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                Enviar por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* SECCIÓN 1: Por recoger */}
        <section style={{ marginBottom: 36 }}>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: 520,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              marginBottom: 14,
            }}
          >
            Por recoger
          </h2>

          {porRecoger.length === 0 ? (
            <div style={{ color: 'var(--color-ink-muted)', padding: '16px 0', fontSize: 14 }}>
              No hay lotes pendientes de recogida.
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {porRecoger.map(batch => (
                <BatchCard key={batch.id} batch={batch}>
                  {confirmingId === batch.id ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="field__input"
                        value={driverName}
                        onChange={e => setDriverName(e.target.value)}
                        placeholder="Nombre del chofer"
                        style={{ maxWidth: 220, padding: '6px 12px', height: 36 }}
                      />
                      <button
                        className="btn btn--primary"
                        onClick={() => handleConfirmSubmit(batch.id)}
                        disabled={confirming}
                        style={{ fontSize: 13, padding: '6px 18px' }}
                      >
                        {confirming ? 'Generando...' : 'Asignar chofer y generar link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13 }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn--secondary"
                      onClick={() => { setConfirmingId(batch.id); setGeneratedToken(null); }}
                      style={{ fontSize: 13, padding: '6px 18px' }}
                    >
                      Confirmar recogida
                    </button>
                  )}
                </BatchCard>
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN 2: En camino */}
        <section style={{ marginBottom: 36 }}>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: 520,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              marginBottom: 14,
            }}
          >
            En camino
          </h2>

          {enCamino.length === 0 ? (
            <div style={{ color: 'var(--color-ink-muted)', padding: '16px 0', fontSize: 14 }}>
              No hay choferes en camino en este momento.
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {enCamino.map(batch => (
                <BatchCard key={batch.id} batch={batch}>
                  {inspectingId === batch.id ? (
                    <div
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: 18,
                        marginTop: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 520, color: 'var(--color-ink)' }}>
                        Pesaje y recepción en báscula
                      </div>

                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <label style={{ fontSize: 12, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 4 }}>
                            Kilogramos en báscula
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="field__input"
                            value={destKg}
                            onChange={e => setDestKg(e.target.value)}
                            placeholder="Ej: 24.5"
                            style={{ height: 38 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setAcceptBatch(true)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 9999,
                              border: acceptBatch ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                              background: acceptBatch ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                              color: acceptBatch ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                              height: 38,
                            }}
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => setAcceptBatch(false)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 9999,
                              border: !acceptBatch ? '1px solid var(--color-terracota, #C2410C)' : '1px solid var(--color-border)',
                              background: !acceptBatch ? 'var(--color-surface)' : 'transparent',
                              color: !acceptBatch ? 'var(--color-terracota, #C2410C)' : 'var(--color-ink-muted)',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                              height: 38,
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>

                      {!acceptBatch && (
                        <div>
                          <label style={{ fontSize: 12, color: 'var(--color-terracota, #C2410C)', display: 'block', marginBottom: 4 }}>
                            Motivo de rechazo
                          </label>
                          <select
                            className="field__select"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value as RejectReason)}
                            style={{ height: 38 }}
                          >
                            {REJECT_REASONS.map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button
                          className="btn btn--primary"
                          onClick={handleInspectSubmit}
                          disabled={inspecting || !destKg}
                          style={{
                            fontSize: 13,
                            padding: '6px 18px',
                            background: acceptBatch ? 'var(--color-brand)' : 'transparent',
                            color: acceptBatch ? '#FFFFFF' : 'var(--color-terracota, #C2410C)',
                            border: acceptBatch ? 'none' : '1px solid var(--color-terracota, #C2410C)',
                          }}
                        >
                          {inspecting ? 'Guardando...' : acceptBatch ? 'Certificar recepción' : 'Confirmar rechazo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectingId(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13 }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn--secondary"
                        onClick={() => openInspectModal(batch.id)}
                        style={{ fontSize: 13, padding: '6px 18px' }}
                      >
                        Pesar en báscula
                      </button>

                      {batch.driverToken && (
                        <button
                          type="button"
                          onClick={() => setGeneratedToken({ token: batch.driverToken!, batchId: batch.id })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-brand)',
                            cursor: 'pointer',
                            fontSize: 13,
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                          }}
                        >
                          Ver link del chofer
                        </button>
                      )}
                    </div>
                  )}
                </BatchCard>
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN 3: Cerrados */}
        {cerrados.length > 0 && (
          <section>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 22,
                fontWeight: 520,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                marginBottom: 14,
              }}
            >
              Cerrados
            </h2>

            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {cerrados.slice(0, 10).map(batch => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
