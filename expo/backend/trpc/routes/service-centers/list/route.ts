import { publicProcedure } from "../../../create-context";
import { db } from "../../../../../db";
import { serviceCenters } from "../../../../../db/schema";
import { asc } from "drizzle-orm";

// Fallback in-memory data if DB is not yet seeded or unreachable
const FALLBACK_CENTERS = [
  {
    id: 'sc-1',
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
    id: 'sc-2',
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
    id: 'sc-3',
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
    id: 'sc-4',
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
    id: 'sc-5',
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

export const listServiceCentersProcedure = publicProcedure
  .query(async () => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');
      const centers = await db.query.serviceCenters.findMany({
        orderBy: [asc(serviceCenters.name)],
      });

      if (centers.length === 0) {
        // DB not yet seeded — return fallback
        return { serviceCenters: FALLBACK_CENTERS };
      }

      return {
        serviceCenters: centers.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          city: c.city,
          phone: c.phone,
          rating: c.rating,
          reviewCount: c.reviewCount,
          services: c.services,
          openHours: c.openHours,
          lat: c.lat ?? undefined,
          lng: c.lng ?? undefined,
        })),
      };
    } catch (error) {
      console.error('[serviceCenters.list] DB error, using fallback:', error);
      return { serviceCenters: FALLBACK_CENTERS };
    }
  });
