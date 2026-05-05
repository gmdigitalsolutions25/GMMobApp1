/**
 * GM Brands — List of brands sold/serviced by Groupmotors
 *
 * Used to determine if a vehicle gets the full GM experience
 * (health gauges, service booking, diagnostics) or simplified card.
 */

export const GM_BRANDS = ['Toyota', 'Lexus'] as const;

export type GmBrand = (typeof GM_BRANDS)[number];

/**
 * Check if a brand is serviced by Groupmotors
 */
export function isGmBrand(brand: string | null | undefined): boolean {
  if (!brand) return false;
  return GM_BRANDS.some((gm) => gm.toLowerCase() === brand.toLowerCase());
}

/**
 * The "Other" brand sentinel used in the dropdown
 */
export const OTHER_BRAND_KEY = '__OTHER__';
export const OTHER_BRAND_LABEL = 'Digər (Other)';
