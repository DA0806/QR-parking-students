export interface User {
  clerk_id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'superadmin';
  qr_secret?: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  owner_clerk_id: string;
  make?: string;
  model?: string;
}

export interface ParkingZone {
  id: number;
  name: string;
  total_capacity: number;
  current_occupancy: number;
}

export interface ScanEvent {
  id: number;
  vehicle_plate: string;
  zone_id: number;
  event_type: 'ENTRY' | 'EXIT';
  timestamp: string;
}

export interface QRPayload {
  userId: string;
  plate?: string;
  type?: 'pedestrian';
  timestamp: number;
}

export interface QRToken {
  payload: QRPayload;
  signature: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}
