import { STATUS_LABEL, STATUS_CLASS, MOTIVO_LABEL } from '../lib/demo';
import type { Batch } from '../lib/types';

interface Props {
  batch: Batch;
  onClick?: () => void;
}

export default function BatchRow({ batch, onClick }: Props) {
  const tempAlert = batch.tempC > 4;

  return (
    <div
      className="batch-row"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Line 1: name + status */}
      <div className="batch-row-name">
        <span>{batch.item}</span>
        <span className={`status-label ${STATUS_CLASS[batch.status] ?? ''}`}>
          {STATUS_LABEL[batch.status] ?? batch.status}
        </span>
      </div>

      {/* Line 2: mono data */}
      {batch.status !== 'SIN_EXCEDENTE' && (
        <div className="batch-row-meta mono">
          <span>{batch.kg} kg</span>
          {' · '}
          <span style={tempAlert ? { color: 'var(--terra)' } : undefined}>
            {batch.tempC} °C
          </span>
          {' · '}
          <span>mañana {batch.pickupWindow}</span>
        </div>
      )}

      {/* Line 3: driver / accepted / rejected / motivo */}
      {batch.driverName && batch.status === 'CONFIRMADO' && (
        <div className="batch-row-sub">Chofer: {batch.driverName}</div>
      )}
      {batch.status === 'RECOGIDO' && batch.driverName && (
        <div className="batch-row-sub">
          {batch.driverName}{batch.driverKg != null ? ` · ${batch.driverKg} kg` : ''}
        </div>
      )}
      {(batch.status === 'RECIBIDO' || batch.status === 'RECHAZADO') && (
        <div className="batch-row-sub">
          {batch.acceptedKg != null && (
            <span>Aceptados: <span className="mono">{batch.acceptedKg} kg</span></span>
          )}
          {batch.rejectedKg != null && batch.rejectedKg > 0 && (
            <span style={{ color: 'var(--terra)', marginLeft: 8 }}>
              Rechazados: <span className="mono">{batch.rejectedKg} kg</span>
              {batch.rejectionMotivo ? ` — ${MOTIVO_LABEL[batch.rejectionMotivo]}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
