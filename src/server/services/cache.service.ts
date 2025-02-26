import { getRedisClient, isRedisConnected } from '../db/cache/redis_client';
import { CellData } from '@/lib/types';

// Track initialization state
let initialized = false;

/**
 * Initialize the cache service
 */
export async function initializeCache(): Promise<boolean> {
  if (initialized) {
    console.log('[CacheService] Already initialized');
    return true;
  }

  console.log('[CacheService] Initializing...');
  try {
    const redis = getRedisClient();
    if (redis && !isRedisConnected()) {
      // Wait for connection to be established
      await redis.ping();
      console.log('[CacheService] Redis connection verified');
      initialized = true;
      return true;
    } else if (isRedisConnected()) {
      console.log('[CacheService] Redis already connected');
      initialized = true;
      return true;
    } else {
      console.warn('[CacheService] Redis client not available');
      return false;
    }
  } catch (error) {
    console.error('[CacheService] Redis connection failed:', error);
    return false;
  }
}

/**
 * Check if cache is initialized
 */
export function isCacheInitialized(): boolean {
  return initialized;
}

// Generic cache operations
/**
 * Get a value from cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  console.log(`[CacheService] Getting key: ${key}`);
  try {
    const redis = getRedisClient();
    if (!redis) {
      console.warn('[CacheService] Redis client not available');
      return null;
    }
    
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[CacheService] Failed to get data:', error);
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function setInCache(key: string, value: any, expirySeconds: number = 3600): Promise<boolean> {
  console.log(`[CacheService] Setting key: ${key}`);
  try {
    const redis = getRedisClient();
    if (!redis) {
      console.warn('[CacheService] Redis client not available');
      return false;
    }
    
    await redis.set(key, JSON.stringify(value), { EX: expirySeconds });
    return true;
  } catch (error) {
    console.error('[CacheService] Failed to set data:', error);
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  console.log(`[CacheService] Deleting key: ${key}`);
  try {
    const redis = getRedisClient();
    if (!redis) {
      console.warn('[CacheService] Redis client not available');
      return false;
    }
    
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('[CacheService] Failed to delete data:', error);
    return false;
  }
}

// Application specific cache operations
/**
 * Cache application state
 */
export async function cacheApplicationState(data: any): Promise<boolean> {
  return await setInCache('app:state', data);
}

/**
 * Get application state from cache
 */
export async function getApplicationState(): Promise<any | null> {
  return await getFromCache('app:state');
}

/**
 * Cache workbook data
 */
export async function cacheWorkbook(workbookData: any): Promise<boolean> {
  return await setInCache('app:workbook', workbookData);
}

/**
 * Get workbook data from cache
 */
export async function getWorkbookFromCache(): Promise<any | null> {
  return await getFromCache('app:workbook');
}

/**
 * Cache sheet data
 */
export async function cacheSheet(sheetId: number, sheetData: any): Promise<boolean> {
  return await setInCache(`app:sheet:${sheetId}`, sheetData);
}

/**
 * Get sheet data from cache
 */
export async function getSheetFromCache(sheetId: number): Promise<any | null> {
  return await getFromCache(`app:sheet:${sheetId}`);
}

/**
 * Delete sheet data from cache
 */
export async function deleteSheetFromCache(sheetId: number): Promise<boolean> {
  return await deleteFromCache(`app:sheet:${sheetId}`);
}

/**
 * Cache cell data
 */
export async function cacheCellData(sheetId: number, cellId: string, cellData: CellData): Promise<boolean> {
  return await setInCache(`app:sheet:${sheetId}:cell:${cellId}`, cellData);
}

/**
 * Get cell data from cache
 */
export async function getCellFromCache(sheetId: number, cellId: string): Promise<CellData | null> {
  return await getFromCache(`app:sheet:${sheetId}:cell:${cellId}`);
}

/**
 * Delete cell data from cache
 */
export async function deleteCellFromCache(sheetId: number, cellId: string): Promise<boolean> {
  return await deleteFromCache(`app:sheet:${sheetId}:cell:${cellId}`);
}

/**
 * Clear all application cache
 */
export async function clearApplicationCache(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      console.warn('[CacheService] Redis client not available');
      return false;
    }
    
    const pattern = 'app:*';
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    console.error('[CacheService] Failed to clear application cache:', error);
    return false;
  }
} 