export interface Cabin {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Booking {
  id: string;
  cabinId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  reservationChannel: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  amount: number;
  currency: 'USD' | 'CRC';
  commission: number;
  deposit: number;
  paymentStatus: string;
  paymentMethod: string;
  needsInvoice: boolean;
  invoiceNotes?: string;
  numberOfGuests: number;
  roomType: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppConfig {
  reservationChannels: string[];
  paymentStatuses: string[];
  paymentMethods: string[];
  roomTypes: string[];
}

export interface AppData {
  cabins: Cabin[];
  bookings: Booking[];
  config: AppConfig;
}