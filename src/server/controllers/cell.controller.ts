import { CellData } from '@/lib/types';
import { getSheet } from './workbook.controller';
import { 
  cacheCellData, 
  getCellFromCache,
  deleteCellFromCache,
  cacheSheet,
  getSheetFromCache,
  getApplicationState
} from '../services/cache.service';

/**
 * Get a cell by ID from a specific sheet, trying cache first
 */
export async function getCell(sheetId: number, cellId: string) {
  // Try to get from cache first
  try {
    // Check if the sheet exists in cache
    const cachedSheet = await getSheetFromCache(sheetId);
    if (!cachedSheet) {
      console.log(`[CellController] Sheet ${sheetId} not found in cache, will cache after retrieval`);
    } else {
      console.log(`[CellController] Sheet ${sheetId} found in cache`);
    }
    
    // Try to get cell from cache
    const cachedCell = await getCellFromCache(sheetId, cellId);
    if (cachedCell) {
      console.log(`[CellController] Cell ${cellId} in sheet ${sheetId} loaded from cache`);
      return cachedCell;
    } else {
      console.log(`[CellController] Cell ${cellId} not found in cache for sheet ${sheetId}`);
    }
  } catch (error) {
    console.warn(`[CellController] Failed to get cell ${cellId} from cache:`, error);
  }
  
  // Fall back to getting from sheet
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  const cell = sheet.getCell(cellId);
  if (!cell) {
    console.log(`[CellController] Cell ${cellId} not found in sheet ${sheetId}`);
    return null;
  }
  
  // Cache the cell data - create a deep copy to ensure it's not modified
  const cellToCache = JSON.parse(JSON.stringify(cell));
  try {
    const cacheSuccess = await cacheCellData(sheetId, cellId, cellToCache);
    if (cacheSuccess) {
      console.log(`[CellController] Successfully cached cell ${cellId} for sheet ${sheetId}`);
    } else {
      console.warn(`[CellController] Failed to cache cell ${cellId} for sheet ${sheetId}`);
    }
    
    // Also ensure the sheet is cached
    const sheetData = await getSheetFromCache(sheetId);
    if (!sheetData) {
      console.log(`[CellController] Caching sheet ${sheetId} after cell retrieval`);
      const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
      await cacheSheet(sheetId, sheetToCache);
    }
  } catch (error) {
    console.warn(`[CellController] Failed to cache cell ${cellId}:`, error);
  }
  
  return cell;
}

/**
 * Update a cell in a sheet
 */
export async function updateCell(sheetId: number, cellId: string, updates: Partial<CellData>) {
  // Get the sheet - now an async operation
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    console.error(`[CellController] Sheet with ID ${sheetId} not found for cell update`);
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  // Check if the sheet exists in cache first
  try {
    const cachedSheet = await getSheetFromCache(sheetId);
    if (!cachedSheet) {
      console.log(`[CellController] Sheet ${sheetId} not found in cache, caching it now`);
      const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
      await cacheSheet(sheetId, sheetToCache);
    }
  } catch (error) {
    console.warn(`[CellController] Error checking sheet in cache: ${error}`);
  }
  
  // Check if the cell exists in cache
  try {
    const cachedCell = await getCellFromCache(sheetId, cellId);
    if (!cachedCell) {
      console.log(`[CellController] Cell ${cellId} not found in cache for sheet ${sheetId}`);
      // We'll cache it after the update below
    }
  } catch (error) {
    console.warn(`[CellController] Error checking cell in cache: ${error}`);
  }
  
  // Update the cell in the sheet
  sheet.updateCell(cellId, updates);
  
  // Get the updated cell
  const updatedCell = sheet.getCell(cellId);
  if (!updatedCell) {
    console.error(`[CellController] Failed to get updated cell ${cellId}`);
    return null;
  }
  
  // Cache the updated cell - create a deep copy to ensure it's not modified
  const cellToCache = JSON.parse(JSON.stringify(updatedCell));
  try {
    const success = await cacheCellData(sheetId, cellId, cellToCache);
    if (success) {
      console.log(`[CellController] Successfully cached cell ${cellId} for sheet ${sheetId}`);
    } else {
      console.warn(`[CellController] Failed to cache cell ${cellId} for sheet ${sheetId}`);
    }
  } catch (error) {
    console.warn(`[CellController] Failed to cache cell ${cellId} after update:`, error);
  }
  
  // Also cache the updated sheet
  try {
    const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
    const success = await cacheSheet(sheetId, sheetToCache);
    if (success) {
      console.log(`[CellController] Successfully cached sheet ${sheetId} after cell update`);
    } else {
      console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell update`);
    }
  } catch (error) {
    console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell update:`, error);
  }
  
  return updatedCell;
}

