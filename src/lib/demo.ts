// Demo in-memory data store
import type { Batch, Hotel } from './types';

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
    category: 'sealed',
    kg: 18,
    tempC: 3,
    status: 'available',
    pickupWindow: '8:00–10:00',
    pickupDate: dateStr,
    driverToken: 'tok-b1',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'b2',
    hotelId: 'h2',
    hotelName: 'Barceló Santo Domingo',
    item: 'Arroz y habichuelas producción',
    category: 'cold_production',
    kg: 32,
    tempC: 4,
    status: 'confirmed',
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
    category: 'sealed',
    kg: 9,
    tempC: 2,
    status: 'in_transit',
    pickupWindow: '8:00–10:00',
    pickupDate: dateStr,
    driverName: 'Carlos Méndez',
    driverToken: 'tok-b3',
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

// Bank stats
export function bankStats() {
  const toPickup = BATCHES.filter(b => b.status === 'available' || b.status === 'confirmed').length;
  const inTransit = BATCHES.filter(b => b.status === 'in_transit').length;
  const kgToday = BATCHES
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + (b.receivedKg ?? b.kg), 0);
  return { toPickup, inTransit, kgToday };
}

// Status display
export const STATUS_LABEL: Record<string, string> = {
  available: 'AVAILABLE',
  confirmed: 'CONFIRMED',
  in_transit: 'IN TRANSIT',
  completed: 'COMPLETED',
  rejected: 'REJECTED',
};
export const STATUS_CLASS: Record<string, string> = {
  available: 'status-available',
  confirmed: 'status-confirmed',
  in_transit: 'status-in-transit',
  completed: 'status-completed',
  rejected: 'status-rejected',
};

// Assumptions (labeled)
export const KG_PER_MEAL = 0.4;
export const CO2_PER_KG = 2.5;
