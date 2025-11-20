import { Timestamp } from 'firebase/firestore';

export interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  location: string; // e.g., "Fenster", "Mitte", "Ecke"
  shape: 'round' | 'rect';
}

export interface Reservation {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  tableNumber: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  partySize: number;
  duration: number; // minutes, default 120
  status: 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  phoneNumber?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  period: 'lunch' | 'dinner';
}
