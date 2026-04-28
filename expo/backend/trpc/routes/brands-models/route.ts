/**
 * Brands & Models tRPC routes
 *
 * Provides endpoints for the mobile app to fetch brands and models from the database.
 * Falls back gracefully if the tables don't exist yet (returns empty arrays).
 */

import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { brands, models } from "../../../../db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * List all active brands with their models.
 * Returns a flat structure: [{ brand: "Toyota", models: ["4Runner", "Camry", ...] }, ...]
 * The mobile app uses this to populate the brand/model pickers.
 */
export const listBrandsWithModelsProcedure = publicProcedure.query(async () => {
  try {
    const allBrands = await db
      .select({
        id: brands.id,
        name: brands.name,
        logoUrl: brands.logoUrl,
        sortOrder: brands.sortOrder,
      })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.sortOrder), asc(brands.name));

    const allModels = await db
      .select({
        id: models.id,
        brandId: models.brandId,
        name: models.name,
        sortOrder: models.sortOrder,
      })
      .from(models)
      .where(eq(models.isActive, true))
      .orderBy(asc(models.sortOrder), asc(models.name));

    // Group models by brand
    const modelsByBrand = new Map<number, { value: string; label: string }[]>();
    for (const m of allModels) {
      if (!modelsByBrand.has(m.brandId)) {
        modelsByBrand.set(m.brandId, []);
      }
      modelsByBrand.get(m.brandId)!.push({ value: m.name, label: m.name });
    }

    return allBrands.map((b) => ({
      value: b.name,
      label: b.name,
      logoUrl: b.logoUrl,
      models: modelsByBrand.get(b.id) ?? [],
    }));
  } catch (error) {
    // If tables don't exist yet, return empty array (graceful fallback)
    console.warn("[brands-models] Failed to fetch from DB, returning empty:", error);
    return [];
  }
});

/**
 * List models for a specific brand.
 */
export const listModelsByBrandProcedure = publicProcedure
  .input(z.object({ brand: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const brand = await db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.name, input.brand))
        .limit(1);

      if (brand.length === 0) return [];

      const brandModels = await db
        .select({
          value: models.name,
          label: models.name,
        })
        .from(models)
        .where(eq(models.brandId, brand[0].id))
        .orderBy(asc(models.sortOrder), asc(models.name));

      return brandModels;
    } catch (error) {
      console.warn("[brands-models] Failed to fetch models for brand:", input.brand, error);
      return [];
    }
  });
