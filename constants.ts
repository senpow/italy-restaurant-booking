import { Table, TimeSlot } from './types';

export const ADMIN_EMAILS = ['admin@bellavista.com'];

export const RESTAURANT_TABLES: Table[] = [
  { id: 1, tableNumber: 1, capacity: 3, location: "Fenster (Links)", shape: 'round' },
  { id: 2, tableNumber: 2, capacity: 3, location: "Fenster (Rechts)", shape: 'round' },
  { id: 3, tableNumber: 3, capacity: 2, location: "Intim / Ecke", shape: 'rect' },
  { id: 4, tableNumber: 4, capacity: 4, location: "Zentral", shape: 'rect' },
  { id: 5, tableNumber: 5, capacity: 6, location: "Familienbereich", shape: 'rect' },
  { id: 6, tableNumber: 6, capacity: 6, location: "Familienbereich", shape: 'rect' },
];

// Lunch: 12:00 - 14:30 (Last booking 14:30 for shorter stay or strict 14:00)
// Dinner: 18:00 - 22:00
export const TIME_SLOTS: TimeSlot[] = [
  { id: 'l1', time: '12:00', period: 'lunch' },
  { id: 'l2', time: '12:30', period: 'lunch' },
  { id: 'l3', time: '13:00', period: 'lunch' },
  { id: 'l4', time: '13:30', period: 'lunch' },
  { id: 'l5', time: '14:00', period: 'lunch' },
  { id: 'd1', time: '18:00', period: 'dinner' },
  { id: 'd2', time: '18:30', period: 'dinner' },
  { id: 'd3', time: '19:00', period: 'dinner' },
  { id: 'd4', time: '19:30', period: 'dinner' },
  { id: 'd5', time: '20:00', period: 'dinner' },
  { id: 'd6', time: '20:30', period: 'dinner' },
];