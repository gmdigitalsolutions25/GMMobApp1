export type Language = 'en' | 'az' | 'ru';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  avatar?: string;
  language: Language;
  theme: Theme;
  monthlyMileage?: number;
  lastServiceDate?: string;
  preferredServiceCenter?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  photos: VehiclePhoto[];
  mileage?: number;
  color?: string;
  driveType?: '2WD' | '4WD';
  fuelType?: 'benzin' | 'diesel' | 'hybrid';
  engineType?: '1.5L' | '1.6L' | '1.8L' | '2.0L' | '2.4L' | '2.5L' | '2.7L' | '2.8L' | '3.3L' | '3.5L' | '4.0L';
  isGmBrand?: boolean;
  customBrand?: string;
  source?: string;
  createdAt: string;
}

export interface VehiclePhoto {
  id: string;
  uri: string;
  isPrimary: boolean;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceName: string;
  serviceType: 'maintenance' | 'repair' | 'inspection' | 'other';
  date: string;
  mileage: number;
  notes?: string;
  cost?: number;
  serviceCenter?: string;
  technician?: string;
  partsUsed?: string[];
  createdAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  duration: string;
  imageUri: string;
  fullDescription: string;
  includes: string[];
}

export interface CarForSale {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  condition: 'new' | 'pre-owned';
  imageUri: string;
}

export interface Appointment {
  id: string;
  vehicleId: string;
  serviceTypes: string[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  serviceCenter: string;
  serviceCenterAddress?: string;
  createdAt: string;
}
