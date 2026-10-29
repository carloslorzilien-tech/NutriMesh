// src/components/BatchCard.tsx — Lote como fila limpia (estilo Google / Ashoka)
import React from 'react';
import type { Batch } from '../lib/types';
import { formatTimeLeft, isTempValid } from '../lib/utils';

interface BatchCardProps {
  batch: Batch;
  index?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function BatchCard({ batch, children, className = '' }: BatchCardProps) {
  const { label: timeLabel } = formatTimeLeft(batch.expiresAt);
  const diffH = (batch.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
  const isExpired = batch.expiresAt < new Date();
  const isActive = batch.status === 'PUBLICADO' || batch.status === 'CONFIRMADO';
  const isTimeNear = isActive && diffH > 0 && diffH < 3;

  // Validación de temperatura
  const tempOutOfRule =
    batch.tempOrigin !== null && !isTempValid(batch.tempOrigin, batch.type);

  // Render del estado según tokens
  const renderStatus = () => {
    switch (batch.status) {
      case 'PUBLICADO':
        // Lima #C6F54E con texto #14211C sobre la lima
        return (
          <span
            style={{
              background: '#C6F54E',
              color: '#14211C',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            PUBLICADO
          </span>
        );
      case 'CONFIRMADO':
        // Mostaza #D97706
        return (
          <span
            style={{
              color: '#D97706',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}
          >
            CONFIRMADO
          </span>
        );
      case 'RECHAZADO':
        // Terracota #C2410C
        return (
          <span
            style={{
              color: '#C2410C',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}
          >
            RECHAZADO
          </span>
        );
      case 'RECOGIDO':
      case 'RECIBIDO':
        return (
          <span
            style={{
              color: 'var(--color-brand)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}
          >
            {batch.status}
          </span>
        );
      default:
        return (
          <span
            style={{
              color: 'var(--color-ink-muted)',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {batch.status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div
      className={`batch-row ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Línea 1, 18 px peso 560: el plato. A la derecha, estado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            fontWeight: 560,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          {batch.category}
        </span>

        {renderStatus()}
      </div>

      {/* Línea 2, 14 px: Gran Hotel Europa · 7 bandejas · 28 kg · 68 °C · vence en 2 h 57 m */}
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'var(--color-ink-muted)',
          lineHeight: 1.4,
        }}
      >
        <span>{batch.hotelName ?? batch.hotelId}</span>
        <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.trays}</span> bandejas</span>
        <span> · <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.originKg ?? batch.estimatedKg} kg</span></span>

        {batch.tempOrigin !== null && (
          <span>
            {' · '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: tempOutOfRule ? '#C2410C' : undefined,
                fontWeight: tempOutOfRule ? 600 : 400,
              }}
            >
              {batch.tempOrigin} °C
            </span>
          </span>
        )}

        {isActive && (
          <span>
            {' · '}
            {isExpired ? (
              <span style={{ fontFamily: 'var(--font-mono)', color: '#C2410C', fontWeight: 600 }}>vencido</span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: isTimeNear ? '#D97706' : undefined,
                  fontWeight: isTimeNear ? 600 : 400,
                }}
              >
                vence en {timeLabel}
              </span>
            )}
          </span>
        )}

        {batch.status === 'RECIBIDO' && batch.destKg !== null && (
          <span> · pesado en banco: <span style={{ fontFamily: 'var(--font-mono)' }}>{batch.destKg} kg</span></span>
        )}
      </div>

      {/* Línea 3, 13 px, solo si aplica: Chofer o motivo de rechazo */}
      {batch.rejectReason ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#C2410C',
            marginTop: 2,
          }}
        >
          Motivo de rechazo: {batch.rejectReason}
        </div>
      ) : batch.driverName ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'var(--color-ink-muted)',
            marginTop: 2,
          }}
        >
          Chofer {batch.driverName}
        </div>
      ) : null}

      {/* Acciones limpias (si las hay) */}
      {children && (
        <div style={{ marginTop: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}
