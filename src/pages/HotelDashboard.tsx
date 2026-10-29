// src/pages/HotelDashboard.tsx — Panel del Hotel
import React, { useState } from 'react';
import Nav from '../components/Nav';
import DemoBanner from '../components/DemoBanner';
import BatchCard from '../components/BatchCard';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { BatchCategory, BatchType } from '../lib/types';
import { estimateKg, isTempValid, fmtNum } from '../lib/utils';
import { DEFAULT_RULES } from '../lib/types';

const CATEGORIES: BatchCategory[] = [
  'Proteínas cocinadas',
  'Arroz y carbohidratos',
  'Panadería',
  'Frutas y vegetales',
  'Bebidas selladas',
];

const INFANT_FOOD_RULE = 'El banco no acepta fórmula infantil ni lácteos para menores de 2 años.';

export default function HotelDashboard() {
  const { user } = useAuth();
  const { batches, publishBatch, publishNoSurplus, hotels } = useData();

  const hotel = hotels.find(h => h.id === user?.hotelId);
  const myBatches = batches
    .filter(b => b.hotelId === user?.hotelId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Estado del formulario
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BatchCategory>('Proteínas cocinadas');
  const [trays, setTrays] = useState(4);
  const [type, setType] = useState<BatchType>('hot');
  const [temp, setTemp] = useState<string>('68');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tempNum = temp === '' ? null : parseFloat(temp);
  const estKg = estimateKg(trays);
  const tempValid = tempNum === null ? true : isTempValid(tempNum, type);
  const canPublish = trays > 0 && tempNum !== null && tempValid;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hotelId) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      await publishBatch({
        hotelId: user.hotelId,
        hotelName: hotel?.name ?? user.hotelId,
        category,
        trays,
        type,
        tempOrigin: tempNum,
      });
      setSuccessMsg('Lote publicado. El banco de alimentos ya lo tiene en su radar.');
      setOpen(false);
      resetForm();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar lote');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory('Proteínas cocinadas');
    setTrays(4);
    setType('hot');
    setTemp('68');
    setNote('');
  };

  const handleNoSurplus = async () => {
    if (!user?.hotelId) return;
    setSubmitting(true);
    try {
      await publishNoSurplus(user.hotelId, hotel?.name ?? user.hotelId);
      setSuccessMsg('Aviso registrado: Hoy no hay excedente para recogida.');
    } catch {
      setErrorMsg('Error al registrar aviso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-canvas)' }}>
      <DemoBanner />
      <Nav />

      <main className="app-container" style={{ paddingBottom: 60, flex: 1 }}>
        {/* Encabezado del Hotel: título “Gran Hotel Europa” */}
        <div style={{ marginBottom: 28, marginTop: 8 }}>
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 32,
              fontWeight: 520,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
            }}
          >
            {hotel?.name ?? 'Gran Hotel Europa'}
          </h1>

          {hotel?.dockNote && (
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginTop: 4 }}>
              Muelle: {hotel.dockNote}
            </div>
          )}
        </div>

        {/* Mensajes de confirmación o error */}
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

        {/* Botones de acción del Hotel */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <button
            className="btn btn--primary"
            onClick={() => setOpen(prev => !prev)}
          >
            {open ? 'Cerrar formulario' : 'Publicar excedente'}
          </button>

          <button
            className="btn btn--secondary"
            onClick={handleNoSurplus}
            disabled={submitting}
          >
            Hoy no hay excedente
          </button>
        </div>

        {/* Formulario de Registro de Lote */}
        {open && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: 24,
              marginBottom: 32,
            }}
          >
            {/* Aviso de fórmula: Terracota #C2410C */}
            <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--color-terracota, #C2410C)', fontWeight: 500 }}>
              {INFANT_FOOD_RULE}
            </div>

            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="field__label" htmlFor="category">Categoría</label>
                <select
                  id="category"
                  className="field__select"
                  value={category}
                  onChange={e => setCategory(e.target.value as BatchCategory)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div className="field">
                  <label className="field__label" htmlFor="trays">Bandejas GN 1/1</label>
                  <input
                    id="trays"
                    type="number"
                    min={1}
                    max={60}
                    className="field__input"
                    value={trays}
                    onChange={e => setTrays(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                  <span className="field__hint">
                    1 bandeja GN 1/1 ≈ <span style={{ fontFamily: 'var(--font-mono)' }}>{DEFAULT_RULES.kgPerTray} kg</span>
                  </span>
                </div>

                <div className="field">
                  <label className="field__label">Línea térmica</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => { setType('hot'); setTemp('68'); }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 9999,
                        border: type === 'hot' ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                        background: type === 'hot' ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                        color: type === 'hot' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Caliente (≥ 60 °C)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType('cold'); setTemp('4'); }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 9999,
                        border: type === 'cold' ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                        background: type === 'cold' ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                        color: type === 'cold' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Frío (≤ 5 °C)
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="temp">Temperatura (°C)</label>
                  <input
                    id="temp"
                    type="number"
                    step="0.5"
                    className="field__input"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    required
                  />
                  {!tempValid && tempNum !== null && (
                    <span style={{ fontSize: 13, color: 'var(--color-terracota, #C2410C)', marginTop: 4, fontWeight: 500 }}>
                      {type === 'hot' ? 'Debe ser ≥ 60 °C' : 'Debe ser ≤ 5 °C'}
                    </span>
                  )}
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dock-note">Nota de acceso al muelle (opcional)</label>
                <input
                  id="dock-note"
                  type="text"
                  className="field__input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ej: Salida por rampa lateral, consultar por Chef Juan"
                />
              </div>

              <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 4 }}>
                Estimación: ~<span style={{ fontFamily: 'var(--font-mono)' }}>{fmtNum(estKg, 1)} kg</span> · Tiempo máximo: <span style={{ fontFamily: 'var(--font-mono)' }}>{type === 'hot' ? '4 horas' : '24 horas'}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!canPublish || submitting}
                >
                  {submitting ? 'Publicando...' : 'Confirmar y publicar lote'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-ink-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '10px 16px',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de lotes limpia */}
        <div>
          {myBatches.length === 0 ? (
            <div style={{ color: 'var(--color-ink-muted)', padding: '24px 0', fontSize: 14 }}>
              No hay lotes publicados aún.
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {myBatches.map(batch => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
