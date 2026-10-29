// src/pages/ImpactPanel.tsx — Panel de Impacto & Trazabilidad Social
import Nav from '../components/Nav';
import DemoBanner from '../components/DemoBanner';
import MetricCard from '../components/MetricCard';
import { useData } from '../context/DataContext';
import { estimateRations, estimateCO2, fmtNum } from '../lib/utils';
import { DEFAULT_RULES } from '../lib/types';
import { Info } from 'lucide-react';

export default function ImpactPanel() {
  const { batches, hotels } = useData();

  const received = batches.filter(b => b.status === 'RECIBIDO');
  const rejected = batches.filter(b => b.status === 'RECHAZADO');
  const totalClosed = batches.filter(b => ['RECIBIDO', 'RECHAZADO'].includes(b.status));

  const kgRecibidos = received.reduce((s, b) => s + (b.destKg ?? b.estimatedKg), 0);
  const kgEstimados = received.reduce((s, b) => s + b.estimatedKg, 0);
  const raciones = estimateRations(kgRecibidos);
  const co2 = estimateCO2(kgRecibidos);
  const pctRechazados = totalClosed.length > 0 ? (rejected.length / totalClosed.length) * 100 : 0;
  const pctDif = kgEstimados > 0 ? ((kgRecibidos - kgEstimados) / kgEstimados) * 100 : 0;

  // Desglose por Hotel
  const byHotel = hotels.map(hotel => {
    const hBatches = received.filter(b => b.hotelId === hotel.id);
    const kg = hBatches.reduce((s, b) => s + (b.destKg ?? b.estimatedKg), 0);
    const hAll = batches.filter(b => b.hotelId === hotel.id && ['RECIBIDO', 'RECHAZADO'].includes(b.status));
    const hRej = batches.filter(b => b.hotelId === hotel.id && b.status === 'RECHAZADO');
    return {
      name: hotel.name,
      lotes: hBatches.length,
      kg,
      raciones: estimateRations(kg),
      co2: estimateCO2(kg),
      rechazados: hRej.length,
      total: hAll.length,
    };
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-canvas)' }}>
      <DemoBanner />
      <Nav />

      <main className="app-container" style={{ paddingBottom: 60, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-pill status-pill--recibido" style={{ fontSize: 10 }}>
              MÉTRICAS ESG & AUDITORÍA
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              REPÚBLICA DOMINICANA
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-ink)' }}>
            Panel de Trazabilidad e Impacto
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 2 }}>
            Monitoreo consolidado de kg rescatados, raciones entregadas y huella evitada.
          </p>
        </div>

        {/* Nota visible obligatoria de supuestos */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <Info size={16} color="var(--color-mustard)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.45 }}>
            <strong>Nota metodológica (Factores Supuestos):</strong> Los cálculos corresponden a modelos estimativos
            operativos, no a mediciones de laboratorio cerradas. Supuestos: 1 bandeja GN 1/1 ≈ {DEFAULT_RULES.kgPerTray} kg;
            1 ración de plato servido ≈ {DEFAULT_RULES.kgPerRation} kg; 1 kg rescatado ≈ {DEFAULT_RULES.co2PerKg} kg CO₂e evitado.
          </div>
        </div>

        {/* KPIs Principales en Tarjetas Claras con Bloque Bosque */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 32,
          }}
        >
          <MetricCard
            index="01"
            value={`${fmtNum(kgRecibidos, 1)} kg`}
            label="Kg Alimentos Recibidos"
            note="Pesaje verificado en báscula"
            tone="forest"
          />

          <MetricCard
            index="02"
            value={fmtNum(raciones)}
            label="Raciones Servidas"
            note={`Factor: ${DEFAULT_RULES.kgPerRation} kg / ración`}
          />

          <MetricCard
            index="03"
            value={`${fmtNum(co2, 1)} kg`}
            label="CO₂e Evitado Estimado"
            note={`Factor: ${DEFAULT_RULES.co2PerKg} kg CO₂e / kg`}
          />

          <MetricCard
            index="04"
            value={`${fmtNum(pctRechazados, 1)}%`}
            label="Tasa de No Aceptación"
            note={`${rejected.length} de ${totalClosed.length} cerrados`}
          />

          <MetricCard
            index="05"
            value={`${pctDif >= 0 ? '+' : ''}${fmtNum(pctDif, 1)}%`}
            label="Desviación Est. vs Real"
            note="Ajuste báscula vs cocina"
          />
        </div>

        {/* Desglose por Hotel Asociado */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>Desglose por Hotel Donante</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              PILOTO ACTIVO
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>HOTEL</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>LOTES RECIBIDOS</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>KG REALES</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>RACIONES EST.</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>CO₂e EVITADO</th>
                  <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>RECHAZOS</th>
                </tr>
              </thead>
              <tbody>
                {byHotel.map(h => (
                  <tr key={h.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 650 }}>{h.name}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{h.lotes}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 650, color: 'var(--color-brand)' }}>
                      {fmtNum(h.kg, 1)} kg
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{fmtNum(h.raciones)}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{fmtNum(h.co2, 1)} kg</td>
                    <td style={{ padding: '12px' }}>
                      {h.rechazados > 0 ? (
                        <span className="status-pill status-pill--rechazado" style={{ fontSize: 10 }}>
                          {h.rechazados} Lote
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
