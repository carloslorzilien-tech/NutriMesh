// Types
export type BatchStatus =
  | 'PUBLICADO'
  | 'CONFIRMADO'
  | 'RECOGIDO'
  | 'RECIBIDO'
  | 'RECHAZADO'
  | 'SIN_EXCEDENTE';

export type BatchCategory = 'SELLADO' | 'PRODUCCION_FRIA';

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
  category: BatchCategory;
  name: string;           // item name
  estimatedKg: number;
  originTempC: number;
  window: string;         // "8:00–10:00"
  status: BatchStatus;
  driverName?: string;
  driverToken?: string;
  pickedUpKg?: number;    // declared by driver / bank in memory mode
  acceptedKg?: number;
  rejectedKg?: number;
  rejectReason?: RejectionMotivo;
  destTempC?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Hotel {
  id: string;
  name: string;
  dock: string;
}

export interface AppUser {
  uid: string;
  email: string;
  role: 'hotel' | 'ong';
  hotelId?: string;
  displayName?: string;
}
