/**
 * Qaraj Database Seed Script
 *
 * Populates the database with initial service center data.
 * Run with: bun run db/seed.ts
 *
 * This is idempotent — it uses upsert logic to avoid duplicates.
 */

import { db, serviceCenters } from './index';
import { sql } from 'drizzle-orm';

const SERVICE_CENTERS_SEED = [
  {
    name: 'Qaraj Premium Service Center',
    address: 'Nizami küçəsi 45, Nərimanov rayonu',
    city: 'Baku',
    phone: '+994 12 555 01 01',
    rating: 4.9,
    reviewCount: 312,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Tire Service', 'Battery', 'AC Service'],
    openHours: 'Mon–Sat 08:00–20:00',
    lat: 40.4093,
    lng: 49.8671,
  },
  {
    name: 'AutoMaster Baku',
    address: 'Hüsü Hacıyev küçəsi 12, Xətai rayonu',
    city: 'Baku',
    phone: '+994 12 555 02 02',
    rating: 4.7,
    reviewCount: 198,
    services: ['Oil Change', 'Full Inspection', 'Brake Service', 'Engine Diagnostics'],
    openHours: 'Mon–Fri 09:00–19:00, Sat 09:00–15:00',
    lat: 40.3777,
    lng: 49.8920,
  },
  {
    name: 'SpeedFix Auto',
    address: 'Əliağa Vahid küçəsi 88, Binəqədi rayonu',
    city: 'Baku',
    phone: '+994 12 555 03 03',
    rating: 4.6,
    reviewCount: 145,
    services: ['Tire Service', 'Battery', 'Oil Change', 'Wheel Alignment'],
    openHours: 'Mon–Sun 08:00–22:00',
    lat: 40.4380,
    lng: 49.8290,
  },
  {
    name: 'TechCar Service',
    address: 'Əhməd Cavad küçəsi 23, Yasamal rayonu',
    city: 'Baku',
    phone: '+994 12 555 04 04',
    rating: 4.8,
    reviewCount: 267,
    services: ['Full Inspection', 'AC Service', 'Engine Diagnostics', 'Transmission Service'],
    openHours: 'Mon–Sat 09:00–20:00',
    lat: 40.3950,
    lng: 49.8560,
  },
  {
    name: 'GarageElite Sumqayıt',
    address: 'Heydər Əliyev prospekti 101',
    city: 'Sumgait',
    phone: '+994 18 555 05 05',
    rating: 4.5,
    reviewCount: 89,
    services: ['Oil Change', 'Brake Service', 'Tire Service', 'Battery'],
    openHours: 'Mon–Fri 08:00–18:00',
    lat: 40.5893,
    lng: 49.6317,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Seed service centers (upsert by name to be idempotent)
    for (const center of SERVICE_CENTERS_SEED) {
      await db
        .insert(serviceCenters)
        .values(center)
        .onConflictDoNothing();
    }

    console.log(`✅ Seeded ${SERVICE_CENTERS_SEED.length} service centers`);

    // Verify
    const count = await db.execute(sql`SELECT COUNT(*) FROM service_centers`);
    console.log(`📊 Total service centers in DB: ${(count as any)[0]?.count ?? 'unknown'}`);

    console.log('✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
