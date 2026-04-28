/**
 * useBrandsModels hook
 *
 * Fetches brands and models from the backend database via tRPC.
 * Falls back to the hardcoded list in mockData.ts if the API is unreachable
 * or the brands/models tables don't exist yet.
 *
 * Caches the result for 1 hour to avoid unnecessary API calls.
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { carBrands as fallbackBrands, carModels as fallbackModels } from '@/constants/mockData';

interface BrandOption {
  value: string;
  label: string;
}

interface ModelOption {
  value: string;
  label: string;
}

interface BrandsModelsResult {
  brands: BrandOption[];
  getModels: (brand: string) => ModelOption[];
  isLoading: boolean;
  isFromDB: boolean;
}

export function useBrandsModels(): BrandsModelsResult {
  const brandsQuery = trpc.brandsModels.list.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    gcTime: 2 * 60 * 60 * 1000, // Keep in garbage collection for 2 hours
    retry: 1, // Only retry once, then fall back
    refetchOnWindowFocus: false,
  });

  const dbBrands = brandsQuery.data;
  const isFromDB = !!dbBrands && dbBrands.length > 0;

  const brands = useMemo<BrandOption[]>(() => {
    if (isFromDB) {
      return dbBrands.map((b: any) => ({ value: b.value, label: b.label }));
    }
    return fallbackBrands;
  }, [dbBrands, isFromDB]);

  const modelsMap = useMemo<Record<string, ModelOption[]>>(() => {
    if (isFromDB) {
      const map: Record<string, ModelOption[]> = {};
      for (const b of dbBrands!) {
        map[b.value] = b.models || [];
      }
      return map;
    }
    return fallbackModels;
  }, [dbBrands, isFromDB]);

  const getModels = (brand: string): ModelOption[] => {
    return modelsMap[brand] || [];
  };

  return {
    brands,
    getModels,
    isLoading: brandsQuery.isLoading,
    isFromDB,
  };
}
