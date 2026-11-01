/**
 * StatusChip.tsx — Componente unificado de estado operativo
 *
 * Se utiliza de forma idéntica en Hotel, Banco y Chofer.
 * Especificación de diseño:
 *   - Radio píldora (var(--radius-pill))
 *   - Tamaño 12px con peso 600
 *   - PUBLICADO: borde gris (#E2DDD5), texto suave
 *   - CONFIRMADO: fondo verde suave, texto marca
 *   - RECOGIDO: fondo ámbar suave, texto tinta
 *   - RECIBIDO: fondo verde sólido (#047857), texto blanco
 *   - RECHAZADO: texto y borde #C6473F, fondo transparente
 *   - SIN_EXCEDENTE: borde gris (#E2DDD5), texto suave
 */

import type { BatchStatus } from '../lib/types';
import { STATUS_LABEL } from '../lib/demo';

interface Props {
  status: BatchStatus;
}

export default function StatusChip({ status }: Props) {
  const label = STATUS_LABEL[status] ?? status;

  return (
    <span className={`chip chip-${status}`}>
      {label}
    </span>
  );
}
