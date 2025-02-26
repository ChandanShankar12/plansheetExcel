import { Workbook } from '../models/workbook';
import { getApplication } from './application.controller';
import { 
  cacheWorkbook, 
  getWorkbookFromCache,
  cacheSheet,
  deleteSheetFromCache
} from '../services/cache.service';

/**
 * Get the workbook instance from the application
 */
export function getWorkbook(): Workbook {
  const app = getApplication();
  return app.workbook;
}

/**
 * Get all sheets from the workbook
 */
export function getSheets() {
  const workbook = getWorkbook();
  return workbook.getSheets();
}

/**
 * Get a specific sheet by ID
 */
export function getSheet(id: number) {
  const workbook = getWorkbook();
  return workbook.getSheet(id);
}

/**
 * Add a new sheet to the workbook
 */
export async function addSheet(name?: string) {
  const workbook = getWorkbook();
  const sheet = await workbook.addSheet(name);
  
  // Cache the updated workbook and the new sheet
  try {
    await cacheWorkbook(workbook.toJSON());
    await cacheSheet(sheet.getId(), sheet.toJSON());
  } catch (error) {
    console.warn('[WorkbookController] Failed to cache after adding sheet:', error);
  }
  
  return sheet;
}

/**
 * Remove a sheet from the workbook
 */
export async function removeSheet(id: number) {
  const workbook = getWorkbook();
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
export function getWorkbookName() {
  const workbook = getWorkbook();
  return workbook.getName();
}

/**
 * Set the workbook name
 */
export function setWorkbookName(name: string) {
  const workbook = getWorkbook();
  workbook.setName(name);
  
  // Cache the updated workbook
  cacheWorkbook(workbook.toJSON()).catch(error => {
    console.warn('[WorkbookController] Failed to cache after renaming workbook:', error);
  });
  
  return { success: true };
}

/**
 * Get workbook state as JSON
 */
export function getWorkbookState() {
  const workbook = getWorkbook();
  return workbook.toJSON();
}

/**
 * Restore workbook from JSON data
 */
export function restoreWorkbookState(data: any) {
  const workbook = getWorkbook();
  workbook.fromJSON(data);
  
  // Cache the restored workbook
  cacheWorkbook(workbook.toJSON()).catch(error => {
    console.warn('[WorkbookController] Failed to cache restored workbook:', error);
  });
  
  return { success: true };
}

/**
 * Try to load workbook from cache
 */
export async function loadWorkbookFromCache(): Promise<boolean> {
  try {
    const cachedWorkbook = await getWorkbookFromCache();
    if (cachedWorkbook) {
      const workbook = getWorkbook();
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