/**
 * Delete a cell from a sheet
 */
export async function deleteCell(sheetId: number, cellId: string) {
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  // Check if the sheet exists in cache first
  try {
    const cachedSheet = await getSheetFromCache(sheetId);
    if (!cachedSheet) {
      console.log(`[CellController] Sheet ${sheetId} not found in cache for cell deletion, caching it now`);
      const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
      await cacheSheet(sheetId, sheetToCache);
    }
  } catch (error) {
    console.warn(`[CellController] Error checking sheet in cache for cell deletion: ${error}`);
  }
  
  // Check if the cell exists in cache before deleting
  try {
    const cachedCell = await getCellFromCache(sheetId, cellId);
    if (!cachedCell) {
      console.log(`[CellController] Cell ${cellId} not found in cache for deletion`);
    } else {
      console.log(`[CellController] Cell ${cellId} found in cache, will be deleted`);
    }
  } catch (error) {
    console.warn(`[CellController] Error checking cell in cache for deletion: ${error}`);
  }
  
  const success = sheet.deleteCell(cellId);
  
  if (success) {
    // Remove from cache
    try {
      const deleteSuccess = await deleteCellFromCache(sheetId, cellId);
      if (deleteSuccess) {
        console.log(`[CellController] Successfully deleted cell ${cellId} from cache`);
      } else {
        console.warn(`[CellController] Failed to delete cell ${cellId} from cache`);
      }
    } catch (error) {
      console.warn(`[CellController] Failed to delete cell ${cellId} from cache:`, error);
    }
    
    // Update sheet in cache
    try {
      const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
      const cacheSuccess = await cacheSheet(sheetId, sheetToCache);
      if (cacheSuccess) {
        console.log(`[CellController] Successfully cached sheet ${sheetId} after cell deletion`);
      } else {
        console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell deletion`);
      }
    } catch (error) {
      console.warn(`[CellController] Failed to cache sheet ${sheetId} after cell deletion:`, error);
    }
  }
  
  return { success };
}

/**
 * Get all cells from a sheet
 */
export async function getAllCells(sheetId: number) {
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  return sheet.getCellsData();
}

/**
 * Update multiple cells in a sheet
 */
export async function updateMultipleCells(sheetId: number, cellUpdates: Record<string, Partial<CellData>>) {
  const sheet = await getSheet(sheetId);
  if (!sheet) {
    throw new Error(`Sheet with ID ${sheetId} not found`);
  }
  
  // Get the workbook ID for proper caching
  const appState = await getApplicationState();
  const workbookId = sheet.getWorkbookId() || appState?.workbook?.id;
  
  if (workbookId) {
    console.log(`[CellController] Using workbook ID ${workbookId} for batch update of sheet ${sheetId}`);
  }
  
  // Check if the sheet exists in cache first
  try {
    const cachedSheet = await getSheetFromCache(sheetId);
    if (!cachedSheet) {
      console.log(`[CellController] Sheet ${sheetId} not found in cache for batch update, caching it now`);
      const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
      await cacheSheet(sheetId, sheetToCache);
    }
  } catch (error) {
    console.warn(`[CellController] Error checking sheet in cache for batch update: ${error}`);
  }
  
  const updatedCells: Record<string, CellData> = {};
  const cellCachePromises: Promise<boolean>[] = [];
  
  // Process each cell update
  for (const [cellId, updates] of Object.entries(cellUpdates)) {
    // Update the cell in the sheet
    sheet.updateCell(cellId, updates);
    
    // Get the updated cell
    const updatedCell = sheet.getCell(cellId);
    if (updatedCell) {
      updatedCells[cellId] = updatedCell;
      
      // Cache the updated cell - create a deep copy to ensure it's not modified
      const cellToCache = JSON.parse(JSON.stringify(updatedCell));
      cellCachePromises.push(cacheCellData(sheetId, cellId, cellToCache));
    }
  }
  
  // Wait for all cell cache operations to complete
  await Promise.all(cellCachePromises);
  
  // Also cache the updated sheet
  try {
    const sheetToCache = JSON.parse(JSON.stringify(sheet.toJSON()));
    const success = await cacheSheet(sheetId, sheetToCache);
    if (success) {
      console.log(`[CellController] Successfully cached sheet ${sheetId} after batch update`);
    } else {
      console.warn(`[CellController] Failed to cache sheet ${sheetId} after batch update`);
    }
  } catch (error) {
    console.warn(`[CellController] Failed to cache sheet ${sheetId} after batch update:`, error);
  }
  
  return updatedCells;
} 