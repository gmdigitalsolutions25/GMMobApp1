/**
 * Qaraj GM — Car Image Cache
 *
 * Downloads car model images from the backend server on first use,
 * caches them locally in the app's file system for 30 days.
 * Falls back to bundled placeholder if server is unreachable.
 *
 * Cache strategy:
 *   - First access: download from server → save to FileSystem.cacheDirectory
 *   - Subsequent access: serve from local cache
 *   - After 30 days: re-download from server on next access
 *   - If server unreachable: continue using cached version (even if expired)
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.cacheDirectory}car-images/`;
const CACHE_META_KEY = '@car_image_cache_meta';
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Server base URL for car images
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://91.107.161.67:3000';

interface CacheMeta {
  [key: string]: {
    localPath: string;
    cachedAt: number;
  };
}

let cacheMetaLoaded = false;
let cacheMeta: CacheMeta = {};

/**
 * Ensure the cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * Load cache metadata from AsyncStorage
 */
async function loadCacheMeta(): Promise<void> {
  if (cacheMetaLoaded) return;
  try {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    if (raw) {
      cacheMeta = JSON.parse(raw);
    }
  } catch (e) {
    console.log('[ImageCache] Failed to load cache meta:', (e as Error).message);
    cacheMeta = {};
  }
  cacheMetaLoaded = true;
}

/**
 * Save cache metadata to AsyncStorage
 */
async function saveCacheMeta(): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(cacheMeta));
  } catch (e) {
    console.log('[ImageCache] Failed to save cache meta:', (e as Error).message);
  }
}

/**
 * Get the cache key for a brand/model combination
 */
function getCacheKey(brand: string, model: string): string {
  return `${brand.toLowerCase()}/${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

/**
 * Get the server URL for a car image
 */
function getServerUrl(brand: string, model: string): string {
  const brandSlug = brand.toLowerCase();
  const modelSlug = model.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `${IMAGE_BASE_URL}/static/cars/${brandSlug}/${modelSlug}.webp`;
}

/**
 * Get a cached car image URI, downloading from server if needed.
 * Returns the local file URI if cached, server URL as fallback.
 *
 * @param brand - Car brand name (e.g., "Honda")
 * @param model - Car model name (e.g., "Civic")
 * @returns Local file URI or remote URL
 */
export async function getCachedCarImage(brand: string, model: string): Promise<string> {
  await loadCacheMeta();
  await ensureCacheDir();

  const key = getCacheKey(brand, model);
  const entry = cacheMeta[key];
  const now = Date.now();

  // Check if we have a valid cached version
  if (entry) {
    const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
    if (fileInfo.exists) {
      // If cache is still fresh, return it
      if (now - entry.cachedAt < CACHE_MAX_AGE_MS) {
        return entry.localPath;
      }
      // Cache expired — try to refresh, but keep old version as fallback
      try {
        const freshPath = await downloadImage(brand, model);
        if (freshPath) {
          cacheMeta[key] = { localPath: freshPath, cachedAt: now };
          await saveCacheMeta();
          return freshPath;
        }
      } catch {
        // Server unreachable — return expired cache (better than nothing)
        return entry.localPath;
      }
    }
  }

  // No cache — download from server
  try {
    const localPath = await downloadImage(brand, model);
    if (localPath) {
      cacheMeta[key] = { localPath, cachedAt: now };
      await saveCacheMeta();
      return localPath;
    }
  } catch (e) {
    console.log(`[ImageCache] Failed to download ${brand}/${model}:`, (e as Error).message);
  }

  // Fallback: return server URL directly (Image component will try to load it)
  return getServerUrl(brand, model);
}

/**
 * Download an image from the server and save to local cache
 */
async function downloadImage(brand: string, model: string): Promise<string | null> {
  const url = getServerUrl(brand, model);
  const brandSlug = brand.toLowerCase();
  const modelSlug = model.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  // Ensure brand subdirectory exists
  const brandDir = `${CACHE_DIR}${brandSlug}/`;
  const dirInfo = await FileSystem.getInfoAsync(brandDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(brandDir, { intermediates: true });
  }

  const localPath = `${brandDir}${modelSlug}.webp`;

  const result = await FileSystem.downloadAsync(url, localPath);
  if (result.status === 200) {
    return localPath;
  }

  return null;
}

/**
 * Pre-cache all images for a specific brand (call when user opens brand library)
 */
export async function preCacheBrandImages(
  brand: string,
  models: string[]
): Promise<void> {
  await loadCacheMeta();
  await ensureCacheDir();

  const now = Date.now();
  const promises = models.map(async (model) => {
    const key = getCacheKey(brand, model);
    const entry = cacheMeta[key];

    // Skip if already cached and fresh
    if (entry && now - entry.cachedAt < CACHE_MAX_AGE_MS) {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists) return;
    }

    try {
      const localPath = await downloadImage(brand, model);
      if (localPath) {
        cacheMeta[key] = { localPath, cachedAt: now };
      }
    } catch {
      // Silently skip failed downloads during pre-cache
    }
  });

  await Promise.allSettled(promises);
  await saveCacheMeta();
}

/**
 * Clear the entire image cache (for settings/debug)
 */
export async function clearImageCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
    cacheMeta = {};
    await AsyncStorage.removeItem(CACHE_META_KEY);
    console.log('[ImageCache] Cache cleared');
  } catch (e) {
    console.log('[ImageCache] Failed to clear cache:', (e as Error).message);
  }
}

/**
 * Get cache statistics (for debug/settings screen)
 */
export async function getImageCacheStats(): Promise<{
  totalCached: number;
  cacheSize: string;
}> {
  await loadCacheMeta();
  const totalCached = Object.keys(cacheMeta).length;

  let totalBytes = 0;
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      // Approximate size from metadata count × average image size
      totalBytes = totalCached * 80 * 1024; // ~80KB per image
    }
  } catch {
    // ignore
  }

  const cacheSize = totalBytes > 1024 * 1024
    ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(totalBytes / 1024).toFixed(0)} KB`;

  return { totalCached, cacheSize };
}
