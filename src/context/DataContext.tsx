// src/context/DataContext.tsx — Estado global de lotes, hoteles y modo demo

import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, doc, runTransaction,
  serverTimestamp, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Batch, Hotel, BatchCategory, BatchType, BatchStatus, RejectReason } from '../lib/types';
import { DEMO_BATCHES, DEMO_HOTELS } from '../lib/seedData';
import { calcExpiresAt, generateDriverToken, estimateKg } from '../lib/utils';
import { useAuth } from './AuthContext';

// ---------- helpers Firestore → dominio ----------
function fbTsToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date();
}

function mapBatch(id: string, data: Record<string, unknown>): Batch {
  return {
    id,
    hotelId:      data.hotelId as string,
    hotelName:    data.hotelName as string | undefined,
    category:     data.category as BatchCategory,
    trays:        data.trays as number,
    estimatedKg:  data.estimatedKg as number,
    type:         data.type as BatchType,
    tempOrigin:   (data.tempOrigin ?? null) as number | null,
    status:       data.status as BatchStatus,
    createdAt:    fbTsToDate(data.createdAt),
    expiresAt:    fbTsToDate(data.expiresAt),
    confirmedAt:  data.confirmedAt ? fbTsToDate(data.confirmedAt) : null,
    pickedUpAt:   data.pickedUpAt ? fbTsToDate(data.pickedUpAt) : null,
    receivedAt:   data.receivedAt ? fbTsToDate(data.receivedAt) : null,
    driverName:   (data.driverName ?? null) as string | null,
    driverToken:  (data.driverToken ?? null) as string | null,
    originKg:     (data.originKg ?? null) as number | null,
    destKg:       (data.destKg ?? null) as number | null,
    rejectReason: (data.rejectReason ?? null) as string | null,
    photoOriginUrl: (data.photoOriginUrl ?? null) as string | null,
    photoDestUrl:   (data.photoDestUrl ?? null) as string | null,
    createdBy:    data.createdBy as string,
    confirmedBy:  (data.confirmedBy ?? null) as string | null,
    receivedBy:   (data.receivedBy ?? null) as string | null,
  };
}

// ---------- tipos del contexto ----------
export interface PublishPayload {
  hotelId: string;
  hotelName: string;
  category: BatchCategory;
  trays: number;
  type: BatchType;
  tempOrigin: number | null;
  dockNote?: string;
}

export interface ConfirmPayload {
  batchId: string;
  driverName?: string;
  confirmedByName: string;
}

export interface DriverUpdatePayload {
  token: string;
  driverName: string;
  tempOrigin: number;
  originKg: number;
  photoBase64?: string;
}

export interface InspectPayload {
  batchId: string;
  destKg: number;
  accepted: boolean;
  rejectReason?: RejectReason;
  photoBase64?: string;
  inspectedByName: string;
}

interface DataContextValue {
  batches: Batch[];
  hotels: Hotel[];
  loadingData: boolean;
  publishBatch: (payload: PublishPayload) => Promise<string>;
  publishNoSurplus: (hotelId: string, hotelName: string) => Promise<void>;
  confirmBatch: (payload: ConfirmPayload) => Promise<string>;  // retorna driverToken
  driverUpdate: (payload: DriverUpdatePayload) => Promise<void>;
  inspectBatch: (payload: InspectPayload) => Promise<void>;
  getBatchByToken: (token: string) => Batch | undefined;
  getHotelById: (id: string) => Hotel | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

let demoIdCounter = 100;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();
  const [batches, setBatches] = useState<Batch[]>(isDemo ? [...DEMO_BATCHES] : []);
  const [hotels] = useState<Hotel[]>(DEMO_HOTELS);
  const [loadingData, setLoadingData] = useState(!isDemo);
  // ref para acceso sincrónico en callbacks
  const batchesRef = useRef<Batch[]>(batches);
  batchesRef.current = batches;

