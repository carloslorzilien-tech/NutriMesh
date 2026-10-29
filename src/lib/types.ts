// src/lib/types.ts — Tipos centrales de NutriMesh

export type BatchStatus =
  | 'PUBLICADO'
  | 'CONFIRMADO'
  | 'RECOGIDO'
  | 'RECIBIDO'
  | 'RECHAZADO'
  | 'SIN_EXCEDENTE';

export type BatchType = 'hot' | 'cold';

export type BatchCategory =
  | 'Proteínas cocinadas'
  | 'Arroz y carbohidratos'
  | 'Panadería'
  | 'Frutas y vegetales'
  | 'Bebidas selladas';

export type UserRole = 'hotel' | 'coordinator' | 'admin';

export interface Hotel {
  id: string;
  name: string;
  address: string;
  dockNote: string;
  contactPhone: string;
}

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  hotelId: string | null;
  name: string;
}

export interface BatchEvent {
  id: string;
  at: Date;
  byName: string;
  byRole: string;
  action: string;
  note?: string;
}

export interface Batch {
  id: string;
  hotelId: string;
  hotelName?: string;       // denormalizado para display
  category: BatchCategory;
  trays: number;
  estimatedKg: number;
  type: BatchType;
  tempOrigin: number | null;
  status: BatchStatus;
  createdAt: Date;
  expiresAt: Date;
  confirmedAt: Date | null;
  pickedUpAt: Date | null;
  receivedAt: Date | null;
  driverName: string | null;
  driverToken: string | null;
  originKg: number | null;
  destKg: number | null;
  rejectReason: string | null;
  photoOriginUrl: string | null;
  photoDestUrl: string | null;
  createdBy: string;
  confirmedBy: string | null;
  receivedBy: string | null;
  events?: BatchEvent[];
}

// Reglas de negocio (configurables por el banco)
export interface BusinessRules {
  hotMinTemp: number;      // °C mínimo para caliente (default 60)
  hotWindowHours: number;  // ventana inocuidad caliente (default 4)
  coldMaxTemp: number;     // °C máximo para frío (default 5)
  coldWindowHours: number; // ventana inocuidad frío (default 24)
  kgPerTray: number;       // kg estimados por bandeja (default 4)
  kgPerRation: number;     // kg por ración (default 0.4)
  co2PerKg: number;        // kg CO2e por kg rescatado (default 2.5)
}

export const DEFAULT_RULES: BusinessRules = {
  hotMinTemp: 60,
  hotWindowHours: 4,
  coldMaxTemp: 5,
  coldWindowHours: 24,
  kgPerTray: 4,
  kgPerRation: 0.4,
  co2PerKg: 2.5,
};

export type RejectReason = 'temperatura' | 'olor/aspecto' | 'empaque' | 'no llegó';
