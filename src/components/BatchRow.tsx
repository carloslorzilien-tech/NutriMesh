/**
 * BatchRow.tsx — Fila individual de lote
 *
 * Muestra el resumen del lote en el listado del Hotel o Banco:
 *  - Nombre del producto y chip de estado unificado
 *  - Datos en tipografía monoespaciada (kg, °C de origen, ventana de recogida)
 *  - Advertencia visual si la temperatura de origen superó los 4 °C (#C6473F)
 *  - Subtítulo operativo según el estado (chofer asignado, kg aceptados/rechazados)
 */

import type { Batch } from '../lib/types';
import { MOTIVO_LABEL } from '../lib/demo';
import StatusChip from './StatusChip';

interface Props {
  batch: Batch;
  onClick?: () => void;
  selected?: boolean;
}

export default function BatchRow({ batch, onClick, selected }: Props) {
  // Alerta si la temperatura supera el límite de seguridad de 4 °C
  const tempAlert = batch.originTempC > 4;

  return (
    <div
      className={`batch-row${selected ? ' is-selected' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Línea 1: Producto y chip de estado */}
      <div className="batch-row-header">
        <span className="batch-row-title">{batch.name}</span>
        <StatusChip status={batch.status} />
      </div>

      {/* Línea 2: Cifras operativas en mono */}
      {batch.status !== 'SIN_EXCEDENTE' && (
        <div className="batch-row-meta">
          <span>{batch.estimatedKg} kg</span>
          {' · '}
          <span style={tempAlert ? { color: 'var(--reject)', fontWeight: 600 } : undefined}>
            {batch.originTempC} °C
          </span>
          {' · '}
          <span className="badge-window">{batch.window}</span>
        </div>
      )}

      {/* Línea 3: Información de transporte o resolución */}
      {batch.driverName && batch.status === 'CONFIRMADO' && (
        <div className="batch-row-sub">Chofer: {batch.driverName}</div>
      )}
      {batch.status === 'RECOGIDO' && (
        <div className="batch-row-sub">
          {batch.driverName ? `${batch.driverName} · ` : ''}
          {batch.pickedUpKg != null ? `${batch.pickedUpKg} kg recogidos` : 'Recogido'}
        </div>
      )}
      {(batch.status === 'RECIBIDO' || batch.status === 'RECHAZADO') && (
        <div className="batch-row-sub">
          {batch.acceptedKg != null && (
            <span>Aceptados: <span className="mono">{batch.acceptedKg} kg</span></span>
          )}
          {batch.rejectedKg != null && batch.rejectedKg > 0 && (
            <span style={{ color: 'var(--reject)', marginLeft: 8 }}>
              Rechazados: <span className="mono">{batch.rejectedKg} kg</span>
              {batch.rejectReason ? ` — ${MOTIVO_LABEL[batch.rejectReason]}` : ''}
            </span>
          )}
        </div>
      )}
      {batch.status === 'SIN_EXCEDENTE' && (
        <div className="batch-row-sub">Reportado al cierre sin excedente</div>
      )}
    </div>
  );
}