  // ---------- Firestore subscription ----------
  useEffect(() => {
    if (isDemo || !db) return;
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Batch[] = snap.docs.map(d => mapBatch(d.id, d.data() as Record<string, unknown>));
      setBatches(list);
      setLoadingData(false);
    }, () => setLoadingData(false));
    return unsub;
  }, [isDemo, user]);

  // ---------- Helpers demo ----------
  function demoPatch(id: string, patch: Partial<Batch>) {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  // ---------- Acciones ----------

  const publishBatch = useCallback(async (payload: PublishPayload): Promise<string> => {
    const createdAt = new Date();
    const expiresAt = calcExpiresAt(createdAt, payload.type);
    const kg = estimateKg(payload.trays);

    if (isDemo) {
      const id = `batch-${++demoIdCounter}`;
      const batch: Batch = {
        id, ...payload,
        estimatedKg: kg,
        status: 'PUBLICADO',
        createdAt, expiresAt,
        confirmedAt: null, pickedUpAt: null, receivedAt: null,
        driverName: null, driverToken: null,
        originKg: null, destKg: null, rejectReason: null,
        photoOriginUrl: null, photoDestUrl: null,
        createdBy: user?.uid ?? 'demo',
        confirmedBy: null, receivedBy: null,
      };
      setBatches(prev => [batch, ...prev]);
      return id;
    }

    if (!db) throw new Error('Firestore no disponible');
    const docRef = await addDoc(collection(db, 'batches'), {
      ...payload,
      estimatedKg: kg,
      status: 'PUBLICADO',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      confirmedAt: null, pickedUpAt: null, receivedAt: null,
      driverName: null, driverToken: null,
      originKg: null, destKg: null, rejectReason: null,
      photoOriginUrl: null, photoDestUrl: null,
      createdBy: user?.uid ?? '',
      confirmedBy: null, receivedBy: null,
    });
    return docRef.id;
  }, [isDemo, user]);

  const publishNoSurplus = useCallback(async (hotelId: string, hotelName: string) => {
    const createdAt = new Date();
    if (isDemo) {
      const id = `batch-${++demoIdCounter}`;
      setBatches(prev => [{
        id, hotelId, hotelName,
        category: 'Frutas y vegetales',
        trays: 0, estimatedKg: 0,
        type: 'cold', tempOrigin: null,
        status: 'SIN_EXCEDENTE',
        createdAt, expiresAt: createdAt,
        confirmedAt: null, pickedUpAt: null, receivedAt: null,
        driverName: null, driverToken: null,
        originKg: null, destKg: null, rejectReason: null,
        photoOriginUrl: null, photoDestUrl: null,
        createdBy: user?.uid ?? 'demo',
        confirmedBy: null, receivedBy: null,
      }, ...prev]);
      return;
    }
    if (!db) return;
    await addDoc(collection(db, 'batches'), {
      hotelId, hotelName,
      category: 'Frutas y vegetales', trays: 0, estimatedKg: 0,
      type: 'cold', tempOrigin: null,
      status: 'SIN_EXCEDENTE',
      createdAt: serverTimestamp(),
      expiresAt: serverTimestamp(),
      createdBy: user?.uid ?? '',
    });
  }, [isDemo, user]);

  const confirmBatch = useCallback(async (payload: ConfirmPayload): Promise<string> => {
    const token = generateDriverToken();
    const now = new Date();

    if (isDemo) {
      demoPatch(payload.batchId, {
        status: 'CONFIRMADO',
        confirmedAt: now,
        driverToken: token,
        driverName: payload.driverName ?? null,
        confirmedBy: user?.uid ?? 'demo',
      });
      return token;
    }

    if (!db) throw new Error('Firestore no disponible');

    // runTransaction para evitar doble confirmación
    await runTransaction(db, async (tx) => {
      const ref = doc(db!, 'batches', payload.batchId);
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Lote no encontrado');
      const data = snap.data() as Record<string, unknown>;
      if (data.status !== 'PUBLICADO') throw new Error('El lote ya no está en estado PUBLICADO');
      tx.update(ref, {
        status: 'CONFIRMADO',
        confirmedAt: serverTimestamp(),
        driverToken: token,
        driverName: payload.driverName ?? null,
        confirmedBy: user?.uid ?? '',
      });
    });

    return token;
  }, [isDemo, user]);

  const driverUpdate = useCallback(async (payload: DriverUpdatePayload) => {
    const batch = batchesRef.current.find(b => b.driverToken === payload.token);
    if (!batch) throw new Error('Token inválido');
    if (batch.status !== 'CONFIRMADO') throw new Error('El lote no está en estado CONFIRMADO');

    let photoUrl: string | null = null;

    if (isDemo) {
      demoPatch(batch.id, {
        status: 'RECOGIDO',
        pickedUpAt: new Date(),
        driverName: payload.driverName,
        originKg: payload.originKg,
        photoOriginUrl: payload.photoBase64 ?? null,
      });
      return;
    }

    if (!db) throw new Error('Firestore no disponible');

    // Subir foto si viene en base64
    if (payload.photoBase64 && storage) {
      const storageRef = ref(storage, `batches/${batch.id}/origin.jpg`);
      await uploadString(storageRef, payload.photoBase64, 'data_url');
      photoUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'batches', batch.id), {
      status: 'RECOGIDO',
      pickedUpAt: serverTimestamp(),
      driverName: payload.driverName,
      originKg: payload.originKg,
      photoOriginUrl: photoUrl,
    });
  }, [isDemo]);

  const inspectBatch = useCallback(async (payload: InspectPayload) => {
    let photoUrl: string | null = null;

    if (isDemo) {
      demoPatch(payload.batchId, {
        status: payload.accepted ? 'RECIBIDO' : 'RECHAZADO',
        receivedAt: new Date(),
        destKg: payload.accepted ? payload.destKg : null,
        rejectReason: payload.accepted ? null : (payload.rejectReason ?? null),
        receivedBy: user?.uid ?? 'demo',
      });
      return;
    }

    if (!db) throw new Error('Firestore no disponible');

    if (payload.photoBase64 && storage) {
      const storageRef = ref(storage, `batches/${payload.batchId}/dest.jpg`);
      await uploadString(storageRef, payload.photoBase64, 'data_url');
      photoUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'batches', payload.batchId), {
      status: payload.accepted ? 'RECIBIDO' : 'RECHAZADO',
      receivedAt: serverTimestamp(),
      destKg: payload.accepted ? payload.destKg : null,
      rejectReason: payload.accepted ? null : (payload.rejectReason ?? null),
      photoDestUrl: photoUrl,
      receivedBy: user?.uid ?? '',
    });
  }, [isDemo, user]);

  const getBatchByToken = useCallback((token: string) => {
    return batchesRef.current.find(b => b.driverToken === token);
  }, []);

  const getHotelById = useCallback((id: string) => {
    return hotels.find(h => h.id === id);
  }, [hotels]);

  return (
    <DataContext.Provider value={{
      batches, hotels, loadingData,
      publishBatch, publishNoSurplus, confirmBatch,
      driverUpdate, inspectBatch, getBatchByToken, getHotelById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider');
  return ctx;
}
