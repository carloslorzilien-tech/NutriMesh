// src/lib/seedData.ts — Datos en memoria para Modo Demo (Piloto RD Real)

import type { Batch, Hotel, AppUser } from './types';

const now = new Date();
const h   = (hours: number) => new Date(now.getTime() + hours * 3600000);
const ago = (hours: number) => new Date(now.getTime() - hours * 3600000);

// ── Entidades reales del piloto ──────────────────────────────────────────────

export const DEMO_HOTELS: Hotel[] = [
  {
    id: 'hotel_europa_sd',
    name: 'Gran Hotel Europa',
    address: 'Ciudad Colonial, Santo Domingo, RD',
    dockNote: 'Entrada de servicio por la Calle Arzobispo Meriño. Toque el timbre e indique NutriMesh.',
    contactPhone: '+18095550001',
  },
  {
    id: 'barcelo_sd',
    name: 'Barceló Santo Domingo',
    address: 'Ensanche Naco, Av. Máximo Gómez, Santo Domingo, RD',
    dockNote: 'Muelle de carga posterior, Av. Máximo Gómez. Señalizar NutriMesh al guardia de seguridad.',
    contactPhone: '+18095550002',
  },
];

export const DEMO_USERS: AppUser[] = [
  {
    uid:     'demo-europa',
    email:   'hotel.europa@nutrimesh.dev',
    role:    'hotel',
    hotelId: 'hotel_europa_sd',
    name:    'Gran Hotel Europa',
  },
  {
    uid:     'demo-barcelo',
    email:   'barcelo@nutrimesh.dev',
    role:    'hotel',
    hotelId: 'barcelo_sd',
    name:    'Barceló Santo Domingo',
  },
  {
    uid:     'demo-bard',
    email:   'coordinador@bard.org.do',
    role:    'coordinator',
    hotelId: null,
    name:    'BARD — Coordinación Logística & Inocuidad',
  },
  {
    uid:     'demo-admin',
    email:   'admin@nutrimesh.dev',
    role:    'admin',
    hotelId: null,
    name:    'Admin NutriMesh',
  },
];

// ── Lotes de ejemplo en los 4 estados del flujo ──────────────────────────────

export const DEMO_BATCHES: Batch[] = [
  // 1. PUBLICADO — Frutas y vegetales, Gran Hotel Europa
  {
    id:           'batch-001',
    hotelId:      'hotel_europa_sd',
    hotelName:    'Gran Hotel Europa',
    category:     'Frutas y vegetales',
    trays:        5,
    estimatedKg:  20,
    type:         'cold',
    tempOrigin:   4,
    status:       'PUBLICADO',
    createdAt:    ago(1.5),
    expiresAt:    h(22.5),
    confirmedAt:  null,
    pickedUpAt:   null,
    receivedAt:   null,
    driverName:   null,
    driverToken:  null,
    originKg:     null,
    destKg:       null,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'demo-europa',
    confirmedBy:  null,
    receivedBy:   null,
  },

  // 2. CONFIRMADO — Proteínas cocinadas, Gran Hotel Europa
  {
    id:           'batch-002',
    hotelId:      'hotel_europa_sd',
    hotelName:    'Gran Hotel Europa',
    category:     'Proteínas cocinadas',
    trays:        7,
    estimatedKg:  28,
    type:         'hot',
    tempOrigin:   68,
    status:       'CONFIRMADO',
    createdAt:    ago(1),
    expiresAt:    h(3),
    confirmedAt:  ago(0.5),
    pickedUpAt:   null,
    receivedAt:   null,
    driverName:   'Pedro Santos',
    driverToken:  'tok-demo-002',
    originKg:     null,
    destKg:       null,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'demo-europa',
    confirmedBy:  'demo-bard',
    receivedBy:   null,
  },

  // 3. RECIBIDO — Panadería, Barceló Santo Domingo
  {
    id:           'batch-003',
    hotelId:      'barcelo_sd',
    hotelName:    'Barceló Santo Domingo',
    category:     'Panadería',
    trays:        3,
    estimatedKg:  12,
    type:         'cold',
    tempOrigin:   3,
    status:       'RECIBIDO',
    createdAt:    ago(30),
    expiresAt:    ago(6),
    confirmedAt:  ago(28),
    pickedUpAt:   ago(26),
    receivedAt:   ago(24),
    driverName:   'Carlos Méndez',
    driverToken:  'tok-demo-003',
    originKg:     12,
    destKg:       11.5,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'demo-barcelo',
    confirmedBy:  'demo-bard',
    receivedBy:   'demo-bard',
  },

  // 4. RECHAZADO — Arroz (temperatura inválida), Barceló Santo Domingo
  {
    id:           'batch-004',
    hotelId:      'barcelo_sd',
    hotelName:    'Barceló Santo Domingo',
    category:     'Arroz y carbohidratos',
    trays:        4,
    estimatedKg:  16,
    type:         'hot',
    tempOrigin:   55, // debajo de 60 °C — inválido
    status:       'RECHAZADO',
    createdAt:    ago(10),
    expiresAt:    ago(6),
    confirmedAt:  ago(9),
    pickedUpAt:   ago(8),
    receivedAt:   ago(7),
    driverName:   'Juan Rodríguez',
    driverToken:  'tok-demo-004',
    originKg:     16,
    destKg:       null,
    rejectReason: 'temperatura',
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'demo-barcelo',
    confirmedBy:  'demo-bard',
    receivedBy:   'demo-bard',
  },

  // 5. RECIBIDO — Proteínas cocinadas, Barceló Santo Domingo
  {
    id:           'batch-005',
    hotelId:      'barcelo_sd',
    hotelName:    'Barceló Santo Domingo',
    category:     'Proteínas cocinadas',
    trays:        6,
    estimatedKg:  24,
    type:         'hot',
    tempOrigin:   72,
    status:       'RECIBIDO',
    createdAt:    ago(5),
    expiresAt:    ago(1),
    confirmedAt:  ago(4.5),
    pickedUpAt:   ago(3),
    receivedAt:   ago(1.5),
    driverName:   'Luis Familia',
    driverToken:  'tok-demo-005',
    originKg:     24,
    destKg:       22.4,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'demo-barcelo',
    confirmedBy:  'demo-bard',
    receivedBy:   'demo-bard',
  },
];
