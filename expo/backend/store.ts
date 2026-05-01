/**
 * In-memory data store for Qaraj backend.
 * In production, replace with a real database (PostgreSQL via Drizzle, Supabase, etc.)
 */

export interface StoredUser {
  id: string;
  phone: string;
  username: string;
  email?: string;
  avatar?: string;
  pinHash?: string;
  language: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  photos: { id: string; uri: string; isPrimary: boolean }[];
  mileage?: number;
  color?: string;
  createdAt: string;
}

export interface StoredAppointment {
  id: string;
  userId: string;
  vehicleId: string;
  serviceTypes: string[];
  serviceCenter: string;
  serviceCenterAddress?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredServiceCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  services: string[];
  openHours: string;
  lat?: number;
  lng?: number;
}

// ── Seed data ──────────────────────────────────────────────────────────────────

const serviceCenters: StoredServiceCenter[] = [
  {
    id: 'sc-1',
    name: 'Qaraj Abşeron',
    address: 'Bakı-Sumqayıt şossesi 6-cı km',
    city: 'Bakı',
    phone: '+994 12 555 01 01',
    rating: 4.8,
    reviewCount: 312,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Tire Service', 'Filter Replacement', 'AC Service'],
    openHours: 'Mon–Sat 08:00–20:00',
    lat: 40.4093,
    lng: 49.8671,
  },
  {
    id: 'sc-2',
    name: 'Qaraj Gəncə',
    address: 'Şah İsmayıl Xətai pr 2 B',
    city: 'Gəncə',
    phone: '+994 22 555 02 02',
    rating: 4.7,
    reviewCount: 198,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Tire Service', 'Filter Replacement'],
    openHours: 'Mon–Sat 08:00–19:00',
    lat: 40.6828,
    lng: 46.3606,
  },
  {
    id: 'sc-3',
    name: 'Qaraj Fizuli',
    address: 'Horadiz qəs. Bayraq meydanı',
    city: 'Fizuli',
    phone: '+994 25 555 03 03',
    rating: 4.6,
    reviewCount: 87,
    services: ['Oil Change', 'Full Inspection', 'Tire Service', 'Filter Replacement'],
    openHours: 'Mon–Fri 09:00–18:00',
    lat: 39.6014,
    lng: 47.1453,
  },
  {
    id: 'sc-4',
    name: 'Qaraj Babək',
    address: 'Babək pr. 34',
    city: 'Babək',
    phone: '+994 36 555 04 04',
    rating: 4.5,
    reviewCount: 64,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Filter Replacement'],
    openHours: 'Mon–Sat 08:00–18:00',
    lat: 39.1509,
    lng: 45.4484,
  },
  {
    id: 'sc-5',
    name: 'Qaraj Lənkəran',
    address: 'F.X. Xoyski 25',
    city: 'Lənkəran',
    phone: '+994 25 555 05 05',
    rating: 4.7,
    reviewCount: 143,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Tire Service', 'Filter Replacement', 'AC Service'],
    openHours: 'Mon–Sat 08:00–20:00',
    lat: 38.7529,
    lng: 48.8516,
  },
];

// ── In-memory collections ──────────────────────────────────────────────────────

const users: Map<string, StoredUser> = new Map();
const vehicles: Map<string, StoredVehicle> = new Map();
const appointments: Map<string, StoredAppointment> = new Map();

// ── Helper ─────────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Users ──────────────────────────────────────────────────────────────────────

export const userStore = {
  upsert(data: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StoredUser {
    const existing = [...users.values()].find((u) => u.phone === data.phone);
    if (existing) {
      const updated: StoredUser = { ...existing, ...data, updatedAt: new Date().toISOString() };
      users.set(existing.id, updated);
      return updated;
    }
    const newUser: StoredUser = {
      id: data.id || generateId('usr'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.set(newUser.id, newUser);
    return newUser;
  },

  getByPhone(phone: string): StoredUser | undefined {
    return [...users.values()].find((u) => u.phone === phone);
  },

  getById(id: string): StoredUser | undefined {
    return users.get(id);
  },
};

// ── Vehicles ───────────────────────────────────────────────────────────────────

export const vehicleStore = {
  create(data: Omit<StoredVehicle, 'id' | 'createdAt'>): StoredVehicle {
    const vehicle: StoredVehicle = {
      id: generateId('veh'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    vehicles.set(vehicle.id, vehicle);
    return vehicle;
  },

  getByUserId(userId: string): StoredVehicle[] {
    return [...vehicles.values()].filter((v) => v.userId === userId);
  },

  getByPhone(phone: string): StoredVehicle[] {
    const user = userStore.getByPhone(phone);
    if (!user) return [];
    return vehicleStore.getByUserId(user.id);
  },

  delete(id: string): boolean {
    return vehicles.delete(id);
  },

  getById(id: string): StoredVehicle | undefined {
    return vehicles.get(id);
  },
};

// ── Appointments ───────────────────────────────────────────────────────────────

export const appointmentStore = {
  create(data: Omit<StoredAppointment, 'id' | 'createdAt' | 'updatedAt'>): StoredAppointment {
    const appointment: StoredAppointment = {
      id: generateId('apt'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.set(appointment.id, appointment);
    return appointment;
  },

  getByUserId(userId: string): StoredAppointment[] {
    return [...appointments.values()]
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  updateStatus(id: string, status: StoredAppointment['status']): StoredAppointment | null {
    const existing = appointments.get(id);
    if (!existing) return null;
    const updated: StoredAppointment = { ...existing, status, updatedAt: new Date().toISOString() };
    appointments.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return appointments.delete(id);
  },
};

// ── Service Centers ────────────────────────────────────────────────────────────

export const serviceCenterStore = {
  list(): StoredServiceCenter[] {
    return serviceCenters;
  },

  getById(id: string): StoredServiceCenter | undefined {
    return serviceCenters.find((sc) => sc.id === id);
  },
};
