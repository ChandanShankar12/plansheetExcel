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
  return await setInCache('app:appData', data);
}

/**
 * Get application state from cache
 */
export async function getApplicationState(): Promise<any | null> {
  return await getFromCache('app:appData');
}

/**
 * Cache workbook data
 */
export async function cacheWorkbook(workbookData: any): Promise<boolean> {
  console.log('[CacheService] Caching workbook:', {
    id: workbookData.id,
    name: workbookData.name,
    sheetsCount: workbookData.sheets?.length || 0
  });
  
  // Create a simplified workbook structure that only references sheets
  const simplifiedWorkbook = {
    id: workbookData.id,
    name: workbookData.name,
    sheets: [] as number[] // Just store sheet IDs, not the full sheet data
  };
  
  // Extract sheet IDs from the workbook data
  if (workbookData.sheets && Array.isArray(workbookData.sheets)) {
    console.log(`[CacheService] Extracting sheet IDs for ${workbookData.sheets.length} sheets in workbook`);
    
    // Store only the sheet IDs in the workbook
    const sheetIds = workbookData.sheets.map((sheet: any) => sheet.id);
    
    // Get all existing sheet keys from cache to ensure we include all sheets
    try {
      const redis = getRedisClient();
      if (redis) {
        const sheetKeys = await redis.keys('app:sheet:*');
        
        // Extract sheet IDs from the keys (format: app:sheet:ID)
        const cachedSheetIds = sheetKeys
          .map(key => {
            const match = key.match(/^app:sheet:(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter(id => id !== null) as number[];
        
        console.log(`[CacheService] Found ${cachedSheetIds.length} sheets in cache: ${cachedSheetIds.join(', ')}`);
        
        // Combine sheet IDs from workbook data and cache
        const allSheetIds = [...new Set([...sheetIds, ...cachedSheetIds])];
        
        // Sort the sheet IDs numerically to ensure they're in order of creation
        // (assuming lower IDs were created first)
        allSheetIds.sort((a, b) => a - b);
        
        // Ensure Sheet 1 is always first if it exists
        if (allSheetIds.includes(1)) {
          // Remove Sheet 1 from its current position
          const index = allSheetIds.indexOf(1);
          allSheetIds.splice(index, 1);
          // Add it back at the beginning
          allSheetIds.unshift(1);
        }
        
        simplifiedWorkbook.sheets = allSheetIds;
      } else {
        // If Redis client not available, just use the sheet IDs from workbook data
        // Sort them to ensure proper order
        simplifiedWorkbook.sheets = [...sheetIds].sort((a, b) => a - b);
        
        // Ensure Sheet 1 is first if it exists
        if (simplifiedWorkbook.sheets.includes(1)) {
          const index = simplifiedWorkbook.sheets.indexOf(1);
          simplifiedWorkbook.sheets.splice(index, 1);
          simplifiedWorkbook.sheets.unshift(1);
        }
      }
    } catch (error) {
      console.error('[CacheService] Error getting sheet keys from cache:', error);
      // Fall back to using sheet IDs from workbook data
      simplifiedWorkbook.sheets = [...sheetIds].sort((a, b) => a - b);
      
      // Ensure Sheet 1 is first if it exists
      if (simplifiedWorkbook.sheets.includes(1)) {
        const index = simplifiedWorkbook.sheets.indexOf(1);
        simplifiedWorkbook.sheets.splice(index, 1);
        simplifiedWorkbook.sheets.unshift(1);
      }
    }
    
    // Ensure Sheet 1 is always included if it's not already
    if (!simplifiedWorkbook.sheets.includes(1)) {
      console.log('[CacheService] Adding default Sheet 1 to workbook sheets');
      simplifiedWorkbook.sheets.unshift(1); // Add Sheet 1 at the beginning
    }
    
    console.log(`[CacheService] Workbook references ${simplifiedWorkbook.sheets.length} sheets: ${simplifiedWorkbook.sheets.join(', ')}`);
  } else {
    // If no sheets, add at least Sheet 1
    simplifiedWorkbook.sheets = [1];
    console.log('[CacheService] No sheets found, adding default Sheet 1');
    
    // Try to find any other sheets in the cache
    try {
      const redis = getRedisClient();
      if (redis) {
        const sheetKeys = await redis.keys('app:sheet:*');
        
        // Extract sheet IDs from the keys (format: app:sheet:ID)
        const cachedSheetIds = sheetKeys
          .map(key => {
            const match = key.match(/^app:sheet:(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter(id => id !== null && id !== 1) as number[]; // Exclude Sheet 1 as it's already added
        
        if (cachedSheetIds.length > 0) {
          // Sort the additional sheet IDs
          cachedSheetIds.sort((a, b) => a - b);
          
          console.log(`[CacheService] Adding ${cachedSheetIds.length} existing sheets from cache: ${cachedSheetIds.join(', ')}`);
          simplifiedWorkbook.sheets.push(...cachedSheetIds);
        }
      }
    } catch (error) {
      console.error('[CacheService] Error getting sheet keys from cache:', error);
    }
  }
  
  return await setInCache('app:workbook', simplifiedWorkbook);
}

/**
 * Get workbook data from cache
 */
export async function getWorkbookFromCache(workbookId: string): Promise<any> {
  console.log(`[CacheService] Getting workbook from cache: ${workbookId}`);
  
  // Try to get the workbook from the cache
  const workbookData = await getFromCache('app:workbook') as any;
  
  if (!workbookData) {
    console.log(`[CacheService] Workbook not found in cache`);
    return null;
  }
  
  console.log(`[CacheService] Found workbook in cache: ${workbookData.id}, with ${workbookData.sheets?.length || 0} sheet references`);
  
  // Create a full workbook object with sheet data
  const fullWorkbookData = {
    ...workbookData,
    nextSheetId: Math.max(...(workbookData.sheets || []), 0) + 1, // Calculate nextSheetId from highest sheet ID
    sheets: [] as any[],
    // Ensure config exists with default values
    config: workbookData.config || {
      theme: 'light',
      autoSave: false
    }
  };
  
  // Fetch each sheet referenced by the workbook
  if (workbookData.sheets && Array.isArray(workbookData.sheets)) {
    console.log(`[CacheService] Fetching ${workbookData.sheets.length} sheets for workbook`);
    
    for (const sheetId of workbookData.sheets) {
      try {
        // Get the sheet data from cache
        const sheetData = await getSheetFromCache(sheetId);
        
        if (sheetData) {
          // Add the sheet to the workbook
          fullWorkbookData.sheets.push(sheetData);
        } else {
          console.warn(`[CacheService] Referenced sheet ${sheetId} not found in cache`);
        }
      } catch (error) {
        console.error(`[CacheService] Error fetching sheet ${sheetId}:`, error);
      }
    }
    
    console.log(`[CacheService] Fetched ${fullWorkbookData.sheets.length} sheets for workbook`);
  }
  
  return fullWorkbookData;
}

// Define an interface for the sheet data in cache
interface CachedSheetData {
  id: number;
  name: string;
  workbookId?: string | null;
  cellIds: string[];
  cells?: Record<string, CellData>;
}

/**
 * Cache sheet data
 */
export async function cacheSheet(sheetId: number, sheetData: any): Promise<boolean> {
  console.log(`[CacheService] Caching sheet: ${sheetId}`);
  
  // Create a simplified sheet structure with only metadata and cellIds
  const simplifiedSheetData = {
    id: sheetData.id,
    name: sheetData.name,
    cellIds: []
  };
  
  // Collect all cell IDs from the sheet data
  if (sheetData.cells && Object.keys(sheetData.cells).length > 0) {
    // If we have cells in the data, use their keys as cellIds
    simplifiedSheetData.cellIds = Object.keys(sheetData.cells);
    console.log(`[CacheService] Extracted ${simplifiedSheetData.cellIds.length} cell IDs from sheet data`);
    
    // Cache each cell individually
    for (const cellId of simplifiedSheetData.cellIds) {
      const cellData = sheetData.cells[cellId];
      if (cellData) {
        // Ensure cell has complete style object before caching
        if (!cellData.style) {
          console.log(`[CacheService] Cell ${cellId} missing style, adding default style before caching`);
          cellData.style = {
            bold: false,
            italic: false,
            underline: false,
            color: null,
            backgroundColor: null,
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left'
          };
        } else {
          // Ensure all style properties exist
          cellData.style = {
            bold: cellData.style.bold || false,
            italic: cellData.style.italic || false,
            underline: cellData.style.underline || false,
            color: cellData.style.color || null,
            backgroundColor: cellData.style.backgroundColor || null,
            fontSize: cellData.style.fontSize || 12,
            fontFamily: cellData.style.fontFamily || 'Arial',
            alignment: cellData.style.alignment || 'left'
          };
        }
        
        await cacheCellData(sheetId, cellId, cellData);
      }
    }
  } else if (sheetData.cellIds && Array.isArray(sheetData.cellIds)) {
    // If we already have cellIds in the sheet data, use those
    simplifiedSheetData.cellIds = sheetData.cellIds;
    console.log(`[CacheService] Using ${simplifiedSheetData.cellIds.length} existing cell IDs`);
  }
  
  // Cache the simplified sheet data
  return await setInCache(`app:sheet:${sheetId}`, simplifiedSheetData);
}

/**
 * Get sheet data from cache
 */
export async function getSheetFromCache(sheetId: number): Promise<CachedSheetData | null> {
  console.log(`[CacheService] Getting sheet ${sheetId} from cache`);
  
  // Get the sheet metadata from cache
  const sheetData = await getFromCache<CachedSheetData>(`app:sheet:${sheetId}`);
  
  if (!sheetData) {
    console.log(`[CacheService] Sheet ${sheetId} not found in cache`);
    return null;
  }
  
  console.log(`[CacheService] Found sheet ${sheetId} in cache with ${sheetData.cellIds?.length || 0} cell IDs`);
  
  // Initialize cells object
  const fullSheetData = {
    ...sheetData,
    cells: {} as Record<string, CellData>
  };
  
  // If there are cell IDs, fetch each cell separately
  if (sheetData.cellIds && Array.isArray(sheetData.cellIds) && sheetData.cellIds.length > 0) {
    console.log(`[CacheService] Fetching ${sheetData.cellIds.length} cells for sheet ${sheetId}`);
    
    // Load each cell from cache
    for (const cellId of sheetData.cellIds) {
      try {
        const cellData = await getCellFromCache(sheetId, cellId);
        if (cellData) {
          fullSheetData.cells[cellId] = cellData;
        } else {
          console.warn(`[CacheService] Cell ${cellId} not found in cache for sheet ${sheetId}`);
        }
      } catch (error) {
        console.warn(`[CacheService] Failed to load cell ${cellId} for sheet ${sheetId}:`, error);
      }
    }
    
    console.log(`[CacheService] Fetched ${Object.keys(fullSheetData.cells).length} of ${sheetData.cellIds.length} cells for sheet ${sheetId}`);
  } else {
    console.log(`[CacheService] No cell IDs to fetch for sheet ${sheetId}`);
  }
  
  return fullSheetData;
}

/**
 * Delete sheet data from cache
 */
export async function deleteSheetFromCache(sheetId: number): Promise<boolean> {
  console.log(`[CacheService] Deleting sheet ${sheetId} from cache`);
  
  // Get the sheet data to find all cell IDs
  const cacheKey = `app:sheet:${sheetId}`;
  const sheetData = await getFromCache<CachedSheetData>(cacheKey);
  
  if (sheetData && sheetData.cellIds && Array.isArray(sheetData.cellIds)) {
    console.log(`[CacheService] Deleting ${sheetData.cellIds.length} cells for sheet ${sheetId}`);
    
    // Delete all cells for this sheet
    for (const cellId of sheetData.cellIds) {
      await deleteCellFromCache(sheetId, cellId);
    }
  }
  
  // Delete the sheet data
  const success = await deleteFromCache(cacheKey);
  
  console.log(`[CacheService] Sheet ${sheetId} ${success ? 'successfully deleted' : 'deletion failed'} from cache`);
  return success;
}

/**
 * Cache cell data
 */
export async function cacheCellData(sheetId: number, cellId: string, cellData: CellData): Promise<boolean> {
  console.log(`[CacheService] Caching cell ${cellId} for sheet ${sheetId}`);
  
  // First, ensure the cell ID is in the sheet's cellIds array
  await addCellIdToSheet(sheetId, cellId);
  
  // Ensure the cell style is included in the cached data with all properties
  const cellToCache = {
    ...cellData,
    style: {
      // Default values for all style properties
      bold: cellData.style?.bold || false,
      italic: cellData.style?.italic || false,
      underline: cellData.style?.underline || false,
      color: cellData.style?.color || null,
      backgroundColor: cellData.style?.backgroundColor || null,
      fontSize: cellData.style?.fontSize || 12,
      fontFamily: cellData.style?.fontFamily || 'Arial',
      alignment: cellData.style?.alignment || 'left'
    }
  };
  
  // Log the cell style being cached
  console.log(`[CacheService] Cell ${cellId} style being cached:`, JSON.stringify(cellToCache.style));
  
  // Use the simplified key structure
  return await setInCache(`app:sheet:${sheetId}:cell:${cellId}`, cellToCache);
}

/**
 * Add a cell ID to a sheet's cellIds array
 */
export async function addCellIdToSheet(sheetId: number, cellId: string): Promise<boolean> {
  console.log(`[CacheService] Adding cell ID ${cellId} to sheet ${sheetId}`);
  
  // Use the simplified key structure
  const cacheKey = `app:sheet:${sheetId}`;
  const sheetData = await getFromCache<CachedSheetData>(cacheKey);
  
  if (!sheetData) {
    // If sheet data doesn't exist, create a minimal version
    console.log(`[CacheService] Sheet ${sheetId} not found in cache, creating minimal version`);
    const newSheetData: CachedSheetData = {
      id: sheetId,
      name: `Sheet ${sheetId}`,
      workbookId: null,
      cellIds: [cellId]
    };
    
    return await setInCache(cacheKey, newSheetData);
  }
  
  // Check if the cell ID already exists in the array
  if (!sheetData.cellIds) {
    sheetData.cellIds = [];
  }
  
  if (!sheetData.cellIds.includes(cellId)) {
    // Add the cell ID to the array
    sheetData.cellIds.push(cellId);
    console.log(`[CacheService] Added cell ID ${cellId} to sheet ${sheetId}, total cell IDs: ${sheetData.cellIds.length}`);
    
    // Update the cache
    return await setInCache(cacheKey, sheetData);
  }
  
  console.log(`[CacheService] Cell ID ${cellId} already exists in sheet ${sheetId}`);
  return true;
}

/**
 * Get cell data from cache
 */
export async function getCellFromCache(sheetId: number, cellId: string): Promise<CellData | null> {
  console.log(`[CacheService] Getting cell ${cellId} for sheet ${sheetId} from cache`);
  
  // Use the new simplified key structure
  const cacheKey = `app:sheet:${sheetId}:cell:${cellId}`;
  const cellData = await getFromCache<CellData>(cacheKey);
  
  if (cellData) {
    console.log(`[CacheService] Found cell ${cellId} for sheet ${sheetId} in cache`);
    
    // Ensure the cell style exists with all properties
    if (!cellData.style) {
      cellData.style = {
        bold: false,
        italic: false,
        underline: false,
        color: null,
        backgroundColor: null,
        fontSize: 12,
        fontFamily: 'Arial',
        alignment: 'left'
      };
    } else {
      // Ensure all style properties exist
      cellData.style = {
        bold: cellData.style.bold || false,
        italic: cellData.style.italic || false,
        underline: cellData.style.underline || false,
        color: cellData.style.color || null,
        backgroundColor: cellData.style.backgroundColor || null,
        fontSize: cellData.style.fontSize || 12,
        fontFamily: cellData.style.fontFamily || 'Arial',
        alignment: cellData.style.alignment || 'left'
      };
    }
    
    // Log the retrieved cell style
    console.log(`[CacheService] Cell ${cellId} style retrieved:`, JSON.stringify(cellData.style));
    
    return cellData;
  }
  
  console.log(`[CacheService] Cell ${cellId} for sheet ${sheetId} not found in cache`);
  return null;
}

/**
 * Get all cell IDs for a sheet
 */
export async function getSheetCellIds(sheetId: number): Promise<string[]> {
  console.log(`[CacheService] Getting cell IDs for sheet ${sheetId}`);
  
  // Try to get the sheet with the new key structure
  const sheetData = await getFromCache<CachedSheetData>(`app:sheet:${sheetId}`);
  
  if (!sheetData || !sheetData.cellIds) {
    console.log(`[CacheService] No cell IDs found for sheet ${sheetId}`);
    return [];
  }
  
  console.log(`[CacheService] Found ${sheetData.cellIds.length} cell IDs for sheet ${sheetId}`);
  return sheetData.cellIds;
}

/**
 * Delete cell data from cache
 */
export async function deleteCellFromCache(sheetId: number, cellId: string): Promise<boolean> {
  console.log(`[CacheService] Deleting cell ${cellId} from sheet ${sheetId}`);
  
  // First, remove the cell ID from the sheet's cellIds array
  const sheetCacheKey = `app:sheet:${sheetId}`;
  const sheetData = await getFromCache<CachedSheetData>(sheetCacheKey);
  
  if (sheetData && sheetData.cellIds) {
    // Filter out the cell ID
    sheetData.cellIds = sheetData.cellIds.filter((id: string) => id !== cellId);
    console.log(`[CacheService] Removed cell ID ${cellId} from sheet ${sheetId}, remaining cell IDs: ${sheetData.cellIds.length}`);
    
    // Update the sheet data in cache
    await setInCache(sheetCacheKey, sheetData);
  }
  
  // Delete the cell data using the simplified key
  const cellCacheKey = `app:sheet:${sheetId}:cell:${cellId}`;
  const success = await deleteFromCache(cellCacheKey);
  
  return success;
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