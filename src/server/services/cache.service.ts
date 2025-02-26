import { getRedisClient, isRedisConnected } from '../db/cache/redis_client';
import { CellData, SheetData } from '@/lib/types';

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
  // Use the new hierarchical structure
  return await setInCache(`app:workbook:${workbookData.id}`, workbookData);
}

/**
 * Get workbook data from cache
 */
export async function getWorkbookFromCache(): Promise<any | null> {
  // First try to get the workbook ID from app state
  const appState = await getApplicationState();
  if (appState?.workbook?.id) {
    return await getFromCache(`app:workbook:${appState.workbook.id}`);
  }
  
  // Fallback to legacy key if needed
  const legacyWorkbook = await getFromCache('app:workbook');
  if (legacyWorkbook) {
    // Migrate to new structure if found in legacy format
    await cacheWorkbook(legacyWorkbook);
    await deleteFromCache('app:workbook');
    return legacyWorkbook;
  }
  
  return null;
}

// Define an interface for the sheet data in cache
interface CachedSheetData {
  id: number;
  name: string;
  workbookId: string | null;
  cellIds: string[];
  cells?: Record<string, CellData>;
}

/**
 * Cache sheet data
 */
export async function cacheSheet(sheetId: number, sheetData: any): Promise<boolean> {
  // Get the workbook ID from the sheet data
  const workbookId = sheetData.workbookId || 'unknown';
  
  // Store the sheet data without the cells
  const sheetWithoutCells = { ...sheetData };
  
  // Extract cell IDs and store them in the sheet
  const cellIds = Object.keys(sheetData.cells || {});
  sheetWithoutCells.cellIds = cellIds;
  
  console.log(`[CacheService] Caching sheet ${sheetId} with ${cellIds.length} cell IDs`);
  
  // Cache each cell individually if they exist in the sheet data
  if (sheetData.cells) {
    for (const cellId of cellIds) {
      const cellData = sheetData.cells[cellId];
      if (cellData) {
        await cacheCellData(sheetId, cellId, cellData);
      }
    }
  }
  
  // Remove the full cell data to avoid duplication
  delete sheetWithoutCells.cells;
  
  // Use the new hierarchical structure
  return await setInCache(`app:workbook:${workbookId}:sheet:${sheetId}`, sheetWithoutCells);
}

/**
 * Get sheet data from cache
 */
export async function getSheetFromCache(sheetId: number): Promise<any | null> {
  // Try to get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // Try to get the sheet with the workbook ID
  let sheetData = null;
  if (workbookId) {
    sheetData = await getFromCache<CachedSheetData>(`app:workbook:${workbookId}:sheet:${sheetId}`);
  }
  
  // Fallback to legacy key if needed
  if (!sheetData) {
    sheetData = await getFromCache<CachedSheetData>(`app:sheet:${sheetId}`);
    
    // Migrate to new structure if found in legacy format
    if (sheetData && workbookId) {
      await setInCache(`app:workbook:${workbookId}:sheet:${sheetId}`, sheetData);
      await deleteFromCache(`app:sheet:${sheetId}`);
    }
  }
  
  if (!sheetData) return null;
  
  // Initialize cells object
  sheetData.cells = {};
  
  // If there are cell IDs, we'll load them separately
  if (sheetData.cellIds && Array.isArray(sheetData.cellIds)) {
    console.log(`[CacheService] Sheet ${sheetId} has ${sheetData.cellIds.length} cell IDs to load`);
    
    // Load each cell
    for (const cellId of sheetData.cellIds) {
      const cellData = await getCellFromCache(sheetId, cellId);
      if (cellData) {
        sheetData.cells[cellId] = cellData;
      }
    }
  }
  
  return sheetData;
}

/**
 * Delete sheet data from cache
 */
export async function deleteSheetFromCache(sheetId: number): Promise<boolean> {
  // First get the sheet to find all cell IDs
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  let sheetData = null;
  if (workbookId) {
    sheetData = await getFromCache<CachedSheetData>(`app:workbook:${workbookId}:sheet:${sheetId}`);
  }
  
  if (!sheetData) {
    sheetData = await getFromCache<CachedSheetData>(`app:sheet:${sheetId}`);
  }
  
  if (sheetData && sheetData.cellIds && Array.isArray(sheetData.cellIds)) {
    // Delete all cells for this sheet
    for (const cellId of sheetData.cellIds) {
      await deleteCellFromCache(sheetId, cellId);
    }
  }
  
  // Delete from both legacy and new structure to ensure complete removal
  let success = true;
  if (workbookId) {
    success = await deleteFromCache(`app:workbook:${workbookId}:sheet:${sheetId}`);
  }
  
  const legacySuccess = await deleteFromCache(`app:sheet:${sheetId}`);
  return success && legacySuccess;
}

/**
 * Cache cell data
 */
