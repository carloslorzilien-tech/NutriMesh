// In-memory store — used when .env is absent (DEMO mode).
// Survives route changes because module state persists.

import type { Batch, Hotel, RejectionMotivo } from './types';

export { type RejectionMotivo };

let _nextId = 20;
export const newId = () => `mem-${++_nextId}`;

export const HOTELS: Hotel[] = [
  { id: 'hotel-europa',  name: 'Gran Hotel Europa',    dock: 'Muelle trasero, portón azul, preguntar por Luis.' },
  { id: 'hotel-barcelo', name: 'Barceló Santo Domingo', dock: 'Acceso por calle lateral. Tocar timbre.' },
];

export const DEMO_USERS = [
  { uid: 'u1', email: 'hotel.europa@nutrimesh.dev', role: 'hotel' as const, hotelId: 'hotel-europa',  displayName: 'Gran Hotel Europa' },
  { uid: 'u2', email: 'barcelo@nutrimesh.dev',       role: 'hotel' as const, hotelId: 'hotel-barcelo', displayName: 'Barceló Santo Domingo' },
  { uid: 'u3', email: 'coordinador@bard.org.do',     role: 'ong'   as const, displayName: 'BARD' },
];

export let BATCHES: Batch[] = [];

export function getHotelById(id: string) {
  return HOTELS.find(h => h.id === id) ?? null;
}
export function getBatchByToken(token: string) {
  return BATCHES.find(b => b.driverToken === token) ?? null;
}

export function addBatch(batch: Batch) {
  BATCHES = [batch, ...BATCHES];
}
export function updateBatch(id: string, patch: Partial<Batch>) {
  BATCHES = BATCHES.map(b => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b);
}

export const MOTIVO_LABEL: Record<string, string> = {
  temperatura_destino: 'Temperatura en destino',
  empaque:             'Empaque',
  fecha:               'Fecha',
  olor_aspecto:        'Olor o aspecto',
  capacidad:           'Capacidad',
  sin_personal:        'Sin personal',
  tipo_no_aceptado:    'Tipo no aceptado',
};

export const STATUS_LABEL: Record<string, string> = {
  PUBLICADO:     'PUBLICADO',
  CONFIRMADO:    'CONFIRMADO',
  RECOGIDO:      'RECOGIDO',
  RECIBIDO:      'RECIBIDO',
  RECHAZADO:     'RECHAZADO',
  SIN_EXCEDENTE: 'SIN EXCEDENTE',
};
export const STATUS_CLASS: Record<string, string> = {
  PUBLICADO:     'status-publicado',
  CONFIRMADO:    'status-confirmado',
  RECOGIDO:      'status-recogido',
  RECIBIDO:      'status-recibido',
  RECHAZADO:     'status-rechazado',
  SIN_EXCEDENTE: 'status-sin-excedente',
};

export const KG_PER_MEAL = 0.4;
export const CO2_PER_KG  = 2.5;
