import { STATUS_LABEL, STATUS_CLASS } from '../lib/demo';
import type { Batch } from '../lib/types';

interface Props {
  batch: Batch;
  onClick?: () => void;
}

export default function BatchRow({ batch, onClick }: Props) {
  const tempAlert = batch.tempC > 4;

  return (
    <div className="batch-row" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="batch-row-name">
        <span>{batch.item}</span>
        <span className={`status-label ${STATUS_CLASS[batch.status]}`}>
          {STATUS_LABEL[batch.status]}
        </span>
      </div>
      <div className="batch-row-meta mono">
        <span>{batch.kg} kg</span>
        {' · '}
        <span style={tempAlert ? { color: 'var(--terra)' } : undefined}>
          {batch.tempC} °C
        </span>
        {' · '}
        <span>tomorrow {batch.pickupWindow}</span>
      </div>
      {batch.driverName && (
        <div className="batch-row-sub">Driver: {batch.driverName}</div>
      )}
      {batch.rejectionReason && (
        <div className="batch-row-sub terra">{batch.rejectionReason}</div>
      )}
    </div>
  );
}
