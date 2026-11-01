import { STATUS_LABEL, STATUS_CLASS, MOTIVO_LABEL } from '../lib/demo';
import type { Batch } from '../lib/types';

interface Props {
  batch: Batch;
  onClick?: () => void;
  selected?: boolean;
}

export default function BatchRow({ batch, onClick, selected }: Props) {
  const tempAlert = batch.originTempC > 4;

  return (
    <div
      className={`batch-row${selected ? ' is-selected' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Line 1: name + status */}
      <div className="batch-row-name">
        <span>{batch.name}</span>
        <span className={`status-label ${STATUS_CLASS[batch.status] ?? ''}`}>
          {STATUS_LABEL[batch.status] ?? batch.status}
        </span>
      </div>

      {/* Line 2: mono data */}
      {batch.status !== 'SIN_EXCEDENTE' && (
        <div className="batch-row-meta mono">
          <span>{batch.estimatedKg} kg</span>
          {' · '}
          <span style={tempAlert ? { color: 'var(--terra)' } : undefined}>
            {batch.originTempC} °C
          </span>
          {' · '}
          <span>mañana {batch.window}</span>
        </div>
      )}

      {/* Line 3: driver / accepted / rejected / motivo */}
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
            <span style={{ color: 'var(--terra)', marginLeft: 8 }}>
              Rechazados: <span className="mono">{batch.rejectedKg} kg</span>
              {batch.rejectReason ? ` — ${MOTIVO_LABEL[batch.rejectReason]}` : ''}
            </span>
          )}
        </div>
      )}
      {batch.status === 'SIN_EXCEDENTE' && (
        <div className="batch-row-sub">Reportado al cierre</div>
      )}
    </div>
  );
}
