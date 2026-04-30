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
 *  - brands
 *  - models
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
  serial,
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
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    monthlyMileage: integer('monthly_mileage'),
    lastServiceDate: varchar('last_service_date', { length: 20 }),
    preferredServiceCenter: varchar('preferred_service_center', { length: 200 }),
    onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
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

// ── Error Logs (Monitoring) ───────────────────────────────────────────────────

export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

export const errorLogs = pgTable(
  'error_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    severity: severityEnum('severity').default('medium').notNull(),
    source: varchar('source', { length: 50 }).notNull(), // 'api', 'mobile', 'system', 'database', 'sms', 'auth'
    endpoint: varchar('endpoint', { length: 200 }),
    message: text('message').notNull(),
    stackTrace: text('stack_trace'),
    userId: uuid('user_id'),
    userPhone: varchar('user_phone', { length: 20 }),
    deviceInfo: text('device_info'),
    appVersion: varchar('app_version', { length: 20 }),
    requestId: varchar('request_id', { length: 50 }),
    ipAddress: varchar('ip_address', { length: 50 }),
    resolved: boolean('resolved').default(false).notNull(),
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: varchar('resolved_by', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    severityIdx: index('error_logs_severity_idx').on(table.severity),
    sourceIdx: index('error_logs_source_idx').on(table.source),
    resolvedIdx: index('error_logs_resolved_idx').on(table.resolved),
    createdIdx: index('error_logs_created_idx').on(table.createdAt),
  })
);

// ── Bug Reports (Monitoring) ──────────────────────────────────────────────────

export const bugReportStatusEnum = pgEnum('bug_report_status', [
  'new', 'acknowledged', 'in_progress', 'resolved', 'wont_fix',
]);

export const bugReports = pgTable(
  'bug_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterName: varchar('reporter_name', { length: 100 }).notNull(),
    reporterPhone: varchar('reporter_phone', { length: 20 }),
    reporterRole: varchar('reporter_role', { length: 30 }).default('tester').notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    description: text('description').notNull(),
    stepsToReproduce: text('steps_to_reproduce'),
    expectedBehavior: text('expected_behavior'),
    actualBehavior: text('actual_behavior'),
    severity: severityEnum('severity').default('medium').notNull(),
    status: bugReportStatusEnum('status').default('new').notNull(),
    assignedTo: varchar('assigned_to', { length: 100 }),
    resolution: text('resolution'),
    deviceInfo: text('device_info'),
    appVersion: varchar('app_version', { length: 20 }),
    screenshotUrls: text('screenshot_urls').array().default([]),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('bug_reports_status_idx').on(table.status),
    severityIdx: index('bug_reports_severity_idx').on(table.severity),
    createdIdx: index('bug_reports_created_idx').on(table.createdAt),
  })
);

// ── System Health Snapshots ───────────────────────────────────────────────────

export const systemHealthSnapshots = pgTable(
  'system_health_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiStatus: varchar('api_status', { length: 20 }).notNull(), // 'healthy', 'degraded', 'down'
    dbStatus: varchar('db_status', { length: 20 }).notNull(),
    smsStatus: varchar('sms_status', { length: 20 }).notNull(),
    apiResponseTimeMs: integer('api_response_time_ms'),
    dbResponseTimeMs: integer('db_response_time_ms'),
    activeUsers24h: integer('active_users_24h'),
    totalUsers: integer('total_users'),
    totalVehicles: integer('total_vehicles'),
    totalAppointments: integer('total_appointments'),
    pendingAppointments: integer('pending_appointments'),
    otpSentToday: integer('otp_sent_today'),
    otpFailuresToday: integer('otp_failures_today'),
    errorCountToday: integer('error_count_today'),
    uptimeSeconds: integer('uptime_seconds'),
    nodeVersion: varchar('node_version', { length: 30 }),
    apiVersion: varchar('api_version', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    createdIdx: index('health_snapshots_created_idx').on(table.createdAt),
  })
);

// ── Brands ────────────────────────────────────────────────────────────────────

export const brands = pgTable(
  'brands',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 64 }).notNull().unique(),
    logoUrl: text('logo_url'),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index('brands_is_active_idx').on(table.isActive),
  })
);

// ── Models ────────────────────────────────────────────────────────────────────

export const models = pgTable(
  'models',
  {
    id: serial('id').primaryKey(),
    brandId: integer('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 96 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    brandIdx: index('models_brand_id_idx').on(table.brandId),
    activeIdx: index('models_is_active_idx').on(table.isActive),
    uniqueBrandModel: uniqueIndex('models_brand_model_idx').on(table.brandId, table.name),
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
export type ErrorLog = typeof errorLogs.$inferSelect;
export type BugReport = typeof bugReports.$inferSelect;
export type SystemHealthSnapshot = typeof systemHealthSnapshots.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
