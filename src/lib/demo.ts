// Demo in-memory data store
import type { Batch, Hotel, RejectionMotivo } from './types';

export { type RejectionMotivo };

let _nextId = 10;
export const newId = () => String(++_nextId);

export const HOTELS: Hotel[] = [
  { id: 'h1', name: 'Gran Hotel Europa', address: 'Av. George Washington 218, Santo Domingo', dockNote: 'Muelle trasero, portón azul, preguntar por Luis.' },
  { id: 'h2', name: 'Barceló Santo Domingo', address: 'Av. Máximo Gómez 50, Santo Domingo', dockNote: 'Acceso por calle lateral. Tocar timbre.' },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dateStr = tomorrow.toISOString().slice(0, 10);

export let BATCHES: Batch[] = [
  {
    id: 'b1',
    hotelId: 'h1',
    hotelName: 'Gran Hotel Europa',
    item: 'Pechuga de pollo envasada',
    category: 'sellado',
    kg: 18,
    tempC: 3,
    status: 'PUBLICADO',
    pickupWindow: '8:00–10:00',
    pickupDate: dateStr,
    driverToken: 'tok-b1',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'b2',
    hotelId: 'h2',
    hotelName: 'Barceló Santo Domingo',
    item: 'Arroz y habichuelas de producción',
    category: 'produccion_fria',
    kg: 32,
    tempC: 4,
    status: 'CONFIRMADO',
    pickupWindow: '9:00–11:00',
    pickupDate: dateStr,
    driverName: 'Pedro Santos',
    driverToken: 'tok-b2',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'b3',
    hotelId: 'h1',
    hotelName: 'Gran Hotel Europa',
    item: 'Queso fresco sellado',
    category: 'sellado',
    kg: 9,
    tempC: 2,
    status: 'RECOGIDO',
    pickupWindow: '8:00–10:00',
    pickupDate: dateStr,
    driverName: 'Carlos Méndez',
    driverToken: 'tok-b3',
    driverKg: 9,
    packagingOk: true,
    createdAt: Date.now() - 10800000,
  },
];

export function getBatchById(id: string) {
  return BATCHES.find(b => b.id === id);
}
export function getBatchByToken(token: string) {
  return BATCHES.find(b => b.driverToken === token);
}
export function getHotelById(id: string) {
  return HOTELS.find(h => h.id === id);
}
export function getBatchesByHotel(hotelId: string) {
  return BATCHES.filter(b => b.hotelId === hotelId);
}

export function addBatch(batch: Batch) {
  BATCHES = [batch, ...BATCHES];
}
export function updateBatch(id: string, patch: Partial<Batch>) {
  BATCHES = BATCHES.map(b => b.id === id ? { ...b, ...patch } : b);
}

// Bank stats — kg = acceptedKg real, not estimated
export function bankStats() {
  const toPickup = BATCHES.filter(b => b.status === 'PUBLICADO' || b.status === 'CONFIRMADO').length;
  const inTransit = BATCHES.filter(b => b.status === 'RECOGIDO').length;
  const kgToday = BATCHES
    .filter(b => b.status === 'RECIBIDO' || b.status === 'RECHAZADO')
    .reduce((s, b) => s + (b.acceptedKg ?? 0), 0);
  return { toPickup, inTransit, kgToday };
}

// Status display
export const STATUS_LABEL: Record<string, string> = {
  PUBLICADO:    'PUBLICADO',
  CONFIRMADO:   'CONFIRMADO',
  RECOGIDO:     'RECOGIDO',
  RECIBIDO:     'RECIBIDO',
  RECHAZADO:    'RECHAZADO',
  SIN_EXCEDENTE: 'SIN EXCEDENTE',
};
export const STATUS_CLASS: Record<string, string> = {
  PUBLICADO:    'status-publicado',
  CONFIRMADO:   'status-confirmado',
  RECOGIDO:     'status-recogido',
  RECIBIDO:     'status-recibido',
  RECHAZADO:    'status-rechazado',
  SIN_EXCEDENTE:'status-sin-excedente',
};

export const MOTIVO_LABEL: Record<string, string> = {
  temperatura_destino: 'Temperatura en destino',
  empaque:             'Empaque',
  fecha:               'Fecha',
  olor_aspecto:        'Olor o aspecto',
  capacidad:           'Capacidad',
  sin_personal:        'Sin personal',
  tipo_no_aceptado:    'Tipo no aceptado',
};

// Assumptions (labeled in UI)
export const KG_PER_MEAL = 0.4;
export const CO2_PER_KG  = 2.5;
