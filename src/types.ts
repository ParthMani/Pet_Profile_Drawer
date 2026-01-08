
export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum BookingStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
}

export interface Client {
  id: number;
  name: string;
  email: string;
  status: Status;
}

export interface Pet {
  id: number;
  clientId: number;
  name: string;
  status: Status;
  type: string;
  breed: string;
  size: 'Small' | 'Medium' | 'Large';
  temper: string;
  color: string;
  gender: string;
  weightKg: number;
  dob: string; // ISO string YYYY-MM-DD
  attributes: string[];
  notes: string | null;
  customerNotes: string | null;
  photos: string[];
}

export interface Vaccination {
  id: number;
  petId: number;
  vaccine: string;
  date: string;
  due: string;
}

export interface Grooming {
  id: number;
  petId: number;
  service: string;
  date: string;
  notes: string;
}

export interface Booking {
  id: number;
  petId: number;
  type: string;
  start: string;
  end: string;
  status: BookingStatus;
}
