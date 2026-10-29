// src/components/StatusBadge.tsx — Píldoras de estado oficiales
import type { BatchStatus } from '../lib/types';

const LABELS: Record<BatchStatus, string> = {
  PUBLICADO:     'Publicado',
  CONFIRMADO:    'Confirmado',
  RECOGIDO:      'Recogido',
  RECIBIDO:      'Recibido',
  RECHAZADO:     'Rechazado',
  SIN_EXCEDENTE: 'Sin excedente',
};

export default function StatusBadge({ status }: { status: BatchStatus }) {
  const statusKey = status.toLowerCase();
  return (
    <span className={`status-pill status-pill--${statusKey}`}>
      {LABELS[status]}
    </span>
  );
}
