import { Workbook } from '../models/workbook';
import { getApplication } from './application.controller';
import { 
  cacheWorkbook, 
  getWorkbookFromCache,
  cacheSheet,
  deleteSheetFromCache,
  getSheetFromCache
} from '../services/cache.service';

/**
 * Get the workbook instance from the application
 */
export async function getWorkbook(): Promise<Workbook> {
  const app = getApplication();
  return app.workbook;
}

/**
 * Get all sheets from the workbook
 */
export async function getSheets() {
  const workbook = await getWorkbook();
  return workbook.getSheets();
}

/**
 * Get a specific sheet by ID
 */
export async function getSheet(id: number) {
  const workbook = await getWorkbook();
  let sheet = workbook.getSheet(id);
  
  // If sheet not found in memory, try to get it from cache
  if (!sheet) {
    console.log(`[WorkbookController] Sheet ${id} not found in memory, checking cache`);
    try {
      const cachedSheet = await getSheetFromCache(id);
      
      if (cachedSheet) {
        console.log(`[WorkbookController] Sheet ${id} found in cache, restoring to workbook`);
        // Create a new Sheet instance from the cached data
        const { Sheet } = require('../models/sheet');
        sheet = Sheet.fromJSON(cachedSheet);
        
        // Add the sheet to the workbook
        // We need to use a method that's exposed by the workbook class
        // Since we can't directly access private properties
        const workbookData = workbook.toJSON();
        const sheets = [...workbookData.sheets, sheet.toJSON()];
        
        // Restore the workbook with the new sheet included
        workbook.fromJSON({
          ...workbookData,
          sheets,
          // Update nextSheetId if necessary
          nextSheetId: Math.max(workbookData.nextSheetId, id + 1)
        });
        
        console.log(`[WorkbookController] Sheet ${id} restored to workbook from cache`);
        
        // Get the sheet from the workbook again to ensure it's properly linked
        sheet = workbook.getSheet(id);
      }
    } catch (error) {
      console.warn(`[WorkbookController] Failed to get sheet ${id} from cache:`, error);
    }
  }
  
  return sheet;
}

/**
 * Add a new sheet to the workbook
 */
export async function addSheet(name?: string) {
  const workbook = await getWorkbook();
  const sheet = await workbook.addSheet(name);
  
  // Ensure the sheet has the correct workbook ID
  sheet.setWorkbookId(workbook.getId());
  
  // Cache the updated workbook and the new sheet
  try {
    // First cache the workbook to ensure it contains the new sheet
    await cacheWorkbook(workbook.toJSON());
    // Then cache the individual sheet
    await cacheSheet(sheet.getId(), sheet.toJSON());
    
    console.log('[WorkbookController] Cached workbook and sheet after adding sheet:', {
      workbookId: workbook.getId(),
      sheetId: sheet.getId(),
      sheetName: sheet.getName()
    });
  } catch (error) {
    console.warn('[WorkbookController] Failed to cache after adding sheet:', error);
  }
  
  return sheet;
}

/**
 * Remove a sheet from the workbook
 */
export async function removeSheet(id: number) {
  const workbook = await getWorkbook();
  await workbook.removeSheet(id);
  
  // Update cache
  try {
    await cacheWorkbook(workbook.toJSON());
    await deleteSheetFromCache(id);
  } catch (error) {
    console.warn('[WorkbookController] Failed to update cache after removing sheet:', error);
  }
  
  return { success: true };
}

/**
 * Get the workbook name
 */
export async function getWorkbookName() {
  const workbook = await getWorkbook();
  return workbook.getName();
}

/**
 * Set the workbook name
 */
export async function setWorkbookName(name: string) {
  const workbook = await getWorkbook();
  workbook.setName(name);
  
  // Cache the updated workbook
  try {
    await cacheWorkbook(workbook.toJSON());
  } catch (error) {
    console.warn('[WorkbookController] Failed to cache after renaming workbook:', error);
  }
  
  return { success: true };
}

/**
 * Get workbook state as JSON
 */
export async function getWorkbookState() {
  const workbook = await getWorkbook();
  return workbook.toJSON();
}

/**
 * Restore workbook from JSON data
 */
export async function restoreWorkbookState(data: any) {
  const workbook = await getWorkbook();
  workbook.fromJSON(data);
  
  // Cache the restored workbook
  try {
    await cacheWorkbook(workbook.toJSON());
  } catch (error) {
    console.warn('[WorkbookController] Failed to cache restored workbook:', error);
  }
  
  return { success: true };
}

/**
 * Try to load workbook from cache
 */
export async function loadWorkbookFromCache(): Promise<boolean> {
  try {
    const cachedWorkbook = await getWorkbookFromCache();
    if (cachedWorkbook) {
      const workbook = await getWorkbook();
      workbook.fromJSON(cachedWorkbook);
      console.log('[WorkbookController] Workbook loaded from cache');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[WorkbookController] Failed to load workbook from cache:', error);
    return false;
  }
} 