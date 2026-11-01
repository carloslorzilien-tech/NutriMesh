// Types
export type BatchStatus =
  | 'PUBLICADO'
  | 'CONFIRMADO'
  | 'RECOGIDO'
  | 'RECIBIDO'
  | 'RECHAZADO'
  | 'SIN_EXCEDENTE';

export type BatchCategory = 'sellado' | 'produccion_fria';

export type RejectionMotivo =
  | 'temperatura_destino'
  | 'empaque'
  | 'fecha'
  | 'olor_aspecto'
  | 'capacidad'
  | 'sin_personal'
  | 'tipo_no_aceptado';

export interface Batch {
  id: string;
  hotelId: string;
  hotelName: string;
  item: string;
  category: BatchCategory;
  kg: number;           // estimado por el hotel
  tempC: number;        // temperatura de origen (hotel)
  status: BatchStatus;
  pickupWindow: string; // e.g. "8:00–10:00"
  pickupDate: string;   // e.g. "2024-11-01"
  driverName?: string;
  driverToken?: string;
  driverKg?: number;        // kg que declaró el chofer
  packagingOk?: boolean;    // chofer confirmó empaque cerrado
  acceptedKg?: number;      // banco acepta (base del impacto)
  rejectedKg?: number;      // banco rechaza
  rejectionMotivo?: RejectionMotivo;
  destTempC?: number;       // temperatura en destino (opcional, banco)
  createdAt: number;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  dockNote?: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'hotel' | 'bank';
  hotelId?: string;
  displayName?: string;
}
