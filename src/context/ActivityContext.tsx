/**
 * ActivityContext — last 8 activity lines built from batch changes.
 * No browser notifications, no permission prompts.
 * Lines are composed from batches the current session can already read.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { Batch } from '../lib/types';
import { MOTIVO_LABEL } from '../lib/demo';

export interface ActivityLine {
  id: string;
  text: string;
  ts: number;
}

interface ActivityCtx {
  lines: ActivityLine[];
  push: (batch: Batch, prevStatus?: string) => void;
}

const Ctx = createContext<ActivityCtx>({ lines: [], push: () => {} });

function describe(batch: Batch, prevStatus?: string): string | null {
  const name = batch.hotelName.replace('Gran Hotel ', '').replace(' Santo Domingo', '');
  const kg   = batch.estimatedKg;

  // Status transitions
  const cur = batch.status;
  if (cur === 'PUBLICADO' && !prevStatus) {
    return `${name} publicó ${batch.name}, ${kg} kg.`;
  }
  if (cur === 'CONFIRMADO' && prevStatus === 'PUBLICADO') {
    const driver = batch.driverName ? ` Chofer: ${batch.driverName}.` : '';
    return `El banco confirmó la recogida de mañana.${driver}`;
  }
  if (cur === 'RECOGIDO') {
    const taken = batch.pickedUpKg ?? kg;
    return `${name}: chofer marcó recogida, ${taken} kg.`;
  }
  if (cur === 'RECIBIDO') {
    const acc = batch.acceptedKg ?? 0;
    const rej = batch.rejectedKg ?? 0;
    const motivo = batch.rejectReason ? ` por ${MOTIVO_LABEL[batch.rejectReason]?.toLowerCase()}` : '';
    if (rej > 0) return `Se aceptaron ${acc} kg y se rechazaron ${rej}${motivo}.`;
    return `Se aceptaron ${acc} kg de ${batch.name}.`;
  }
  if (cur === 'RECHAZADO') {
    const motivo = batch.rejectReason ? ` — ${MOTIVO_LABEL[batch.rejectReason]?.toLowerCase()}` : '';
    return `Lote rechazado${motivo}.`;
  }
  if (cur === 'SIN_EXCEDENTE') {
    return `${name}: sin excedente hoy.`;
  }
  return null;
}

let _lineId = 0;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<ActivityLine[]>([]);
  // track last status per batch to detect transitions
  const lastStatus = useRef<Record<string, string>>({});

  const push = useCallback((batch: Batch, prevStatus?: string) => {
    const text = describe(batch, prevStatus ?? lastStatus.current[batch.id]);
    lastStatus.current[batch.id] = batch.status;
    if (!text) return;
    setLines(prev => [
      { id: String(++_lineId), text, ts: Date.now() },
      ...prev,
    ].slice(0, 8));
  }, []);

  return <Ctx.Provider value={{ lines, push }}>{children}</Ctx.Provider>;
}

export const useActivity = () => useContext(Ctx);
