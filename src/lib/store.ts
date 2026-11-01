/**
 * store.ts — unified data layer
 *
 * When IS_FIREBASE is true: reads/writes go to Firestore, lists use onSnapshot.
 * When false: everything stays in the in-memory BATCHES array from demo.ts,
 *   and we call the subscriber callbacks manually so the UI still reacts.
 *
 * The API surface that pages/components use:
 *   subscribeBatches(hotelId | null, cb) → unsubscribe fn   (null = all, for banco)
 *   subscribeHotel(hotelId, cb)          → unsubscribe fn
 *   subscribeBatchByToken(token, cb)     → unsubscribe fn
 *   publishBatch(data)                   → Promise<string>  (returns id)
 *   updateBatchFields(id, patch)         → Promise<void>
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { IS_FIREBASE, db } from './firebase';
import {
  BATCHES,
  addBatch as memAdd,
  updateBatch as memUpdate,
  getHotelById as memGetHotel,
  getBatchByToken as memGetByToken,
  newId,
  HOTELS,
} from './demo';
import type { Batch, Hotel, RejectionMotivo } from './types';

type Unsub = () => void;

function batchFromDoc(id: string, data: Record<string, unknown>): Batch {
  const ts = (v: unknown) =>
    v && typeof (v as { toMillis?: () => number }).toMillis === 'function'
      ? (v as { toMillis: () => number }).toMillis()
      : (typeof v === 'number' ? v : Date.now());

  return {
    id,
    hotelId:      String(data.hotelId ?? ''),
    hotelName:    String(data.hotelName ?? ''),
    category:     (data.category as Batch['category']) ?? 'SELLADO',
    name:         String(data.name ?? ''),
    estimatedKg:  Number(data.estimatedKg ?? 0),
    originTempC:  Number(data.originTempC ?? 0),
    window:       String(data.window ?? ''),
    status:       (data.status as Batch['status']) ?? 'PUBLICADO',
    driverName:   data.driverName   != null ? String(data.driverName)  : undefined,
    driverToken:  data.driverToken  != null ? String(data.driverToken) : undefined,
    pickedUpKg:   data.pickedUpKg   != null ? Number(data.pickedUpKg)  : undefined,
    acceptedKg:   data.acceptedKg   != null ? Number(data.acceptedKg)  : undefined,
    rejectedKg:   data.rejectedKg   != null ? Number(data.rejectedKg)  : undefined,
    rejectReason: data.rejectReason != null ? (data.rejectReason as RejectionMotivo) : undefined,
    destTempC:    data.destTempC    != null ? Number(data.destTempC)   : undefined,
    createdAt:    ts(data.createdAt),
    updatedAt:    ts(data.updatedAt),
  };
}

// ─── Memory subscriber registry ───────────────────────────────────────────────

type MemSub = { hotelId: string | null; cb: (batches: Batch[]) => void };
const _memSubs: MemSub[] = [];

function _notifyMemSubs() {
  _memSubs.forEach(({ hotelId, cb }) => {
    const list = hotelId
      ? BATCHES.filter(b => b.hotelId === hotelId)
      : [...BATCHES];
    cb([...list]);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Subscribe to batches. hotelId=null → all batches (banco). */
export function subscribeBatches(
  hotelId: string | null,
  cb: (batches: Batch[]) => void,
): Unsub {
  if (!IS_FIREBASE || !db) {
    const initial = hotelId
      ? BATCHES.filter(b => b.hotelId === hotelId)
      : [...BATCHES];
    cb([...initial]);

    const sub: MemSub = { hotelId, cb };
    _memSubs.push(sub);
    return () => {
      const i = _memSubs.indexOf(sub);
      if (i !== -1) _memSubs.splice(i, 1);
    };
  }

  // Firestore path
  const coll = collection(db, 'batches');
  const q = hotelId
    ? query(coll, where('hotelId', '==', hotelId), orderBy('createdAt', 'desc'))
    : query(coll, orderBy('createdAt', 'desc'));

  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => batchFromDoc(d.id, d.data() as Record<string, unknown>));
    cb(list);
  });
}

/** Subscribe to a single hotel doc (for name + dock). */
export function subscribeHotel(hotelId: string, cb: (hotel: Hotel | null) => void): Unsub {
  if (!IS_FIREBASE || !db) {
    cb(memGetHotel(hotelId));
    return () => {};
  }

  const ref = doc(db, 'hotels', hotelId);
  return onSnapshot(ref, snap => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    const d = snap.data() as Record<string, unknown>;
    cb({ id: snap.id, name: String(d.name ?? ''), dock: String(d.dock ?? '') });
  });
}

/** Subscribe to a single batch by driverToken. */
export function subscribeBatchByToken(token: string, cb: (batch: Batch | null) => void): Unsub {
  if (!IS_FIREBASE || !db) {
    cb(memGetByToken(token));
    const hotelSub: MemSub = {
      hotelId: null,
      cb: (batches) => {
        cb(batches.find(b => b.driverToken === token) ?? null);
      },
    };
    _memSubs.push(hotelSub);
    return () => {
      const i = _memSubs.indexOf(hotelSub);
      if (i !== -1) _memSubs.splice(i, 1);
    };
  }

  const q = query(
    collection(db, 'batches'),
    where('driverToken', '==', token),
    limit(1),
  );
  return onSnapshot(q, snap => {
    if (snap.empty) {
      cb(null);
      return;
    }
    const d = snap.docs[0];
    cb(batchFromDoc(d.id, d.data() as Record<string, unknown>));
  });
}

/** Publish a new batch. Returns the new batch id. */
export async function publishBatch(data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!IS_FIREBASE || !db) {
    const id = newId();
    const batch: Batch = { ...data, id, createdAt: Date.now(), updatedAt: Date.now() };
    memAdd(batch);
    _notifyMemSubs();
    return id;
  }

  const ref = await addDoc(collection(db, 'batches'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update fields on an existing batch. */
export async function updateBatchFields(id: string, patch: Partial<Batch>): Promise<void> {
  if (!IS_FIREBASE || !db) {
    memUpdate(id, patch);
    _notifyMemSubs();
    return;
  }

  await updateDoc(doc(db, 'batches', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/** Get all hotels (used by banco to resolve names if needed). */
export function getAllHotels(): Hotel[] {
  return HOTELS;
}
