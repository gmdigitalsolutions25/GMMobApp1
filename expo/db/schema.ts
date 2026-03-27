/**
 * Qaraj Database Schema — Drizzle ORM
 *
 * Tables:
 *  - users
 *  - vehicles
 *  - vehicle_photos
 *  - appointments
 *  - service_records
 *  - service_centers
 *  - otp_codes
 *  - push_tokens
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  real,
  pgEnum,
  varchar,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const languageEnum = pgEnum('language', ['en', 'az', 'ru']);
export const themeEnum = pgEnum('theme', ['light', 'dark']);
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);
export const serviceTypeEnum = pgEnum('service_type', [
  'maintenance',
  'repair',
  'inspection',
  'other',
]);

// ── Users ──────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 20 }).notNull(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }),
    avatar: text('avatar'),
    pinHash: text('pin_hash'),
    language: languageEnum('language').default('en').notNull(),
    theme: themeEnum('theme').default('dark').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: uniqueIndex('users_phone_idx').on(table.phone),
  })
);

// ── Vehicles ───────────────────────────────────────────────────────────────────

export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    brand: varchar('brand', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    year: integer('year').notNull(),
    vin: varchar('vin', { length: 17 }).default(''),
    licensePlate: varchar('license_plate', { length: 20 }).default(''),
    primaryPhotoId: uuid('primary_photo_id'),
    mileage: integer('mileage'),
    color: varchar('color', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('vehicles_user_idx').on(table.userId),
    vinIdx: index('vehicles_vin_idx').on(table.vin),
  })
);

// ── Vehicle Photos ─────────────────────────────────────────────────────────────

export const vehiclePhotos = pgTable(
  'vehicle_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vehicleId: uuid('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    uri: text('uri').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    vehicleIdx: index('vehicle_photos_vehicle_idx').on(table.vehicleId),
  })
);

// ── Service Centers ────────────────────────────────────────────────────────────

export const serviceCenters = pgTable('service_centers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  rating: real('rating').default(0).notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  services: text('services').array().notNull().default([]),
  openHours: varchar('open_hours', { length: 100 }).notNull(),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Appointments ───────────────────────────────────────────────────────────────

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    vehicleId: uuid('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    serviceCenterId: uuid('service_center_id').references(
      () => serviceCenters.id
    ),
    serviceCenter: varchar('service_center', { length: 200 }).notNull(),
    serviceCenterAddress: text('service_center_address'),
    serviceTypes: text('service_types').array().notNull().default([]),
    date: varchar('date', { length: 20 }).notNull(),
    time: varchar('time', { length: 10 }).notNull(),
    status: appointmentStatusEnum('status').default('pending').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('appointments_user_idx').on(table.userId),
    vehicleIdx: index('appointments_vehicle_idx').on(table.vehicleId),
    statusIdx: index('appointments_status_idx').on(table.status),
    dateIdx: index('appointments_date_idx').on(table.date),
  })
);

// ── Service Records ────────────────────────────────────────────────────────────

export const serviceRecords = pgTable(
  'service_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vehicleId: uuid('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    serviceName: varchar('service_name', { length: 200 }).notNull(),
    serviceType: serviceTypeEnum('service_type').default('maintenance').notNull(),
    date: varchar('date', { length: 20 }).notNull(),
    mileage: integer('mileage').notNull(),
    notes: text('notes'),
    cost: real('cost'),
    serviceCenter: varchar('service_center', { length: 200 }),
    technician: varchar('technician', { length: 100 }),
    partsUsed: text('parts_used').array().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    vehicleIdx: index('service_records_vehicle_idx').on(table.vehicleId),
    dateIdx: index('service_records_date_idx').on(table.date),
  })
);

// ── OTP Codes ──────────────────────────────────────────────────────────────────

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 20 }).notNull(),
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    used: boolean('used').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('otp_codes_phone_idx').on(table.phone),
    expiresIdx: index('otp_codes_expires_idx').on(table.expiresAt),
  })
);

// ── Push Tokens ────────────────────────────────────────────────────────────────

export const pushTokens = pgTable(
  'push_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    platform: varchar('platform', { length: 10 }).notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('push_tokens_user_idx').on(table.userId),
    tokenIdx: uniqueIndex('push_tokens_token_idx').on(table.token),
  })
);

// ── Type Exports ───────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
export type NewVehiclePhoto = typeof vehiclePhotos.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type ServiceRecord = typeof serviceRecords.$inferSelect;
export type NewServiceRecord = typeof serviceRecords.$inferInsert;
export type ServiceCenter = typeof serviceCenters.$inferSelect;
export type NewServiceCenter = typeof serviceCenters.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type PushToken = typeof pushTokens.$inferSelect;