export async function cacheCellData(sheetId: number, cellId: string, cellData: CellData): Promise<boolean> {
  // First, ensure the cell ID is in the sheet's cellIds array
  await addCellIdToSheet(sheetId, cellId);
  
  // Get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // Use the new hierarchical structure if workbook ID is available
  if (workbookId) {
    return await setInCache(`app:workbook:${workbookId}:sheet:${sheetId}:cell:${cellId}`, cellData);
  }
  
  // Fallback to legacy structure
  return await setInCache(`app:sheet:${sheetId}:cell:${cellId}`, cellData);
}

/**
 * Add a cell ID to a sheet's cellIds array
 */
export async function addCellIdToSheet(sheetId: number, cellId: string): Promise<boolean> {
  // Get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // Try to get the sheet with the workbook ID
  let sheetData = null;
  let cacheKey = '';
  
  if (workbookId) {
    cacheKey = `app:workbook:${workbookId}:sheet:${sheetId}`;
    sheetData = await getFromCache<CachedSheetData>(cacheKey);
  }
  
  // Fallback to legacy key if needed
  if (!sheetData) {
    cacheKey = `app:sheet:${sheetId}`;
    sheetData = await getFromCache<CachedSheetData>(cacheKey);
  }
  
  if (!sheetData) {
    // If sheet data doesn't exist, create a minimal version
    sheetData = {
      id: sheetId,
      name: `Sheet ${sheetId}`,
      workbookId: workbookId?.toString() || null,
      cellIds: []
    };
  }
  
  // Initialize cellIds array if it doesn't exist
  if (!sheetData.cellIds) {
    sheetData.cellIds = [];
  }
  
  // Add the cell ID if it's not already in the array
  if (!sheetData.cellIds.includes(cellId)) {
    sheetData.cellIds.push(cellId);
    await setInCache(cacheKey, sheetData);
    console.log(`[CacheService] Added cell ID ${cellId} to sheet ${sheetId}`);
  }
  
  return true;
}

/**
 * Get cell data from cache
 */
export async function getCellFromCache(sheetId: number, cellId: string): Promise<CellData | null> {
  // Get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // Try to get the cell with the workbook ID
  let cellData = null;
  if (workbookId) {
    cellData = await getFromCache<CellData>(`app:workbook:${workbookId}:sheet:${sheetId}:cell:${cellId}`);
  }
  
  // Fallback to legacy key if needed
  if (!cellData) {
    cellData = await getFromCache<CellData>(`app:sheet:${sheetId}:cell:${cellId}`);
    
    // Migrate to new structure if found in legacy format
    if (cellData && workbookId) {
      await setInCache(`app:workbook:${workbookId}:sheet:${sheetId}:cell:${cellId}`, cellData);
      await deleteFromCache(`app:sheet:${sheetId}:cell:${cellId}`);
    }
  }
  
  return cellData;
}

/**
 * Get all cell IDs for a sheet
 */
export async function getSheetCellIds(sheetId: number): Promise<string[]> {
  // Get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // Try to get the sheet with the workbook ID
  let sheetData = null;
  if (workbookId) {
    sheetData = await getFromCache<CachedSheetData>(`app:workbook:${workbookId}:sheet:${sheetId}`);
  }
  
  // Fallback to legacy key if needed
  if (!sheetData) {
    sheetData = await getFromCache<CachedSheetData>(`app:sheet:${sheetId}`);
  }
  
  if (!sheetData || !sheetData.cellIds) return [];
  
  return sheetData.cellIds;
}

/**
 * Delete cell data from cache
 */
export async function deleteCellFromCache(sheetId: number, cellId: string): Promise<boolean> {
  // Get the workbook ID from app state
  const appState = await getApplicationState();
  const workbookId = appState?.workbook?.id;
  
  // First, remove the cell ID from the sheet's cellIds array
  let sheetData = null;
  let sheetCacheKey = '';
  
  if (workbookId) {
    sheetCacheKey = `app:workbook:${workbookId}:sheet:${sheetId}`;
    sheetData = await getFromCache<CachedSheetData>(sheetCacheKey);
  }
  
  if (!sheetData) {
    sheetCacheKey = `app:sheet:${sheetId}`;
    sheetData = await getFromCache<CachedSheetData>(sheetCacheKey);
  }
  
  if (sheetData && sheetData.cellIds) {
    sheetData.cellIds = sheetData.cellIds.filter((id: string) => id !== cellId);
    await setInCache(sheetCacheKey, sheetData);
  }
  
  // Delete from both legacy and new structure to ensure complete removal
  let success = true;
  if (workbookId) {
    success = await deleteFromCache(`app:workbook:${workbookId}:sheet:${sheetId}:cell:${cellId}`);
  }
  
  const legacySuccess = await deleteFromCache(`app:sheet:${sheetId}:cell:${cellId}`);
  return success && legacySuccess;
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