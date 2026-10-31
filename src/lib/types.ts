// Types
export type BatchStatus = 'available' | 'confirmed' | 'in_transit' | 'completed' | 'rejected';
export type BatchCategory = 'sealed' | 'cold_production';

export interface Batch {
  id: string;
  hotelId: string;
  hotelName: string;
  item: string;
  category: BatchCategory;
  kg: number;
  tempC: number;
  status: BatchStatus;
  pickupWindow: string; // e.g. "8:00–10:00"
  pickupDate: string;   // e.g. "2024-11-01"
  driverName?: string;
  driverToken?: string;
  receivedKg?: number;
  rejectionReason?: string;
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
