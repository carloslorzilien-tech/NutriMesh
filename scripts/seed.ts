/**
 * scripts/seed.ts — Seed de Firebase para NutriMesh
 * Uso: npm run seed
 *
 * Requisitos:
 *   - .env configurado con VITE_FIREBASE_* variables
 *   - Firebase Admin SDK instalado: npm i -D firebase-admin tsx dotenv
 *   - Firestore, Auth y Storage habilitados en Firebase Console
 *
 * Crea:
 *   - 4 usuarios en Firebase Auth
 *   - Documentos en /users, /hotels, /batches
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Para el seed se necesita un Service Account.
// Descarga el JSON desde Firebase Console → Configuración del proyecto → Cuentas de servicio.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './service-account.json';

let serviceAccount: ServiceAccount;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  serviceAccount = require(serviceAccountPath) as ServiceAccount;
} catch {
  console.error(`
  Error: no se encontró el archivo de Service Account en: ${serviceAccountPath}
  
  Pasos:
    1. Ve a Firebase Console → Configuración del proyecto → Cuentas de servicio
    2. Haz clic en "Generar nueva clave privada"
    3. Guarda el JSON como service-account.json en la raíz del proyecto
    4. Agrega service-account.json a .gitignore
  `);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db   = getFirestore();

const now = new Date();
const ago = (h: number) => Timestamp.fromDate(new Date(now.getTime() - h * 3600000));
const fwd = (h: number) => Timestamp.fromDate(new Date(now.getTime() + h * 3600000));

// ── Usuarios del piloto RD ────────────────────────────────────────────────
const USERS = [
  {
    email:    'hotel.europa@nutrimesh.dev',
    password: 'demo1234',
    role:     'hotel',
    hotelId:  'hotel_europa_sd',
    name:     'Gran Hotel Europa',
  },
  {
    email:    'barcelo@nutrimesh.dev',
    password: 'demo1234',
    role:     'hotel',
    hotelId:  'barcelo_sd',
    name:     'Barceló Santo Domingo',
  },
  {
    email:    'coordinador@bard.org.do',
    password: 'demo1234',
    role:     'coordinator',
    hotelId:  null,
    name:     'BARD — Coordinación Logística & Inocuidad',
  },
  {
    email:    'admin@nutrimesh.dev',
    password: 'demo1234',
    role:     'admin',
    hotelId:  null,
    name:     'Admin NutriMesh',
  },
];

// ── Hoteles ───────────────────────────────────────────────────────────────
const HOTELS = [
  {
    id:           'hotel_europa_sd',
    name:         'Gran Hotel Europa',
    address:      'Ciudad Colonial, Santo Domingo, RD',
    dockNote:     'Entrada de servicio por la Calle Arzobispo Meriño. Toque el timbre e indique NutriMesh.',
    contactPhone: '+18095550001',
    lat:          18.4735,
    lng:          -69.8855,
  },
  {
    id:           'barcelo_sd',
    name:         'Barceló Santo Domingo',
    address:      'Ensanche Naco, Av. Máximo Gómez, Santo Domingo, RD',
    dockNote:     'Muelle de carga posterior, Av. Máximo Gómez. Señalizar NutriMesh al guardia de seguridad.',
    contactPhone: '+18095550002',
    lat:          18.4792,
    lng:          -69.9237,
  },
];

// ── Lotes de ejemplo ─────────────────────────────────────────────────────
const BATCHES = [
  {
    id:           'batch-seed-001',
    hotelId:      'hotel_europa_sd',
    hotelName:    'Gran Hotel Europa',
    category:     'Frutas y vegetales',
    trays:        5,
    estimatedKg:  20,
    type:         'cold',
    tempOrigin:   4,
    status:       'PUBLICADO',
    createdAt:    ago(1),
    expiresAt:    fwd(23),
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
    createdBy:    'hotel_europa_sd',
    confirmedBy:  null,
    receivedBy:   null,
  },
  {
    id:           'batch-seed-002',
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
    driverToken:  null,
    originKg:     12,
    destKg:       11.5,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'barcelo_sd',
    confirmedBy:  'bard',
    receivedBy:   'bard',
  },
  {
    id:           'batch-seed-003',
    hotelId:      'barcelo_sd',
    hotelName:    'Barceló Santo Domingo',
    category:     'Arroz y carbohidratos',
    trays:        4,
    estimatedKg:  16,
    type:         'hot',
    tempOrigin:   55,
    status:       'RECHAZADO',
    createdAt:    ago(10),
    expiresAt:    ago(6),
    confirmedAt:  ago(9),
    pickedUpAt:   ago(8),
    receivedAt:   ago(7),
    driverName:   'Juan Rodríguez',
    driverToken:  null,
    originKg:     16,
    destKg:       null,
    rejectReason: 'temperatura',
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'barcelo_sd',
    confirmedBy:  'bard',
    receivedBy:   'bard',
  },
  {
    id:           'batch-seed-004',
    hotelId:      'hotel_europa_sd',
    hotelName:    'Gran Hotel Europa',
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
    driverToken:  null,
    originKg:     24,
    destKg:       22.4,
    rejectReason: null,
    photoOriginUrl: null,
    photoDestUrl:   null,
    createdBy:    'hotel_europa_sd',
    confirmedBy:  'bard',
    receivedBy:   'bard',
  },
];

async function createUser(u: typeof USERS[number]) {
  try {
    const existing = await auth.getUserByEmail(u.email);
    console.log(`  Ya existe: ${u.email} (uid: ${existing.uid})`);
    await db.doc(`users/${existing.uid}`).set({
      role:    u.role,
      hotelId: u.hotelId,
      name:    u.name,
      email:   u.email,
    });
    return existing.uid;
  } catch {
    const created = await auth.createUser({
      email:         u.email,
      password:      u.password,
      displayName:   u.name,
      emailVerified: true,
    });
    await db.doc(`users/${created.uid}`).set({
      role:    u.role,
      hotelId: u.hotelId,
      name:    u.name,
      email:   u.email,
    });
    console.log(`  Creado: ${u.email} (uid: ${created.uid})`);
    return created.uid;
  }
}

async function main() {
  console.log('\n=== NutriMesh Seed — Piloto RD ===\n');

  console.log('Creando hoteles...');
  for (const hotel of HOTELS) {
    const { id, ...data } = hotel;
    await db.doc(`hotels/${id}`).set(data);
    console.log(`  Hotel: ${hotel.name}`);
  }

  console.log('\nCreando usuarios...');
  for (const u of USERS) await createUser(u);

  console.log('\nCreando lotes de ejemplo...');
  for (const batch of BATCHES) {
    const { id, ...data } = batch;
    await db.doc(`batches/${id}`).set(data);
    console.log(`  Lote ${id}: ${data.category} (${data.status})`);
  }

  console.log('\n=== Seed completado ===');
  console.log('\nCredenciales del piloto:');
  console.log('  hotel.europa@nutrimesh.dev / demo1234');
  console.log('  barcelo@nutrimesh.dev      / demo1234');
  console.log('  coordinador@bard.org.do    / demo1234');
  console.log('  admin@nutrimesh.dev        / demo1234');
  process.exit(0);
}

main().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
